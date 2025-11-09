# CF-Workers-SUB

基于 Cloudflare Workers 的订阅管理工具，支持多种代理协议和客户端自适应订阅转换。

## ✨ 特性

- 🚀 基于 Cloudflare Workers，部署简单，无需服务器
- 🔄 自动识别客户端类型，返回对应格式订阅
- 📱 支持多种主流代理客户端
- 🎨 简洁美观的 Web 管理界面
- 💾 支持 KV 存储，在线编辑订阅内容
- 🔒 Token 验证，保护订阅安全

## 🎯 支持的客户端

- Clash / Clash Meta
- Surge
- Singbox
- Loon
- QuantumultX
- V2rayN
- Shadowrocket
- Stash

## 📦 部署步骤

### 1. 准备工作

- 注册 [Cloudflare](https://dash.cloudflare.com/) 账号
- 准备一个域名（可选，使用 Workers 默认域名也可以）

### 2. 创建 Workers

1. 登录 Cloudflare 控制台
2. 进入 `Workers & Pages`
3. 点击 `Create Application` -> `Create Worker`
4. 复制 `worker.js` 的内容到编辑器
5. 点击 `Save and Deploy`

### 3. 配置环境变量

在 Workers 设置中添加以下环境变量：

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `TOKEN` | 是 | 访问令牌，用于保护订阅 | `auto` |
| `SUBNAME` | 否 | 订阅文件名 | `HeiYu-Air-Sub` |
| `LINK` | 否 | 节点链接或订阅地址（多个用换行分隔） | - |
| `SUBAPI` | 否 | 订阅转换后端 | `SUBAPI.cmliussss.net` |
| `SUBCONFIG` | 否 | 订阅配置文件 | ACL4SSR配置链接 |
| `SUBUPTIME` | 否 | 订阅更新时间（小时） | `6` |
| `URL302` | 否 | 无 Token 访问时重定向地址 | - |
| `URL` | 否 | 无 Token 访问时反向代理地址 | - |
| `WARP` | 否 | WARP 节点 | - |
| `LINKSUB` | 否 | 订阅链接（多个用换行分隔） | - |

### 4. 绑定 KV 命名空间（可选）

如果需要在线编辑订阅内容：

1. 创建 KV 命名空间：`Workers & Pages` -> `KV`
2. 在 Worker 设置中绑定 KV，变量名设置为 `KV`

## 🔧 使用方法

### 订阅地址格式

```
https://your-worker.workers.dev/你的TOKEN
```

### Web 管理界面

访问上述地址，即可进入 Web 管理界面，可以：

- 查看和复制订阅链接
- 生成订阅二维码
- 在线编辑订阅内容（需绑定 KV）

### 订阅格式说明

客户端会自动识别并返回对应格式：

- **Base64 订阅**：`https://your-worker.workers.dev/TOKEN`
- **Clash 订阅**：访问时使用 Clash 客户端 UA 或添加 `?clash` 参数
- **Singbox 订阅**：访问时使用 Singbox 客户端 UA 或添加 `?singbox` 参数
- **Surge 订阅**：访问时使用 Surge 客户端 UA 或添加 `?surge` 参数
- **QuantumultX 订阅**：访问时使用 QuantumultX 客户端 UA 或添加 `?quanx` 参数
- **Loon 订阅**：访问时使用 Loon 客户端 UA 或添加 `?loon` 参数

## 📝 节点格式

支持的节点协议：

- `vless://`
- `vmess://`
- `trojan://`
- `ss://`
- `ssr://`
- `hysteria://`
- `hysteria2://`
- 以及订阅链接（`https://` 开头）

## 🛠️ 高级配置

### 自定义订阅转换

可以通过环境变量 `SUBAPI` 和 `SUBCONFIG` 自定义订阅转换后端和配置。

支持自建 [psub](https://github.com/bulianglin/psub) 订阅转换服务。

### 反向代理

设置 `URL` 环境变量，可以在无 Token 访问时反向代理到指定网站。

### 302 重定向

设置 `URL302` 环境变量，可以在无 Token 访问时重定向到指定网站。

## ⚠️ 注意事项

1. 请妥善保管你的 Token，避免泄露
2. 建议使用自定义域名，避免 Workers 默认域名被墙
3. Cloudflare Workers 免费版每天有 10 万次请求限制
4. KV 命名空间免费版每天有 10 万次读取、1000 次写入限制

## 📄 开源协议

MIT License

## 🙏 鸣谢

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [subconverter](https://github.com/tindy2013/subconverter)
- [ACL4SSR](https://github.com/ACL4SSR/ACL4SSR)

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [原项目地址](https://github.com/cmliu/CF-Workers-SUB)

