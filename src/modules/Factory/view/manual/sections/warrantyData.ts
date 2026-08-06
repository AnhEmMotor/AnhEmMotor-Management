export const sectionData = {
  title: "Bảo Hành",
  description:
    "Quản lý các yêu cầu bảo hành từ khách hàng và trạng thái phê duyệt từ hãng.",
  pages: [
    {
      id: "warranty-requests",
      title: "Yêu cầu bảo hành",
      description: "Xem và xử lý các hồ sơ yêu cầu bảo hành.",
      route: "/factory/workshop/warranty",
      steps: [
        "Tiếp nhận yêu cầu bảo hành từ khách hàng.",
        "Kiểm tra điều kiện bảo hành của phụ tùng, xe.",
        "Tạo hồ sơ và gửi lên hãng chờ phê duyệt.",
        "Cập nhật trạng thái bảo hành.",
      ],
      tips: [
        "Luôn đối chiếu mã số khung (VIN) và biển số xe để tránh nhầm lẫn.",
      ],
    },
  ],
};
