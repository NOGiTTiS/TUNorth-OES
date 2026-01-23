"use client"

import { useState, useEffect } from "react"
import api from "@/lib/axios"

export interface PublicSettings {
  system_name: string
  system_description: string
  copyright: string
  register_enabled: boolean
  logo_url: string
  favicon_url: string
  main_color: string
  second_color: string
  bg_gradient_start: string
  bg_gradient_end: string
  style: string
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // We use a public endpoint that doesn't require auth
        const res = await api.get("/settings/public")
        setSettings(res.data)
      } catch (error) {
        console.error("Failed to fetch public settings", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading }
}
