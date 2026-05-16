/**
 * v-ripple sóngvânHiệu quảlệnh
 *
 * vìnguyêntốThêm mới Material Design Phong cáchcủasóngvânNhấnHiệu quả。
 * NhấngiờtừNhấnViTrimởrahìnhsóngvânHoatAnh，gợilênnộpthểnghiệm。
 *
 * ## chủcầncôngnăng
 *
 * - sóngvânHoatAnh - NhấngiờtừNhấnViTrimởhìnhsóngvân
 * - từthíchứngKích thước - liệunguyêntốthướctấctừđộngđiềuchỉnhsóngvânKích thướcvàHoatAnhgiờtrường
 * - trínăngPhânmàu - từđộngtínhNútloạikiểu，khiếndùnghợpthíchcủasóngvânMàu sắc
 * - Màu sắc tùy chỉnh - chiếctrìthông quaTham sốTùy chỉnhsóngvânMàu sắc
 * - tínhnăngTốihóa - khiếndùng requestAnimationFrame vàtừđộngxóalýmáychế
 *
 * ## Ví dụ sử dụng
 *
 * ```vue
 * <template>
 *   <!-- Cơ bảndùngpháp - khiếndùngMacDinhMàu sắc -->
 *   <el-button v-ripple>{{ $t('admin.t15') }}</el-button>
 *
 *   <!-- Màu sắc tùy chỉnh -->
 *   <el-button v-ripple="{ color: 'rgba(255, 0, 0, 0.3)' }">{{ $t('admin.t16') }}</el-button>
 *
 *   <!-- Ứng dụngđếnnhiệmýnguyêntố -->
 *   <div v-ripple class="custom-card">{{ $t('admin.t17') }}</div>
 * </template>
 * ```
 *
 * ## Màu sắcquy
 *
 * - cómàuNút（primary、success、warning bằng）：khiếndùngtrắngmàunửathấuminhsóngvân
 * - MacDinhNút：khiếndùngChuDemàunửathấuminhsóngvân
 * - Tùy chỉnh：thông qua color Tham sốđịnhnhiệmýMàu sắc
 *
 * @module directives/ripple
 * @author Art Design Pro Team
 */

import type { App, Directive, DirectiveBinding } from 'vue'

export interface RippleOptions {
  /** sóngvânMàu sắc */
  color?: string
}

export type RippleDirective = Directive<HTMLElement, RippleOptions>

export const vRipple: RippleDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // LấylệnhcủaCauHinhTham số
    const options: RippleOptions = binding.value || {}

    // CaiDatnguyêntốvìđốiđịnhvị，đồng thờiẨntrànrabộphần
    el.style.position = 'relative'
    el.style.overflow = 'hidden'

    // NhấnSuKienXuLy
    el.addEventListener('mousedown', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const left = e.clientX - rect.left
      const top = e.clientY - rect.top

      // xâysóngvânnguyêntố
      const ripple = document.createElement('div')
      const diameter = Math.max(el.clientWidth, el.clientHeight)
      const radius = diameter / 2

      // liệuthẳngkếHoatAnhThoiGian（thẳngvượtđại，HoatAnhThoiGianvượttrường）
      const baseTime = 600 // Cơ bảnHoatAnhThoiGian（milligiây）
      const scaleFactor = 0.5 // Thu phóngvìtử
      const animationDuration = baseTime + diameter * scaleFactor

      // CaiDatsóngvâncủathướctấcvàViTri
      ripple.style.width = ripple.style.height = `${diameter}px`
      ripple.style.left = `${left - radius}px`
      ripple.style.top = `${top - radius}px`
      ripple.style.position = 'absolute'
      ripple.style.borderRadius = '50%'
      ripple.style.pointerEvents = 'none'

      // đoánlàphủvìcómàuNút（Element Plus Nútloạikiểu）
      const buttonTypes = ['primary', 'info', 'warning', 'danger', 'success'].map(
        (type) => `el-button--${type}`
      )
      const isColoredButton = buttonTypes.some((type) => el.classList.contains(type))
      const defaultColor = isColoredButton
        ? 'rgba(255, 255, 255, 0.25)' // cómàuNútkhiếndùngtrắngmàusóngvân
        : 'var(--el-color-primary-light-7)' // MacDinhNútkhiếndùngChuDemàusóngvân

      // CaiDatsóngvânMàu sắc、ban đầuđầuTrạng tháivàquađộHiệu quả
      ripple.style.backgroundColor = options.color || defaultColor
      ripple.style.transform = 'scale(0)'
      ripple.style.transition = `transform ${animationDuration}ms cubic-bezier(0.3, 0, 0.2, 1), opacity ${animationDuration}ms cubic-bezier(0.3, 0, 0.5, 1)`
      ripple.style.zIndex = '1'

      // Thêm mớisóngvânnguyêntốđếnDOMtrong
      el.appendChild(ripple)

      // Kích hoạtHoatAnh
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2)'
        ripple.style.opacity = '0'
      })

      // HoatAnhKếtthúcsauDichiasóngvânnguyêntố
      setTimeout(() => {
        ripple.remove()
      }, animationDuration + 500) // Thêmthêm500msBộxungThoiGian
    })
  }
}

export function setupRippleDirective(app: App) {
  app.directive('ripple', vRipple)
}
