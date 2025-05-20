# Boss直聘外包公司标记 Chrome 插件

这是一个 Chrome 浏览器插件，旨在帮助用户在浏览“Boss直聘”网站时，自动识别并标记出已知的外包公司。

## 主要功能

*   **自动标记**：在“Boss直聘”的职位列表页面和聊天窗口中，自动高亮或添加“外包”标签到已配置的外包公司名称旁边。
*   **动态配置**：外包公司列表通过插件内的 `config.json` 文件进行管理，用户可以方便地自行添加、修改或删除公司名单。
*   **动态内容适应**：插件能够监听页面的动态内容加载（例如，滚动加载更多职位），并对新出现的内容进行标记。

## 工作原理

插件主要由以下几个部分组成：

1.  **`manifest.json`**：
    *   插件的配置文件，定义了插件的名称、版本、描述、所需权限（如访问特定网站、读取存储等）、内容脚本、背景脚本（如果需要）以及浏览器行为（如弹出窗口）。

2.  **`content_script.js`**：
    *   这是注入到“Boss直聘”页面的核心脚本。
    *   `fetchConfig()`: 异步函数，负责从插件包内的 `config.json` 文件读取外包公司列表。
    *   `markOutsourcingCompanies(outsourcingCompanies)`: 接收外包公司列表作为参数。它会：
        *   遍历页面上特定的 HTML 元素（如职位卡片 `.job-card-footer` 和聊天窗口中的公司名称容器 `.name-box`）。
        *   提取这些元素中的公司名称文本。
        *   与 `outsourcingCompanies` 列表进行比对。
        *   如果匹配成功，则在该公司名称旁边动态创建一个 `<span>` 标签，并添加文本“外包”和特定的 CSS 类（`outsourcing-tag`）以便于样式化。
    *   `MutationObserver`: 用于监听目标页面 DOM 结构的变化。当页面内容动态加载（如无限滚动加载更多职位或聊天消息）时，`MutationObserver` 会触发回调，重新调用 `markOutsourcingCompanies` 函数，以确保新加载的内容也能被正确标记。
    *   脚本会在页面加载完成后 (`DOMContentLoaded`) 或页面已加载时立即执行 `main` 函数，开始标记流程并设置 `MutationObserver`。

3.  **`config.json`**：
    *   一个简单的 JSON 文件，包含一个名为 `outsourcing_companies` 的数组，数组中存储了需要标记的外包公司的确切名称字符串。
    *   示例：
        ```json
        {
          "outsourcing_companies": [
            "软通动力",
            "中软国际",
            "博彦科技",
            "文思海辉"
          ]
        }
        ```

4.  **`popup.html` 和 `popup.js`** (可选的弹出窗口):
    *   `popup.html`: 定义了点击插件图标时显示的弹出窗口的 HTML 结构。通常包含插件的简要说明和指向 `config.json` 的提示。
    *   `popup.js`: 为 `popup.html` 提供交互逻辑（如果需要的话），但在这个插件中可能只是静态显示信息。

5.  **`style.css` 或内联样式** (可选的样式文件):
    *   定义了 `.outsourcing-tag` 标签的样式，例如背景颜色、文字颜色、边框等，使其在页面上醒目显示。

## 如何使用

1.  **安装插件**：
    *   下载插件文件（或从源码构建）。
    *   打开 Chrome 浏览器，进入“扩展程序”页面 (`chrome://extensions/`)。
    *   开启“开发者模式”。
    *   点击“加载已解压的扩展程序”，选择插件所在的文件夹。
2.  **配置外包公司列表**：
    *   在插件的文件夹中找到 `config.json` 文件。
    *   用文本编辑器打开它。
    *   在 `outsourcing_companies` 数组中添加或删除公司的完整名称。
    *   保存文件。
    *   在 Chrome 扩展程序页面刷新该插件（或重新加载浏览器）。
3.  **浏览 Boss直聘**：
    *   打开“Boss直聘”网站 (zhipin.com)。
    *   插件会自动在职位列表和聊天界面中标记出 `config.json` 中列出的外包公司。

## 文件结构 (示例)

```
/boss-outsourcing-marker
|-- manifest.json
|-- content_script.js
|-- config.json
|-- popup.html
|-- popup.js
|-- style.css (可选)
|-- icons/
    |-- icon16.png
    |-- icon48.png
    |-- icon128.png
```

## 注意事项

*   Boss直聘网站的页面结构可能会发生变化，这可能导致插件的选择器失效。如果插件停止工作，可能需要更新 `content_script.js` 中的 DOM 选择器。
*   公司名称匹配是基于文本完全匹配的，请确保 `config.json` 中的公司名称与网站上显示的一致。