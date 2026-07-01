import request from "@/common/utils/http";

export interface ConversionToolResponse {
  id: number;
  type: string;
  name: string;
  content?: string;
  delaySeconds?: number;
  pages?: string;
  isActive: boolean;
  views: number;
  clicks: number;
  imageUrl?: string;
  url?: string;
  status?: string;
  leads: number;
}

export const conversionToolApi = {
  getAll() {
    return request.get<ConversionToolResponse[]>({
      url: "/api/v1/conversion-tools",
    });
  },
  create(data: Partial<ConversionToolResponse>) {
    return request.post<ConversionToolResponse>({
      url: "/api/v1/conversion-tools",
      data,
    });
  },
  update(id: number, data: Partial<ConversionToolResponse>) {
    return request.put<ConversionToolResponse>({
      url: `/api/v1/conversion-tools/${id}`,
      data,
    });
  },
  delete(id: number) {
    return request.del<void>({
      url: `/api/v1/conversion-tools/${id}`,
    });
  },
};
