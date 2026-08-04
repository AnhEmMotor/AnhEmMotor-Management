import type { GuideSection } from "../guideData";
import { ChatDotRound } from "@element-plus/icons-vue";

export const commentSection: GuideSection = {
  id: "comment",
  icon: ChatDotRound,
  title: "Bình luận",
  subtitle: "Comments",
  color: "#f59e0b",
  shadowColor: "rgba(245,158,11,0.15)",
  description:
    "Quản lý và phản hồi bình luận của khách hàng trên các bài viết, sản phẩm.",
  pages: [
    {
      id: "comment-manage",
      title: "Duyệt và Phản Hồi Bình Luận",
      route: "/Marketing/comment",
      description: "Theo dõi và tương tác với ý kiến phản hồi của người dùng.",
      steps: [
        "Tại trang <b>Quản lý Bình luận</b>, bạn sẽ thấy danh sách tất cả các bình luận.",
        "Các bình luận có trạng thái <b>Chờ duyệt</b> cần được bạn xem xét trước khi hiển thị công khai.<br><img src='https://placehold.co/600x300/e2e8f0/1e293b?text=Duyet+Binh+Luan' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Nhấn <b>Duyệt</b> để cho phép hiển thị, hoặc <b>Ẩn/Xóa</b> đối với các bình luận vi phạm tiêu chuẩn.",
        "Sử dụng nút <b>Phản hồi</b> để trả lời câu hỏi của khách hàng bằng tư cách của Quản trị viên.",
      ],
      tips: [
        "Nên phản hồi bình luận càng sớm càng tốt để tăng độ hài lòng của khách hàng.",
        "Cẩn thận với các bình luận chứa link spam, hãy xóa chúng ngay lập tức.",
      ],
    },
  ],
};
