# Yungyu Skills

面向 Claude Code、Codex 等 AI Agent 的自定义技能集合，基于 [Agent Skills 规范](https://agentskills.io/specification) 开发。

## 技能列表

| 技能 | 说明 | 依赖 |
|------|------|------|
| [jina-web](jina-web/) | 网页/PDF 读取和网络搜索，基于 Jina AI OpenAPI | Jina API Key |
| [v2ex-hot](v2ex-hot/) | V2EX 热榜查看 | 无 |
| [svg-to-png](svg-to-png/) | 将 SVG 文件转换为 PNG | npx sharp-cli |
| [explore-repo](explore-repo/) | 从问题背景到源码实现的渐进式导读，支持连续追问 | 无 |

## 安装

通过 Skills CLI 安装单个技能：

```bash
npx skills add yungyu16/skills@jina-web
npx skills add yungyu16/skills@v2ex-hot
npx skills add yungyu16/skills@svg-to-png
npx skills add yungyu16/skills@explore-repo
```

## 开发

参考 [AGENTS.md](AGENTS.md) 及 [agentskills.io/specification](https://agentskills.io/specification)。

所有辅助脚本统一使用 Node.js（CJS），不引入其他运行时。
