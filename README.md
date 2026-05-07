# AIPC

一个基于 Electron 桌面应用程序，为 AIPC 提供完整的功能支持。

## 🏗️ 技术栈

**渲染层**

- React 18
- TypeScript
- Vite
- UNO CSS
- Zustand (状态管理)

**主进程**

- Node.js
- TypeScript
- Electron

## 📋 项目结构

```
├── electron/          # 主进程代码
├── frontend/          # 渲染进程代码
├── build/             # 构建输出
└── public/            # 静态资源
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16 
- npm >= 7

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install
```

**⚠️ 重要提示**

- 请使用 `npm` 安装依赖，不要使用 `yarn`、`pnpm` 等其他包管理工具
- 避免依赖兼容性问题

### 启动项目

```bash
# 启动默认主题
npm run dev
```

## 🎨 主题与多语言

### 多语言支持

- ✅ 中文、英文、繁体中文
- 🔧 计划改进：语言切换后立即生效，无需重启

### 主题支持

- 🔄 TODO:进行中：Logo 及主题色配置
- ✅ 深色/浅色主题切换

### 无障碍功能

- ⏳ 待实现：完整的无障碍功能覆盖

## 🛠️ 开发工具

### Logo 生成工具

一键生成多种尺寸的应用图标：（具体参数配置看package.json）

```bash
npm run icon
```


**参数说明：**

- `-i, --input`: 源图片路径（默认：`/public/images/logo.png`）
- `-o, --output`: 输出路径（默认：`/build/icons/`）
- `-s, --size`: 生成尺寸（默认：`16,32,64,256,512`）
- `-c`: 清理输出目录中的 `.ico` 和 `.png` 文件
- `-img, --images`: Windows 窗口图标/tray 图片生成路径（默认：`/public/images/`）

**特殊处理：**

- `16px` 图像生成 `tray.png`
- `32px` 图像生成 `logo-32.png`

## 📦 构建与部署

## 🔄 更新机制

## 📝 开发规范

### 目录说明

- `./electron` - 主进程逻辑
- `./frontend` - 渲染进程代码

### 静态资源

- 默认主题静态资源：`./build/icons/demo`


##无障碍功能
检测方式：控制台--lighthouse-- 类别 -- 勾选Accessibility
- 参考链接：https://blog.csdn.net/weixin_41697143/article/details/136500430
- 官方链接：https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA

