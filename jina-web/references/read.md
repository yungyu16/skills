# read — 网页内容读取

调用 Jina Reader API (`r.jina.ai`) 将网页或 PDF 转换为干净的 Markdown 内容，支持单个或多个 URL 并发读取。

## 脚本

```
scripts/read.js
```

## 用法

```bash
# 读取单个 URL
node scripts/read.js https://example.com

# 同时读取多个（自动并发，顺序与输入一致）
node scripts/read.js https://a.com https://b.com https://c.com

# 提取页面链接
node scripts/read.js --with-links https://example.com

# 提取页面图片
node scripts/read.js --with-images https://example.com

# 保存到文件
node scripts/read.js -o output.json https://example.com
```

## 参数

| 参数 | 说明 |
|---|---|
| `urls` | URL 列表（必填，支持多个，自动并发） |
| `--with-links` | 提取页面所有链接 |
| `--with-images` | 提取页面图片 |
| `--max-workers` | 并发数，默认 5 |
| `--output, -o` | 输出到 JSON 文件 |

## 输出格式

```json
{
  "count": 2,
  "results": [
    {
      "url": "https://example.com",
      "title": "页面标题",
      "content": "Markdown 正文...",
      "links": [],
      "images": []
    },
    {
      "url": "https://example2.com",
      "title": "",
      "content": "",
      "links": [],
      "images": [],
      "error": "HTTP 404: Not Found"
    }
  ]
}
```

单个 URL 失败时，该条记录包含 `error` 字段，不影响其他 URL 的结果。

## API 说明

**端点:** `POST https://r.jina.ai/`

| Header | 说明 |
|---|---|
| `Authorization: Bearer jina_xxx` | 可选，无 Key 每分钟约 20 次 |
| `X-With-Links-Summary: all` | 提取所有超链接 |
| `X-With-Images-Summary: true` | 提取图片 |
| `X-Retain-Images: none` | 不保留图片（默认） |

## 认证

Reader API 无 Key 也可用，但有频率限制，生产建议配置：

```bash
export JINA_API_KEY=jina_xxx
```

获取 Key：https://jina.ai/api-dashboard/

## 最佳实践

- 搜索后读取：先用 `search.js` 找到相关 URL，再用本脚本读取具体内容
- 多个 URL 直接传给同一个命令，无需多次调用
- PDF 链接也支持直接读取
