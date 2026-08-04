export const sectionData = {
  title: "Phiếu tạm",
  description: "Quản lý các đơn hàng đang tạo dở hoặc lưu nháp.",
  pages: [
    {
      id: "draft-management",
      title: "Phiếu tạm",
      description: "Xem và tiếp tục xử lý các đơn hàng chưa chốt.",
      route: "/Order/management/draft",
      steps: [
        "Mở lại phiếu tạm để cập nhật thông tin khách hàng hoặc sản phẩm.",
        "Xác nhận và chuyển phiếu tạm thành Đơn đặt hàng chính thức.",
        "Xóa bỏ phiếu tạm nếu khách hàng hủy giao dịch."
      ],
      tips: ["Nên kiểm tra phiếu tạm mỗi cuối ngày để không bỏ sót khách hàng."]
    }
  ]
}
