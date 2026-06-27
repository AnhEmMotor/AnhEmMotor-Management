1. ĐẶC TẢ TRANG: ĐƠN ĐẶT HÀNG (ONLINE ORDERS - PHỤ TÙNG/PHỤ KIỆN)
   Mục đích: Quản lý toàn bộ vòng đời của các đơn hàng mua lẻ phụ tùng, dầu nhớt, đồ chơi xe máy đặt từ Website/App. Trang này tuyệt đối tách biệt khỏi đơn hàng xe máy để tối ưu tốc độ đóng gói.

A. Tư duy vận hành (Operational Mindset)
Tốc độ và sự chuẩn xác (Speed & Accuracy): Đơn phụ tùng online có giá trị thấp nhưng số lượng nhiều. UI phải ưu tiên xử lý hàng loạt (Bulk Actions) như duyệt 50 đơn cùng lúc, in hàng loạt tem nhiệt để nhân viên kho nhặt hàng nhanh nhất có thể.

Giữ chỗ tồn kho (Inventory Lock): Ngay khi khách bấm đặt đơn online, hệ thống phải tự động chuyển số lượng phụ tùng đó từ kho khả dụng (Available) sang trạng thái chờ duyệt (Reserved) để chặn việc nhân viên tại quầy bán mất món đó cho khách vãng lai.

B. Các thông tin hiển thị trên UI (Data Fields)
Thông tin đơn hàng: Mã đơn online (ORD-xxx), Ngày đặt, Trạng thái thanh toán (Chờ chuyển khoản, Đã trả trước, Thu COD).

Thông tin khách hàng: Họ tên, Số điện thoại, Địa chỉ giao hàng đầy đủ.

Chi tiết giỏ hàng: Danh sách sản phẩm bao gồm Ảnh thumbnail phụ tùng, Tên linh kiện, Mã SKU, Số lượng, Đơn giá, Thành tiền.

Tổng doanh thu: Tiền hàng, Phí vận chuyển (đồng bộ từ API đối tác vận chuyển), Mã giảm giá (nếu có), Tổng tiền khách phải trả.

C. Hướng đi thiết kế UI/UX (Layout & Interaction)
Bố cục: Áp dụng bảng dữ liệu lưới phẳng (Datatable) có bộ lọc Tab nhanh ở đầu trang: Tất cả | Chờ duyệt | Đã đóng gói | Đang giao | Thất bại.

Điểm chạm thông minh: Khi click vào một dòng đơn hàng, một Panel trượt (Sliding Drawer) từ cạnh phải ra sẽ hiển thị chi tiết giỏ hàng. Tại đây có nút [ 🖨️ In tem nhãn & Đẩy đơn sang kho ] giúp luồng làm việc chạy mượt mà sang trang Xử lý đơn giao.
