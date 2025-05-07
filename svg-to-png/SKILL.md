---
name: svg-to-png
description: 将 SVG 文件转为 PNG。当用户需要：SVG转PNG、转换SVG、导出PNG、矢量图转位图、favicon/图标转换时触发。
---

# SVG to PNG 转换

使用 `sharp-cli` 将 SVG 文件转为高一致性 PNG。

## 依赖

无需预装，`npx --yes` 自动下载 `sharp-cli`。

## 用法

```bash
npx --yes sharp-cli -i <input.svg> -o <output.png>
```

- 输入/输出路径相对于当前工作目录，或使用绝对路径
- 输出默认 256×256 RGBA PNG

## 约定

- 输出与源文件同目录、同名，仅改扩展名为 `.png`
- 生成后建议用 `file` 命令验证输出格式和尺寸