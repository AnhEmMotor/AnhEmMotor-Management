import type { GuideSection } from "../data/guideData";
import { Money, TrendCharts, User } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "hr",
  title: "Quản Trị Nhân Sự",
  subtitle: "HR Management",
  description:
    "Phân hệ quản trị nhân sự toàn diện: từ quản lý hồ sơ nhân viên, thiết lập chính sách, chấm công, tính lương cho đến đánh giá KPI năng lực.",
  icon: User,
  color: "#e11d48",
  shadowColor: "rgba(225,29,72,0.15)",
  route: "/admin/hr",
  pages: [
    {
      id: "h1",
      title: "Quản lý Hồ sơ Nhân viên",
      route: "/admin/employee",
      description:
        "Xem và quản lý hồ sơ, chức vụ, phòng ban và phân công chi nhánh của toàn bộ nhân sự.",
      steps: [
        "Vào menu Nhân sự -> Nhân viên.",
        "Xem danh sách toàn bộ nhân viên, sử dụng thanh tìm kiếm để lọc theo tên hoặc phòng ban.",
        "Nhấp 'Thêm nhân viên' để tạo hồ sơ mới, cấp phát tài khoản đăng nhập.",
        "Sử dụng nút 'Chỉnh sửa' để cập nhật thông tin cá nhân, điều chuyển chi nhánh.",
        "Nhấp 'Xóa' để đưa nhân viên vào danh sách nghỉ việc (dữ liệu sẽ được lưu trữ mềm).",
      ],
      tips: [
        "Nên kiểm tra kỹ chi nhánh làm việc khi tạo mới để tính lương chính xác.",
        "Hệ thống sẽ tự động gửi email chào mừng có chứa thông tin đăng nhập cho nhân viên mới.",
      ],
    },
    {
      id: "h2",
      title: "Chính sách Lương & Hoa hồng",
      route: "/admin/policy",
      description:
        "Cấu hình linh hoạt các chính sách thưởng, hoa hồng theo từng loại hình công việc.",
      steps: [
        "Vào menu Nhân sự -> Chính sách.",
        "Lựa chọn loại hình công việc: Sale xe máy, Sale phụ tùng, Marketing Online, hoặc Kỹ thuật viên.",
        "Nhấp 'Tạo mới' để thiết lập mức phần trăm hoa hồng hoặc KPIs cơ sở.",
        "Gán chính sách này cho các chức danh hoặc nhân viên tương ứng.",
      ],
      tips: [
        "Bạn có thể sao chép một chính sách cũ để chỉnh sửa cho nhanh.",
        "Việc thay đổi chính sách sẽ áp dụng ngay cho kỳ lương hiện tại.",
      ],
    },
    {
      id: "h3",
      title: "Tính Lương (Payroll) & KPI",
      route: "/admin/payroll",
      description:
        "Tự động tổng hợp và tính toán lương thưởng, phạt, hoa hồng cuối tháng.",
      steps: [
        "Vào menu Nhân sự -> Bảng lương.",
        "Chọn tháng và chi nhánh cần xem lương.",
        "Nhấp 'Làm mới dữ liệu' để hệ thống tự động tổng hợp hoa hồng từ doanh số bán hàng (Sales/Service) và KPIs.",
        "Kiểm tra lại các khoản phạt/thưởng thủ công trước khi xuất file gửi Kế toán.",
      ],
      tips: [
        "Hệ thống tự động liên kết với phân hệ Sales để lấy doanh thu của sale.",
        "Chỉ những người có quyền PayrollManagement.View mới có thể truy cập.",
      ],
    },
  ],
};
