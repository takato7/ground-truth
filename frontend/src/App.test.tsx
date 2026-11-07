import { render, screen } from "@testing-library/react"
import { afterEach, expect, test, vi } from "vitest"
import type { components } from "./api/schema.gen"
import { App } from "./App"

const HTTP_OK = 200
const HTTP_BAD_GATEWAY = 502
const HTTP_SERVICE_UNAVAILABLE = 503
const SCHEMA_OBJECTS = 7

const HEALTH_OK: components["schemas"]["HealthOk"] = {
  status: "ok",
  api: "up",
  schema_objects: SCHEMA_OBJECTS,
}
const HEALTH_FAILED: components["schemas"]["HealthFailed"] = {
  status: "database_check_failed",
  api: "up",
  detail: "Database check failed: the database could not be opened or queried.",
}

function stubFetch(result: Response | Error) {
  const fetchStub = vi.fn<typeof fetch>(() =>
    result instanceof Error ? Promise.reject(result) : Promise.resolve(result),
  )
  vi.stubGlobal("fetch", fetchStub)
  return fetchStub
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test("shows the status and count from the API, fetched from the same origin", async () => {
  const fetchStub = stubFetch(jsonResponse(HEALTH_OK, HTTP_OK))

  render(<App />)

  const status = await screen.findByText(/database query succeeded/i)
  expect(status).toBeVisible()
  expect(screen.getByText(`${SCHEMA_OBJECTS}`)).toBeVisible()
  expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  expect(fetchStub).toHaveBeenCalledWith("/api/health")
})

test("shows an error with the API's detail on a 503", async () => {
  stubFetch(jsonResponse(HEALTH_FAILED, HTTP_SERVICE_UNAVAILABLE))

  render(<App />)

  const alert = await screen.findByRole("alert")
  expect(alert).toHaveTextContent(HEALTH_FAILED.detail)
  expect(screen.queryByText(/query succeeded/i)).not.toBeInTheDocument()
})

test.each([
  ["a network failure", new TypeError("Failed to fetch")],
  [
    "the proxy's error when the backend is down",
    new Response("", { status: HTTP_BAD_GATEWAY }),
  ],
  [
    "a 200 that is not JSON",
    new Response("<!doctype html>", { status: HTTP_OK }),
  ],
  ["a 200 that does not say ok", jsonResponse(HEALTH_FAILED, HTTP_OK)],
])("shows an error on %s", async (_name, result) => {
  stubFetch(result)

  render(<App />)

  const alert = await screen.findByRole("alert")
  expect(alert).toHaveTextContent(/could not get the health status/i)
  expect(screen.queryByText(/query succeeded/i)).not.toBeInTheDocument()
})
