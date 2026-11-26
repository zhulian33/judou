#!/bin/zsh
set -e

cd "$(dirname "$0")"

swift build -c release

APP="句读JUDOU.app"
ROOT="$(cd .. && pwd)"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp .build/release/JudouWidget "$APP/Contents/MacOS/JudouWidget"
cp AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
sed "s|__PROJECT_ROOT__|$ROOT|g" Info.plist > "$APP/Contents/Info.plist"

codesign --force --deep --sign - "$APP" >/dev/null 2>&1 || true

echo "Built: $(pwd)/$APP"
