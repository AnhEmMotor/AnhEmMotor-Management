import type { GuideSection } from '../guideData';
import { DataAnalysis } from '@element-plus/icons-vue';
import { formatImageUrl } from '@/common/utils/image';

export const dashboardSection: GuideSection = {
  id: 'dashboard',
  icon: DataAnalysis,
  title: 'Dashboard tiếp thị',
  subtitle: 'Marketing Dashboard',
  color: '#6366f1',
  shadowColor: 'rgba(99,102,241,0.15)',
  description: 'Xem tổng quan thống kê và hiệu suất của các chiến dịch tiếp thị.',
  pages: [
    {
      id: 'dashboard-overview',
      title: 'Tổng quan Dashboard',
      route: '/Marketing/dashboard',
      description: 'Hiểu các biểu đồ và chỉ số chính trên màn hình dashboard.',
      steps: [
        'Truy cập vào <b>Marketing Dashboard</b> từ menu bên trái.',
        `Xem các chỉ số tổng quan ở phía trên cùng để nắm bắt nhanh tình hình hoạt động của các chiến dịch.<br><img src='${formatImageUrl('api/v1/MediaFile/view-image/manuals/dashboard-overview-step-1.webp')}' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />`,
        'Sử dụng bộ lọc thời gian ở góc trên bên phải để xem dữ liệu theo ngày, tuần, hoặc tháng.',
        'Các biểu đồ bên dưới thể hiện xu hướng tương tác, số lượng khách hàng tiềm năng và hiệu quả quảng cáo.',
      ],
      tips: [
        'Hãy kiểm tra dashboard mỗi ngày để nắm bắt kịp thời các thay đổi bất thường.',
        "Bạn có thể xuất báo cáo bằng nút 'Export' để lưu trữ hoặc gửi cho quản lý.",
      ],
    },
  ],
};
