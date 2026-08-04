import type { GuideSection } from "../guideData";
import { UserFilled } from "@element-plus/icons-vue";

export const customerSection: GuideSection = {
  id: "customer",
  icon: UserFilled,
  title: "Khách hàng",
  subtitle: "Customers",
  color: "#8b5cf6",
  shadowColor: "rgba(139,92,246,0.15)",
  description: "Quản lý danh sách khách hàng tiềm năng và hồ sơ khách hàng.",
  pages: [
    {
      id: "customer-data",
      title: "Hồ Sơ Khách Hàng",
      route: "/Marketing/customer",
      description: "Quản lý và phân loại tệp khách hàng.",
      steps: [
        "Mục <b>Khách hàng</b> lưu trữ toàn bộ hồ sơ khách hàng đã từng tương tác hoặc mua hàng.",
        "Bạn có thể tìm kiếm theo Tên, SĐT, hoặc Email.",
        "Sử dụng tính năng <b>Gắn thẻ (Tags)</b> để phân loại khách hàng (Ví dụ: VIP, Tiềm năng, Cần chăm sóc).<br><img src='https://placehold.co/600x300/e2e8f0/1e293b?text=Gan+The+Khach+Hang' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Nhấp vào hồ sơ để xem chi tiết lịch sử mua hàng, lịch sử đặt lịch và các ghi chú liên quan.",
      ],
      tips: [
        "Dữ liệu khách hàng rất quan trọng, hãy phân quyền cẩn thận cho nhân viên để bảo mật thông tin.",
      ],
    },
  ],
};
