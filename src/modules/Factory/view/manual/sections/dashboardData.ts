import type { GuideSection } from "../data/guideData"

export const sectionData = {
  title: "Dashboard Xưởng",
  description: "Bảng điều khiển cung cấp cái nhìn tổng quan về tình hình hoạt động của xưởng dịch vụ.",
  pages: [
    {
      id: "overview",
      title: "Tổng quan hoạt động",
      description: "Xem các chỉ số KPI, hiệu suất nhân viên và doanh thu xưởng.",
      route: "/factory/workshop/dashboard",
      steps: [
        "Xem tổng số phiếu sửa chữa trong ngày.",
        "Kiểm tra doanh thu dự kiến.",
        "Theo dõi số lượng xe đang chờ sửa chữa."
      ],
      tips: ["Hãy làm mới trang thường xuyên để cập nhật số liệu mới nhất."]
    }
  ]
}
