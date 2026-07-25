import { AppRouteRecord } from "@/types/router";

export const manualRoutes: AppRouteRecord[] = [
  {
    name: "Manual",
    path: "/manual",
    redirect: "/manual/index",
    component: "/index/index",
    meta: {
      title: "HDSD Phần Mềm",
      icon: "ri:book-open-line",
    },
    children: [
      {
        path: "index",
        name: "ManualIndex",
        component: "/manual/index",
        meta: {
          title: "Hướng dẫn sử dụng",
          icon: "ri:file-list-3-line",
        },
      },
    ],
  },
];
