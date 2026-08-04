import type { GuideSection } from "../guideData";
import { Message } from "@element-plus/icons-vue";

export const contactSection: GuideSection = {
  id: "contact",
  icon: Message,
  title: "Liên hệ",
  subtitle: "Contacts",
  color: "#f43f5e",
  shadowColor: "rgba(244,63,94,0.15)",
  description:
    "Quản lý các yêu cầu liên hệ, tư vấn từ khách hàng gửi qua form.",
  pages: [
    {
      id: "contact-process",
      title: "Xử Lý Yêu Cầu Liên Hệ",
      route: "/Marketing/contact",
      description: "Kiểm tra và cập nhật trạng thái xử lý yêu cầu.",
      steps: [
        "Vào <b>Quản lý Liên hệ</b> để nhận các yêu cầu mới nhất.",
        "Click vào một dòng để xem chi tiết thông tin khách hàng: Tên, SĐT, Email và Nội dung cần tư vấn.",
        "Sau khi gọi điện hoặc gửi email phản hồi khách hàng, hãy cập nhật trạng thái từ <b>Chưa xử lý</b> sang <b>Đang xử lý</b> hoặc <b>Đã hoàn thành</b>.<br><img src='https://placehold.co/600x300/e2e8f0/1e293b?text=Cap+Nhat+Trang+Thai' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Ghi chú lại nội dung đã trao đổi với khách hàng vào phần <b>Ghi chú nội bộ</b> để các nhân viên khác cùng nắm.",
      ],
    },
  ],
};
