/**
 * v-auth QuyenHanlệnh
 *
 * thíchdùngởsauđầuQuyenHankhốngchếmôkiểu，ởQuyenHantiêukhốngchế DOM nguyêntốcủaHiển thịvàẨn。
 * nếuquảNguoiDungkhôngcóđốiứngQuyenHan，nguyêntốtươngtừ DOM trongDichia。
 *
 * ## chủcầncôngnăng
 *
 * - QuyenHannghiệmtính - liệuRouting meta trongcủaQuyenHanDanh sáchnghiệmtínhNguoiDungQuyenHan
 * - DOM khốngchế - vôQuyenHangiờtừđộngDichianguyêntố，màphiẨn
 * - ứngkiểuCập nhật - QuyenHanbiếnhóagiờtừđộngCập nhậtnguyêntốTrạng thái
 *
 * ## Ví dụ sử dụng
 *
 * ```vue
 * <!-- chỉcóômcó 'add' QuyenHancủaNguoiDungmớinăngxemđếnThêm mớiNút -->
 * <el-button v-auth="'add'">mớiThêm</el-button>
 *
 * <!-- chỉcóômcó 'edit' QuyenHancủaNguoiDungmớinăngxemđếnChỉnh sửaNút -->
 * <el-button v-auth="'edit'">Chỉnh sửa</el-button>
 *
 * <!-- chỉcóômcó 'delete' QuyenHancủaNguoiDungmớinăngxemđếnXóaNút -->
 * <el-button v-auth="'delete'">Xóa</el-button>
 * ```
 *
 * ## tâmýviệcmục
 *
 * - nênlệnhsẽthẳngtiếpDichia DOM nguyêntố，màKhônglàkhiếndùng v-if Ẩn
 * - QuyenHanDanh sáchtừkhitrướcRoutingcủa meta.authList trongLấy
 *
 * @module directives/auth
 * @author Art Design Pro Team
 */

import { router } from '@/router'
import { App, Directive, DirectiveBinding } from 'vue'

export type AuthDirective = Directive<HTMLElement, string>

function checkAuthPermission(el: HTMLElement, binding: DirectiveBinding<string>): void {
  // LấykhitrướcRoutingcủaQuyenHanDanh sách
  const authList = (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []

  // TìmlàphủcóđốiứngcủaQuyenHantiêu
  const hasPermission = authList.some((item) => item.authMark === binding.value)

  // nếuquảkhôngcóQuyenHan，Dichianguyêntố
  if (!hasPermission) {
    removeElement(el)
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const authDirective: AuthDirective = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}
