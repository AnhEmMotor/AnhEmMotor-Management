import { AppRouteRecord } from "@/types/router";

export const factoryMenu: AppRouteRecord[] = [
  {
    path: "/factory/workshop",
    name: "Workshop",
    component: "/index/index",
    meta: {
      title: "Dịch vụ xưởng",
      icon: "ri:tools-line",
    },
    children: [
      {
        path: "dashboard",
        name: "WorkshopDashboard",
        component: "/Factory/view/service/workshop/dashboard/index",
        meta: {
          title: "Dashboard xưởng",
          icon: "ri:dashboard-line",
        },
      },
      {
        path: "assignment",
        name: "WorkshopAssignment",
        component: "/Factory/view/service/workshop/assignment/index",
        meta: {
          title: "Phân công nhân viên",
          icon: "ri:user-settings-line",
        },
      },
      {
        path: "repair",
        name: "WorkshopRepair",
        component: "/Factory/view/service/workshop/repair-orders/index",
        meta: {
          title: "Sửa chữa",
          icon: "ri:wrench-line",
        },
      },
      {
        path: "warranty",
        name: "WorkshopWarranty",
        component: "/Factory/view/service/warranty-and-complaints/complaints/index",
        meta: {
          title: "Bảo hành",
          icon: "ri:shield-check-line",
        },
      },
      {
        path: "warranty/:id",
        name: "WorkshopWarrantyDetail",
        component: "/Factory/view/service/warranty-and-complaints/warranty-claim-detail/index",
        meta: {
          title: "Chi tiết bảo hành",
          isHide: true,
          activePath: "/factory/workshop/warranty",
        },
      },
      {
        path: "maintenance",
        name: "WorkshopMaintenance",
        component: "/Factory/view/service/workshop/maintenance/index",
        meta: {
          title: "Bảo trì",
          icon: "ri:tool-line",
        },
      },
      {
        path: "maintenance/:id",
        name: "WorkshopMaintenanceDetail",
        component: "/Factory/view/service/workshop/maintenance-detail/index",
        meta: {
          title: "Chi tiết bảo trì",
          isHide: true,
          activePath: "/factory/workshop/maintenance",
        },
      },
      {
        path: "history",
        name: "WorkshopHistory",
        component: "/Factory/view/service/workshop/history/index",
        meta: {
          title: "Tra cứu hồ sơ xe",
          icon: "ri:search-eye-line",
        },
      },
      {
        path: "evaluation",
        name: "WorkshopEvaluation",
        component: "/Factory/view/service/workshop/evaluation/index",
        meta: {
          title: "Đánh giá dịch vụ",
          icon: "ri:star-smile-line",
        },
      },
      {
        path: "repair-history",
        name: "WorkshopRepairHistory",
        component: "/Factory/view/service/workshop/repair-history/index",
        meta: {
          title: "Lịch sử sửa chữa xưởng",
          icon: "ri:tools-line",
          keepAlive: true,
        },
      },
      {
        path: "repair-history/create",
        name: "WorkshopRepairHistoryCreate",
        component: "/Factory/view/service/workshop/repair-history/repair-order-form",
        meta: {
          title: "Lịch sử sửa chữa xưởng",
          isHide: true,
          isHideTab: true,
          keepAlive: true,
          activePath: "/factory/workshop/repair-history",
        },
      },
      {
        path: "repair-history/repair/:id",
        name: "WorkshopRepairHistoryDetail",
        component: "/Factory/view/service/workshop/repair-history/repair-order-detail",
        meta: {
          title: "Lịch sử sửa chữa xưởng",
          isHide: true,
          isHideTab: true,
          keepAlive: true,
          activePath: "/factory/workshop/repair-history",
        },
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
      permissions: ["Permissions.Factory"],
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
  {
    path: "/factory/administrative",
    name: "Administrative",
    component: "/index/index",
    meta: {
      title: "Dịch vụ hành chính",
      icon: "ri:file-list-3-line",
    },
    children: [
      {
        path: "registration",
        name: "AdministrativeRegistration",
        component: "/Factory/view/service/administrative/registration/index",
        meta: {
          title: "Đăng ký biển số",
          icon: "ri:profile-line",
        },
      },
    ],
  },
  {
    path: "/factory/statistics",
    name: "FactoryStatistics",
    component: "/Factory/view/service/workshop/statistics/index",
    meta: {
      title: "Thống kê xưởng",
      icon: "ri:bar-chart-line",
      permissions: ["Permissions.Factory"],
    },
  },
];

export default factoryMenu;
