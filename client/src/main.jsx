import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary' // <--- 1. Import
import './index.css'
import App from './App.jsx'
import ErrorFallback from './components/ui/ErrorFallback.jsx' // <--- 2. Import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3. Wrap App in Safety Net */}
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)