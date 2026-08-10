import type { GuideSection } from '../guideData';
import { Document } from '@element-plus/icons-vue';
import { formatImageUrl } from '@/common/utils/image';

export const articleSection: GuideSection = {
  id: 'article',
  icon: Document,
  title: 'Bài viết tin tức',
  subtitle: 'Articles',
  color: '#10b981',
  shadowColor: 'rgba(16,185,129,0.15)',
  description: 'Quản lý nội dung bài viết, tin tức, khuyến mãi.',
  pages: [
    {
      id: 'article-create',
      title: 'Soạn thảo Bài Viết',
      route: '/Marketing/article',
      description: 'Tạo và xuất bản bài viết mới.',
      steps: [
        'Chọn <b>Quản lý Bài viết</b>, sau đó nhấn <b>Thêm bài viết</b>.',
        `Sử dụng trình soạn thảo văn bản (Editor) để nhập nội dung. Bạn có thể định dạng chữ, chèn hình ảnh và liên kết.<br><img src='${formatImageUrl('api/v1/MediaFile/view-image/manuals/article-create-step-1.webp')}' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />`,
        'Nhập <b>Tiêu đề</b>, chọn <b>Chuyên mục</b> và <b>Hình thu nhỏ (Thumbnail)</b> cho bài viết.',
        'Cấu hình SEO (Title, Description, Keyword) ở phần dưới để bài viết dễ dàng tiếp cận trên các công cụ tìm kiếm.',
        'Nhấn <b>Lưu nháp</b> nếu chưa xong, hoặc <b>Xuất bản</b> để bài viết hiển thị ngay lập tức.',
      ],
      tips: [
        'Nên viết tiêu đề hấp dẫn và chứa từ khóa quan trọng.',
        'Hình thu nhỏ nên có tỷ lệ 16:9 để hiển thị đẹp nhất trên mọi thiết bị.',
      ],
    },
    {
      id: 'article-list',
      title: 'Danh Sách & Quản Lý Bài Viết',
      route: '/Marketing/article',
      description:
        'Tra cứu, chỉnh sửa thông tin, ẩn/hiện hoặc xóa các bài viết tin tức và chương trình khuyến mãi hiện có.',
      steps: [
        'Mở trang <b>Quản lý Bài viết</b> từ menu bên trái.',
        'Xem danh sách toàn bộ các bài viết được hiển thị trong bảng. Bạn có thể xem nhanh tiêu đề, hình đại diện, danh mục, số lượt xem và trạng thái xuất bản.',
        `Sử dụng ô tìm kiếm phía trên để tìm bài viết theo tiêu đề, hoặc bộ lọc chuyên mục để khoanh vùng bài viết.<br><img src='${formatImageUrl('api/v1/MediaFile/view-image/manuals/article-list-step-2.webp')}' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />`,
        'Để chỉnh sửa bài viết, nhấn vào nút <b>Sửa</b> (biểu tượng bút chì) ở dòng tương ứng.',
        'Để xóa bài viết khỏi hệ thống, nhấn nút <b>Xóa</b> (biểu tượng thùng rác) và xác nhận.',
      ],
      tips: [
        'Thường xuyên dọn dẹp các bài viết khuyến mãi đã hết hạn để tránh khách hàng hiểu nhầm.',
        "Bạn có thể xem trước hiển thị thực tế của bài viết trên trang tin tức bằng nút 'Xem chi tiết'.",
      ],
    },
  ],
};
