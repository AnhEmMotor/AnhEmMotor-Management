import type { GuideSection } from "./guideData";
import {
  DataAnalysis,
  Money,
  Box,
  Service,
  UserFilled,
  Avatar,
  Postcard,
  Document,
  Collection,
  Tickets,
} from "@element-plus/icons-vue";

import { sectionData as dashboardData } from "../sections/dashboardData";
import { sectionData as financialData } from "../sections/financialData";
import { sectionData as inventoryData } from "../sections/inventoryData";
import { sectionData as workshopData } from "../sections/workshopData";
import { sectionData as customerData } from "../sections/customerData";
import { sectionData as hrCommissionData } from "../sections/hrCommissionData";
import { sectionData as payrollData } from "../sections/payrollData";
import { sectionData as contractData } from "../sections/contractData";
import { sectionData as debtData } from "../sections/debtData";
import { sectionData as invoiceData } from "../sections/invoiceData";

export const guideSections: GuideSection[] = [
  {
    ...dashboardData,
    id: "dashboard",
    icon: DataAnalysis,
    subtitle: "Executive Dashboard",
    color: "#6366f1",
    shadowColor: "rgba(99,102,241,0.15)",
    imageUrl: "/images/manual/acc_dashboard_1785991209802.png",
  },
  {
    ...financialData,
    id: "financial",
    icon: Money,
    subtitle: "Financial",
    color: "#0284c7",
    shadowColor: "rgba(2,132,199,0.15)",
    imageUrl: "/images/manual/acc_financial_1785991220484.png",
  },
  {
    ...inventoryData,
    id: "inventory",
    icon: Box,
    subtitle: "Inventory",
    color: "#d97706",
    shadowColor: "rgba(217,119,6,0.15)",
    imageUrl: "/images/manual/acc_inventory_1785991230022.png",
  },
  {
    ...workshopData,
    id: "workshop",
    icon: Service,
    subtitle: "Workshop",
    color: "#2563eb",
    shadowColor: "rgba(37,99,235,0.15)",
    imageUrl: "/images/manual/acc_workshop_1785991240428.png",
  },
  {
    ...customerData,
    id: "customer",
    icon: UserFilled,
    subtitle: "Customer",
    color: "#db2777",
    shadowColor: "rgba(219,39,119,0.15)",
    imageUrl: "/images/manual/acc_customer_1785991252984.png",
  },
  {
    ...hrCommissionData,
    id: "hrCommission",
    icon: Avatar,
    subtitle: "HR & Commission",
    color: "#059669",
    shadowColor: "rgba(5,150,105,0.15)",
    imageUrl: "/images/manual/hr_employee_list_1785990547958.png",
  },
  {
    ...payrollData,
    id: "payroll",
    icon: Postcard,
    subtitle: "Payroll",
    color: "#7c3aed",
    shadowColor: "rgba(124,58,237,0.15)",
    imageUrl: "/images/manual/hr_employee_list_1785990547958.png",
  },
  {
    ...contractData,
    id: "contract",
    icon: Document,
    subtitle: "Contract",
    color: "#ea580c",
    shadowColor: "rgba(234,88,12,0.15)",
    imageUrl: "/images/manual/contract_management_1785990526494.png",
  },
  {
    ...debtData,
    id: "debt",
    icon: Collection,
    subtitle: "Debt",
    color: "#059669",
    shadowColor: "rgba(5,150,105,0.15)",
    imageUrl: "/images/manual/sales_invoice_1785990516203.png",
  },
  {
    ...invoiceData,
    id: "invoice",
    icon: Tickets,
    subtitle: "Invoice",
    color: "#d97706",
    shadowColor: "rgba(217,119,6,0.15)",
    imageUrl: "/images/manual/sales_invoice_1785990516203.png",
  },
] as GuideSection[];
