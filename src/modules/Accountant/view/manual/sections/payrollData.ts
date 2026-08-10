export const sectionData = {
  title: 'Bảng Lương Nhân Sự (Payroll)',
  description:
    'Quản lý tổng hợp lương cơ bản, phụ cấp, hoa hồng và các khoản giảm trừ (Thuế TNCN, Bảo hiểm) để ra bảng lương cuối cùng.',
  pages: [
    {
      id: 'payroll-processing',
      title: 'Chốt Bảng Lương Tháng',
      description: 'Kiểm tra và phê duyệt bảng lương trước khi chuyển khoản cho nhân viên.',
      route: '/accountant/payroll',
      steps: [
        '1. Cuối tháng, truy cập [Bảng lương Nhân sự].',
        '2. Kéo dữ liệu Chấm công (Từ máy vân tay hoặc App) để tính Lương thời gian.',
        '3. Kéo dữ liệu từ Bảng Hoa hồng (Commission) vào cột Lương năng suất.',
        '4. Tính toán các khoản giảm trừ (Bảo hiểm Xã hội, Thuế TNCN tự động theo biểu thuế lũy tiến).',
        '5. In Bảng lương tổng, trình Giám đốc ký duyệt.',
        '6. Gửi Phiếu lương điện tử (Payslip) qua Email/Zalo cho từng nhân viên để họ đối chiếu.',
        '7. Xuất file UNC (Ủy nhiệm chi) định dạng Excel để đẩy lên Internet Banking ngân hàng chuyển lương đồng loạt.',
      ],
      tips: [
        'Nên chốt lương trước ngày mùng 5 hàng tháng. Bất kỳ khiếu nại nào của nhân viên sẽ được xử lý vào bảng lương tháng sau.',
        'Phần mềm hỗ trợ mã hóa file Phiếu lương bằng mật khẩu (chính là số CMND của nhân viên) để đảm bảo tính bảo mật.',
      ],
    },
  ],
};
