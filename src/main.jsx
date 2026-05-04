import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import BatchProof from './components/BatchProof.jsx'

createRoot(document.getElementById('brew-mount')).render(
  <StrictMode><App /></StrictMode>
)

const batchEl = document.getElementById('batch-mount')
if (batchEl) {
  createRoot(batchEl).render(
    <StrictMode><BatchProof /></StrictMode>
  )
}
