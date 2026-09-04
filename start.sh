#!/usr/bin/env bash

set -u

ROOT_DIR="$(
    cd "$(dirname "$0")"
    pwd
)"

BACKEND_DIR="$ROOT_DIR/backend"

PORT="8000"
LOG_FILE="/tmp/deeptext.log"
PID_FILE="/tmp/deeptext.pid"

echo
echo "======================================"
echo " DeepText 高中英语深度文本解析"
echo "======================================"
echo

cd "$BACKEND_DIR" || exit 1


# 如果已有 DeepText 进程正在运行，则不重复启动。
if [ -f "$PID_FILE" ]; then

    OLD_PID="$(
        cat "$PID_FILE" 2>/dev/null || true
    )"

    if (
        [ -n "${OLD_PID:-}" ]
        && kill -0 "$OLD_PID" 2>/dev/null
    ); then

        echo "DeepText 已经在运行。"
        echo "端口：$PORT"
        echo "日志：$LOG_FILE"
        echo

        exit 0
    fi
fi


# 如果 Codespaces 的依赖安装步骤没有成功完成，则在这里兜底安装。
if ! python -c "import fastapi, uvicorn, openai, dotenv" >/dev/null 2>&1; then

    echo "检测到依赖尚未安装，正在安装……"

    python -m pip install \
        -r requirements.txt
fi


echo "正在启动 DeepText……"


nohup python -m uvicorn \
    main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    > "$LOG_FILE" \
    2>&1 &


PID=$!

echo "$PID" > "$PID_FILE"

sleep 1


if kill -0 "$PID" 2>/dev/null; then

    echo
    echo "DeepText 已启动。"
    echo "Codespaces 会自动转发并打开 8000 端口。"
    echo
    echo "首次使用将自动进入模型配置向导。"
    echo "日志：$LOG_FILE"
    echo

    exit 0

else

    echo
    echo "DeepText 启动失败。"
    echo "请查看日志：$LOG_FILE"
    echo

    cat "$LOG_FILE"

    exit 1
fi
