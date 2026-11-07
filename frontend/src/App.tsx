import { useEffect, useState } from "react"
import { fetchHealth } from "./api/health"
import { HealthStatus, type HealthViewState } from "./screens/HealthStatus"

export function App() {
  const [state, setState] = useState<HealthViewState>({ kind: "loading" })

  useEffect(() => {
    let isCurrent = true
    void fetchHealth().then((result) => {
      if (isCurrent) {
        setState(result)
      }
    })
    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold text-blue-700">Groundline</h1>
      <HealthStatus state={state} />
    </main>
  )
}
