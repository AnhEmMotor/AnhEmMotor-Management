Dưới đây là bản đặc tả trọn vẹn và chi tiết về Tư duy vận hành, Thông tin dữ liệu và Hướng đi thiết kế UI/UX cho trang này:

🏛️ PHẦN 1: TƯ DUY XỬ LÝ HƯỚNG ĐI (INTEGRATION MINDSET)

Để hệ thống vận hành thông minh mà không cần con người can thiệp thủ công vào từng đơn ship phụ tùng online, tư duy thiết kế trang này dựa trên 3 trụ cột:

Kiến trúc "Cắm và Chạy" (Plug & Play Modular Architecture): Hệ thống tuyệt đối không viết chết (hard-code) logic cho riêng một nhà vận chuyển nào. Trang này đóng vai trò là một cái tủ điện chứa các cổng cắm tham số. Khi đại lý muốn đổi từ GHTK sang Viettel Post hoặc dùng thêm bên thứ ba khác, Admin chỉ cần lên giao diện này bật/tắt và cấu hình Token, toàn bộ luồng đẩy đơn ở trang Xử lý đơn giao sẽ tự động chạy theo mà không cần sửa một dòng code hệ thống nào.

Định tuyến và ràng buộc hàng hóa (Routing Constraints): Do mảng phụ tùng có nhóm vật tư chất lỏng như dầu nhớt, nước làm mát (IsLiquid = true). Tư duy xử lý tại trang cấu hình là cho phép thiết lập sẵn rào cản: "Nếu đơn hàng chứa hàng chất lỏng, hệ thống tự động khóa phương thức đi bay (vận chuyển nhanh bằng máy bay) của Viettel Post, bắt buộc chuyển sang đường bộ" để tuân thủ quy định an toàn bay.

Bảo mật thông tin nhạy cảm (Credential Shielding): Các chuỗi API Token và Secret Key liên quan trực tiếp đến tài khoản ví tiền điện tử của doanh nghiệp tại bưu cục. Tư duy thiết kế giao diện phải ẩn toàn bộ các mã này dạng ký tự che giấu (••••••••). Chỉ nhân sự có quyền tối cao là Logistics.Admin mới có quyền bật mắt xem và chỉnh sửa.

📊 PHẦN 2: CÁC THÔNG TIN CẦN CÓ TRÊN UI (DATA SPECIFICATIONS)

Biểu mẫu cấu hình của mỗi đối tác vận chuyển được chuẩn hóa dữ liệu thành 3 nhóm thông tin chính:

1. Khối thông số kết nối API kỹ thuật

Môi trường hệ thống (Environment): Nút chọn Toggle giữa Sandbox (Thử nghiệm) và Production (Chạy thật) để lập trình viên kiểm thử luồng trước khi chạy chính thức.

API Base URL: Đường dẫn cổng kết nối của hãng vận chuyển.

API Token / Secret Key: Chuỗi mã định danh xác thực quyền đẩy đơn và trừ tiền ví bưu cục.

Webhook Secret Key: Chuỗi mã dùng để giải mã và xác thực các tín hiệu trạng thái hành trình tự động từ hãng vận chuyển bắn ngược về hệ thống của mình, tránh bị hacker gửi tin nhắn trạng thái giả mạo.

Webhook Endpoint URL: Đường dẫn hệ thống sinh sẵn để Admin copy dán vào app của đối tác.

2. Khối quy tắc tính chi phí và giới hạn gói hàng

Phương thức tính phí: Tích chọn [x] Tự động đồng bộ bảng giá thời gian thực từ API của hãng hoặc cho phép cấu hình bảng giá thủ công/theo khoảng cách km địa lý (áp dụng riêng cho Shipper nhà).

Trọng lượng tối đa cho phép: Ô nhập số lượng (kg) giới hạn của một kiện hàng phụ tùng (Ví dụ tối đa 30kg, nếu đơn hàng online vượt quá cân nặng này hệ thống sẽ tự động đưa ra cảnh báo tách gói).

Cờ cấu hình hàng hóa đặc biệt: Nút Tích chọn cho phép đối tác này nhận hàng Chất lỏng/Dầu nhớt hoặc Hàng cồng kềnh.

🎨 PHẦN 3: HƯỚNG ĐI THIẾT KẾ UI/UX TRỰC QUAN (PARTNER MATRIX LAYOUT)

Vì số lượng đối tác vận chuyển trong thực tế của một showroom thường không nhiều (dưới 5 đơn vị), hướng đi UI tối ưu nhất là sử dụng Bố cục Thẻ Lưới phẳng kết hợp Panel Trượt (Flat Grid with Sliding Drawers) để mang lại trải nghiệm ERP hiện đại, sạch sẽ và bao quát.

Kịch bản hiển thị trực quan trên giao diện:

Trạng thái 1: Góc nhìn tổng quan dạng lưới (Carrier Grid View)

Màn hình phơi bày toàn bộ các Khối Card lớn đại diện cho từng hãng (GHTK, Viettel Post, GHN, Shipper nhà). Trên mỗi Card thể hiện:

Logo thương hiệu nhận diện trực quan ở góc trái.

Một nút Switch Toggle (Bật/Tắt hoạt động) kích thước lớn bôi màu nổi bật: 🟢 ĐANG HOẠT ĐỘNG hoặc ⚪ ĐANG TẮT. Nếu trạng thái là Tắt, hãng này lập tiếp bị ẩn khỏi Dropdown lựa chọn tại trang đóng gói.

Dưới chân Card là một nút bấm hành động chính: [ ⚙️ Cấu hình kết nối ].

Trạng thái 2: Biểu mẫu cấu hình chi tiết (Sliding Panel Detail View)

Khi người dùng bấm vào nút cấu hình của một hãng bất kỳ, hệ thống không chuyển hướng sang trang mới mà kích hoạt một Panel lớn trượt mượt mà từ cạnh phải màn hình ra (Slide-over Panel), che phủ 50% diện tích màn hình để giữ nguyên ngữ cảnh làm việc phía sau:

[ QUẢN LÝ VẬN CHUYỂN / ĐỐI TÁC VẬN CHUYỂN / GIAOHANGTIETKIEM ]

---

| Trạng thái hoạt động: (🔵 ON) | Môi trường: [ Sandbox ] (🟢 Production) |

| |

| 🔑 THÔNG SỐ KẾT NỐI API KỸ THUẬT |

| - API Base URL: [ https://services.giaohangtietkiem.vn/api/v1........... ] |

| - API Token: [ ••••••••••••••••••••••••••••••••••••• ] (👁️ Bật mắt xem) |

| - Webhook URL: [ https://api.anhemmotor.com/v1/webhooks/ghtk ] [📋 Copy] |

| |

| 💰 QUY TẮC CHI PHÍ & RÀO CẢN HÀNG HÓA |

| [x] Sử dụng API tính phí ship tự động thời gian thực của hãng |

| - Khối lượng kiện hàng tối đa: [ 25 ] kg |

| - Giới hạn mặt hàng: [x] Chặn bay hàng Chất lỏng/Dầu nhớt [ ] Chặn hàng cồng kềnh |

| |

| --------------------------------------------------------------------------- |

| | [⚡ Kiểm tra kết nối] [❌ Hủy bỏ] [💾 Lưu cấu hình] | |

| --------------------------------------------------------------------------- |

---

💡 Các điểm chạm UX thông minh nâng cao hiệu suất vận hành:

Nút Sao chép nhanh (Copy Clipboard API): Cạnh ô Webhook URL có tích hợp một icon copy nhanh. Người dùng chỉ cần click là hệ thống tự động copy đường dẫn chính xác, loại bỏ hoàn toàn lỗi bôi đen thiếu ký tự khi thao tác bằng tay.

Nút chẩn đoán lỗi hệ thống (Ping / Test Connection): Nằm ngay cạnh nút Lưu là nút [⚡ Kiểm tra kết nối]. Khi Admin nhập Token xong và bấm vào đây, hệ thống sẽ thực hiện gửi một gói tin trống chạy thử sang cổng kết nối của hãng vận chuyển. Nếu thông số đúng, giao diện hiển thị thông báo xanh [✓ Kết nối thành công]. Nếu nhập sai hoặc thiếu ký tự, hệ thống báo đỏ ngay lập tức kèm lý do lỗi. Rào chắn này giúp chặn đứng rủi ro nhập sai thông tin cấu hình khiến toàn bộ luồng đóng gói hàng hóa ngày hôm sau bị đình trệ.

Trong mô hình quản lý cửa hàng kinh doanh xe máy, nếu tích hợp với đơn vị vận chuyển bên thứ 3 (GHTK, GHN, Viettel Post, J&T, Ahamove...), thì trang Quản lý đối tác vận chuyển không nên chỉ lưu thông tin đơn vị vận chuyển, mà phải đóng vai trò là trung tâm cấu hình và quản lý kết nối vận chuyển.

1. Mục tiêu của module Quản lý đối tác vận chuyển

Cho phép:

Quản lý nhiều đơn vị vận chuyển. Cấu hình kết nối API. Cấu hình phạm vi vận chuyển. Theo dõi trạng thái hoạt động. Quản lý phí vận chuyển. Quản lý đơn hàng giao hàng phát sinh. 2. Danh sách đối tác vận chuyển Màn hình danh sách STT Tên đối tác Loại vận chuyển Trạng thái Kết nối API Ngày tạo 1 GHN Toàn quốc Hoạt động Đã kết nối 01/06/2026 2 GHTK Toàn quốc Hoạt động Đã kết nối 01/06/2026 3 Ahamove Nội thành Tạm ngưng Chưa kết nối 05/06/2026 Bộ lọc Tên đối tác Trạng thái Loại vận chuyển Đã kết nối API / Chưa kết nối 3. Thông tin chi tiết đối tác Thông tin chung Trường Ý nghĩa Mã đối tác SHIP001 Tên đối tác GHN Hotline 1900xxxx Website Website đơn vị Email hỗ trợ support@... Trạng thái Hoạt động/Tạm khóa 4. Cấu hình kết nối API

Đây là phần quan trọng nhất.

Thông tin kết nối Trường Bắt buộc API Key Có API Secret Có Token Có Shop ID Có Endpoint URL Có

Ví dụ:

Đối tác: GHN

API Key: xxxxxxxxxx

Shop ID: 123456

Endpoint: https://online-gateway.ghn.vn Chức năng Kiểm tra kết nối Đồng bộ dịch vụ vận chuyển Đồng bộ bảng giá Làm mới token 5. Cấu hình phạm vi giao hàng

Do xe máy là mặt hàng giá trị cao nên không phải đơn vị nào cũng giao được.

Cấu hình khu vực Tỉnh Hỗ trợ TP.HCM Có Hà Nội Có Đà Nẵng Có Cà Mau Không Thiết lập Theo tỉnh/thành Theo quận/huyện Theo khoảng cách 6. Cấu hình loại hàng hóa

Đây là đặc thù của cửa hàng xe máy.

Cho phép vận chuyển Xe nguyên chiếc Xe số Xe tay ga Xe côn tay Phụ tùng Lốp Ắc quy Phụ kiện Giấy tờ Hợp đồng Hóa đơn 7. Cấu hình phí vận chuyển

Có 2 hướng:

Cách 1: Lấy phí từ API Đơn hàng ↓ Gọi API ↓ Đối tác trả phí ↓ Hiển thị cho nhân viên Cách 2: Cấu hình nội bộ Khoảng cách Phí < 10 km 30.000 10 - 20 km 50.000

> 20 km 80.000 8. Theo dõi đơn giao hàng

Đây là màn hình thường được dùng nhiều hơn màn hình đối tác.

Mã vận đơn Đơn hàng Đối tác Trạng thái GHN001 HD001 GHN Đang giao GHN002 HD002 GHN Đã giao GHTK001 HD003 GHTK Giao thất bại Trạng thái đề xuất Chờ tạo vận đơn ↓ Đã tạo vận đơn ↓ Đã lấy hàng ↓ Đang vận chuyển ↓ Đã giao

Ngoài ra:

Giao thất bại Đã hủy Hoàn hàng 9. Lịch sử đồng bộ

Theo dõi toàn bộ hoạt động API.

Thời gian Hành động Kết quả 10:00 Tạo vận đơn Thành công 10:05 Đồng bộ trạng thái Thành công 10:10 Tạo vận đơn Lỗi Mục đích Debug lỗi Kiểm tra API Đối soát dữ liệu 10. Đối soát vận chuyển

Đặc biệt cần thiết với cửa hàng xe máy.

Thông tin đối soát Nội dung Giá trị Tổng đơn giao 150 Thành công 145 Thất bại 5 Tổng phí vận chuyển 18.500.000 Báo cáo Theo đối tác vận chuyển Theo tháng Theo chi nhánh Theo nhân viên tạo đơn Đề xuất tối ưu cho hệ thống quản lý xe máy

Tôi khuyến nghị module nên chia thành 3 phân hệ thay vì chỉ một màn hình:

1. Quản lý đối tác vận chuyển Thông tin đối tác Cấu hình API Trạng thái kết nối
2. Quản lý vận đơn Tạo vận đơn Theo dõi vận đơn Đồng bộ trạng thái giao hàng
3. Báo cáo & Đối soát Chi phí vận chuyển Tỷ lệ giao thành công Đối soát với nhà vận chuyển

Như vậy sẽ phù hợp với nghiệp vụ thực tế của cửa hàng xe máy, đặc biệt khi có các đơn hàng giá trị cao như xe nguyên chiếc, nơi cần quản lý cả đơn vị vận chuyển lẫn quá trình giao nhận và đối soát chi phí.
