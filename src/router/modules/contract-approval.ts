import { AppRouteRecord } from "@/types/router";

export const contractRoutes: AppRouteRecord = {
  name: "ContractManagement",
  path: "/contract",
  component: "/index/index",
  meta: {
    title: "menus.contract.title",
    icon: "ri:file-list-line",
    roles: ["Admin", "SuperAdmin"],
  },
  children: [
    {
      path: "approval",
      name: "ContractApproval",
      component: "/Admin/view/contract/approval/index",
      meta: {
        title: "Admin duyệt hợp đồng", // Đúng theo yêu cầu: Admin approve contracts
        icon: "ri:check-double-line",
      },
    },
  ],
};
