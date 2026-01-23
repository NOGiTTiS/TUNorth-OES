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

      // Update CSS Variables for Theme
      const root = document.documentElement
      if (settings.main_color) {
        root.style.setProperty("--primary", settings.main_color)
        root.style.setProperty("--sidebar-primary", settings.main_color)
      }

      if (settings.second_color) {
        root.style.setProperty("--secondary", settings.second_color)
      }

      if (settings.bg_gradient_start)
        root.style.setProperty("--gradient-start", settings.bg_gradient_start)
      if (settings.bg_gradient_end)
        root.style.setProperty("--gradient-end", settings.bg_gradient_end)
    }
  }, [settings])

  return <>{children}</>
}
