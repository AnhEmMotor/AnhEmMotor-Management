export const sectionData = {
  title: 'Kế toán Kho & Giá vốn',
  description:
    'Kiểm soát chặt chẽ giá trị hàng tồn kho, tính toán tự động Giá vốn hàng bán (COGS) theo nhiều phương pháp, và đối soát chênh lệch kiểm kê.',
  pages: [
    {
      id: 'inventory-valuation',
      title: 'Định giá Tồn Kho',
      description:
        'Xem báo cáo tổng giá trị hàng hóa đang nằm trong kho và chạy các bút toán tính giá vốn cuối tháng.',
      route: '/accountant/inventory/valuation',
      steps: [
        '1. Vào menu [Kế toán Kho] -> [Định giá Tồn kho].',
        '2. Hệ thống mặc định tính giá vốn theo phương pháp BÌNH QUÂN GIA QUYỀN (Weighted Average).',
        '3. Kế toán kho kiểm tra danh sách các phiếu Nhập/Xuất trong tháng xem có phiếu nào chưa được duyệt (Pending) không.',
        '4. Cuối tháng, nhấn [Chạy Tính Giá Vốn]. Quá trình này sẽ tự động cập nhật lại đơn giá vốn cho tất cả các phiếu xuất bán lẻ, bán buôn, xuất sửa chữa trong tháng.',
        '5. Bấm [Chốt Sổ Kho] để khóa sổ, không ai được phép sửa/xóa các phiếu nhập xuất của tháng đó nữa.',
      ],
      tips: [
        "Tuyệt đối phải kiểm tra kho cẩn thận trước khi ấn 'Chốt sổ' vì sau khi khóa sổ, mọi sai lệch sẽ phải làm bút toán điều chỉnh ở tháng sau.",
        "Nếu kho báo cáo mất mát hàng hóa, Kế toán lập phiếu 'Xuất Hủy' và hạch toán vào chi phí khác hoặc trừ lương nhân viên.",
      ],
    },
  ],
};
