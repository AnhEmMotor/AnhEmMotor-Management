import request from "@/utils/http";

export interface PlateDossier {
  id: number;
  outputId: number;
  customerName?: string;
  customerPhone?: string;
  vehicleName?: string;
  status: "Prepare" | "TaxPaid" | "PlateAssigned" | "WaitingCard" | "Completed";
  licensePlate?: string;
  registrationFee: number;
  actualCost: number;
  serviceFee: number;
  notes?: string;
  createdAt: string;
}

export interface PlateDossierList {
  items: PlateDossier[];
  totalCount: number;
}

export interface CreatePlateDossierPayload {
  outputId: number;
  registrationFee: number;
  actualCost: number;
  serviceFee: number;
  notes?: string;
  licensePlate?: string;
}

export interface UpdatePlateDossierStatusPayload {
  id: number;
  status: "Prepare" | "TaxPaid" | "PlateAssigned" | "WaitingCard" | "Completed";
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

  create(data: CreatePlateDossierPayload) {
    return request.post<number>({
      url: "/api/v1/PlateDossiers",
      data,
    });
  },

  updateStatus(data: UpdatePlateDossierStatusPayload) {
    return request.put<boolean>({
      url: "/api/v1/PlateDossiers/status",
      data,
    });
  },
};
