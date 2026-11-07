// @vitest-environment node
import { ESLint } from "eslint"
import { describe, expect, test } from "vitest"

const LINT_TIMEOUT_MS = 30_000
// A real file, so the type-aware rules can find it in the TypeScript project.
const LINTED_PATH = "src/App.test.tsx"

async function ruleIdsFor(code: string): Promise<(string | null)[]> {
  const [result] = await new ESLint().lintText(code, {
    filePath: LINTED_PATH,
  })
  return result.messages.map((message) => message.ruleId)
}

describe("ESLint rejects", () => {
  test.each([
    [
      "a hand-written string-literal union",
      'export type Colour = "red" | "blue"\n',
      "no-restricted-syntax",
    ],
    ["an enum", "export enum Colour { Red, Blue }\n", "no-restricted-syntax"],
    [
      "a magic number",
      "export const area = (width: number) => width * 42\n",
      "@typescript-eslint/no-magic-numbers",
    ],
    [
      "a promise-returning click handler",
      "const save = async () => {}\nexport const props = { onClick: save } satisfies { onClick: () => void }\n",
      "@typescript-eslint/no-misused-promises",
    ],
    [
      "an explicit any",
      "export const value = 1 as any\n",
      "@typescript-eslint/no-explicit-any",
    ],
  ])(
    "%s",
    async (_name, code, ruleId) => {
      expect(await ruleIdsFor(code)).toContain(ruleId)
    },
    LINT_TIMEOUT_MS,
  )

  test(
    "nothing in an inline union in a generic argument",
    async () => {
      const code =
        'import { useState } from "react"\nexport const useTab = () => useState<"a" | "b">("a")\n'
      expect(await ruleIdsFor(code)).not.toContain("no-restricted-syntax")
    },
    LINT_TIMEOUT_MS,
  )
})
