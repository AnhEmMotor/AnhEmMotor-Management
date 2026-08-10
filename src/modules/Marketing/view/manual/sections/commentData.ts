export const sectionData = {
  title: 'Quản Lý Bình Luận & Đánh Giá (Reviews)',
  description:
    'Trạm kiểm soát danh tiếng thương hiệu trực tuyến. Theo dõi và phản hồi tất cả các bình luận của khách hàng trên Website và App.',
  pages: [
    {
      id: 'comment-moderation',
      title: 'Kiểm duyệt & Phản hồi',
      description:
        'Duyệt hiển thị bình luận, trả lời thắc mắc của khách và xử lý các đánh giá tiêu cực (1-2 sao).',
      route: '/marketing/comment/moderation',
      steps: [
        '1. Vào menu [Bình Luận & Đánh Giá].',
        '2. Hệ thống liệt kê tất cả comment chờ duyệt. Các comment có chứa từ ngữ tục tĩu sẽ tự động bị bộ lọc khóa lại (Spam filter).',
        '3. Nhân viên CSKH đọc nội dung, nhấn [Duyệt] để comment được hiển thị công khai trên website.',
        "4. Sử dụng tính năng [Trả lời] để giải đáp câu hỏi của khách hàng (Ví dụ: 'Dạ, mẫu xe Honda SH 150i hiện tại đang có giá...').",
        '5. Đối với các đánh giá 1 sao (Ví dụ khách chê dịch vụ xưởng tồi), phải thiết lập quy trình: Cảnh báo đỏ tới Quản đốc -> Gọi điện xin lỗi khách -> Cập nhật lại kết quả xử lý vào hệ thống.',
      ],
      tips: [
        'Đừng xóa các đánh giá tiêu cực nếu đã xử lý thỏa đáng. Việc bạn trả lời xin lỗi công khai và đền bù cho khách sẽ tạo sự tin tưởng (Trust) lớn hơn rất nhiều đối với những khách hàng khác đọc được.',
        'Có thể sử dụng các mẫu câu trả lời soạn sẵn (Canned Responses) để CSKH phản hồi nhanh hơn.',
      ],
    },
  ],
};
