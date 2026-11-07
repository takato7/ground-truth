// @vitest-environment node
import { afterEach, describe, expect, test, vi } from "vitest"
import type { ConfigEnv, UserConfig } from "vite"
import viteConfig from "./vite.config"

const PROXY_VAR = "API_PROXY_TARGET"
const TARGET = "http://backend:8041"

function configFor(env: Partial<ConfigEnv>): UserConfig {
  return viteConfig({ command: "serve", mode: "development", ...env })
}

describe("vite config", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test("the dev server proxies /api to the configured target", () => {
    vi.stubEnv(PROXY_VAR, TARGET)
    expect(configFor({}).server?.proxy).toEqual({ "/api": TARGET })
  })

  test.each([
    ["missing", undefined],
    ["empty", ""],
    ["not a URL", "backend:8041"],
    ["not http", "ftp://backend:8041"],
  ])("the dev server fails naming the target when it is %s", (_name, value) => {
    vi.stubEnv(PROXY_VAR, value)
    expect(() => configFor({})).toThrow(PROXY_VAR)
  })

  test.each([
    ["vitest", { mode: "test" }],
    ["a production build", { command: "build", mode: "production" }],
  ] satisfies [string, Partial<ConfigEnv>][])(
    "%s needs no target",
    (_name, env) => {
      vi.stubEnv(PROXY_VAR, undefined)
      expect(configFor(env).server?.proxy).toBeUndefined()
    },
  )
})
