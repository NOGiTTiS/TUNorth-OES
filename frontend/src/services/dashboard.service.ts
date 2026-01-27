import api from "@/lib/axios"
import { DashboardStats } from "@/types/dashboard"

export const dashboardService = {
  getStats: async () => {
    const response = await api.get<DashboardStats>("/dashboard/stats")
    return response.data
  },
}
