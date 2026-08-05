import type { GuideSection } from "../data/guideData";
import { Lock, User, Key } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "authorization",
  title: "Phân Quyền Hệ Thống",
  subtitle: "Authorization",
  description:
    "Quản lý toàn diện tài khoản người dùng, thiết lập vai trò (Roles) và cấp phát quyền (Permissions) truy cập vào các module trên hệ thống.",
  icon: Lock,
  color: "#7c3aed",
  shadowColor: "rgba(124, 58, 237, 0.15)",
  route: "/admin/authorization",
  pages: [
    {
      id: "a1",
      title: "Quản lý Người dùng (Users)",
      route: "/admin/authorization/users",
      description:
        "Tạo mới, khóa, hoặc thiết lập lại tài khoản cho nhân sự toàn công ty.",
      steps: [
        "Vào menu Phân quyền -> Quản lý User.",
        "Sử dụng thanh tìm kiếm để tìm nhân viên theo Tên, Email hoặc Số điện thoại.",
        "Nhấp nút 'Chỉnh sửa' (bút chì) để khóa/mở khóa tài khoản hoặc reset mật khẩu.",
        "Sử dụng tính năng 'Phân quyền' ngay trên dòng của user để gán một vai trò cụ thể cho họ.",
      ],
      tips: [
        "Chỉ có SuperAdmin hoặc người được cấp quyền Authorization.User.Manage mới thực hiện được.",
        "Tài khoản bị khóa sẽ lập tức bị văng ra khỏi hệ thống và không thể đăng nhập lại.",
      ],
    },
    {
      id: "a2",
      title: "Quản lý Vai trò (Roles & Permissions)",
      route: "/admin/authorization/roles",
      description:
        "Tạo các nhóm quyền hạn mẫu và áp dụng nhanh chóng cho nhiều người dùng.",
      steps: [
        "Vào menu Phân quyền -> Vai trò (Role).",
        "Nhấp 'Thêm mới' để tạo một chức danh mới (VD: Kế toán trưởng, Quản lý kho).",
        "Nhấp 'Phân quyền' (icon chìa khóa) trên role đó để mở bảng phân quyền chi tiết.",
        "Tick chọn các quyền cụ thể như Xem, Thêm, Sửa, Xóa, Phê Duyệt cho từng module tương ứng.",
        "Nhấp 'Lưu thay đổi' để hoàn tất.",
      ],
      tips: [
        "Sử dụng Role giúp quản lý phân quyền tập trung, khi cần sửa quyền, chỉ cần sửa ở Role là toàn bộ nhân viên có Role đó sẽ được cập nhật.",
        "Mỗi người có thể có nhiều Role cùng lúc, quyền hạn sẽ được cộng dồn.",
      ],
    },
  ],
};
