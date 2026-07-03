# KẾ HOẠCH THIẾT KẾ CHI TIẾT: MODULE VẬN CHUYỂN

**Dự án:** AnhEmMotor  
**Tiến độ triển khai:** Dashboard $\rightarrow$ Theo dõi vận chuyển $\rightarrow$ Đơn hàng hoàn thành $\rightarrow$ Trả hàng / Hoàn trả $\rightarrow$ Đối tác

---

## TRANG 1: Dashboard Tổng quan

### A. Thiết kế kiến trúc & File thay đổi

- **Frontend:**
  - Chỉnh sửa [src/services/logistics.service.ts](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/services/logistics.service.ts) để gọi API thực tế `/api/v1/logistics/dashboard`.
  - Bổ sung bản dịch tiếng Việt cho logistics dashboard trong [vi.ts](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/i18n/package/vi.ts).
  - Cập nhật [dashboard/index.vue](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/modules/Order/view/logistics/dashboard/index.vue):
    - Khởi tạo ECharts cho 2 biểu đồ:
      1.  **Phễu vận chuyển (Fulfillment Funnel):** Dạng Doughnut Chart hiển thị số lượng đơn hàng theo từng trạng thái (`Pending`, `Packing`, `Shipping`, `Completed`, `Returned`).
      2.  **Sản lượng & Chi phí vận chuyển (Production Shipping Cost):** Dạng Combo Chart (Cột đại diện cho số đơn giao thành công, Đường đại diện cho chi phí vận chuyển phát sinh).
- **Backend:** Không cần sửa đổi, đã có đầy đủ logic tại [LogisticsController.cs](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Backend/WebAPI/Controllers/V1/LogisticsController.cs) và `GetLogisticsDashboardQueryHandler.cs`.

### B. API Endpoint & Data Model

- **Endpoint:** `GET /api/v1/logistics/dashboard?range={today|month|year}`
- **Data Model (Frontend):**
  ```typescript
  export interface LogisticsDashboardResponse {
    summary: {
      fulfillmentWorkload: number;
      pendingUnreconciledCod: number;
      otifRate: number;
      returnsClaimsRate: number;
      fulfillmentWorkloadIsOverload: boolean;
    };
    fulfillmentFunnel: Record<string, number>;
    trends: Array<{
      dayLabel: string;
      deliveredCount: number;
      shippingCost: number;
    }>;
    carrierScorecard: Array<{
      carrier: string;
      deliveredCount: number;
      avgDeliveryDays: number;
      avgShippingCostPerOrder: number;
      returnsRatio: number;
    }>;
    exceptions: Array<{
      type: string;
      trackingNumber: string;
      message: string;
      createdAt: string;
    }>;
  }
  ```

---

## TRANG 2: Bản đồ Theo dõi Vận chuyển

### A. Thiết kế kiến trúc & File thay đổi

- **Frontend:**
  - Chỉnh sửa [tracking/index.vue](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/modules/Order/view/logistics/tracking/index.vue).
  - Đảm bảo Leaflet Map import CSS chính xác để tránh vỡ giao diện trên Vite.
  - Sửa lỗi mất Marker mặc định của Leaflet bằng cách override `L.Icon.Default.mergeOptions`.
- **Backend:** Giữ nguyên các query `GetActiveShipments` và `GetShipmentTracking` hiện tại.

### B. API Endpoint & Data Model

- **Endpoints:**
  1.  `GET /api/v1/logistics/active-shipments` (Lấy đơn có trạng thái `Shipping`)
  2.  `GET /api/v1/logistics/tracking/{searchQuery}` (Tìm kiếm theo Mã vận đơn/SĐT/Mã đơn hàng để vẽ trục hành trình)

---

## TRANG 3: Đơn hàng Hoàn thành

### A. Thiết kế kiến trúc & File thay đổi

- **Backend (Cần bổ sung):**
  - Thêm Query `GetFulfillmentOrdersQuery` và Handler để lấy danh sách tất cả các phiếu vận chuyển (`ParcelDeliveryOrder`).
  - Thêm endpoint `GET /api/v1/logistics/fulfillment` trong [LogisticsController.cs](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Backend/WebAPI/Controllers/V1/LogisticsController.cs) hỗ trợ lọc theo `status`, `carrier`, `fromDate`, `toDate`.
- **Frontend:**
  - Khai báo API `getFulfillmentOrders` trong [fulfillment.ts](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/api/logistics/fulfillment.ts).
  - Tái cấu trúc [fulfillment/index.vue](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/modules/Order/view/logistics/fulfillment/index.vue):
    - Đưa giao diện danh sách đơn hàng làm trung tâm bằng bảng dữ liệu `<ArtTable>`.
    - Thêm bộ lọc: Thời gian (Từ ngày - Đến ngày), Đơn vị vận chuyển (GHTK/GHN/VTP/Nội bộ), Khu vực địa lý (Tỉnh/Thành phố).
    - Khi click vào dòng đơn hàng, mở Sliding Drawer hiển thị giao diện check-list sản phẩm và trục timeline hành trình (tái sử dụng giao diện chi tiết cũ).

### B. API Endpoint & Data Model

- **Endpoint mới:** `GET /api/v1/logistics/fulfillment?status=Completed&carrier={carrier}&fromDate={fromDate}&toDate={toDate}`
- **Data Model:**
  ```typescript
  export interface FulfillmentOrderListItem {
    id: number;
    originalOrderCode: string;
    trackingNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    carrier: string;
    codAmount: number;
    shippingCost: number;
    createdAt: string;
    expectedAt?: string;
    deliveredAt?: string;
  }
  ```

---

## TRANG 4: Đơn hàng Trả lại

### A. Thiết kế kiến trúc & File thay đổi

- **Backend (Cần bổ sung):**
  - Bổ sung 2 trường vào bảng `ParcelDeliveryOrder` (hoặc tính toán động):
    - `RefundAmount` (Giá trị hoàn lại cho khách)
    - `ReturnShippingCost` (Phí vận chuyển phát sinh khi hoàn hàng)
  - Cập nhật API `inspectReturn` để lưu thêm 2 trường này khi đóng hồ sơ hoàn trả.
- **Frontend:**
  - Chỉnh sửa [returns/index.vue](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/modules/Order/view/logistics/returns/index.vue):
    - Thêm ô nhập/hiển thị: Giá trị hoàn trả và Chi phí chuyển hoàn phát sinh trong form kiểm định.
    - Cập nhật giao diện chi tiết hoàn trả sau khi đã đóng hồ sơ để hiển thị đầy đủ thông tin tài chính này.

---

## TRANG 5: Cấu hình Đối tác vận chuyển

### A. Thiết kế kiến trúc & File thay đổi

- **Backend (Cần bổ sung):**
  - Thêm 2 trường lưu cấu hình nâng cao trong `CarrierPartner.cs`:
    - `PricingRulesJson` (Bảng giá cước dạng JSON để linh hoạt theo cân nặng và vùng miền)
    - `SlaJson` (Cam kết thời gian giao hàng dạng JSON)
  - Cập nhật database migration & `CarrierPartnerSeeder` để seed dữ liệu mẫu cho GHTK, GHN, Viettel Post.
- **Frontend:**
  - Chỉnh sửa [carrier-settings/index.vue](file:///C:/Users/Admin/Desktop/New/AnhEmMotor-Management/src/modules/Order/view/logistics/carrier-settings/index.vue):
    - Thêm Tab "📋 Bảng giá & SLA" bên cạnh tab API và Quy tắc vận chuyển.
    - Hiển thị bảng giá cước động (Nội tỉnh, Nội vùng, Liên vùng theo trọng lượng từ 0-2kg, 2-5kg, >5kg) và thời gian giao hàng cam kết tương ứng.
