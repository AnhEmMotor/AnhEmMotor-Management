export const sectionData = {
  title: "Báo cáo hợp đồng",
  description: "Tổng hợp các hợp đồng mua bán xe, trả góp và dịch vụ.",
  pages: [
    {
      id: "contract-report",
      title: "Báo cáo hợp đồng",
      description: "Xem chi tiết tình trạng của tất cả hợp đồng.",
      route: "/Accountant/contract",
      steps: [
        "Lọc hợp đồng theo trạng thái (chờ duyệt, đã ký, đã hủy).",
        "Theo dõi tiến độ thanh toán của từng hợp đồng.",
        "Xuất danh sách hợp đồng để đối soát nội bộ.",
      ],
      tips: [
        "Chú ý các hợp đồng sắp đến hạn thanh toán để nhắc nhở khách hàng.",
      ],
    },
  ],
};
