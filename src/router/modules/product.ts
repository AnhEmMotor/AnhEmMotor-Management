import { AppRouteRecord } from "@/types/router";

export const productRoutes: AppRouteRecord[] = [
  {
    name: "OrderProductManagement",
    path: "/order/product",
    component: "",
    meta: {
      title: "menus.product.title",
      icon: "ri:shopping-bag-3-line",
      roles: ["Admin", "SuperAdmin"],
    },
    children: [
      {
        path: "brand",
        name: "OrderProductBrand",
        component: "/Order/view/product/brand/index",
        meta: {
          title: "menus.product.brand.title",
          icon: "ri:medal-line",
          permissions: ["Permissions.Brands.View"],
        },
      },
      {
        path: "type",
        name: "OrderProductType",
        component: "/Order/view/product/type/index",
        meta: {
          title: "menus.product.type.title",
          icon: "ri:folders-line",
        },
      },
      {
        path: "list",
        name: "OrderProductList",
        component: "/Order/view/product/list/index",
        meta: {
          title: "menus.product.list.title",
          icon: "ri:list-unordered",
        },
      },
    ],
  },
  {
    name: "WarehouseProductManagement",
    path: "/warehouse/product",
    component: "",
    meta: {
      title: "menus.product.title",
      icon: "ri:shopping-bag-3-line",
      roles: ["Admin", "SuperAdmin"],
    },
    children: [
      {
        path: "brand",
        name: "WarehouseProductBrand",
        component: "/Warehouse/view/product/brand/index",
        meta: {
          title: "menus.product.brand.title",
          icon: "ri:medal-line",
          permissions: ["Permissions.Brands.View"],
        },
      },
      {
        path: "type",
        name: "WarehouseProductType",
        component: "/Warehouse/view/product/type/index",
        meta: {
          title: "menus.product.type.title",
          icon: "ri:folders-line",
        },
      },
      {
        path: "list",
        name: "WarehouseProductList",
        component: "/Warehouse/view/product/list/index",
        meta: {
          title: "menus.product.list.title",
          icon: "ri:list-unordered",
        },
      },
    ],
  },
];
