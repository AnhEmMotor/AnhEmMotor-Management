🚀 Tài liệu Giao diện: Hồ sơ Khách hàng Chi tiết 360° (Customer Profile Dashboard)

1. Bối cảnh & Vấn đề (Context & Problem)

Trong hoạt động kinh doanh xe máy tại AnhEmMotor, dữ liệu khách hàng đóng vai trò cốt lõi trong cả hai khâu: Chốt sale và Dịch vụ hành chính. Thực tế hiện nay đang tồn tại những "nút thắt" lớn:

Sai lệch dữ liệu hành chính: Lỗi đánh máy địa chỉ Phường/Xã tại khu vực Biên Hòa hoặc nhập sai số CCCD thường xuyên dẫn đến việc hồ sơ nộp thuế và bấm biển số bị từ chối, gây tốn kém thời gian và làm giảm uy tín với khách hàng.

Mất dấu "Insight" khách hàng: Hàng ngày, khách hàng tương tác qua hàng chục câu hỏi với Chatbot (hỏi về giá, màu xe) và gọi điện cho Sale. Tuy nhiên, những dữ liệu "vàng" này (ví dụ: khách thích màu đỏ, đang cân nhắc trả góp) không được tổng hợp lại, khiến nhân viên khó nắm bắt tâm lý khách hàng.

Hệ thống đứt gãy: Việc quản lý tách biệt giữa tệp khách "Tiềm năng", "Đang mua" và "Đã mua" khiến nhân viên không có cái nhìn xuyên suốt về vòng đời của một khách hàng.

2. Mục tiêu Giải pháp (Solution Objectives)

Giao diện "Hồ sơ 360°" được thiết kế nhằm giải quyết triệt để các vấn đề trên với 3 mục tiêu chiến lược:

Toàn vẹn dữ liệu tuyệt đối (Data Integrity): Chuẩn hóa toàn bộ dữ liệu định danh bằng các bộ quy tắc nhập liệu cứng để phục vụ hoàn hảo cho dịch vụ làm biển số.

Hội tụ thông tin (Data Convergence): Tập hợp mọi điểm chạm của khách hàng—từ lịch sử chat AI, hành vi xem web đến ghi chú của nhân viên Sale—vào một giao diện duy nhất.

Hỗ trợ ra quyết định (Decision Support): Sử dụng AI để phân tích và tóm tắt tâm lý khách hàng, cung cấp "vũ khí" cho Sale chốt đơn.

3. Luồng xử lý bài bản (Operational Workflow)

Quy trình vận hành xoay quanh hồ sơ khách hàng diễn ra theo các giai đoạn sau:

Giai đoạn 1: Khám phá & Ghi nhận (Khách Tiềm năng)

Khách hàng tương tác với Chatbot hoặc Website. Hệ thống tự động ghi nhận dữ liệu vào Dòng thời gian (VD: Hệ thống AI: Khách hỏi về mức tiêu hao xăng của Winner X).

Hệ thống phân tích hành vi và tóm tắt vào thẻ AI Insight (VD: Thích màu Đỏ Đen).

Giai đoạn 2: Định danh & Xử lý (Khách Đang mua)

Sale liên hệ khách và chốt thông tin. Nhân viên nhập liệu vào khu vực Hồ sơ hành chính.

Hệ thống buộc nhân viên sử dụng Menu thả xuống (Dropdown) cho các trường địa chỉ (Đồng Nai $\rightarrow$ Biên Hòa $\rightarrow$ Phường/Xã) và áp dụng định dạng chuẩn cho CCCD.

Admin đối chiếu giấy tờ gốc và nhấn nút [Xác thực hồ sơ] để khóa dữ liệu, ngăn chặn chỉnh sửa trái phép.

Giai đoạn 3: Sở hữu & Dịch vụ (Khách Chính thức)

Sau khi giao dịch hoàn tất, thẻ Thông tin xe/Dịch vụ được kích hoạt, hiển thị dữ liệu tài sản (Số khung, số máy) và trạng thái biển số hiện tại, phục vụ cho quá trình bảo hành sau này.

4. Phân tích Cấu trúc Giao diện (UI Architecture)

Giao diện được thiết kế theo cấu trúc 3 cột (Three-Column Dashboard) tối ưu hóa diện tích hiển thị trên màn hình PC của nhân viên:

Khối Cố định (Header)

Nằm ở vị trí trên cùng, cung cấp thông tin cốt lõi nhất: Tên khách hàng (Nguyễn Hoàng Long), trạng thái (ĐANG MUA) và các nút thao tác liên lạc khẩn cấp (Zalo Chat, Gọi điện).

Cột Trái: Dữ liệu Cứng (The "Hard" Data)

Đây là khu vực bảo mật và chuẩn hóa cao nhất.

Mã định danh: Cung cấp QR Code và mã khách hàng duy nhất (AEM-2024-089).

Hồ sơ Hành chính: Nơi nhập liệu CCCD và Địa chỉ thường trú với hệ thống Dropdown tĩnh. Nút Xác thực hồ sơ hoạt động như một chốt chặn an toàn dữ liệu.

Cột Giữa: Dữ liệu Động (The "Living" Feed)

Trung tâm của toàn bộ tương tác khách hàng.

Dòng thời gian tương tác (Timeline): Trình bày trực quan các sự kiện theo trình tự thời gian, phân biệt rõ ràng giữa log của Hệ thống AI, Sale ghi chú và các Dấu mốc quan trọng (như đến showroom).

Bao gồm bộ lọc nhanh để Sale dễ dàng tra cứu lại lịch sử chat hoặc các ghi chú cũ.

Cột Phải: Phân tích & Tài sản (The "Insights & Assets")

AI Insight: Khối thông tin màu tím nổi bật, đúc kết 3 chỉ số quan trọng nhất để "đọc vị" khách hàng: Màu sắc ưu tiên, Mối quan tâm chính (Trả góp) và Hành vi lướt web (Xem SH 125i).

Thông tin xe/Dịch vụ: Quản lý vòng đời sản phẩm khách đã mua, hiển thị chi tiết số khung và trạng thái biển số (Đã có biển).


1. Cách tạo mã QR (Generation)
Trong lập trình, mã QR thực chất là một chuỗi ký tự được mã hóa dưới dạng hình ảnh. Để đảm bảo tính toàn vẹn dữ liệu, bạn nên thực hiện theo các bước sau:

Tạo Mã Định Danh Duy Nhất (Unique ID): Mỗi khi một khách hàng mới được tạo (Lead), Backend sẽ tự động sinh ra một mã định danh theo quy tắc, ví dụ: AEM-2024-089 (như trong hình image_cf4140.png).

Mã hóa URL hồ sơ: Thay vì chỉ chứa mã ID, bạn nên mã hóa một đường dẫn (Deep Link) trỏ thẳng đến trang hồ sơ đó trong hệ thống quản lý.

Ví dụ: [https://crm.anhemmotor.vn/customer/AEM-2024-089](https://crm.anhemmotor.vn/customer/AEM-2024-089)

Công cụ thực hiện:

Frontend (Vue 3): Sử dụng các thư viện như qrcode.vue để render hình ảnh QR trực tiếp từ chuỗi ID ngay khi trang hồ sơ được tải.

Backend (.NET Core): Sử dụng thư viện QRCoder để tạo mã và lưu trữ dưới dạng file ảnh hoặc Base64 nếu bạn muốn in ra các tài liệu giấy sau này.

2. Luồng xử lý sau khi đã có mã QR (Workflow)
Sau khi mã QR đã hiện diện trong hồ sơ khách hàng, quy trình vận hành sẽ được tối ưu hóa qua 4 giai đoạn chính:

Giai đoạn 1: Tiếp đón khách tại Showroom (Check-in)
Khi khách hàng (ví dụ: anh Nguyễn Hoàng Long) đến trực tiếp showroom tại Biên Hòa:

Nhân viên Sale mở ứng dụng trên điện thoại/máy tính bảng.

Khách hàng đưa mã QR (nếu được gửi qua Zalo trước đó) hoặc Sale tìm nhanh mã QR trong hồ sơ.

Hành động: Quét mã QR để xác nhận khách đã có mặt. Hệ thống tự động ghi nhận một "Dấu mốc" (Milestone) vào Dòng thời gian tương tác.

Giai đoạn 2: Bàn giao và Tư vấn dựa trên "Insight"
Khi Sale quét mã QR và mở hồ sơ:

Hệ thống hiển thị ngay khối AI Insight (Màu Đỏ Đen, Quan tâm trả góp).

Sale không cần hỏi lại những điều khách đã chat với AI trước đó, tạo cảm giác chuyên nghiệp và thấu hiểu khách hàng ngay tức thì.

Giai đoạn 3: Làm thủ tục Biển số (Administrative)
Đây là giai đoạn cực kỳ quan trọng để đảm bảo toàn vẹn dữ liệu:

Nhân viên làm hồ sơ quét mã QR để lấy dữ liệu từ mục Hồ sơ hành chính.

Dữ liệu địa chỉ tại Biên Hòa và số CCCD đã được Xác thực trước đó sẽ được đổ trực tiếp vào mẫu khai thuế hoặc đăng ký xe, loại bỏ hoàn toàn việc nhập tay sai sót.

Giai đoạn 4: Quản lý sau bán hàng (Post-Purchase)
Khi khách hàng quay lại bảo dưỡng xe:

Kỹ thuật viên quét mã QR gắn trên xe hoặc thẻ thành viên.

Hệ thống hiển thị Thông tin xe/Dịch vụ (Số khung, số máy, biển số: 60-B1 123.45) để đối chiếu và ghi nhận lịch sử bảo trì.