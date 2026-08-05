export const sectionData = {
  title: "Báo cáo tài chính",
  description: "Báo cáo tổng hợp thu chi, lợi nhuận và dòng tiền của cửa hàng.",
  pages: [
    {
      id: "financial-overview",
      title: "Tổng quan tài chính",
      description: "Xem các chỉ số tài chính cơ bản trong kỳ.",
      route: "/Accountant/financial",
      steps: [
        "Chọn kỳ báo cáo (tháng/quý/năm).",
        "Xem biểu đồ doanh thu và chi phí.",
        "Xuất báo cáo dạng Excel hoặc PDF.",
      ],
      tips: ["Dữ liệu được cập nhật tự động (real-time) từ các phân hệ khác."],
    },
  ],
};
