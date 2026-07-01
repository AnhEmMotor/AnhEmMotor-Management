import { AppRouteRecord } from "@/types/router";

export const factoryMenu: AppRouteRecord[] = [
  {
    path: "/factory/workshop",
    name: "Workshop",
    component: "/index/index",
    meta: { title: "Dịch vụ xưởng", icon: "ri:tools-line" },
    children: [
      {
        path: "dashboard",
        name: "WorkshopDashboard",
        component: "/Factory/view/service/workshop/dashboard/index",
        meta: { title: "Dashboard xưởng", icon: "ri:dashboard-line" },
      },
      {
        path: "assignment",
        name: "WorkshopAssignment",
        component: "/Factory/view/service/workshop/assignment/index",
        meta: { title: "Phân công nhân viên", icon: "ri:user-settings-line" },
      },
      {
        path: "repair",
        name: "WorkshopRepair",
        component: "/Factory/view/service/workshop/repair-orders/index",
        meta: { title: "Sửa chữa", icon: "ri:wrench-line" },
      },
      {
        path: "warranty",
        name: "WorkshopWarranty",
        component:
          "/Factory/view/service/warranty-and-complaints/warranty-requests/index",
        meta: { title: "Bảo hành", icon: "ri:shield-check-line" },
      },
      {
        path: "maintenance",
        name: "WorkshopMaintenance",
        component: "/Factory/view/service/workshop/maintenance/index",
        meta: { title: "Bảo trì", icon: "ri:settings-3-line" },
      },
      {
        path: "history",
        name: "WorkshopHistory",
        component: "/Factory/view/service/workshop/history/index",
        meta: { title: "Tra cứu hồ sơ xe", icon: "ri:search-eye-line" },
      },
    ],
  },
  {
    path: "/factory/statistics",
    name: "FactoryStatistics",
    component: "/Factory/view/service/workshop/statistics/index",
    meta: { title: "Thống kê xưởng", icon: "ri:bar-chart-line" },
  },
  {
    path: "/factory/administrative",
    name: "Administrative",
    component: "/index/index",
    meta: { title: "Dịch vụ hành chính", icon: "ri:file-list-3-line" },
    children: [
      {
        path: "registration",
        name: "AdministrativeRegistration",
        component: "/Factory/view/service/administrative/registration/index",
        meta: { title: "Đăng ký biển số", icon: "ri:profile-line" },
      },
    ],
  },
  {
    path: "/factory/workshop/counter",
    name: "WorkshopCounter",
    component: "/index/index",
    redirect: "/factory/workshop/counter/payment",
    meta: {
      title: "menus.service.workshop.counter.title",
      icon: "ri:money-dollar-circle-line",
    },
    children: [
      {
        path: "payment",
        name: "CounterPaymentList",
        component: "/Factory/view/service/workshop/counter/payment-list/index",
        meta: { title: "Phiếu thu xưởng", icon: "ri:receipt-line" },
      },
    ],
  },
];

export default factoryMenu;
