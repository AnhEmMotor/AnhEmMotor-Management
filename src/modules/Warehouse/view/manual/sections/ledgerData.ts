export const sectionData = {
  title: "Sổ cái tồn kho",
  description: "Chi tiết từng giao dịch làm thay đổi số lượng tồn kho.",
  pages: [
    {
      id: "inventory-ledger",
      title: "Sổ cái tồn kho",
      description:
        "Xem lại toàn bộ lịch sử xuất, nhập cho một sản phẩm cụ thể.",
      route: "/Warehouse/ledger",
      steps: [
        "Chọn sản phẩm cần kiểm tra.",
        "Xem danh sách các phiếu nhập, xuất, chuyển kho liên quan.",
        "Xác định nguyên nhân sai lệch nếu có.",
      ],
      tips: ["Sổ cái giúp truy vết mọi biến động hàng hóa một cách minh bạch."],
    },
  ],
};
