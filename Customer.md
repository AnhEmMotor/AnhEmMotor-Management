🟩 1. TẦNG 1: TINH CHỈNH BỘ CHỈ SỐ KPI (CÁC THẺ ĐẦU TRANG)
Các thẻ số hiện tại như Tổng lead mới, Tỷ lệ chuyển đổi, Khách hàng mới, Lead nóng đã đúng trọng tâm nghiệp vụ. Tuy nhiên, để giao diện bớt khô khan và mang tính "phân tích" hơn, ông bạn cần bổ sung thêm Tỷ lệ phần trăm tăng/giảm so với kỳ trước ngay dưới mỗi con số chính (tương tự cách làm ở trang Báo cáo bán hàng).

Tổng lead mới: 3 ➔ Dòng dưới: 🔼 +15% so với tháng trước

Tỷ lệ chuyển đổi: 0.0% ➔ Dòng dưới: 🔽 -1.2% so với tháng trước

Khách hàng mới: 0 ➔ Dòng dưới: 0% (Chưa tăng trưởng)

Lead nóng: 1 ➔ Dòng dưới: 🔼 +1 lead mới trong ngày

📊 2. TẦNG 2: HOÀN THIỆN CẶP BIỂU ĐỒ TRUNG TÂM (CHIA ĐÔI 50/50)
Thay thế hoàn toàn hai khối xám "Chờ API..." bằng hai loại biểu đồ trực quan, đồng bộ với thư viện Chart của hệ thống:

Phía bên trái: Phễu chuyển đổi theo kênh (Conversion Funnel Chart)
Loại biểu đồ: Biểu đồ hình Phễu (Funnel Chart) hoặc Biểu đồ cột ngang xếp chồng có độ rộng thu hẹp dần từ trên xuống dưới.

Các tầng hiển thị dữ liệu:

Tầng 1 (Đỉnh phễu): Tiếp cận / Lead thô (Ví dụ: 100%)

Tầng 2: Đã liên hệ / Tư vấn (Ví dụ: 65%)

Tầng 3: Đến Showroom xem xe / Thử xe (Ví dụ: 30%)

Tầng 4 (Đáy phễu): Chốt hợp đồng / Xuất hóa đơn (Ví dụ: 12%)

Tác dụng: Giúp người quản trị nhìn ra ngay nút thắt cổ chai nằm ở khâu nào (Ví dụ: Lead đổ về nhiều nhưng tỷ lệ đến showroom thấp).

Phía bên phải: Phân bổ nguồn khách hàng (Customer Source Distribution)
Loại biểu đồ: Biểu đồ tròn khoét lỗ (Donut Chart) — sử dụng lại chính xác Component biểu đồ phương thức thanh toán của trang báo cáo bán hàng để đồng bộ UI.

Bóc tách các miếng bánh dữ liệu:

🔴 Website: Chiếm 40% (Ứng với nhãn màu đỏ của Nguyễn Văn Nam ở bảng đáy trang).

🟢 Showroom: Chiếm 35% (Ứng với nhãn màu xanh/cam của Lê Minh Hiếu).

🔵 Facebook: Chiếm 20% (Ứng với nhãn màu tím của Trần Thị Mai).

🟡 Nguồn khác (Zalo, Hotline): Chiếm 5%.

📉 3. TẦNG 3: HIỆN THỰC HÓA BIỂU ĐỒ PHÂN BỔ ĐIỂM LEAD (FULL-WIDTH CHART)
Khối xám ở giữa trang "Phân bổ điểm lead" cần được thay thế bằng một Biểu đồ cột đứng (Column Chart / Histogram) trải rộng 100% màn hình để phân loại chất lượng tệp khách hàng tiềm năng.

Trục Hoành (X-Axis): Chia làm các khoảng điểm chất lượng (0 - 30 điểm: Thấp, 31 - 60 điểm: Trung bình, 61 - 80 điểm: Tiềm năng, 81 - 100 điểm: Cực nóng).

Trục Tung (Y-Axis): Số lượng lead nằm trong khoảng điểm đó.

Tác dụng vận hành: Nhìn vào biểu đồ này, nhân viên sẽ biết hệ thống hiện đang tồn đọng nhiều khách hàng thuộc nhóm chất lượng nào để tập trung nguồn lực sale thúc đẩy các nhóm điểm cao (như ca 85 điểm của Lê Minh Hiếu).

📋 4. TẦNG 4: NÂNG CẤP BẢNG DANH SÁCH LEAD ƯU TIÊN
Bảng dữ liệu ở đáy trang image_7098c1.jpg hiện tại đã rất gọn gàng và có màu sắc phân biệt nguồn khá tốt. Để đạt độ chỉn chu tối đa, ông chỉ cần điều chỉnh nhẹ phần hiển thị của cột Lead Score:

Thêm thanh Progress Bar mini: Thay vì chỉ hiển thị một con số thuần túy (như 30, 85, 65), hãy lồng con số đó vào trong một thanh tiến trình chạy ngầm nhỏ màu xám nhạt, thanh fill màu sẽ thay đổi theo độ lớn của điểm (Điểm > 80 fill màu đỏ rực báo động nóng, điểm trung bình fill màu cam/xanh). Việc này giúp người xem lướt qua là nhận diện được ngay độ ưu tiên của khách hàng mà không cần đọc từng chữ số.
