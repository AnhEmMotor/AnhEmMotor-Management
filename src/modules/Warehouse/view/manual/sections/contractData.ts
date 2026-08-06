export const sectionData = {
  title: "Hợp đồng NCC",
  description: "Quản lý hợp đồng cung cấp vật tư với các nhà cung cấp.",
  pages: [
    {
      id: "supplier-contract",
      title: "Hợp đồng nhà cung cấp",
      description: "Lưu trữ và theo dõi thời hạn hợp đồng với các đối tác.",
      route: "/Warehouse/contract",
      steps: [
        "Upload bản mềm hợp đồng đã ký kết.",
        "Cập nhật các điều khoản chiết khấu, thưởng doanh số.",
        "Nhận cảnh báo khi hợp đồng sắp hết hạn.",
      ],
      tips: [
        "Luôn đảm bảo gia hạn hợp đồng trước khi hết hạn để không bị gián đoạn cung cấp.",
      ],
    },
  ],
};
