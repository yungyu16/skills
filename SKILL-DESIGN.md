# SKILL 设计开发规范

参考 [agentskills.io/specification](https://agentskills.io/specification) 及实践经验整理。

---

## 目录结构

```
skill-name/
├── SKILL.md          # 必需：元数据 + 指令
├── scripts/          # 可选：可执行脚本
├── references/       # 可选：按需读取的文档
├── assets/           # 可选：静态资源
└── ...
```

## SKILL.md 规范

### frontmatter

| 字段              | 必需 | 说明                             |
|-----------------|----|--------------------------------|
| `name`          | 是  | 小写字母+连字符，1-64 字符，**必须与父目录名一致** |
| `description`   | 是  | 1-1024 字符，描述功能+触发场景            |
| `license`       | 否  | 许可证名或引用许可证文件                   |
| `compatibility` | 否  | 环境要求（如 "Requires Node.js 18+"） |
| `metadata`      | 否  | 自定义键值对                         |
| `allowed-tools` | 否  | 预授权工具列表（实验性）                   |

### description 编写要点

- 陈述功能 + 列举触发场景
- 加入常见关键词帮助 agent 识别（要"推"一点，避免 undertrigger）
- 不要包含实现细节（如"零第三方依赖"）
- 中文环境下使用中文描述

```
好: 读取网页/PDF 内容和搜索网络信息。当用户需要：搜索网络、查找最新资讯、读取网页
    内容、从 URL 提取信息时使用。

不好: 通过 Node.js 脚本直接调用 Jina OpenAPI，零第三方依赖。
```

## 文件引用规则

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

## Progressive Disclosure（渐进式加载）

| 层级  | 内容                   | 大小限制       |
|-----|----------------------|------------|
| 元数据 | name + description   | ~100 token |
| 指令  | SKILL.md 正文          | < 500 行    |
| 资源  | references/、scripts/ | 按需加载       |

- 正文只放核心流程，详细参数放到 references/
- references/ 保持一级深度，避免嵌套引用链

## 脚本编写要求

### 路径一致性

脚本内部的帮助文本、错误消息中的路径引用，要与 SKILL.md 中的用法一致。

```
# SKILL.md 中
node scripts/auth.mjs set <token>

# auth.mjs 内部也要写 scripts/auth.mjs，不能只写 auth.mjs
```

### 错误处理

- 单个任务失败不影响其他任务（如多个 URL 读取，一个失败继续处理剩下的）
- 错误消息要有可操作性（告诉用户下一步做什么）

### 参数规范

- 解析了就要实现（如 `--max-workers` 不能只解析不用）
- 支持 `--help` 更好

## 评审检查清单

- [ ] `name` 是否与目录名一致
- [ ] `name` 格式：小写字母 + 连字符
- [ ] description 是否包含触发关键词
- [ ] description 是否含实现细节（删掉）
- [ ] SKILL.md 是否 < 500 行
- [ ] 文件引用是否使用相对路径，从 skill 根目录开始
- [ ] references/ 是否与 SKILL.md 内容有冗余（删掉冗余）
- [ ] 脚本帮助文本的路径与 SKILL.md 是否一致
- [ ] 脚本参数是否真实生效
- [ ] 输出是否遵循项目约定（如无 emoji）
