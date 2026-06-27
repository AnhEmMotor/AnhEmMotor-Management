🔄 2. ĐẶC TẢ TRANG: QUẢN LÝ HỦY ĐƠN / TRẢ HÀNG
Mục đích: Trạm kiểm soát rủi ro dòng tiền và tài sản. Đây là nơi Admin duyệt các yêu cầu hủy đơn (trước khi giao) hoặc hoàn trả hàng (sau khi khách nhận nhưng khiếu nại).

A. Tư duy vận hành (Operational Mindset)
Rào chắn chống gian lận (Fraud Prevention Guard): Nhân viên không được tự ý xóa hay sửa trạng thái đơn khi khách đòi hủy/trả. Mọi yêu cầu phải được tạo thành một "Hồ sơ sự cố" chờ Admin phê duyệt để tránh việc nhân viên bỏ túi riêng tiền của cửa hàng.

Đóng vết tài chính: Quy định rõ ràng dòng tiền đi đâu (Hoàn tiền mặt, Chuyển khoản lại cho khách, hay Treo tiền thành điểm tích lũy để khách mua đơn sau).

B. Các thông tin hiển thị trên UI (Data Fields)
Định danh hồ sơ: Mã phiếu xử lý (RMA-xxx), Mã đơn hàng gốc bị khiếu nại, Tên nhân viên tiếp nhận ca sự cố.

Phân loại yêu cầu (Type): Gồm 2 trạng thái Hủy đơn (Trước giao) hoặc Trả hàng (Sau giao).

Bằng chứng và lý do: Chuỗi văn bản lý do (Ví dụ: Khách đổi ý, Giao sai mẫu bugi, Nhớt bị rò rỉ khi vận chuyển) kèm theo khu vực xem hình ảnh/video bằng chứng do khách gửi qua Zalo/Fanpage.

Trạng thái hoàn tiền: Chưa hoàn tiền | Đã chuyển khoản hoàn | Không cần hoàn (Luồng COD).

C. Hướng đi thiết kế UI/UX (Layout & Interaction)
Bố cục: Split-screen (Chia đôi màn hình). Bên trái là danh sách các ca khiếu nại xếp theo mức độ khẩn cấp (Màu đỏ: Hàng lỗi cần đổi/hoàn tiền; Màu cam: Khách chủ động hủy đơn nháp).

Điểm chạm thông minh: Khi Admin kiểm tra bằng chứng xong, dưới chân trang có bộ đôi nút bấm hành động dứt khoát:

[ ❌ Từ chối yêu cầu ]: Giao diện hiện ô bắt buộc nhập lý do từ chối để hệ thống gửi thông báo cho Sale/Khách hàng.

[ ✓ Duyệt xử lý ]: Hệ thống tự động kích hoạt lệnh hoàn tiền sang bên Kế toán, đồng thời tạo một phiếu chờ khui hộp ở trang Quản lý hàng hoàn.
