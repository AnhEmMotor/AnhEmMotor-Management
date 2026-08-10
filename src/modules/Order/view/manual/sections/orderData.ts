export const sectionData = {
  title: 'Đơn hàng và Bán hàng',
  description:
    'Trình quản lý toàn diện quy trình kinh doanh và bán hàng (Sales). Bao gồm các thao tác từ việc tạo đơn, thiết lập ưu đãi, theo dõi thanh toán cho đến khi duyệt và chốt đơn. Đây là trái tim của phân hệ Kinh Doanh.',
  pages: [
    {
      id: 'sales-orders',
      title: 'Quản lý Đơn đặt hàng (Sales Orders)',
      description:
        'Tạo và kiểm soát vòng đời của các đơn đặt mua xe máy nguyên chiếc, phụ tùng, hoặc các dịch vụ đi kèm. Hỗ trợ nhiều hình thức thanh toán và trả góp.',
      route: '/order/sales',
      steps: [
        '1. Đăng nhập và truy cập menu [Đơn hàng] -> [Đơn đặt hàng] từ thanh điều hướng bên trái.',
        '2. Nhấn nút [Tạo Đơn Hàng Mới] ở góc trên bên phải màn hình. Một biểu mẫu nhập liệu sẽ xuất hiện.',
        '3. Nhập thông tin Khách hàng: Có thể tìm kiếm khách hàng cũ bằng Số điện thoại/CCCD, hoặc tạo mới nếu là khách lần đầu đến showroom.',
        '4. Lựa chọn Sản phẩm: Gõ tên dòng xe (VD: Honda SH 150i), chọn phiên bản màu sắc, và thêm các phụ kiện bán kèm (như phủ nano, dán decal).',
        '5. Cấu hình giá và Chiết khấu: Áp dụng các chương trình khuyến mãi hiện hành hoặc nhập mã giảm giá (Voucher). Hệ thống sẽ tự động tính toán số tiền thuế VAT và tổng thanh toán.',
        '6. Phương thức thanh toán: Lựa chọn trả thẳng (Tiền mặt/Chuyển khoản) hoặc Trả góp (nhập thông tin công ty tài chính, số tiền trả trước, kỳ hạn vay).',
        '7. Gán Nhân viên tư vấn: Chọn tên của Sales phụ trách để hệ thống ghi nhận KPI và tính hoa hồng sau này.',
        "8. Nhấn [Lưu & Gửi Duyệt]: Đơn hàng sẽ chuyển sang trạng thái 'Chờ duyệt'. Quản lý cửa hàng sẽ nhận được thông báo để kiểm tra giá bán và phê duyệt.",
        "9. Sau khi được duyệt, đơn hàng sẽ chuyển sang trạng thái 'Chờ thanh toán'. Chuyển khách hàng sang quầy Thu ngân để đóng tiền.",
      ],
      tips: [
        'Luôn kiểm tra kỹ số khung, số máy trước khi chốt đơn nếu xe đã có sẵn tại cửa hàng.',
        "Đối với đơn trả góp, trạng thái đơn sẽ bị kẹt ở 'Chờ ngân hàng giải ngân' cho đến khi Kế toán xác nhận tiền đã vào tài khoản công ty.",
        'Sử dụng công cụ [Lọc nâng cao] để tìm kiếm các đơn hàng bị hủy hoặc quá hạn thanh toán nhằm chăm sóc lại khách hàng.',
        'Màu sắc của thẻ trạng thái (Trắng, Vàng, Xanh, Đỏ) giúp nhận diện nhanh tiến độ của hàng trăm đơn hàng trong ngày.',
      ],
    },
    {
      id: 'bulk-orders',
      title: 'Đơn hàng lô (Khách hàng Doanh Nghiệp - B2B)',
      description:
        'Quy trình xử lý các đơn hàng mua số lượng lớn từ các đối tác doanh nghiệp, công ty giao hàng, với chính sách chiết khấu bậc thang đặc biệt.',
      route: '/order/sales/bulk',
      steps: [
        '1. Chuyển sang tab [Đơn hàng Lô (B2B)] trên giao diện quản lý đơn hàng.',
        '2. Điền thông tin Mã số thuế của doanh nghiệp, hệ thống sẽ tự đồng bộ Tên công ty và Địa chỉ xuất hóa đơn.',
        '3. Tải lên file Excel danh sách các mẫu xe cần mua (nếu số lượng quá lớn) hoặc nhập thủ công từng loại.',
        "4. Cấu hình 'Chiết khấu thương mại' theo tỷ lệ % hoặc số tiền cố định cho toàn bộ lô hàng.",
        '5. Đính kèm bản scan hợp đồng nguyên tắc đã ký kết giữa hai bên.',
        '6. Lập lịch giao hàng từng đợt (Milestones) nếu không giao toàn bộ xe cùng một lúc.',
        '7. Trình Ban Giám Đốc phê duyệt do các đơn hàng này thường có giá trị cực lớn và vượt thẩm quyền của Quản lý chi nhánh.',
      ],
      tips: [
        'Tính năng tính giá vốn (COGS) trực tiếp giúp Ban Giám Đốc nhìn thấy ngay biên lợi nhuận gộp của lô hàng trước khi ấn nút duyệt.',
        'Đơn hàng B2B thường đi kèm yêu cầu xuất hóa đơn VAT gom chung vào cuối tháng, hãy lưu ý cấu hình tính năng này.',
      ],
    },
  ],
};
