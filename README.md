# Minecraft GlassPixel Generator

将任何图片转换成 Minecraft 玻璃像素画，生成可以直接在游戏内加载的 `.schem` / `.schematic` 结构文件。

## 功能

- 上传图片 → 自动像素化匹配 → 生成 Minecraft 结构文件
- 支持 1\~N 层玻璃叠加，色彩更丰富
- 选择 Minecraft 版本过滤可用方块
- 导出 `.schem`（推荐，支持透明方块）或 `.schematic`
- 实时预览，按住预览可对比原图

## 算法

1. **基础方块**：RGB 平方距离独立匹配最近的不透明方块
2. **玻璃层**：1\~4 层穷举 16 种染色玻璃，>4 层贪心填充。预乘权重系数消除内层乘法。
3. **权重**：玻璃层自上而下 50% / 25% / 12.5% / 6.25% ...，基础层 = 0.5^N
4. 无抖动，每个像素独立匹配

## 开发

```bash
npm install
npm run dev      # 启动开发服务器 localhost:5173
npm run build    # 编译 + 构建
npm run lint     # ESLint 检查
```

## 技术栈

- React 19 + TypeScript
- Vite
- 二进制 NBT 写入（类 `region` 格式）
- 进度通知通过 `MessageChannel` 实现，后台标签页不节流

## 许可证

MIT
