import { AppRouteRecord } from "@/types/router";

export const inventoryRoutes: AppRouteRecord = {
  name: "InventoryManagement",
  path: "/warehouse/inventory",
  component: "/Warehouse/view/inventory/index",
  meta: {
    title: "menus.inventory.title",
    icon: "ri:archive-line",
    roles: ["Admin", "SuperAdmin"],
    permissions: ["Permissions.Warehouse"],
  },
  children: [
    {
      path: "supplier",
      name: "InventorySupplier",
      component: "/Warehouse/view/inventory/supplier/index",
      meta: {
        title: "menus.inventory.supplier",
        icon: "ri:team-line",
        permissions: ["Permissions.Warehouse.SupplierManagement.View"],
      },
    },
    {
      path: "purchase-request",
      name: "PurchaseRequest",
      component: "/Warehouse/view/inventory/purchase-request/index",
      meta: {
        title: "Yêu cầu mua hàng",
        icon: "ri:git-pull-request-line",
        permissions: ["Permissions.Warehouse.PurchaseRequestManagement.View"],
      },
    },
    {
      path: "input",
      name: "InventoryInput",
      component: "/Warehouse/view/inventory/input/index",
      meta: {
        title: "menus.inventory.input",
        icon: "ri:file-list-3-line",
        permissions: ["Permissions.Warehouse.ReceiptManagement.View"],
      },
    },
    {
      path: "debt",
      name: "InventoryDebt",
      component: "/Warehouse/view/inventory/debt/index",
      meta: {
        title: "menus.inventory.debt",
        icon: "ri:money-cny-box-line",
        permissions: ["Permissions.Warehouse.DebtPaymentManagement.View"],
      },
    },
    {
      path: "in-out-stock",
      name: "InventoryInOutStock",
      component: "/Warehouse/view/inventory/in-out-stock/index",
      meta: {
        title: "menus.inventory.inOutStock",
        icon: "ri:line-chart-line",
        permissions: ["Permissions.Warehouse.InventoryReportManagement.View"],
      },
    },
    {
      path: "ledger",
      name: "InventoryLedger",
      component: "/Warehouse/view/inventory/ledger/index",
      meta: {
        title: "menus.inventory.ledger",
        icon: "ri:book-3-line",
        permissions: ["Permissions.Warehouse.LedgerManagement.View"],
      },
    },
  ],
};
