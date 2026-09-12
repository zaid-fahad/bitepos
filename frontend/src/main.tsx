import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { KdsTv } from './components/KdsTv'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {window.location.pathname === '/kds' ? <KdsTv /> : <App />}
  </StrictMode>,
)
