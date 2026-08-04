import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";
import { accountantManualRoutes } from "@/router/modules/accountant-manual";

export const accountancyMenu: AppRouteRecord[] = [
  {
    path: "/Accountant",
    name: "Accountant",
    component: "/index/index",
    meta: {
      title: "Kế Toán, Lương & Thuế",
      icon: "ri:calculator-line",
      roles: ["Admin", "SuperAdmin", "Accountant"],
      permissions: ["Permissions.Accountant"],
    },
    redirect: "/Accountant/intro",
    children: [
      {
        path: "intro",
        name: "AccountantIntro",
        component: "/Accountant/view/intro/index",
        meta: {
          title: "Giới thiệu",
          icon: "ri:image-line",
          isHide: true,
        },
      },
      {
        path: "executive-dashboard",
        name: "AccountantExecutiveDashboard",
        component: "/Accountant/view/reporting/dashboard",
        meta: {
          title: "Tổng quan điều hành",
          icon: "ri:dashboard-line",
          keepAlive: true,
          permission: Permissions.Accountant.DashboardManagement.View,
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
          permission: Permissions.Accountant.DashboardManagement.View,
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
          permission: Permissions.Accountant.DashboardManagement.View,
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
          permission: Permissions.Accountant.DashboardManagement.View,
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
          permission: Permissions.Accountant.DashboardManagement.View,
        },
      },
      {
        path: "customer",
        name: "AccountantCustomer",
        component: "/Accountant/view/reporting/customer",
        meta: {
          title: "Báo Cáo Khách Hàng",
          icon: "ri:user-heart-line",
          keepAlive: true,
          permission: Permissions.Accountant.DashboardManagement.View,
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
          permission: Permissions.Accountant.DashboardManagement.View,
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
          permission: Permissions.Accountant.PayrollManagement.View,
        },
      },
      {
        path: "contract",
        name: "AccountantContract",
        component: "/Accountant/view/reporting/contract",
        meta: {
          title: "Báo cáo hợp đồng",
          icon: "ri:file-list-line",
          permission: Permissions.Accountant.ContractManagement.View,
        },
      },
      {
        path: "debt",
        name: "AccountantDebt",
        component: "/Warehouse/view/inventory/debt/index",
        meta: {
          title: "Báo cáo công nợ",
          icon: "ri:money-dollar-box-line",
          keepAlive: true,
          permission: Permissions.Accountant.DebtPaymentManagement.View,
        },
      },
      {
        path: "invoice",
        name: "AccountantInvoice",
        component: "/Accountant/view/reporting/invoice",
        meta: {
          title: "Thống kê hóa đơn",
          icon: "ri:bill-line",
          permission: Permissions.Accountant.DashboardManagement.View,
        },
      },
      ...accountantManualRoutes,
    ],
  },
];

export default accountancyMenu;
