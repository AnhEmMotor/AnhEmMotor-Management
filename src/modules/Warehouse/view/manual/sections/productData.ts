export const sectionData = {
  title: "Quản lý sản phẩm",
  description:
    "Quản lý danh mục, số lượng và thuộc tính các sản phẩm trong kho.",
  pages: [
    {
      id: "product-management",
      title: "Quản lý sản phẩm",
      description: "Xem chi tiết tồn kho, vị trí lưu trữ và mã vạch sản phẩm.",
      route: "/Warehouse/product",
      steps: [
        "Thêm mới sản phẩm, phụ tùng vào danh mục.",
        "Gán mã vạch (Barcode/QR) và vị trí kệ (Bin location).",
        "Cập nhật mức tồn kho tối thiểu/tối đa.",
      ],
      tips: ["Luôn đảm bảo mã vạch khớp với tem dán trên sản phẩm vật lý."],
    },
  ],
};
