import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const reportingRoutes: AppRouteRecord = {
  path: "/reporting",
  name: "Reporting",
  component: "/index/index",
  meta: {
    title: "Thống kê & Báo cáo",
    icon: "ri:bar-chart-grouped-line",
    permission: Permissions.StatisticalView,
  },
  children: [
    {
      path: "executive-dashboard",
      name: "ExecutiveDashboard",
      component: "/Accountant/view/reporting/dashboard",
      meta: {
        title: "Tổng quan điều hành",
        icon: "ri:dashboard-line",
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: "sales",
      name: "SalesAnalytics",
      component: "/Accountant/view/reporting/revenue",
      meta: {
        title: "Báo cáo bán hàng",
        icon: "ri:money-cny-circle-line",
        permission: Permissions.StatisticalView,
        isHide: true,
      },
    },
    {
      path: "financial",
      name: "FinancialAnalytics",
      component: "/Accountant/view/reporting/financial",
      meta: {
        title: "Báo cáo tài chính",
        icon: "ri:file-chart-line",
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: "financing",
      name: "FinancingAnalytics",
      component: "/Accountant/view/reporting/financing",
      meta: {
        title: "Báo cáo trả góp",
        icon: "ri:bank-line",
        permission: Permissions.StatisticalView,
        isHide: true,
      },
    },
    {
      path: "inventory",
      name: "InventoryAnalytics",
      component: "/Accountant/view/reporting/inventory",
      meta: {
        title: "Báo cáo tồn kho",
        icon: "ri:archive-line",
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: "workshop",
      name: "WorkshopAnalytics",
      component: "/Accountant/view/reporting/workshop",
      meta: {
        title: "Báo cáo xưởng dịch vụ",
        icon: "ri:tools-line",
        permission: Permissions.StatisticalView,
        isHide: true,
      },
    },
    {
      path: "customer",
      name: "CustomerAnalytics",
      component: "/Accountant/view/reporting/customer",
      meta: {
        title: "Báo cáo khách hàng",
        icon: "ri:user-heart-line",
        permission: Permissions.StatisticalView,
      },
    },
    {
      path: "hr-commission",
      name: "HRCommissionAnalytics",
      component: "/Accountant/view/reporting/employee",
      meta: {
        title: "Báo cáo nhân sự & hoa hồng",
        icon: "ri:team-line",
        permission: Permissions.StatisticalView,
        isHide: true,
      },
    },
    {
      path: "customer-service",
      name: "CustomerServiceAnalytics",
      component: "/Accountant/view/reporting/customer-service",
      meta: {
        title: "Báo cáo chăm sóc khách hàng",
        icon: "ri:customer-service-2-line",
        permission: Permissions.StatisticalView,
        isHide: true,
      },
    },
  ],
};
