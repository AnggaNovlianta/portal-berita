import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HelmetProvider } from 'react-helmet-async' // 1. Impor HelmetProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Bungkus App dengan HelmetProvider */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)