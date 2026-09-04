import json

from openai import OpenAI

from app.core.config import settings
from app.prompts.pass1 import PASS1_PROMPT
from app.prompts.pass2 import PASS2_PROMPT
from app.prompts.pass3 import PASS3_PROMPT


# =====================================================
# OpenAI Client
# =====================================================

def get_client():
    """
    每次调用模型前重新读取配置。

    这样 FastAPI 可以先启动；
    用户通过网页配置向导保存 .env 后，
    无需重启服务即可使用新配置。
    """

    settings.reload()

    if not settings.is_configured():
        raise ValueError(
            "模型尚未配置。请先打开 /setup 完成配置。"
        )

    return OpenAI(
        api_key=settings.LLM_API_KEY,
        base_url=settings.LLM_BASE_URL,
    )


# =====================================================
# 模型调用
# =====================================================

def call_model(messages):
    client = get_client()

    return client.chat.completions.create(
        model=settings.LLM_MODEL,
        messages=messages,
    )


# =====================================================
# 获取模型输出
# =====================================================

def get_model_content(response):
    if not response.choices:
        raise ValueError("模型没有返回 choices")

    message = response.choices[0].message
    message_data = message.model_dump()

    content = message_data.get("content")

    # 部分 OpenAI-compatible / New API 服务
    # 会把最终内容放在 reasoning_content 中。
    if not content or not content.strip():
        content = message_data.get("reasoning_content")

    if not content or not content.strip():
        raise ValueError(
            "模型返回了空内容，"
            f"finish_reason={response.choices[0].finish_reason}"
        )

    content = content.strip()

    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    return content.strip()


# =====================================================
# JSON 修复
# =====================================================

def repair_json(content: str, attempt: int):
    if attempt == 1:
        repair_prompt = """
你是严格的 JSON 修复器。

下面内容原本应为合法 JSON，但存在语法错误。

只允许修复：
- 缺失逗号
- 缺失引号
- 多余引号
- 未正确转义字符
- 括号不匹配
- 数组或对象结构错误

要求：
1. 不修改原分析内容。
2. 不改变原意。
3. 不增加新分析。
4. 不删除已有信息。
5. 不修改字段名称。
6. 只返回合法 JSON。
7. 不使用 Markdown。
8. 不输出解释。
"""
    else:
        repair_prompt = """
再次严格修复下面的 JSON。

上一次修复仍不是合法 JSON。

只修复 JSON 语法问题。
不要修改字段名称。
不要改写内容。
不要新增分析。
不要删除信息。
不要解释。

只返回合法 JSON。
"""

    response = call_model(
        [
            {
                "role": "system",
                "content": repair_prompt,
            },
            {
                "role": "user",
                "content": content,
            },
        ]
    )

    return get_model_content(response)


# =====================================================
# AI JSON 调用
# =====================================================

def ask_ai(system_prompt: str, user_content: str):
    response = call_model(
        [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_content,
            },
        ]
    )

    content = get_model_content(response)

    try:
        return json.loads(content)

    except json.JSONDecodeError as exc:
        print(
            f"第一次 JSON 解析失败，准备自动修复：{exc}",
            flush=True,
        )

    repaired_content = repair_json(
        content,
        attempt=1,
    )

    try:
        return json.loads(repaired_content)

    except json.JSONDecodeError as exc:
        print(
            f"第一次 JSON 修复失败，准备第二次修复：{exc}",
            flush=True,
        )

    second_repaired_content = repair_json(
        repaired_content,
        attempt=2,
    )

    try:
        return json.loads(second_repaired_content)

    except json.JSONDecodeError as exc:
        print(
            "\n===== JSON REPAIR FAILED =====",
            flush=True,
        )
        print(
            repr(second_repaired_content[:3000]),
            flush=True,
        )
        print(
            "===== END =====\n",
            flush=True,
        )

        raise ValueError(
            f"JSON 自动修复两次后仍然失败：{exc}"
        )


# =====================================================
# 三阶段 Pipeline
# =====================================================

def run_analysis_pipeline(
    text: str,
    progress_callback=None,
):
    def progress(
        stage: str,
        percent: int,
        message: str,
    ):
        if progress_callback:
            progress_callback(
                stage,
                percent,
                message,
            )

    # =====================
    # Pass 1
    # =====================

    progress(
        "pass1",
        15,
        "正在进行文本探索分析...",
    )

    pass1 = ask_ai(
        PASS1_PROMPT,
        f"""
ORIGINAL TEXT:

{text}
""",
    )

    progress(
        "pass1_completed",
        35,
        "Pass 1 分析完成",
    )

    # =====================
    # Pass 2
    # =====================

    progress(
        "pass2",
        45,
        "正在验证证据和解释边界...",
    )

    pass2 = ask_ai(
        PASS2_PROMPT,
        f"""
ORIGINAL TEXT:

{text}

PASS 1 ANALYSIS:

{json.dumps(pass1, ensure_ascii=False)}
""",
    )

    progress(
        "pass2_completed",
        65,
        "Pass 2 验证完成",
    )

    # =====================
    # Pass 3
    # =====================

    progress(
        "pass3",
        75,
        "正在生成教师教学报告...",
    )

    pass3 = ask_ai(
        PASS3_PROMPT,
        f"""
ORIGINAL TEXT:

{text}

VERIFIED PASS 2 RESULT:

{json.dumps(pass2, ensure_ascii=False)}
""",
    )

    progress(
        "pass3_completed",
        95,
        "教学报告生成完成",
    )

    return {
        "pass1": pass1,
        "pass2": pass2,
        "report": pass3,
    }
