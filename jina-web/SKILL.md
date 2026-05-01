---
name: jina-web
description: >
  读取网页/PDF 内容和搜索网络信息。当用户需要：搜索网络、查找最新资讯、读取网页
  或 PDF 内容、从 URL 提取信息时使用。支持单个和并发批量操作。
  所有认证操作和命令执行都需要引导完成。
---

## 认证

**首次使用需要先认证。** 用户只会在聊天中交互，需要你来引导。

### 认证引导流程

1. 当脚本报错 `NO_API_KEY` 时，引导用户前往 [Jina API Dashboard](https://jina.ai/api-dashboard/) 注册并获取 API Key（格式 `jina_xxx`）
2. 让用户在聊天中提供他们的 token
3. 使用用户的 token 运行 `node scripts/auth.mjs set <token>`
4. 验证通过后 token 持久化到 `~/.config/jina-api/key`，后续所有脚本自动读取

### 认证错误处理

详见 `references/auth.md`。

## 核心能力

| 能力       | 脚本                   | API          | 说明                         |
|----------|----------------------|--------------|----------------------------|
| 读取网页/PDF | `scripts/read.mjs`   | r.jina.ai    | 单个或多个 URL 并发读取，输出 Markdown |
| 搜索网络     | `scripts/search.mjs` | svip.jina.ai | 单个或多个关键词并发搜索，支持时间/地域过滤     |

两个脚本都内置并发支持：

- 传入多个 URL 时自动并行读取，保持输入顺序
- 传入多个关键词时自动并行搜索，保持输入顺序

## 快速开始

典型工作流：先搜索，再阅读具体内容。

```bash
# 搜索
node scripts/search.mjs "Python 最新动态"

# 读取搜索结果中的 URL
node scripts/read.mjs https://url1.com https://url2.com
```

### 并发批处理

```bash
# 多个 URL 并发读取
node scripts/read.mjs https://url1.com https://url2.com https://url3.com

# 多个关键词并发搜索
node scripts/search.mjs "Kubernetes" "Docker" "微服务"
```

## 详细说明

以下文件包含各能力的完整参数说明、输出格式和最佳实践，按需读取：

- `references/auth.md` — 认证配置、错误码、获取 API Key 的步骤
- `references/read.md` — Reader API 参数（--with-links、--with-images、--max-workers）、输出格式、PDF 读取
- `references/search.md` — Search API 参数（--num、--tbs 时间过滤、--location）、输出格式、多关键词搜索
