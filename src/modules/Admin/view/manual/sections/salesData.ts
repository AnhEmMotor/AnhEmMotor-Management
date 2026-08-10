import type { GuideSection } from '../data/guideData';
import { Money } from '@element-plus/icons-vue';

export const sectionData: GuideSection = {
  id: 'sales',
  title: 'Quản Lý Bán Hàng & Chính Sách',
  subtitle: 'Sales Operations',
  description:
    'Cấu hình các chương trình khuyến mãi toàn hệ thống, quản lý khung giá bán (Price book) và giám sát chặt chẽ tỷ lệ hủy/trả đơn hàng.',
  icon: Money,
  color: '#059669',
  shadowColor: 'rgba(5,150,105,0.15)',
  route: '/admin/sales',
  imageUrl: '/images/manual/sales_invoice_1785990516203.png',
  pages: [
    {
      id: 's-pricing',
      title: 'Thiết lập Giá & Khuyến mãi (Price Book)',
      route: '/admin/sales/pricing',
      description:
        'Cập nhật bảng giá niêm yết đồng loạt cho các chi nhánh, tạo lập các chương trình Voucher/Giảm giá.',
      steps: [
        '1. Vào [Quản Lý Bán Hàng] -> [Bảng Giá & Khuyến Mãi].',
        '2. Cập nhật Bảng Giá: Khi Hãng có đợt tăng/giảm giá xe, Admin import file Excel bảng giá mới. Hệ thống sẽ tự động áp giá mới cho toàn bộ các chi nhánh.',
        '3. Thiết lập Khuyến mãi: Bấm [Tạo Chiến Dịch Khuyến Mãi].',
        '4. Nhập Tên chiến dịch (VD: Back To School), Thời gian áp dụng, và Thể lệ (Giảm 500k cho Sinh Viên mua xe số).',
        '5. Sinh mã Voucher hàng loạt (VD: BTS_xxxx) và giới hạn số lần sử dụng.',
        '6. Áp dụng chiến dịch: Chọn áp dụng cho toàn hệ thống hay chỉ cho 1 cửa hàng đang ế khách.',
        '7. Duyệt phát hành. Từ lúc này, Sales ở các cửa hàng có thể add Voucher vào đơn hàng của khách.',
      ],
      tips: [
        "Admin có thể cấu hình 'Giá sàn' (Giá bán thấp nhất có thể). Nếu Sales giảm giá quá mức Giá sàn, hệ thống sẽ chặn không cho chốt đơn.",
        'Việc quản lý giá tập trung ở cấp Admin giúp chống bán phá giá (Dumping) và loạn giá giữa các chi nhánh cùng công ty.',
      ],
    },
    {
      id: 's-returns',
      title: 'Phê duyệt Hủy Đơn / Trả Xe',
      route: '/admin/sales/returns',
      description: 'Kiểm soát các rủi ro tài chính khi khách hàng muốn trả xe, hủy hợp đồng.',
      steps: [
        '1. Chuyển sang tab [Quản lý Hủy/Trả Đơn].',
        "2. Bảng sẽ tổng hợp toàn bộ các phiếu 'Yêu cầu trả xe' từ Quản lý các chi nhánh gửi lên.",
        '3. Xem chi tiết Lịch sử đơn hàng, Biên bản kiểm tra tình trạng xe, và số tiền khách yêu cầu hoàn lại.',
        '4. Nếu lý do hợp lý (VD: Lỗi nghiêm trọng từ nhà sản xuất không thể khắc phục), Admin bấm [Phê duyệt Yêu cầu].',
        '5. Nếu phát hiện khách vi phạm hợp đồng (Trầy xước nặng), Admin ghi chú mức phạt khấu hao và Trả về cho chi nhánh đàm phán lại.',
      ],
      tips: [
        'Lệnh trả xe là nghiệp vụ cực kỳ phức tạp (liên quan đến Thuế, Đăng ký biển số, Hóa đơn VAT). Do đó quyền quyết định cuối cùng luôn phải nằm ở Ban Giám Đốc/Admin.',
        'Hệ thống sẽ tự động phong tỏa khoản tiền hoàn trả trên tài khoản của Kế toán cho đến khi Admin duyệt.',
      ],
    },
  ],
};
