export const sectionData = {
  title: 'Tài chính Hợp Đồng (Contracts)',
  description:
    'Theo dõi tiến độ thanh toán của các hợp đồng mua bán xe, đặc biệt là các hợp đồng trả góp qua ngân hàng hoặc hợp đồng bán lô (B2B).',
  pages: [
    {
      id: 'contract-finance',
      title: 'Theo dõi Thanh toán Hợp đồng',
      description: 'Giám sát các đợt giải ngân và hạch toán doanh thu tương ứng.',
      route: '/accountant/contracts/finance',
      steps: [
        '1. Vào [Tài chính Hợp đồng]. Màn hình hiển thị danh sách các Hợp đồng đang chờ tiền.',
        '2. Đối với Hợp đồng Trả góp: Kế toán theo dõi Thông báo giải ngân từ Ngân hàng (HD Saison, FE Credit...).',
        '3. Khi tiền về tài khoản, click vào Hợp đồng, chọn [Ghi nhận thanh toán đợt cuối].',
        "4. Kế toán xác nhận 'Đã thu đủ', lúc này Sales mới được phép tiến hành Giao xe.",
        '5. Đối với Hợp đồng B2B: Theo dõi các cột mốc (Milestones) thanh toán (Lần 1: 30%, Lần 2: 70%).',
        "6. Chuyển trạng thái hợp đồng thành 'Đã hoàn tất thanh toán'.",
      ],
      tips: [
        'Kế toán cần liên tục check SMS/App Ngân hàng để ghi nhận tiền giải ngân nhanh nhất, tránh để khách hàng phải chờ đợi ở showroom quá lâu.',
        'Nếu ngân hàng giải ngân thiếu tiền (do trừ phí hồ sơ), Kế toán hạch toán phần chênh lệch vào Chi phí tài chính.',
      ],
    },
  ],
};
