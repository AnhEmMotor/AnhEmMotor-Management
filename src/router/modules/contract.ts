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
      path: "sales",
      name: "SalesContract",
      component: "/Admin/view/contract/sales/index",
      meta: {
        title: "menus.contract.sales",
        icon: "ri:file-paper-2-line",
      },
    },
    {
      path: "sales/preview/:id?",
      name: "SalesContractPreview",
      component: "/Admin/view/contract/sales/contract-preview",
      meta: {
        title: "Chi tiết Hợp đồng",
        icon: "ri:file-search-line",
        isHide: true,
      },
    },
    {
      path: "finance",
      name: "FinanceContract",
      component: "/Admin/view/contract/finance/index",
      meta: {
        title: "menus.contract.finance",
        icon: "ri:money-dollar-circle-line",
      },
    },
    {
      path: "finance/preview/:id?",
      name: "FinanceContractPreview",
      component: "/Admin/view/contract/finance/finance-contract-detail",
      meta: {
        title: "Chi tiết Hợp đồng tài chính",
        icon: "ri:file-search-line",
        isHide: true,
      },
    },
    {
      path: "supplier",
      name: "SupplierContract",
      component: "/Admin/view/contract/supplier/index",
      meta: {
        title: "menus.contract.supplier",
        icon: "ri:truck-line",
      },
    },
    {
      path: "supplier/preview/:id?",
      name: "SupplierContractPreview",
      component: "/Admin/view/contract/supplier/contract-preview",
      meta: {
        title: "Chi tiết Hợp đồng nhà cung cấp",
        icon: "ri:file-search-line",
        isHide: true,
      },
    },
    {
      path: "templates",
      name: "ContractTemplates",
      component: "/Admin/view/contract/templates/index",
      meta: {
        title: "menus.contract.templates",
        icon: "ri:layout-4-line",
      },
    },
    {
      path: "templates/edit/:id?",
      name: "EditContractTemplate",
      component: "/Admin/view/contract/templates/edit",
      meta: {
        title: "Biên tập Mẫu Hợp đồng",
        icon: "ri:edit-2-line",
        isHide: true,
      },
    },
  ],
};
