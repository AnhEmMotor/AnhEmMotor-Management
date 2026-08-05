import type { GuideSection } from "../data/guideData";
import { Money, Document } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "sales",
  title: "Quản Lý Bán Hàng",
  subtitle: "Sales Management",
  description:
    "Giao diện giám sát toàn bộ hoạt động bán hàng: Hóa đơn, hoàn trả và báo cáo doanh số tổng hợp.",
  icon: Money,
  color: "#059669",
  shadowColor: "rgba(5,150,105,0.15)",
  route: "/admin/sales",
  pages: [
    {
      id: "s-returns",
      title: "Quản lý Hủy đơn / Trả hàng",
      route: "/admin/sales/returns",
      description:
        "Giám sát và phê duyệt các yêu cầu hủy đơn hoặc trả lại xe từ khách hàng.",
      steps: [
        "Vào menu Bán hàng -> Quản lý Hủy/Trả đơn.",
        "Hệ thống sẽ hiển thị danh sách các đơn đang chờ xử lý từ các chi nhánh.",
        "Nhấp vào một đơn để xem chi tiết lý do khách hàng muốn hủy/trả.",
        'Admin xem xét và chọn "Đồng ý" hoặc "Từ chối" yêu cầu này.',
      ],
      tips: [
        "Khi đồng ý trả hàng, kho sẽ tự động cộng lại số lượng xe.",
        "Nên liên hệ trực tiếp chi nhánh hoặc khách hàng nếu lý do trả hàng không rõ ràng.",
      ],
    },
    {
      id: "s-invoices",
      title: "Hóa đơn Bán hàng",
      route: "/admin/sales/invoices",
      description:
        "Công cụ giám sát toàn bộ hóa đơn đã được lập tại tất cả showroom.",
      steps: [
        "Vào menu Bán hàng -> Hóa đơn.",
        "Sử dụng bộ lọc nâng cao để tìm kiếm hóa đơn theo Mã HĐ, Tên KH, Số khung, hoặc Số máy.",
        "Click vào từng dòng để xem chi tiết hóa đơn: thông tin xe, giá tiền, thuế và các khoản giảm trừ.",
        "Bạn cũng có thể xem và quản lý các voucher/mã giảm giá đã được áp dụng cho hóa đơn đó.",
      ],
      tips: [
        "Ở quyền Admin, bạn có cái nhìn tổng quát toàn hệ thống thay vì bị giới hạn ở 1 chi nhánh.",
        "Bạn có thể xuất danh sách hóa đơn ra Excel để gửi cho bộ phận kế toán.",
      ],
    },
    {
      id: "s-report",
      title: "Báo cáo Bán hàng",
      route: "/admin/sales/sales-report",
      description:
        "Trích xuất báo cáo doanh số, số lượng xe bán ra theo nhiều tiêu chí.",
      steps: [
        "Vào menu Bán hàng -> Báo cáo Bán hàng.",
        "Chọn khoảng thời gian cần xuất báo cáo (hôm nay, tuần này, tháng này hoặc tùy chỉnh).",
        "Lọc báo cáo theo từng chi nhánh cụ thể hoặc xem toàn hệ thống.",
        'Nhấp "Xuất Excel" để tải báo cáo dạng bảng tính về máy.',
      ],
      tips: [
        "Báo cáo cung cấp số liệu thực tế rất quan trọng cho việc ra quyết định nhập hàng.",
        "Cần có quyền Xem Thống kê (SalesManagement.View) để truy cập trang này.",
      ],
    },
  ],
};
