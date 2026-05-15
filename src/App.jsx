import { lazy, Suspense, useState } from 'react'

// The new index.html is fully static for everything ABOVE and BELOW the
// React mount. The React tree at #brew-mount only renders the three
// live sections the design calls for:
//
//   1. BrewStageDisplay — current stage indicator (only when active)
//   2. BrewTelemetry    — Brew Monitor · Lot panel with live readings + chart
//   3. BatchDetails     — "We Show Our Work" header + scrollable batch carousel
//
// HeroSection and WaitlistSection were removed — their content is now
// authored directly in the static markup above #brew-mount.

const BrewStageDisplay = lazy(() => import('./components/BrewStageDisplay'))
const BrewTelemetry    = lazy(() => import('./components/BrewTelemetry'))
const BatchDetails     = lazy(() => import('./components/BatchDetails'))
const AdminPanel       = lazy(() => import('./pages/AdminPanel'))

export default function App() {
  const isAdmin = import.meta.env.DEV &&
    new URLSearchParams(window.location.search).has('admin')

  const [requestedBatchId, setRequestedBatchId] = useState(null)

  if (isAdmin) {
    return (
      <Suspense fallback={null}>
        <AdminPanel />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={null}>
      <BrewStageDisplay />
      <BrewTelemetry requestedBatchId={requestedBatchId} />
      <section id="batches" aria-label="Past batches">
        <BatchDetails
          onPlayBatch={(id) => {
            setRequestedBatchId(id)
            document
              .getElementById('telemetry')
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </section>
    </Suspense>
  )
}
