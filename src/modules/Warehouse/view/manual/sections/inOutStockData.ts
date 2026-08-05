export const sectionData = {
  title: "Báo cáo X-N-T",
  description: "Xem báo cáo tổng hợp Xuất - Nhập - Tồn kho.",
  pages: [
    {
      id: "in-out-stock",
      title: "Báo cáo xuất - nhập - tồn",
      description: "Phân tích biến động hàng hóa trong kho theo thời gian.",
      route: "/Warehouse/in-out-stock",
      steps: [
        "Lọc thời gian cần xem báo cáo.",
        "Xem số dư đầu kỳ, số lượng nhập/xuất trong kỳ.",
        "Kiểm tra số dư cuối kỳ và đối chiếu với thực tế.",
      ],
      tips: ["Nên chạy báo cáo này trước mỗi kỳ kiểm kê kho."],
    },
  ],
};
