import type { HealthResult } from "../api/health"

export type HealthViewState = { kind: "loading" } | HealthResult

export function HealthStatus({ state }: { state: HealthViewState }) {
  switch (state.kind) {
    case "loading":
      return (
        <p role="status" className="mt-4 text-gray-700">
          Checking the health status…
        </p>
      )
    case "ok":
      return (
        <div role="status" className="mt-4 rounded border border-green-700 p-4">
          <p className="font-semibold text-green-800">
            API is up. Database query succeeded.
          </p>
          <p className="mt-2 text-gray-700">
            Schema objects in the database:{" "}
            <span>{state.health.schema_objects}</span>
          </p>
        </div>
      )
    case "database_failed":
      return (
        <div role="alert" className="mt-4 rounded border border-red-700 p-4">
          <p className="font-semibold text-red-800">
            API is up, but the database is not healthy.
          </p>
          <p className="mt-2 text-gray-700">{state.health.detail}</p>
        </div>
      )
    case "unavailable":
      return (
        <div role="alert" className="mt-4 rounded border border-red-700 p-4">
          <p className="font-semibold text-red-800">
            Could not get the health status.
          </p>
          <p className="mt-2 text-gray-700">{state.reason}</p>
        </div>
      )
  }
}
