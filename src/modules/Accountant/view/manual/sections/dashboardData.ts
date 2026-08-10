export const sectionData = {
  title: 'Dashboard Kế Toán',
  description:
    'Trạm điều khiển tài chính (Financial Command Center). Cung cấp các biểu đồ dòng tiền (Cashflow), tình hình thu chi và các chỉ số sức khỏe tài chính của doanh nghiệp theo thời gian thực.',
  pages: [
    {
      id: 'accountant-overview',
      title: 'Tổng quan Tài chính',
      description:
        'Theo dõi nhanh các chỉ số cốt lõi: Số dư quỹ tiền mặt, Dư nợ ngân hàng, Phải thu khách hàng, và Phải trả nhà cung cấp.',
      route: '/accountant/dashboard',
      steps: [
        '1. Đăng nhập với quyền Kế toán trưởng hoặc Kế toán tổng hợp, truy cập [Dashboard].',
        "2. Kiểm tra 'Biểu đồ Dòng tiền' (Cashflow): So sánh đường màu xanh (Tiền vào) và màu đỏ (Tiền ra) để đảm bảo công ty không bị thâm hụt vốn lưu động.",
        "3. Xem cảnh báo 'Công nợ đến hạn': Danh sách các khoản phải thu/phải trả sắp đến hạn hoặc đã quá hạn trong tuần.",
        "4. Theo dõi 'Cơ cấu chi phí': Biểu đồ tròn phân tách các khoản chi phí lớn (Lương thưởng, Thuê mặt bằng, Marketing, Lãi vay).",
        '5. Tùy chỉnh (Filter) dữ liệu theo Chi nhánh, theo Quý hoặc theo Năm tài chính.',
      ],
      tips: [
        'Dashboard cập nhật Real-time từ tất cả các phân hệ khác (Bán hàng, Xưởng, Kho). Khi Thu ngân vừa in bill xong, tiền sẽ lập tức nảy lên trên biểu đồ.',
        'Click vào bất kỳ chỉ số nào trên biểu đồ để xem chi tiết các bút toán hạch toán (Drill-down).',
        "Có thể xuất file PDF 'Báo cáo nhanh' để gửi Ban Giám Đốc lúc 5h chiều mỗi ngày.",
      ],
    },
  ],
};
