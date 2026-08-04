import type { GuideSection } from "../guideData";
import { Document } from "@element-plus/icons-vue";

export const articleSection: GuideSection = {
  id: "article",
  icon: Document,
  title: "Bài viết tin tức",
  subtitle: "Articles",
  color: "#10b981",
  shadowColor: "rgba(16,185,129,0.15)",
  description: "Quản lý nội dung bài viết, tin tức, khuyến mãi.",
  pages: [
    {
      id: "article-create",
      title: "Soạn thảo Bài Viết",
      route: "/Marketing/article",
      description: "Tạo và xuất bản bài viết mới.",
      steps: [
        "Chọn <b>Quản lý Bài viết</b>, sau đó nhấn <b>Thêm bài viết</b>.",
        "Sử dụng trình soạn thảo văn bản (Editor) để nhập nội dung. Bạn có thể định dạng chữ, chèn hình ảnh và liên kết.<br><img src='https://placehold.co/600x300/e2e8f0/1e293b?text=Trinh+Soan+Thao' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Nhập <b>Tiêu đề</b>, chọn <b>Chuyên mục</b> và <b>Hình thu nhỏ (Thumbnail)</b> cho bài viết.",
        "Cấu hình SEO (Title, Description, Keyword) ở phần dưới để bài viết dễ dàng tiếp cận trên các công cụ tìm kiếm.",
        "Nhấn <b>Lưu nháp</b> nếu chưa xong, hoặc <b>Xuất bản</b> để bài viết hiển thị ngay lập tức.",
      ],
      tips: [
        "Nên viết tiêu đề hấp dẫn và chứa từ khóa quan trọng.",
        "Hình thu nhỏ nên có tỷ lệ 16:9 để hiển thị đẹp nhất trên mọi thiết bị.",
      ],
    },
  ],
};
