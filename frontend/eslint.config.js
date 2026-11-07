import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import { defineConfig, globalIgnores } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig([
  globalIgnores(["dist/", "src/api/schema.gen.ts"]),
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Backend enumerations reach the frontend through schema.gen.ts, never by hand.
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSEnumDeclaration",
          message:
            "Do not write enums: use generated API types, or a const object for UI-only state.",
        },
        {
          selector:
            "TSTypeAliasDeclaration TSUnionType > TSLiteralType > Literal[value=/.*/]",
          message:
            "Do not hand-write string-literal unions: use generated API types, or an inline union in useState for UI-only state.",
        },
      ],
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": ["error", { ignore: [-1, 0, 1] }],
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Evin's hand-built prototype (screens, mock API, copy). Its types are hand-written until the
    // backend's OpenAPI types land in schema.gen.ts; tighten this back as each screen is wired.
    files: [
      "src/App.tsx",
      "src/components.tsx",
      "src/copy.ts",
      "src/api/mockApi.ts",
      "src/api/types.ts",
      "src/screens/{Onboarding,TriggerScreen,HomeScreen,Briefs}.tsx",
      "src/screens/exported/**",
    ],
    rules: {
      "no-restricted-syntax": "off",
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
])
