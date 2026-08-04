export const sectionData = {
  title: "Báo cáo tồn kho",
  description: "Theo dõi tình hình nhập xuất tồn của hàng hóa, phụ tùng.",
  pages: [
    {
      id: "inventory-report",
      title: "Báo cáo tồn kho",
      description: "Tổng hợp giá trị hàng tồn và số lượng hiện tại.",
      route: "/Accountant/inventory",
      steps: [
        "Xem danh sách hàng hóa và số lượng tồn kho.",
        "Kiểm tra giá trị tồn kho hiện tại.",
        "Xuất báo cáo kiểm kê định kỳ.",
      ],
      tips: ["Dữ liệu tồn kho được đồng bộ trực tiếp từ phân hệ Kho."],
    },
  ],
};
