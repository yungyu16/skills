# Yungyu Skills

Claude Code 自定义技能集合，基于 [agentskills.io](https://agentskills.io) 规范开发。

## 技能列表

| 技能 | 说明 | 依赖 |
|------|------|------|
| [jina-web](jina-web/) | 网页/PDF 读取和网络搜索，基于 Jina AI OpenAPI | Jina API Key |
| [v2ex-hot](v2ex-hot/) | V2EX 热榜查看 | 无 |

## 安装

通过 `skills` CLI 安装单个技能：

```bash
skills add yungyu16/skills/jina-web
skills add yungyu16/skills/v2ex-hot
```

## 目录结构

```
.
├── jina-web/            # 网页读取和搜索技能
│   ├── SKILL.md         # 技能定义（AI 读取）
│   ├── README.md        # 用户说明
│   ├── scripts/         # Node.js 辅助脚本
│   └── references/      # 按需加载的参考文档
├── v2ex-hot/            # V2EX 热榜技能
│   ├── SKILL.md         # 技能定义（AI 读取）
│   ├── README.md        # 用户说明
│   └── scripts/         # Node.js 辅助脚本
├── SKILL-DESIGN.md      # Skill 设计开发规范
├── CLAUDE.md            # Claude Code 项目指引
└── skills-lock.json     # 依赖技能锁文件
```

## 开发

参考项目内 [SKILL-DESIGN.md](SKILL-DESIGN.md) 及 [agentskills.io/specification](https://agentskills.io/specification)。

所有辅助脚本统一使用 Node.js（CJS），不引入其他运行时。
