// swift-tools-version: 5.9
import PackageDescription

let package = Package(
  name: "JudouWidget",
  platforms: [
    .macOS(.v13)
  ],
  products: [
    .executable(name: "JudouWidget", targets: ["JudouWidget"])
  ],
  targets: [
    .executableTarget(
      name: "JudouWidget",
      path: "Sources/JudouWidget"
    )
  ]
)
