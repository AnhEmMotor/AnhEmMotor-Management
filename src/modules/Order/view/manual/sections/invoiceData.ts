export const sectionData = {
  title: "Hóa đơn bán xe",
  description: "Quản lý hóa đơn xuất bán cho khách hàng.",
  pages: [
    {
      id: "product-invoice",
      title: "Hóa đơn bán xe",
      description: "Quản lý danh sách hóa đơn GTGT hoặc hóa đơn bán lẻ.",
      route: "/Order/management/invoice",
      steps: [
        "Truy xuất hóa đơn từ Đơn đặt hàng đã hoàn tất.",
        "Bổ sung thông tin xuất hóa đơn (MST, Tên công ty) nếu có.",
        "Xuất file mềm (PDF) hoặc in hóa đơn giao khách.",
      ],
      tips: [
        "Sau khi xuất hóa đơn, hệ thống sẽ tự động ghi nhận doanh thu vào Kế toán.",
      ],
    },
  ],
};
