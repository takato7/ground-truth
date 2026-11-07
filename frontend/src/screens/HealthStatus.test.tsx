import { render, screen } from "@testing-library/react"
import { afterEach, expect, test, vi } from "vitest"
import { HealthStatus } from "./HealthStatus"

afterEach(() => {
  vi.unstubAllGlobals()
})

test("renders from props alone and does no fetching", () => {
  const fetchStub = vi.fn<typeof fetch>()
  vi.stubGlobal("fetch", fetchStub)

  render(<HealthStatus state={{ kind: "loading" }} />)

  expect(screen.getByRole("status")).toHaveTextContent(/checking/i)
  expect(fetchStub).not.toHaveBeenCalled()
})
