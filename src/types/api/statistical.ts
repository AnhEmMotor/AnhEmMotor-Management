export namespace Statistical {
  export type RepairOrderStatus = 'Pending' | 'InProgress' | 'QcPending' | 'Completed' | 'Cancelled'

  // Response from: GET /api/v1/Statistics/dashboard-overview
  // Backend might return a subset; UI uses fallback mock if fields are missing.
  export interface AdminDashboardOverviewResponse {
    repairOrdersCount?: number
    techniciansCount?: number
    inProgressCount?: number
    completedCount?: number

    // Optional more detailed fields
    totalRepairOrders?: number
    totalTechnicians?: number
    completed?: number
  }
}

export type AdminDashboardOverviewResponse = Statistical.AdminDashboardOverviewResponse
