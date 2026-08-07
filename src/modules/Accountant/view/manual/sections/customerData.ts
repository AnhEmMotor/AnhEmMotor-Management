export const sectionData = {
  title: "Sổ Quỹ Khách Hàng",
  description:
    "Quản lý dòng tiền nộp vào/rút ra của khách hàng, theo dõi các khoản đặt cọc giữ xe và tiền dư trên tài khoản thành viên.",
  pages: [
    {
      id: "customer-ledger",
      title: "Theo dõi Sổ quỹ & Đặt cọc",
      description:
        "Hạch toán tiền cọc, cấn trừ cọc khi mua xe hoặc xử lý hoàn trả cọc.",
      route: "/accountant/customer/ledger",
      steps: [
        "1. Vào menu [Khách hàng] -> [Sổ quỹ Khách hàng].",
        "2. Khi Sales báo có khách cọc xe, Kế toán mở phiếu Thu Cọc.",
        "3. Kiểm tra số tiền nhận được trên tài khoản Ngân hàng (hoặc tiền mặt).",
        "4. Nhấn [Xác nhận thu], hệ thống sẽ ghi có (+) vào Số dư của khách hàng đó.",
        "5. Tới ngày khách lấy xe, khi làm thủ tục thanh toán, hệ thống sẽ tự động gợi ý 'Cấn trừ tiền cọc'. Kế toán chỉ cần thu số tiền còn lại.",
        "6. Nếu khách Hủy cọc: Mở phiếu Yêu cầu hoàn cọc từ Sales, kiểm tra chính sách (có bị phạt không), sau đó làm lệnh Chi tiền hoàn lại cho khách.",
      ],
      tips: [
        "Việc theo dõi Sổ quỹ Khách hàng chặt chẽ giúp công ty không bị thất thoát tiền cọc và tránh các khiếu nại không đáng có.",
        "Tiền cọc chưa phải là Doanh thu, nó được hạch toán vào tài khoản Doanh thu chưa thực hiện (Hoặc Người mua trả tiền trước).",
      ],
    },
  ],
};
