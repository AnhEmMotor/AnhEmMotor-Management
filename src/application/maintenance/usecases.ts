import {
  MaintenancePackage,
  MaintenancePartsLine,
  MaintenanceTicket,
  MaintenanceWorkflowStatus,
} from "@/domain/maintenance/types";

import { RepairOrderApi, type RepairOrderDetail } from "@/api/repair-order.api";

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
    const ro = await RepairOrderApi.getDetail(query.ticketId);

    const odo = ro?.mileage ?? 0;
    const lastOdoBefore = odo;

    const packages = getPackageTemplates();
    const pkg = packages.find((p) => p.id === "pkg_10000") || packages[0];

    const warnings = computeWarningsByOdo(odo).map((w, idx) => ({
      id: `${query.ticketId}_w_${idx}`,
      level: w.level,
      targetKm: w.targetKm,
      message: w.message,
    }));

    const parts = (ro?.details || [])
      .filter((d: RepairOrderDetail) => d.type === "Part")
      .map((d: RepairOrderDetail) => ({
        id: `ro_detail_${d.id}`,
        partName: d.variantName || d.productCode || "Part",
        productVariantId: d.productVariantId,
        availableQuantity: 0,
        requiredQuantity: d.count,
        unitPrice: d.price,
        total: d.count * d.price,
      }));

    const laborCost = ro?.laborCost ?? pkg.laborCost;

    return {
      id: ro?.id ?? query.ticketId,
      ticketCode: `RO-${new Date().getFullYear()}-${String(ro?.id ?? query.ticketId).padStart(4, "0")}`,
      licensePlate: ro?.licensePlate,
      customerName: ro?.customerName,
      vehicleModelName: ro?.vehicle?.modelName || undefined,

      odoHistory: [],
      currentOdo: odo,
      lastOdoBefore,

      warnings,
      selectedPackage: pkg,
      checklist: pkg.checklist.map((c) => ({ ...c })),

      parts,
      laborCost,
      discount: 0,

      workflowStatus:
        ro?.status === "Pending"
          ? "Received"
          : ro?.status === "InProgress"
            ? "InProgress"
            : ro?.status === "QcPending"
              ? "QcPending"
              : ro?.status === "Completed"
                ? "Completed"
                : "Received",
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

    const warnings = computeWarningsByOdo(payload.currentOdo).map((w, idx) => ({
      id: `new_w_${idx}`,
      level: w.level,
      targetKm: w.targetKm,
      message: w.message,
    }));

    const ticket: MaintenanceTicket = {
      id: Math.floor(Math.random() * 9000) + 1000,
      ticketCode: `RO-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,

      licensePlate: payload.licensePlate,
      customerName: payload.customerName,
      vehicleModelName: "Honda",

      odoHistory: [],
      currentOdo: payload.currentOdo,
      lastOdoBefore: payload.currentOdo,

      warnings,
      selectedPackage: pkg,
      checklist: pkg.checklist.map((c) => ({ ...c })),

      parts: [],
      laborCost: pkg.laborCost,
      discount: pkg.discount,

      workflowStatus: "Received",
    };

    return ticket;
  }
}

export class RealUpdateOdoAndGenerateWarningsUseCase implements UpdateOdoAndGenerateWarningsUseCase {
  async execute(payload: {
    ticketId: number;
    currentOdo: number;
  }): Promise<MaintenanceTicket> {
    // TODO: chèn rule “ODO không cho nhập lùi” cần lastOdoBefore từ ticket.
    const ticket = await new RealGetMaintenanceTicketUseCase().execute({
      ticketId: payload.ticketId,
    });

    if (payload.currentOdo < (ticket.lastOdoBefore ?? 0)) {
      throw new Error(
        "ODO không được nhỏ hơn ODO của lần bảo dưỡng liền trước.",
      );
    }

    const warnings = computeWarningsByOdo(payload.currentOdo).map((w, idx) => ({
      id: `w_${idx}`,
      level: w.level,
      targetKm: w.targetKm,
      message: w.message,
    }));

    return {
      ...ticket,
      currentOdo: payload.currentOdo,
      warnings,
    };
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
    // Map UI parts -> RepairOrderApi.issueParts (services/labor cost are not set here; backend can derive/update)
    await RepairOrderApi.issueParts({
      repairOrderId: payload.ticketId,
      parts: payload.parts.map((p) => ({
        productVariantId: p.productVariantId || 0,
        count: p.requiredQuantity,
        price: p.unitPrice,
      })),
      services: [],
      status: undefined,
    });

    // Return refreshed view
    return new RealGetMaintenanceTicketUseCase().execute({
      ticketId: payload.ticketId,
    });
  }
}

export class RealChangeWorkflowStatusUseCase implements ChangeWorkflowStatusUseCase {
  async execute(
    payload: { ticketId: number } & MaintenanceWorkflowPayload,
  ): Promise<void> {
    // Map trạng thái UI -> endpoint backend hiện có cho RepairOrders.
    // Trong UI hiện có nút "Báo QC đạt chất lượng" và "Hoàn tất"; backend luồng chuẩn là `complete`.
    await RepairOrderApi.complete({
      repairOrderId: payload.ticketId,
      paymentMethod: payload.paymentMethod || "Cash",
      paymentStatus: "Paid",
      notes: payload.qcNote,
    });
  }
}
