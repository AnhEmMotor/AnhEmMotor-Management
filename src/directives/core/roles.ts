/**
 * v-roles VaiTroQuyenHanlệnh
 *
 * ởNguoiDungVaiTrokhốngchế DOM nguyêntốcủaHiển thịvàẨn。
 * chỉcầnNguoiDungômcóđịnhVaiTrotrongcủanhiệmýmộtchiếc，nguyêntốthìsẽHiển thị，Nếu khôngtừ DOM trongDichia。
 *
 * ## chủcầncôngnăng
 *
 * - VaiTronghiệmtính - TìmNguoiDunglàphủômcóđịnhVaiTro
 * - đaVaiTrochiếctrì - chiếctrìđơnchiếcVaiTrohoặcđachiếcVaiTro（đầyđủnómộtlàCó thể）
 * - DOM khốngchế - vôQuyenHangiờtừđộngDichianguyêntố，màphiẨn
 * - ứngkiểuCập nhật - VaiTrobiếnhóagiờtừđộngCập nhậtnguyêntốTrạng thái
 *
 * ## Ví dụ sử dụng
 *
 * ```vue
 * <template>
 *   <!-- đơnchiếcVaiTro - chỉcósiêucấpQuản lýviênHiển thị -->
 *   <el-button v-roles="'R_SUPER'">{{ $t('admin.t18') }}</el-button>
 *
 *   <!-- đachiếcVaiTro - siêucấpQuản lýviênhoặcphổthôngQuản lýviênHiển thị -->
 *   <el-button v-roles="['R_SUPER', 'R_ADMIN']">{{ $t('admin.t19') }}</el-button>
 *
 *   <!-- Ứng dụngđếnnhiệmýnguyêntố -->
 *   <div v-roles="['R_SUPER', 'R_ADMIN', 'R_USER']">{{ $t('admin.t20') }}</div>
 * </template>
 * ```
 *
 * ## QuyenHanLogic
 *
 * - NguoiDungVaiTrotừ userStore.getUserInfo.roles Lấy
 * - chỉcầnNguoiDungômcóđịnhVaiTrotrongcủanhiệmýmộtchiếc，nguyêntốthìsẽHiển thị
 * - nếuquảNguoiDungkhôngcónhiệmnàoVaiTrohoặcKhôngđầyđủđiềuphần tử，nguyêntốtươngbịDichia
 *
 * ## tâmýviệcmục
 *
 * - nênlệnhsẽthẳngtiếpDichia DOM nguyêntố，màKhônglàkhiếndùng v-if Ẩn
 * - thíchdùngởởVaiTrocủađậmhạtđộQuyenHankhốngchế
 * - nếucầnởdụng cụthểHanhDongcủachi tiếthạtđộQuyenHankhốngchế，Vui lòngkhiếndùng v-auth lệnh
 *
 * @module directives/roles
 * @author Art Design Pro Team
 */

import { useUserStore } from '@/store/modules/user'
import { App, Directive, DirectiveBinding } from 'vue'

export type RolesDirective = Directive<HTMLElement, string | string[]>

function checkRolePermission(el: HTMLElement, binding: DirectiveBinding<string | string[]>): void {
  const userStore = useUserStore()
  const userRoles = userStore.getUserInfo.roles

  // nếuquảNguoiDungVaiTrovìkhônghoặcChưaĐịnh nghĩa，Dichianguyêntố
  if (!userRoles?.length) {
    removeElement(el)
    return
  }

  // Đảm bảolệnhgiá trịvìMảngcáchkiểu
  const requiredRoles = Array.isArray(binding.value) ? binding.value : [binding.value]

  // TìmNguoiDunglàphủdụng cụcónêncầnVaiTrocủamột
  const hasPermission = requiredRoles.some((role: string) => userRoles.includes(role))

  // nếuquảkhôngcóQuyenHan，antoànđịaDichianguyêntố
  if (!hasPermission) {
    removeElement(el)
  }
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const rolesDirective: RolesDirective = {
  mounted: checkRolePermission,
  updated: checkRolePermission
}

export function setupRolesDirective(app: App): void {
  app.directive('roles', rolesDirective)
}
