import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import "./globals.css"
// 1. นำเข้า Toaster และ SystemProvider
import { Toaster } from "@/components/ui/sonner"
import { SystemProvider } from "@/components/providers/system-provider"

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TUNorth-OES | ระบบจัดสอบออนไลน์",
  description: "ระบบจัดสอบออนไลน์ โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.className} antialiased min-h-screen bg-slate-50`}
      >
        <SystemProvider>
          {children}
          <Toaster position="top-center" richColors />
        </SystemProvider>
      </body>
    </html>
  )
}
