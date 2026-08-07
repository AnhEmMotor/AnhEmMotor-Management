export const sectionData = {
  title: "Hồ Sơ Nhà Cung Cấp (Vendor Management)",
  description:
    "Nơi lưu trữ và quản lý tập trung toàn bộ thông tin của các đối tác cung cấp hàng hóa, phụ tùng và dịch vụ cho doanh nghiệp. Quản lý công nợ, đánh giá hiệu suất giao hàng và bảng giá thỏa thuận.",
  pages: [
    {
      id: "supplier-profile",
      title: "Hồ sơ Nhà Cung Cấp",
      description:
        "Thêm mới và cập nhật thông tin liên hệ, pháp lý, và chính sách của nhà cung cấp.",
      route: "/warehouse/suppliers/list",
      steps: [
        "1. Truy cập [Kho & Hậu Cần] -> [Nhà Cung Cấp] -> [Danh sách NCC].",
        "2. Nhấn [Thêm Nhà Cung Cấp].",
        "3. Nhập [Thông tin chung]: Tên Công ty, Mã Số Thuế (Rất quan trọng cho xuất hóa đơn), Địa chỉ trụ sở, và Loại NCC (Honda, Hãng lốp, Dịch vụ ngoài...).",
        "4. Tab [Người liên hệ]: Thêm thông tin của các bạn Sales hoặc Kế toán bên NCC (Tên, SĐT, Email, Zalo) để thuận tiện liên lạc.",
        "5. Tab [Chính sách Tài chính]: Khai báo Hạn mức tín dụng (Ví dụ: Cho nợ tối đa 500 triệu), Thời hạn thanh toán (Ví dụ: Net 30), và Tài khoản ngân hàng của NCC.",
        "6. Tab [Tài liệu đính kèm]: Tải lên giấy phép kinh doanh, hợp đồng nguyên tắc bản scan để lưu trữ hồ sơ số.",
        "7. Nhấn [Lưu] để hoàn tất.",
      ],
      tips: [
        "Đừng bao giờ nhập trùng mã số thuế. Hệ thống sẽ tự động chặn và cảnh báo nếu bạn cố tình tạo 2 nhà cung cấp có cùng một MST để tránh sai sót công nợ.",
        "Tích cực cập nhật Zalo của người liên hệ để dùng tính năng gửi PO qua Zalo ZNS trong tương lai.",
      ],
    },
    {
      id: "supplier-pricelist",
      title: "Bảng Giá Thỏa Thuận (Pricelist)",
      description:
        "Quản lý bảng giá nhập riêng biệt mà từng Nhà cung cấp dành cho công ty.",
      route: "/warehouse/suppliers/pricelists",
      steps: [
        "1. Từ màn hình Chi tiết Nhà cung cấp, chuyển sang tab [Bảng giá].",
        "2. Nhấn [Tạo Bảng Giá Mới].",
        "3. Tải lên file Excel báo giá mới nhất từ NCC (Hệ thống cung cấp sẵn mẫu Template Excel).",
        "4. Cấu hình [Hiệu lực áp dụng]: Bảng giá này bắt đầu có hiệu lực từ ngày nào đến ngày nào.",
        "5. Khi tạo Đơn đặt hàng (PO) trong tương lai nằm trong khoảng thời gian này, hệ thống sẽ ưu tiên lấy giá từ Bảng giá này thay vì giá tiêu chuẩn của sản phẩm.",
      ],
      tips: [
        "Bảng giá có tính kế thừa. Bảng giá tạo sau (có ngày hiệu lực mới hơn) sẽ đè lên bảng giá cũ.",
        "Phần mềm hỗ trợ tính năng [So sánh giá NCC]. Bấm vào một mã phụ tùng, hệ thống sẽ hiện ra lịch sử giá và liệt kê NCC nào đang bán mã đó rẻ nhất.",
      ],
    },
  ],
};
