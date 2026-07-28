import request from "@/common/utils/http";

export interface PayrollSummaryResponse {
  employeeId: number;
  fullName: string;
  jobTitle: string;
  baseSalary: number;
  pendingCommission: number;
  confirmedCommission: number;
  paidCommission: number;
  totalActualReceived: number;
  kpiBonus: number;
  volumeBonus?: number;
  /** Full salary for the selected month: base salary + eligible commission + volume bonus. */
  totalNetPayable: number;
}

export interface PayrollListItem {
  id: number;
  employeeId: number;
  employeeName: string;
  jobTitle: string;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  penalty: number;
  totalSalary: number;
  status: string;
  approvedAt: string | null;
}

export interface PayrollStatistics {
  totalPayroll: number;
  paid: number;
  pending: number;
  employeeCount: number;
}

export const payrollApi = {
  getSummary(month: number, year: number) {
    return request.get<PayrollSummaryResponse[]>({
      url: `/api/v1/hr/payroll/summary?month=${month}&year=${year}`,
    });
  },
  getList(params?: { month?: number; year?: number; status?: string }) {
    return request.get<PayrollListItem[]>({
      url: "/api/v1/hr/payroll",
      params,
    });
  },
  getStatistics(month: number, year: number) {
    return request.get<PayrollStatistics>({
      url: `/api/v1/hr/payroll/statistics?month=${month}&year=${year}`,
    });
  },
  approve(id: number) {
    return request.post<void>({
      url: `/api/v1/hr/payroll/${id}/approve`,
    });
  },
  approveCommissions(employeeId: number | null, month: number, year: number) {
    return request.post<void>({
      url: "/api/v1/hr/commissions/approve-payroll",
      data: { employeeId, month, year },
    });
  },
};
