import { render, screen } from "@testing-library/react"
import { expect, test } from "vitest"
import { App } from "./App"

test("says it is a placeholder and shows no status", () => {
  render(<App />)

  expect(screen.getByRole("heading", { name: "Groundline" })).toBeVisible()
  expect(screen.getByText(/placeholder/i)).toBeVisible()
  expect(screen.queryByRole("status")).not.toBeInTheDocument()
})
