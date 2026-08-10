import type { GuideSection } from '../data/guideData';
import { PieChart } from '@element-plus/icons-vue';

export const sectionData: GuideSection = {
  id: 'reporting',
  title: 'Báo Cáo Phân Tích Chuyên Sâu',
  subtitle: 'Advanced Analytics',
  description:
    'Công cụ Business Intelligence (BI) nội bộ. Phân tích dữ liệu đa chiều giúp Ban Giám Đốc đưa ra chiến lược kinh doanh chính xác thay vì cảm tính.',
  icon: PieChart,
  color: '#be123c',
  shadowColor: 'rgba(190,18,60,0.15)',
  route: '/admin/reporting',
  imageUrl: '/images/manual/reporting_charts_1785990538004.png',
  pages: [
    {
      id: 'r-revenue',
      title: 'Phân tích Doanh thu & Lợi nhuận',
      route: '/admin/reporting/revenue',
      description:
        'Bóc tách doanh thu theo từng dòng xe, từng nhóm phụ tùng, và từng nhóm dịch vụ.',
      steps: [
        '1. Truy cập [Báo Cáo Phân Tích] -> [Phân tích Doanh thu].',
        '2. Lựa chọn khung thời gian cần phân tích (Thường là theo Quý hoặc Năm).',
        "3. Xem biểu đồ 'Tỷ trọng Doanh thu': So sánh đóng góp của Bán Xe vs Bán Phụ tùng vs Dịch vụ sửa chữa.",
        '4. Sử dụng công cụ [Phân tích xu hướng - Trend Analysis] để xem dòng xe nào đang có chu kỳ sống đi xuống (cần xả hàng), dòng xe nào đang hot (cần nhập thêm).',
        '5. Phân tích lợi nhuận gộp (Gross Margin) để biết mảng nào mang lại tiền thực sự cho công ty.',
        '6. Bấm [Tạo Dashboard Riêng] để ghim các biểu đồ bạn quan tâm nhất ra màn hình chính.',
      ],
      tips: [
        'Bạn có thể so sánh trực tiếp kết quả kinh doanh của 2 chi nhánh khác nhau trên cùng 1 biểu đồ.',
        'Xuất dữ liệu thô (Raw Data) ra Excel để Data Analyst (Chuyên viên phân tích) của công ty tự chạy mô hình dự báo.',
      ],
    },
    {
      id: 'r-inventory',
      title: 'Báo cáo Vòng quay Tồn kho',
      route: '/admin/reporting/inventory',
      description:
        'Tối ưu hóa dòng vốn lưu động bằng cách phát hiện hàng tồn kho chậm luân chuyển (Dead Stock).',
      steps: [
        '1. Chuyển sang tab [Phân tích Tồn kho].',
        "2. Hệ thống hiển thị 'Chỉ số Vòng quay hàng tồn kho' (Inventory Turnover Ratio). Chỉ số càng cao, công ty bán hàng càng nhanh.",
        '3. Xem danh sách [Hàng cận date/Chậm luân chuyển]: Các mẫu xe đã nằm kho quá 6 tháng, hoặc phụ tùng bám bụi không ai mua.',
        '4. Đánh giá Tồn kho an toàn (Safety Stock): Các mã phụ tùng hay hỏng hóc nhưng kho đang cạn kiệt, cần lên Đơn đặt hàng bổ sung khẩn cấp.',
      ],
      tips: [
        'Giám đốc dựa vào báo cáo Hàng chậm luân chuyển để yêu cầu phòng Marketing chạy chương trình xả kho (Clearance Sale).',
        'Việc giải phóng hàng tồn chậm sẽ giúp công ty thu hồi vốn và giảm chi phí lãi vay ngân hàng.',
      ],
    },
  ],
};
