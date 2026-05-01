# search — 网络搜索

调用 Jina Search API (`svip.jina.ai`) 搜索互联网信息，支持单个或多个关键词并发搜索。

## 脚本

```
scripts/search.mjs
```

## 用法

```bash
# 基本搜索
node scripts/search.mjs "Python 异步编程"

# 指定结果数
node scripts/search.mjs "AI 新闻" --num 10

# 时间过滤（本周内）
node scripts/search.mjs "科技动态" --tbs qdr:w

# 定位搜索
node scripts/search.mjs "天气" --location Beijing --gl cn --hl zh-cn

# 多关键词并行搜索
node scripts/search.mjs "Kubernetes" "Docker" "微服务"

# 保存到文件
node scripts/search.mjs -o results.json "query1" "query2"
```

## 参数

| 参数 | 说明 |
|---|---|
| `queries` | 搜索关键词（必填，多个时并行执行） |
| `--num` | 每项结果数，默认 30，最大 100 |
| `--tbs` | 时间过滤，见下表 |
| `--location` | 地理位置，如 `Beijing` |
| `--gl` | 国家代码，如 `cn` `us` |
| `--hl` | 语言代码，如 `zh-cn` `en` |
| `--output, -o` | 输出到 JSON 文件 |

### tbs 时间过滤

| 值 | 含义 |
|---|---|
| `qdr:h` | 1 小时内 |
| `qdr:d` | 24 小时内 |
| `qdr:w` | 1 周内 |
| `qdr:m` | 1 月内 |
| `qdr:y` | 1 年内 |

## 输出格式

```json
{
  "count": 2,
  "queries": [
    {
      "query": "Kubernetes",
      "count": 30,
      "results": [
        {
          "title": "标题",
          "url": "https://...",
          "description": "摘要"
        }
      ]
    },
    {
      "query": "Docker",
      "count": 0,
      "results": [],
      "error": "HTTP 429: rate limit exceeded"
    }
  ]
}
```

单个关键词失败时，该条记录包含 `error` 字段，不影响其他关键词的结果。

## API 说明

**端点:** `POST https://svip.jina.ai/`

必须携带 API Key：

```bash
export JINA_API_KEY=jina_xxx
```

获取 Key：https://jina.ai/api-dashboard/

## 最佳实践

搜索结果只有标题和摘要，**需要配合 `read.mjs` 阅读具体内容**：

```bash
# 1. 搜索找到相关 URL
node scripts/search.mjs "Python 最佳实践 2024" -o search.json

# 2. 从结果中提取感兴趣的 URL，批量阅读
node scripts/read.mjs https://url1.com https://url2.com https://url3.com
```

- 多关键词时结果顺序与输入一致
- 时间过滤 `--tbs` 有助于获取最新信息
- 多个关键词同时搜索，比逐个搜索更高效
