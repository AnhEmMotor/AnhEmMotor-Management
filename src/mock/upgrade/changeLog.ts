export interface UpgradeLogItem {
  version: string;
  date: string;
  title: string;
  detail?: string[];
  remark?: string;
  requireReLogin?: boolean;
}

export const upgradeLogList: UpgradeLogItem[] = [
  {
    version: "v1.0.0",
    date: "2026-05-17",
    title: "Phiên bản đầu tiên - Anh Em Motor",
    detail: [
      "Tích hợp tính năng đăng nhập mạng xã hội Google & Facebook.",
      "Hệ thống kết nối SSE thời gian thực để cập nhật thông tin người dùng và quyền hạn.",
      "Cải tiến chiều rộng thanh menu Sidebar (260px) và tối ưu hóa hệ màu chủ đạo Đỏ mặc định.",
      "Standardized popup và thông báo lỗi góc dưới bên phải.",
    ],
    remark: "Khởi chạy hệ thống quản lý Anh Em Motor.",
    requireReLogin: false,
  },
];
