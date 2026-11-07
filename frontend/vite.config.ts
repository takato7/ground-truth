import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const PROXY_TARGET_VAR = "API_PROXY_TARGET"
const PROXY_PROTOCOLS = ["http:", "https:"]

function apiProxyTarget(): string {
  const target = process.env[PROXY_TARGET_VAR]
  if (!target) {
    throw new Error(
      `${PROXY_TARGET_VAR} is required to run the dev server (the backend URL, such as http://localhost:8041). Compose sets it; see the README for local dev.`,
    )
  }
  if (
    !URL.canParse(target) ||
    !PROXY_PROTOCOLS.includes(new URL(target).protocol)
  ) {
    throw new Error(
      `${PROXY_TARGET_VAR} must be an http(s) URL, got "${target}".`,
    )
  }
  return target
}

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss()],
  // Only the dev server proxies: vitest and builds must work without any configuration.
  server:
    command === "serve" && mode !== "test"
      ? { proxy: { "/api": apiProxyTarget() } }
      : undefined,
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
}))
