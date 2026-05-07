# React + TypeScript + Vite

## 样式系统

### UnoCSS 配置

项目使用 UnoCSS 作为原子化CSS框架，配置文件：[`uno.config.ts`](uno.config.ts)

**自定义规则：**

- **间距工具类**：`m-10`, `p-20`, `mt-5`, `px-15` 等
- **尺寸工具类**：`w-100`, `h-200`, `min-w-300` 等
- **圆角工具类**：`rounded-8`, `rounded-t-12`, `rounded-bl-6` 等
- **字体工具类**：`text-16`, `leading-24` 等
- **边框工具类**：`border-2`, `b-1-solid-#000` 等
- **位置工具类**：`top-10`, `z-100` 等
- **透明度工具类**：`opacity-50` (50%) 等
- **响应式断点**：`xs:370px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`

## 主题系统

### 主题配置

项目实现了完整的主题切换系统，支持多种主题模式：

**可用主题色：**

- `light` - 浅色主题（默认）
- `dark` - 深色主题

- 根据.env文件中 VITE_THEME 区分icon主题
- `demo` - 默认主题
- `xxxx` - 自定义主题

### 主题变量定义

主题变量定义在 [`src/styles/themes.css`](src/styles/themes.css) 中：

```css
:root {
  --theme-background: #ffffff; /* 背景色 */
  --theme-text: #1f2937; /* 文字颜色 */
  --theme-primary: #3b82f6; /* 主题色 */
  --theme-secondary: #6b7280; /* 次要色 */
  --theme-border: #e5e7eb; /* 边框色 */
}
```

每个主题都有对应的变量覆盖，通过 `data-theme` 属性切换：

```css
html[data-theme='wiko-dark'] {
  --theme-background: #dcfce7;
  --theme-text: #14532d;
  --theme-primary: #22c55e;
  --theme-secondary: #4ade80;
  --theme-border: #86efac;
}
```

### 使用方法

**1. 在组件中使用主题变量：**

```css
.my-component {
  background-color: var(--theme-background);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
}
```

**2. 在 React 组件中切换主题：**

```tsx
import { useTheme } from '@/hooks/useTheme'

const MyComponent = () => {
  const { theme, setTheme, toggleTheme } = useTheme()

  return (
    <div>
      <button onClick={toggleTheme}>切换主题</button>
      <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </div>
  )
}
```

**3. 使用主题切换组件：**

```tsx
import ThemeToggle from '@@/ThemeToggle'
;<ThemeToggle className="my-class" />
```

### 核心文件结构

```
src/
├── styles/
│   ├── index.css       # 样式主入口
│   ├── themes.css      # 主题变量定义
│   └── reset.css       # 基础样式重置
├── context/
│   └── ThemeContext.tsx    # 主题上下文
├── hooks/
│   └── useTheme.ts         # 主题 Hook
└── components/
    └── ThemeToggle/        # 主题切换组件
```

### 全局样式特性

- **平滑过渡**：主题切换时有 0.3s 的过渡动画
- **自定义滚动条**：适配主题颜色的滚动条样式
- **文本选择样式**：选中文字时使用主题色高亮
- **焦点样式**：键盘导航时的焦点指示器
