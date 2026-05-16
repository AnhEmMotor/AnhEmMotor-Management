/**
 * Điều hướngnhảychuyểnCông cụmôkhối
 *
 * gợicungthốngmộtcủatrangmặtnhảychuyểnvàĐiều hướngcôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - ngoàibộliêntiếpmởmở（mớisổdiện）
 * - MenumụcnhảychuyểnXuLy（chiếctrìtrongbộRoutingvàngoàibộliêntiếp）
 * - iframe trangmặtnhảychuyểnchiếctrì
 * - chuyểnvềTimKiemđồng thờinhảychuyểnđếnthứmộtchiếcHiển thịcủatửMenu
 * - trínăngđoánnhảychuyểnmụctiêuLớpkiểu（ngoàibộliêntiếp/trongbộRouting）
 *
 * @module utils/navigation/jump
 * @author Art Design Pro Team
 */
import { AppRouteRecord } from '@/types/router'
import { router } from '@/router'
import { isNavigableMenuItem } from './route'

// mởmởngoàibộliêntiếp
export const openExternalLink = (link: string) => {
  window.open(link, '_blank')
}

/**
 * Menunhảychuyển
 * @param item Menumục
 * @param jumpToFirst làphủnhảychuyểnđếnthứmộtchiếctửMenu
 * @returns
 */
export const handleMenuJump = (item: AppRouteRecord, jumpToFirst: boolean = false) => {
  // XuLyngoàibộliêntiếp
  const { link, isIframe } = item.meta
  if (link && !isIframe) {
    return openExternalLink(link)
  }

  // nếuquảKhôngcầncầnnhảychuyểnđếnthứmộtchiếctửMenu，hoặckhôngcótửMenu，thẳngtiếpnhảychuyểnkhitrướcđường
  if (!jumpToFirst || !item.children?.length) {
    return router.push(item.path)
  }

  // chuyểnvềTimKiemthứmộtchiếcCó thểĐiều hướngcủadiệptửtiếtđiểmMenu
  const findFirstLeafMenu = (items: AppRouteRecord[]): AppRouteRecord | undefined => {
    for (const child of items) {
      if (isNavigableMenuItem(child)) {
        return child.children?.length ? findFirstLeafMenu(child.children) || child : child
      }
    }
    return undefined
  }

  const firstChild = findFirstLeafMenu(item.children)

  // nếuquảtửMenuđềuKhôngHiển thị，vềlùiđếnchacấptrangmặttừthân。
  if (!firstChild) {
    return router.push(item.path)
  }

  // nếuquảthứmộtchiếctửMenulàngoàibộliêntiếpmởmởmớisổdiện
  if (firstChild.meta?.link) {
    return openExternalLink(firstChild.meta.link)
  }

  // nhảychuyểnđếntửMenuđường
  router.push(firstChild.path)
}
