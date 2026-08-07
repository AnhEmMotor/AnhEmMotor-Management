import type { GuideSection } from "../data/guideData";
import { UserFilled } from "@element-plus/icons-vue";

export const sectionData: GuideSection = {
  id: "authorization",
  title: "Quản Trị Người Dùng & Quyền",
  subtitle: "Authorization",
  description:
    "Trung tâm kiểm soát an ninh của hệ thống. Nơi Quản trị viên cấp cao phân quyền chi tiết đến từng nút bấm cho hàng ngàn nhân viên tại các chi nhánh.",
  icon: UserFilled,
  color: "#d97706",
  shadowColor: "rgba(217,119,6,0.15)",
  route: "/admin/authorization",
  imageUrl: "/images/manual/authorization_roles_1785990556798.png",
  pages: [
    {
      id: "a-users",
      title: "Quản lý Tài khoản (Users)",
      route: "/admin/authorization/users",
      description:
        "Tạo mới, khóa, hoặc thiết lập lại mật khẩu cho tài khoản người dùng trên toàn hệ thống.",
      steps: [
        "1. Truy cập [Quản trị Người Dùng] -> [Danh sách Tài khoản].",
        "2. Nhấn nút [Thêm Tài Khoản] để tạo người dùng mới.",
        "3. Điền các thông tin bắt buộc: Tên đăng nhập (Username), Email định danh, và Mật khẩu khởi tạo.",
        "4. Phân bổ người dùng vào một [Chi nhánh] cụ thể (Cực kỳ quan trọng để giới hạn tầm nhìn dữ liệu của họ).",
        "5. Gán người dùng vào một hoặc nhiều [Nhóm Quyền] (Roles).",
        "6. Nếu một nhân viên nghỉ việc, tìm tên họ và chuyển trạng thái sang 'Ngưng hoạt động' (Inactive) thay vì xóa, để giữ lại lịch sử thao tác.",
        "7. Quản trị viên có quyền bấm [Reset Mật khẩu] và hệ thống sẽ gửi mật khẩu mới về email của nhân viên đó.",
      ],
      tips: [
        "Nên quy chuẩn cách đặt Tên đăng nhập (Ví dụ: [Mã chi nhánh]_[Tên nhân viên] như HCM_NguyenVanA) để dễ quản lý.",
        "Một nhân viên có thể thuộc nhiều chi nhánh nếu họ đóng vai trò Quản lý Vùng.",
      ],
    },
    {
      id: "a-roles",
      title: "Thiết lập Nhóm Quyền (Roles)",
      route: "/admin/authorization/roles",
      description:
        "Tạo các mẫu quyền (Role templates) như 'Thu Ngân', 'Cố Vấn Dịch Vụ', 'Kế Toán' để gán hàng loạt cho nhân viên.",
      steps: [
        "1. Chuyển sang tab [Nhóm Quyền (Roles)].",
        "2. Nhấn [Tạo Nhóm Quyền Mới] và đặt tên (VD: Kế Toán Tổng Hợp).",
        "3. Trong màn hình chi tiết Role, hệ thống liệt kê hơn 500 quyền hạn (Permissions) từ tất cả các phân hệ.",
        "4. Tích chọn các quyền mà Role này được phép thao tác. Ví dụ: Được xem Báo cáo (View Report), Được xuất Hóa đơn (Issue Invoice), KHÔNG được phép Xóa dữ liệu (Delete).",
        "5. Lưu cấu hình. Ngay lập tức, tất cả các tài khoản đang mang Role này sẽ được cập nhật quyền mới nhất.",
        "6. Sử dụng tính năng [Sao chép Role] nếu bạn muốn tạo một nhóm quyền mới gần giống nhóm cũ và chỉ tinh chỉnh một chút.",
      ],
      tips: [
        "Luôn áp dụng nguyên tắc 'Đặc quyền tối thiểu' (Least Privilege) - Chỉ cấp đúng những quyền nhân viên cần để làm việc.",
        "Tránh gán quyền đơn lẻ trực tiếp cho User. Hãy gom quyền vào Role, rồi gán Role cho User để không bị rối.",
      ],
    },
  ],
};
