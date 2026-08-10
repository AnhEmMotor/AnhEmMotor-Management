export const sectionData = {
  title: 'Quầy Thanh Toán (Counter Checkout)',
  description:
    'Điểm chạm cuối cùng của dịch vụ. Quản lý việc thu ngân tại xưởng, tổng hợp Lệnh sửa chữa đã hoàn tất, in phiếu thu và giải quyết khiếu nại trước khi xe ra khỏi cổng.',
  pages: [
    {
      id: 'counter-checkout',
      title: 'Thanh toán Dịch vụ Xưởng',
      description:
        'Thao tác chốt số liệu cuối cùng và thu tiền khách hàng sau khi KCS đã nghiệm thu xe.',
      route: '/factory/counter/checkout',
      steps: [
        "1. Thu ngân trực tại Quầy Thanh Toán, theo dõi danh sách các xe ở trạng thái 'Chờ thanh toán'.",
        '2. Gọi tên khách hàng (hoặc phát loa) dựa trên biển số xe.',
        '3. Mở Lệnh sửa chữa trên màn hình. Hệ thống sẽ gom nhóm: Tổng tiền phụ tùng + Tổng tiền công thợ - Khuyến mãi/Voucher (nếu có).',
        '4. Nếu khách hàng có thắc mắc về giá, Thu ngân có thể giải thích trực tiếp trên chi tiết RO, hoặc gọi Cố vấn dịch vụ ra hỗ trợ.',
        '5. Chọn hình thức thanh toán (Tiền mặt, Thẻ tín dụng, Quẹt mã QR). Có thể tách bill (Split payment) nếu khách trả 1 nửa tiền mặt, 1 nửa quẹt thẻ.',
        '6. Nhấn [Thanh toán & Đóng Lệnh]. Hành động này sẽ khóa RO, không ai được sửa chữa số liệu nữa.',
        '7. In Hóa đơn dịch vụ (Service Invoice) và Bảng kê chi tiết. Đưa Khách hàng ký nhận.',
        '8. Giao cho khách Thẻ ra cổng (Gate Pass) để bảo vệ kiểm tra trước khi dắt xe về.',
      ],
      tips: [
        'Tính năng Tích điểm Thẻ thành viên (Loyalty Points) được kích hoạt tự động. Khách hàng có thể dùng điểm để trừ trực tiếp vào hóa đơn lần này.',
        'Đối với xe của Công ty/Doanh nghiệp nợ phí dịch vụ cuối tháng mới thanh toán, Thu ngân chọn phương thức [Ghi Nợ] (Cần có mã phê duyệt của Kế toán trưởng).',
        'Quầy thanh toán có nút [Yêu cầu Xuất VAT] tương tự như phân hệ Bán hàng để gửi thông tin sang Kế toán xuất hóa đơn đỏ.',
      ],
    },
  ],
};
