import AppKit
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate, NSWindowDelegate {
  private var window: NSWindow?
  private var webView: WKWebView?
  private var statusItem: NSStatusItem?
  private var serverProcess: Process?
  private var widgetPort = 3211
  private var isConnecting = false
  private var ownsServer = false
  /// 用户自己拖过窗口大小之后，就不再自动跟着内容改高度。
  private var userResized = false
  /// 程序自己调整高度时，不要被当成用户拖动。
  private var isAutoResizing = false
  /// 记录自己拉起的服务进程，退出或异常结束后下次启动能清理掉。
  private let pidFile = "/tmp/judou-widget-server.pid"
  /// 自己拉起的服务意外退出时，最多自动重启一次。
  private var restartCount = 0

  func applicationDidFinishLaunching(_ notification: Notification) {
    // 只允许一个句读实例，避免重复启动本地服务互相抢端口。
    if let bundleID = Bundle.main.bundleIdentifier {
      let others = NSRunningApplication
        .runningApplications(withBundleIdentifier: bundleID)
        .filter { $0.processIdentifier != ProcessInfo.processInfo.processIdentifier }
      if let existing = others.first {
        existing.activate(options: [.activateAllWindows, .activateIgnoringOtherApps])
        NSApp.terminate(nil)
        return
      }
    }

    killPreviousServer()

    NSApp.setActivationPolicy(.accessory)
    setupStatusItem()
    setupWindow()
    ensureServerAndLoad()
  }

  private func setupWindow() {
    let configuration = WKWebViewConfiguration()
    let controller = WKUserContentController()
    controller.add(self, name: "judouResize")
    controller.add(self, name: "judouReload")
    configuration.userContentController = controller

    let web = WKWebView(frame: .zero, configuration: configuration)
    web.setValue(false, forKey: "drawsBackground")
    web.navigationDelegate = self
    webView = web

    let initialSize = NSSize(width: 380, height: 760)
    let screenFrame = NSScreen.main?.visibleFrame ?? .init(x: 0, y: 0, width: 1440, height: 900)
    let origin = NSPoint(
      x: screenFrame.maxX - initialSize.width - 24,
      y: screenFrame.maxY - initialSize.height - 24
    )

    let panel = NSWindow(
      contentRect: NSRect(origin: origin, size: initialSize),
      styleMask: [.titled, .closable, .miniaturizable, .resizable],
      backing: .buffered,
      defer: false
    )
    panel.title = "句读JUDOU"
    panel.titleVisibility = .hidden
    panel.titlebarAppearsTransparent = true
    panel.isMovableByWindowBackground = true
    panel.level = .statusBar
    panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
    panel.minSize = NSSize(width: 320, height: 360)
    panel.maxSize = NSSize(width: 1100, height: 900)
    panel.isReleasedWhenClosed = false
    panel.isOpaque = true
    panel.backgroundColor = NSColor(
      calibratedRed: 0.97,
      green: 0.97,
      blue: 0.95,
      alpha: 1
    )
    panel.contentView = web
    panel.hidesOnDeactivate = false
    panel.setFrameAutosaveName("JudouWidgetFrame")
    panel.delegate = self
    panel.makeKeyAndOrderFront(nil)
    panel.orderFrontRegardless()
    NSRunningApplication.current.activate(options: [.activateAllWindows, .activateIgnoringOtherApps])
    window = panel
  }

  private func setupStatusItem() {
    let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    item.button?.title = "句读"

    let menu = NSMenu()
    menu.addItem(NSMenuItem(title: "显示 / 隐藏", action: #selector(toggleWindow), keyEquivalent: ""))
    menu.addItem(NSMenuItem(title: "刷新黄历", action: #selector(reloadWidget), keyEquivalent: "r"))
    menu.addItem(.separator())
    menu.addItem(NSMenuItem(title: "退出句读JUDOU", action: #selector(quitApp), keyEquivalent: "q"))
    item.menu = menu
    statusItem = item
  }

  private var projectRoot: URL {
    if let configured = Bundle.main.object(forInfoDictionaryKey: "JudouProjectRoot") as? String,
       !configured.isEmpty,
       configured != "__PROJECT_ROOT__" {
      return URL(fileURLWithPath: configured)
    }

    return Bundle.main.bundleURL
      .deletingLastPathComponent()
      .deletingLastPathComponent()
  }

  private func ensureServerAndLoad() {
    guard !isConnecting else { return }
    isConnecting = true
    probeExistingServer(candidates: [3211, 4321], index: 0)
  }

  /// 依次检查已有端口；只有页面真的能打开才算可用，避免连上坏掉的服务。
  private func probeExistingServer(candidates: [Int], index: Int) {
    guard index < candidates.count else {
      startOwnServer()
      return
    }

    let port = candidates[index]
    checkServer(port: port) { [weak self] available in
      guard let self else { return }
      if available {
        self.widgetPort = port
        self.ownsServer = false
        self.isConnecting = false
        self.loadWidget()
      } else {
        self.probeExistingServer(candidates: candidates, index: index + 1)
      }
    }
  }

  private func checkServer(port: Int, completion: @escaping (Bool) -> Void) {
    checkAlmanac(port: port) { apiOK in
      guard apiOK else {
        completion(false)
        return
      }
      self.checkPath(port: port, path: "/widget") { pageOK in
        completion(pageOK)
      }
    }
  }

  /// 接口能通还不够：如果对面跑的是旧构建，界面会是旧的，所以要比一下构建号。
  private func checkAlmanac(port: Int, completion: @escaping (Bool) -> Void) {
    guard let url = URL(string: "http://127.0.0.1:\(port)/api/almanac") else {
      completion(false)
      return
    }

    var request = URLRequest(url: url)
    request.timeoutInterval = 2.5
    URLSession.shared.dataTask(with: request) { _, response, _ in
      guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
        DispatchQueue.main.async { completion(false) }
        return
      }

      let served = http.value(forHTTPHeaderField: "X-Judou-Build") ?? ""
      let local = self.localBuildId()
      let matches = local.isEmpty || served.isEmpty || served == local
      DispatchQueue.main.async { completion(matches) }
    }.resume()
  }

  private func localBuildId() -> String {
    let path = projectRoot.appendingPathComponent(".next/BUILD_ID").path
    guard let raw = try? String(contentsOfFile: path, encoding: .utf8) else {
      return ""
    }
    return raw.trimmingCharacters(in: .whitespacesAndNewlines)
  }

  private func checkPath(port: Int, path: String, completion: @escaping (Bool) -> Void) {
    guard let url = URL(string: "http://127.0.0.1:\(port)\(path)") else {
      completion(false)
      return
    }

    var request = URLRequest(url: url)
    request.timeoutInterval = 2.5
    URLSession.shared.dataTask(with: request) { _, response, _ in
      let ok = (response as? HTTPURLResponse)?.statusCode == 200
      DispatchQueue.main.async {
        completion(ok)
      }
    }.resume()
  }

  private func startOwnServer() {
    guard let port = firstFreePort(from: 4321) else {
      isConnecting = false
      loadError()
      return
    }

    widgetPort = port
    ownsServer = true
    startServer(port: port)
    waitForServer(port: port, attempts: 60)
  }

  /// 找一个真正可以监听的端口，避免撞上别的程序。
  private func firstFreePort(from start: Int) -> Int? {
    for port in start...(start + 20) {
      let socketFD = socket(AF_INET, SOCK_STREAM, 0)
      if socketFD < 0 { continue }
      defer { close(socketFD) }

      var address = sockaddr_in()
      address.sin_family = sa_family_t(AF_INET)
      address.sin_port = in_port_t(UInt16(port).bigEndian)
      address.sin_addr.s_addr = inet_addr("127.0.0.1")
      address.sin_len = UInt8(MemoryLayout<sockaddr_in>.size)

      let result = withUnsafePointer(to: &address) { pointer in
        pointer.withMemoryRebound(to: sockaddr.self, capacity: 1) {
          Darwin.bind(socketFD, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
        }
      }
      if result == 0 {
        return port
      }
    }
    return nil
  }

  private func startServer(port: Int) {
    let root = projectRoot.path
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/bin/zsh")
    process.arguments = [
      "-lc",
      "cd \(shellQuote(root)) && export PATH=\"$PATH:/opt/homebrew/bin:/usr/local/bin\" && if [ -f .next/BUILD_ID ]; then exec node node_modules/next/dist/bin/next start -p \(port); else exec node node_modules/next/dist/bin/next dev -p \(port); fi > /tmp/judou-widget-\(port).log 2>&1"
    ]
    process.terminationHandler = { [weak self] finished in
      DispatchQueue.main.async {
        guard let self, self.ownsServer, self.restartCount < 1 else { return }
        self.restartCount += 1
        self.isConnecting = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
          self.startOwnServer()
        }
      }
    }
    try? process.run()
    serverProcess = process
    try? "\(process.processIdentifier)".write(
      toFile: pidFile,
      atomically: true,
      encoding: .utf8
    )
  }

  /// 上次没正常退出时留下的服务进程，直接收掉，避免端口一个个被占满。
  private func killPreviousServer() {
    guard
      let raw = try? String(contentsOfFile: pidFile, encoding: .utf8),
      let pid = Int32(raw.trimmingCharacters(in: .whitespacesAndNewlines)),
      pid > 0
    else { return }

    kill(pid, SIGTERM)
    try? FileManager.default.removeItem(atPath: pidFile)
  }

  private func waitForServer(port: Int, attempts: Int) {
    guard attempts > 0 else {
      loadError()
      return
    }

    checkServer(port: port) { [weak self] available in
      guard let self else { return }
      if available {
        self.isConnecting = false
        self.loadWidget()
      } else {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
          self.waitForServer(port: port, attempts: attempts - 1)
        }
      }
    }
  }

  private func loadWidget() {
    guard
      let webView,
      let url = URL(string: "http://127.0.0.1:\(widgetPort)/widget")
    else {
      return
    }

    print("[句读] loading \(url.absoluteString)")
    webView.load(URLRequest(url: url))
  }

  private func loadError() {
    guard let webView else { return }
    let html = """
    <html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:-apple-system;padding:26px;color:#1b211c;background:#f7f7f5">
    <h2 style="margin:0 0 10px">句读没有启动</h2>
    <p style="font-size:13px;line-height:1.7;color:#69736b">
    本地服务没连上。点下面重试；如果一直打不开，确认电脑装了 Node.js。</p>
    <button onclick="window.webkit.messageHandlers.judouReload.postMessage(1)"
      style="margin-top:18px;border:0;border-radius:12px;background:#1b211c;color:#fff;padding:11px 20px;font-size:13px;font-weight:600">
    重新连接</button>
    </body></html>
    """
    webView.loadHTMLString(html, baseURL: nil)
  }

  private func shellQuote(_ value: String) -> String {
    "'" + value.replacingOccurrences(of: "'", with: "'\\''") + "'"
  }

  func userContentController(
    _ userContentController: WKUserContentController,
    didReceive message: WKScriptMessage
  ) {
    guard
      message.name == "judouResize",
      let number = message.body as? NSNumber,
      let window
    else {
      if message.name == "judouReload" {
        isConnecting = false
        ensureServerAndLoad()
      }
      return
    }

    guard !userResized else { return }

    let current = window.frame
    let height = min(900, max(360, CGFloat(truncating: number)))
    guard abs(window.contentLayoutRect.height - height) > 12 else { return }

    let contentSize = NSSize(width: current.width, height: height)
    var newFrame = window.frameRect(
      forContentRect: NSRect(origin: .zero, size: contentSize)
    )
    newFrame.origin.x = current.minX
    newFrame.origin.y = current.maxY - newFrame.height
    isAutoResizing = true
    window.setFrame(newFrame, display: true, animate: true)
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
      self?.isAutoResizing = false
    }
  }

  func windowWillStartLiveResize(_ notification: Notification) {
    guard !isAutoResizing else { return }
    userResized = true
  }

  func windowDidEndLiveResize(_ notification: Notification) {
    guard !isAutoResizing else { return }
    userResized = true
  }

  @objc private func toggleWindow() {
    guard let window else { return }
    if window.isVisible {
      window.orderOut(nil)
    } else {
      window.makeKeyAndOrderFront(nil)
      NSApp.activate(ignoringOtherApps: true)
    }
  }

  @objc private func reloadWidget() {
    webView?.reload()
  }

  private func stopOwnServer() {
    if ownsServer, let pid = serverProcess?.processIdentifier {
      kill(pid, SIGTERM)
    }
    try? FileManager.default.removeItem(atPath: pidFile)
  }

  func applicationWillTerminate(_ notification: Notification) {
    stopOwnServer()
  }

  @objc private func quitApp() {
    stopOwnServer()
    NSApp.terminate(nil)
  }

  func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    false
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
    print("[句读] widget loaded")
  }

  func webView(
    _ webView: WKWebView,
    didFail navigation: WKNavigation!,
    withError error: Error
  ) {
    print("[句读] widget failed: \(error)")
    loadError()
  }

  func webView(
    _ webView: WKWebView,
    didFailProvisionalNavigation navigation: WKNavigation!,
    withError error: Error
  ) {
    print("[句读] widget provisional load failed: \(error)")
    loadError()
  }
}

let application = NSApplication.shared
let delegate = AppDelegate()
application.delegate = delegate
application.setActivationPolicy(.accessory)
application.run()
