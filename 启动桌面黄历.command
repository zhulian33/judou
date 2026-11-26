#!/bin/zsh
set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "第一次运行，正在安装依赖…"
  npm install
fi

if [ ! -f ".next/BUILD_ID" ]; then
  echo "正在构建，之后打开会更快…"
  npm run build
fi

if [ ! -d "desktop-widget/句读桌面黄历.app" ]; then
  zsh desktop-widget/build-app.sh
fi

open "desktop-widget/句读桌面黄历.app"
