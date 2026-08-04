export const sectionData = {
  title: "Sửa Chữa",
  description: "Quản lý quá trình tiếp nhận và sửa chữa xe tại xưởng.",
  pages: [
    {
      id: "repair-orders",
      title: "Phiếu sửa chữa",
      description: "Tạo và quản lý các phiếu yêu cầu sửa chữa.",
      route: "/factory/workshop/repair",
      steps: [
        "Tạo phiếu sửa chữa mới khi tiếp nhận xe.",
        "Phân công kỹ thuật viên thực hiện.",
        "Cập nhật trạng thái sửa chữa, linh kiện thay thế.",
        "Hoàn tất phiếu sửa chữa.",
      ],
      tips: ["Chú ý kiểm tra kỹ tình trạng xe trước khi tiếp nhận."],
    },
  ],
};
