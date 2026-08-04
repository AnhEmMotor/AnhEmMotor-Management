export const sectionData = {
  title: "Thống kê hóa đơn",
  description: "Theo dõi và quản lý toàn bộ hóa đơn đã xuất.",
  pages: [
    {
      id: "invoice-stats",
      title: "Hóa đơn điện tử",
      description: "Xem chi tiết và trạng thái của hóa đơn điện tử.",
      route: "/Accountant/invoice",
      steps: [
        "Tra cứu hóa đơn theo ngày xuất hoặc mã khách hàng.",
        "Gửi lại hóa đơn qua email nếu khách hàng yêu cầu.",
        "Hủy hoặc xuất hóa đơn thay thế khi có sai sót."
      ],
      tips: ["Tuyệt đối cẩn thận khi thực hiện thao tác hủy hóa đơn."]
    }
  ]
}
