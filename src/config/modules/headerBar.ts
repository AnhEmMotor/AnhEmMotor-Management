import { HeaderBarFeatureConfig } from "@/types";

export const headerBarConfig: HeaderBarFeatureConfig = {
  menuButton: {
    enabled: true,
    description: "khốngchếBên tráiMenucủaMở rộng/Thu gọnNút",
  },
  refreshButton: {
    enabled: true,
    description: "trangmặtLàm mớiNút",
  },
  fastEnter: {
    enabled: true,
    description:
      "khoáivàodiệncôngnăng，gợicunglệdùngỨng dụngvàliêntiếpcủakhoáiTruy cập",
  },
  breadcrumb: {
    enabled: true,
    description: "BreadcrumbĐiều hướng，Hiển thịkhitrướctrangmặtđường",
  },
  globalSearch: {
    enabled: true,
    description:
      "toànbộTìm kiếmcôngnăng，chiếctrìkhoáinhanhphím Ctrl+K hoặc Cmd+K",
  },
  fullscreen: {
    enabled: true,
    description: "Toàn màn hìnhChuyển đổicôngnăng",
  },
  notification: {
    enabled: true,
    description: "ThongBaoTrung tâm，Hiển thịHeThongThongBaovàTinNhan",
  },
  chat: {
    enabled: true,
    description: "tròngàycôngnăng，gợicungthựcgiờgiaothông",
  },
  language: {
    enabled: true,
    description: "đaNgôn ngữChuyển đổicôngnăng",
  },
  settings: {
    enabled: true,
    description: "HeThongCaiDatBảng (Panel)",
  },
  themeToggle: {
    enabled: false,
    description: "ChuDeChuyển đổicôngnăng（minhámChuDe）",
  },
};

export default headerBarConfig;
