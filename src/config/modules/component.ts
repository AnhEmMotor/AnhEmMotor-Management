import { defineAsyncComponent } from 'vue'

export const globalComponentsConfig: GlobalComponentConfig[] = [
  {
    name: 'CaiDatBảng (Panel)',
    key: 'settings-panel',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-settings-panel/index.vue'),
    ),
    enabled: true,
  },
  {
    name: 'toànbộTìm kiếm',
    key: 'global-search',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-global-search/index.vue'),
    ),
    enabled: true,
  },
  {
    name: 'khóamàn hình',
    key: 'screen-lock',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-screen-lock/index.vue'),
    ),
    enabled: true,
  },
  {
    name: 'tròngàysổdiện',
    key: 'chat-window',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-chat-window/index.vue'),
    ),
    enabled: true,
  },
  {
    name: 'lễhoaHiệu quả',
    key: 'fireworks-effect',
    component: defineAsyncComponent(
      () => import('@/components/core/layouts/art-fireworks-effect/index.vue'),
    ),
    enabled: true,
  },
  {
    name: 'WatermarkHiệu quả',
    key: 'watermark',
    component: defineAsyncComponent(
      () => import('@/components/core/others/art-watermark/index.vue'),
    ),
    enabled: true,
  },
]

export interface GlobalComponentConfig {
  name: string

  key: string

  component: any

  enabled?: boolean

  description?: string
}

export const getEnabledGlobalComponents = () => {
  return globalComponentsConfig.filter((config) => config.enabled !== false)
}

export const getGlobalComponentByKey = (key: string) => {
  return globalComponentsConfig.find((config) => config.key === key)
}
