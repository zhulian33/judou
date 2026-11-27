#!/bin/zsh
set -e
cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  echo "第一次运行，先装依赖…"
  npm install
fi

if [ ! -f ".next/BUILD_ID" ]; then
  echo "先构建一次（之后截图更快）…"
  npm run build
fi

node scripts/capture-screenshots.mjs

echo ""
echo "截图完成，文件在 preview/ 目录。"
open preview
