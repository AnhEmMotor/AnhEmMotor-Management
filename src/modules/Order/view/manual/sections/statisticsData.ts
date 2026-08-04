export const sectionData = {
  title: "Thống kê đơn hàng",
  description: "Báo cáo doanh số và tỷ lệ thành công của các đơn đặt hàng.",
  pages: [
    {
      id: "order-statistics",
      title: "Thống kê đơn hàng",
      description:
        "Xem biểu đồ thống kê đơn hàng theo thời gian, theo nhân viên.",
      route: "/Order/statistics",
      steps: [
        "Lọc thời gian (tuần, tháng, năm) để xem biểu đồ.",
        "Phân tích tỷ lệ đơn hoàn thành, đơn hủy, đơn đang xử lý.",
        "So sánh hiệu suất bán hàng giữa các nhân viên Sales.",
      ],
      tips: [
        "Sử dụng báo cáo này để khen thưởng nhân viên xuất sắc mỗi tháng.",
      ],
    },
  ],
};
