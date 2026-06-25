import type { ColumnOption } from "@/types/component";

export const searchItems = [
  { key: "name", label: "Họ tên", type: "input" },
  { key: "jobTitle", label: "Vị trí", type: "input" },
  { key: "email", label: "Email", type: "input" },
];

export const columns: ColumnOption[] = [
  { label: "Nhân viên", prop: "fullName", minWidth: 200, useSlot: true },
  { label: "Vị trí", prop: "jobTitle", minWidth: 160, useSlot: true },
  { label: "Email", prop: "email", minWidth: 200 },
  {
    label: "Lương cơ bản",
    prop: "baseSalary",
    width: 150,
    align: "right",
    useSlot: true,
  },
  { label: "Ngày vào làm", prop: "contractDate", width: 130, align: "center" },
  {
    label: "Thao tác",
    prop: "operation",
    width: 160,
    fixed: "right" as const,
    align: "center",
    useSlot: true,
  },
];
