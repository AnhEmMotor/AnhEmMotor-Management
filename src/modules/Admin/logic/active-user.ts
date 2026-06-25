export interface UserStatItem {
  name: string;
  num: string;
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

export const list: UserStatItem[] = [
  { name: "Tổng số xe tiếp nhận", num: "1,250" },
  { name: "Xe đang sửa chữa", num: "15" },
  { name: "Xe đã hoàn thành", num: "1,220" },
  { name: "Xe hủy dịch vụ", num: "15" },
];
