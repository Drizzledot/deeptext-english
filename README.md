# DeepText

面向高中英语教师的 AI 深度文本解析工具。

DeepText 不只生成文章大意，而是从文本证据、底层逻辑、核心洞见、意义语言、教学价值、探究路径和迁移等角度生成教师可用的解析报告。

---

## 最快使用方式：GitHub Codespaces

本仓库已配置为 **GitHub Template + Codespaces**。

### 方式 A：直接试用

在仓库首页点击：

**Use this template → Open in a codespace**

GitHub 会自动：

1. 创建 Codespace
2. 准备 Python 3.12
3. 安装依赖
4. 启动 DeepText
5. 转发 8000 端口
6. 自动打开 DeepText 网页
7. 首次进入模型配置向导

随后只需填写：

- API 地址
- API Key
- 模型名称

保存后即可使用。

> 从模板直接创建的 Codespace 一开始不会自动关联到一个新的 GitHub 仓库。如果希望长期保存自己的修改，可以在 Codespace 中使用 GitHub 的“Publish to a new repository”功能。

---

## 方式 B：复制到自己的 GitHub 后长期使用

在仓库首页点击：

**Use this template → Create a new repository**

创建完成后，进入你自己的新仓库：

**Code → Codespaces → Create codespace on main**

之后环境会自动安装、启动并打开 DeepText。

这种方式适合长期使用和继续开发。

---

## 首次模型配置

首次打开 DeepText 时，会自动进入配置页面。

需要填写：

```text
API 地址
API Key
模型名称
```

例如：

```text
API 地址：https://example.com/v1
API Key：sk-xxxxxxxx
模型名称：your-model-name
```

可以先点击：

**测试连接**

确认模型可用后，再点击：

**保存并开始使用**

配置会保存在当前 Codespace 的：

```text
backend/.env
```

该文件已经通过 `.gitignore` 排除，不应提交到 GitHub。

---

## 安全提示

不要把真实 API Key 写进：

```text
backend/.env.example
```

也不要把：

```text
backend/.env
```

提交到 GitHub。

建议保持 Codespaces 的 8000 端口为 **Private**。

每位使用者最好使用自己的 Codespace 和自己的 API Key。

---

## Codespaces 自动化流程

```text
Use this template
       ↓
Open in a codespace
       ↓
创建开发环境
       ↓
自动安装 requirements.txt
       ↓
自动运行 start.sh
       ↓
FastAPI 启动
       ↓
8000 端口自动转发
       ↓
浏览器自动打开
       ↓
首次配置 API
       ↓
DeepText
```

---

## 再次打开 Codespace

Codespace 重新启动时会再次自动执行：

```bash
bash start.sh
```

`start.sh` 会检测 DeepText 是否已经运行，因此不会重复启动服务。

如果需要手动启动：

```bash
./start.sh
```

查看后端日志：

```bash
cat /tmp/deeptext.log
```

---

## 项目结构

```text
deeptext-english/
│
├── .devcontainer/
│   └── devcontainer.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── prompts/
│   │   └── services/
│   │
│   ├── static/
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── app.js
│   │   ├── setup.html
│   │   ├── setup.css
│   │   └── setup.js
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
├── start.sh
└── README.md
```

---

## 技术栈

- Python 3.12
- FastAPI
- OpenAI-compatible API
- HTML / CSS / JavaScript
- GitHub Codespaces

---

## 当前状态

DeepText 目前处于开发测试阶段。

当前分析任务状态暂时保存在 FastAPI 进程内存中，因此服务重启后，正在运行的任务记录不会保留。
