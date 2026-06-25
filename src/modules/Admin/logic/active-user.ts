export interface UserStatItem {
  name: string;
  num: string;
  colorClass?: string;
  bgClass?: string;
}

export const xAxisLabels = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
];

export const chartData = [160, 100, 150, 80, 190, 100, 175, 120, 160];
export const completedData = [150, 95, 140, 75, 180, 90, 170, 115, 155];

export const list: UserStatItem[] = [
  { name: "Tiếp nhận", num: "1,250", colorClass: "text-blue-600", bgClass: "bg-blue-50" },
  { name: "Đang sửa", num: "15", colorClass: "text-amber-500", bgClass: "bg-amber-50" },
  { name: "Hoàn thành", num: "1,220", colorClass: "text-emerald-500", bgClass: "bg-emerald-50" },
  { name: "Hủy dịch vụ", num: "15", colorClass: "text-rose-500", bgClass: "bg-rose-50" },
];
