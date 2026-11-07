import { BatteryFull, Signal, Wifi } from "lucide-react"
import type { ReactNode } from "react"
import "./DeviceFrame.css"

/** Time and status icons either side of the Dynamic Island. Decorative. */
function StatusBar() {
  return (
    <div className="status-bar" aria-hidden>
      <span className="status-time">9:41</span>
      <span className="status-icons">
        <Signal size={17} strokeWidth={2.6} />
        <Wifi size={17} strokeWidth={2.6} />
        <BatteryFull size={24} strokeWidth={2} />
      </span>
    </div>
  )
}

/**
 * The demo's iPhone 16 (from the team's Figma mockup). The frame SVG sits underneath; the
 * screen sits on top, clipped by the frame's screen matte, which also cuts out the island.
 * `screenKey` remounts the screen (the dev bar uses it to reset a scenario).
 */
export function DeviceFrame({
  screenKey,
  children,
}: {
  screenKey?: number
  children: ReactNode
}) {
  return (
    <div className="device">
      <img
        className="device-frame"
        src="/device/iphone-frame.svg"
        alt=""
        aria-hidden
      />
      <div className="phone" key={screenKey}>
        <StatusBar />
        {children}
      </div>
    </div>
  )
}
