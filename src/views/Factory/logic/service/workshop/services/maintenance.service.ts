export type UploadCheckinImageResult =
  | {
      success: true;
      imageUrl: string;
    }
  | {
      success: false;
      message: string;
    };

export type CreateRepairOrderResult =
  | {
      success: true;
      data: {
        id: number;
        repairOrderCode: string;
        status: "InProgress" | "Received" | "Completed";
        createdAt: string;
      };
    }
  | {
      success: false;
      message: string;
    };

export type IssuePartsResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      message: string;
    };

export type IssuePartsPayloadItem = {
  // stub contract-first
  productId?: number;
  productVariantId?: number;
  skuCode?: string;
  quantityRequired: number;
};

// Vùng đệm (API contract first): không gọi axios trực tiếp ở View.
export const MaintenanceService = {
  async uploadCheckinImages(file: File): Promise<UploadCheckinImageResult> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!file) return { success: false, message: "File không hợp lệ" };

      return {
        success: true,
        imageUrl: URL.createObjectURL(file),
      };
    } catch (e: any) {
      return { success: false, message: e?.message || "Upload thất bại" };
    }
  },

  async createRepairOrder(payload: {
    licensePlate: string;
    customerName: string;
    currentOdo: number;
    packageId: string;
    ticketNotes?: string;
  }): Promise<CreateRepairOrderResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!payload.licensePlate || !payload.customerName) {
      return { success: false, message: "Thiếu thông tin bắt buộc" };
    }

    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 10000) + 1,
        repairOrderCode: `RO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "InProgress",
        createdAt: new Date().toISOString(),
      },
    };
  },

  async issueParts(
    repairOrderId: number,
    partsPayload: IssuePartsPayloadItem[],
  ): Promise<IssuePartsResult> {
    console.log("Payload gửi đi trừ kho:", { repairOrderId, partsPayload });

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!repairOrderId) {
      return { success: false, message: "Thiếu repairOrderId" };
    }

    return { success: true, message: "Trừ kho thành công trên hệ thống!" };
  },
};
