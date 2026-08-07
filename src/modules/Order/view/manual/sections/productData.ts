export const sectionData = {
  title: "Bán lẻ POS & Phụ tùng",
  description:
    "Màn hình bán hàng nhanh (Point of Sale) chuyên dụng cho các giao dịch nhỏ lẻ: Khách vãng lai mua nón bảo hiểm, chai nhớt, phụ kiện trang trí mà không cần lập hồ sơ phức tạp.",
  pages: [
    {
      id: "pos-retail",
      title: "Giao diện Bán hàng POS",
      description:
        "Tối ưu hóa thao tác bằng phím tắt và đầu đọc mã vạch, xử lý hàng trăm khách mỗi ngày mà không bị nghẽn ở quầy thu ngân.",
      route: "/order/product/pos",
      steps: [
        "1. Truy cập [Đơn hàng] -> [Bán lẻ POS]. Giao diện sẽ hiển thị toàn màn hình (Full-screen) để dễ thao tác.",
        "2. Dùng súng bắn mã vạch quét trực tiếp lên tem sản phẩm. Sản phẩm sẽ tự động nhảy vào Giỏ hàng bên phải.",
        "3. Nếu không có mã vạch, gõ từ khóa (VD: 'Nón', 'Nhớt') vào thanh tìm kiếm, hệ thống hiển thị danh sách dạng lưới ảnh để click chọn.",
        "4. Tùy chỉnh số lượng (bằng phím + - hoặc gõ số), áp dụng chiết khấu trực tiếp trên từng dòng sản phẩm.",
        "5. Nhập số tiền Khách Đưa vào ô [Tiền khách trả] (hoặc dùng các nút mệnh giá nhanh như 500k, 1 triệu).",
        "6. Hệ thống báo số tiền Thối Lại (Change).",
        "7. Nhấn Enter hoặc F4 để [Thanh Toán & In Bill]. Hóa đơn máy in nhiệt 80mm sẽ được in ra tự động.",
        "8. Giao diện tự động reset trắng để chuẩn bị đón khách tiếp theo.",
      ],
      tips: [
        "Hỗ trợ kết nối trực tiếp với Ngăn kéo đựng tiền (Cash Drawer) qua máy in hóa đơn. Ngăn kéo tự bật ra khi ấn Thanh toán.",
        "Sử dụng chức năng [Lưu tạm] (Hold Bill) nếu khách đang tính tiền nhưng sực nhớ quên mua một món đồ và chạy đi lấy, để thanh toán cho người đứng sau trước.",
        "Có thể chọn Tên Khách Hàng (Tích điểm thẻ thành viên) nếu khách có đọc số điện thoại.",
      ],
    },
  ],
};
