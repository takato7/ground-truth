import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { MotionGlobalConfig } from "motion/react"
import { afterEach } from "vitest"

// Animations finish instantly in tests, so exits and step changes don't need waiting on.
MotionGlobalConfig.skipAnimations = true

afterEach(cleanup)
