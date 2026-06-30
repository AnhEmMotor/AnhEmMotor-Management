import request from "@/common/utils/http";

export interface ComplaintListItem {
  id: number;
  complaintNumber: string;
  customerName?: string;
  customerPhone?: string;
  vehiclePlate?: string;
  complaintType?: string;
  statusText: string;
  createdAt: string;
}

export interface ComplaintDetail {
  id: number;
  complaintNumber: string;
  customerName?: string;
  customerPhone?: string;
  vehiclePlate?: string;
  complaintType?: string;
  statusText: string;
  createdAt: string;
  subject?: string;
  rating?: number;
  responseHours?: number | null;
}

export interface CustomerServiceAnalyticsResponse {
  kpi: {
    avgRating: number;
    newComplaints: number;
    avgResponseHours: number;
    resolvedCount: number;
  };
  complaints: Array<{
    id: number;
    ticketCode: string;
    customerName: string;
    subject: string;
    rating: number;
    status: string;
    createdAt: string;
    responseHours?: number;
  }>;
}

export const ComplaintApi = {
  async getList(params: {
    current: number;
    size: number;
    filters?: string;
  }): Promise<{ items: ComplaintListItem[]; totalCount: number }> {
    const res = await request.get<CustomerServiceAnalyticsResponse>({
      url: "/api/v1/statistics/customer-service-analytics",
    });

    let complaints = (res.complaints ?? []).map((c) => ({
      id: c.id,
      complaintNumber: c.ticketCode || `#${c.id}`,
      customerName: c.customerName,
      customerPhone: "",
      vehiclePlate: "",
      complaintType: c.subject || "",
      statusText: c.status || "",
      createdAt: c.createdAt || "",
    }));

    if (params.filters) {
      const filterParts = params.filters.split(",");
      for (const part of filterParts) {
        const [key, value] = part.split("==");
        if (key === "search" && value) {
          const q = value.toLowerCase();
          complaints = complaints.filter(
            (c) =>
              (c.customerName ?? "").toLowerCase().includes(q) ||
              (c.complaintNumber ?? "").toLowerCase().includes(q) ||
              (c.complaintType ?? "").toLowerCase().includes(q),
          );
        }
        if (key === "status" && value) {
          complaints = complaints.filter((c) => c.statusText === value);
        }
      }
    }

    const total = complaints.length;
    const start = (params.current - 1) * params.size;
    const paged = complaints.slice(start, start + params.size);

    return { items: paged, totalCount: total };
  },

  async getById(id: number): Promise<ComplaintDetail> {
    const res = await request.get<CustomerServiceAnalyticsResponse>({
      url: "/api/v1/statistics/customer-service-analytics",
    });
    const c = (res.complaints ?? []).find((x) => x.id === id);
    if (!c) throw new Error("Not found");
    return {
      id: c.id,
      complaintNumber: c.ticketCode || `#${c.id}`,
      customerName: c.customerName,
      customerPhone: "",
      vehiclePlate: "",
      complaintType: c.subject || "",
      statusText: c.status || "",
      createdAt: c.createdAt || "",
      subject: c.subject,
      rating: c.rating,
      responseHours: c.responseHours ?? null,
    };
  },
};
