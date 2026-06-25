import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const accountancyMenu: AppRouteRecord[] = [
  {
    path: "/Accountant",
    name: "Accountant",
    component: "/index/index",
    meta: {
      title: "Kế Toán, Lương & Thuế",
      icon: "ri:calculator-line",
      roles: ["Admin", "SuperAdmin", "Accountant"],
    },
    redirect: "/Accountant/executive-dashboard",
    children: [
      {
        path: "executive-dashboard",
        name: "AccountantExecutiveDashboard",
        component: "/Accountant/view/reporting/dashboard",
        meta: {
          title: "Tổng quan điều hành",
          icon: "ri:dashboard-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "sales",
        name: "AccountantSales",
        component: "/Accountant/view/reporting/revenue",
        meta: {
          title: "Báo cáo bán hàng",
          icon: "ri:money-cny-circle-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "financial",
        name: "AccountantFinancial",
        component: "/Accountant/view/reporting/financial",
        meta: {
          title: "Báo cáo tài chính",
          icon: "ri:file-chart-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "financing",
        name: "AccountantFinancing",
        component: "/Accountant/view/reporting/financing",
        meta: {
          title: "Báo cáo trả góp",
          icon: "ri:bank-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
          isHide: true,
        },
      },
      {
        path: "inventory",
        name: "AccountantInventory",
        component: "/Accountant/view/reporting/inventory",
        meta: {
          title: "Báo cáo tồn kho",
          icon: "ri:archive-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "workshop",
        name: "AccountantWorkshop",
        component: "/Accountant/view/reporting/workshop",
        meta: {
          title: "Báo cáo xưởng dịch vụ",
          icon: "ri:tools-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "customer",
        name: "AccountantCustomer",
        component: "/Accountant/view/reporting/customer",
        meta: {
          title: "Báo cáo khách hàng",
          icon: "ri:user-heart-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "hr-commission",
        name: "AccountantHRCommission",
        component: "/Accountant/view/reporting/employee",
        meta: {
          title: "Báo cáo nhân sự & hoa hồng",
          icon: "ri:team-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "customer-service",
        name: "AccountantCustomerService",
        component: "/Accountant/view/reporting/customer-service",
        meta: {
          title: "Báo cáo chăm sóc khách hàng",
          icon: "ri:customer-service-2-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "payroll",
        name: "AccountantPayroll",
        component: "/Admin/view/employee/payroll/index",
        meta: {
          title: "Tiền lương nhân sự",
          icon: "ri:bank-card-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "contract",
        name: "AccountantContract",
        component: "/index/index",
        meta: {
          title: "Quản lý hợp đồng",
          icon: "ri:file-list-line",
          permission: Permissions.StatisticalView,
        },
        children: [
          {
            path: "sales",
            name: "AccountantSalesContract",
            component: "/Admin/view/contract/sales/index",
            meta: {
              title: "Hợp đồng bán xe",
              icon: "ri:file-paper-2-line",
              permission: Permissions.StatisticalView,
            },
          },
          {
            path: "supplier",
            name: "AccountantSupplierContract",
            component: "/Admin/view/contract/supplier/index",
            meta: {
              title: "Hợp đồng nhà cung cấp",
              icon: "ri:truck-line",
              permission: Permissions.StatisticalView,
            },
          },
        ],
      },
      {
        path: "debt",
        name: "AccountantDebt",
        component: "/Warehouse/view/inventory/debt/index",
        meta: {
          title: "Báo cáo công nợ",
          icon: "ri:money-dollar-box-line",
          keepAlive: true,
          permission: Permissions.StatisticalView,
        },
      },
      {
        path: "invoice",
        name: "AccountantInvoice",
        component: "/index/index",
        meta: {
          title: "Quản lý hóa đơn",
          icon: "ri:bill-line",
          permission: Permissions.StatisticalView,
        },
        children: [
          {
            path: "payment",
            name: "AccountantPaymentInvoice",
            component: "/Order/view/product/invoice/index",
            meta: {
              title: "Hóa đơn thanh toán",
              icon: "ri:secure-payment-line",
              permission: Permissions.StatisticalView,
            },
          },
          {
            path: "sales",
            name: "AccountantSalesInvoice",
            component: "/Order/view/product/invoice/index",
            meta: {
              title: "Hóa đơn bán hàng",
              icon: "ri:receipt-line",
              permission: Permissions.StatisticalView,
            },
          },
        ],
      },
    ],
  },
];

export default accountancyMenu;
