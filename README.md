# Yungyu Skills

智能体 自定义技能集合。

## 技能列表

| 技能 | 目录 | 说明 |
|------|------|------|
| jina-web | `jina-web/` | 网页/PDF 读取和网络搜索（基于 Jina AI OpenAPI） |
| v2ex-hot | `v2ex-hot/` | V2EX 热榜查看 |

## 目录结构

```
.
├── jina-web/            # 网页读取和搜索技能
│   ├── SKILL.md         # 技能定义
│   ├── scripts/         # Node.js 辅助脚本
│   └── references/      # 参考文档
├── v2ex-hot/            # V2EX 热榜技能
│   ├── SKILL.md         # 技能定义
│   └── scripts/         # 辅助脚本
├── SKILL-DESIGN.md      # Skill 设计开发规范
└── skills-lock.json     # 依赖技能锁文件
```

## 开发

参考 [agentskills.io/specification](https://agentskills.io/specification) 及项目内 `SKILL-DESIGN.md`。

## 安装

技能通过 `skills` CLI 工具安装：

```bash
# 从本地路径安装
npx skills install /path/to/yungyu-skills/jina-web

# 从 GitHub 安装
npx skills install <owner>/<repo>
```

详见各技能目录内的 `SKILL.md`。