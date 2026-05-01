---
name: v2ex-hot
description: 查看 V2EX 热榜。当用户说"看热榜""v2ex热榜""最近热点""刷热榜"等意图时应触发。
---

# V2EX 热榜

查看 V2EX 当前热榜帖子，并以简洁格式展示。

## 触发条件

当用户表达以下意图时触发：

- 看热榜 / 刷热榜
- V2EX 热榜 / v2ex hot
- 最近有什么热点
- 看看社区在讨论什么

## 数据来源

抓取 `https://www.v2ex.com/?tab=hot` 网页，解析 HTML 中的话题列表。

解析策略：
1. 定位 `id="Tabs"` 之后的内容
2. 每个话题是一个 `<table>...</table>`，包含 `class="topic-link"` 的链接
3. 从中提取：标题（topic-link）、节点（class="node"）、作者（第一个 strong > a）、时间（span title）、回复数（#reply 数字）

## 展示格式

默认列表模式（最多展示 20 条）：

```
V2EX 热榜（当前 N 条）

1. [节点] 帖子标题
   by 作者 · N 条回复 · 时间
   https://www.v2ex.com/t/xxxxx

2. ...
```

规则：
- 按网页上的显示顺序（已按热度排序）
- 每条一行，超出 20 条不展示，告知用户总数
- 不展示帖子正文，只展示标题和元信息

## 执行步骤

1. 运行辅助脚本获取格式化输出
2. 如果脚本请求失败，告知用户并建议直接访问 `https://www.v2ex.com/?tab=hot`

## 辅助脚本

执行以下命令获取格式化输出：

```bash
node scripts/format_hot.js
```
