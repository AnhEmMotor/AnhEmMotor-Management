👑 1. BAN ĐIỀU HÀNH & CHỦ SHOWROOM (EXECUTIVE OVERVIEW)

Không gian này được thiết kế dành riêng cho cấp quản trị cao cấp, tuân thủ đúng triết lý thiết kế "10 giây" để kiểm tra tình trạng sức khỏe của cửa hàng mà không cần đọc báo cáo dài dòng.  

Màn hình hiển thị cốt lõi: Giao diện revenue-dashboard.vue.  

Các chỉ số KPI đầu trang (Khớp Mục 2.2):

Doanh thu thực tế: Chỉ tính các đơn hàng đã ở trạng thái Completed để bảo đảm dòng tiền chắc chắn.  

Lợi nhuận ròng: Hệ thống tự tính bằng công thức: $\text{Doanh thu} - \text{Giá vốn hàng bán} - \text{Chi phí vận hành}$.  

Tiền đang treo (Pending Pipeline): Hiển thị tổng số tiền cọc giữ xe và tiền chờ ngân hàng/công ty tài chính giải ngân.  

Khối cần xử lý khẩn cấp: Gom các thông tin từ Khiếu nại mới, Ngân hàng chậm giải ngân, Xe sắp hết hàng, Lịch hẹn bị bỏ lỡ thành các đường dẫn nhanh (Deep-link) đến thẳng màn hình xử lý.  

Hệ thống Biểu đồ & Công cụ trực quan (Khớp Mục 2.3 & 2.6):

Thanh chuyển đổi chu kỳ thời gian thực: [Hôm nay] (hiển thị biểu đồ cột theo giờ), [Tháng này] (biểu đồ đường so với đường mục tiêu ngày), [Năm này].  

Hộp tóm tắt tháng kèm công thức tính toán dự báo tự động dựa trên tốc độ hiện tại.  

Dòng giao dịch thời gian thực chạy dọc liên tục ở chân trang, cập nhật qua cơ chế Real-time SSE không cần F5.  

Quyền hành động tối cao (Khớp Mục 12.4): Tiếp nhận thông báo khóa sổ từ Kế toán, mở giao diện duyệt chi lương/hoa hồng cuối tháng để kích hoạt chuyển đổi trạng thái dòng tiền sang Paid.  

Luồng xử lý dữ liệu ngầm (Khớp Mục 2.7): Toàn bộ dữ liệu của phân hệ này được bóc tách riêng qua lớp RevenueQueryHandler.cs kết hợp Redis Cache cho các chu kỳ dài nhằm bảo vệ hiệu năng hệ thống vào giờ cao điểm.  

🏍️ 2. KHỐI KINH DOANH & QUAN HỆ KHÁCH HÀNG (SALES & CRM WORKSPACE)

Dành cho bộ phận Sale, trưởng phòng kinh doanh và nhân viên trực quầy tư vấn điều phối đơn hàng, tương tác khách hàng.  

Quản lý Đơn hàng (Khớp Mục 4.1 & 4.3):

Giao diện order-list.vue sử dụng module usePaginatedQuery.js để tìm kiếm, phân trang hàng ngàn đơn hàng.  

Nút bấm xử lý hóa đơn in nhanh tối ưu riêng cho khổ giấy nhiệt K80 tại màn hình order-detail.vue.  

Lệnh cập nhật trạng thái đơn hàng UpdateOrderStatusCommand.cs kết hợp cập nhật cache giao diện qua order.store.js.  

Luồng nuôi dưỡng & Quản lý lịch hẹn (Khớp Mục 4.2 & 5.1):

Tiếp nhận thông tin khách tiềm năng (Lead Management), tự động đồng bộ gán dữ liệu vào CustomerID hoặc tạo mới.  

Theo dõi Điểm tiềm năng (Lead Score) hiển thị độ nóng của khách hàng.  

Quản lý lịch hẹn lái thử xe trên giao diện lịch booking-calendar.vue. Khi Admin bấm xác nhận lịch, hệ thống chạy lệnh ConfirmBookingCommand.cs để gửi email tự động cho khách, đồng thời cộng nóng +30 điểm Lead Score.  

Lá chắn pháp lý & Hòm thư tương tác (Khớp Mục 5.5, 15.1 & 15.4):

Khi đơn hàng chuyển sang trạng thái Confirmed, hệ thống tự động gọi lệnh GenerateSalesContractCommand.cs để bốc dữ liệu từ mẫu thiết kế tại contract-template.vue điền tự động (Auto-fill) vào hợp đồng và đẩy lên giao diện contract-preview.vue để in ký.  

Tiếp nhận hòm thư yêu cầu hỗ trợ kỹ thuật, phàn nàn và xử lý đóng góp ý kiến (khớp 100% với dữ liệu Rating, các Lĩnh vực góp ý và vị trí ứng tuyển từ các tệp hình ảnh Storefront). Sau khi xử lý, gọi lệnh CreateContactReplyCommandHandler.cs để gửi phản hồi và ghi nhận vào Ghi chú nội bộ (Internal Notes) bảo mật.  

📦 3. QUẢN LÝ KHO & HẬU CẦN TÀI SẢN (INVENTORY & ASSET LOGISTICS)

Dành cho bộ phận thủ kho điều phối, định danh thiết bị và nhập kho xe máy, phụ tùng.  

Quy trình Nhập kho Định danh (Khớp Mục 10.2):

Thao tác tại biểu mẫu inventory-form.vue để chọn Nhà cung cấp và dòng xe.  

Bắt buộc quét mã QR hoặc nhập tay Số khung / Số máy duy nhất của xe máy để hệ thống tự động chạy lệnh kiểm tra trùng lặp.  

Xác định vị trí vật lý trong kho (Khu trưng bày, Kho dự phòng) và cập nhật trạng thái sang Available.  

Quản lý Thuộc tính & Giá vốn đặc thù (Khớp Mục 3.2, 3.4 & 3.5):

Quản lý xe nhập khẩu tư nhân (Imported): Gắn cờ theo dõi sát sao tiến độ của Giấy hải quan (Customs Declaration) và Giấy thông quan (Clearance Certificate) nhằm đưa ra cảnh báo vàng chặn bàn giao xe nếu giấy tờ chưa về đủ.  

Nguyên tắc giá vốn xe máy (Specific Identification): Áp dụng đơn giá vốn đích danh gắn chặt với số khung xe khi nhập kho để phục vụ tính toán chính xác margin cho Dashboard tài chính.  

Nguyên tắc giá vốn phụ tùng (Weighted Average Cost): Tự động tính toán giá vốn bình quân gia quyền theo công thức quy định mỗi khi hoàn tất nhập lô hàng phụ tùng mới.  

Thiết lập bảng ma trận tương thích sản phẩm (Compatibility Product) để hỗ trợ gợi ý phụ tùng lắp vừa cho từng dòng xe máy.  

🔧 4. TRUNG TÂM DỊCH VỤ & XƯỞNG SỬA CHỮA (WORKSHOP OPERATIONS)

Dành cho quản lý xưởng, thợ kỹ thuật sửa chữa và điều phối dịch vụ làm thủ tục giấy tờ.  

Vận hành Xưởng sửa chữa (Khớp Mục 6.5):

Lễ tân tiếp nhận xe tại giao diện repair-order-form.vue, tra cứu nhanh theo Số điện thoại để lấy toàn bộ thông tin từ lịch sử bảo dưỡng (Vehicle Portfolio) và sinh Mã phiếu sửa chữa.  

Phân công công việc cho thợ kỹ thuật sửa chữa thông qua trang repair-order-detail.vue, kích hoạt lệnh AssignTechnicianCommand.cs.  

Khi khách hàng chốt duyệt bảng dự toán (Quotation), trạng thái phiếu chuyển sang In Progress. Thợ kỹ thuật xuất phụ tùng sửa chữa bằng lệnh IssuePartsCommand.cs để tự động trừ số lượng tồn kho phụ tùng.  

Tra cứu và Giám sát hiệu suất (Khớp Mục 6.6, 6.7 & 6.8):

Màn hình tra cứu dòng thời gian lịch sử sửa chữa và các mốc thay nhớt, bảo trì theo số Vin hoặc biển số xe (Repair History by Plate).  

Giao diện Workshop Overview hiển thị số phiếu đang thực hiện thời gian thực, đưa ra cảnh báo bôi đỏ nếu xe bị ngâm quá giờ.  

Hồ sơ Biển số và Dòng tiền Thu hộ (Khớp Mục 6.1, 6.2 & 6.9):

Hệ thống tự động tra cứu địa chỉ hộ khẩu khách hàng để áp tỷ lệ thuế trước bạ (5% đối với Hà Nội, TP.HCM; 2% đối với các tỉnh/thành khác bao gồm cả Biên Hòa).  

Theo dõi 5 bước trạng thái của Hồ sơ biển số từ chuẩn bị hồ sơ đến khi bàn giao Cavet và gửi thông báo tự động cho khách qua Zalo/SMS.  

Bóc tách rạch ròi dòng tiền "Thu hộ - Chi hộ" để kế toán tính toán chính xác tiền phí dịch vụ thực tế thu được của cửa hàng.  

⚖️ 5. KẾ TOÁN TỔNG HỢP, LƯƠNG & THUẾ (FINANCIAL & COMPLIANCE WORKSPACE)

Dành cho kế toán trưởng, kế toán công nợ và thủ quỹ xử lý các rào chắn chi phí, đối soát công nợ, hoa hồng, và hóa đơn điện tử pháp luật.  

Quản lý Chi phí & Công nợ (Khớp Mục 9.1 & 10.3):

Nhập chi phí tại form expense-form.vue, hệ thống phân loại tự động thành chi phí cố định và chi phí biến đổi, sau đó chạy lệnh CreateExpenseCommandHandler.cs.  

Theo dõi công nợ Nhà cung cấp hàng hóa và đối tác ngân hàng giải ngân trả góp (kết nối trực tiếp với rào chắn Credit Guard và accumulator nợ từ bảng tính sẵn).  

Hệ thống Quản lý Lương & Hoa hồng (Khớp Mục 12.2, 12.3 & Phần 3 luồng duyệt chi):

Thiết lập chính sách tại màn hình cấu hình commission-policy.vue, chạy lệnh CreateCommissionPolicyCommand.cs và áp dụng hệ số thưởng vượt chỉ tiêu $150\%$.  

Theo dõi dòng đời hoa hồng tự động qua 3 bước: Pending (Tạm tính khi đơn confirmed) ➔ Confirmed (Khóa sổ sau 3 ngày hoàn tất) ➔ Paid (Sau khi Admin duyệt).  

Kế toán thực hiện rà soát dữ liệu trên màn hình Payroll và bấm nút "Chốt kỳ lương" để đóng băng, khóa chặt số liệu cuối tháng, tự động gửi thông báo chờ Admin duyệt chi thực tế.  

Hóa đơn điện tử tự động (Khớp Mục 14.1, 14.2 & 14.3):

Cấu hình thông tin doanh nghiệp, MST, API Key nhà cung cấp hóa đơn (VNPT, Viettel, Misa...) tại einvoice-settings.vue.  

Thiết lập bảng thuế suất VAT cho từng danh mục hàng hóa tại vat-settings.vue.  

Khi đơn hàng xe máy hoặc dịch vụ sửa chữa chuyển sang Completed, hệ thống tự động chạy Background Job gọi lệnh PrepareEInvoiceCommand.cs để ký số và gửi lên Cơ quan Thuế lấy mã xác thực tự động. Nếu có sai sót, kế toán thực hiện điều chỉnh hoặc hủy hóa đơn qua lệnh CancelEInvoiceCommand.cs trên màn hình einvoice-list.vue.  

🛡️ KIỂM SOÁT ĐỒNG BỘ RBAC TRÊN GIAO DIỆN CỔNG CHỌN (WORKSPACE PORTAL)

Khi người dùng thực hiện đăng nhập tại login.vue, hệ thống kiểm tra quyền hạn qua bộ lọc PermissionRequirement. Giao diện Portal thông minh sẽ chỉ làm sáng (kích hoạt) đúng các phân hệ làm việc tương ứng với chức danh công việc của nhân sự đó, các ô phân hệ không có quyền truy cập sẽ tự động ở trạng thái mờ (Disabled), bảo đảm tính an toàn bảo mật tuyệt đối cho toàn hệ thống.