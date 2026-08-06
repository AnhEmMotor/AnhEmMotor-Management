import type { GuideSection } from "../data/guideData";
import { DataAnalysis } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "dashboard",
  title: "Bảng Điều Khiển (Dashboard)",
  subtitle: "Dashboard",
  description:
    "Trang tổng quan hệ thống cung cấp góc nhìn toàn diện cho Ban Giám Đốc về tình hình hoạt động của toàn bộ các chi nhánh, nhân sự, và tình hình kinh doanh.",
  icon: DataAnalysis,
  color: "#0284c7",
  shadowColor: "rgba(2,132,199,0.15)",
  route: "/admin/dashboard",
  pages: [
    {
      id: "d-intro",
      title: "Giới thiệu & Tổng quan",
      route: "/admin/dashboard/intro",
      description:
        "Trang thông tin tổng quát khi Admin mới đăng nhập vào hệ thống.",
      steps: [
        "Truy cập vào menu Bảng Điều Khiển -> Giới thiệu.",
        "Xem thông tin chung về hệ thống, phiên bản phần mềm hiện tại.",
        "Sử dụng các phím tắt nhanh để đi tới các phân hệ quan trọng.",
      ],
      tips: [
        "Đây là trang mặc định khi đăng nhập.",
        "Bạn có thể tìm thấy thông tin hỗ trợ kỹ thuật tại đây nếu hệ thống gặp sự cố.",
      ],
    },
    {
      id: "d-analysis",
      title: "Phân tích & Thống kê (Analysis)",
      route: "/admin/dashboard/analysis",
      description:
        "Báo cáo tổng hợp số lượng khách hàng, nhân sự và các chỉ số hoạt động.",
      steps: [
        "Truy cập vào menu Bảng Điều Khiển -> Phân tích.",
        "Xem biểu đồ tổng quan về nhân sự theo phòng ban.",
        "Theo dõi số lượng khách hàng tiềm năng và khách hàng mới cập nhật trong tháng.",
        "Sử dụng bộ lọc thời gian ở góc trên cùng để thay đổi chu kỳ thống kê.",
      ],
      tips: [
        "Biểu đồ tròn thể hiện tỷ lệ phần trăm rất trực quan.",
        "Có thể trỏ chuột vào biểu đồ để xem con số chi tiết.",
      ],
    },
    {
      id: "d-ecommerce",
      title: "Kinh Doanh (Ecommerce)",
      route: "/admin/dashboard/ecommerce",
      description:
        "Bảng điều khiển chuyên sâu về doanh thu bán hàng và lợi nhuận.",
      steps: [
        "Truy cập vào menu Bảng Điều Khiển -> Kinh Doanh.",
        "Theo dõi biểu đồ doanh thu bán xe và phụ tùng theo thời gian thực.",
        "Xem top các sản phẩm bán chạy nhất trong tuần/tháng.",
        "Theo dõi chỉ số tăng trưởng (Growth Rate) so với kỳ trước.",
      ],
      tips: [
        "Màu xanh lá hiển thị tăng trưởng dương, màu đỏ là tăng trưởng âm.",
        "Dữ liệu ở đây được đồng bộ real-time từ các showroom.",
      ],
    },
  ],
};
