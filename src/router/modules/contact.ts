import { AppRouteRecord } from "@/types/router";

export const contactRoutes: AppRouteRecord = {
  name: "ContactManagement",
  path: "/contacts/index",
  component: "/Marketing/view/contact/index",
  meta: {
    title: "menus.contact.title",
    icon: "ri:message-2-line",
    roles: ["Admin", "SuperAdmin"],
  },
};
