export const sectionData = {
  title: "Hợp đồng mua xe",
  description: "Tạo và quản lý hợp đồng mua bán xe chính thức.",
  pages: [
    {
      id: "contract-management",
      title: "Hợp đồng mua xe",
      description:
        "Quản lý hợp đồng có giá trị pháp lý, kèm các điều khoản giao nhận.",
      route: "/Order/management/contract",
      steps: [
        "Từ đơn đặt hàng, tự động sinh Hợp đồng mua bán.",
        "Bổ sung các điều khoản đặc biệt (nếu có).",
        "Ký điện tử hoặc in để ký tươi với khách hàng.",
      ],
      tips: ["Hợp đồng đã ký sẽ không thể chỉnh sửa nội dung."],
    },
  ],
};
