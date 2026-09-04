import os
from pathlib import Path

from dotenv import load_dotenv


# backend/app/core/config.py
#
# parents[0] = core
# parents[1] = app
# parents[2] = backend

BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parents[2]
)

ENV_FILE = (
    BACKEND_DIR /
    ".env"
)


class Settings:

    def __init__(self):

        self.reload()


    def reload(self):

        """
        重新读取 backend/.env。

        网页配置向导保存 .env 后，
        无需重启 FastAPI 即可使用新的配置。
        """

        if ENV_FILE.exists():

            load_dotenv(
                dotenv_path=
                    ENV_FILE,

                override=True
            )


        self.LLM_API_KEY = (
            os.getenv(
                "LLM_API_KEY"
            )
            or ""
        ).strip()


        self.LLM_BASE_URL = (
            os.getenv(
                "LLM_BASE_URL"
            )
            or ""
        ).strip()


        self.LLM_MODEL = (
            os.getenv(
                "LLM_MODEL"
            )
            or ""
        ).strip()


        return self


    def is_configured(
        self
    ) -> bool:

        return bool(
            self.LLM_API_KEY
            and
            self.LLM_BASE_URL
            and
            self.LLM_MODEL
        )


settings = Settings()