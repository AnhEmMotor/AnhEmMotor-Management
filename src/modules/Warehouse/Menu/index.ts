import { AppRouteRecord } from "@/types/router";
import { Permissions } from "@/domain/constants/permissions";

export const warehouseMenu: AppRouteRecord[] = [
  {
    path: "/Warehouse",
    name: "Warehouse",
    component: "/index/index",
    meta: {
      title: "Warehouse",
      icon: "ri:store-2-line",
      roles: ["Admin", "SuperAdmin"],
      permissions: ["Permissions.Warehouse"],
    },
    redirect: "/Warehouse/intro",
    children: [
      {
        path: "intro",
        name: "WarehouseIntro",
        component: "/Warehouse/view/intro/index",
        meta: {
          title: "Giới thiệu",
          icon: "ri:image-line",
          isHide: true,
        },
      },
      {
        path: "product",
        name: "WarehouseProduct",
        component: "/Warehouse/view/product/list/index",
        meta: {
          title: "Quản lý sản phẩm",
          icon: "ri:shopping-bag-3-line",
          keepAlive: true,
          permissions: [Permissions.Warehouse.ProductManagement.View],
        },
      },
      {
        path: "supplier",
        name: "WarehouseSupplier",
        component: "/Warehouse/view/inventory/supplier/index",
        meta: {
          title: "Quản lý đối tác",
          icon: "ri:team-line",
          keepAlive: true,
          permissions: [Permissions.Warehouse.SupplierManagement.View],
        },
      },
      {
        path: "purchase-request",
        name: "WarehousePurchaseRequest",
        component: "/Warehouse/view/inventory/purchase-request/index",
        meta: {
          title: "Quản lý yêu cầu mua hàng",
          icon: "ri:git-pull-request-line",
          keepAlive: true,
          permissions: [Permissions.Warehouse.PurchaseRequestManagement.View],
        },
      },
      {
        path: "input",
        name: "WarehouseInput",
        component: "/Warehouse/view/inventory/input/index",
        meta: {
          title: "Quản lý phiếu nhập kho",
          icon: "ri:file-list-3-line",
          keepAlive: true,
          permissions: [Permissions.Warehouse.ReceiptManagement.View],
        },
      },
      {
        path: "debt",
        name: "WarehouseDebt",
        component: "/Warehouse/view/inventory/debt/index",
        meta: {
          title: "Quản lý công nợ",
          icon: "ri:money-cny-box-line",
          keepAlive: true,
          permissions: [Permissions.Warehouse.DebtPaymentManagement.View],
        },
      },
      {
        path: "in-out-stock",
        name: "WarehouseInOutStock",
        component: "/Warehouse/view/inventory/in-out-stock/index",
        meta: {
          title: "Báo cáo xuất - nhập - tồn",
          icon: "ri:line-chart-line",
          keepAlive: true,
        },
      },
      {
        path: "ledger",
        name: "WarehouseLedger",
        component: "/Warehouse/view/inventory/ledger/index",
        meta: {
          title: "Sổ cái tồn kho",
          icon: "ri:book-3-line",
          keepAlive: true,
        },
      },
      {
        path: "contract",
        name: "WarehouseContract",
        component: "/Warehouse/view/warehouse/contract/index",
        meta: {
          title: "Hợp đồng nhà cung cấp",
          icon: "ri:file-contract-line",
          keepAlive: true,
          permissions: [Permissions.Warehouse.SupplierContractManagement.View],
        },
      },
      {
        path: "inventory-settings",
        name: "WarehouseInventorySettings",
        component: "/sales-settings/inventory/index",
        meta: {
          title: "Cài đặt tồn kho",
          icon: "ri:alarm-warning-line",
          keepAlive: true,
        },
      },
    ],
  },
];

export default warehouseMenu;
