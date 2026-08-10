export const sectionData = {
  title: 'Dashboard Xưởng',
  description:
    'Bảng điều khiển trung tâm (Control Tower) của xưởng dịch vụ, cung cấp cái nhìn toàn cảnh về mọi hoạt động đang diễn ra. Từ tiến độ sửa chữa, hiệu suất thợ đến tình trạng quá tải của các cầu nâng.',
  pages: [
    {
      id: 'workshop-overview',
      title: 'Tổng quan hoạt động xưởng (Real-time)',
      description:
        'Theo dõi dòng chảy của xe từ lúc tiếp nhận, chẩn đoán, sửa chữa cho đến khi bàn giao. Đóng vai trò như một màn hình giám sát dành cho Quản đốc.',
      route: '/factory/dashboard',
      steps: [
        '1. Truy cập vào menu [Dashboard Xưởng] từ thanh điều hướng chính.',
        '2. Quan sát 4 thẻ KPI trên cùng: [Xe chờ tiếp nhận], [Đang sửa chữa], [Chờ phụ tùng], và [Đã hoàn thành chờ giao].',
        "3. Xem biểu đồ 'Tiến độ sửa chữa' (Gantt Chart) để biết xe nào sắp đến hạn giao, xe nào đang bị trễ giờ.",
        "4. Kiểm tra danh sách 'Cảnh báo đỏ': Các xe đang bị ngâm quá lâu do thiếu phụ tùng hoặc chờ khách hàng duyệt báo giá.",
        "5. Theo dõi biểu đồ 'Năng suất thợ': Đo lường số giờ công (Flat Rate) mà từng kỹ thuật viên đã hoàn thành trong ngày so với chỉ tiêu.",
        '6. Sử dụng bộ lọc [Chi nhánh] ở góc phải nếu bạn có quyền quản lý chuỗi, để so sánh công suất giữa các xưởng với nhau.',
      ],
      tips: [
        'Màn hình Dashboard này được thiết kế tự động Refresh mỗi 5 phút, rất phù hợp để trình chiếu trên Smart TV treo tại xưởng cho thợ và cố vấn dịch vụ cùng xem.',
        "Bấm vào bất kỳ thẻ KPI nào (ví dụ: 'Chờ phụ tùng') hệ thống sẽ lập tức lọc ra danh sách các xe tương ứng để bạn xử lý ngay.",
        'Các cảnh báo trễ hạn sẽ tự động gửi thông báo (Push Notification) đến điện thoại của Quản đốc.',
      ],
    },
    {
      id: 'workshop-capacity',
      title: 'Quản lý Công suất Xưởng (Capacity Planning)',
      description:
        'Dự báo tình trạng quá tải hoặc thiếu việc của xưởng trong những ngày tới dựa trên lịch hẹn và xe tồn.',
      route: '/factory/dashboard/capacity',
      steps: [
        '1. Chuyển sang tab [Công suất Xưởng].',
        '2. Hệ thống hiển thị sơ đồ các Cầu nâng (Bays) hiện có. Cầu màu xanh là đang trống, màu đỏ là đang có xe, màu vàng là bảo trì.',
        '3. Đánh giá tỷ lệ lấp đầy (Occupancy Rate) của ngày hôm nay. Nếu đạt trên 90%, cân nhắc báo Cố vấn dịch vụ hạn chế nhận thêm xe vãng lai.',
        '4. Xem dự báo công suất cho 3 ngày tiếp theo dựa trên dữ liệu từ Lịch Hẹn (Appointments).',
        '5. Điều phối nhân sự: Xin điều động thêm thợ từ chi nhánh khác nếu dự báo quá tải, hoặc kích hoạt chương trình khuyến mãi giờ vàng nếu dự báo vắng khách.',
      ],
      tips: [
        'Công suất xưởng được tính toán dựa trên tổng số Cầu nâng x Số giờ làm việc x Số lượng thợ hiện diện.',
        'Luôn trừ hao 10-15% công suất cho các trường hợp xe bảo hành hoặc xe hỏng hóc khẩn cấp dọc đường.',
      ],
    },
  ],
};
