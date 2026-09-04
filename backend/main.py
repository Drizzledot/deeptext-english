from pathlib import Path

from dotenv import set_key

from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.responses import (
    FileResponse
)

from fastapi.staticfiles import (
    StaticFiles
)

from openai import OpenAI

from pydantic import BaseModel


from app.api.analysis import (
    router
)

from app.core.config import (
    ENV_FILE,
    settings
)


BASE_DIR = (
    Path(__file__)
    .resolve()
    .parent
)

STATIC_DIR = (
    BASE_DIR /
    "static"
)


app = FastAPI(
    title="DeepText",
    version="0.1.0"
)


app.include_router(
    router,
    prefix="/api"
)


app.mount(
    "/static",

    StaticFiles(
        directory=
            str(
                STATIC_DIR
            )
    ),

    name="static"
)


class SetupRequest(
    BaseModel
):

    api_key: str
    base_url: str
    model: str


def clean_setup_request(
    request:
        SetupRequest
):

    api_key = (
        request
        .api_key
        .strip()
    )

    base_url = (
        request
        .base_url
        .strip()
    )

    model = (
        request
        .model
        .strip()
    )


    if not api_key:

        raise HTTPException(
            status_code=400,
            detail=
                "API Key 不能为空"
        )


    if not base_url:

        raise HTTPException(
            status_code=400,
            detail=
                "API 地址不能为空"
        )


    if not model:

        raise HTTPException(
            status_code=400,
            detail=
                "模型名称不能为空"
        )


    return (
        api_key,
        base_url,
        model
    )


# =====================================================
# 首页
# =====================================================

@app.get("/")
def home():

    settings.reload()


    if not settings.is_configured():

        return FileResponse(
            STATIC_DIR /
            "setup.html"
        )


    return FileResponse(
        STATIC_DIR /
        "index.html"
    )


# =====================================================
# 配置页面
# =====================================================

@app.get("/setup")
def setup_page():

    return FileResponse(
        STATIC_DIR /
        "setup.html"
    )


# =====================================================
# 配置状态
# =====================================================

@app.get(
    "/api/setup/status"
)
def setup_status():

    settings.reload()


    return {

        "configured":
            settings
            .is_configured(),

        "base_url":
            (
                settings
                .LLM_BASE_URL
                or ""
            ),

        "model":
            (
                settings
                .LLM_MODEL
                or ""
            )
    }


# =====================================================
# 测试模型
# =====================================================

@app.post(
    "/api/setup/test"
)
def test_setup(
    request:
        SetupRequest
):

    (
        api_key,
        base_url,
        model
    ) = clean_setup_request(
        request
    )


    try:

        client = OpenAI(
            api_key=
                api_key,

            base_url=
                base_url
        )


        response = (
            client
            .chat
            .completions
            .create(
                model=model,

                messages=[
                    {
                        "role":
                            "system",

                        "content":
                            "You are a connection test."
                    },
                    {
                        "role":
                            "user",

                        "content":
                            "Reply with OK."
                    }
                ]
            )
        )


        if not response.choices:

            raise ValueError(
                "模型没有返回 choices"
            )


        return {
            "ok": True,
            "message":
                "连接成功"
        }


    except Exception as exc:

        raise HTTPException(
            status_code=400,

            detail=(
                "模型连接失败："
                f"{str(exc)}"
            )
        )


# =====================================================
# 保存配置
# =====================================================

@app.post(
    "/api/setup/save"
)
def save_setup(
    request:
        SetupRequest
):

    (
        api_key,
        base_url,
        model
    ) = clean_setup_request(
        request
    )


    try:

        ENV_FILE.touch(
            exist_ok=True
        )


        set_key(
            str(
                ENV_FILE
            ),

            "LLM_API_KEY",

            api_key,

            quote_mode=
                "always"
        )


        set_key(
            str(
                ENV_FILE
            ),

            "LLM_BASE_URL",

            base_url,

            quote_mode=
                "always"
        )


        set_key(
            str(
                ENV_FILE
            ),

            "LLM_MODEL",

            model,

            quote_mode=
                "always"
        )


        settings.reload()


        return {
            "ok": True,

            "message":
                "配置已保存"
        }


    except Exception as exc:

        raise HTTPException(
            status_code=500,

            detail=(
                "保存配置失败："
                f"{str(exc)}"
            )
        )