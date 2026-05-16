<!-- NútQuyenHanVí dụtrangmặt -->
<template>
  <div class="w-full py-2">
    <!-- trangmặtđầubộ -->
    <div class="mb-6">
      <h2 class="m-0 mb-2 text-xl font-medium">{{ $t('menus.examples.permission.buttonAuth') }}</h2>
      <p class="m-0 text-sm leading-[1.6] text-g-700">{{ $t('admin.t83') }}</p>
    </div>

    <div class="mb-6">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-cb font-semibold">
            <span class="flex-1">{{ $t('admin.t84') }}</span>
          </div>
        </template>
        <div>
          <div class="flex items-start mb-4 last:mb-0">
            <span class="min-w-20 font-semibold">NguoiDungVaiTro：</span>
            <ElTag :type="getRoleTagType(currentUserRole)">
              {{ getRoleDisplayName(currentUserRole) }}
            </ElTag>
          </div>
          <div class="flex items-start mb-4 last:mb-0">
            <span class="min-w-20 font-semibold">QuyenHanmã：</span>
            <div class="flex flex-wrap gap-2">
              <ElTag
                v-for="permission in currentUserPermissions"
                :key="permission"
                size="small"
                type="info"
                class="m-0"
              >
                {{ permission }}
              </ElTag>
              <span v-if="!currentUserPermissions.length" class="italic text-red-500"
                >vôQuyenHanmã</span
              >
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- ởVaiTrocủaQuyenHankhốngchếdiễnthị -->
    <div class="mb-6 last:mb-0">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-cb font-semibold">
            <span class="flex-1">ởVaiTrocủaQuyenHankhốngchế（v-roles lệnh）</span>
          </div>
        </template>
        <div>
          <p class="p-3 m-0 mb-5 text-sm leading-[1.6] text-g-700 bg-g-200 rounded">
            khiếndùng
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >v-roles</code
            >
            lệnhNút điều khiểnHiển thị，chỉcóômcóđịnhVaiTrocủaNguoiDungmớinăngxemđếnđốiứngNút。
          </p>

          <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            <div class="flex flex-col gap-2">
              <ElButton type="primary" plain v-roles="'R_SUPER'">
                siêucấpQuản lýviênHiển thị
              </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-roles="'R_SUPER'"</code
                >
                <span class="text-g-700">chỉcósiêucấpQuản lýviênHiển thị</span>
              </div>
            </div>

            <!-- Quản lýviêncấptínhNút -->
            <div class="flex flex-col gap-2">
              <ElButton type="warning" plain v-roles="['R_SUPER', 'R_ADMIN']">
                Quản lýviênHiển thị
              </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-roles="['R_SUPER', 'R_ADMIN']"</code
                >
                <span class="text-g-700">siêucấpQuản lýviênvàQuản lýviênHiển thị</span>
              </div>
            </div>

            <!-- nêncóĐãDangNhapNguoiDungHiển thị -->
            <div class="flex flex-col gap-2">
              <ElButton type="success" plain v-roles="['R_SUPER', 'R_ADMIN', 'R_USER']">
                nêncóNguoiDungHiển thị
              </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-roles="['R_SUPER', 'R_ADMIN', 'R_USER']"</code
                >
                <span class="text-g-700">nêncóĐãDangNhapNguoiDungHiển thị</span>
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- sauđầumôkiểu：ởRoutingQuyenHanCauHinhcủakhốngchếdiễnthị -->
    <div class="mb-6 last:mb-0">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-cb font-semibold">
            <span class="flex-1">sauđầumôkiểuQuyenHankhốngchế（v-auth lệnh）</span>
            <ElTag v-if="!isFrontendMode" type="success" size="small">khitrướcmôkiểu</ElTag>
            <ElTag v-else type="info" size="small">phikhitrướcmôkiểu</ElTag>
          </div>
        </template>
        <div>
          <p class="p-3 m-0 mb-5 text-sm leading-[1.6] text-g-700 bg-g-200 rounded">
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >v-auth</code
            >
            lệnhtạisauđầumôkiểudướiliệukhitrướcRoutingcủa
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >meta.authList</code
            >
            CauHinhTìmQuyenHan。 QuyenHanDanh sáchđếnnguồnởRoutingnguyênDữ
            liệu，thíchdùngởQuyenHanCauHinhdosauđầuthốngmộtQuản lýcủatrườngcảnh。
          </p>

          <div class="mb-5">
            <h4 class="m-0 mb-2 text-sm font-semibold"> khitrướcRoutingQuyenHanCauHinh： </h4>
            <div
              class="max-h-30 p-3 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap bg-g-200 border-full-d rounded"
            >
              <code>{{ JSON.stringify(backendAuthList, null, 2) }}</code>
            </div>
          </div>

          <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            <!-- Thêm mớiQuyenHan -->
            <div class="flex flex-col gap-2">
              <ElButton type="primary" plain v-auth="'add'"> Thêm mới </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-auth="'add'"</code
                >
                <span class="text-g-700"
                  >TìmRouting meta.authList tronglàphủtồntại authMark: 'add'</span
                >
              </div>
            </div>

            <!-- Chỉnh sửaQuyenHan -->
            <div class="flex flex-col gap-2">
              <ElButton type="warning" plain v-auth="'edit'"> Chỉnh sửa </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-auth="'edit'"</code
                >
                <span class="text-g-700"
                  >TìmRouting meta.authList tronglàphủtồntại authMark: 'edit'</span
                >
              </div>
            </div>

            <!-- XóaQuyenHan -->
            <div class="flex flex-col gap-2">
              <ElButton type="danger" plain v-auth="'delete'"> Xóa </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-auth="'delete'"</code
                >
                <span class="text-g-700"
                  >TìmRouting meta.authList tronglàphủtồntại authMark: 'delete'</span
                >
              </div>
            </div>

            <!-- Xuất fileQuyenHan -->
            <div class="flex flex-col gap-2">
              <ElButton type="info" plain v-auth="'export'"> Xuất file </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-auth="'export'"</code
                >
                <span class="text-g-700"
                  >TìmRouting meta.authList tronglàphủtồntại authMark: 'export'</span
                >
              </div>
            </div>
          </div>

          <div class="mt-4">
            <ElAlert
              :type="isFrontendMode ? 'warning' : 'success'"
              :title="
                isFrontendMode
                  ? 'tâmý：khitrướcvìtrướcđầumôkiểu，v-auth lệnhtạisauđầumôkiểudướimớisinhhiệu'
                  : 'khitrướcvìsauđầumôkiểu，v-auth lệnhBình thườngcônglàm'
              "
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </ElCard>
    </div>

    <!-- trướcđầumôkiểu：biêntrìnhkiểuQuyenHankhốngchếdiễnthị -->
    <div class="mb-6 last:mb-0">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-cb font-semibold">
            <span class="flex-1">trướcđầumôkiểuQuyenHankhốngchế（hasAuth PhuongThuc）</span>
            <ElTag v-if="isFrontendMode" type="success" size="small">khitrướcmôkiểu</ElTag>
            <ElTag v-else type="info" size="small">phikhitrướcmôkiểu</ElTag>
          </div>
        </template>
        <div>
          <p class="p-3 m-0 mb-5 text-sm leading-[1.6] text-g-700 bg-g-200 rounded">
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >hasAuth</code
            >
            PhuongThuctạitrướcđầumôkiểudướiliệuNguoiDungThongTintrongcủa
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >buttons</code
            >
            chữđoạnTìmQuyenHan。 QuyenHanDanh sáchtồntrữtạiNguoiDungTrạng
            tháitrong，thíchdùngởQuyenHanhoàntoàndotrướcđầuQuản lýcủatrườngcảnh。
          </p>

          <div class="mb-5">
            <h4 class="m-0 mb-2 text-sm font-semibold"
              >khitrướcNguoiDungQuyenHanDanh sách（buttons chữđoạn）：</h4
            >
            <div
              class="max-h-30 p-3 overflow-y-auto font-mono text-xs break-all whitespace-pre-wrap bg-g-200 border-full-d rounded"
            >
              <code>{{ JSON.stringify(frontendAuthList, null, 2) }}</code>
            </div>
          </div>

          <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            <!-- điềuphần tửRenderNút -->
            <div class="flex flex-col gap-2">
              <ElButton v-if="hasAuth('view')" type="primary"> XemChiTiet </ElButton>
              <ElButton v-else type="info" disabled> vôXemQuyenHan </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-if="hasAuth('view')"</code
                >
                <span class="text-g-700">TìmNguoiDung buttons MảnglàphủBao gồm 'view'</span>
              </div>
            </div>

            <!-- Hoạt độngNútTrạng thái -->
            <div class="flex flex-col gap-2">
              <ElButton
                :disabled="!hasAuth('publish')"
                :type="hasAuth('publish') ? 'success' : 'info'"
                @click="handlePublish"
              >
                {{ hasAuth('publish') ? 'Đăng tải' : 'vôĐăng tảiQuyenHan' }}
              </ElButton>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >:disabled="!hasAuth('publish')"</code
                >
                <span class="text-g-700">TìmNguoiDung buttons MảnglàphủBao gồm 'publish'</span>
              </div>
            </div>

            <!-- lôlượngHanhDongNút -->
            <div class="flex flex-col gap-2">
              <ElDropdown @command="handleBatchAction" :disabled="!hasBatchPermissions">
                <ElButton :type="hasBatchPermissions ? 'warning' : 'info'">
                  lôlượngHanhDong
                  <ElIcon class="el-icon--right">
                    <ArrowDown />
                  </ElIcon>
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="batchEdit" :disabled="!hasAuth('edit')">
                      lôlượngChỉnh sửa
                    </ElDropdownItem>
                    <ElDropdownItem command="batchDelete" :disabled="!hasAuth('delete')">
                      lôlượngXóa
                    </ElDropdownItem>
                    <ElDropdownItem command="batchExport" :disabled="!hasAuth('export')">
                      lôlượngXuất file
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >computed(() => hasAuth('edit') || hasAuth('delete'))</code
                >
                <span class="text-g-700"
                  >phụchợpQuyenHanTìm，TìmđachiếcQuyenHancủađồng thờitập</span
                >
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- sauđầumôkiểu：biêntrìnhkiểuQuyenHankhốngchếdiễnthị -->
    <div class="mb-6 last:mb-0">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-cb font-semibold">
            <span class="flex-1">sauđầumôkiểuQuyenHankhốngchế（hasAuth PhuongThuc）</span>
            <ElTag v-if="!isFrontendMode" type="success" size="small">khitrướcmôkiểu</ElTag>
            <ElTag v-else type="info" size="small">phikhitrướcmôkiểu</ElTag>
          </div>
        </template>
        <div>
          <p class="p-3 m-0 mb-5 text-sm leading-[1.6] text-g-700 bg-g-200 rounded">
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >hasAuth</code
            >
            PhuongThuctạisauđầumôkiểudướiliệukhitrướcRoutingcủa
            <code class="px- 1.5 py-0.5 font-mono text-xs text-theme bg-theme/10 rounded"
              >meta.authList</code
            >
            CauHinhTìmQuyenHan。với v-auth
            lệnhkhiếndùngcùngcủaQuyenHanđếnnguồn，nhưnggợicungbiêntrìnhkiểucủaQuyenHanTìmnănglực。
          </p>

          <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            <!-- Hoạt độngcôngnăngChuyển đổi -->
            <div class="flex flex-col gap-2">
              <ElSwitch
                v-model="dynamicFeatureEnabled"
                :disabled="!hasAuth('config')"
                active-text="côngnăngmởbật"
                inactive-text="côngnăngđóngđóng"
              />
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >:disabled="!hasAuth('config')"</code
                >
                <span class="text-g-700">TìmRoutingQuyenHankhốngchếcôngnăngCông tắc</span>
              </div>
            </div>

            <!-- điềuphần tửHiển thịHanhDongđồngTên -->
            <div class="flex flex-col gap-2">
              <div v-if="hasAuth('manage')" class="flex gap-2 p-3 bg-g-200 border-full-d rounded">
                <ElButton type="primary" size="small">Quản lýHanhDong</ElButton>
                <ElButton type="warning" size="small">Nâng caoCaiDat</ElButton>
              </div>
              <div
                v-else
                class="flex-c gap-2 p-3 text-g-500 bg-g-200 border border-dashed border-g-400 rounded"
              >
                <ElIcon><Lock /></ElIcon>
                <span class="text-sm">cầncầnQuản lýQuyenHanmớinăngXemnàyđồngTên</span>
              </div>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >v-if="hasAuth('manage')"</code
                >
                <span class="text-g-700">ởsauđầuRoutingQuyenHancủađiềuphần tửRender</span>
              </div>
            </div>

            <!-- QuyenHanTrạng tháithịthiết bị -->
            <div class="flex flex-col gap-2">
              <div class="flex flex-wrap gap-3">
                <ElBadge
                  :value="hasAuth('add') ? '✓' : '✗'"
                  :type="hasAuth('add') ? 'success' : 'danger'"
                >
                  <ElButton size="small">Thêm mớiQuyenHan</ElButton>
                </ElBadge>
                <ElBadge
                  :value="hasAuth('edit') ? '✓' : '✗'"
                  :type="hasAuth('edit') ? 'success' : 'danger'"
                >
                  <ElButton size="small">Chỉnh sửaQuyenHan</ElButton>
                </ElBadge>
                <ElBadge
                  :value="hasAuth('delete') ? '✓' : '✗'"
                  :type="hasAuth('delete') ? 'success' : 'danger'"
                >
                  <ElButton size="small">XóaQuyenHan</ElButton>
                </ElBadge>
              </div>
              <div class="text-xs">
                <code class="block p-1 px-2 mb-1 font-mono bg-g-200 border-full-d rounded"
                  >hasAuth('permission')</code
                >
                <span class="text-g-700">thựcgiờQuyenHanTrạng tháithịthiết bị</span>
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- QuyenHanmôkiểuđốiso sánhMô tả -->
    <div class="mb-6 last:mb-0">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="flex-cb font-semibold">
            <span class="flex-1">QuyenHankhốngchếmôkiểuđốiso sánh</span>
          </div>
        </template>
        <div>
          <div class="mt-4">
            <ElTable :data="comparisonData" border>
              <ElTableColumn prop="feature" label="côngnăngđặctính" width="150" />
              <ElTableColumn prop="frontend" label="trướcđầumôkiểu" />
              <ElTableColumn prop="backend" label="sauđầumôkiểu" />
            </ElTable>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { ArrowDown, Lock } from '@element-plus/icons-vue'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useUserStore } from '@/store/modules/user'
  import { useAppMode } from '@/hooks/core/useAppMode'
  import { useRoute } from 'vue-router'
  import type { AppRouteRecord } from '@/types/router'

  defineOptions({ name: 'PermissionButtonAuth' })

  const { hasAuth } = useAuth()
  const { isFrontendMode } = useAppMode()
  const userStore = useUserStore()
  const route = useRoute()

  // Hoạt độngcôngnăngTrạng thái
  const dynamicFeatureEnabled = ref(false)

  // khitrướcNguoiDungVaiTro
  const currentUserRole = computed(() => {
    return userStore.info?.roles?.[0] || ''
  })

  // khitrướcNguoiDungQuyenHanmã
  const currentUserPermissions = computed(() => {
    return userStore.info?.buttons || []
  })

  // trướcđầumôkiểuQuyenHanDanh sách（NguoiDungcủa buttons chữđoạn）
  const frontendAuthList = computed(() => {
    return userStore.info?.buttons || []
  })

  // sauđầumôkiểuQuyenHanDanh sách（Routing meta.authList CauHinh）
  const backendAuthList = computed(() => {
    type AuthItem = NonNullable<AppRouteRecord['meta']['authList']>[number]
    return Array.isArray(route.meta.authList) ? (route.meta.authList as AuthItem[]) : []
  })

  // làphủômcólôlượngHanhDongQuyenHan
  const hasBatchPermissions = computed(() => {
    return hasAuth('edit') || hasAuth('delete') || hasAuth('export')
  })

  // QuyenHanđốiso sánhDữ liệu
  const comparisonData = computed(() => [
    {
      feature: 'QuyenHanđếnnguồn',
      frontend: 'NguoiDungTrạng tháitrongcủa buttons chữđoạn',
      backend: 'RoutingCauHinhtrongcủa meta.authList'
    },
    {
      feature: 'v-auth lệnh',
      frontend: 'KhôngCó thểdùng（trướcđầumôkiểudướilệnhvôhiệu）',
      backend: 'Có thểdùng（liệuRoutingQuyenHanCauHinhTìm）'
    },
    {
      feature: 'hasAuth PhuongThuc',
      frontend: 'Có thểdùng（Tìm buttons Mảng）',
      backend: 'Có thểdùng（Tìm meta.authList）'
    },
    {
      feature: 'QuyenHanQuản lý',
      frontend: 'hoàntoàndotrướcđầukhốngchế，linhsốngđộcao',
      backend: 'sauđầuthốngmộtQuản lý，antoàntínhhơncao'
    },
    {
      feature: 'thíchdùngtrườngcảnh',
      frontend: 'khoáinguyênkiểu、rútđơnỨng dụng',
      backend: 'xínghiệpcấpỨng dụng、phụctạpQuyenHanthểhệ'
    }
  ])

  // LấyVaiTroTagloạikiểu
  const getRoleTagType = (role: string): 'primary' | 'success' | 'info' | 'warning' | 'danger' => {
    const roleMap: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'danger'> = {
      R_SUPER: 'warning',
      R_ADMIN: 'primary',
      R_USER: 'success'
    }
    return roleMap[role] || 'info'
  }

  // LấyVaiTroHiển thịdanhtên
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      R_SUPER: 'siêucấpQuản lýviên',
      R_ADMIN: 'Quản lýviên',
      R_USER: 'phổthôngNguoiDung'
    }
    return roleMap[role] || 'ChưabáoVaiTro'
  }

  // XuLyĐăng tảiHanhDong
  const handlePublish = () => {
    if (hasAuth('publish')) {
      ElMessage.success('Đăng tảiThanhCong！')
    } else {
      ElMessage.warning('bạnkhôngcóĐăng tảiQuyenHan')
    }
  }

  // XuLylôlượngHanhDong
  const handleBatchAction = (command: string) => {
    const actions: Record<string, string> = {
      batchEdit: 'lôlượngChỉnh sửa',
      batchDelete: 'lôlượngXóa',
      batchExport: 'lôlượngXuất file'
    }

    const permission = command.replace('batch', '').toLowerCase()

    if (hasAuth(permission)) {
      ElMessage.success(`${actions[command]}HanhDongThựcdòngThanhCong！`)
    } else {
      ElMessage.warning(`bạnkhôngcó${actions[command]}QuyenHan`)
    }
  }
</script>
