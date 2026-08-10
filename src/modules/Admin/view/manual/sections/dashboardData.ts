import type { GuideSection } from '../data/guideData';
import { DataAnalysis } from '@element-plus/icons-vue';

export const sectionData: GuideSection = {
  id: 'dashboard',
  title: 'Bảng Điều Khiển Tổng',
  subtitle: 'HQ Dashboard',
  description:
    'Trạm quan trắc cao nhất dành cho Ban Giám Đốc (BOD). Cung cấp bức tranh toàn cảnh về hoạt động kinh doanh, nhân sự và dịch vụ của toàn bộ hệ thống đại lý theo thời gian thực.',
  icon: DataAnalysis,
  color: '#2563eb',
  shadowColor: 'rgba(37,99,235,0.15)',
  route: '/admin/dashboard',
  imageUrl: '/images/manual/dashboard_overview_1785990505505.png',
  pages: [
    {
      id: 'd-overview',
      title: 'Tổng quan Toàn hệ thống',
      route: '/admin/dashboard',
      description:
        'Xem nhanh các chỉ số cốt lõi: Doanh thu, Lợi nhuận gộp, Số xe bán ra, và Số xe vào xưởng hôm nay.',
      steps: [
        '1. Màn hình đầu tiên sau khi đăng nhập (đối với tài khoản Admin/Giám đốc).',
        '2. Xem 4 thẻ KPI trên cùng: Màu xanh biểu thị tăng trưởng, màu đỏ biểu thị sụt giảm so với tuần/tháng trước.',
        '3. Biểu đồ Đường cong Doanh thu (Revenue Trend): So sánh tổng doanh thu Bán Hàng (Sales) và doanh thu Xưởng (Workshop).',
        '4. Bản đồ nhiệt (Heatmap) hoặc Biểu đồ Cột: Hiển thị chi nhánh nào đang dẫn đầu về doanh số.',
        '5. Xem danh sách Cảnh báo: Các chi nhánh đang bị rớt doanh số, hoặc lượng hàng tồn kho đang vượt quá định mức an toàn.',
        '6. Sử dụng công cụ [Lọc Ngày/Tháng] ở góc phải để đối chiếu dữ liệu cùng kỳ năm ngoái.',
      ],
      tips: [
        'Chế độ [Dark Mode] và [Full Screen] rất thích hợp để mở Dashboard này 24/7 trên màn hình lớn trong phòng họp Giám đốc.',
        'Nhấn vào một cột chi nhánh trên biểu đồ để xem chi tiết (Drill-down) sâu vào doanh số của từng nhân viên tại chi nhánh đó.',
      ],
    },
  ],
};
