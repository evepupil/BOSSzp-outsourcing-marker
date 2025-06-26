# Boss直聘外包公司标记 Chrome 插件

这是一个 Chrome 浏览器插件，旨在帮助用户在浏览"Boss直聘"网站时，自动识别并标记出已知的外包公司。插件通过后端API获取经过AI验证的外包公司列表，确保标记的准确性。

## 主要功能

*   **自动标记**：在"Boss直聘"的职位列表页面和聊天窗口中，自动高亮或添加"外包"标签到已知外包公司名称旁边。
*   **AI智能判断**：后端使用DeepSeek V3模型自动识别外包公司，防止恶意标记非外包公司。
*   **动态内容适应**：插件能够监听页面的动态内容加载（例如，滚动加载更多职位），并对新出现的内容进行标记。
*   **用户贡献**：用户可以提交新的外包公司，经过AI智能判断后添加到数据库。

## 系统架构

该项目由两部分组成：Chrome浏览器插件（前端）和外包公司管理API（后端）。

### 前端（Chrome插件）

插件主要由以下几个部分组成：

1.  **`manifest.json`**：
    *   插件的配置文件，定义了插件的名称、版本、描述、所需权限等。

2.  **`content_script.js`**：
    *   这是注入到"Boss直聘"页面的核心脚本。
    *   `fetchCompanies()`: 异步函数，负责从后端API获取最新的外包公司列表。
    *   `markOutsourcingCompanies(outsourcingCompanies)`: 接收外包公司列表作为参数，在页面上标记这些公司。
    *   `MutationObserver`: 监听页面DOM结构变化，确保动态加载的内容也能被标记。

3.  **`popup.html` 和 `popup.js`**:
    *   提供用户界面，允许用户提交新的外包公司名称。
    *   显示最近添加的外包公司和统计信息。

### 后端（外包公司管理API）

后端API提供以下功能：

1.  **获取外包公司列表**：
    *   `GET /api/companies`：返回经过验证的外包公司列表。

2.  **添加外包公司**：
    *   `POST /api/add-company`：接收用户提交的公司名称，使用AI进行验证后添加到数据库。

3.  **AI智能判断**：
    *   使用DeepSeek V3模型联网搜索公司名称，判断是否为外包公司。
    *   防止恶意标记非外包公司，提高数据准确性。

4.  **Redis数据存储**：
    *   使用Redis存储外包公司列表，提供高性能的数据访问。

## 如何使用

### 安装Chrome插件

1.  **下载插件**：
    *   从GitHub仓库下载最新版本的插件文件。
    *   解压到本地文件夹。

2.  **安装到Chrome**：
    *   打开Chrome浏览器，进入"扩展程序"页面 (`chrome://extensions/`)。
    *   开启"开发者模式"。
    *   点击"加载已解压的扩展程序"，选择插件所在的文件夹。

3.  **使用插件**：
    *   打开"Boss直聘"网站 (zhipin.com)。
    *   插件会自动从后端API获取外包公司列表并标记页面上的外包公司。
    *   点击插件图标可以打开弹出窗口，提交新的外包公司或查看统计信息。

### 贡献外包公司

1.  **提交新公司**：
    *   点击插件图标，打开弹出窗口。
    *   在输入框中输入公司名称，点击"提交"。
    *   系统会自动使用AI判断该公司是否为外包公司。
    *   如果AI确认为外包公司，将被添加到数据库中。

2.  **查看提交状态**：
    *   在弹出窗口中可以查看提交状态和最近添加的公司。

## 技术栈

### 前端（Chrome插件）
- JavaScript (ES6+)
- HTML/CSS
- Chrome Extension API
- Fetch API

### 后端（API服务）
- Node.js
- Vercel Serverless Functions
- Redis 数据库
- DeepSeek V3 AI模型
- OpenAI SDK

## 文件结构

```
/boss-outsourcing-marker
|-- manifest.json
|-- content_script.js
|-- popup.html
|-- popup.js
|-- style.css
|-- icons/
    |-- icon16.png
    |-- icon48.png
    |-- icon128.png
|-- server/
    |-- api/
        |-- companies.js
        |-- add-company.js
        |-- health.js
    |-- config/
        |-- ai-config.js
        |-- prompt-templates.js
    |-- services/
        |-- ai-service.js
    |-- scripts/
        |-- init-redis-companies.js
```

## 注意事项

*   Boss直聘网站的页面结构可能会发生变化，这可能导致插件的选择器失效。如果插件停止工作，可能需要更新 `content_script.js` 中的DOM选择器。
*   为确保AI判断的准确性，请在提交公司名称时使用完整的公司名称。
*   插件需要访问互联网以获取最新的外包公司列表，请确保您的浏览器能够连接到后端API。
*   后端API服务部署在Vercel上，可能会有请求限制，如果遇到问题，请稍后再试。

## 隐私声明

*   插件不会收集用户的个人信息。
*   插件仅在Boss直聘网站上运行，不会影响其他网站。
*   提交的公司名称将用于更新外包公司数据库，帮助其他用户识别外包公司。