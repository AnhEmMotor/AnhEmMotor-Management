<template>
  <div class="w-full py-2">
    <div class="mb-6">
      <h2 class="m-0 mb-2 text-xl font-medium">{{
        $t('menus.examples.permission.pageVisibility')
      }}</h2>
      <p class="m-0 text-sm leading-[1.6] text-g-700"
        >{{ $t('admin.t85')
        }}<strong class="font-semibold text-warning">{{ $t('admin.t86') }}</strong
        >{{ $t('admin.t87') }}</p
      >
    </div>

    <div class="mb-6">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-c gap-2 font-semibold">
            <span>{{ $t('admin.t88') }}</span>
          </div>
        </template>
        <div>
          <div class="flex-c gap-5">
            <div>
              <h3 class="m-0 mb-2 text-lg font-semibold">bạnômcóTruy cậpnàytrangmặtcủaQuyenHan</h3>
              <p class="my-1 text-sm text-g-700">
                khitrướcNguoiDung：<strong class="font-semibold">{{ currentUser.userName }}</strong>
              </p>
              <p class="my-1 text-sm text-g-700">
                NguoiDungVaiTro：
                <ElTag type="warning">{{ getRoleDisplayName(currentUser.roles?.[0] || '') }}</ElTag>
              </p>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <div class="mb-6 last:mb-0">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-c font-semibold">
            <span>trangmặtcấpQuyenHankhốngchếMô tả</span>
          </div>
        </template>
        <div>
          <ElTimeline>
            <ElTimelineItem timestamp="trướcđầukhốngchếmôkiểu" type="primary" size="large">
              <ElCard>
                <h4 class="m-0 mb-2 text-base font-semibold">ởVaiTrocủaQuyenHankhốngchế</h4>
                <p class="m-0 mb-2 leading-[1.6] text-g-700">
                  tạitrướcđầukhốngchếmôkiểudưới，trangmặtTruy cậpQuyenHandoRoutingCauHinhvănphần
                  tửtrongcủa
                  <code class="px-1.5 py-0.5 font-mono text-xs text-theme bg-theme/12 rounded"
                    >meta.roles</code
                  >
                  chữđoạnĐịnh nghĩa，trướcđầusẽliệuNguoiDungGiao diện
                  (Interface)nênômcócủaVaiTrođốiRoutingvàMenuvàodòngqualọcvớikhốngchế
                </p>
                <pre
                  class="p-4 mt-3 mb-0 overflow-x-auto font-mono text-xs leading-[1.5] bg-g-200 border-full-d rounded-md"
                ><code class="">{
  path: 'page-visibility',
  name: 'PermissionPageVisibility',
  component: '/examples/permission/page-visibility',
  meta: {
    title: 'menus.permission.pageVisibility',
    roles: ['R_SUPER'],
    keepAlive: true
  }
}</code></pre>
                <p class="m-0 mb-2 leading-[1.6] text-g-700"
                  ><strong>QuyenHannghiệmtínhchuyểntrình：</strong></p
                >
                <ul class="pl-5 my-2">
                  <li class="my-1 leading-[1.5] text-g-700"
                    >NguoiDungĐăng nhậpsau，Giao diện (Interface)Quay
                    lạiNguoiDungVaiTroThongTin（nếu R_SUPER、R_ADMIN、R_USER）</li
                  >
                  <li class="my-1 leading-[1.5] text-g-700">
                    tại
                    <code class="px-1.5 py-0.5 font-mono text-xs text-theme bg-theme/12 rounded"
                      >beforeEach</code
                    >
                    RoutinggiữvệtrongTìmmụctiêuRoutingcủa
                    <code class="px-1.5 py-0.5 font-mono text-xs text-theme bg-theme/12 rounded"
                      >roles</code
                    >
                    CauHinh
                  </li>
                  <li class="my-1 leading-[1.5] text-g-700"
                    >so sánhsoNguoiDungVaiTrolàphủBao gồmtạicho phéphứaTruy cậpcủaVaiTroDanh
                    sáchtrong</li
                  >
                  <li class="my-1 leading-[1.5] text-g-700"
                    >QuyenHanKhôngđủgiờnhảychuyểnđến 403 Không đủ quyền Không đủ quyền Không đủ
                    quyền Không đủ quyền Không đủ quyền trangmặt</li
                  >
                </ul>
              </ElCard>
            </ElTimelineItem>

            <ElTimelineItem timestamp="sauđầukhốngchếmôkiểu" type="warning" size="large">
              <ElCard>
                <h4 class="m-0 mb-2 text-base font-semibold"
                  >ởMenuGiao diện (Interface)củaQuyenHankhốngchế</h4
                >
                <p class="m-0 mb-2 leading-[1.6] text-g-700"
                  >tạisauđầukhốngchếmôkiểudưới，trangmặtTruy cậpQuyenHandosauđầuthốngmộtQuản
                  lý，trướcđầuthông quagiảiphânsauđầuGiao diện (Interface)Quay lạicủaMenuDanh
                  sáchđếnsinhthànhCó thểTruy cậpcủaRouting，từmàthựchiệnQuyenHankhốngchế</p
                >
                <p class="m-0 mb-2 leading-[1.6] text-g-700"
                  >Giao diện (Interface)DiaChi：src/api/menuApi.ts getMenuList</p
                >
                <pre
                  class="p-4 mt-3 mb-0 overflow-x-auto font-mono text-xs leading-[1.5] bg-g-200 border-full-d rounded-md"
                ><code class="">
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "path": "/permission",
      "name": "Permission",
      "component": "Layout",
      "meta": {
        "title": "menus.permission.title",
        "icon": ""
      },
      "children": [
        {
          "id": 11,
          "path": "page-visibility",
          "name": "PermissionPageVisibility",
          "component": "permission/page-visibility/index",
          "meta": {
            "title": "menus.permission.pageVisibility",
            "keepAlive": true
          }
        }
      ]
    }
  ]
}</code></pre>
                <p><strong>QuyenHannghiệmtínhchuyểntrình：</strong></p>
                <ul>
                  <li>NguoiDungĐăng nhậpThanhCongsauLấy Token</li>
                  <li
                    >trướcđầuđiềudùngMenuGiao diện (Interface)LấyNguoiDungCó thểTruy cậpcủaMenuDanh
                    sách</li
                  >
                  <li>trướcđầuliệuMenuDanh sáchHoạt độngDangKyRouting</li>
                  <li
                    >MenutrongtồntạicủatrangmặtNguoiDungCó thểlấyBình thườngTruy
                    cập，Khôngtồntạicủatrangmặtsẽnhảychuyểnđến 404 Không tìm thấy Không tìm thấy
                    Không tìm thấy Không tìm thấy Không tìm thấy</li
                  >
                </ul>
              </ElCard>
            </ElTimelineItem>

            <ElTimelineItem timestamp="MenuHiển thịkhốngchế" type="success" size="large">
              <ElCard>
                <h4>Thanh bênMenuHiển thịtính</h4>
                <p><strong>trướcđầukhốngchếmôkiểu：</strong></p>
                <ul>
                  <li>cóQuyenHancủaNguoiDung：MenumụcBình thườngHiển thị，Có thểlấyNhấnTruy cập</li>
                  <li
                    >vôQuyenHancủaNguoiDung：MenumụcKhôngHiển thị，vôphápthông quaMenuĐiều
                    hướngđếntrangmặt</li
                  >
                  <li
                    >làkhiếnthông quathẳngtiếpNhậpURLthửthửTruy cập，cũngsẽbịRoutinggiữvệchặncắt</li
                  >
                </ul>
                <p><strong>sauđầukhốngchếmôkiểu：</strong></p>
                <ul>
                  <li>Thanh bênMenuliệusauđầuQuay lạicủaMenuDanh sáchvàodòngRender</li>
                  <li
                    >sauđầuứngnênliệuNguoiDungQuyenHanqualọc，chỉQuay lạiNguoiDungcóQuyenHanTruy
                    cậpcủaMenumục</li
                  >
                  <li
                    >trướcđầuchỉHiển thịsauđầuQuay lạicủaMenu，Đảm bảoNguoiDungchỉnăngxemđếnvàTruy
                    cậpcóQuyenHancủatrangmặt</li
                  >
                </ul>
              </ElCard>
            </ElTimelineItem>
          </ElTimeline>
        </div>
      </ElCard>
    </div>

    <div class="best-practices">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="card-header">
            <span>QuyenHankhốngchếnhấttốtthựcthực</span>
          </div>
        </template>
        <div class="practices-content">
          <ElRow :gutter="24">
            <ElCol :span="12" class="!mb-5">
              <div class="flex-c">
                <div class="size-10 bg-g-200 flex-cc rounded mr-2">
                  <ElIcon size="20" color="#409EFF"><Lock /></ElIcon>
                </div>
                <div>
                  <h4>đatầngQuyenHannghiệmtính</h4>
                  <p class="text-g-700 text-sm"
                    >tạitrướcđầuRouting、sauđầuGiao diện
                    (Interface)、UIComponentbằngđachiếctầngmặtthựcthiQuyenHankhốngchế，Đảm
                    bảoantoàntính。</p
                  >
                </div>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="flex-c">
                <div class="size-10 bg-g-200 flex-cc rounded mr-2">
                  <ElIcon size="20" color="#67C23A"><User /></ElIcon>
                </div>
                <div>
                  <h4>ởVaiTrocủaTruy cậpkhốngchế</h4>
                  <p class="text-g-700 text-sm"
                    >thudùngRBACmôkiểu，thông quaVaiTrophầnPhânQuyenHan，rúthóaQuyenHanQuản
                    lýphụctạpđộ。</p
                  >
                </div>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="flex-c">
                <div class="size-10 bg-g-200 flex-cc rounded mr-2">
                  <ElIcon size="20" color="#E6A23C"><Key /></ElIcon>
                </div>
                <div>
                  <h4>chi tiếthạtđộQuyenHankhốngchế</h4>
                  <p class="text-g-700 text-sm"
                    >chiếctrìtrangmặtcấp、Nútcấp、Dữ liệucấpbằngđaloạihạtđộcủaQuyenHankhốngchế。</p
                  >
                </div>
              </div>
            </ElCol>
            <ElCol :span="12">
              <div class="flex-c">
                <div class="size-10 bg-g-200 flex-cc rounded mr-2">
                  <ElIcon size="20" color="#F56C6C"><View /></ElIcon>
                </div>
                <div>
                  <h4>antoàntínhTốinguyên</h4>
                  <p class="text-g-700 text-sm"
                    >đầucuốituântuầnnhấttiểuQuyenHannguyên，Đảm bảoNguoiDungchỉnăngTruy
                    cậptấtcầncủacôngnăngvàDữ liệu。</p
                  >
                </div>
              </div>
            </ElCol>
          </ElRow>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  import { Lock, User, Key, View } from '@element-plus/icons-vue'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'PermissionPageVisibility' })

  const userStore = useUserStore()

  const currentUser = computed(() => userStore.info)

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      R_SUPER: 'siêucấpQuản lýviên',
      R_ADMIN: 'Quản lýviên',
      R_USER: 'phổthôngNguoiDung'
    }
    return roleMap[role] || 'ChưabáoVaiTro'
  }
</script>
