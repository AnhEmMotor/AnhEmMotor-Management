export const sectionData = {
  title: "Quầy Thanh Toán",
  description:
    "Quản lý việc thu tiền và xuất hóa đơn cho khách hàng sau khi sửa chữa xong.",
  pages: [
    {
      id: "counter-payment",
      title: "Thu ngân xưởng",
      description: "Thanh toán các phiếu sửa chữa đã hoàn thành.",
      route: "/factory/workshop/counter/payment",
      steps: [
        "Lựa chọn phiếu sửa chữa cần thanh toán.",
        "Kiểm tra lại tổng tiền dịch vụ và phụ tùng thay thế.",
        "Xác nhận thu tiền và in hóa đơn cho khách hàng.",
      ],
      tips: [
        "Luôn kiểm tra chính xác số tiền khách hàng đưa và số tiền thối lại.",
      ],
    },
  ],
};
