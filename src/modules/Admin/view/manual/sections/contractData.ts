import type { GuideSection } from "../data/guideData";
import { Document } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "contract",
  title: "Quản Lý Hợp Đồng & Mẫu In",
  subtitle: "Contract & Templates",
  description:
    "Nơi Ban Giám Đốc và Pháp chế thiết lập các mẫu hợp đồng chuẩn, quản lý thư viện điều khoản và theo dõi trạng thái pháp lý của toàn bộ hợp đồng sinh ra từ các phân hệ.",
  icon: Document,
  color: "#7c3aed",
  shadowColor: "rgba(124,58,237,0.15)",
  route: "/admin/contract",
  imageUrl: "/images/manual/contract_management_1785990526494.png",
  pages: [
    {
      id: "c-sales",
      title: "Hợp đồng Bán Xe",
      route: "/admin/contract/sales",
      description:
        "Tổng hợp tất cả hợp đồng mua bán xe đã ký kết từ các chi nhánh đổ về.",
      steps: [
        "1. Truy cập [Quản Lý Hợp Đồng] -> [Hợp đồng Bán xe].",
        "2. Bảng dữ liệu hiển thị trạng thái từng hợp đồng: Đang hiệu lực, Đã thanh lý, hoặc Bị Hủy.",
        "3. Admin có thể click vào xem nội dung chi tiết từng bản Hợp đồng dạng PDF gốc.",
        "4. Nếu xảy ra tranh chấp pháp lý, Admin có thể tra cứu nhanh bằng mã Hợp đồng hoặc Số CCCD khách hàng.",
        "5. Tính năng Audit Log (Lịch sử chỉnh sửa) cho phép Admin truy vết xem Nhân viên Sales nào đã tự ý sửa điều khoản hợp đồng trước khi in.",
        "6. Đối với các hợp đồng có sai sót nghiêm trọng, Admin có quyền sử dụng nút [Vô hiệu hóa] (Invalidate) để hủy bỏ tính pháp lý trên hệ thống.",
      ],
      tips: [
        "Tính năng lọc theo Chi nhánh giúp Giám đốc Vùng kiểm soát số lượng hợp đồng phát sinh mỗi ngày.",
        "Có thể đồng bộ dữ liệu này với phần mềm CRM (Quản lý quan hệ khách hàng) của bên thứ ba qua API.",
      ],
    },
    {
      id: "c-templates",
      title: "Quản lý Biểu mẫu (Templates)",
      route: "/admin/contract/templates",
      description:
        "Bộ công cụ xây dựng các mẫu hợp đồng, biên bản bàn giao, phiếu thu chi dùng chung cho toàn công ty.",
      steps: [
        "1. Chuyển sang tab [Quản lý Biểu mẫu].",
        "2. Bạn sẽ thấy danh sách các mẫu in mặc định (Hợp đồng trả góp, Hợp đồng tiền mặt, Biên bản giao xe...).",
        "3. Mở một biểu mẫu lên. Trình soạn thảo Rich-Text (tương tự MS Word) sẽ hiện ra.",
        "4. Chèn các [Biến dữ liệu động] (Variables). Ví dụ: chèn biến {{CustomerName}}, hệ thống sẽ tự động điền 'Nguyễn Văn A' khi in hợp đồng thực tế.",
        "5. Định dạng font chữ, chèn Logo công ty, hoặc thêm bảng biểu lịch thanh toán.",
        "6. Bấm [Phát hành Biểu mẫu]. Ngay lập tức, tất cả Sales tại các chi nhánh khi in hợp đồng sẽ sử dụng mẫu mới nhất này.",
      ],
      tips: [
        "Khi Pháp chế cập nhật luật mới, bạn chỉ cần sửa 1 lần tại đây, 100% chi nhánh sẽ được tự động đồng bộ (Không còn tình trạng nhân viên dùng nhầm mẫu cũ).",
        "Có thể khôi phục lại (Rollback) các phiên bản biểu mẫu trước đó nếu lỡ tay xóa nhầm nội dung.",
      ],
    },
  ],
};
