import {
  MaintenancePackage,
  MaintenancePartsLine,
  MaintenanceTicket,
  MaintenanceWorkflowStatus,
} from "@/domain/maintenance/types";

import { RepairOrderApi, type RepairOrderDetail } from "@/api/sales";
import { MaintenanceApi } from "@/api/service/maintenance.api";

export type MaintenanceWorkflowPayload = {
  status: MaintenanceWorkflowStatus;
  qcNote?: string;
  paymentMethod?: string;
};

export interface GetMaintenanceTicketQuery {
  ticketId: number;
}

export interface GetMaintenanceTicketUseCase {
  execute(query: GetMaintenanceTicketQuery): Promise<MaintenanceTicket>;
}

export interface CreateMaintenanceTicketUseCase {
  execute(payload: {
    licensePlate: string;
    customerName: string;
    currentOdo: number;
    packageId: string;
  }): Promise<MaintenanceTicket>;
}

export interface UpdateOdoAndGenerateWarningsUseCase {
  execute(payload: {
    ticketId: number;
    currentOdo: number;
  }): Promise<MaintenanceTicket>;
}

export interface ApplyMaintenancePackageUseCase {
  execute(payload: {
    ticketId: number;
    packageId: string;
  }): Promise<MaintenanceTicket>;
}

export interface IssuePartsUseCase {
  execute(payload: {
    ticketId: number;
    parts: MaintenancePartsLine[];
  }): Promise<MaintenanceTicket>;
}

export interface ChangeWorkflowStatusUseCase {
  execute(
    payload: { ticketId: number } & MaintenanceWorkflowPayload,
  ): Promise<void>;
}

// -------------------- Mock data helpers --------------------

function computeWarningsByOdo(
  odo: number,
): Array<{ level: "warning" | "danger"; targetKm: number; message: string }> {
  const res: Array<{
    level: "warning" | "danger";
    targetKm: number;
    message: string;
  }> = [];

  // Ví dụ rules theo Backup.md: 4.000 km nhắc thay nhớt; 10.000 km nhắc lọc gió + bugi + vệ sinh nồi.
  const targets = [4000, 10000];

  for (const km of targets) {
    if (odo >= km) {
      if (km === 4000) {
        res.push({
          level: "warning",
          targetKm: km,
          message: "Xe đã chạy quá 4.000km chưa thay nhớt máy.",
        });
      }
      if (km === 10000) {
        res.push({
          level: "danger",
          targetKm: km,
          message: "Đến mốc thay lọc gió quy chuẩn (Mốc 10.000km).",
        });
      }
    }
  }

  return res;
}

function getPackageTemplates(): MaintenancePackage[] {
  return [
    {
      id: "pkg_1000",
      name: "Gói 1.000km",
      targetKm: 1000,
      laborCost: 80000,
      discount: 0,
      checklist: [
        {
          id: "c_brake",
          name: "Kiểm tra hệ thống phanh trước/sau",
          done: false,
        },
        { id: "c_tire", name: "Kiểm tra áp suất lốp", done: false },
        { id: "c_coolant", name: "Kiểm tra nước làm mát", done: false },
      ],
    },
    {
      id: "pkg_5000",
      name: "Gói 5.000km",
      targetKm: 5000,
      laborCost: 120000,
      discount: 0,
      checklist: [
        { id: "c_oil", name: "Thay nhớt máy (theo mốc)", done: false },
        { id: "c_filter", name: "Kiểm tra/bảo dưỡng lọc gió", done: false },
        { id: "c_battery", name: "Kiểm tra ắc quy & điện", done: false },
      ],
    },
    {
      id: "pkg_10000",
      name: "Gói 10.000km",
      targetKm: 10000,
      laborCost: 120000,
      discount: 120000, // mô phỏng “giảm giá công thợ theo chính sách thành viên”
      checklist: [
        {
          id: "c_brake",
          name: "Kiểm tra hệ thống phanh trước/sau",
          done: false,
        },
        { id: "c_tire", name: "Kiểm tra áp suất lốp", done: false },
        {
          id: "c_air_filter",
          name: "Thay thế lọc gió (Khách đã chốt thay [✓])",
          done: false,
        },
      ],
    },
    {
      id: "pkg_15000",
      name: "Gói 15.000km",
      targetKm: 15000,
      laborCost: 160000,
      discount: 0,
      checklist: [
        { id: "c_spark", name: "Kiểm tra bugi", done: false },
        {
          id: "c_engine",
          name: "Vệ sinh nồi/đường dầu (tùy mốc)",
          done: false,
        },
        {
          id: "c_brake",
          name: "Kiểm tra hệ thống phanh trước/sau",
          done: false,
        },
      ],
    },
  ];
}

function applyPackage(
  ticket: MaintenanceTicket,
  pkg: MaintenancePackage,
): MaintenanceTicket {
  return {
    ...ticket,
    selectedPackage: pkg,
    checklist: pkg.checklist.map((c) => ({ ...c })),
    laborCost: pkg.laborCost,
    discount: pkg.discount,
  };
}

// -------------------- Real implementations (temporary) --------------------

export class RealGetMaintenanceTicketUseCase implements GetMaintenanceTicketUseCase {
  async execute(query: GetMaintenanceTicketQuery): Promise<MaintenanceTicket> {
    const detail = await MaintenanceApi.getDetail(query.ticketId);

    const odo = detail.mileage;
    const lastOdoBefore = detail.mileage;

    const warnings = computeWarningsByOdo(odo).map((w, idx) => ({
      id: `${detail.id}_w_${idx}`,
      level: w.level,
      targetKm: w.targetKm,
      message: w.message,
    }));

    const parts = detail.parts.map((p, idx) => ({
      id: `part_detail_${idx}`,
      partName: p.partName,
      productVariantId: 0,
      availableQuantity: 999,
      requiredQuantity: 1,
      unitPrice: p.unitPrice,
      total: p.unitPrice,
    }));

    const packages = getPackageTemplates();
    const pkg = packages.find((p) => odo >= p.targetKm) || packages[0];

    return {
      id: detail.id,
      ticketCode: detail.maintenanceNumber,
      licensePlate: detail.vehiclePlate,
      customerName: detail.customerName,
      vehicleModelName:
        `${detail.vehicleColor || ""} ${detail.vehicleYear || ""}`.trim() ||
        undefined,
      odoHistory: [],
      currentOdo: odo,
      lastOdoBefore,
      warnings,
      selectedPackage: pkg,
      checklist: pkg.checklist.map((c) => ({ ...c })),
      parts,
      laborCost: detail.laborCost,
      discount: 0,
      workflowStatus: "Received",
    };
  }
}

export class RealCreateMaintenanceTicketUseCase implements CreateMaintenanceTicketUseCase {
  async execute(payload: {
    licensePlate: string;
    customerName: string;
    currentOdo: number;
    packageId: string;
  }): Promise<MaintenanceTicket> {
    const packages = getPackageTemplates();
    const pkg = packages.find((p) => p.id === payload.packageId) || packages[0];

    const id = await MaintenanceApi.create({
      licensePlate: payload.licensePlate,
      description: `Bảo dưỡng định kỳ ${pkg.name}`,
      mileage: payload.currentOdo,
      laborCost: pkg.laborCost,
      parts: [],
    });

    return new RealGetMaintenanceTicketUseCase().execute({ ticketId: id });
  }
}

export class RealUpdateOdoAndGenerateWarningsUseCase implements UpdateOdoAndGenerateWarningsUseCase {
  async execute(payload: {
    ticketId: number;
    currentOdo: number;
  }): Promise<MaintenanceTicket> {
    await MaintenanceApi.updateOdo(payload.ticketId, payload.currentOdo);
    return new RealGetMaintenanceTicketUseCase().execute({
      ticketId: payload.ticketId,
    });
  }
}

export class RealApplyMaintenancePackageUseCase implements ApplyMaintenancePackageUseCase {
  async execute(payload: {
    ticketId: number;
    packageId: string;
  }): Promise<MaintenanceTicket> {
    const ticket = await new RealGetMaintenanceTicketUseCase().execute({
      ticketId: payload.ticketId,
    });
    const packages = getPackageTemplates();
    const pkg = packages.find((p) => p.id === payload.packageId) || packages[0];
    return applyPackage(ticket, pkg);
  }
}

export class RealIssuePartsUseCase implements IssuePartsUseCase {
  async execute(payload: {
    ticketId: number;
    parts: MaintenancePartsLine[];
  }): Promise<MaintenanceTicket> {
    return new RealGetMaintenanceTicketUseCase().execute({
      ticketId: payload.ticketId,
    });
  }
}

export class RealChangeWorkflowStatusUseCase implements ChangeWorkflowStatusUseCase {
  async execute(
    payload: { ticketId: number } & MaintenanceWorkflowPayload,
  ): Promise<void> {
    // Workflow status mapping for API
  }
}
