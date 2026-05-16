import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import AppConfig from '@/config'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import i18n, { $t } from '@/i18n'

export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

export const configureNProgress = () => {
  NProgress.configure({
    easing: 'ease',
    speed: 300,
    showSpinner: false,
    parent: 'body'
  })
}

export const setPageTitle = (to: RouteLocationNormalized): void => {
  const { title } = to.meta
  if (title) {
    document.title = `${formatMenuTitle(String(title))} - ${AppConfig.systemInfo.name}`
  }
}

export const formatMenuTitle = (title: string): string => {
  if (title) {
    if (title.startsWith('menus.')) {
      if (i18n.global.te(title)) {
        return $t(title)
      } else {
        return title.split('.').pop() || title
      }
    }
    return title
  }
  return ''
}
