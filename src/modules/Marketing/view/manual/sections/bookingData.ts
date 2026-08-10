export const sectionData = {
  title: 'Khách Đăng Ký Chạy Thử (Test Drive Booking)',
  description:
    'Hệ thống phễu thu thập thông tin khách hàng tiềm năng (Leads) muốn lái thử xe tại cửa hàng, tự động chia Data cho đội ngũ Telesales.',
  pages: [
    {
      id: 'test-drive-leads',
      title: 'Quản lý Data Lái thử',
      description:
        'Theo dõi và phân bổ các lượt đăng ký lái thử xe đổ về từ Landing Page, Facebook Ads và Website.',
      route: '/marketing/booking/test-drive',
      steps: [
        '1. Truy cập [Đăng Ký Lái Thử].',
        '2. Bảng dữ liệu hiển thị các Lead (Khách hàng) vừa để lại Tên, SĐT, Dòng xe muốn thử và Thời gian mong muốn.',
        '3. Trưởng phòng Marketing hoặc Hệ thống tự động phân bổ Data này cho từng nhân viên Sales (Tính năng Auto-Routing).',
        '4. Nhân viên Sales nhận được thông báo, bốc điện thoại gọi xác nhận lịch với khách.',
        "5. Cập nhật Trạng thái xử lý: 'Chưa gọi', 'Đã chốt lịch', 'Khách hẹn gọi lại', 'Đã hủy'.",
        "6. Nếu khách đến showroom lái thử thành công, Sales cập nhật thành 'Hoàn thành' và đưa khách vào phễu Tư vấn Chốt sale.",
      ],
      tips: [
        'Tốc độ phản hồi là yếu tố sống còn (Golden Time): Gọi lại cho khách trong vòng 5 phút kể từ lúc họ đăng ký sẽ tăng tỷ lệ chốt lên 80%.',
        "Hệ thống sẽ gửi tin nhắn SMS tự động ngay sau khi khách bấm 'Gửi đăng ký' để tạo sự chuyên nghiệp.",
      ],
    },
  ],
};
