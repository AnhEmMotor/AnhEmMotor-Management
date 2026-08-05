import type { GuideSection } from "../data/guideData";
import { DataAnalysis, Picture, DataLine } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "reporting",
  title: "Thống Kê & Báo Cáo",
  subtitle: "Reporting & Analytics",
  description:
    "Hệ thống báo cáo tổng hợp chuyên sâu dành cho Ban Giám Đốc: bao gồm tài chính, tồn kho, nhân sự và hiệu suất xưởng dịch vụ.",
  icon: DataAnalysis,
  color: "#7c3aed",
  shadowColor: "rgba(124,58,237,0.15)",
  route: "/admin/reporting",
  pages: [
    {
      id: "r1",
      title: "Tổng quan Điều hành",
      route: "/admin/reporting/overview",
      description:
        "Bảng điều khiển (Dashboard) tổng hợp các chỉ số kinh doanh then chốt của toàn công ty.",
      steps: [
        "Vào menu Thống kê & Báo cáo -> Tổng quan điều hành.",
        "Xem các chỉ số (KPI): tổng doanh thu, lợi nhuận ròng, số lượng đơn hàng mới, giá trị tồn kho.",
        "Sử dụng công cụ chọn chu kỳ thời gian (ngày/tuần/tháng/năm) ở góc trên bên phải.",
        "Quan sát biểu đồ xu hướng để đưa ra quyết định kinh doanh kịp thời.",
      ],
      tips: [
        "Cần có quyền Xem Thống kê (Permissions.StatisticalView) mới có thể truy cập.",
        "Bạn có thể so sánh dữ liệu với cùng kỳ năm ngoái.",
      ],
    },
    {
      id: "r2",
      title: "Báo cáo Tài chính",
      route: "/admin/reporting/financial",
      description:
        "Theo dõi dòng tiền thu-chi, biến động lợi nhuận và tỷ suất hoàn vốn (ROI).",
      steps: [
        "Vào menu Thống kê & Báo cáo -> Báo cáo tài chính.",
        "Theo dõi bảng thu-chi chi tiết từ hoạt động bán xe và dịch vụ sửa chữa.",
        "Phân tích cơ cấu chi phí theo các loại hình (lương, vận hành, nhập hàng).",
        "Nhấp nút 'Xuất Excel/PDF' để lấy số liệu gửi bộ phận Kế toán tổng hợp.",
      ],
      tips: [
        "Dữ liệu tài chính ở đây được đồng bộ hóa từ mọi giao dịch phát sinh trên hệ thống.",
      ],
    },
    {
      id: "r3",
      title: "Báo cáo Tồn kho",
      route: "/admin/reporting/inventory",
      description:
        "Thống kê lượng xuất-nhập-tồn, đánh giá giá trị hàng hóa và nhận cảnh báo sắp hết hàng.",
      steps: [
        "Vào menu Thống kê & Báo cáo -> Báo cáo tồn kho.",
        "Xem biểu đồ cơ cấu tồn kho theo Nhà cung cấp hoặc Thương hiệu.",
        "Theo dõi thẻ kho chi tiết để xem luân chuyển hàng hóa.",
        "Kiểm tra danh sách 'Hàng hóa dưới mức tối thiểu' để lên kế hoạch nhập hàng.",
      ],
      tips: [
        "Nên kiểm tra tồn kho tối thiểu hàng tuần để không bị gián đoạn hoạt động kinh doanh.",
      ],
    },
    {
      id: "r4",
      title: "Báo cáo Xưởng dịch vụ",
      route: "/admin/reporting/workshop",
      description:
        "Theo dõi hoạt động sửa chữa, bảo hành và tiền công thợ của các xưởng dịch vụ.",
      steps: [
        "Vào menu Thống kê & Báo cáo -> Báo cáo xưởng.",
        "Xem tổng lượng xe vào xưởng, số lượng yêu cầu bảo hành và tổng doanh thu dịch vụ.",
        "Bạn có thể lọc dữ liệu theo từng Kỹ thuật viên (thợ) hoặc loại hình dịch vụ.",
        "Xuất báo cáo để đánh giá năng suất làm việc của xưởng.",
      ],
      tips: [
        "Dữ liệu này rất hữu ích khi kết hợp với bảng lương để đánh giá KPI của khối Kỹ thuật.",
      ],
    },
  ],
};
