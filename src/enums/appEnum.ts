/**
 * Module định nghĩa Enum cấp hệ thống
 *
 * ## Chức năng chính
 *
 * - Enum loại menu (Trái, trên cùng, hỗn hợp, hai cột)
 * - Enum loại giao diện (Sáng, tối, tự động)
 * - Enum giao diện menu (Thiết kế, sáng, tối)
 * - Enum ngôn ngữ (Tiếng Việt, Tiếng Anh)
 * - Enum chiều rộng container (Đầy đủ, cố định)
 * - Enum chiều rộng menu (Chiều rộng thu gọn)
 *
 * @module enums/appEnum
 * @author Art Design Pro Team
 */

/**
 * Loại menu
 */
export enum MenuTypeEnum {
  /** Menu bên trái */
  LEFT = 'left',
  /** Menu trên cùng */
  TOP = 'top',
  /** Menu trên cùng + bên trái */
  TOP_LEFT = 'top-left',
  /** Menu hai cột */
  DUAL_MENU = 'dual-menu'
}

/**
 * Giao diện hệ thống
 */
export enum SystemThemeEnum {
  /** Giao diện tối */
  DARK = 'dark',
  /** Giao diện sáng */
  LIGHT = 'light',
  /** Giao diện tự động (Theo hệ thống) */
  AUTO = 'auto'
}

/**
 * Giao diện menu
 */
export enum MenuThemeEnum {
  /** Giao diện tối */
  DARK = 'dark',
  /** Giao diện sáng */
  LIGHT = 'light',
  /** Giao diện thiết kế */
  DESIGN = 'design'
}

/**
 * Độ rộng menu
 */
export enum MenuWidth {
  /** Độ rộng khi thu gọn */
  CLOSE = '64px'
}

/**
 * Loại ngôn ngữ
 */
export enum LanguageEnum {
  /** Tiếng Việt */
  VI = 'vi',
  /** Tiếng Anh */
  EN = 'en'
}

/**
 * Độ rộng container
 */
export enum ContainerWidthEnum {
  /** Chiều rộng toàn màn hình */
  FULL = '100%',
  /** Chiều rộng cố định */
  BOXED = '1200px'
}
