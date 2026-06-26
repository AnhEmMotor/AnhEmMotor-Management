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

export const chartData = [1200, 1500, 1800, 1400, 2100, 2400, 2800, 2600, 3100]; // Lượt khách truy cập / hệ thống
export const completedData = [150, 180, 220, 160, 250, 310, 350, 320, 410]; // Khách hàng mới

export const list: UserStatItem[] = [
  {
    name: "Nhân sự HĐ",
    num: "128",
    colorClass: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-900/30",
  },
  {
    name: "Nghỉ phép",
    num: "5",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    name: "KH Mới (tháng)",
    num: "410",
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    name: "KH Rời bỏ",
    num: "12",
    colorClass: "text-rose-500",
    bgClass: "bg-rose-50 dark:bg-rose-900/30",
  },
];
