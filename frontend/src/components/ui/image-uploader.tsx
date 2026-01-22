"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadService } from "@/services/upload.service";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // เช็คขนาดไฟล์ (เช่นไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์ขนาดใหญ่เกินไป (ต้องไม่เกิน 5MB)");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadService.uploadImage(file);
      onChange(url); // ส่ง URL กลับไปให้ Form
    } catch (error) {
      toast.error("อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      // Reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้ถ้าต้องการ
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {value ? (
        <div className="relative w-fit">
           <div className="relative h-32 w-32 rounded-md overflow-hidden border">
              <Image src={value} alt="Preview" fill className="object-cover" />
           </div>
           <button
             type="button"
             onClick={() => onChange("")} // ลบรูป
             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
           >
             <X className="h-3 w-3" />
           </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
          {uploading ? "กำลังอัปโหลด..." : "เพิ่มรูปภาพ"}
        </Button>
      )}
    </div>
  );
}