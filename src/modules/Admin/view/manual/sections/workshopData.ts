import type { GuideSection } from "../data/guideData"
import { Tools } from "@element-plus/icons-vue"

export const sectionData: GuideSection = {
  id: "workshop",
  title: "Xưởng Dịch Vụ",
  subtitle: "Workshop",
  description:
    "Phân hệ giám sát hoạt động của các Xưởng dịch vụ bao gồm: lịch sử sửa chữa, bảo dưỡng, theo dõi phụ tùng và báo cáo doanh thu dịch vụ.",
  icon: Tools,
  color: "#7c3aed",
  shadowColor: "rgba(124,58,237,0.15)",
  route: "/admin/service",
  pages: [
    {
      id: "w1",
      title: "Tổng quan Xưởng Dịch Vụ (Dashboard)",
      route: "/admin/service/dashboard",
      description: "Xem các chỉ số KPI, hiệu suất làm việc của thợ và doanh thu dịch vụ tổng hợp.",
      steps: [
        "Vào menu Dịch vụ -> Tổng quan.",
        "Xem biểu đồ thống kê số lượng đơn sửa chữa, bảo hành đã hoàn thành.",
        "Sử dụng bộ lọc chu kỳ (ngày/tuần/tháng) để đánh giá năng suất.",
        "Xuất báo cáo tổng quan nếu cần."
      ],
      tips: [
        "Chỉ những tài khoản có quyền Admin hoặc View Dashboard mới truy cập được.",
        "Doanh thu ở đây bao gồm cả tiền công thợ và tiền phụ tùng thay thế."
      ],
    },
    {
      id: "w2",
      title: "Lịch sử Sửa chữa & Bảo dưỡng",
      route: "/admin/service/repair-history",
      description: "Theo dõi toàn bộ các phiếu sửa chữa, bảo dưỡng đã và đang được xử lý trên hệ thống.",
      steps: [
        "Vào menu Dịch vụ -> Lịch sử sửa chữa.",
        "Tra cứu lịch sử của một xe cụ thể thông qua Biển Số hoặc Số Khung (VIN).",
        "Click vào một đơn để xem chi tiết các hạng mục đã sửa, kỹ thuật viên thực hiện và phụ tùng sử dụng.",
        "Chỉ có thể 'Xem' ở phân hệ Admin, thao tác thêm mới được thực hiện bởi Cố Vấn Dịch Vụ tại chi nhánh."
      ],
      tips: [
        "Dữ liệu được lưu trữ vĩnh viễn giúp tra cứu lại lịch sử xe dễ dàng khi khách quay lại.",
        "Bấm vào biểu tượng con mắt để xem phiếu In chi tiết."
      ],
    },
    {
      id: "w3",
      title: "Yêu cầu Bảo hành & Khiếu nại",
      route: "/admin/service/warranty",
      description: "Giám sát quy trình xử lý bảo hành, thay thế phụ tùng lỗi từ nhà sản xuất.",
      steps: [
        "Vào menu Dịch vụ -> Bảo hành & Khiếu nại.",
        "Xem danh sách các yêu cầu bảo hành đang chờ hãng duyệt hoặc đang chờ phụ tùng.",
        "Kiểm tra tính hợp lệ của việc bảo hành thông qua ngày mua xe và số kilomet."
      ],
      tips: [
        "Theo dõi trạng thái duyệt từ hãng giúp phản hồi cho khách hàng nhanh chóng.",
        "Cần kiểm tra kỹ lý do từ chối bảo hành nếu có để giải thích cho khách hàng."
      ],
    },
  ],
}
