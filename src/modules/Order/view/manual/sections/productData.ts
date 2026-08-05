export const sectionData = {
  title: "Quản lý sản phẩm",
  description: "Quản lý danh sách các dòng xe và phụ tùng đang bán.",
  pages: [
    {
      id: "product-list",
      title: "Danh sách sản phẩm",
      description: "Xem và cập nhật thông tin sản phẩm, giá bán, cấu hình.",
      route: "/Order/product/list",
      steps: [
        "Xem danh sách toàn bộ sản phẩm đang kinh doanh.",
        "Cập nhật giá bán, hình ảnh hoặc các thông số kỹ thuật.",
        "Ẩn hoặc ngừng kinh doanh đối với sản phẩm cũ.",
      ],
      tips: [
        "Hãy chắc chắn cập nhật đúng giá bán để tránh sai sót khi tạo đơn hàng.",
      ],
    },
  ],
};
