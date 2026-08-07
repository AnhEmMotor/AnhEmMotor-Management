import type { GuideSection } from "./guideData";
import {
  DataAnalysis,
  Tools,
  Calendar,
  CircleCheck,
  Wallet,
  Search,
  MapLocation,
  Headset,
} from "@element-plus/icons-vue";

import { sectionData as dashboardData } from "../sections/dashboardData";
import { sectionData as appointmentsData } from "../sections/appointmentsData";
import { sectionData as repairData } from "../sections/repairData";
import { sectionData as warrantyData } from "../sections/warrantyData";
import { sectionData as counterData } from "../sections/counterData";

export const guideSections: GuideSection[] = [
  {
    ...dashboardData,
    id: "dashboard",
    icon: DataAnalysis,
    subtitle: "Dashboard",
    color: "#0284c7",
    shadowColor: "rgba(2,132,199,0.15)",
    imageUrl: "/images/manual/dashboard_overview_1785990505505.png",
  },
  {
    ...appointmentsData,
    id: "appointments",
    icon: Calendar,
    subtitle: "Appointments",
    color: "#059669",
    shadowColor: "rgba(5,150,105,0.15)",
    imageUrl: "/images/manual/contract_management_1785990526494.png",
  },
  {
    ...repairData,
    id: "repair",
    icon: Tools,
    subtitle: "Repair",
    color: "#d97706",
    shadowColor: "rgba(217,119,6,0.15)",
    imageUrl: "/images/manual/sales_invoice_1785990516203.png",
  },
  {
    ...warrantyData,
    id: "warranty",
    icon: CircleCheck,
    subtitle: "Warranty",
    color: "#7c3aed",
    shadowColor: "rgba(124,58,237,0.15)",
    imageUrl: "/images/manual/sales_invoice_1785990516203.png",
  },
  {
    ...counterData,
    id: "counter",
    icon: Wallet,
    subtitle: "Counter Payment",
    color: "#e11d48",
    shadowColor: "rgba(225,29,72,0.15)",
    imageUrl: "/images/manual/reporting_charts_1785990538004.png",
  },
] as GuideSection[];
