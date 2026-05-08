import { useState, lazy, Suspense } from 'react'
import FirstBatch from './components/FirstBatch'
import LiveBatch from './components/LiveBatch'
import BrewMonitor from './components/BrewMonitor'

const AdminPanel = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  const [isAdmin] = useState(() => new URLSearchParams(window.location.search).has('admin'))

  if (isAdmin) return <Suspense fallback={null}><AdminPanel /></Suspense>

  return (
    <>
      <FirstBatch />
      <LiveBatch />
      <BrewMonitor />
    </>
  )
}
