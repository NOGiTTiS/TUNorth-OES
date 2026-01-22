import axios from "axios"

// สร้าง Instance ของ Axios
// กำหนด URL ของ Backend (Go Fiber) ที่เราทำไว้
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8880/api", // อ่านจาก env ถ้าไม่มีใช้ default
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor: ทำงานก่อนส่ง Request ทุกครั้ง
api.interceptors.request.use((config) => {
  // ดึง Token จาก LocalStorage (ถ้ามี)
  const token = localStorage.getItem("token")
  if (token) {
    // แนบ Token ไปใน Header Authorization
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
