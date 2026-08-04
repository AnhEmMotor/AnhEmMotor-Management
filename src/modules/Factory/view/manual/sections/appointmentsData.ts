export const sectionData = {
  title: "Lịch Sửa Chữa",
  description: "Quản lý danh sách đặt lịch hẹn sửa chữa từ khách hàng.",
  pages: [
    {
      id: "appointments-list",
      title: "Danh sách lịch hẹn",
      description: "Xem và xử lý các lịch hẹn bảo dưỡng, sửa chữa.",
      route: "/factory/workshop/appointments",
      steps: [
        "Xem danh sách lịch hẹn trong ngày.",
        "Tiếp nhận lịch hẹn và chuyển sang trạng thái đang xử lý.",
        "Xác nhận hoàn thành hoặc hủy lịch."
      ],
      tips: ["Nên gọi điện thoại xác nhận với khách hàng trước khi tiếp nhận."]
    }
  ]
}
