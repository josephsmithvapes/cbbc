import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import BrewFlow from './components/BrewFlow.jsx'

createRoot(document.getElementById('brew-mount')).render(
  <StrictMode><App /></StrictMode>
)

createRoot(document.getElementById('flow-mount')).render(
  <StrictMode><BrewFlow /></StrictMode>
)
