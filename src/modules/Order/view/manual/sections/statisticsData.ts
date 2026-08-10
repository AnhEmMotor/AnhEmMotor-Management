export const sectionData = {
  title: 'Thống Kê & Báo Cáo Bán Hàng',
  description:
    'Bức tranh toàn cảnh về sức khỏe kinh doanh của cửa hàng. Cung cấp dữ liệu Real-time (Thời gian thực) phục vụ phân tích xu hướng và ra quyết định chiến lược.',
  pages: [
    {
      id: 'sales-analytics',
      title: 'Dashboard Doanh Số',
      description:
        'Tập hợp các biểu đồ trực quan (Biểu đồ đường, Biểu đồ cột, Biểu đồ tròn) so sánh doanh thu các tháng.',
      route: '/order/statistics/dashboard',
      steps: [
        '1. Vào [Đơn hàng] -> [Thống kê đơn hàng].',
        "2. Sử dụng Bộ lọc thời gian (Góc trên cùng bên phải): Chọn 'Hôm nay', 'Tuần này', 'Tháng này' hoặc một khoảng thời gian tùy chọn.",
        '3. Xem các chỉ số KPI Core: Tổng doanh thu, Số lượng xe bán ra, Tỷ lệ chốt sale (Conversion Rate), Số tiền trung bình mỗi đơn (AOV).',
        '4. Cuộn xuống để xem [Top 10 xe bán chạy nhất] và [Top nhân viên Sales xuất sắc nhất].',
        '5. Click vào bất kỳ cột nào trên biểu đồ để Drill-down (Đi sâu vào chi tiết), hệ thống sẽ hiển thị danh sách các Đơn hàng tạo nên con số đó.',
        '6. Bấm [Xuất báo cáo PDF] để lấy dữ liệu báo cáo cho cuộc họp Giao ban đầu tuần.',
      ],
      tips: [
        'Màu đỏ trên biểu đồ biểu thị doanh số đang tụt giảm so với cùng kỳ tháng trước, cần có chiến dịch Marketing thúc đẩy ngay.',
        'Bạn có thể tùy chỉnh lại (Customize) Dashboard bằng cách Kéo thả (Drag & Drop) để sắp xếp các Widget theo ý thích.',
      ],
    },
    {
      id: 'profit-margin',
      title: 'Báo cáo Lợi Nhuận Gộp (Gross Margin)',
      description:
        'Chỉ dành cho Cấp Quản Lý/Giám Đốc: Xem lợi nhuận thực tế thu về sau khi trừ giá vốn hàng bán và chiết khấu.',
      route: '/order/statistics/margin',
      steps: [
        '1. Chuyển sang Tab [Lợi nhuận Gộp]. Yêu cầu nhập mã PIN bảo mật (Secondary Password).',
        '2. Bảng phân tích sẽ hiển thị: Doanh thu thuần - Giá vốn nhập kho = Lợi nhuận gộp.',
        '3. Xem được biên lợi nhuận trên từng chiếc xe cụ thể (Ví dụ bán SH lãi 15tr, bán Wave lãi 1tr).',
        '4. Giúp Giám đốc đưa ra quyết định dòng xe nào nên đẩy mạnh bán ra, dòng nào nên cắt giảm nhập hàng.',
      ],
      tips: [
        'Doanh số cao chưa chắc lợi nhuận đã cao (nếu nhân viên dùng quá nhiều Voucher). Báo cáo này là thước đo chuẩn xác nhất.',
        'Dữ liệu được bảo mật mã hóa mức cao, tuyệt đối không chia sẻ tài khoản cho cấp dưới.',
      ],
    },
  ],
};
