export const sectionData = {
  title: 'Quản lý Đặt cọc (Deposit)',
  description:
    'Quy trình thiết lập chính sách cọc, ghi nhận tiền giữ chỗ và xử lý các tình huống hủy cọc/hoàn cọc một cách minh bạch.',
  pages: [
    {
      id: 'deposit-settings',
      title: 'Thiết lập Chính sách Cọc',
      description:
        'Định nghĩa số tiền cọc tối thiểu cần thiết để giữ xe trong kho, thay đổi linh hoạt theo từng dòng xe.',
      route: '/order/deposit/settings',
      steps: [
        '1. Quản trị viên truy cập [Đơn hàng] -> [Cài đặt đặt cọc].',
        '2. Chọn [Thêm Quy tắc Cọc Mới].',
        '3. Áp dụng quy tắc cho: Toàn bộ cửa hàng, Hoặc chỉ một số dòng xe khan hiếm (VD: SH 350i, Vespa).',
        '4. Cài đặt mức cọc: Có thể là một số tiền cố định (VD: 5.000.000 VNĐ) hoặc tỷ lệ % trên giá trị xe (VD: 10%).',
        "5. Thiết lập 'Thời gian giữ chỗ tối đa' (VD: 7 ngày). Quá thời hạn này nếu khách không thanh toán phần còn lại, hệ thống sẽ tự động nhả xe (Giải phóng tồn kho).",
        '6. Lưu quy tắc. Hệ thống sẽ áp dụng ngay lập tức cho các đơn hàng tạo sau thời điểm này.',
      ],
      tips: [
        'Đối với các dòng xe HOT đang cháy hàng, nên thiết lập thời gian giữ chỗ ngắn (3 ngày) để tăng tốc độ xoay vòng vốn.',
        'Nhân viên Sales không thể thay đổi chính sách này khi lên đơn, tránh tình trạng nhận cọc quá thấp dẫn đến rủi ro.',
      ],
    },
    {
      id: 'deposit-processing',
      title: 'Tiếp nhận và Xử lý Cọc',
      description:
        'Thao tác của Thu ngân/Kế toán khi nhận tiền cọc từ khách và liên kết vào Đơn đặt hàng.',
      route: '/order/deposit/processing',
      steps: [
        "1. Khi khách hàng đồng ý cọc, Sales chuyển đơn hàng sang trạng thái 'Chờ thu cọc'.",
        '2. Thu ngân mở màn hình [Danh sách Thu Cọc], chọn đơn hàng tương ứng.',
        '3. Nhập số thực thu, chọn hình thức (Quẹt thẻ POS, Chuyển khoản VietQR, Tiền mặt).',
        '4. Xác nhận thu tiền, hệ thống tự động in Phiếu Thu Nhận Cọc.',
        '5. Lúc này, xe trong kho sẽ bị trừ Tồn kho khả dụng (Available) và chuyển sang Tồn kho chờ giao (Reserved).',
        '6. Xử lý Hủy cọc (Nếu có): Nếu khách đổi ý, lập Yêu cầu Hoàn cọc, chọn lý do và chờ Quản lý duyệt xuất quỹ trả lại tiền.',
      ],
      tips: [
        'Quét mã QR VietQR động (Dynamic QR) hiển thị sẵn số tiền và mã đơn hàng giúp đối soát giao dịch ngân hàng nhanh gấp 10 lần.',
        'Nếu khách hàng bị phạt cọc (theo hợp đồng), Kế toán cần tạo Phiếu Kế Toán để hạch toán phần tiền phạt này vào Thu nhập khác.',
      ],
    },
  ],
};
