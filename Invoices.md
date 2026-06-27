🏍️ 3. ĐẶC TẢ TRANG: HÓA ĐƠN BÁN HÀNG (HÀNG LÀ XE MÁY)
Mục đích: Quản lý hồ sơ pháp lý, tài chính và số định danh tài sản đối với mặt hàng giá trị cao là Xe máy bán trực tiếp tại showroom.

A. Tư duy vận hành (Operational Mindset)
Quản lý định danh tài sản tuyệt đối (Asset Tracking): Khác với phụ tùng bán theo lô, mỗi chiếc xe máy bán ra là độc nhất. Hóa đơn bắt buộc phải gắn liền với Số khung và Số máy thực tế của chiếc xe đó. Đây là thông tin pháp lý tối quan trọng để khách hàng đi đăng ký biển số với Cơ quan Công an.

Đồng bộ luồng thanh toán phức tạp: Hỗ trợ tách dòng tiền trong một hóa đơn (Ví dụ: Khách trả trước một phần tiền mặt, một phần cà thẻ, phần còn lại làm thủ tục trả góp qua ngân hàng).

B. Các thông tin hiển thị trên UI (Data Fields)
Hồ sơ định danh khách hàng (Hồ sơ đăng ký biển số): Họ tên (chuẩn theo CCCD), Số CCCD, Số điện thoại, Địa chỉ thường trú chính xác để viết tờ khai đăng ký xe.

Thông tin kỹ thuật của xe: Dòng xe (Ví dụ: Winner X, SH Mode), Màu sơn, Số khung (Chassis No), Số máy (Engine No).

Chi tiết tài chính: Giá xe (đã gồm VAT), Phí dịch vụ làm biển số/đăng ký hộ (nếu khách yêu cầu showroom làm trọn gói), Phí bảo hiểm xe máy (TNDS), Tổng giá trị hóa đơn.

Phương thức thanh toán: Tiền mặt | Chuyển khoản | Trả góp (Hiển thị tên Ngân hàng tài trợ).

C. Hướng đi thiết kế UI/UX (Layout & Interaction)
Bố cục: Thiết kế biểu mẫu dạng khối phẳng lớn (Structured Document View) mang lại cảm giác trang trọng, uy nghiêm giống như một tờ hóa đơn GTGT thực tế.

Điểm chạm thông minh:

Ô quét mã vạch/QR thông minh: Cạnh ô nhập Số khung, Số máy có icon camera. Nhân viên giao xe chỉ cần cầm máy tính bảng quét mã vạch dán trên sườn xe, hệ thống tự động điền (Auto-fill) Số khung, Số máy vào hóa đơn, triệt tiêu hoàn toàn rủi ro gõ sai một ký tự.

Khi hóa đơn chuyển sang trạng thái Đã hoàn tất thanh toán, hệ thống tự động sinh dữ liệu đẩy sang khối “Tiến độ Hợp đồng & Bàn giao Xe” trên Dashboard chính của Admin để chờ ngày làm thủ tục bàn giao xe cho khách.
