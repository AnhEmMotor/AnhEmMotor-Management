import request from "@/common/utils/http";

export interface PlateDossier {
  id: number;
  outputId?: number;
  dossierNumber: string;
  customerName: string;
  customerPhone: string;
  vehicleName?: string;
  vinNumber: string;
  status: string;
  licensePlate?: string;
  registrationFee: number;
  actualCost: number;
  serviceFee: number;
  notes?: string;
  createdAt: string;
  completedDate?: string;
}

export interface PlateDossierList {
  items: PlateDossier[];
  totalCount: number;
}

export interface CreatePlateDossierPayload {
  outputId?: number;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vinNumber: string;
  status: string;
  registrationFee: number;
  actualCost: number;
  serviceFee: number;
  notes?: string;
  completedDate?: string;
}

export interface UpdatePlateDossierPayload {
  id?: number;
  customerName: string;
  customerPhone: string;
  licensePlate: string;
  vinNumber: string;
  status: string;
  registrationFee: number;
  actualCost: number;
  serviceFee: number;
  notes?: string;
  completedDate?: string;
}

export interface UpdatePlateDossierStatusPayload {
  id: number;
  status: string;
  licensePlate?: string;
  registrationFee?: number;
  actualCost?: number;
  serviceFee?: number;
  notes?: string;
}

export const PlateDossierApi = {
  getList(params: any) {
    const { current, size, ...rest } = params;
    return request.get<PlateDossierList>({
      url: "/api/v1/PlateDossiers",
      params: {
        Page: current,
        PageSize: size,
        ...rest,
      },
    });
  },

  getDetail(id: number) {
    return request.get<PlateDossier>({
      url: `/api/v1/PlateDossiers/${id}`,
    });
  },

  create(data: CreatePlateDossierPayload) {
    return request.post<number>({
      url: "/api/v1/PlateDossiers",
      data,
    });
  },

  update(id: number, data: UpdatePlateDossierPayload) {
    return request.put<boolean>({
      url: `/api/v1/PlateDossiers/${id}`,
      data,
    });
  },

  updateStatus(data: UpdatePlateDossierStatusPayload) {
    return request.put<boolean>({
      url: "/api/v1/PlateDossiers/status",
      data,
    });
  },

  delete(id: number) {
    return request.del<boolean>({
      url: `/api/v1/PlateDossiers/${id}`,
    });
  },
};
