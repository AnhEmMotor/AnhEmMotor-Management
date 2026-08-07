export const sectionData = {
  title: "Quản Lý Công Nợ Nhà Cung Cấp",
  description:
    "Cung cấp hệ thống theo dõi và đối soát chi tiết tình hình công nợ với từng nhà cung cấp. Giúp bộ phận Mua hàng và Kế toán nắm rõ các khoản phải trả, lịch sử thanh toán, và các đợt cấn trừ công nợ chuyên sâu.",
  pages: [
    {
      id: "supplier-debt",
      title: "Công nợ phải trả",
      description:
        "Quản lý chi tiết các khoản nợ phát sinh từ các đơn nhập mua hàng hóa, phụ tùng, và dịch vụ từ bên ngoài.",
      route: "/warehouse/debt/supplier",
      steps: [
        "1. Truy cập [Kho & Hậu Cần] -> [Công Nợ] -> [Công Nợ Phải Trả].",
        "2. Giao diện Tổng quan sẽ hiển thị Tổng nợ phải trả, Danh sách các Nhà cung cấp đang có dư nợ, và biểu đồ Phân bổ công nợ theo thời hạn.",
        "3. Chọn một Nhà cung cấp cụ thể (ví dụ: Honda Việt Nam) để xem Sổ chi tiết công nợ.",
        "4. Trong Sổ chi tiết, bạn sẽ thấy danh sách các chứng từ phát sinh công nợ (Phiếu nhập kho, Hóa đơn mua hàng) và các chứng từ giảm trừ công nợ (Phiếu chi, Ủy nhiệm chi).",
        "5. Để thanh toán một khoản nợ, nhấn nút [Thanh Toán / Tạo Phiếu Chi].",
        "6. Điền số tiền thanh toán. Hệ thống cho phép bạn thanh toán đích danh cho một (hoặc nhiều) chứng từ nhập kho cụ thể, hoặc thanh toán trừ lùi theo tuổi nợ (FIFO - nợ cũ trả trước).",
        "7. Khi hoàn tất, dư nợ của Nhà cung cấp sẽ tự động giảm xuống và chứng từ tương ứng sẽ chuyển sang trạng thái 'Đã thanh toán'.",
      ],
      tips: [
        "Sử dụng chức năng [Chốt công nợ cuối tháng] để khóa số liệu, gửi biên bản đối chiếu công nợ tự động qua email cho Nhà cung cấp.",
        "Nên thiết lập hạn mức nợ cho từng Nhà cung cấp để hệ thống có thể bật cảnh báo khi tổng nợ vượt quá hạn mức cho phép.",
        "Sử dụng bộ lọc 'Tuổi nợ' để xác định các khoản nợ quá hạn, nợ sắp đến hạn nhằm ưu tiên thanh toán, tránh phạt trả chậm.",
      ],
    },
    {
      id: "debt-clearing",
      title: "Cấn trừ Công nợ (Clearing)",
      description:
        "Thực hiện nghiệp vụ cấn trừ công nợ phức tạp (ví dụ: Nhà cung cấp đồng thời là Khách hàng, hoặc cấn trừ tiền cọc vào tiền hàng).",
      route: "/warehouse/debt/clearing",
      steps: [
        "1. Truy cập [Kho & Hậu Cần] -> [Công Nợ] -> [Cấn trừ Công Nợ].",
        "2. Nhấn [Tạo Phiếu Cấn Trừ Mới].",
        "3. Chọn Loại cấn trừ: Cấn trừ nội bộ (tiền cọc - tiền hàng) hoặc Cấn trừ đối tác (Bù trừ giữa Phải thu và Phải trả).",
        "4. Chọn đối tượng (Nhà cung cấp / Khách hàng) tương ứng.",
        "5. Tick chọn các khoản Phải thu và các khoản Phải trả cần cấn trừ. Đảm bảo tổng số tiền cấn trừ ở hai vế khớp nhau.",
        "6. Nhập lý do cấn trừ, đính kèm biên bản thỏa thuận (nếu có) và nhấn [Xác nhận Cấn Trừ].",
        "7. Giao dịch sẽ được chuyển sang chờ Trưởng phòng Kế toán duyệt trước khi hạch toán chính thức.",
      ],
      tips: [
        "Việc cấn trừ công nợ đòi hỏi sự chính xác cao, luôn yêu cầu đính kèm biên bản đối chiếu có chữ ký hai bên trước khi duyệt.",
        "Phiếu cấn trừ sau khi duyệt sẽ không thể xóa, chỉ có thể lập phiếu hạch toán ngược (reversal) nếu có sai sót.",
      ],
    },
  ],
};
