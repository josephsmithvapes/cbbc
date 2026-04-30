import { useState } from 'react'
import LiveBatch from './components/LiveBatch'
import BrewMonitor from './components/BrewMonitor'
import BrewPanels from './BrewPanels'
import BatchProof from './components/BatchProof'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  const [isAdmin] = useState(() => new URLSearchParams(window.location.search).has('admin'))

  if (isAdmin) return <AdminPanel />

  return (
    <>
      <LiveBatch />
      <BrewMonitor />
      <BrewPanels />
      <BatchProof />
    </>
  )
}
