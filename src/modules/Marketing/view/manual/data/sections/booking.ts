import type { GuideSection } from "../guideData";
import { Calendar } from "@element-plus/icons-vue";

export const bookingSection: GuideSection = {
  id: "booking",
  icon: Calendar,
  title: "Đặt lịch",
  subtitle: "Booking",
  color: "#ec4899",
  shadowColor: "rgba(236,72,153,0.15)",
  description: "Quản lý lịch hẹn bảo dưỡng, sửa chữa hoặc lái thử xe.",
  pages: [
    {
      id: "booking-manage",
      title: "Quản Lý Lịch Hẹn",
      route: "/Marketing/booking",
      description: "Cách điều phối và xác nhận lịch hẹn với khách hàng.",
      steps: [
        "Vào <b>Quản lý Lịch hẹn</b>. Danh sách sẽ hiển thị các lịch hẹn mới ở trạng thái <b>Chờ xác nhận</b>.",
        "Liên hệ với khách hàng để xác nhận thời gian, địa điểm và loại dịch vụ.",
        "Sau khi xác nhận, chuyển trạng thái thành <b>Đã xác nhận</b>.<br><img src='https://placehold.co/600x300/e2e8f0/1e293b?text=Xac+Nhan+Lich+Hen' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Nếu khách hàng muốn đổi lịch, hãy cập nhật lại thời gian và ghi chú vào hệ thống.",
        "Khi dịch vụ hoàn tất, cập nhật trạng thái thành <b>Hoàn thành</b>.",
      ],
      tips: [
        "Theo dõi các lịch hẹn trong ngày qua chế độ xem dạng Lịch (Calendar view) để dễ dàng sắp xếp công việc.",
      ],
    },
  ],
};
