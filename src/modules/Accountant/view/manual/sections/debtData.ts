export const sectionData = {
  title: "Báo cáo công nợ",
  description: "Theo dõi công nợ khách hàng và nhà cung cấp.",
  pages: [
    {
      id: "debt-management",
      title: "Quản lý công nợ",
      description: "Liệt kê các khoản nợ quá hạn và sắp đến hạn.",
      route: "/Accountant/debt",
      steps: [
        "Mở tab công nợ phải thu hoặc phải trả.",
        "Lọc theo khoảng thời gian và đối tượng.",
        "Tiến hành ghi nhận thanh toán khi có giao dịch.",
      ],
      tips: ["Chú ý các khoản nợ được đánh dấu đỏ (quá hạn)."],
    },
  ],
};
