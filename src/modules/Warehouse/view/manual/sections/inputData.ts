export const sectionData = {
  title: 'Quản Lý Nhập Kho (Phiếu Nhập)',
  description:
    'Trung tâm quản lý toàn bộ các giao dịch nhập hàng vào hệ thống (Nhập mua, nhập trả lại, nhập nội bộ). Mọi hàng hóa muốn có trong hệ thống đều phải đi qua một Phiếu Nhập Kho được duyệt.',
  pages: [
    {
      id: 'purchase-receipt',
      title: 'Lập Phiếu Nhập Kho (Từ Mua Hàng)',
      description:
        'Quy trình thực tế khi xe tải chở hàng từ Nhà cung cấp đến kho, Thủ kho tiến hành kiểm đếm và ghi nhận hệ thống.',
      route: '/warehouse/input/create',
      steps: [
        '1. Vào menu [Kho & Hậu Cần] -> [Nhập Kho] -> [Danh sách Phiếu Nhập].',
        '2. Nhấn nút [Tạo Phiếu Nhập].',
        '3. Lựa chọn nguồn nhập: [Từ Hợp đồng Mua] hoặc [Từ Đơn Đặt Hàng (Purchase Order)].',
        '4. Hệ thống sẽ tự động kéo danh sách các mặt hàng dự kiến nhập theo Đơn đặt hàng đã chọn.',
        '5. Thủ kho tiến hành kiểm đếm thực tế. Điền [Số lượng thực nhận] vào từng mặt hàng.',
        '6. Quan trọng đối với xe nguyên chiếc: Bắt buộc dùng máy quét mã vạch (Barcode Scanner) để quét Số Khung (VIN) và Số Máy của từng xe. Hệ thống sẽ kiểm tra trùng lặp và lưu đích danh từng chiếc xe.',
        '7. Ghi chú tình trạng hàng hóa (trầy xước, thiếu phụ kiện nếu có).',
        '8. Nhấn [Lưu Nháp] nếu chưa kiểm xong. Nhấn [Chốt Phiếu Nhập] khi hoàn tất. Khi chốt, Tồn kho sẽ chính thức tăng lên và phát sinh công nợ với Nhà cung cấp.',
      ],
      tips: [
        "Nếu số lượng thực nhận ít hơn số lượng trên PO, hệ thống sẽ cho phép bạn chọn: 'Tạo phiếu nhập bổ sung sau' hoặc 'Hủy số lượng còn thiếu'.",
        'Sử dụng App Mobile của hệ thống quét Barcode ngay tại bãi đỗ xe để không phải ghi chép tay Số Khung/Số máy, giảm thiểu 99% sai sót.',
      ],
    },
    {
      id: 'other-receipts',
      title: 'Các Loại Phiếu Nhập Khác',
      description: 'Hướng dẫn xử lý các trường hợp nhập kho không đến từ quy trình mua hàng chuẩn.',
      route: '/warehouse/input/others',
      steps: [
        '1. Nhập trả lại hàng (Sales Return): Khi khách hàng trả lại xe đã mua, vào [Phiếu Nhập] -> Chọn loại phiếu [Nhập Trả Lại]. Kéo thông tin từ Hóa đơn bán hàng để đảm bảo nhập lại đúng Số khung/Số máy.',
        '2. Nhập chuyển kho (Stock Transfer): Khi nhận xe/phụ tùng từ chi nhánh khác chuyển đến. Chọn [Nhập Chuyển Kho], hệ thống sẽ yêu cầu mã Phiếu Xuất của kho nguồn để đối chiếu.',
        '3. Nhập số dư đầu kỳ: Chỉ dùng duy nhất một lần khi mới triển khai phần mềm, để đưa số liệu tồn kho từ sổ sách cũ vào hệ thống.',
        '4. Nhập điều chỉnh kiểm kê: Dành cho trường hợp sau khi kiểm kê phát hiện thừa hàng, tạo phiếu nhập điều chỉnh để cân bằng số liệu thực tế và phần mềm.',
      ],
      tips: [
        'Tất cả các loại phiếu nhập (trừ nhập mua) thường yêu cầu sự phê duyệt của Kế toán trưởng hoặc Quản lý chi nhánh trước khi làm tăng tồn kho.',
        "Nghiêm cấm lạm dụng 'Nhập điều chỉnh kiểm kê' để che giấu sai lệch. Mọi phiếu nhập điều chỉnh đều bị hệ thống ghi log và cảnh báo đến Ban Giám Đốc.",
      ],
    },
  ],
};
