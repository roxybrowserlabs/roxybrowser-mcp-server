# RoxyBrowser MCP 使用指南

## 🚀 安装配置

### 前置要求

1. **安装 RoxyBrowser** 并启动
2. **启用 RoxyBrowser API**：
   - 打开 RoxyBrowser → API → API配置
   - 将「启用状态」设置为「启用」
   - 复制你的 API Key
3. **安装 Node.js**（版本 ≥ 18）

### 方式一：通过 npm 安装（推荐）

```bash
npm install -g @roxybrowser/openapi
```

### 方式二：从源码安装

```bash
git clone https://github.com/your-repo/roxy-browser-mcp
cd roxy-browser-mcp
npm install
npm run build
```

---

## 配置到 AI 客户端

### Claude Desktop 配置

打开 Claude Desktop 配置文件：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

添加以下配置：

```json
{
  "mcpServers": {
    "roxy-browser": {
      "command": "npx",
      "args": ["-y", "@roxybrowser/openapi"],
      "env": {
        "ROXY_API_KEY": "your_api_key_here",
        "ROXY_API_HOST": "http://127.0.0.1:50000"
      }
    }
  }
}
```

> 💡 **如果从源码安装**，将 `"command": "npx"` 和 `"args"` 改为：
> ```json
> "command": "node",
> "args": ["/path/to/roxy-browser-mcp/lib/index.js"]
> ```

### Chatwise 配置

在 Chatwise 的 MCP 服务器设置中添加：

```json
{
  "name": "roxy-browser",
  "command": "npx",
  "args": ["-y", "@roxybrowser/openapi"],
  "env": {
    "ROXY_API_KEY": "your_api_key_here",
    "ROXY_API_HOST": "http://127.0.0.1:50000"
  }
}
```

配置完成后，重启客户端即可使用。

---

## 💡 快速开始

### 最简单的使用场景 - 5分钟完成第一次浏览器自动化

```
你：在 workspace 1 创建一个简单的浏览器

AI：✅ 已创建浏览器
    Browser ID: abc123xyz

你：打开这个浏览器

AI：✅ 浏览器已打开
    CDP WebSocket: ws://127.0.0.1:52314/devtools/browser/abc123xyz
    💡 现在可以使用 playwright-mcp 连接到这个浏览器

你：现在连接到浏览器，访问 GitHub 并帮我检查是否有新的通知

AI：正在连接浏览器...
    [自动打开 GitHub，登录，检查通知]
    ✅ 你有 3 条新通知...

你：关闭浏览器

AI：✅ 浏览器已关闭
```

就这么简单！AI 会自动选择合适的工具完成你的需求。

---

## 📋 完整工具列表

RoxyBrowser MCP 提供 18 个工具，涵盖浏览器创建、管理、维护等全流程：

### 工作空间与信息查询

| 工具名称 | 功能说明 |
|---------|---------|
| `roxy_list_workspaces` | 列出所有工作空间和项目 |
| `roxy_list_browsers` | 查询指定工作空间/项目中的浏览器，支持过滤 |
| `roxy_get_browser_detail` | 获取指定浏览器的详细配置信息 |
| `roxy_list_accounts` | 获取工作空间中的平台账号信息 |
| `roxy_list_labels` | 获取工作空间中的浏览器标签列表 |

### 浏览器创建

| 工具名称 | 功能说明 |
|---------|---------|
| `roxy_create_browser_simple` | **简单模式** - 快速创建浏览器，只需配置基础代理 |
| `roxy_create_browser_standard` | **标准模式** - 支持系统版本、分辨率、语言、时区等常用配置 |
| `roxy_create_browser_advanced` | **高级模式** - 完整控制所有指纹参数，适合专业用户 |

### 浏览器操作

| 工具名称 | 功能说明 |
|---------|---------|
| `roxy_open_browsers` | 批量打开浏览器并获取 CDP WebSocket 端点（支持5个并发） |
| `roxy_close_browsers` | 批量关闭浏览器 |
| `roxy_get_connection_info` | 获取已打开浏览器的连接信息和进程 ID |

### 浏览器管理

| 工具名称 | 功能说明 |
|---------|---------|
| `roxy_update_browser` | 更新浏览器配置（代理、备注、标签等） |
| `roxy_delete_browsers` | 永久删除浏览器 |

### 浏览器维护

| 工具名称 | 功能说明 |
|---------|---------|
| `roxy_random_fingerprint` | 随机化浏览器指纹 |
| `roxy_clear_local_cache` | 清除本地浏览器缓存 |
| `roxy_clear_server_cache` | 清除服务器端浏览器缓存 |

### 辅助工具

| 工具名称 | 功能说明 |
|---------|---------|
| `roxy_validate_proxy_config` | 验证代理配置是否正确 |
| `roxy_system_diagnostics` | 系统诊断 - 检查 API 连接、认证状态和系统健康 |

---

## 📚 了解更多

- **完整文档**：[GitHub 仓库](https://github.com/your-repo/roxy-browser-mcp)
- **API 参考**：查看各工具的详细参数说明
- **常见问题**：连接问题、认证失败等解决方案
- **进阶示例**：批量管理、与 Playwright 集成等

---

## 🔗 与 Playwright 集成

RoxyBrowser MCP 与 [@playwright/mcp](https://github.com/microsoft/playwright-mcp) 完美集成：

1. 使用 RoxyBrowser MCP 创建和打开浏览器
2. 获取 CDP WebSocket 端点
3. 使用 Playwright MCP 连接并自动化操作

```bash
# 示例：使用 Playwright MCP 连接到 RoxyBrowser
npx @playwright/mcp@latest --cdp-endpoint "ws://127.0.0.1:52314/devtools/browser/xxx"
```

---

## ⚙️ 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|-------|------|--------|------|
| `ROXY_API_KEY` | ✅ 是 | - | RoxyBrowser API Key |
| `ROXY_API_HOST` | 否 | `http://127.0.0.1:50000` | RoxyBrowser API 地址 |
| `ROXY_TIMEOUT` | 否 | `30000` | 请求超时时间（毫秒） |

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件
