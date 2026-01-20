"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { th } from "date-fns/locale"; // นำเข้าภาษาไทย

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
}

export function DatePicker({ date, setDate, placeholder }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm", { locale: th }) : <span>{placeholder || "เลือกวันที่"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={th}
        />
        {/* ในเวอร์ชันนี้ Shadcn Calendar เลือกเวลาไม่ได้ เราอาจต้องทำ Input เวลาแยก หรือใช้ Library อื่นเพิ่ม */}
        {/* เพื่อความง่ายใน Tutorial นี้ เราจะเลือกแค่วันที่ก่อน แล้ว Hardcode เวลา หรือให้แก้ใน Input เอาได้ครับ */}
        <div className="p-3 border-t">
            <input 
                type="time" 
                className="w-full border rounded p-1"
                onChange={(e) => {
                    if (!date) return;
                    const [hours, minutes] = e.target.value.split(':');
                    const newDate = new Date(date);
                    newDate.setHours(parseInt(hours));
                    newDate.setMinutes(parseInt(minutes));
                    setDate(newDate);
                }}
            />
            <p className="text-xs text-gray-500 mt-1">*เลือกวันที่ด้านบน แล้วระบุเวลาที่นี่</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}