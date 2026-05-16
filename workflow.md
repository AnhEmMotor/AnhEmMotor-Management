7. NHẬP KHO & ĐỊNH DANH TÀI SẢN (INVENTORY WORKFLOW)

7.1. Danh mục Đối tác & Nhà cung cấp
•	Nhà cung cấp xe/phụ tùng: Honda Việt Nam, đại lý cấp 1, NCC phụ tùng — Link đến lịch sử nhập hàng.
•	Đối tác tài chính: FE Credit, Home Credit, ... — Theo dõi giải ngân trả góp.
•	Đối tác bảo hiểm: Các đơn vị liên kết xử lý quyền lợi khách khi có sự cố.

7.2. Luồng Nhập kho Định danh
Bước 1:	Tiếp nhận & Khởi tạo: Admin truy cập inventory-form.vue, chọn Nhà cung cấp và Dòng xe vừa về. Nhập đơn giá nhập (Giá vốn).
Bước 2:	Định danh & Kiểm tra: Quét QR hoặc nhập tay Số khung và Số máy. Kiểm tra chất lượng xe (Mới 100%, trầy xước, số chìa khóa). Hệ thống tự động kiểm tra trùng lặp — báo đỏ nếu số khung/máy đã tồn tại.
Bước 3:	Phân bổ vị trí & Lưu kho: Xác định vị trí dựng xe (Khu trưng bày, Kho dự phòng). Gán vị trí vào hệ thống. Trạng thái xe được ghi là 'Available'.
Bước 4:	Hoàn tất & Chốt sổ: Admin kiểm tra toàn bộ lô hàng lần cuối và nhấn 'Hoàn tất nhập kho'. Hệ thống tự động cộng kho và sinh Nhật ký nhập hàng không thể sửa xóa.

7.3. Quản lý Công nợ & Cam kết
•	NCC hàng hóa: Theo dõi số tiền còn nợ, hạn thanh toán.
•	Đối tác Ngân hàng: Theo dõi hồ sơ trả góp đang 'treo'. Nếu ngân hàng chậm giải ngân, Admin tra ngay đầu mối liên hệ tại mục 7.1.

