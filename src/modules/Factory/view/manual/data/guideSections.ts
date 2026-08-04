import type { GuideSection } from "./guideData"
import { DataAnalysis, Tools, Calendar, CircleCheck, Wallet, Search, MapLocation, Headset } from "@element-plus/icons-vue"

export const guideSections: GuideSection[] = [
	{
		id: "dashboard",
		icon: DataAnalysis,
		title: "Dashboard Xưởng",
		subtitle: "Dashboard",
		color: "#0284c7",
		shadowColor: "rgba(2,132,199,0.15)",
	},
	{
		id: "appointments",
		icon: Calendar,
		title: "Lịch Sửa Chữa",
		subtitle: "Appointments",
		color: "#059669",
		shadowColor: "rgba(5,150,105,0.15)",
	},
	{
		id: "repair",
		icon: Tools,
		title: "Sửa Chữa",
		subtitle: "Repair",
		color: "#d97706",
		shadowColor: "rgba(217,119,6,0.15)",
	},
	{
		id: "warranty",
		icon: CircleCheck,
		title: "Bảo Hành",
		subtitle: "Warranty",
		color: "#7c3aed",
		shadowColor: "rgba(124,58,237,0.15)",
	},
	{
		id: "counter",
		icon: Wallet,
		title: "Quầy Thanh Toán",
		subtitle: "Counter Payment",
		color: "#e11d48",
		shadowColor: "rgba(225,29,72,0.15)",
	},
]
