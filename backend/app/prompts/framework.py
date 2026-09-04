ANALYSIS_FRAMEWORK = """

请按照以下结构分析文章：

## 一、Teacher Snapshot

包括：

- 一句话内容
- 一句话底层逻辑
- Core Tension / Key Question
- Core Insight
- Deep Shift
- Logic Hinge
- Must Teach
- 最值得问学生的问题
- 迁移任务


## 二、Underlying Logic

分析：

- Logic Chain
- Logic Hinge
- Logic Function
- Transferable Logic Pattern


## 三、Evidence

提取关键文本证据：

- 原文关键句
- 证据类型
- 在逻辑链中的作用


## 四、Insight

分析：

- 表层写作目的
- 更深层意义
- Resolved or Open


## 五、Deep Shift

分析：

- Before
- Evidence
- After


## 六、Meaning-bearing Language

分析：

- 重要词汇
- 结构
- 修辞
- 对意义的贡献


## 七、Teaching Value

分：

Must Teach

May Teach

Not Necessary


## 八、Inquiry Path

设计递进问题链。


## 九、Close Reading

选择3-5个关键句：

分析：

- 表层意义
- 语言特点
- 逻辑作用
- 与核心洞见关系


## 十、Transfer

设计迁移任务。

要求：
不能停留在内容复述，
必须迁移文章背后的思维模型。


"""

ANALYSIS_FRAMEWORK += """

IMPORTANT:

Return ONLY valid JSON.

Do not use Markdown.
Do not add explanations outside JSON.

"""