import request from "@/common/utils/http";

export interface KpiResponse {
  employeeId: number;
  employeeName: string;
  period: string;
  kpiName: string;
  target: string;
  score: number;
  evaluatedAt: string;
}

export const kpiApi = {
  getAll() {
    return request.get<KpiResponse[]>({
      url: "/api/v1/hr/kpis",
    });
  },
};
