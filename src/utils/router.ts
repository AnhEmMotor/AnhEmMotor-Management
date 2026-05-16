/**
 * RoutingCông cụHàm
 *
 * gợicungRoutingđóngcủaCông cụHàm
 *
 * @module utils/router
 */
import { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import AppConfig from '@/config'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import i18n, { $t } from '@/i18n'

/** mởtriểncủaRoutingCauHinhloạikiểu */
export type AppRouteRecordRaw = RouteRecordRaw & {
  hidden?: boolean
}

/** Phía trênThanh tiến trìnhCauHinh */
export const configureNProgress = () => {
  NProgress.configure({
    easing: 'ease',
    speed: 300,
    showSpinner: false,
    parent: 'body'
  })
}

/**
 * CaiDattrangmặtTieuDe，liệuRoutingnguyênThongTinvàHeThongThongTinghéptiếpTieuDe
 * @param to khitrướcRoutingDoiTuong
 */
export const setPageTitle = (to: RouteLocationNormalized): void => {
  const { title } = to.meta
  if (title) {
    document.title = `${formatMenuTitle(String(title))} - ${AppConfig.systemInfo.name}`
  }
}

/**
 * cáchkiểuhóaMenuTieuDe
 * @param title MenuTieuDe，Có thểlấylà i18n của key，cũngCó thểlấylàChuỗi
 * @returns cáchkiểuhóasaucủaMenuTieuDe
 */
export const formatMenuTitle = (title: string): string => {
  if (title) {
    if (title.startsWith('menus.')) {
      // khiếndùng te() PhuongThucTìmphiêndịchphímgiá trịlàphủtồntại，tránhmiễnBangDieuKhienCanhBao
      if (i18n.global.te(title)) {
        return $t(title)
      } else {
        // nếuquảphiêndịchKhôngtồntại，Quay lạiphímgiá trịcủanhấtsaubộphầnlàmvìfallback
        return title.split('.').pop() || title
      }
    }
    return title
  }
  return ''
}
