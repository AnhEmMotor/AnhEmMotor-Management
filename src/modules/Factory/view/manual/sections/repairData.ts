export const sectionData = {
  title: 'Sửa Chữa (Repair & Service)',
  description:
    'Trái tim của hệ thống Xưởng. Quản lý xuyên suốt từ khâu Cố vấn dịch vụ mở Lệnh sửa chữa (RO) báo giá, đến khi Kỹ thuật viên nhận việc, lĩnh vật tư và hoàn tất công việc.',
  pages: [
    {
      id: 'repair-order',
      title: 'Lệnh sửa chữa (Repair Order - RO)',
      description:
        'Hồ sơ điện tử ghi nhận mọi yêu cầu sửa chữa, chẩn đoán, vật tư xuất kho và công thợ thực hiện trên một chiếc xe.',
      route: '/factory/repair/orders',
      steps: [
        '1. Tại menu [Sửa Chữa], chọn [Lệnh sửa chữa]. Nhấn [Tạo Mới RO].',
        '2. Nhập biển số xe. Hệ thống lấy ra thông tin Khách hàng, Số khung, và Lịch sử sửa chữa cũ.',
        '3. Tab [Yêu cầu khách hàng]: Ghi nhận chính xác mô tả của khách (VD: Xe kêu lụp cụp ở nồi sau).',
        '4. Tab [Kiểm tra & Chẩn đoán]: Cố vấn dịch vụ ghi nhận lỗi thực tế và đưa ra phương án xử lý.',
        '5. Tab [Công việc & Phụ tùng]: Thêm mã Tiền công (Labor) và mã Phụ tùng (Parts) cần thay thế. Hệ thống sẽ tự động tính toán tổng tiền.',
        '6. In Báo giá (Quotation) cho khách hàng ký duyệt.',
        "7. Khi khách đồng ý, chuyển trạng thái RO sang 'Đang sửa chữa'. Lúc này kho mới được phép xuất phụ tùng cho RO này.",
        "8. Khi thợ báo xong, KCS kiểm tra chất lượng rồi chuyển RO sang 'Chờ thanh toán'.",
      ],
      tips: [
        'RO là chứng từ pháp lý, tuyệt đối không được xóa khi đã phát sinh xuất kho hoặc đã in báo giá cho khách.',
        'Bất kỳ phát sinh nào (VD: Đang sửa phát hiện hư thêm phuộc) đều phải làm báo giá bổ sung và khách ký duyệt mới được làm tiếp.',
        "RO có thể gắn cờ 'Khách đợi lấy ngay' để ưu tiên làm nhanh.",
      ],
    },
    {
      id: 'mechanic-assignment',
      title: 'Phân công & Lĩnh vật tư (Dành cho Quản đốc & Thợ)',
      description:
        'Điều phối công việc cho kỹ thuật viên và kiểm soát việc lãnh phụ tùng tại kho xưởng.',
      route: '/factory/repair/assignments',
      steps: [
        '1. Quản đốc mở màn hình [Phân công Kỹ thuật viên].',
        '2. Giao RO cho thợ phù hợp dựa trên tay nghề (Thợ máy, Thợ điện, Thợ đồng sơn).',
        '3. Thợ mở App hoặc Màn hình xưởng, nhấn [Bắt đầu làm việc] để hệ thống đếm giờ thực tế.',
        '4. Thợ cầm Phiếu yêu cầu vật tư (in từ RO) đến quầy Thủ kho xưởng để lãnh đồ.',
        '5. Thủ kho quét mã vạch phụ tùng, hệ thống tự động trừ kho và ghi nhận phụ tùng đó đã gắn lên xe.',
        '6. Thợ nhấn [Hoàn thành] khi ráp xong xe và đưa đi chạy thử.',
      ],
      tips: [
        'Thời gian bắt đầu/kết thúc của thợ là cơ sở để tính lương khoán (Lương KPI).',
        'Thủ kho không được xuất dư phụ tùng so với định mức ghi trong RO. Nếu cần thêm phải yêu cầu Cố vấn dịch vụ cập nhật RO.',
      ],
    },
  ],
};
