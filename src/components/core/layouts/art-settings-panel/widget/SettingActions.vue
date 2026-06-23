<template>
  <div
    class="mt-10 flex gap-8 border-t border-[var(--default-border)] bg-[var(--art-bg-color)] pt-5"
  >
    <ElButton type="primary" class="flex-1 !h-8" @click="handleCopyConfig">
      {{ $t("setting.actions.copyConfig") }}
    </ElButton>
    <ElButton
      type="danger"
      plain
      class="flex-1 !h-8"
      @click="handleResetConfig"
    >
      {{ $t("setting.actions.resetConfig") }}
    </ElButton>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import { useSettingStore } from "@/application/store/setting";
import { SETTING_DEFAULT_CONFIG } from "@/config/setting";
import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { MenuThemeEnum } from "@/enums/appEnum";
import { useTheme } from "@/common/composables/useTheme";

defineOptions({ name: "SettingActions" });

const { t } = useI18n();
const settingStore = useSettingStore();
const { copy, copied } = useClipboard();
const { switchThemeStyles } = useTheme();

const ENUM_MAPS = {
  menuType: {
    left: "MenuTypeEnum.LEFT",
    top: "MenuTypeEnum.TOP",
    "top-left": "MenuTypeEnum.TOP_LEFT",
    "dual-menu": "MenuTypeEnum.DUAL_MENU",
  },
  systemTheme: {
    auto: "SystemThemeEnum.AUTO",
    light: "SystemThemeEnum.LIGHT",
    dark: "SystemThemeEnum.DARK",
  },
  menuTheme: {
    design: "MenuThemeEnum.DESIGN",
    light: "MenuThemeEnum.LIGHT",
    dark: "MenuThemeEnum.DARK",
  },
  containerWidth: {
    "100%": "ContainerWidthEnum.FULL",
    "1200px": "ContainerWidthEnum.BOXED",
  },
} as const;

interface ConfigItem {
  comment: string;
  key: keyof typeof settingStore;
  enumMap?: Record<string, string>;
  forceValue?: any;
}

const CONFIG_ITEMS: ConfigItem[] = [
  { comment: "Menuloạikiểu", key: "menuType", enumMap: ENUM_MAPS.menuType },
  { comment: "MenuMở rộngChiều rộng", key: "menuOpenWidth" },
  { comment: "MenulàphủMở rộng", key: "menuOpen" },
  { comment: "đôiMenulàphủHiển thịvănquyển", key: "dualMenuShowText" },
  {
    comment: "HeThongChuDeloạikiểu",
    key: "systemThemeType",
    enumMap: ENUM_MAPS.systemTheme,
  },
  {
    comment: "HeThongChuDemôkiểu",
    key: "systemThemeMode",
    enumMap: ENUM_MAPS.systemTheme,
  },
  {
    comment: "MenuPhong cách",
    key: "menuThemeType",
    enumMap: ENUM_MAPS.menuTheme,
  },
  { comment: "HeThongChuDeMàu sắc", key: "systemThemeColor" },
  { comment: "làphủHiển thịMenuNút", key: "showMenuButton" },
  { comment: "làphủHiển thịkhoáivàodiện", key: "showFastEnter" },
  { comment: "làphủHiển thịLàm mớiNút", key: "showRefreshButton" },
  { comment: "làphủHiển thịBreadcrumb", key: "showCrumbs" },
  { comment: "làphủHiển thịTổng quan hệ thốngTag", key: "showWorkTab" },
  { comment: "làphủHiển thịNgôn ngữChuyển đổi", key: "showLanguage" },
  { comment: "làphủHiển thịThanh tiến trình", key: "showNprogress" },
  { comment: "làphủHiển thịCaiDattríchXuất", key: "showSettingGuide" },
  { comment: "làphủHiển thịtiếtngàyvănquyển", key: "showFestivalText" },
  { comment: "làphủHiển thịWatermark", key: "watermarkVisible" },
  { comment: "làphủtừđộngđóngđóng", key: "autoClose" },
  { comment: "làphủduymộtMở rộng", key: "uniqueOpened" },
  { comment: "làphủmàunhượcmôkiểu", key: "colorWeak" },
  { comment: "làphủLàm mới", key: "refresh" },
  { comment: "làphủLoadingtiếtngàykhóihoa", key: "holidayFireworksLoaded" },
  { comment: "Viềnmôkiểu", key: "boxBorderMode" },
  { comment: "trangmặtquađộHiệu quả", key: "pageTransition" },
  { comment: "Thẻ TabKiểu dáng", key: "tabStyle" },
  { comment: "Tùy chỉnhVai", key: "customRadius" },
  {
    comment: "ContainerChiều rộng",
    key: "containerWidth",
    enumMap: ENUM_MAPS.containerWidth,
  },
  { comment: "tiếtngàyNgày", key: "festivalDate", forceValue: "" },
];

const valueToCode = (value: any, enumMap?: Record<string, string>): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  if (enumMap && typeof value === "string" && enumMap[value]) {
    return enumMap[value];
  }

  if (typeof value === "string") return `'${value}'`;
  if (typeof value === "boolean" || typeof value === "number")
    return String(value);

  return JSON.stringify(value);
};

const generateConfigCode = (): string => {
  const lines = ["export const SETTING_DEFAULT_CONFIG = {"];

  CONFIG_ITEMS.forEach((item) => {
    lines.push(`  /** ${item.comment} */`);
    const value =
      item.forceValue !== undefined ? item.forceValue : settingStore[item.key];
    lines.push(`  ${String(item.key)}: ${valueToCode(value, item.enumMap)},`);
  });

  lines.push("}");
  return lines.join("\n");
};

const handleCopyConfig = async () => {
  try {
    const configText = generateConfigCode();
    await copy(configText);

    if (copied.value) {
      ElMessage.success({
        message: t("setting.actions.copySuccess"),
        duration: 3000,
      });
    }
  } catch (error) {
    console.error("phụcchếCauHinhThatBai:", error);
    ElMessage.error(t("setting.actions.copyFailed"));
  }
};

const toggleIfDifferent = (
  currentValue: boolean,
  defaultValue: boolean,
  toggleFn: () => void,
) => {
  if (currentValue !== defaultValue) {
    toggleFn();
  }
};

const handleResetConfig = async () => {
  try {
    const config = SETTING_DEFAULT_CONFIG;

    settingStore.switchMenuLayouts(config.menuType);
    settingStore.setMenuOpenWidth(config.menuOpenWidth);
    settingStore.setMenuOpen(config.menuOpen);
    settingStore.setDualMenuShowText(config.dualMenuShowText);

    switchThemeStyles(config.systemThemeMode);

    await nextTick();
    const menuTheme = settingStore.isDark
      ? MenuThemeEnum.DARK
      : config.menuThemeType;
    settingStore.switchMenuStyles(menuTheme);

    settingStore.setElementTheme(config.systemThemeColor);

    toggleIfDifferent(settingStore.showMenuButton, config.showMenuButton, () =>
      settingStore.setButton(),
    );
    toggleIfDifferent(settingStore.showFastEnter, config.showFastEnter, () =>
      settingStore.setFastEnter(),
    );
    toggleIfDifferent(
      settingStore.showRefreshButton,
      config.showRefreshButton,
      () => settingStore.setShowRefreshButton(),
    );
    toggleIfDifferent(settingStore.showCrumbs, config.showCrumbs, () =>
      settingStore.setCrumbs(),
    );
    toggleIfDifferent(settingStore.showLanguage, config.showLanguage, () =>
      settingStore.setLanguage(),
    );
    toggleIfDifferent(settingStore.showNprogress, config.showNprogress, () =>
      settingStore.setNprogress(),
    );

    settingStore.setWorkTab(config.showWorkTab);
    settingStore.setShowFestivalText(config.showFestivalText);
    settingStore.setWatermarkVisible(config.watermarkVisible);

    toggleIfDifferent(settingStore.autoClose, config.autoClose, () =>
      settingStore.setAutoClose(),
    );
    toggleIfDifferent(settingStore.uniqueOpened, config.uniqueOpened, () =>
      settingStore.setUniqueOpened(),
    );
    toggleIfDifferent(settingStore.colorWeak, config.colorWeak, () =>
      settingStore.setColorWeak(),
    );

    toggleIfDifferent(settingStore.boxBorderMode, config.boxBorderMode, () =>
      settingStore.setBorderMode(),
    );
    settingStore.setPageTransition(config.pageTransition);
    settingStore.setTabStyle(config.tabStyle);
    settingStore.setCustomRadius(config.customRadius);
    settingStore.setContainerWidth(config.containerWidth);

    settingStore.setFestivalDate(config.festivalDate);
    settingStore.setholidayFireworksLoaded(config.holidayFireworksLoaded);

    location.reload();
  } catch (error) {
    console.error("Đặt lạiCauHinhThatBai:", error);
    ElMessage.error(t("setting.actions.resetFailed"));
  }
};
</script>
