import { AppRouteRecord } from "@/types/router";

export const serviceRoutes: AppRouteRecord = {
path: "/factory/service",
name: "Service",
component: "/index/index",
meta: {
title: "Thống kê Xưởng",
icon: "ri:bar-chart-grouped-line",
},
children: [],
};
