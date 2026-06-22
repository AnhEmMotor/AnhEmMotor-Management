import { AppRouteRecord } from "@/types/router";

export const serviceRoutes: AppRouteRecord = {
  path: "/service",
  name: "Service",
  component: "/index/index",
  meta: {
    title: "menus.service.title",
    icon: "ri:customer-service-2-line",
  },
  children: [
    {
      path: "workshop",
      name: "ServiceWorkshop",
      component: "",
      meta: {
        title: "menus.service.workshop.title",
        icon: "ri:tools-line",
      },
      children: [
        {
          path: "dashboard",
          name: "ServiceWorkshopDashboard",
          component: "/Factory/view/service/workshop/dashboard/index",
          meta: {
            title: "menus.service.workshop.dashboard",
            icon: "ri:dashboard-line",
          },
        },
        {
          path: "repair-orders",
          name: "ServiceWorkshopRepairOrders",
          component: "/Factory/view/service/workshop/repair-orders/index",
          meta: {
            title: "menus.service.workshop.repairOrders",
            icon: "ri:tools-fill",
          },
        },
        {
          path: "maintenance",
          name: "ServiceWorkshopMaintenance",
          component: "/Factory/view/service/workshop/maintenance/index",
          meta: {
            title: "menus.service.workshop.maintenance",
            icon: "ri:history-line",
          },
        },
        {
          path: "warranty-requests",
          name: "ServiceWarrantyRequests",
          component:
            "/Factory/view/service/warranty-and-complaints/warranty-requests/index",
          meta: {
            title: "menus.service.warrantyAndComplaints.warrantyRequests",
            icon: "ri:shield-check-line",
          },
        },
        {
          path: "warranty-requests/:id",
          name: "ServiceWarrantyClaimDetail",
          component:
            "/Factory/view/service/warranty-and-complaints/warranty-claim-detail/index",
          meta: {
            title: "menus.service.warrantyAndComplaints.warrantyRequests",
            icon: "ri:shield-check-line",
            isHide: true,
          },
        },
        {
          path: "history",
          name: "ServiceWorkshopHistoryByVin",
          component: "/Factory/view/service/workshop/history/index",
          meta: {
            title: "menus.service.workshop.historyByVin",
            icon: "ri:search-eye-line",
          },
        },
        {
          path: "evaluation",
          name: "ServiceWorkshopEvaluation",
          component: "/Factory/view/service/workshop/evaluation/index",
          meta: {
            title: "menus.service.workshop.evaluation",
            icon: "ri:star-smile-line",
          },
        },
      ],
    },
    {
      path: "administrative",
      name: "ServiceAdministrative",
      component: "",
      meta: {
        title: "menus.service.administrative.title",
        icon: "ri:file-list-3-line",
      },
      children: [
        {
          path: "registration",
          name: "ServiceAdministrativeRegistrationPlateList",
          component: "/Factory/view/service/administrative/registration/index",
          meta: {
            title: "Hồ sơ đăng ký biển số",
            icon: "ri:profile-line",
          },
        },
      ],
    },
    {
      path: "booking",
      name: "ServiceBooking",
      component: "",
      meta: {
        title: "menus.service.booking.title",
        icon: "ri:calendar-event-line",
      },
      children: [
        {
          path: "list",
          name: "ServiceBookingList",
          component: "/Factory/view/service/booking/list/index",
          meta: {
            title: "menus.service.booking.list",
            icon: "ri:calendar-todo-line",
          },
        },
        {
          path: "calendar",
          name: "ServiceBookingCalendar",
          component: "/Factory/view/service/booking/calendar/index",
          meta: {
            title: "menus.service.booking.calendar",
            icon: "ri:calendar-check-line",
          },
        },
      ],
    },
    {
      path: "warranty-and-complaints",
      name: "ServiceWarrantyAndComplaints",
      component: "",
      meta: {
        title: "menus.service.warrantyAndComplaints.title",
        icon: "ri:shield-check-line",
        isHide: true,
      },
      children: [
        {
          path: "complaints",
          name: "ServiceComplaints",
          component:
            "/Factory/view/service/warranty-and-complaints/complaints/index",
          meta: {
            title: "menus.service.warrantyAndComplaints.complaints",
            icon: "ri:message-3-line",
            isHide: true,
          },
        },
      ],
    },
  ],
};
