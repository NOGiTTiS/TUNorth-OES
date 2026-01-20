import { Button } from "@/components/ui/button"; // เดี๋ยวเราจะสร้างปุ่มนี้ในขั้นถัดไป

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-white">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-blue-900 tracking-tight">
          TUNorth-OES
        </h1>
        <p className="text-lg text-gray-500">
          ระบบจัดสอบออนไลน์ โรงเรียนเตรียมอุดมศึกษา ภาคเหนือ
        </p>
      </div>
      
      <div className="flex gap-4">
        {/* ใช้ Class ของ Tailwind ปกติไปก่อน เพราะเรายังไม่ได้ดึง Button component มา */}
        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
          เข้าสู่ระบบ
        </button>
        <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
          คู่มือการใช้งาน
        </button>
      </div>
      
      <div className="absolute bottom-4 text-sm text-gray-400">
        Powered by Bun & Next.js 16
      </div>
    </div>
  );
}