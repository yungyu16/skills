# Yungyu Skills

Claude Code 自定义技能集合，基于 [agentskills.io](https://agentskills.io) 规范开发。

## 技能列表

| 技能 | 说明 | 依赖 |
|------|------|------|
| [jina-web](jina-web/) | 网页/PDF 读取和网络搜索，基于 Jina AI OpenAPI | Jina API Key |
| [v2ex-hot](v2ex-hot/) | V2EX 热榜查看 | 无 |
| [daily-report](daily-report/) | 基于 git 提交的日报生成 | 无 |
| [agent-notes](agent-notes/) | 认知增量学习日志 | 无 |
| [source-code-guide](source-code-guide/) | 从问题背景到源码实现的渐进式导读，支持连续追问 | 无 |
| [write-blog](write-blog/) | 羊羽个人博客写作风格指南 | 无 |

## 安装

通过 `skills` CLI 安装单个技能：

```bash
skills add yungyu16/skills/jina-web
skills add yungyu16/skills/v2ex-hot
skills add yungyu16/skills/daily-report
skills add yungyu16/skills/agent-notes
skills add yungyu16/skills/source-code-guide
skills add yungyu16/skills/write-blog
```

## 开发

参考 [AGENTS.md](AGENTS.md) 及 [agentskills.io/specification](https://agentskills.io/specification)。

所有辅助脚本统一使用 Node.js（CJS），不引入其他运行时。
