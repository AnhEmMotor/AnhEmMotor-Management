import type { GuideSection } from "./guideData";
import {
  DataAnalysis,
  Wallet,
  Document,
  Setting,
  Lock,
  UserFilled,
} from "@element-plus/icons-vue";

export const guideSections: GuideSection[] = [
  {
    id: "dashboard",
    icon: DataAnalysis,
    title: "Bảng Điều Khiển",
    subtitle: "Dashboard",
    color: "#0284c7",
    shadowColor: "rgba(2,132,199,0.15)",
  },
  {
    id: "sales",
    icon: Wallet,
    title: "Quản Lý Bán Hàng",
    subtitle: "Sales",
    color: "#059669",
    shadowColor: "rgba(5,150,105,0.15)",
  },
  {
    id: "contract",
    icon: Document,
    title: "Quản Lý Hợp Đồng",
    subtitle: "Contract",
    color: "#d97706",
    shadowColor: "rgba(217,119,6,0.15)",
  },
  {
    id: "reporting",
    icon: DataAnalysis,
    title: "Thống Kê & Báo Cáo",
    subtitle: "Reporting",
    color: "#7c3aed",
    shadowColor: "rgba(124,58,237,0.15)",
  },
  {
    id: "hr",
    icon: UserFilled,
    title: "Quản Trị Nhân Sự",
    subtitle: "HR",
    color: "#e11d48",
    shadowColor: "rgba(225,29,72,0.15)",
  },
  {
    id: "authorization",
    icon: Lock,
    title: "Phân Quyền Hệ Thống",
    subtitle: "Authorization",
    color: "#2563eb",
    shadowColor: "rgba(37,99,235,0.15)",
  },
  {
    id: "workshop",
    icon: Setting,
    title: "Xưởng Dịch Vụ",
    subtitle: "Workshop",
    color: "#7c3aed",
    shadowColor: "rgba(124,58,237,0.15)",
  },
];
