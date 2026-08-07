export const sectionData = {
  title: "Doanh thu Xưởng Dịch Vụ",
  description:
    "Đối soát và hạch toán các khoản doanh thu từ hoạt động sửa chữa, tiền công thợ, tiền bán phụ tùng bảo dưỡng và tiền thanh toán từ Hãng (Bảo hành).",
  pages: [
    {
      id: "workshop-revenue",
      title: "Đối soát Doanh thu Xưởng",
      description:
        "Xác minh số tiền Thu ngân xưởng nộp về mỗi ngày và tách bạch các nguồn doanh thu.",
      route: "/accountant/workshop/revenue",
      steps: [
        "1. Truy cập [Kế toán Xưởng] -> [Đối soát doanh thu].",
        "2. Cuối mỗi ca làm việc, Thu ngân xưởng in 'Bảng kê bàn giao ca'. Kế toán đối chiếu số tiền mặt thực tế nhận được với số liệu trên phần mềm.",
        "3. Nếu số liệu khớp, nhấn [Xác nhận thu tiền]. Hệ thống tự động sinh phiếu thu vào Quỹ tiền mặt trung tâm.",
        "4. Kiểm tra tab [Doanh thu Bảo hành] (Warranty Receivables): Đây là khoản tiền hãng Honda/Yamaha nợ đại lý. Khi hãng thanh toán, Kế toán làm bút toán thu tiền qua Ngân hàng.",
      ],
      tips: [
        "Rất nhiều trường hợp Thu ngân quên cấn trừ tiền tạm ứng của khách, Kế toán cần check kỹ các Lệnh sửa chữa (RO) có số tiền lớn.",
        "Nên tách riêng tài khoản doanh thu: 5113 (Doanh thu Dịch vụ/Tiền công) và 5112 (Doanh thu bán phụ tùng) để làm báo cáo quản trị dễ dàng hơn.",
      ],
    },
  ],
};
