# RoxyBrowser MCP 服务器 [Beta]

[English](README.md) | [中文](README_CN.md)

> **⚠️ Beta 测试版声明**
>
> 本项目目前处于 **Beta 测试和开发阶段**。虽然我们力求稳定性，但请在重要环境或关键资产中谨慎使用。我们建议在 MCP 客户端使用时，密切监控软件和浏览器操作，从而避免不必要的损失。

一个为 [RoxyBrowser](https://www.roxybrowser.com/) 设计的模型上下文协议（MCP）服务器，为 AI 助手提供管理浏览器实例和获取 Chrome DevTools Protocol (CDP) WebSocket 端点的能力。

## 功能特性

- 🚀 **浏览器管理**：通过编程方式打开和关闭 RoxyBrowser 实例
- 🔗 **CDP 集成**：获取用于 Chrome DevTools Protocol 自动化的 WebSocket 端点
- 🤖 **AI 友好**：通过 MCP 与 AI 助手无缝集成
- 🎯 **Playwright 就绪**：与 [PlayRoxy MCP](https://github.com/roxybrowserlabs/playroxy-mcp)（RoxyBrowser 定制的 Playwright MCP）完美配合
- 📊 **工作区支持**：跨不同工作区和项目管理浏览器
- 🛠️ **浏览器创建**：支持分层复杂度创建浏览器（简单、标准、高级）
- 🌐 **代理管理**：内置代理验证、测试和配置工具
- 🔧 **高级配置**：完全控制指纹、代理和浏览器设置

## 快速开始

### 前置条件

1. **RoxyBrowser** 已安装并运行
2. **RoxyBrowser API** 在设置中已启用：
   - 打开 RoxyBrowser → API
   - 设置"API状态"为"启用"
   - 复制您的 API Key
   - 记下 API 端口（默认：50000）

### MCP 客户端配置

将 RoxyBrowser OpenAPI 和 PlayRoxy MCP 添加到您的 MCP 客户端配置中：

**Claude Desktop / VS Code / Cursor：**
```json
{
  "mcpServers": {
    "roxybrowser-openapi": {
      "command": "npx",
      "args": ["@roxybrowser/openapi@latest"],
      "env": {
        "ROXY_API_KEY": "YOUR API KEY",
        "ROXY_API_HOST": "http://127.0.0.1:50000"
      }
    },
    "roxybrowser-playwright-mcp": {
      "command": "npx",
      "args": ["@roxybrowser/playwright-mcp@latest"]
    }
  }
}
```

**注意：** 将 `YOUR API KEY` 和 `YOUR API HOST` 替换为您实际的 RoxyBrowser 凭证。

## 可用工具

### 工作区与项目管理
- `roxy_list_workspaces` - 列出所有可用的工作区及其项目
- `roxy_list_accounts` - 获取工作区中的平台账号和凭证
- `roxy_list_labels` - 获取用于组织的浏览器标签

### 浏览器管理
- `roxy_list_browsers` - 列出工作区/项目中的浏览器并支持筛选
- `roxy_get_browser_detail` - 获取详细的浏览器信息和配置
- `roxy_open_browsers` - 打开浏览器并获取用于自动化的 CDP WebSocket 端点
- `roxy_close_browsers` - 关闭运行中的浏览器（不释放额度）
- `roxy_delete_browsers` - 永久删除浏览器配置文件（释放额度）
- `roxy_get_connection_info` - 获取已打开浏览器的 CDP 端点和进程 ID

### 浏览器创建
- `roxy_create_browser_simple` - 使用基础配置创建浏览器
- `roxy_create_browser_standard` - 使用常用设置创建浏览器（操作系统、代理、窗口大小等）
- `roxy_create_browser_advanced` - 使用完全控制创建浏览器（指纹、平台账号等）

### 浏览器维护
- `roxy_update_browser` - 更新现有浏览器配置
- `roxy_random_fingerprint` - 随机化浏览器指纹
- `roxy_clear_local_cache` - 清除本地浏览器缓存
- `roxy_clear_server_cache` - 清除服务端浏览器缓存

### 实用工具
- `roxy_validate_proxy_config` - 验证代理配置
- `roxy_system_diagnostics` - 系统健康检查和诊断

## 完整工作流示例

### 示例 1：快速浏览器自动化设置

```
1. AI："在工作区 1 中创建一个名为'测试浏览器'的简单浏览器"
   → 使用 roxy_create_browser_simple
   → 返回可供使用的浏览器 ID

2. AI："打开我刚创建的浏览器"
   → 使用 roxy_open_browsers 及返回的 ID
   → 返回 CDP WebSocket URL，例如：ws://127.0.0.1:52314/devtools/browser/xxx

3. AI："导航到 gmail.com，登录并发送邮件"
   → 自动使用 PlayRoxy MCP 工具（browser_navigate、browser_type、browser_click 等）
   → PlayRoxy MCP 通过 CDP 端点连接到已打开的浏览器

4. AI："完成后关闭浏览器"
   → 使用 roxy_close_browsers
```

### 示例 2：使用代理的高级浏览器设置

```
1. AI："在创建浏览器之前验证我的代理配置"
   → 使用 roxy_validate_proxy_config
   → 确认代理设置正确

2. AI："在工作区 2 中创建一个使用 SOCKS5 代理和 1920x1080 分辨率的标准浏览器"
   → 使用 roxy_create_browser_standard 配置代理
   → 返回配置好的浏览器 ID

3. AI："打开浏览器并开始自动化"
   → 使用 roxy_open_browsers → 获取 CDP 端点
   → PlayRoxy MCP 自动连接并开始自动化任务
```

## 与 Playwright MCP 集成

RoxyBrowser MCP 旨在与 [PlayRoxy MCP](https://github.com/roxybrowserlabs/playroxy-mcp) 无缝协作，这是我们专为 RoxyBrowser 兼容性构建的定制 Playwright MCP 服务器。

**PlayRoxy MCP** 基于 [Microsoft 的 Playwright MCP](https://github.com/microsoft/playwright-mcp)，并针对 RoxyBrowser 的指纹浏览器功能进行了增强。

### 工作流程

1. 使用 RoxyBrowser OpenAPI MCP 创建和打开浏览器
2. 从打开的浏览器获取 CDP WebSocket 端点
3. 使用 PlayRoxy MCP 以完整的 Playwright 功能自动化浏览器任务

两个服务器在 MCP 客户端中配置后可无缝协作（参见上面的配置）。

## 开发

```bash
# 开发模式（自动重新构建）
npm run dev

# 生产构建
npm run build
```

## API 参考

### 环境变量

| 变量 | 必需 | 默认值 | 说明 |
|----------|----------|---------|-------------|
| `ROXY_API_KEY` | ✅ 是 | - | 从 RoxyBrowser 设置中获取的 API key |
| `ROXY_API_HOST` | ✅ 是 | `http://127.0.0.1:50000` | RoxyBrowser API 端点 |
| `ROXY_TIMEOUT` | 否 | `30000` | 请求超时时间（毫秒）|

### 错误代码

| 代码 | 名称 | 说明 |
|------|------|-------------|
| **0** | SUCCESS | 操作成功完成 |
| **101** | INSUFFICIENT_QUOTA | 窗口额度不足 |
| **400** | INVALID_PARAMS | 提供的参数无效 |
| **401** | UNAUTHORIZED | 认证失败 - API key 无效 |
| **403** | FORBIDDEN | 访问被拒绝 - 权限不足 |
| **404** | NOT_FOUND | 资源未找到 |
| **408** | TIMEOUT | 请求超时 |
| **409** | CONFLICT | 资源冲突或额度不足 |
| **500** | SERVER_ERROR | 服务器内部错误 |
| **502** | BAD_GATEWAY | 网关错误 - 代理或网络问题 |
| **503** | SERVICE_UNAVAILABLE | 服务暂时不可用 |
| **504** | GATEWAY_TIMEOUT | 网关超时 |

## 故障排除

### 连接问题

**错误："无法连接到 RoxyBrowser API"**

检查：
1. RoxyBrowser 正在运行
2. API 已启用：RoxyBrowser → API → API状态 = 启用
3. API key 正确：从 RoxyBrowser → API → API Key 复制
4. 端口正确：检查 RoxyBrowser → API → 端口设置（默认：50000）
5. 防火墙未阻止 http://127.0.0.1:50000

### 认证问题

**错误："配置错误：需要 API key"**

设置环境变量：
```bash
export ROXY_API_KEY="your_actual_api_key_from_roxybrowser"
```

### 浏览器打开问题

**错误："窗口额度不足"（错误代码 101 或 409）**

解决方案：
- 在 RoxyBrowser 费用中心购买更多窗口
- 使用 `roxy_delete_browsers` **删除**未使用的浏览器配置文件（仅关闭不会释放额度）
- 升级您的订阅计划
- 在工作区设置中检查当前额度使用情况

**部分浏览器无法打开：**

- 检查浏览器配置文件存在且未损坏
- 确保系统资源充足（RAM、CPU）
- 验证 dirIds 有效（先使用 `roxy_list_browsers`）
- 运行 `roxy_system_diagnostics` 进行全面健康检查

## 许可证

MIT License - 详见 LICENSE 文件。

## 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 如适用，添加测试
5. 提交 pull request
