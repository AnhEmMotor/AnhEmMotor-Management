export const sectionData = {
  title: 'Giao nhận & Vận chuyển (Logistics)',
  description:
    'Trung tâm điều phối hoạt động bàn giao xe. Quản lý lịch trình giao xe tại showroom hoặc điều xe tải giao tận nhà khách hàng.',
  pages: [
    {
      id: 'delivery-management',
      title: 'Quản lý Lịch Giao Xe',
      description: 'Sắp xếp lịch hẹn bàn giao, chuẩn bị xe và lập Biên bản bàn giao kỹ thuật.',
      route: '/order/logistics/delivery',
      steps: [
        "1. Khi Đơn hàng đã thu đủ 100% tiền (hoặc ngân hàng đã giải ngân), trạng thái sẽ tự động nhảy sang 'Chờ Giao Xe'.",
        '2. Bộ phận PDI (Pre-Delivery Inspection) thực hiện rửa xe, kiểm tra bình ắc quy, bơm lốp, châm xăng nhớt và xác nhận trên hệ thống.',
        '3. Điều phối viên chọn hình thức giao: [Tại Showroom] hoặc [Giao Tận Nơi].',
        '4. Nếu Giao Tận Nơi: Nhập biển số xe tải vận chuyển, Tên tài xế, Số điện thoại tài xế và Chi phí vận chuyển (nếu có thu thêm của khách).',
        '5. In [Biên bản Bàn giao xe] gồm 2 bản (Cửa hàng giữ 1, Khách giữ 1).',
        '6. Nhân viên giao xe hướng dẫn khách cách sử dụng các tính năng cơ bản của xe, đưa khách ký Biên bản.',
        "7. Cập nhật trạng thái thành 'Đã giao xe thành công'. Chu trình bán hàng chính thức khép lại.",
      ],
      tips: [
        "Tuyệt đối không được Giao xe khi Kế toán chưa chuyển trạng thái 'Đã thu đủ tiền'. Hệ thống sẽ khóa cứng nút In Biên Bản.",
        'Hình ảnh xe lúc bàn giao (không trầy xước) nên được chụp lại bằng điện thoại và upload lên hệ thống để tránh khiếu nại sau này.',
        'Theo dõi bảng biểu đồ Gantt Chart để xem lịch trình của các xe tải giao hàng trong ngày, tránh xếp lịch chồng chéo.',
      ],
    },
  ],
};
