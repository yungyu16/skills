# AGENTS.md

## 项目概述

Agent Skills 集合。每个技能（skill）是一个独立目录，必须包含 `SKILL.md`，可按需包含辅助脚本、参考资料、静态资源和客户端元数据。仓库内辅助脚本统一使用 Node.js，不引入 Python 或其他运行时。

## 技能列表

| 目录              | 能力                                | 技术栈           |
|-----------------|-----------------------------------|---------------|
| `jina-web/`     | 网页/PDF 读取 + 网络搜索（Jina AI OpenAPI） | Node.js (CJS) |
| `v2ex-hot/`     | V2EX 热榜抓取展示                       | Node.js (CJS) |
| `svg-to-png/`   | SVG 转 PNG（sharp-cli）              | npx sharp-cli |
| `explore-repo/` | 从问题背景到源码实现的渐进式导读与连续追问          | 无             |

## 常用命令

```bash
# 验证 skill 安装
npx skills list

# 从 GitHub 安装单个 skill
npx skills add yungyu16/skills@<skill-name>

# 运行仓库内辅助脚本（在对应 skill 目录内执行）
node scripts/read.js <url>
node scripts/search.js <keyword>
node scripts/format_hot.js
```

### 核心约定

- **新增、删除或重命名 skill 时，必须同步更新以下两处**：`AGENTS.md` 技能列表、`README.md` 技能列表及安装命令
- **`AGENTS.md` 是 AI 指引的唯一事实源**；`CLAUDE.md` 必须保持为指向 `AGENTS.md` 的软链接，不维护独立内容
- **`name` frontmatter 字段必须与父目录名一致**，仅使用小写字母、数字和连字符，不能以连字符开头或结尾，也不能包含连续连字符
- **所有文件引用使用相对路径**，从 skill 根目录开始
- **SKILL.md 正文只放核心流程**，详细参数放到 references/（渐进式加载）
- **脚本帮助文本/错误消息中的路径要与 SKILL.md 中的用法一致**
- 输出不要使用 emoji
- **所有辅助脚本统一使用 Node.js**，不引入 Python 或其他运行时

## SKILL 设计开发规范

在本 repo 中对 skill 做迭代时，优先使用以下辅助 skill，而不是直接动手：

| 场景                                         | 使用的 skill       |
|--------------------------------------------|-----------------|
| 新建 skill、修改已有 skill、运行 eval、优化 description | `skill-creator` |

参考 [agentskills.io/specification](https://agentskills.io/specification) 及实践经验整理。

### 目录结构

```
skill-name/
├── SKILL.md          # 必需：元数据 + 指令（< 500 行）
├── agents/           # 可选：特定客户端的展示与调用元数据
├── README.md         # 可选：面向用户的说明
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：按需读取的文档
├── assets/           # 可选：静态资源
└── ...
```

### SKILL.md 规范

#### frontmatter

| 字段              | 必需 | 说明                             |
|-----------------|----|--------------------------------|
| `name`          | 是  | 小写字母、数字和连字符，1-64 字符，**必须与父目录名一致** |
| `description`   | 是  | 1-1024 字符，描述功能+触发场景            |
| `license`       | 否  | 许可证名或引用许可证文件                   |
| `compatibility` | 否  | 环境要求（如 "Requires Node.js 18+"） |
| `metadata`      | 否  | 自定义键值对                         |
| `allowed-tools` | 否  | 预授权工具列表（实验性）                   |

#### description 编写要点

- 陈述功能 + 列举触发场景
- 加入常见关键词帮助 agent 识别（要"推"一点，避免 undertrigger）
- 不要包含实现细节（如"零第三方依赖"）
- 中文环境下使用中文描述

```
好: 读取网页/PDF 内容和搜索网络信息。当用户需要：搜索网络、查找最新资讯、读取网页
    内容、从 URL 提取信息时使用。

不好: 通过 Node.js 脚本直接调用 Jina OpenAPI，零第三方依赖。
```

### 文件引用规则

**所有引用使用相对路径，从 skill 根目录开始。**

```markdown
# 正确

scripts/read.mjs
references/auth.md
node scripts/read.mjs https://example.com

# 错误

read.mjs # 少了 scripts/
$SKILL_DIR/scripts/read.mjs # 变量不存在
/Users/xxx/skill/scripts/read.mjs # 绝对路径，不可移植
```

### Progressive Disclosure（渐进式加载）

| 层级  | 内容                   | 大小限制       |
|-----|----------------------|------------|
| 元数据 | name + description   | ~100 token |
| 指令  | SKILL.md 正文          | 建议 < 5000 token，且 < 500 行 |
| 资源  | references/、scripts/ | 按需加载       |

- 正文只放核心流程，详细参数放到 references/
- references/ 保持一级深度，避免嵌套引用链

### 脚本编写要求

#### 路径一致性

脚本内部的帮助文本、错误消息中的路径引用，要与 SKILL.md 中的用法一致。

```
# SKILL.md 中
node scripts/auth.mjs set <token>

# auth.mjs 内部也要写 scripts/auth.mjs，不能只写 auth.mjs
```

#### 错误处理

- 单个任务失败不影响其他任务（如多个 URL 读取，一个失败继续处理剩下的）
- 错误消息要有可操作性（告诉用户下一步做什么）

#### 参数规范

- 解析了就要实现（如 `--max-workers` 不能只解析不用）
- 支持 `--help` 更好

### 评审检查清单

- [ ] `name` 是否与目录名一致
- [ ] `name` 格式：小写字母、数字和连字符，无首尾或连续连字符
- [ ] description 是否包含触发关键词
- [ ] description 是否含实现细节（删掉）
- [ ] SKILL.md 是否 < 500 行
- [ ] 文件引用是否使用相对路径，从 skill 根目录开始
- [ ] references/ 是否与 SKILL.md 内容有冗余（删掉冗余）
- [ ] 脚本帮助文本的路径与 SKILL.md 是否一致
- [ ] 脚本参数是否真实生效
- [ ] 输出是否遵循项目约定（如无 emoji）
