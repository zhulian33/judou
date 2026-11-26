#!/bin/zsh
set -e

cd "$(dirname "$0")"

swift build -c release

APP="句读JUDOU.app"
ROOT="$(cd .. && pwd)"

# macOS 会把「文稿」目录挡在隐私权限后面，后台子进程读不了。
# 所以把运行时同步到 Application Support，桌面端只跑这份副本。
RUNTIME="$HOME/Library/Application Support/Judou/runtime"
mkdir -p "$RUNTIME"
rsync -a --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude 'desktop-widget/.build' \
  --exclude '*.app' \
  "$ROOT/" "$RUNTIME"/

if [ ! -d "$RUNTIME/node_modules" ]; then
  cp -cR "$ROOT/node_modules" "$RUNTIME/node_modules" 2>/dev/null || cp -R "$ROOT/node_modules" "$RUNTIME/node_modules"
fi

if [ -d "$ROOT/.next" ]; then
  rm -rf "$RUNTIME/.next"
  cp -cR "$ROOT/.next" "$RUNTIME/.next" 2>/dev/null || cp -R "$ROOT/.next" "$RUNTIME/.next"
fi

mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp .build/release/JudouWidget "$APP/Contents/MacOS/JudouWidget"
cp AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
sed "s|__PROJECT_ROOT__|$RUNTIME|g" Info.plist > "$APP/Contents/Info.plist"

codesign --force --deep --sign - "$APP" >/dev/null 2>&1 || true

echo "Built: $(pwd)/$APP"
echo "Runtime: $RUNTIME"
