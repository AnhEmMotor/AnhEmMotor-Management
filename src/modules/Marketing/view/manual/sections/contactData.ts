export const sectionData = {
  title: 'Hỗ Trợ & Liên Hệ (Contact Us)',
  description:
    'Hòm thư chung tiếp nhận các thắc mắc đa chiều từ khách hàng: Khiếu nại dịch vụ, hỏi giá xe, đề nghị hợp tác B2B, hoặc phản ánh thái độ nhân viên.',
  pages: [
    {
      id: 'contact-inbox',
      title: 'Quản lý Hộp thư Liên hệ',
      description:
        'Theo dõi các form điền liên hệ từ trang chủ và chia việc cho các phòng ban liên quan.',
      route: '/marketing/contact/inbox',
      steps: [
        '1. Truy cập [Hỗ Trợ & Liên Hệ].',
        '2. Đọc lướt danh sách các Email/Tin nhắn. Hệ thống tự động phân loại theo chủ đề khách chọn (VD: Khiếu nại, Hỏi giá, Hợp tác).',
        '3. Gán tag xử lý (Assign) cho đúng phòng ban. Ví dụ: Nếu là khiếu nại thái độ thợ sửa, Chuyển tiếp (Forward) ticket này cho Quản đốc Xưởng.',
        '4. Theo dõi Tiến độ (SLA - Service Level Agreement): Đảm bảo tất cả các liên hệ đều được hồi đáp trong vòng 24 giờ.',
        '5. Khi đã giải quyết xong, Đóng Ticket (Đánh dấu Hoàn Thành) để làm sạch hòm thư.',
      ],
      tips: [
        'Nếu công ty có hòm thư Góp ý cho Giám đốc, bạn có thể thiết lập rule để hệ thống chuyển thẳng email mật về tài khoản của Giám đốc.',
        'Tránh để tồn đọng Ticket quá lâu, hệ thống sẽ tự động báo cáo lên cấp quản lý cao hơn (Escalation).',
      ],
    },
  ],
};
