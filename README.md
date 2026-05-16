<p align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="logo">
</p>

<h1 align="center">Minecraft GlassPixel Generator</h1>

<p align="center">
  <b>将图片转换为 Minecraft 玻璃像素画</b><br>
  <i>Turn images into Minecraft pixel art with stained glass layers</i>
</p>

<p align="center">
  <a href="https://imhols.github.io/minecraft-glasspixel-generator/" target="_blank">
    <img src="https://img.shields.io/badge/在线体验-Online%20Demo-6366f1?style=for-the-badge&logo=githubpages&logoColor=white" alt="在线体验">
  </a>
</p>

<p align="center">
  <img src="https://github.com/imhols/minecraft-glasspixel-generator/actions/workflows/deploy.yml/badge.svg" alt="Deploy">
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-8b5cf6?style=flat" alt="License">
  </a>
</p>

---

## ✨ 功能

- **上传图片** → 自动像素化匹配 → 生成 Minecraft 结构文件
- **N 层玻璃叠加** — 1~4 层穷举 16 种染色玻璃，色彩更丰富
- **版本过滤** — 选择 MC 版本，自动过滤可用方块
- **三种导出格式** — `.schem` (Sponge) / `.schematic` (MCEdit) / `.litematic` (Litematica)
- **实时预览** — 按住预览图可对比原图
- **纯玻璃模式** — 仅用玻璃层构建，无底层方块
- **中英双语** — 点击右上角切换

## 🔧 开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器 → http://localhost:5173/minecraft-glasspixel-generator/
npm run build    # tsc -b && vite build
npm run lint     # ESLint 检查
```

## 🧠 算法

| 步骤 | 方法 | 位置 |
|------|------|------|
| 基础方块 | RGB 平方距离匹配最近的不透明方块 | `core/colorMatcher.ts` |
| 玻璃层 | 1~4 层穷举 16 种染色玻璃，预乘权重消除内层循环 | `core/colorMatcher.ts` |
| 纯玻璃模式 | 跳过底层，玻璃直接匹配目标色 | `findBestBlend(pureGlass=true)` |
| 进度反馈 | `MessageChannel` 微任务投递，后台标签页不节流 | `core/imageProcessor.ts` |
| 方块调色板 | 从 MC 客户端 JAR 实时提取纹理平均色（7 个版本，390+ 方块） | `scripts/generate-palette.mjs` |

**权重**：玻璃层自上而下 50% → 25% → 12.5% → 6.25% ...，基础方块 = 0.5^N

## 📦 导出格式

| 格式 | 工具 | 支持多层 |
|------|------|----------|
| `.schem` (Sponge v2) | WorldEdit / Sponge | ✅ |
| `.schematic` (MCEdit) | 旧版 MCEdit / WorldEdit | ✅ |
| `.litematic` (Litematica) | Litematica 模组 | ✅ |

## 🏗️ 技术栈

- **React 19** + **TypeScript** + **Vite**
- 二进制 NBT 写入（Sponge v2 / MCEdit / Litematica 三种格式）
- 颜色匹配：CIEDE2000 + RGB 平方距离
- 纹理提取：从 Mojang Piston Meta API 获取 client.jar，解析 PNG 平均色

## 📄 许可证

[MIT](./LICENSE) © 2026 imhols
