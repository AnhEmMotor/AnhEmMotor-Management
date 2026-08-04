export const sectionData = {
  title: "Quản lý phiếu nhập kho",
  description: "Xử lý hàng hóa thực tế nhập vào kho và cập nhật số lượng tồn.",
  pages: [
    {
      id: "input-management",
      title: "Quản lý phiếu nhập kho",
      description: "Kiểm đếm và ghi nhận hàng hóa vào hệ thống.",
      route: "/Warehouse/input",
      steps: [
        "Đối chiếu hàng hóa thực tế với Phiếu giao hàng.",
        "Lập Phiếu nhập kho trên hệ thống.",
        "Quét mã vạch và phân bổ vị trí lưu trữ trong kho."
      ],
      tips: ["Luôn kiểm tra kỹ chất lượng hàng hóa trước khi ký nhận."]
    }
  ]
}
