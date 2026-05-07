import react from '@vitejs/plugin-react'
import path from 'path'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    // 项目插件
    plugins: [
      react(),
      svgr(),
      UnoCSS(),
    ],
    // 基础配置
    base: './',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@@': path.resolve(__dirname, 'src/components'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            '@border-color-base': '#dce3e8',
          },
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 2048, // 减小内联资源大小限制
      cssCodeSplit: true,
      brotliSize: false,
      sourcemap: false,
      chunkSizeWarningLimit: 1000, // 添加chunk大小警告限制
      minify: 'terser',
      rollupOptions: {
        output: {
          // 手动代码分割
          manualChunks: {
            vendor: ['react', 'react-dom'],
            antd: ['antd', '@ant-design/x'],
          },
        },
      },
      terserOptions: {
        compress: {
          // 生产环境去除console及debug
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
    },
    server: {
      // http://localhost:5173/api/login -> http://www.test.com/login
      // proxy: {
      //   '/api': {
      //     target: 'http://10.253.213.105:9000',
      //     changeOrigin: true,
      //     rewrite: (path) => path.replace(/^\/api/, ''), //路径重写，把'/api'替换为''
      //   },
      // },
    },
  }
})
