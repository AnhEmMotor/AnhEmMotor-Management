export const sectionData = {
  title: "Đơn hàng Nháp (Drafts)",
  description:
    "Bộ đệm lưu trữ tạm thời các phiên tư vấn bán hàng chưa hoàn tất. Tiết kiệm thời gian nhập liệu lại từ đầu khi khách hàng quay lại cửa hàng.",
  pages: [
    {
      id: "draft-management",
      title: "Quản lý Đơn Nháp",
      description:
        "Thao tác khôi phục, chỉnh sửa hoặc hủy các đơn hàng đang soạn dở dang.",
      route: "/order/drafts",
      steps: [
        "1. Trên màn hình tạo đơn hàng, nếu khách có việc gấp phải về hoặc cần thêm thời gian suy nghĩ, nhấn [Lưu Nháp].",
        "2. Đơn hàng sẽ xuất hiện trong danh sách [Đơn hàng] -> [Đơn Nháp] với mã màu Xám để dễ phân biệt.",
        "3. Khi khách quay lại, tìm kiếm nhanh bằng SĐT hoặc Tên khách hàng.",
        "4. Nhấn biểu tượng cây bút [Chỉnh sửa] để mở lại toàn bộ giỏ hàng, thông tin đã nhập trước đó.",
        "5. Cập nhật lại giá xe và chương trình khuyến mãi (vì có thể giá đã thay đổi so với hôm trước).",
        "6. Thuyết phục khách chốt đơn và nhấn [Chuyển thành Đơn hàng] để tiếp tục quy trình mua bán thông thường.",
        "7. Đối với các đơn nháp tồn đọng quá lâu, có thể chọn nhiều đơn cùng lúc và nhấn [Xóa] để dọn dẹp hệ thống.",
      ],
      tips: [
        "Cực kỳ hữu ích trong những ngày cao điểm (như cuối tuần), Sales có thể lưu nháp cho nhiều khách cùng lúc mà không sợ mất dữ liệu.",
        "Hệ thống sẽ tự động quét và xóa vĩnh viễn các đơn nháp không có tương tác sau 30 ngày.",
        "Việc lưu nháp KHÔNG giữ chỗ xe trong kho (Không ảnh hưởng đến tồn kho khả dụng).",
      ],
    },
  ],
};
