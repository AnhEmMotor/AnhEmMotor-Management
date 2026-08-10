export const sectionData = {
  title: 'Hóa Đơn Điện Tử (E-Invoice)',
  description:
    'Trình kết nối trực tiếp với các nhà cung cấp dịch vụ Hóa đơn điện tử (VNPT, Viettel, MISA) để phát hành hóa đơn đỏ (VAT) một cách tự động.',
  pages: [
    {
      id: 'invoice-issuing',
      title: 'Xuất Hóa đơn VAT',
      description: 'Xử lý các Yêu cầu xuất hóa đơn gửi từ bộ phận Sales và Xưởng.',
      route: '/accountant/invoice/issuing',
      steps: [
        '1. Mở danh sách [Yêu cầu Xuất hóa đơn].',
        '2. Kiểm tra tính hợp lệ của Mã số thuế và Tên đơn vị mua hàng.',
        '3. Kiểm tra số tiền trên hóa đơn có khớp với thực tế khách đã thanh toán không.',
        '4. Nhấn [Phát hành Hóa đơn]. Hệ thống sẽ gọi API sang nhà cung cấp Hóa đơn điện tử để lấy số hóa đơn và mã cơ quan thuế.',
        '5. File XML và PDF của hóa đơn sẽ tự động lưu trữ trên phần mềm và được gửi thẳng qua email của khách hàng.',
        '6. Nếu có sai sót sau khi phát hành, Kế toán chọn lệnh [Xuất hóa đơn Điều chỉnh] hoặc [Hủy hóa đơn] theo đúng luật Thuế.',
      ],
      tips: [
        'Bảo mật Token/Chữ ký số (USB Token) trên máy chủ để tính năng gọi API xuất hóa đơn hoạt động trơn tru.',
        'Cuối ngày (hoặc cuối tháng), sử dụng chức năng [Xuất hóa đơn gộp] để xuất chung một tờ hóa đơn cho tất cả khách lẻ không lấy hóa đơn.',
      ],
    },
  ],
};
