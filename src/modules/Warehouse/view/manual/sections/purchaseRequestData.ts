export const sectionData = {
  title: 'Yêu Cầu Mua Hàng & Đơn Đặt Hàng',
  description:
    'Quy trình số hóa việc đề xuất nhu cầu vật tư từ các phòng ban, qua phê duyệt của Ban Giám Đốc, và tự động chuyển đổi thành Đơn đặt hàng gửi cho nhà cung cấp.',
  pages: [
    {
      id: 'purchase-requisition',
      title: 'Yêu cầu Mua hàng (PR - Purchase Requisition)',
      description:
        'Quy trình nội bộ để các phòng ban (Xưởng Dịch vụ, Kế toán, Kho) đề nghị mua thêm vật tư, thiết bị khi có nhu cầu.',
      route: '/warehouse/purchase/requests',
      steps: [
        '1. Nhân viên có nhu cầu vào menu [Mua Hàng] -> [Yêu Cầu Mua Hàng] -> Bấm [Tạo Yêu Cầu].',
        '2. Nhập thông tin: Phòng ban yêu cầu, Ngày cần hàng, Mức độ ưu tiên (Bình thường / Gấp).',
        "3. Thêm chi tiết các mặt hàng cần mua: Chọn Mã sản phẩm, Nhập số lượng yêu cầu, Mô tả lý do cần mua (Ví dụ: 'Phụ tùng đang dưới mức an toàn', 'Khách VIP đang chờ thay thế').",
        '4. Bấm [Gửi Phê Duyệt].',
        '5. Trưởng bộ phận sẽ nhận được thông báo để vào duyệt Bước 1.',
        '6. Nếu giá trị vượt hạn mức, yêu cầu sẽ tự động đẩy lên Ban Giám Đốc phê duyệt Bước 2.',
        "7. Sau khi được Duyệt toàn bộ, trạng thái phiếu sẽ chuyển thành 'Chờ mua hàng' và Bộ phận Thu mua sẽ tiếp nhận.",
      ],
      tips: [
        'Tận dụng tính năng [Gợi ý mua hàng] của hệ thống. Dựa trên số liệu báo động Tồn kho an toàn, phần mềm sẽ tự động sinh ra một bản nháp Yêu cầu mua hàng tổng hợp vào mỗi sáng thứ Hai.',
        'Bộ phận Thu mua có quyền gom nhiều Yêu cầu mua hàng nhỏ lẻ của các phòng ban khác nhau thành một Đơn đặt hàng lớn (PO) gửi cho một Nhà cung cấp để ép giá tốt hơn.',
      ],
    },
    {
      id: 'purchase-order',
      title: 'Đơn Đặt Hàng (PO - Purchase Order)',
      description:
        'Văn bản chính thức gửi đến Nhà cung cấp để xác nhận việc mua hàng với số lượng, giá cả và thời hạn cụ thể.',
      route: '/warehouse/purchase/orders',
      steps: [
        '1. Nhân viên Thu mua vào [Mua Hàng] -> [Đơn Đặt Hàng] -> [Tạo PO].',
        '2. Chọn Nhà cung cấp. Hệ thống tự động load bảng giá thỏa thuận của NCC đó (nếu có cấu hình trước).',
        "3. Lựa chọn nguồn sinh PO: 'Từ các Yêu cầu mua hàng đã duyệt' hoặc 'Tạo mới thủ công'.",
        '4. Cập nhật Số lượng thực mua và Đơn giá đàm phán cuối cùng. Chọn thời hạn giao hàng cam kết.',
        '5. Cấu hình [Điều khoản Thanh toán] (Ví dụ: Trả chậm 30 ngày).',
        '6. Bấm [Chốt Đơn Đặt Hàng] và In bản PDF (có chữ ký điện tử của công ty) để gửi email trực tiếp cho NCC ngay từ phần mềm.',
        "7. Trạng thái PO sẽ là 'Chờ nhận hàng'. Khi Thủ kho nhập đủ số lượng, PO sẽ tự động chuyển trạng thái 'Hoàn thành'.",
      ],
      tips: [
        'Nên đính kèm bảng báo giá file PDF hoặc ảnh chụp tin nhắn Zalo chốt giá với Sale của nhà cung cấp vào PO để sau này Kế toán dễ dàng đối chiếu khi thanh toán.',
        "Nếu NCC giao thiếu hàng, hệ thống vẫn ghi nhận PO là 'Đang thực hiện' (Backorder) cho đến khi số lượng nhập kho bằng đúng số lượng đặt, hoặc bạn chủ động chọn 'Đóng PO' để hủy bỏ phần thiếu.",
      ],
    },
  ],
};
