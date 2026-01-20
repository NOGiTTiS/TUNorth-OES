import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
// 1. นำเข้า Toaster
import { Toaster } from "@/components/ui/sonner"; 

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TUNorth-OES | ระบบจัดสอบออนไลน์",
  description: "ระบบจัดสอบออนไลน์ โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${prompt.className} antialiased min-h-screen bg-slate-50`}>
        {children}
        
        {/* 2. วาง Toaster ไว้ล่างสุดของ Body */}
        <Toaster position="top-center" richColors /> 
      </body>
    </html>
  );
}