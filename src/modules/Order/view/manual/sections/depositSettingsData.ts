export const sectionData = {
  title: "Cài đặt đặt cọc",
  description:
    "Thiết lập cấu hình và số tiền đặt cọc tối thiểu cho từng dòng xe.",
  pages: [
    {
      id: "deposit-settings",
      title: "Cài đặt đặt cọc",
      description: "Cấu hình tỷ lệ đặt cọc, số tiền tối thiểu để giữ xe.",
      route: "/Order/management/deposit-settings",
      steps: [
        "Chọn dòng xe cần thiết lập chính sách.",
        "Nhập số tiền cọc tối thiểu hoặc tỷ lệ % so với giá xe.",
        "Lưu cấu hình để áp dụng cho các đơn hàng mới.",
      ],
      tips: ["Nên thiết lập số tiền cọc phù hợp với độ hiếm của từng dòng xe."],
    },
  ],
};
