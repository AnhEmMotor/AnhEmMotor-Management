import type { GuideSection } from "../guideData";
import { UserFilled } from "@element-plus/icons-vue";

export const customerSection: GuideSection = {
  id: "customer",
  icon: UserFilled,
  title: "Khách hàng",
  subtitle: "Customers",
  color: "#8b5cf6",
  shadowColor: "rgba(139,92,246,0.15)",
  description: "Quản lý danh sách khách hàng tiềm năng và hồ sơ khách hàng.",
  pages: [
    {
      id: "customer-potential",
      title: "Quản Lý Khách Hàng Tiềm Năng (Leads)",
      route: "/Marketing/customer/potential",
      description:
        "Theo dõi, đánh giá mức độ quan tâm (Hot/Warm/Cold) và phân bổ nhân sự chăm sóc cơ hội bán hàng từ các kênh website/mạng xã hội.",
      steps: [
        "Truy cập trang <b>Khách hàng tiềm năng</b>. Xem nhanh số liệu tổng quan về các lead nóng, lead mới trong ngày.",
        "Theo dõi danh sách lead. Chú ý các lead có biểu tượng ngọn lửa đỏ nhấp nháy (<b>Cảnh báo xử lý gấp</b>) hoặc dải băng đỏ (<b>Chăm sóc chậm</b>).",
        "Nhấn vào dòng lead để xem lịch sử hoạt động, hoặc nhấp vào cột hành động để phân bổ nhân viên chăm sóc.",
        "Cập nhật trạng thái cơ hội (Mới, Đã liên hệ, Đang tư vấn, Thành công, Thất bại) tùy theo tiến trình thực tế.<br><img src='/api/v1/MediaFile/view-image/manuals/customer-potential-step-3.png' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Sử dụng bộ lọc nâng cao để tìm kiếm lead theo nguồn (Chatbot, Catalog...), trạng thái hoặc độ ưu tiên.",
      ],
      tips: [
        "Cần xử lý ngay các lead nóng/chậm chăm sóc để tránh làm nguội tương tác khách hàng.",
        "Dữ liệu lead được đồng bộ thời gian thực từ các điểm chạm chatbot của khách trên website.",
      ],
    },
    {
      id: "customer-profile-360",
      title: "Hồ Sơ Khách Hàng Chi Tiết 360°",
      route: "/Marketing/customer/profile",
      description:
        "Nơi hội tụ toàn bộ thông tin định danh pháp lý và lịch sử tương tác đa kênh của khách hàng phục vụ chốt sale và dịch vụ hành chính.",
      steps: [
        "Vào mục <b>Hồ sơ khách hàng</b> và tìm kiếm khách hàng bằng Tên, SĐT, Email hoặc CCCD.",
        "Nhấp chọn một khách hàng để mở màn hình <b>Hồ sơ 360°</b> 3 cột hiện đại.",
        "Xem thông tin cứng (CCCD, địa chỉ thường trú Biên Hòa) ở cột trái. Nhấn <b>Xác thực hồ sơ</b> để khóa thông tin sau khi đối chiếu giấy tờ gốc.",
        "Theo dõi <b>Dòng thời gian tương tác (Timeline)</b> ở cột giữa ghi nhận log chatbot, ghi chú sale, và dấu mốc showroom.<br><img src='/api/v1/MediaFile/view-image/manuals/customer-profile-360-step-3.png' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Đọc thẻ <b>AI Insight</b> ở cột phải để biết nhanh sở thích màu sắc, dòng xe quan tâm, và nhu cầu trả góp do trợ lý ảo đúc kết.",
      ],
      tips: [
        "Hãy tận dụng AI Insight để Sale có kịch bản đàm phán chốt đơn chính xác mà không hỏi lại thông tin trùng lặp.",
        "Xác thực địa chỉ Biên Hòa chính xác thông qua hệ thống dropdown để làm thủ tục biển số nhanh chóng không bị lỗi.",
      ],
    },
    {
      id: "customer-asset",
      title: "Quản Lý Tài Sản Khách Hàng (Lịch Sử Xe Sạch)",
      route: "/Marketing/customer/asset",
      description:
        "Quản lý thông tin chi tiết các phương tiện khách hàng sở hữu bao gồm số khung, số máy, biển số và thời hạn bảo hiểm.",
      steps: [
        "Truy cập trang <b>Tài sản Khách hàng</b>. Tìm kiếm khách hàng cần cập nhật tài sản phương tiện.",
        "Nhấn nút <b>Thêm tài sản mới</b> để đăng ký phương tiện mới cho khách hàng.",
        "Khai báo chính xác các thông tin: Số khung, Số máy, Biển số xe, Ngày mua và thời hạn đăng kiểm/bảo hiểm.<br><img src='/api/v1/MediaFile/view-image/manuals/customer-asset-step-2.png' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Hệ thống sẽ kết nối trực tiếp tài sản này với quy trình nhắc lịch bảo dưỡng thông minh để bảo chứng 'Lịch sử Xe sạch'.",
      ],
      tips: [
        "Số khung số máy là định danh duy nhất của xe, hãy nhập chính xác để đồng bộ lịch sử sửa chữa tại xưởng.",
        "Nên cập nhật ngày hết hạn bảo hiểm để hệ thống tự động cảnh báo gửi tin nhắn nhắc nhở.",
      ],
    },
    {
      id: "customer-care",
      title: "Chăm Sóc Khách Hàng & Đặc Quyền",
      route: "/Marketing/customer/care",
      description:
        "Phân loại đẳng cấp thành viên (Silver/Gold) và gửi tin nhắn chăm sóc/tặng voucher tự động qua Zalo.",
      steps: [
        "Vào mục <b>Khách hàng & Hỗ trợ</b> -> Tab <b>Khách hàng</b>.",
        "Xem phân loại đẳng cấp thành viên (Silver/Gold/Bronze) kèm số kỳ bảo dưỡng của từng khách hàng.",
        "Xem danh sách Voucher cá nhân của khách hàng dạng lưới có tích hợp mã QR quét nhanh tại quầy dịch vụ.",
        "Tại sidebar <b>Nhắc lịch thông minh (Smart Action Sidebar)</b>, theo dõi các cảnh báo khẩn cấp (như sắp hết hạn bảo hiểm).<br><img src='/api/v1/MediaFile/view-image/manuals/customer-care-step-3.png' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Nhấn nút <b>Gửi Zalo</b> ngay cạnh nhắc lịch để gửi tin nhắn chúc mừng hoặc ưu đãi tự động chỉ với 1 click.",
      ],
      tips: [
        "Hệ thống áp dụng triết lý 'Loyalty không điểm số', khuyến khích khách thăng hạng dựa trên số lần thực hiện dịch vụ thực tế.",
        "Hãy kiểm tra sidebar hàng ngày để thực hiện gửi tin nhắn chăm sóc kịp thời.",
      ],
    },
    {
      id: "customer-voucher",
      title: "Quản Lý & Phát Hành Voucher",
      route: "/Marketing/customer/voucher",
      description:
        "Tạo mới và quản lý danh mục mã giảm giá, thiết lập hạn mức và phạm vi áp dụng cho từng kênh bán hàng.",
      steps: [
        "Mở trang <b>Voucher</b> từ menu bên trái.",
        "Nhấn nút <b>Tạo Voucher mới</b> để mở form thông tin.",
        "Điền mã code, tên chương trình, loại giảm giá (Theo phần trăm hoặc Số tiền cố định), giá trị và mức giảm tối đa.<br><img src='/api/v1/MediaFile/view-image/manuals/customer-voucher-step-2.png' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Thiết lập các ràng buộc: Giá trị đơn hàng tối thiểu, giới hạn lượt dùng toàn hệ thống và giới hạn lượt dùng trên mỗi user.",
        "Chọn phạm vi áp dụng (Phụ tùng, Xe máy hoặc Tất cả) và kênh phát hành (Cửa hàng, Website hoặc Tất cả). Nhấn <b>Kích hoạt</b> và lưu lại.",
      ],
      tips: [
        "Hãy chắc chắn thiết lập trần giảm giá tối đa (maxDiscountAmount) cho voucher phần trăm để kiểm soát ngân sách.",
        "Hệ thống POS và Website sẽ tự động áp dụng và kiểm tra tính hợp lệ của voucher theo các cấu hình này.",
      ],
    },
    {
      id: "customer-chat",
      title: "Hỗ Trợ Trực Tuyến & Live Chat",
      route: "/Marketing/customer/store-chat",
      description:
        "Kênh chat trực tiếp với khách hàng từ website bán hàng, hỗ trợ tư vấn sản phẩm và gửi trực tiếp voucher kích cầu mua sắm.",
      steps: [
        "Vào mục <b>Hỗ trợ trực tuyến (Store Chat)</b> để mở giao diện quản lý hội thoại.",
        "Chọn phiên chat đang mở từ danh sách khách hàng đang trực tuyến ở cột trái.",
        "Đọc nội dung tin nhắn và lịch sử xem sản phẩm của khách ở cột phải để biết khách đang quan tâm xe hoặc phụ tùng nào.",
        "Sử dụng khung chat để tư vấn trực tiếp. Bạn có thể nhấn nút gửi mã Voucher khuyến mãi gợi ý để kích thích khách chốt đơn.<br><img src='/api/v1/MediaFile/view-image/manuals/customer-chat-step-3.png' style='max-width: 100%; border-radius: 8px; margin-top: 10px; border: 1px solid #eee;' />",
        "Cập nhật thẻ trạng thái khách hàng trực tiếp từ khung chat để gắn thẻ phân loại nhanh.",
      ],
      tips: [
        "Trả lời tin nhắn nhanh dưới 2 phút giúp tăng tỷ lệ chốt sale lên tới 50%.",
        "Hãy gửi Voucher có nội dung cá nhân hóa đúng với sản phẩm khách đang xem trong giỏ hàng.",
      ],
    },
  ],
};
