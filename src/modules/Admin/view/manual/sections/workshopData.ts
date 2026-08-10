import type { GuideSection } from '../data/guideData';
import { Tools } from '@element-plus/icons-vue';

export const sectionData: GuideSection = {
  id: 'workshop',
  title: 'Quản Trị Dịch Vụ & Bảo Hành',
  subtitle: 'Workshop Policies',
  description:
    'Cài đặt định mức kỹ thuật (Flat Rate), bảng giá tiền công, và giám sát các chỉ số chất lượng dịch vụ (CSI) của toàn bộ các Xưởng.',
  icon: Tools,
  color: '#0f766e',
  shadowColor: 'rgba(15,118,110,0.15)',
  route: '/admin/workshop',
  imageUrl: '/images/manual/workshop_kanban_1785990569362.png',
  pages: [
    {
      id: 'w-flatrate',
      title: 'Cấu hình Định mức Tiền công (Flat Rate)',
      route: '/admin/workshop/flatrate',
      description:
        'Chuẩn hóa thời gian tiêu chuẩn và giá tiền cho từng công việc sửa chữa trên hệ thống.',
      steps: [
        '1. Truy cập [Quản trị Dịch vụ] -> [Cấu hình Flat Rate].',
        '2. Thêm một Hạng mục sửa chữa (VD: Vệ sinh kim phun, Thay bố thắng).',
        "3. Cài đặt 'Thời gian tiêu chuẩn' (Ví dụ: 0.5 giờ / 30 phút). Thời gian này làm cơ sở tính KPIs cho thợ.",
        "4. Cài đặt 'Đơn giá 1 giờ công' (Ví dụ: 150.000 VNĐ/giờ). Hệ thống sẽ tự nhân lên để ra giá tiền báo cho khách (150k x 0.5 = 75k).",
        '5. Cấu hình các gói Bảo dưỡng (Package): Gom nhiều mã sửa chữa và phụ tùng lại thành 1 gói Combo với giá ưu đãi.',
        '6. Bấm [Áp dụng toàn bộ]. Tất cả máy tính bảng của Cố vấn dịch vụ dưới xưởng sẽ cập nhật bảng giá mới nhất.',
      ],
      tips: [
        'Áp dụng chuẩn Flat Rate của Hãng giúp tránh tình trạng báo giá loạn xị ngậu, mỗi cố vấn báo một giá khác nhau.',
        'Admin có thể chỉnh định mức tiền công khác nhau cho từng vùng (Ví dụ: Xưởng ở TT Thành phố giá cao hơn xưởng ở Tỉnh).',
      ],
    },
    {
      id: 'w-csi',
      title: 'Chỉ số Hài lòng Khách hàng (CSI)',
      route: '/admin/workshop/csi',
      description:
        'Đo lường chất lượng dịch vụ hậu mãi thông qua khảo sát khách hàng sau khi sửa xe.',
      steps: [
        '1. Chuyển sang tab [Đánh giá Dịch vụ CSI].',
        '2. Hệ thống tổng hợp kết quả tin nhắn khảo sát Zalo/SMS được gửi tự động cho khách hàng 3 ngày sau khi họ lấy xe.',
        '3. Xem điểm trung bình (Thang điểm 1-5 sao) của từng Cố vấn dịch vụ và từng Kỹ thuật viên.',
        '4. Kiểm tra các đánh giá 1-2 sao. Đọc chi tiết lời phàn nàn của khách hàng (Phục vụ chậm, Bệnh cũ tái phát, Giá cao).',
        '5. Giao việc cho bộ phận CSKH gọi điện xin lỗi và đền bù cho các khách hàng không hài lòng.',
      ],
      tips: [
        'Nhiều hãng xe (như Honda/Yamaha) lấy điểm CSI làm tiêu chí cốt lõi để tính tiền thưởng quý cho Đại lý. Vì vậy Admin phải cực kỳ sát sao chỉ số này.',
        'Dùng kết quả CSI này để thưởng/phạt hoặc quyết định có ký tiếp hợp đồng lao động với thợ/cố vấn dịch vụ hay không.',
      ],
    },
  ],
};
