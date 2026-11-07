import type { components } from "./schema.gen"

type HealthOk = components["schemas"]["HealthOk"]
type HealthFailed = components["schemas"]["HealthFailed"]

export type HealthResult =
  | { kind: "ok"; health: HealthOk }
  | { kind: "database_failed"; health: HealthFailed }
  | { kind: "unavailable"; reason: string }

const HEALTH_URL = "/api/health"
const HTTP_OK = 200
const HTTP_SERVICE_UNAVAILABLE = 503

// Anything but a declared status with its declared body is an error, never a success: with the
// backend down, the dev server's proxy answers with its own 5xx instead of a network failure.
export async function fetchHealth(): Promise<HealthResult> {
  let response: Response
  try {
    response = await fetch(HEALTH_URL)
  } catch {
    return { kind: "unavailable", reason: "The API could not be reached." }
  }

  const unexpected: HealthResult = {
    kind: "unavailable",
    reason: `The API gave an unexpected response (HTTP ${response.status}).`,
  }
  try {
    const body = (await response.json()) as HealthOk | HealthFailed
    if (
      response.status === HTTP_OK &&
      body.status === "ok" &&
      typeof body.schema_objects === "number"
    ) {
      return { kind: "ok", health: body }
    }
    if (
      response.status === HTTP_SERVICE_UNAVAILABLE &&
      body.status === "database_check_failed"
    ) {
      return { kind: "database_failed", health: body }
    }
    return unexpected
  } catch {
    return unexpected
  }
}
