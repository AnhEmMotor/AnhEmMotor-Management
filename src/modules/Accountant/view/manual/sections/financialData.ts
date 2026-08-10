export const sectionData = {
  title: 'Báo Cáo Tài Chính',
  description:
    'Hệ thống tự động kết xuất các báo cáo kế toán chuẩn mực (Bảng Cân đối kế toán, Kết quả kinh doanh, Lưu chuyển tiền tệ) đáp ứng yêu cầu quản trị và khai báo thuế.',
  pages: [
    {
      id: 'financial-statements',
      title: 'Hệ thống Báo cáo Kế toán',
      description:
        'Trích xuất báo cáo theo chuẩn mực kế toán Việt Nam (VAS) và các báo cáo quản trị nội bộ.',
      route: '/accountant/financial/statements',
      steps: [
        '1. Truy cập [Báo cáo Tài chính].',
        '2. Chọn loại báo cáo cần xem: [Kết quả Kinh doanh] (P&L), [Bảng cân đối kế toán] (Balance Sheet), hoặc [Lưu chuyển tiền tệ] (Cash Flow).',
        '3. Chọn kỳ báo cáo: Theo tháng, quý, năm hoặc từ ngày - đến ngày.',
        '4. Lựa chọn Chi nhánh (Có thể xem báo cáo hợp nhất toàn công ty hoặc tách riêng từng cửa hàng).',
        '5. Nhấn [Kết xuất]. Màn hình sẽ hiển thị bảng số liệu chi tiết.',
        '6. Nếu có chênh lệch, click đúp vào một dòng (Ví dụ: Doanh thu bán hàng) để mở ra [Sổ cái tài khoản 511] kiểm tra đối chiếu.',
        '7. Nhấn [Xuất Excel] để lưu trữ hoặc gửi cho công ty Kiểm toán.',
      ],
      tips: [
        'Báo cáo quản trị nội bộ (Internal P&L) sẽ khác với Báo cáo thuế. Hệ thống hỗ trợ 2 sổ kế toán song song.',
        'Tự động cảnh báo đỏ nếu Bảng cân đối kế toán không cân (Tổng Tài sản != Tổng Nguồn vốn), giúp Kế toán phát hiện lỗi hạch toán ngay lập tức.',
      ],
    },
  ],
};
