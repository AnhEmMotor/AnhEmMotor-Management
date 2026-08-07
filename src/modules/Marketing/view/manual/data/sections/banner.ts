import type { GuideSection } from "../guideData";
import { Picture } from "@element-plus/icons-vue";
import { formatImageUrl } from "@/common/utils/image";

export const bannerSection: GuideSection = {
  id: "banner",
  icon: Picture,
  title: "Quản lý banner",
  subtitle: "Banner Management",
  color: "#0ea5e9",
  shadowColor: "rgba(14,165,233,0.15)",
  description:
    "Thêm, sửa, xóa và sắp xếp các banner hiển thị trên website/ứng dụng.",
  pages: [
    {
      id: "banner-list",
      title: "Danh sách Banner",
      route: "/Marketing/banner",
      description: "Quản lý tất cả các banner đang chạy và đã dừng.",
      steps: [
        "Vào mục <b>Quản lý Banner</b> để xem danh sách.",
        `Nhấn nút <b>+ Thêm Mới</b> để tạo một banner mới.<br><img src='${formatImageUrl("api/v1/MediaFile/view-image/manuals/banner-list-step-1.webp")}' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />`,
        "Điền đầy đủ các thông tin: Tên banner, hình ảnh, đường dẫn liên kết (nếu có) và trạng thái hiển thị.",
        "Để chỉnh sửa hoặc xóa, nhấn vào biểu tượng tương ứng trên từng dòng của bảng danh sách.",
      ],
      tips: [
        "Kích thước banner chuẩn nên là 1920x600px đối với web và 800x400px đối với mobile.",
        "Nên tối ưu hóa dung lượng ảnh (dưới 500KB) để trang tải nhanh hơn.",
      ],
    },
  ],
};
