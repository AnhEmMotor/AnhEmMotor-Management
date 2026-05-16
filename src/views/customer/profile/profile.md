📑 Tài liệu Giao diện: Hồ sơ Khách hàng Chi tiết (360° Customer Insight)

1. Bối cảnh & Mục tiêu thực tế

Trong kinh doanh xe máy, dữ liệu khách hàng không chỉ dừng lại ở việc bán hàng mà còn phục vụ các dịch vụ sau bán và thủ tục hành chính phức tạp.

Tính toàn vẹn dữ liệu: Đảm bảo thông tin định danh không bị sai lệch để phục vụ dịch vụ làm biển số tại khu vực Biên Hòa.

Cá nhân hóa trải nghiệm: Lưu vết mọi tương tác từ AI Chatbot đến ghi chú của nhân viên Sale để thấu hiểu tâm lý khách (ví dụ: sở thích màu sắc, rào cản về giá).

Hành trình xuyên suốt: Một giao diện duy nhất quản lý khách hàng từ khi còn là Khách tiềm năng (Lead) $\rightarrow$ Đang mua (Process) $\rightarrow$ Chính thức (Owner).

2. Bố cục Giao diện (Layout Architecture)

Giao diện được triển khai theo cấu trúc Bảng điều khiển 3 khu vực (Three-Column Dashboard) để tối ưu hóa khả năng hiển thị thông tin mà không cần cuộn trang quá nhiều:

Cột Trái (Navigation & Search): Danh sách nhanh các khách hàng đang chăm sóc, cho phép Sale chuyển đổi hồ sơ chỉ bằng một cú click, giữ cho mạch làm việc không bị gián đoạn.

Cột Giữa (Identity & Administrative): Tập trung vào dữ liệu định danh và hồ sơ hành chính. Đây là "vùng dữ liệu cứng" dùng cho các thủ tục pháp lý và dịch vụ biển số.

Cột Phải (Interaction & Intelligence): Khu vực động, lưu trữ dòng thời gian tương tác, phân tích từ AI và các ghi chú nội bộ.

3. Luồng xử lý dữ liệu (Data Workflow)

Giai đoạn Tiềm năng: Hệ thống ghi nhận các thông tin từ AI Chatbot (như dòng xe quan tâm, câu hỏi về kỹ thuật) và gán vào dòng thời gian.

Giai đoạn Đang mua: Nhân viên bổ sung dữ liệu định danh (CCCD, Địa chỉ chi tiết tại Biên Hòa) để chuẩn bị hồ sơ nộp thuế và bấm biển.

Giai đoạn Đã mua: Hồ sơ chuyển trạng thái "Chính thức", kích hoạt Tab Hồ sơ xe để quản lý số khung, số máy và bảo hành.

4. Phân tích Thành phần Giao diện (UI Components)

Giao diện được thiết kế với triết lý tập trung vào dữ liệu có độ chính xác cao. Ở trung tâm là khối Hồ sơ Định danh, nơi các trường dữ liệu như Địa chỉ, Phường/Xã tại Biên Hòa và số CCCD được bố trí rõ ràng, hỗ trợ kiểm soát lỗi nhập liệu để phục vụ chính xác cho khâu làm biển số. Phía trên là Thẻ định danh rút gọn hiển thị trạng thái khách hàng (Chính thức/Tiềm năng) cùng các nút liên lạc nhanh qua Zalo hoặc gọi điện để Sale có thể phản ứng tức thì với nhu cầu của khách.

Khu vực quan trọng nhất về mặt vận hành là hệ thống Tab Tương tác đa chiều. Tại đây, tab Dòng thời gian ghi lại chi tiết mọi diễn biến như "Đã đến showroom lái thử" hay "Đang chờ duyệt hồ sơ vay trả góp". Song song đó, tab Trợ lý AI cung cấp những thông tin chi tiết (insights) được tóm tắt từ các câu hỏi mà khách đã hỏi chatbot, giúp Sale biết trước khách đang cân nhắc về giá hay thích màu sắc nào để đưa ra kịch bản tư vấn thuyết phục nhất. Toàn bộ quy trình được hoàn thiện bằng tab Ghi chú mật, nơi lưu trữ những nhận định riêng tư của nhân viên về khách hàng, đảm bảo tính liên tục của dữ liệu ngay cả khi có sự thay đổi về nhân sự phụ trách.

5. Đặc tính kỹ thuật hỗ trợ toàn vẹn dữ liệu

Validation địa chỉ: Sử dụng danh sách Phường/Xã cố định tại Biên Hòa để tránh sai sót khi khai báo thuế.

Real-time Timeline: Cập nhật ngay lập tức các hoạt động của khách hàng từ Website AnhEmMotor vào hồ sơ quản lý.

AI Summary: Tự động tóm tắt ý định mua hàng dựa trên lịch sử chat để hỗ trợ Sale ra quyết định nhanh.