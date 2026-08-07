import type { GuideSection } from "./guideData";
import {
  DataAnalysis,
  Money,
  Document,
  PieChart,
  User,
  UserFilled,
  Tools,
} from "@element-plus/icons-vue";

import { sectionData as dashboardData } from "../sections/dashboardData";
import { sectionData as salesData } from "../sections/salesData";
import { sectionData as contractData } from "../sections/contractData";
import { sectionData as reportingData } from "../sections/reportingData";
import { sectionData as hrData } from "../sections/hrData";
import { sectionData as authorizationData } from "../sections/authorizationData";
import { sectionData as workshopData } from "../sections/workshopData";

export const guideSections: GuideSection[] = [
  {
    ...dashboardData,
    id: "dashboard",
    icon: DataAnalysis,
    subtitle: "HQ Dashboard",
    color: "#2563eb",
    shadowColor: "rgba(37,99,235,0.15)",
    imageUrl: "/images/manual/dashboard_overview_1785990505505.png",
  },
  {
    ...salesData,
    id: "sales",
    icon: Money,
    subtitle: "Sales Operations",
    color: "#059669",
    shadowColor: "rgba(5,150,105,0.15)",
    imageUrl: "/images/manual/sales_invoice_1785990516203.png",
  },
  {
    ...contractData,
    id: "contract",
    icon: Document,
    subtitle: "Contract & Templates",
    color: "#7c3aed",
    shadowColor: "rgba(124,58,237,0.15)",
    imageUrl: "/images/manual/contract_management_1785990526494.png",
  },
  {
    ...reportingData,
    id: "reporting",
    icon: PieChart,
    subtitle: "Advanced Analytics",
    color: "#be123c",
    shadowColor: "rgba(190,18,60,0.15)",
    imageUrl: "/images/manual/reporting_charts_1785990538004.png",
  },
  {
    ...hrData,
    id: "hr",
    icon: User,
    subtitle: "Human Resources",
    color: "#c026d3",
    shadowColor: "rgba(192,38,211,0.15)",
    imageUrl: "/images/manual/hr_employee_list_1785990547958.png",
  },
  {
    ...authorizationData,
    id: "authorization",
    icon: UserFilled,
    subtitle: "Authorization",
    color: "#d97706",
    shadowColor: "rgba(217,119,6,0.15)",
    imageUrl: "/images/manual/authorization_roles_1785990556798.png",
  },
  {
    ...workshopData,
    id: "workshop",
    icon: Tools,
    subtitle: "Workshop Policies",
    color: "#0f766e",
    shadowColor: "rgba(15,118,110,0.15)",
    imageUrl: "/images/manual/workshop_kanban_1785990569362.png",
  },
] as GuideSection[];
