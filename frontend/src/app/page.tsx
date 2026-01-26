"use client";

import Link from "next/link";
import { BookOpen, CheckCircle, Shield, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSystemSettings } from "@/hooks/use-system-settings"

export default function LandingPage() {
  const { settings } = useSystemSettings();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <header className="border-b py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            TUNorth-OES
          </div>
          <div className="space-x-4">
             <Link href="/login">
                <Button variant="outline">เข้าสู่ระบบ</Button>
             </Link>
             <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90">สมัครสมาชิก</Button>
             </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6 leading-tight">
              ระบบจัดสอบออนไลน์ <br />
              <span className="text-primary">โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              แพลตฟอร์มการสอบที่ทันสมัย ใช้งานง่าย รองรับการสอบวัดผล
              และการสอบคัดเลือก ด้วยมาตรฐานความปลอดภัยสูง
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-blue-200">
                  เริ่มต้นใช้งาน
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-10">
              <FeatureCard 
                icon={<Shield className="h-10 w-10 text-green-500" />}
                title="ปลอดภัย & เชื่อถือได้"
                desc="ระบบยืนยันตัวตนที่ปลอดภัย ป้องกันการทุจริต และเก็บรักษาข้อมูลอย่างเป็นความลับ"
              />
              <FeatureCard 
                icon={<BookOpen className="h-10 w-10 text-blue-500" />}
                title="คลังข้อสอบอัจฉริยะ"
                desc="ระบบจัดการคลังข้อสอบ รองรับการสุ่มโจทย์ และวิเคราะห์ความยากง่าย"
              />
              <FeatureCard 
                icon={<Trophy className="h-10 w-10 text-yellow-500" />}
                title="รู้ผลทันที"
                desc="ประมวลผลคะแนนอัตโนมัติ รวดเร็ว แม่นยำ พร้อมดูประวัติการสอบย้อนหลังได้"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="container mx-auto px-6 text-center">
          <p>{settings?.copyright}</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 border rounded-xl hover:shadow-lg transition-shadow">
      <div className="mb-4 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}