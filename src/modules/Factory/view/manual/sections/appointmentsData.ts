export const sectionData = {
  title: 'Lịch Sửa Chữa (Appointments)',
  description:
    'Hệ thống quản lý đặt chỗ trước, giúp xưởng chủ động sắp xếp nhân sự, phụ tùng và cầu nâng, giảm thiểu thời gian chờ đợi của khách hàng.',
  pages: [
    {
      id: 'booking-calendar',
      title: 'Lịch hẹn Dịch vụ',
      description:
        'Hiển thị lịch hẹn dưới dạng Lịch (Calendar) hoặc Danh sách. Cố vấn dịch vụ dễ dàng tạo, dời hoặc hủy lịch.',
      route: '/factory/appointments',
      steps: [
        '1. Vào [Lịch Sửa Chữa] -> [Danh sách lịch hẹn]. Mặc định hệ thống sẽ hiển thị theo chế độ Xem Theo Tuần (Weekly View).',
        '2. Để tạo lịch hẹn mới, nhấn nút [Tạo lịch hẹn] hoặc click đúp vào một ô trống trên lịch.',
        '3. Điền SĐT khách hàng, hệ thống tự động tải lên lịch sử sửa chữa và các xe khách đang sở hữu.',
        '4. Chọn loại dịch vụ (Bảo dưỡng định kỳ 10k, Sửa chữa nặng, Thay dầu...). Hệ thống sẽ dự tính số giờ cần thiết.',
        '5. Chọn thời gian và Cố vấn dịch vụ tiếp nhận. Nếu khung giờ đó đã kín cầu nâng, hệ thống sẽ cảnh báo đỏ.',
        '6. Nhấn [Lưu]. Hệ thống lập tức gửi tin nhắn SMS/Zalo ZNS xác nhận lịch hẹn cho khách hàng.',
        '7. Khi khách đến, tìm lịch hẹn và nhấn nút [Khách đã đến (Check-in)] để chuyển thẳng sang quy trình Mở Lệnh Sửa Chữa.',
      ],
      tips: [
        'Có thể Kéo Thả (Drag & Drop) một lịch hẹn trên màn hình Calendar sang một khung giờ khác để dời lịch nhanh chóng.',
        'Màu sắc trên lịch tương ứng với trạng thái: Xám (Chờ xác nhận), Xanh dương (Đã xác nhận), Xanh lá (Khách đã đến), Đỏ (Khách hủy/Không đến).',
        'Nếu khách No-show (không đến) quá 3 lần, hệ thống sẽ tự động gán nhãn cảnh báo để Cố vấn dịch vụ lưu ý khi nhận lịch lần sau.',
      ],
    },
    {
      id: 'reminder-system',
      title: 'Hệ thống Nhắc lịch (Reminders)',
      description:
        'Tự động hóa việc gọi điện hoặc gửi tin nhắn nhắc nhở khách hàng sắp đến hạn bảo dưỡng.',
      route: '/factory/appointments/reminders',
      steps: [
        '1. Chuyển sang tab [Nhắc lịch bảo dưỡng].',
        '2. Hệ thống tự động lọc ra danh sách các xe đã mua cách đây 3 tháng, 6 tháng, 1 năm hoặc sắp tới hạn thay nhớt.',
        '3. Tổng đài viên (CSKH) gọi điện hỏi thăm tình trạng xe và mời khách đặt lịch.',
        '4. Ghi chú lại kết quả cuộc gọi (Khách đồng ý, Khách từ chối, Khách bận gọi lại sau).',
        '5. Nếu khách đồng ý, nhấn nút [Tạo lịch hẹn từ nhắc nhở] ngay tại dòng đó.',
      ],
      tips: [
        'Kịch bản gọi điện (Call script) được đính kèm sẵn trên màn hình để nhân viên mới dễ dàng tư vấn.',
        'Việc làm tốt công tác nhắc lịch có thể tăng doanh thu xưởng lên tới 30% mỗi tháng từ lượng khách hàng cũ.',
      ],
    },
  ],
};
