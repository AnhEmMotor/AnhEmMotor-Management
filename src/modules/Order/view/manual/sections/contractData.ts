export const sectionData = {
  title: 'Quản lý Hợp đồng & Hồ sơ',
  description:
    'Trung tâm quản lý tính pháp lý của giao dịch. Giúp số hóa toàn bộ hợp đồng mua bán, biên bản bàn giao, sổ bảo hành, đảm bảo không thất thoát chứng từ quan trọng.',
  pages: [
    {
      id: 'contract-generation',
      title: 'Soạn thảo và Quản lý Hợp đồng',
      description:
        'Quy trình tự động hóa việc tạo hợp đồng từ dữ liệu đơn hàng, chuẩn hóa các điều khoản pháp lý và lưu trữ điện tử.',
      route: '/order/contracts/management',
      steps: [
        '1. Truy cập [Đơn hàng] -> [Quản lý Hợp đồng]. Màn hình sẽ hiển thị danh sách các Hợp đồng đang hiệu lực, đã thanh lý hoặc bị hủy.',
        '2. Để tạo Hợp đồng mới, chọn nút [Tạo từ Đơn đặt hàng]. Hệ thống sẽ yêu cầu bạn nhập Mã đơn hàng (Order ID).',
        '3. Toàn bộ thông tin Khách hàng, Sản phẩm (Số khung, Số máy), Giá trị thanh toán sẽ tự động được ánh xạ (map) vào biểu mẫu hợp đồng.',
        '4. Lựa chọn Mẫu hợp đồng: Tùy thuộc vào loại hình (Hợp đồng cá nhân, Hợp đồng B2B, Hợp đồng trả góp).',
        '5. Tùy chỉnh các điều khoản bổ sung (nếu có thỏa thuận riêng với khách) trong trình soạn thảo văn bản tích hợp sẵn.',
        '6. Nhấn [Xem trước PDF] để kiểm tra format, lỗi chính tả trước khi in.',
        '7. Nhấn [Ký số & Phát hành]: Nếu công ty sử dụng chữ ký số (e-Signature), hợp đồng sẽ được ký tự động và gửi vào Email của khách hàng.',
        "8. Đổi trạng thái hợp đồng thành 'Đang thực hiện'. Kế toán sẽ căn cứ vào đây để theo dõi tiến độ thu tiền.",
      ],
      tips: [
        'Sử dụng công cụ [Tìm kiếm toàn văn - Fulltext Search] để tìm nhanh một điều khoản hoặc tên khách hàng trong hàng ngàn hợp đồng.',
        'Hệ thống tự động đóng dấu nước (Watermark) logo công ty lên file PDF để chống làm giả.',
        'Mọi hành vi chỉnh sửa hợp đồng sau khi đã phát hành đều bị hệ thống ghi log lại (Audit trail) để truy vết trách nhiệm.',
      ],
    },
    {
      id: 'document-archiving',
      title: 'Lưu trữ Hồ sơ xe (Sổ bảo hành, Đăng kiểm)',
      description:
        'Quản lý các tài liệu đi kèm của phương tiện, hỗ trợ đắc lực cho dịch vụ hậu mãi và đăng ký xe hộ khách.',
      route: '/order/contracts/documents',
      steps: [
        '1. Tại giao diện chi tiết Hợp đồng, chuyển sang tab [Hồ sơ đính kèm].',
        '2. Nhấn [Tải lên tài liệu] để lưu trữ các bản scan: CCCD khách hàng, Sổ hộ khẩu, Biên lai đóng thuế trước bạ.',
        "3. Đối với dịch vụ Đăng ký xe hộ (Bao giấy tờ): Nhân viên cập nhật trạng thái 'Đang bốc biển số', 'Đã có cà vẹt'.",
        '4. Nhập thông tin Biển số xe và Mã Sổ bảo hành vào hệ thống để kích hoạt bảo hành điện tử (e-Warranty) trên app của khách hàng.',
        '5. Bàn giao bộ hồ sơ gốc cho khách và yêu cầu khách ký điện tử trên màn hình tablet xác nhận đã nhận đủ giấy tờ.',
      ],
      tips: [
        'Việc kích hoạt Sổ bảo hành điện tử là bắt buộc để khách hàng có thể đem xe đến bảo dưỡng định kỳ miễn phí.',
        'Hệ thống giới hạn dung lượng tải lên là 5MB/file, khuyến khích sử dụng định dạng PDF hoặc JPG nén.',
      ],
    },
  ],
};
