export const sectionData = {
  title: "Báo Cáo Nhập Xuất Tồn",
  description:
    "Trái tim của phân hệ quản lý Kho. Cung cấp cái nhìn toàn cảnh và chi tiết về số lượng, giá trị hàng hóa nhập vào, xuất ra và tồn kho thực tế trong mọi kỳ kế toán.",
  pages: [
    {
      id: "inventory-report",
      title: "Báo cáo Tồn Kho Hiện Tại",
      description:
        "Tra cứu nhanh số lượng tồn kho theo thời gian thực tại toàn bộ các kho hoặc một kho cụ thể.",
      route: "/warehouse/reports/current-stock",
      steps: [
        "1. Truy cập [Kho & Hậu Cần] -> [Báo cáo Nhập Xuất Tồn] -> [Tồn Kho Hiện Tại].",
        "2. Chọn Chi nhánh / Kho hàng cần xem (Ví dụ: Kho Xe Nguyên Chiếc - Showroom Quận 1).",
        "3. Hệ thống sẽ hiển thị danh sách toàn bộ sản phẩm cùng số lượng tồn: Tồn hệ thống, Tồn thực tế (sau kiểm kê), Số lượng Đang chờ xuất (dành cho đơn hàng đã đặt cọc), Số lượng khả dụng (Có thể bán ngay).",
        "4. Sử dụng thanh công cụ để tìm kiếm theo Mã SKU, Số Khung, Số Máy, Tên xe, hoặc Lọc theo Nhóm hàng.",
        "5. Để xem chi tiết vị trí lưu trữ (Kệ, Hàng, Tầng), bấm vào biểu tượng [Chi tiết (Mắt)] ở cuối dòng sản phẩm.",
        "6. Nhấn nút [Xuất Excel] để tải toàn bộ bảng kê tồn kho về máy định dạng .xlsx để báo cáo hoặc xử lý thêm.",
      ],
      tips: [
        "Cột 'Số lượng Khả dụng' (Available Qty) đặc biệt quan trọng. Nó bằng [Tồn thực tế] trừ đi [Số lượng đã chốt cho đơn hàng nhưng chưa xuất kho]. Sales cần nhìn vào cột này để biết có thể bán hay không.",
        "Sử dụng tính năng 'Cảnh báo tồn kho' để hệ thống tô đỏ các mặt hàng đang dưới mức Tồn kho an toàn.",
      ],
    },
    {
      id: "in-out-summary",
      title: "Bảng Kê Nhập Xuất Tồn (Theo Kỳ)",
      description:
        "Báo cáo chi tiết sự biến động của hàng hóa từ Tồn Đầu Kỳ, Nhập Trong Kỳ, Xuất Trong Kỳ đến Tồn Cuối Kỳ.",
      route: "/warehouse/reports/in-out-summary",
      steps: [
        "1. Truy cập [Kho & Hậu Cần] -> [Báo cáo Nhập Xuất Tồn] -> [Bảng Kê Nhập Xuất Tồn].",
        "2. Chọn Khoảng thời gian (Ví dụ: Tháng 07/2026).",
        "3. Chọn Kho hàng cần báo cáo, hoặc để trống để xem tổng hợp toàn công ty.",
        "4. Bấm [Tạo Báo Cáo].",
        "5. Hệ thống sẽ tính toán và hiển thị bảng dữ liệu với các cột: Mã SP, Tên SP, ĐVT, Tồn Đầu Kỳ (Số lượng, Giá trị), Nhập Trong Kỳ (Số lượng, Giá trị), Xuất Trong Kỳ (Số lượng, Giá trị), Tồn Cuối Kỳ (Số lượng, Giá trị).",
        "6. Click đúp vào một dòng sản phẩm để xem 'Sổ Chi Tiết Vật Tư' - liệt kê từng phiếu nhập, phiếu xuất liên quan đến sản phẩm đó trong kỳ.",
      ],
      tips: [
        "Giá trị tồn kho được tính toán dựa trên phương pháp tính giá xuất kho đã cài đặt (Bình quân gia quyền, FIFO, hoặc Đích danh). Mặc định đối với xe máy nguyên chiếc là Đích danh (theo Số khung/Số máy).",
        "Các báo cáo xuất ra Excel luôn chứa sẵn công thức Sum, giúp bạn dễ dàng đối chiếu số liệu tổng.",
        "Nên khóa sổ kho cuối mỗi tháng để đảm bảo số liệu Nhập Xuất Tồn đầu kỳ sau luôn khớp với cuối kỳ trước.",
      ],
    },
  ],
};
