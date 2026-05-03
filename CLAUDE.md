# CLAUDE.md

## SKILL 说明
@SKILL-DESIGN.md

## 项目概述

Claude Code 自定义技能集合。每个技能是一个独立目录，包含 SKILL.md（给 AI 看的指令）和辅助脚本。

## 技能结构（参考 SKILL-DESIGN.md）

```
skill-name/
├── SKILL.md          # 必需：元数据 + 指令（< 500 行）
├── README.md         # 可选：面向用户的说明
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：按需读取的补充文档
└── assets/           # 可选：静态资源
```

### 核心约定

- **`name` frontmatter 字段必须与父目录名一致**，小写字母+连字符
- **所有文件引用使用相对路径**，从 skill 根目录开始
- SKILL.md 正文只放核心流程，详细参数放到 references/（渐进式加载）
- 脚本内部的帮助文本/错误消息中的路径要与 SKILL.md 中的用法一致
- 输出不要使用 emoji
- **所有辅助脚本统一使用 Node.js**，不引入 Python 或其他运行时

## 技能列表

| 目录 | 能力 | 技术栈 |
|------|------|--------|
| `jina-web/` | 网页/PDF 读取 + 网络搜索（Jina AI OpenAPI） | Node.js (ESM) |
| `v2ex-hot/` | V2EX 热榜抓取展示 | Node.js (CJS) |

## 常用命令

```bash
# 验证 skill 安装
npx skills list

# 从本地安装 skill
npx skills install ./<skill-name>

# 验证单 skill
node scripts/read.js <url>
node scripts/search.js <keyword>
node scripts/format_hot.js
```

## skills-lock.json

管理依赖的外部技能（如 `skill-creator`）。`source` 和 `computedHash` 用于锁定版本，不要手动修改。
