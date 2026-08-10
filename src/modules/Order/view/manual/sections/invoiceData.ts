export const sectionData = {
  title: 'Yêu cầu Xuất Hóa Đơn (Invoices)',
  description:
    'Trình quản lý giao tiếp giữa bộ phận Sales và Kế toán trong việc xử lý yêu cầu xuất hóa đơn điện tử (VAT) cho Khách hàng Cá nhân và Doanh nghiệp.',
  pages: [
    {
      id: 'invoice-requests',
      title: 'Quản lý Yêu cầu Xuất Hóa đơn',
      description:
        'Theo dõi trạng thái phát hành hóa đơn đỏ để bàn giao giấy tờ cho khách đi đăng ký biển số.',
      route: '/order/invoice/requests',
      steps: [
        '1. Tại bước thanh toán cuối cùng của Đơn hàng, Thu ngân tích chọn [Xuất hóa đơn VAT].',
        '2. Form nhập liệu yêu cầu nhập: Mã số thuế (nếu là công ty), Tên người mua/Tên đơn vị, Địa chỉ và Email nhận hóa đơn điện tử.',
        '3. Tích chọn các mục cần xuất hóa đơn (Thường là nguyên chiếc xe, phụ tùng mua kèm có thể xuất gộp hoặc tách rời).',
        "4. Nhấn [Gửi Yêu Cầu Kế Toán]. Lúc này, yêu cầu sẽ nằm ở trạng thái 'Chờ xử lý'.",
        '5. Kế toán nhận được thông báo, tiến hành xuất hóa đơn trên phần mềm MISA/VNPT, sau đó nhập Mã tra cứu hóa đơn vào hệ thống.',
        '6. Hệ thống tự động bắn Email chứa link tải Hóa đơn XML/PDF cho khách hàng.',
        "7. Trạng thái phiếu chuyển thành 'Hoàn thành' màu xanh lá.",
      ],
      tips: [
        'Nút [Kiểm tra MST] tích hợp sẵn API Cổng thông tin Quốc gia giúp điền tự động Tên công ty và Địa chỉ siêu chuẩn xác.',
        'Khách hàng cá nhân vẫn bắt buộc phải xuất hóa đơn theo quy định của nhà nước, hãy nhập đúng số CCCD thay cho MST.',
        'Trường hợp hóa đơn bị sai sót, Sales có thể gửi [Yêu cầu Điều chỉnh/Hủy hóa đơn] ngay trên màn hình này.',
      ],
    },
  ],
};
