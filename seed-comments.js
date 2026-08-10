const comments = [
  {
    articleType: 'promotion',
    articleSlug: 'sieu-uu-dai-chao-he-rinh-xe-cuc-da',
    authorName: 'Lê Minh',
    content: 'Chương trình này hấp dẫn quá, áp dụng đến khi nào vậy admin?',
  },
  {
    articleType: 'promotion',
    articleSlug: 'sieu-uu-dai-chao-he-rinh-xe-cuc-da',
    authorName: 'Hải Yến',
    content: 'Đã qua xem xe và chốt luôn con Vario 160. Giá rất tốt so với mặt bằng chung.',
  },
  {
    articleType: 'promotion',
    articleSlug: 'tra-gop-0-phan-tram-so-huu-xe-sang',
    authorName: 'Trần Quân',
    content: 'Thủ tục trả góp cần chuẩn bị những giấy tờ gì ạ? Mình muốn mua SH.',
  },
  {
    articleType: 'promotion',
    articleSlug: 'tra-gop-0-phan-tram-so-huu-xe-sang',
    authorName: 'Thảo Ngân',
    content: 'Bên mình có hỗ trợ duyệt hồ sơ online không shop ơi?',
  },
  {
    articleType: 'promotion',
    articleSlug: 'doi-cu-lay-moi-gia-tri-toi-da',
    authorName: 'Nguyễn Văn Đạt',
    content: 'Xe Vision 2020 cũ đổi sang Air Blade 2024 thì bù tầm bao nhiêu vậy?',
  },
  {
    articleType: 'promotion',
    articleSlug: 'doi-cu-lay-moi-gia-tri-toi-da',
    authorName: 'Phạm Tùng',
    content: 'Định giá xe cũ bên mình khá chuẩn, không bị ép giá.',
  },
  {
    articleType: 'promotion',
    articleSlug: 'bao-duong-mien-phi-an-tam-moi-neo-duong',
    authorName: 'Anh Tuấn',
    content: 'Dịch vụ bảo dưỡng ở đây rất chuyên nghiệp, nhân viên nhiệt tình.',
  },
  {
    articleType: 'promotion',
    articleSlug: 'combo-phu-kien-an-toan-len-do-chuan-chat',
    authorName: 'Hoàng Oanh',
    content: 'Combo này có bao gồm mũ bảo hiểm fullface không ạ?',
  },
  {
    articleType: 'promotion',
    articleSlug: 'dat-coc-xe-moi-nhan-qua-giao-xe',
    authorName: 'Đình Trọng',
    content: 'Quà tặng giao xe đợt này là gì vậy ad? Có voucher sửa chữa không?',
  },
  {
    articleType: 'technology',
    articleSlug: 'phan-phoi-xe-may',
    authorName: 'Lý Hải',
    content: 'Showroom lớn, xe đa dạng, mình sẽ ghé mua cuối tuần này.',
  },
  {
    articleType: 'technology',
    articleSlug: 'phu-tung-do-choi-xe',
    authorName: 'Bảo Duy',
    content: 'Có phuộc YSS cho Winner X không shop, mình đang tìm mãi.',
  },
  {
    articleType: 'technology',
    articleSlug: 'phu-tung-do-choi-xe',
    authorName: 'Thanh Bình',
    content: 'Đồ chơi xe ở đây bao la, toàn hàng chính hãng. Vote 5 sao nhé!',
  },
  {
    articleType: 'technology',
    articleSlug: 'bao-duong-sua-chua',
    authorName: 'Tuấn Kiệt',
    content: 'Xe mình bị hụt ga, mang qua bên này sửa 1 tiếng là êm ru.',
  },
  {
    articleType: 'technology',
    articleSlug: 'tra-gop-tai-chinh',
    authorName: 'Vân Anh',
    content: 'Tư vấn rất có tâm, mình làm hồ sơ đậu ngay trong 30 phút.',
  },
  {
    newsId: 20,
    authorName: 'Ngô Quyền',
    content: 'Bài viết rất dễ hiểu. Bây giờ mình mới phân biệt được ABS và CBS.',
  },
  {
    newsId: 21,
    authorName: 'Quang Dũng',
    content: 'Cảm ơn ad đã chia sẻ mẹo hay, ắc quy xe mình hay bị chai.',
  },
];

async function seed() {
  for (const c of comments) {
    const payload = {
      newsId: c.newsId || null,
      articleType: c.articleType || null,
      articleSlug: c.articleSlug || null,
      authorName: c.authorName,
      authorEmail: 'test@example.com',
      content: c.content,
    };
    try {
      const res = await fetch('http://localhost:5000/api/v1/news-comments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(`Created comment by ${c.authorName}: ${res.status}`);
    } catch (e) {
      console.error(e);
    }
  }
}

seed();
