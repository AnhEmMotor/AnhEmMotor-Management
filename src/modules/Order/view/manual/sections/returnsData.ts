export const sectionData = {
  title: 'Xử lý Hoàn trả (Returns)',
  description:
    'Quy trình nghiêm ngặt xử lý các trường hợp khách hàng muốn trả lại hàng (phụ tùng, xe máy lỗi do nhà sản xuất) và quy trình hoàn tiền.',
  pages: [
    {
      id: 'return-orders',
      title: 'Phiếu Trả Hàng (Return Orders)',
      description:
        'Lập biên bản trả hàng, đánh giá tình trạng hàng hóa và hạch toán khoản tiền phải hoàn lại cho khách.',
      route: '/order/returns/management',
      steps: [
        '1. Khách hàng mang sản phẩm (kèm Hóa đơn mua hàng) đến showroom.',
        '2. Nhân viên truy cập [Đơn hàng] -> [Trả hàng - Hoàn trả].',
        '3. Gõ mã Đơn hàng cũ hoặc quét mã vạch trên Hóa đơn. Hệ thống sẽ liệt kê các món hàng khách đã mua.',
        '4. Tích chọn sản phẩm khách muốn trả lại. Nhập số lượng và Lý do trả (VD: Sai kích cỡ, Hàng lỗi từ nhà máy, Đổi ý).',
        '5. Tải lên hình ảnh tình trạng thực tế của sản phẩm làm bằng chứng.',
        '6. Kỹ thuật viên (hoặc Quản lý) kiểm tra và Xác nhận tình trạng hàng. Hệ thống sẽ tính số tiền cần Hoàn trả (đã trừ phí khấu hao nếu có theo chính sách công ty).',
        '7. Gửi Yêu cầu Hoàn tiền sang phân hệ Kế toán.',
        '8. Sau khi Kế toán chi tiền, Kho sẽ nhận được thông báo để tái nhập sản phẩm đó vào tồn kho hệ thống (hoặc nhập vào kho phế phẩm).',
      ],
      tips: [
        'Nếu là khách đổi từ món A sang món B, hãy sử dụng tính năng [Đổi Hàng Trực Tiếp], hệ thống sẽ tự bù trừ chênh lệch giá trị thay vì phải làm 1 phiếu trả và 1 phiếu mua mới.',
        'Chỉ Quản lý cấp cao mới có quyền thay đổi Phí khấu hao (ví dụ: miễn phí đổi trả cho khách VIP).',
      ],
    },
  ],
};
