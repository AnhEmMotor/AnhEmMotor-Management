import type { AppRouteRecord } from "@/types/router";

// Map tay: tool AI (AnhEmMotor-Backend/SharedConfig/chat-tools-catalog.json) -> route `name` thật trong menu.
// Đã đối chiếu trực tiếp với src/modules/{Order,Warehouse,Marketing,Factory,Accountant}/Menu/index.ts
// và router/modules/reporting.ts, hr.ts (những file thực sự được router/modules/index.ts import — KHÔNG
// dùng router/modules/product.ts hay inventory.ts làm nguồn tham chiếu, hai file đó không được import ở đâu).
// Chưa map hết ~50 tool trong catalog — chỉ tool nào có 1 trang đích rõ ràng mới được thêm vào đây.
export const TOOL_TO_ROUTE_NAME: Record<string, string> = {
  search_products: "OrderProductList",
  get_product_detail: "OrderProductList",
  get_product_price_list: "OrderProductList",
  list_brands: "WarehouseProduct",
  list_categories: "WarehouseProduct",
  get_product_stock: "WarehouseInOutStock",
  get_low_stock_products: "WarehouseInOutStock",
  get_inventory_report: "WarehouseInOutStock",
  get_inventory_ledger: "WarehouseLedger",
  search_suppliers: "WarehouseSupplier",
  get_supplier_statistics: "WarehouseSupplier",
  get_supplier_prices_for_variant: "WarehouseSupplier",
  list_purchase_requests: "WarehousePurchaseRequest",
  get_purchase_request_detail: "WarehousePurchaseRequest",
  list_inventory_receipts: "WarehouseInput",
  get_inventory_receipt_detail: "WarehouseInput",
  get_suppliers_with_debt: "AccountantDebt",
  list_sales_contracts: "OrderContract",
  list_supplier_contracts: "WarehouseContract",
  list_vouchers: "CustomerVoucher",
  get_lead_pipeline: "CustomerPotential",
  get_lead_detail: "CustomerPotential",
  list_contacts: "ContactManagement",
  get_loyalty_members: "CustomerCare",
  search_customers: "CustomerProfile",
  get_customer_profile: "CustomerProfile",
  list_booking_appointments: "WorkshopAppointments",
  list_bookings: "CustomerBooking",
  list_repair_orders: "WorkshopRepair",
  get_repair_order_detail: "WorkshopRepair",
  list_warranty_claims: "WorkshopWarranty",
  get_warranty_claim_detail: "WorkshopWarranty",
  list_workshop_payments: "CounterPaymentList",
  get_workshop_dashboard: "WorkshopDashboard",
  get_dashboard_overview: "ExecutiveDashboard",
  get_sales_summary: "SalesAnalytics",
  get_top_selling: "SalesAnalytics",
  get_revenue_by_category: "SalesAnalytics",
  get_sales_report: "SalesAnalytics",
  get_pnl_report: "FinancialAnalytics",
  list_employees: "HREmployee",
  get_employee_kpi: "HREmployee",
  get_staff_performance: "HRCommissionAnalytics",
};

// Gợi ý khi drawer chưa có phiên chat/tin nhắn nào — mở đầu cuộc trò chuyện.
export const EMPTY_STATE_SUGGESTIONS: string[] = [
  "Doanh thu hôm nay của cửa hàng là bao nhiêu?",
  "Sản phẩm nào đang sắp hết hàng?",
  "Khách hàng nào đang nợ tiền nhiều nhất?",
  "Có bao nhiêu đơn sửa xe đang chờ xử lý?",
  "Nhân viên nào có KPI tốt nhất tháng này?",
];

// Map tay tool -> câu hỏi tiếp theo hợp lý, giống cách TOOL_TO_ROUTE_NAME map tool -> trang.
// Chỉ map tool nào có 1 câu hỏi tiếp theo rõ ràng; tool khác rơi vào GENERIC_FOLLOWUPS.
const TOOL_TO_FOLLOWUP_PROMPT: Record<string, string> = {
  search_products: "Xem giá bán của sản phẩm này",
  get_low_stock_products: "Tạo phiếu đề nghị nhập hàng cho các sản phẩm này",
  get_sales_summary: "So sánh với cùng kỳ tháng trước",
  get_sales_report: "Xuất báo cáo chi tiết theo từng ngày",
  get_top_selling: "Xem doanh thu theo từng danh mục",
  get_suppliers_with_debt: "Liệt kê chi tiết công nợ của nhà cung cấp đầu tiên",
  get_lead_pipeline: "Xem chi tiết cơ hội tiềm năng gần nhất",
  search_customers: "Xem lịch sử mua hàng của khách này",
  get_customer_profile: "Khách hàng này còn nợ không?",
  list_repair_orders: "Đơn sửa xe nào đang trễ hẹn?",
  get_employee_kpi: "So sánh KPI với tháng trước",
  get_dashboard_overview: "Chi tiết hơn về doanh thu tháng này",
  get_pnl_report: "So sánh lợi nhuận với quý trước",
  list_purchase_requests: "Phiếu đề nghị nào đang chờ duyệt?",
  get_inventory_report: "Sản phẩm nào tồn kho lâu chưa bán được?",
};

const GENERIC_FOLLOWUPS = [
  "Tóm tắt ngắn gọn lại thông tin trên",
  "So sánh với kỳ trước",
];

/** Gợi ý câu hỏi tiếp theo dựa trên tool AI vừa dùng xong ở tin nhắn trước — cùng nguồn dữ liệu
 * (doneToolNames) với getSuggestedPages, chỉ khác đích map tới. */
export const getFollowUpSuggestions = (toolNames: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const name of toolNames) {
    const suggestion = TOOL_TO_FOLLOWUP_PROMPT[name];
    if (suggestion && !seen.has(suggestion)) {
      seen.add(suggestion);
      out.push(suggestion);
    }
  }
  if (out.length === 0 && toolNames.length > 0) return GENERIC_FOLLOWUPS;
  return out.slice(0, 3);
};

const findRouteByName = (
  items: AppRouteRecord[],
  name: string,
): AppRouteRecord | undefined => {
  for (const item of items) {
    if (item.name === name) return item;
    if (item.children?.length) {
      const found = findRouteByName(item.children, name);
      if (found) return found;
    }
  }
  return undefined;
};

export interface SuggestedPage {
  routeName: string;
  label: string;
  /** Có mặt & còn quyền (route tồn tại trong menuList đã lọc quyền hiện tại). Undefined = đã từng gợi ý
   * được (map có tồn tại) nhưng route không còn nằm trong menuList — mất quyền, cần disable + báo rõ. */
  page?: AppRouteRecord;
}

/**
 * `menuList` truyền vào phải là cây route đã lọc theo quyền hiện tại của user
 * (useMenuStore().menuList — xem src/router/core/MenuProcessor.ts). Trả về MỌI tool đã map được route,
 * kể cả khi route đó không còn trong menuList (page sẽ là undefined) — để UI hiển thị "Không còn quyền"
 * thay vì âm thầm ẩn đi, tránh làm mất chip khi mở lại lịch sử chat cũ.
 */
export const getSuggestedPages = (
  tools: { name: string; label: string }[],
  menuList: AppRouteRecord[],
): SuggestedPage[] => {
  const seen = new Set<string>();
  const pages: SuggestedPage[] = [];
  for (const tool of tools) {
    const routeName = TOOL_TO_ROUTE_NAME[tool.name];
    if (!routeName || seen.has(routeName)) continue;
    seen.add(routeName);
    pages.push({
      routeName,
      label: tool.label,
      page: findRouteByName(menuList, routeName),
    });
  }
  return pages;
};
