import type { GuideSection } from "./guideData"
import { DataAnalysis, Picture, Document, ChatDotRound, Message, UserFilled, Calendar } from "@element-plus/icons-vue"

export const guideSections: GuideSection[] = [
	{
		id: "dashboard",
		icon: DataAnalysis,
		title: "Dashboard tiếp thị",
		subtitle: "Marketing Dashboard",
		color: "#6366f1",
		shadowColor: "rgba(99,102,241,0.15)",
	},
	{
		id: "banner",
		icon: Picture,
		title: "Quản lý banner",
		subtitle: "Banner Management",
		color: "#0ea5e9",
		shadowColor: "rgba(14,165,233,0.15)",
	},
	{
		id: "article",
		icon: Document,
		title: "Bài viết tin tức",
		subtitle: "Articles",
		color: "#10b981",
		shadowColor: "rgba(16,185,129,0.15)",
	},
	{
		id: "comment",
		icon: ChatDotRound,
		title: "Bình luận",
		subtitle: "Comments",
		color: "#f59e0b",
		shadowColor: "rgba(245,158,11,0.15)",
	},
	{
		id: "contact",
		icon: Message,
		title: "Liên hệ",
		subtitle: "Contacts",
		color: "#f43f5e",
		shadowColor: "rgba(244,63,94,0.15)",
	},
	{
		id: "customer",
		icon: UserFilled,
		title: "Khách hàng",
		subtitle: "Customers",
		color: "#8b5cf6",
		shadowColor: "rgba(139,92,246,0.15)",
	},
	{
		id: "booking",
		icon: Calendar,
		title: "Đặt lịch",
		subtitle: "Booking",
		color: "#ec4899",
		shadowColor: "rgba(236,72,153,0.15)",
	},
]
