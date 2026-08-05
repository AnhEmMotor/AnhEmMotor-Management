export const sectionData = {
  title: "Phiếu bán hàng",
  description: "Quản lý và theo dõi trạng thái các đơn đặt hàng chính thức.",
  pages: [
    {
      id: "order-management",
      title: "Phiếu bán hàng",
      description: "Xử lý, duyệt và theo dõi tiến độ của đơn hàng.",
      route: "/Order/management/order",
      steps: [
        "Tiếp nhận đơn đặt hàng từ Sales.",
        "Xác nhận tình trạng thanh toán và duyệt đơn.",
        "Chuyển trạng thái đơn hàng để bộ phận Kho xuất xe.",
      ],
      tips: [
        "Luôn đối chiếu với Kế toán trước khi chuyển trạng thái Đã duyệt.",
      ],
    },
  ],
};
