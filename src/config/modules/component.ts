/**
 * toànbộComponentCauHinh
 *
 * thốngmộtQuản lýHeThongcấptoànbộComponentcủaDangKy。
 * nàyvàiComponentsẽtạiỨng dụngbậtđộnggiờtoànbộDangKy，Có thểtạinhiệmnàođịaphươngkhiếndùng。
 *
 * ## chủcầncôngnăng
 *
 * - ComponentCauHinh - tậptrongQuản lýtoànbộComponentcủaCauHinhThongTin
 * - khácbướcLoading - khiếndùng defineAsyncComponent thựchiệncầnLoading
 * - Công tắckhốngchế - chiếctrìthông qua enabled tựđoạnBật/TắtComponent
 * - CauHinhTìmhỏi - gợicungCông cụHàmkhoáiTìmhỏiComponentCauHinh
 *
 * @module config/component
 * @author Art Design Pro Team
 */

import { defineAsyncComponent } from 'vue'

/**
 * toànbộComponentCauHinhDanh sách
 */
export const globalComponentsConfig: GlobalComponentConfig[] = [
  {
    name: 'CaiDatBảng (Panel)',
    key: 'settings-panel',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-settings-panel/index.vue')
    ),
    enabled: true
  },
  {
    name: 'toànbộTimKiem',
    key: 'global-search',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-global-search/index.vue')
    ),
    enabled: true
  },
  {
    name: 'khóamàn hình',
    key: 'screen-lock',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-screen-lock/index.vue')
    ),
    enabled: true
  },
  {
    name: 'tròngàysổdiện',
    key: 'chat-window',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-chat-window/index.vue')
    ),
    enabled: true
  },
  {
    name: 'lễhoaHiệu quả',
    key: 'fireworks-effect',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-fireworks-effect/index.vue')
    ),
    enabled: true
  },
  {
    name: 'WatermarkHiệu quả',
    key: 'watermark',
    component: defineAsyncComponent(
      () => import('@/components/core/others/art-watermark/index.vue')
    ),
    enabled: true
  }
]

/**
 * toànbộComponentCauHinhGiao diện (Interface)
 */
export interface GlobalComponentConfig {
  /** Componentdanhtên */
  name: string
  /** Componenttiêu */
  key: string
  /** Component */
  component: any
  /** làphủBật */
  enabled?: boolean
  /** ComponentMô tả */
  description?: string
}

/**
 * LấyBậtcủatoànbộComponent
 * @returns ĐãBậtcủaComponentCauHinhDanh sách
 */
export const getEnabledGlobalComponents = () => {
  return globalComponentsConfig.filter((config) => config.enabled !== false)
}

/**
 * liệu key LấyComponentCauHinh
 * @param key Componenttiêu
 * @returns ComponentCauHinhDoiTuong
 */
export const getGlobalComponentByKey = (key: string) => {
  return globalComponentsConfig.find((config) => config.key === key)
}
