import { lazy, Suspense, useState } from 'react'
import HeroSection from './components/HeroSection'
import WaitlistSection from './components/WaitlistSection'
import BrewStageDisplay from './components/BrewStageDisplay'
import BrewTelemetry from './components/BrewTelemetry'
import BatchDetails from './components/BatchDetails'

const AdminPanel = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  const isAdmin = import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('admin')

  const [requestedBatchId, setRequestedBatchId] = useState(null)

  if (isAdmin) return <Suspense fallback={null}><AdminPanel /></Suspense>

  return (
    <>
      <HeroSection />
      <WaitlistSection />
      <BrewStageDisplay />
      <BrewTelemetry requestedBatchId={requestedBatchId} />
      <section id="batches" aria-label="Past batches">
        <BatchDetails onPlayBatch={(id) => {
          setRequestedBatchId(id)
          document.getElementById('telemetry')?.scrollIntoView({ behavior: 'smooth' })
        }} />
      </section>
    </>
  )
}
