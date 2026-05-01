# auth — 认证配置

Jina API 通过 `Authorization: Bearer` 头进行认证。

## 认证要求

| 能力 | 是否需要 API Key | 说明 |
|---|---|---|
| Reader API (`r.jina.ai`) | 可选 | 无 Key 有频率限制 |
| Search API (`svip.jina.ai`) | **必须** | 无 Key 无法调用 |

## 获取 API Key

1. 访问 [Jina API Dashboard](https://jina.ai/api-dashboard/)
2. 登录/注册 Jina 账号
3. 创建新的 API Key，格式为 `jina_xxx`

## 配置流程

Token 通过 `auth.mjs` 脚本验证并持久化到 `~/.config/jina-api/key`。

```bash
node scripts/auth.mjs set jina_xxx
```

查看状态：`node scripts/auth.mjs status`
清除凭据：`node scripts/auth.mjs clear`

## 认证状态码

| 状态码 | 含义 | 处理 |
|---|---|---|
| `NO_API_KEY` | 未配置任何凭据 | 引导用户提供 token，运行 `node scripts/auth.mjs set <token>` |
| HTTP 401 | Token 无效或过期 | 引导用户重新获取 token 并运行 `auth.mjs set` |
| HTTP 402 | Token 配额用完 | 引导用户前往 https://jina.ai 续费或创建新 Key |
| HTTP 429 | 触发限流 | 建议等待重试或升级套餐 |
