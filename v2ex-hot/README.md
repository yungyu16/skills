# V2EX 热榜

查看 V2EX 当前热榜帖子，以简洁格式展示标题、节点、作者、回复数和链接。

## 安装

```bash
skills add yungyu16/skills/v2ex-hot
```

## 使用方式

安装后在 Claude Code 对话中直接用自然语言描述，agent 自动调用。

> "看热榜"

> "V2EX 热榜"

> "最近社区在讨论什么"

> "刷热榜"

## 展示格式

按热度排序，最多展示 20 条：

```
V2EX 热榜（当前 N 条）

1. [节点] 帖子标题
   by 作者 · N 条回复 · 时间
   https://www.v2ex.com/t/xxxxx

2. ...
```

数据来源：`https://www.v2ex.com/?tab=hot`，无需登录，无需 API Key。

## 依赖

- Node.js 18+
- `curl`（系统自带）
