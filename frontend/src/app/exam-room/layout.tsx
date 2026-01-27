export default function ExamRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header เรียบๆ แสดงแค่ชื่อระบบ */}
      <header className="h-16 bg-white border-b shadow-sm flex items-center px-6 justify-between z-10">
        <div className="font-bold text-xl text-primary">TUNorth-OES | ห้องสอบ</div>
        <div className="text-sm text-gray-500">โหมดการสอบแบบ Focus</div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-5xl">
        {children}
      </main>
    </div>
  );
}