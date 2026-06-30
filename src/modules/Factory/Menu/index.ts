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
        component:
          "/Factory/view/service/warranty-and-complaints/warranty-requests/index",
        meta: {
          title: "Bảo hành",
          icon: "ri:shield-check-line",
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
    ],
  },
  {
    path: "/factory/sales-contracts",
    name: "SalesContracts",
    component: "/index/index",
    meta: {
      title: "Hợp đồng mua bán xe",
      icon: "ri:file-paper-2-line",
    },
    children: [
      {
        path: "",
        name: "SalesContractList",
        component: "/Factory/view/service/sales-contracts/index",
        meta: {
          title: "Danh sách hợp đồng",
          icon: "ri:file-list-line",
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
    },
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
];

export default factoryMenu;
