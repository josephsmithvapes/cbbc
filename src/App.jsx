import { lazy, Suspense } from 'react'
import WaitlistSection from './components/WaitlistSection'
import BrewStageDisplay from './components/BrewStageDisplay'
import BrewTelemetry from './components/BrewTelemetry'

const AdminPanel = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  const isAdmin = import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('admin')

  if (isAdmin) return <Suspense fallback={null}><AdminPanel /></Suspense>

  return (
    <>
      <WaitlistSection />
      <BrewStageDisplay />
      <BrewTelemetry />
    </>
  )
}
