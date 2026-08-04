import type { GuideSection } from "../data/guideData";
import { Document, Lock } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "contract",
  title: "Quản Lý Hợp Đồng",
  subtitle: "Contract Management",
  description:
    "Phân hệ quản lý toàn bộ vòng đời của Hợp đồng Bán xe và Hợp đồng với Nhà Cung Cấp, đồng thời xử lý quy trình phê duyệt số hóa.",
  icon: Document,
  color: "#d97706",
  shadowColor: "rgba(217,119,6,0.15)",
  route: "/admin/contract",
  pages: [
    {
      id: "c1",
      title: "Hợp đồng Bán xe",
      route: "/admin/contract/sales",
      description:
        "Quản lý và tra cứu toàn bộ hợp đồng mua bán xe máy trên toàn hệ thống.",
      steps: [
        "Vào menu Hợp đồng -> Hợp đồng bán.",
        "Sử dụng công cụ tìm kiếm và lọc để tra cứu hợp đồng theo khách hàng hoặc chi nhánh.",
        "Nhấp vào một hợp đồng để xem chi tiết thông tin: người mua, thông tin xe, giá trị, điều khoản thanh toán.",
        "Bạn có thể 'Xem trước' hợp đồng để xuất định dạng PDF để in ấn hoặc gửi cho khách hàng.",
      ],
      tips: [
        "Chỉ những người dùng có quyền Xem Hợp Đồng Bán mới truy cập được trang này.",
        "Các hợp đồng ở trạng thái 'Đã hủy' sẽ bị mờ đi để dễ phân biệt.",
      ],
    },
    {
      id: "c2",
      title: "Hợp đồng Nhà cung cấp",
      route: "/admin/contract/supplier",
      description:
        "Quản lý các bản cam kết và hợp đồng với đối tác cung cấp xe máy, phụ tùng.",
      steps: [
        "Vào menu Hợp đồng -> Hợp đồng Nhà cung cấp.",
        "Xem danh sách và trạng thái hiệu lực của từng hợp đồng.",
        "Nhấp 'Chỉnh sửa' để gia hạn hoặc thay đổi điều khoản.",
        "Nhấp 'Tạm dừng' nếu không còn nhập hàng từ nhà cung cấp này nữa.",
      ],
      tips: [
        "Lưu trữ hợp đồng nhà cung cấp ở đây giúp phòng Kế toán có căn cứ để làm chứng từ.",
        "Chỉ Admin hoặc những người được cấp quyền cấp cao mới được tạo/sửa Hợp đồng Nhà cung cấp.",
      ],
    },
    {
      id: "c3",
      title: "Phê duyệt Hợp đồng (Admin Only)",
      route: "/admin/contract-approval",
      description:
        "Quy trình số hóa giúp Ban Giám Đốc xét duyệt nhanh các hợp đồng được gửi lên.",
      steps: [
        "Vào menu Hợp đồng -> Admin duyệt hợp đồng.",
        "Tại đây sẽ liệt kê các hợp đồng đang ở trạng thái 'Chờ phê duyệt'.",
        "Click vào biểu tượng 'Kính lúp' để xem nội dung chi tiết.",
        "Nhấp nút 'Duyệt' để chấp thuận hoặc 'Từ chối' kèm theo lý do cụ thể.",
      ],
      tips: [
        "Việc từ chối sẽ tự động chuyển trạng thái hợp đồng về 'Đã từ chối' và gửi thông báo cho nhân viên tạo.",
        "Hợp đồng sau khi được duyệt sẽ không thể bị xóa.",
      ],
    },
  ],
};
