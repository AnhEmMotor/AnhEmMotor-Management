export const sectionData = {
  title: 'Hoa Hồng Kinh Doanh (Commission)',
  description:
    'Hệ thống tự động tính toán tiền hoa hồng (KPI) cho đội ngũ Sales và Thợ sửa chữa dựa trên doanh số và cơ chế thưởng của công ty.',
  pages: [
    {
      id: 'commission-calculation',
      title: 'Tính toán Hoa Hồng',
      description: 'Lên bảng kê chi tiết hoa hồng từng đơn hàng để trả lương cho nhân viên.',
      route: '/accountant/hr/commission',
      steps: [
        '1. Vào [Kế toán Nội bộ] -> [Tính Hoa Hồng].',
        '2. Hệ thống sẽ liệt kê các cấu hình hoa hồng đang áp dụng (Ví dụ: 500k/xe tay ga, 300k/xe số, hoặc 10% doanh thu phụ tùng).',
        '3. Chọn tháng cần tính lương, bấm [Chạy Bảng tính].',
        '4. Hệ thống sẽ tự quét toàn bộ Đơn hàng ĐÃ GIAO và RO ĐÃ THANH TOÁN để cộng dồn tiền thưởng cho từng nhân viên.',
        '5. Kế toán rà soát lại (Review) xem có nhân viên nào bị phạt hoặc trừ thưởng không.',
        '6. Bấm [Chốt Hoa hồng]. Số liệu này sẽ tự động đổ sang Phân hệ Lương (Payroll).',
      ],
      tips: [
        'Tuyệt đối không tính hoa hồng cho các đơn hàng chưa thu đủ tiền hoặc xe chưa giao cho khách.',
        'Quản lý có thể cấu hình Thưởng nóng (Bonus) cho các dòng xe khó bán ngay trên màn hình Thiết lập Cơ chế.',
      ],
    },
  ],
};
