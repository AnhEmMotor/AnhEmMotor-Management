export const sectionData = {
  title: "Tiền lương nhân sự",
  description: "Quản lý và tính toán tiền lương cho toàn bộ nhân viên.",
  pages: [
    {
      id: "payroll",
      title: "Tiền lương nhân sự",
      description:
        "Xem chi tiết bảng lương bao gồm lương cứng, phụ cấp, hoa hồng và các khoản khấu trừ.",
      route: "/Accountant/payroll",
      steps: [
        "Tạo kỳ trả lương mới.",
        "Hệ thống tự động tổng hợp lương, phụ cấp, bảo hiểm và hoa hồng.",
        "Phê duyệt bảng lương và xuất file thanh toán.",
      ],
      tips: ["Kiểm tra kỹ các khoản khấu trừ và tạm ứng trước khi chốt lương."],
    },
  ],
};
