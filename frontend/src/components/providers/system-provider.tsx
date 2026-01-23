"use client"

import { useEffect } from "react"
import { useSystemSettings } from "@/hooks/use-system-settings"

export function SystemProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSystemSettings()

  useEffect(() => {
    if (settings) {
      // Update Title
      if (settings.system_name) {
        document.title = settings.system_name
      }

      // Update Favicon
      if (settings.favicon_url) {
        const link: HTMLLinkElement | null =
          document.querySelector("link[rel*='icon']") ||
          document.createElement("link")
        link.type = "image/x-icon"
        link.rel = "shortcut icon"
        link.href = settings.favicon_url
        document.getElementsByTagName("head")[0].appendChild(link)
      }

      // Update CSS Variables for Theme (Optional but nice)
      const root = document.documentElement
      if (settings.main_color)
        root.style.setProperty("--primary", settings.main_color)
      // We can add more theme variable updates here
    }
  }, [settings])

  return <>{children}</>
}
