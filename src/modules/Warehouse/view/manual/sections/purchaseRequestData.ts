export const sectionData = {
  title: "Yêu cầu mua hàng",
  description: "Lập và duyệt các phiếu yêu cầu nhập hàng, mua sắm vật tư.",
  pages: [
    {
      id: "purchase-request",
      title: "Yêu cầu mua hàng",
      description: "Quy trình đề xuất mua hàng từ các bộ phận.",
      route: "/Warehouse/purchase-request",
      steps: [
        "Tạo phiếu yêu cầu mua hàng mới.",
        "Chờ Quản lý hoặc Kế toán trưởng phê duyệt.",
        "Chuyển thành Đơn đặt hàng với Nhà cung cấp (PO)."
      ],
      tips: ["Đính kèm báo giá từ ít nhất 3 nhà cung cấp để dễ dàng được duyệt."]
    }
  ]
}
