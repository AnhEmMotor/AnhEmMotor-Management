export const sectionData = {
  title: "Công Nợ & Thu Hồi (AR/AP)",
  description:
    "Quản lý khoản phải thu của khách hàng (AR) và khoản phải trả nhà cung cấp (AP), đặc biệt quản lý công nợ xấu.",
  pages: [
    {
      id: "debt-collection",
      title: "Quản lý Công Nợ",
      description: "Đánh giá tuổi nợ và gửi thông báo nhắc nợ tự động.",
      route: "/accountant/debt/management",
      steps: [
        "1. Truy cập [Công Nợ & Thu Hồi].",
        "2. Xem Báo cáo Phân tích Tuổi nợ (Aging Report): Chia ra các cột Nợ trong hạn, Quá hạn 30 ngày, 60 ngày, >90 ngày.",
        "3. Chọn các khách hàng đang quá hạn, nhấn nút [Gửi Email/SMS nhắc nợ].",
        "4. Nếu khách hàng trả nợ, lập Phiếu Thu tiền mặt hoặc Báo Có ngân hàng để cấn trừ (Clear) khoản nợ đó.",
        "5. Đối với Công nợ Phải trả (Nhà cung cấp phụ tùng, Honda/Yamaha): Kế toán lập kế hoạch dòng tiền để lên UNC thanh toán đúng hạn, tránh bị phạt lãi.",
      ],
      tips: [
        "Công nợ > 90 ngày sẽ tự động bôi đỏ cảnh báo nguy cơ nợ xấu.",
        "Nên thiết lập hạn mức tín dụng (Credit Limit) cho các khách sỉ. Vượt hạn mức này hệ thống sẽ khóa chức năng xuất hàng.",
      ],
    },
  ],
};
