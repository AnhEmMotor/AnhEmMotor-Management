export const sectionData = {
  title: 'Quản Lý Hợp Đồng Mua (B2B)',
  description:
    'Phân hệ cốt lõi để theo dõi và quản lý các hợp đồng mua sắm số lượng lớn từ nhà cung cấp (Honda, Yamaha, Nhà phân phối phụ tùng, xưởng đóng thùng, phụ kiện, ...), đảm bảo việc nhập hàng đúng tiến độ và cam kết thanh toán đúng hạn.',
  pages: [
    {
      id: 'purchase-contracts',
      title: 'Quản lý Hợp đồng Mua sắm',
      description:
        'Quản lý chặt chẽ tiến độ giao hàng chia thành nhiều đợt và kiểm soát các điều khoản công nợ của các hợp đồng B2B.',
      route: '/warehouse/contract/management',
      steps: [
        '1. Vào menu [Kho & Hậu Cần] -> [Hợp đồng Mua] (hoặc Mua Hàng -> Hợp đồng).',
        '2. Nhấn [Tạo Hợp đồng Mới]. Hệ thống sẽ yêu cầu nhập thông tin chi tiết: Tên Hợp đồng, Nhà cung cấp, Giá trị hợp đồng, Ngày ký và Ngày hết hạn.',
        '3. Tải lên (Upload) file PDF bản scan hợp đồng đã ký dấu đỏ, hoặc các phụ lục liên quan để lưu trữ số hóa trên hệ thống.',
        '4. Cấu hình [Lịch giao hàng] (Milestones): Ví dụ hợp đồng mua 100 chiếc Honda Vision sẽ được chia làm 3 đợt giao (Đợt 1: 30 xe, Đợt 2: 30 xe, Đợt 3: 40 xe). Khai báo rõ thời gian dự kiến giao cho từng đợt.',
        '5. Theo dõi Trạng thái thực hiện: Khi thủ kho tiến hành nhập kho và khớp với Đợt 1, hệ thống sẽ tự động gạch ngang đợt 1, đồng thời cập nhật tỷ lệ hoàn thành hợp đồng (Ví dụ: 30%).',
        '6. Cấu hình [Lịch thanh toán]: Lên lịch các đợt thanh toán (Ví dụ: Tạm ứng 30%, Thanh toán 50% khi nhận đợt 1, 20% còn lại). Hệ thống sẽ cảnh báo cho Kế toán biết khi nào cần thanh toán tiền để tránh vi phạm hợp đồng.',
        '7. Quản lý thay đổi: Nếu có sự thay đổi về giá hoặc số lượng, sử dụng chức năng [Phụ lục Hợp đồng] để cập nhật thay vì sửa trực tiếp vào Hợp đồng gốc đã duyệt.',
      ],
      tips: [
        "Sử dụng tính năng 'Gắn thẻ' (Tags) để phân loại Hợp đồng: Hợp đồng Nhập xe nguyên chiếc, Hợp đồng Nhập phụ tùng, Hợp đồng Dịch vụ, giúp việc tìm kiếm dễ dàng hơn.",
        'Khi hợp đồng kết thúc (đã giao đủ hàng và thanh toán đủ tiền), luôn yêu cầu Thủ kho hoặc Quản lý sử dụng chức năng [Thanh lý Hợp đồng] để khóa toàn bộ các giao dịch liên quan, ngăn chặn việc nhập nhầm hàng vào hợp đồng cũ.',
        "Nên thiết lập cảnh báo 'Sắp hết hạn hợp đồng' trước 15 ngày để phòng thu mua kịp thời gia hạn nếu cần.",
      ],
    },
  ],
};
