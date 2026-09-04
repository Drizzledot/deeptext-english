#!/bin/bash

cd "$(dirname "$0")/backend"

echo
echo "======================================"
echo " DeepText 高中英语深度文本解析"
echo "======================================"
echo

if [ ! -f ".env" ]; then
    echo "首次运行：正在创建 .env"
    cp .env.example .env

    echo
    echo "请先编辑："
    echo "backend/.env"
    echo
    echo "填写："
    echo "LLM_API_KEY"
    echo "LLM_BASE_URL"
    echo "LLM_MODEL"
    echo
    exit 1
fi

echo "正在启动 DeepText..."
echo
echo "访问端口：8000"
echo

uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000
