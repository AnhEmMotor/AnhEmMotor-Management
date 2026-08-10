export const sectionData = {
  title: 'Sổ Cái & Sổ Chi Tiết Vật Tư',
  description:
    'Trích xuất sổ sách kho theo chuẩn kế toán. Sổ chi tiết vật tư giúp theo dõi chính xác vòng đời của từng món hàng từ khi nhập vào cho đến khi xuất ra, đảm bảo tính minh bạch 100% trong số liệu kho.',
  pages: [
    {
      id: 'inventory-ledger',
      title: 'Sổ Chi Tiết Vật Tư (Thẻ Kho)',
      description:
        'Thẻ kho kỹ thuật số ghi nhận từng giao dịch nhập, xuất, điều chỉnh của một mặt hàng cụ thể.',
      route: '/warehouse/ledger/detail',
      steps: [
        '1. Vào menu [Kho & Hậu Cần] -> [Sổ Kho] -> [Sổ Chi Tiết Vật Tư].',
        '2. Điền thông tin bắt buộc: Chọn Kho Hàng, Chọn Sản Phẩm (Mã SKU), Chọn Khoảng thời gian.',
        '3. Nhấn [Truy Xuất Dữ Liệu].',
        '4. Báo cáo sẽ hiển thị lần lượt theo trình tự thời gian (Chronological Order): Dòng đầu tiên là Số dư Tồn đầu kỳ. Tiếp theo là các Phiếu Nhập / Phiếu Xuất phát sinh trong ngày, kèm theo Số lượng Nhập, Số lượng Xuất và Tồn lũy kế sau mỗi giao dịch.',
        "5. Cột 'Giá trị Tồn lũy kế' giúp Kế toán kiểm tra sự hợp lý của việc tính giá xuất kho.",
        '6. Click vào mã Chứng từ (Ví dụ: PN001, PX045) trên bảng kê để mở trực tiếp phiếu gốc xem chi tiết người lập, chữ ký và lý do.',
      ],
      tips: [
        'Thẻ kho là công cụ mạnh mẽ nhất để giải quyết tranh chấp khi thủ kho báo mất hàng hoặc số liệu không khớp. Truy xuất thẻ kho sẽ lòi ra sai sót ở bước nào.',
        'Mỗi dòng giao dịch đều có lưu vết User thực hiện và Thời gian thực (Timestamp) không thể sửa đổi.',
      ],
    },
    {
      id: 'period-closing',
      title: 'Khóa Sổ Kho Kỳ Kế Toán',
      description:
        'Nghiệp vụ chốt số liệu cuối tháng, ngăn chặn việc sửa chữa chứng từ lùi ngày làm thay đổi Tồn Đầu Kỳ.',
      route: '/warehouse/ledger/closing',
      steps: [
        '1. Chỉ User có quyền [Quản Trị Kho] hoặc [Kế Toán Trưởng] mới được thực hiện.',
        '2. Vào menu [Kho & Hậu Cần] -> [Sổ Kho] -> [Khóa Sổ Kỳ].',
        "3. Kiểm tra các cảnh báo của hệ thống (Ví dụ: Có 5 Phiếu nhập đang lưu nháp chưa chốt). Cần xử lý hết các chứng từ 'treo' trước khi khóa sổ.",
        '4. Chọn Tháng cần khóa (Ví dụ: Tháng 07/2026) và nhấn [Thực Hiện Khóa Sổ].',
        '5. Hệ thống sẽ tính toán lại toàn bộ giá trị tồn kho lần cuối, lưu snapshot (bản chụp) số dư và khóa mọi thao tác Thêm/Sửa/Xóa chứng từ kho có ngày trước ngày khóa sổ.',
        '6. In Biên bản khóa sổ, Kế toán kho và Thủ kho ký chữ ký số hoặc ký giấy lưu trữ.',
      ],
      tips: [
        "Nếu sau khi khóa sổ phát hiện sai sót nghiêm trọng, chỉ có Kế toán trưởng mới có quyền 'Mở khóa sổ'. Hệ thống sẽ gửi email tự động cho Ban Giám Đốc khi hành động này diễn ra.",
        'Khuyên dùng: Thực hiện kiểm kê kho vật lý vào ngày cuối tháng trước khi bấm nút Khóa Sổ trên phần mềm.',
      ],
    },
  ],
};
