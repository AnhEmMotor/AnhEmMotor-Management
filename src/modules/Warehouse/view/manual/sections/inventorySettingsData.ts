export const sectionData = {
  title: "Cấu Hình & Cài Đặt Kho",
  description:
    "Thiết lập các thông số nền tảng cho việc vận hành kho: Cấu trúc kho, vị trí lưu trữ (Bin/Location), lý do xuất/nhập, và các tham số tính giá tồn kho.",
  pages: [
    {
      id: "warehouse-structure",
      title: "Thiết Lập Cấu Trúc Kho",
      description:
        "Khai báo danh sách các kho vật lý và sơ đồ vị trí lưu trữ bên trong mỗi kho.",
      route: "/warehouse/settings/structure",
      steps: [
        "1. Vào menu [Kho & Hậu Cần] -> [Cài đặt] -> [Cấu Trúc Kho].",
        "2. Nhấn [Thêm Kho Mới] để tạo một kho vật lý (Ví dụ: Kho Tổng Bình Dương, Kho Showroom Q1, Kho Phụ Tùng Tầng 2).",
        "3. Điền thông tin Kho: Mã Kho, Tên Kho, Địa chỉ, Người thủ kho phụ trách chính, Số điện thoại liên hệ.",
        "4. Kích hoạt tính năng [Quản lý theo Vị trí (Location/Bin)] nếu muốn theo dõi hàng chi tiết đến từng kệ.",
        "5. Trong Tab [Vị trí lưu trữ], nhấn [Thêm Vị Trí] để tạo cấu trúc dãy-kệ-tầng (Ví dụ: Dãy A - Kệ 01 - Tầng 2 -> Mã vị trí: A-01-02).",
        "6. In mã Barcode cho từng Vị trí dán lên kệ thực tế để thuận tiện khi dùng App quét chuyển vị trí.",
      ],
      tips: [
        "Nên tạo một 'Kho Ảo' (Virtual Warehouse) có tên 'Kho Hàng Đang Đi Đường' để quản lý hàng hóa đã xuất từ nhà cung cấp nhưng chưa về đến Showroom.",
        "Đừng chia vị trí quá nhỏ bé nếu quy mô nhân sự không đủ để duy trì việc dán tem và quét tem mỗi khi di chuyển hàng hóa, điều này sẽ tạo ra áp lực và rác dữ liệu.",
      ],
    },
    {
      id: "reason-codes",
      title: "Danh Mục Lý Do Nhập/Xuất",
      description:
        "Chuẩn hóa các nguyên nhân xuất nhập kho để phục vụ cho báo cáo phân tích sau này.",
      route: "/warehouse/settings/reason-codes",
      steps: [
        "1. Vào [Cài đặt] -> [Lý do Nhập/Xuất].",
        "2. Nhấn [Thêm Lý Do].",
        "3. Đặt Tên lý do (Ví dụ: 'Xuất hàng hỏng để tiêu hủy', 'Xuất dùng nội bộ cho Event', 'Xuất bảo hành').",
        "4. Chọn Loại phiếu áp dụng (Phiếu Xuất Khác, Phiếu Nhập Khác).",
        "5. Gắn [Tài khoản Kế toán ngầm định] (Tùy chọn) để hệ thống tự động hạch toán vào chi phí tương ứng khi kế toán tiếp nhận chứng từ.",
      ],
      tips: [
        "Việc bắt buộc thủ kho chọn Lý do chuẩn hóa sẽ giúp Báo cáo Chi phí hoạt động chính xác hơn rất nhiều so với việc để thủ kho gõ lý do bằng văn bản tự do.",
      ],
    },
    {
      id: "inventory-valuation",
      title: "Phương Pháp Tính Giá Tồn Kho",
      description:
        "Cấu hình phương pháp tính giá trị hàng hóa xuất kho. Ảnh hưởng trực tiếp đến Báo cáo Lợi Nhuận Gộp.",
      route: "/warehouse/settings/valuation",
      steps: [
        "1. Cài đặt này thường chỉ được thay đổi 1 lần khi mới thiết lập hệ thống, do Giám đốc Tài chính (CFO) quyết định.",
        "2. Đi tới [Cài đặt] -> [Tính Giá Tồn Kho].",
        "3. Đối với Nhóm Xe Nguyên Chiếc: Hệ thống bắt buộc sử dụng phương pháp [Đích Danh] (Vì mỗi xe có Số Khung riêng, giá nhập riêng biệt).",
        "4. Đối với Nhóm Phụ Tùng & Phụ Kiện: Lựa chọn giữa [Bình Quân Gia Quyền Cuối Kỳ], [Bình Quân Gia Quyền Tức Thời], hoặc [FIFO - Nhập trước Xuất trước]. Mặc định hệ thống dùng Bình Quân Tức Thời.",
        "5. Nhấn [Lưu Cấu Hình] và xác nhận bằng mật khẩu cấp quản lý.",
      ],
      tips: [
        "KHÔNG thay đổi phương pháp tính giá khi đã có dữ liệu phát sinh trong kỳ kế toán. Nếu bắt buộc phải đổi, chỉ đổi vào ngày mùng 1 đầu năm tài chính sau khi đã chốt và chuyển số dư.",
      ],
    },
  ],
};
