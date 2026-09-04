#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

PORT="8000"
LOG_FILE="/tmp/deeptext.log"
PID_FILE="/tmp/deeptext.pid"


echo
echo "======================================"
echo " DeepText 高中英语深度文本解析"
echo "======================================"
echo


# ==============================
# 检查 backend
# ==============================

if [ ! -d "$BACKEND_DIR" ]; then
    echo "[错误] 找不到 backend 目录："
    echo "$BACKEND_DIR"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1


# ==============================
# 检查 Python
# ==============================

if ! command -v python >/dev/null 2>&1; then
    echo "[错误] 未检测到 Python。"
    exit 1
fi

echo "[1/3] Python 环境正常："
python --version
echo


# ==============================
# 自动安装依赖
# ==============================

echo "[2/3] 正在检查 DeepText 依赖……"

if ! python -c "import fastapi, uvicorn, openai, dotenv" >/dev/null 2>&1; then

    echo "检测到依赖未安装，正在自动安装……"
    echo

    python -m pip install --upgrade pip

    if ! python -m pip install -r requirements.txt; then
        echo
        echo "[错误] Python 依赖安装失败。"
        exit 1
    fi

    echo
    echo "依赖安装完成。"

else

    echo "依赖已经安装，无需重复安装。"

fi

echo


# ==============================
# 检查是否已经运行
# ==============================

if [ -f "$PID_FILE" ]; then

    OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"

    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then

        echo "[3/3] DeepText 已经在运行。"
        echo
        echo "端口：$PORT"
        echo "日志：$LOG_FILE"
        echo

        exit 0

    fi

    rm -f "$PID_FILE"
fi


# ==============================
# 启动 DeepText
# ==============================

echo "[3/3] 正在启动 DeepText……"
echo


nohup python -m uvicorn \
    main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    > "$LOG_FILE" \
    2>&1 &


PID=$!

echo "$PID" > "$PID_FILE"

sleep 2


# ==============================
# 检查启动状态
# ==============================

if kill -0 "$PID" 2>/dev/null; then

    echo "======================================"
    echo " DeepText 启动成功"
    echo "======================================"
    echo
    echo "端口：$PORT"
    echo
    echo "GitHub Codespaces 应自动打开网页。"
    echo
    echo "首次使用时会进入模型配置向导。"
    echo
    echo "日志位置："
    echo "$LOG_FILE"
    echo

else

    echo
    echo "[错误] DeepText 启动失败。"
    echo
    echo "后端日志："
    echo "--------------------------------------"

    cat "$LOG_FILE"

    echo
    echo "--------------------------------------"

    rm -f "$PID_FILE"

    exit 1
fi