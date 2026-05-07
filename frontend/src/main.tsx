import Layout from '@/layout'
import Router from '@/router'
import '@/styles/index.css'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'uno.css'
import 'virtual:uno.css'
import './locales' // 多语言配置

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <Layout>
      <Router />
    </Layout>
  </HashRouter>,
)
