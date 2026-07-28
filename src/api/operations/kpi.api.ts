import request from "@/common/utils/http";

export interface KpiResponse {
  id: number;
  employeeId: number;
  employeeName: string;
  jobTitle: string;
  period: string;
  kpiName: string;
  target: string;
  score: number;
  targetValue: number;
  actualValue: number;
  periodStart: string;
  periodEnd: string;
  evaluatedAt: string;
  description?: string | null;
}

export interface KpiUpsertRequest {
  employeeProfileId: number;
  metricName: string;
  targetValue: number;
  actualValue: number;
  periodStart: string;
  periodEnd: string;
  description?: string | null;
}

export const kpiApi = {
  getAll() {
    return request.get<KpiResponse[]>({
      url: "/api/v1/hr/kpis",
    });
  },
  create(data: KpiUpsertRequest) {
    return request.post<number>({
      url: "/api/v1/hr/kpis",
      data,
    });
  },
  update(id: number, data: KpiUpsertRequest) {
    return request.put<number>({
      url: `/api/v1/hr/kpis/${id}`,
      data,
    });
  },
  delete(id: number) {
    return request.del<number>({
      url: `/api/v1/hr/kpis/${id}`,
    });
  },
};
