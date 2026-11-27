#!/bin/sh
# 打包成「自带 node_modules 的独立目录」，用来上阿里云函数计算 / 容器 / 任意 Node 机器。
# 用法：sh scripts/pack-standalone.sh
set -e

cd "$(dirname "$0")/.."

echo "==> next build"
npm run build

OUT="dist-standalone"
rm -rf "$OUT" judou-standalone.zip
mkdir -p "$OUT"

echo "==> 复制 standalone 产物"
cp -R .next/standalone/. "$OUT"/
mkdir -p "$OUT/.next"
cp -R .next/static "$OUT/.next/static"
cp -R public "$OUT/public"

# 函数计算自定义运行时会执行 bootstrap，并要求把端口暴露在 FC_SERVER_PORT（默认 9000）
cat > "$OUT/bootstrap" <<'BOOT'
#!/bin/sh
export PORT="${FC_SERVER_PORT:-9000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
exec node server.js
BOOT
chmod +x "$OUT/bootstrap"

echo "==> 压缩"
(cd "$OUT" && zip -qr ../judou-standalone.zip .)

echo "==> 完成"
du -sh "$OUT" judou-standalone.zip
echo "独立目录：$PWD/$OUT（本地可 PORT=9000 node $OUT/server.js 试跑）"
