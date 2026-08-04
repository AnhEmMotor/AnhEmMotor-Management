export const sectionData = {
  title: "Quản lý vận chuyển",
  description: "Theo dõi tình trạng vận chuyển của các đơn hàng giao xa.",
  pages: [
    {
      id: "logistics-dashboard",
      title: "Quản lý vận chuyển",
      description: "Dashboard theo dõi tiến độ và bản đồ vận chuyển.",
      route: "/Order/logistics/dashboard",
      steps: [
        "Xem tổng quan số lượng đơn đang giao, đã giao, giao thất bại.",
        "Tra cứu vị trí đơn hàng qua bản đồ (nếu có tích hợp GPS).",
        "Xác nhận hoàn tất giao hàng và thu tiền (COD)."
      ],
      tips: ["Luôn liên hệ khách trước khi giao để đảm bảo khách có mặt nhận xe."]
    }
  ]
}
