import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const hrRoutes: AppRouteRecord = {
  name: "HRManagement",
  path: "/hr",
  component: "/index/index",
  meta: {
    title: "menus.hr.title",
    icon: "ri:user-star-line",
    roles: ["Admin", "SuperAdmin"],
  },
  children: [
    {
      path: "employee",
      name: "HREmployee",
      component: "/Admin/view/employee/employee/index",
      meta: {
        title: "menus.hr.employee",
        icon: "ri:group-line",
      },
    },
    {
      path: "commission-policy",
      name: "HRCommissionPolicy",
      component: "/Admin/view/employee/policy/index",
      meta: {
        title: "menus.hr.commissionPolicy",
        icon: "ri:percent-line",
      },
    },
    {
      path: "commission-policy/detail/:id?",
      name: "HRCommissionPolicyDetail",
      component: "/Admin/view/employee/policy/detail",
      meta: {
        title: "Chi tiết chính sách",
        isHide: true,
      },
    },
    {
      path: "payroll",
      name: "HRPayroll",
      component: "/Admin/view/employee/payroll/index",
      meta: {
        title: "menus.hr.payroll",
        icon: "ri:bank-card-line",
        isHide: true,
      },
    },
    {
      path: "kpi",
      name: "HRKPI",
      component: "/Admin/view/employee/kpi/index",
      meta: {
        title: "menus.hr.kpi",
        icon: "ri:bar-chart-box-line",
        isHide: true,
      },
    },
    {
      path: "hr-report",
      name: "HRCommissionReport",
      component: "/Accountant/view/reporting/employee",
      meta: {
        title: "Báo cáo nhân sự & hoa hồng",
        icon: "ri:team-line",
        keepAlive: true,
        permission: Permissions.StatisticalView,
      },
    },
  ],
};
