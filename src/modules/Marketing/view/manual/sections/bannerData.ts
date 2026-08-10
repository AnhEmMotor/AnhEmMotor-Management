export const sectionData = {
  title: 'Quản Lý Banner & Hình Ảnh Mảng Marketing',
  description:
    'Trung tâm quản lý hiển thị hình ảnh trên toàn bộ hệ thống Website và Mobile App của công ty. Giúp thay đổi diện mạo trang web chỉ trong vài click chuột.',
  pages: [
    {
      id: 'banner-config',
      title: 'Thiết lập Banner Trang chủ',
      description:
        'Thay banner Slider (Băng chuyền) trang chủ, popup khuyến mãi và các khối hình ảnh quảng cáo.',
      route: '/marketing/banner/config',
      steps: [
        '1. Vào menu [Quản lý Banner] -> [Danh sách Banner].',
        '2. Nhấn [Tải lên Banner mới].',
        "3. Chọn vị trí hiển thị: 'Trang chủ Website', 'App Mobile Màn hình chính', hoặc 'Popup khi vừa vào web'.",
        '4. Nhập Link Đích (Target URL): Khi khách hàng bấm vào Banner này thì sẽ nhảy sang trang nào? (Ví dụ: Link dẫn tới trang Chi tiết chiến dịch Khuyến Mãi).',
        '5. Tải file hình ảnh lên. Hệ thống sẽ tự động crop và nén ảnh (Compress) để đảm bảo tốc độ tải trang web (Page Speed).',
        "6. Cài đặt thời gian hiển thị: Ví dụ Banner 'Mừng lễ 30/4' chỉ hiển thị từ 25/04 đến hết 01/05, sau đó tự động hạ xuống.",
        '7. Kéo thả để sắp xếp lại thứ tự xuất hiện của các Banner (Thứ tự 1, 2, 3...).',
      ],
      tips: [
        'Khuyến nghị sử dụng định dạng ảnh WebP để web load siêu tốc, thay vì PNG/JPG truyền thống.',
        'Luôn phải test hiển thị trên cả phiên bản Desktop và Mobile sau khi thay Banner mới để đảm bảo chữ trên hình không bị cắt xén.',
      ],
    },
  ],
};
