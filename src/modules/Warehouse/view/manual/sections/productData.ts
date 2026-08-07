export const sectionData = {
  title: "Danh Mục Sản Phẩm (Master Data)",
  description:
    "Trái tim dữ liệu của toàn hệ thống. Quản lý thông tin trung tâm của mọi loại hàng hóa: Xe nguyên chiếc, Phụ tùng, Phụ kiện, Quà tặng. Dữ liệu chuẩn xác ở đây đảm bảo mọi phân hệ khác (Bán hàng, Dịch vụ) hoạt động trơn tru.",
  pages: [
    {
      id: "product-list",
      title: "Quản lý Danh mục Sản phẩm",
      description:
        "Thêm mới, cập nhật và quản lý thông tin cốt lõi của Sản phẩm (SKU).",
      route: "/warehouse/products/list",
      steps: [
        "1. Vào menu [Kho & Hậu Cần] -> [Danh mục Sản phẩm].",
        "2. Bấm [Thêm Mới] để tạo một mã hàng.",
        "3. Nhập [Thông tin chung]: Tên sản phẩm, Mã SKU (Nên theo quy chuẩn mã hóa công ty), Đơn vị tính (Chiếc, Bộ, Cái), Nhóm hàng hóa (Xe máy, Phụ tùng thay thế, Nhớt...).",
        "4. Nhập [Thông tin Thuộc tính]: Đối với xe máy, bắt buộc chọn các thuộc tính như Dòng xe (Vision, SH, Exciter), Phân khối (110cc, 150cc), Màu sắc.",
        "5. Tải lên [Hình ảnh sản phẩm] để Sales dễ dàng tư vấn khách hàng.",
        "6. Thiết lập [Chính sách Giá]: Giá nhập tiêu chuẩn (để ước tính), Giá bán lẻ đề xuất, Giá bán buôn tối thiểu.",
        "7. Cấu hình [Quản lý Tồn Kho]: Đánh dấu tick vào 'Quản lý theo Serial/Số khung' nếu đây là Xe nguyên chiếc. (CỰC KỲ QUAN TRỌNG, không thể sửa sau khi đã phát sinh giao dịch).",
        "8. Nhấn [Lưu] để đưa sản phẩm vào hệ thống.",
      ],
      tips: [
        "Sử dụng công cụ [Import từ Excel] để đẩy hàng nghìn mã phụ tùng vào hệ thống nhanh chóng thay vì nhập tay.",
        "Không bao giờ xóa một sản phẩm đã có giao dịch. Hãy sử dụng chức năng 'Ngừng kinh doanh' (Deactivate) để ẩn nó đi, giữ nguyên lịch sử báo cáo.",
      ],
    },
    {
      id: "product-combos",
      title: "Quản lý Combo / Phụ kiện xe",
      description:
        "Tạo các gói combo (Ví dụ: Xe Vision + Phủ Nano + Gắn định vị) hoặc quản lý BOM (Bill of Materials) cho lắp ráp xe.",
      route: "/warehouse/products/combos",
      steps: [
        "1. Vào [Danh mục Sản phẩm] -> Tab [Gói Combo].",
        "2. Nhấn [Tạo Gói Combo]. Nhập tên gói (Ví dụ: 'Gói Tiện Ích Honda SH').",
        "3. Ở phần [Danh sách thành phần], tìm và thêm các sản phẩm con (Ví dụ: 1x Bộ ốp carbon, 1x Cảm biến áp suất lốp, 1x Nhân công lắp đặt).",
        "4. Thiết lập Giá bán của Combo (Thường sẽ rẻ hơn tổng giá bán lẻ của các thành phần cộng lại để kích cầu).",
        "5. Lưu lại. Khi Sales bán Gói Combo này, kho sẽ tự động nhận lệnh xuất kho cho tất cả các phụ tùng thành phần bên trong.",
      ],
      tips: [
        "Sử dụng Combo giúp Sales bán up-sell dễ dàng hơn mà không phải nhập từng món đồ chơi vào báo giá cho khách.",
        "Thành phần của Combo có thể bao gồm cả 'Sản phẩm Dịch vụ' (nhân công), kho chỉ xuất vật tư, phần nhân công sẽ chuyển qua lệnh sửa chữa cho Xưởng.",
      ],
    },
  ],
};
