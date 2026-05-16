<!-- Nâng caoBảngnănglựctriểnthị -->
<!-- thựctếmởpháttrongliệucầncầuChọnkhiếndùngnàovàicôngnăng，Có thểkhảocôngnăngVí dụdướimặtcủanhấttiểuhóaVí dụvàodòngmởphát -->
<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- côngnănggiớithiệuThẻ -->
    <ElCard class="art-card-xs">
      <template #header>
        <div class="flex-wrap gap-3 flex-cb">
          <h3 class="m-0">{{ $t('admin.t101') }}</h3>
          <div class="flex flex-wrap gap-2">
            <ElTag type="success" effect="light">{{ $t('admin.t102') }}</ElTag>
            <ElTag type="primary" effect="light">{{ $t('admin.t103') }}</ElTag>
            <ElTag type="warning" effect="light">{{ $t('admin.t104') }}</ElTag>
            <ElTag type="info" effect="light">{{ $t('admin.t105') }}</ElTag>
          </div>
        </div>
      </template>
      <div>
        <p class="m-0 mb-4 leading-[1.6] text-g-700">
          tậpthànhTimKiem、Làm mới、Toàn màn hình、Kích thướckhốngchế、cộtHiển thịẨn、Kéo
          thảxếpthứ、BảngKiểu dángkhốngchế、đồng thờitrongđặt useTable
          tổhợpkiểuHàm，gợicungcườngđạicủatổhợpkiểu API，tậpthànhDữ
          liệuLấy、trínăngCache（LRUpháp）、 đaloạiLàm mớisáchlượcbằngCốt
          lõicôngnăng，toànmặtgợilênBảngmởpháthiệusuất。
        </p>

        <!-- điềuthửBảng (Panel) -->
        <div class="my-4" v-if="showDebugPanel">
          <ElCollapse v-model="debugActiveNames">
            <ElCollapseItem name="cache" title="Cachethốngkếvớidiễnthị">
              <div class="flex flex-col gap-2">
                <div class="flex-cb">
                  <span class="font-medium text-g-700">CacheTrạng thái：</span>
                  <ElTag type="success">ĐãBật</ElTag>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">Cacheđiềusố：</span>
                  <span class="font-semibold text-theme">{{ cacheInfo.total }}</span>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">CacheKích thước：</span>
                  <span class="font-semibold text-theme">{{ cacheInfo.size }}</span>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">mệnhtrongThongTin：</span>
                  <span class="font-semibold text-theme">{{ cacheInfo.hitRate }}</span>
                </div>

                <div class="flex gap-2 mt-2">
                  <ElButton size="small" @click="handleClearCache">xóakhôngCache</ElButton>
                  <ElButton size="small" @click="handleCleanExpiredCache">xóalýquakỳCache</ElButton>
                  <ElButton size="small" @click="handleTestCache">đothửCache</ElButton>
                  <ElButton size="small" @click="forceRefreshCacheInfo"
                    >Làm mớiCacheThongTin</ElButton
                  >
                </div>
              </div>
            </ElCollapseItem>
            <ElCollapseItem name="logs" title="CacheNhatKy">
              <div class="flex flex-col gap-2">
                <div class="max-h-50 overflow-y-auto">
                  <div v-if="cacheDebugLogs.length === 0" class="p-5 text-center">
                    <ElEmpty description="TạmvôCacheNhatKy" :image-size="60" />
                  </div>
                  <div v-else class="flex flex-col gap-1">
                    <div
                      v-for="(log, index) in cacheDebugLogs"
                      :key="index"
                      class="p-1.5 px-2 text-xs leading-[1.4] bg-g-200 border-l-1 border-g-400 rounded"
                      :class="{
                        'bg-[rgba(103,194,58,0.1)] !border-l-success': log.includes('✅'),
                        'bg-[rgba(64,158,255,0.1)] !border-l-theme': log.includes('🎯'),
                        'bg-[rgba(245,108,108,0.1)] !border-l-danger': log.includes('❌')
                      }"
                    >
                      {{ log }}
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 mt-2">
                  <ElButton size="small" @click="cacheDebugLogs = []">xóakhôngNhatKy</ElButton>
                </div>
              </div>
            </ElCollapseItem>
            <ElCollapseItem name="request" title="Vui lòngcầuTrạng thái">
              <div class="flex flex-col gap-2">
                <div class="flex-cb">
                  <span class="font-medium text-g-700">LoadingTrạng thái：</span>
                  <ElTag :type="loading ? 'warning' : 'success'">
                    {{ loading ? 'Đang tải' : 'khôngnhàn' }}
                  </ElTag>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">Dữ liệuTrạng thái：</span>
                  <ElTag :type="hasData ? 'success' : 'info'">
                    {{ hasData ? `${data.length} điềuDữ liệu` : 'vôDữ liệu' }}
                  </ElTag>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">LỗiTrạng thái：</span>
                  <ElTag :type="error ? 'danger' : 'success'">
                    {{ error ? 'cóLỗi' : 'Bình thường' }}
                  </ElTag>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="font-medium text-g-700">khitrướcVui lòngcầuTham số：</span>
                  <ElText
                    tag="pre"
                    class="max-h-50 p-2 overflow-y-auto text-xs bg-g-200 border border-g-400 rounded-md"
                    >{{ JSON.stringify(requestParams, null, 2) }}</ElText
                  >
                </div>
                <div class="flex gap-2 mt-2">
                  <ElButton size="small" @click="handleCancelRequest">HủyVui lòngcầu</ElButton>
                  <ElButton size="small" @click="handleClearData">xóakhôngDữ liệu</ElButton>
                </div>
              </div>
            </ElCollapseItem>
          </ElCollapse>
        </div>

        <!-- côngnăngCông tắc -->
        <div class="flex flex-wrap gap-4 mt-4">
          <ElSwitch v-model="showDebugPanel" active-text="điềuthửBảng (Panel)" />
          <ElText type="info" size="small">
            💡 CachecôngnăngĐãBật，Có thểthông quađiềuthửBảng (Panel)XemChiTietThongTin
          </ElText>
        </div>
      </div>
    </ElCard>

    <!-- TimKiemđồngTên -->
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :rules="rules"
      :is-expand="false"
      :show-expand="true"
      :show-reset-button="true"
      :show-search-button="true"
      :disabled-search-button="false"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- BảngđồngTên -->
    <ElCard class="flex-1 art-table-card" style="margin-top: 0">
      <template #header>
        <div class="flex-cb">
          <h4 class="m-0">NguoiDungDữ liệuBảng</h4>
          <div class="flex gap-2">
            <ElTag v-if="error" type="danger">{{ error.message }}</ElTag>
            <ElTag v-else-if="loading" type="warning">Đang tải...</ElTag>
            <ElTag v-else type="success">{{ data.length }} điềuDữ liệu</ElTag>
          </div>
        </div>
      </template>

      <!-- BảngThanh công cụ -->
      <!-- fullClass ThuocTinhdùngởCaiDatToàn màn hìnhđồngTên，nếuquảcầncầnCaiDatToàn màn hìnhđồngTên，Vui lòngkhiếndùngnàyThuocTinh -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="handleRefresh"
        layout="refresh,size,fullscreen,columns,settings"
        fullClass="art-table-card"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd" v-ripple>
              <ElIcon>
                <Plus />
              </ElIcon>
              Thêm mớiNguoiDung
            </ElButton>

            <!-- Xuất fileNhập filecôngnăng -->
            <ArtExcelExport
              :data="data as any"
              :columns="exportColumns as any"
              filename="NguoiDungDữ liệu"
              :auto-index="true"
              button-text="Xuất file"
              @export-success="handleExportSuccess"
            />
            <ArtExcelImport
              @import-success="handleImportSuccess"
              @import-error="handleImportError"
              style="margin: 0 12px"
            />

            <ElButton @click="handleClearData" plain v-ripple> xóakhôngDữ liệu </ElButton>

            <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              <ElIcon>
                <Delete />
              </ElIcon>
              lôlượngXóa ({{ selectedRows.length }})
            </ElButton>
            <!-- Hoạt độngcộtCauHinhdiễnthịNút -->
            <ElDropdown @command="handleColumnCommand" style="margin-left: 10px">
              <ElButton type="primary" plain>
                Hoạt độngCập nhậtBảngcột
                <ElIcon class="el-icon--right">
                  <ArrowDown />
                </ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="addColumn">Thêm mớicột（GhiChucột）</ElDropdownItem>
                  <ElDropdownItem command="batchAddColumns"
                    >lôlượngThêm mới（GhiChu、Tag）</ElDropdownItem
                  >
                  <ElDropdownItem command="toggleColumn"
                    >Chuyển đổicột（Số điện thoại）</ElDropdownItem
                  >
                  <ElDropdownItem command="batchToggleColumns"
                    >lôlượngChuyển đổi（GioiTinh、Số điện thoại）</ElDropdownItem
                  >
                  <ElDropdownItem command="removeColumn">Xóacột（Trạng tháicột）</ElDropdownItem>
                  <ElDropdownItem command="batchRemoveColumns"
                    >lôlượngXóa（Trạng thái、Đánh giá）</ElDropdownItem
                  >
                  <ElDropdownItem command="updateColumn"
                    >Cập nhậtcột（Số điện thoại）</ElDropdownItem
                  >
                  <ElDropdownItem command="batchUpdateColumns"
                    >lôlượngCập nhật（GioiTinh、Số điện thoại）</ElDropdownItem
                  >
                  <ElDropdownItem command="reorderColumns"
                    >nộpđổicộtViTri（GioiTinh、Số điện thoại）</ElDropdownItem
                  >
                  <ElDropdownItem command="resetColumns" divided
                    >Đặt lạinêncócộtCauHinh</ElDropdownItem
                  >
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :pagination="pagination"
        :data="data"
        :columns="columns"
        :height="computedTableHeight"
        empty-height="360px"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @header-click="handleHeaderClick"
        @sort-change="handleSortChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <!-- NguoiDungThongTincột -->
        <template #avatar="{ row }">
          <div class="flex gap-3 user-info">
            <ElAvatar :src="row.avatar" :size="40" />
            <div class="flex-1 min-w-0">
              <p class="m-0 overflow-hidden font-medium text-ellipsis whitespace-nowrap">{{
                row.userName
              }}</p>
              <p
                class="m-0 mt-1 overflow-hidden text-xs text-g-700 text-ellipsis whitespace-nowrap"
                >{{ row.userEmail }}</p
              >
            </div>
          </div>
        </template>

        <!-- Tùy chỉnhNguoiDungThongTinbảngđầu -->
        <template #avatar-header="{ column }">
          <div class="flex-c gap-1">
            <span>{{ column.label }}</span>
            <ElTooltip content="Bao gồmAvatar、Họ tênvàEmail" placement="top">
              <ElIcon>
                <QuestionFilled />
              </ElIcon>
            </ElTooltip>
          </div>
        </template>

        <!-- Trạng tháicột -->
        <template #status="{ row }">
          <ElTag :type="getUserStatusConfig(row.status).type" effect="light">
            {{ getUserStatusConfig(row.status).text }}
          </ElTag>
        </template>

        <!-- Đánh giácột -->
        <template #score="{ row }">
          <ElRate v-model="row.score" disabled size="small" />
        </template>

        <!-- HanhDongcột -->
        <template #operation="{ row }">
          <div class="flex">
            <ArtButtonTable type="view" :row="row" @click="handleView(row)" />
            <ArtButtonTable type="add" :row="row" @click="handleAdd()" />
            <ArtButtonTable type="edit" :row="row" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" :row="row" @click="handleDelete(row)" />
          </div>
        </template>

        <!-- Tùy chỉnhSố điện thoạibảngđầu -->
        <template #userPhone-header="{ column }">
          <ElPopover placement="bottom" :width="200" trigger="hover">
            <template #reference>
              <div class="inline-block gap-1 text-theme c-p custom-header">
                <span>{{ column.label }}</span>
                <ElIcon>
                  <Search />
                </ElIcon>
              </div>
            </template>
            <ElInput
              v-model="phoneSearch"
              placeholder="TimKiemSố điện thoại"
              size="small"
              @input="handlePhoneSearch"
            >
              <template #prefix>
                <ElIcon>
                  <Search />
                </ElIcon>
              </template>
            </ElInput>
          </ElPopover>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Nâng caocôngnăngdiễnthị -->
    <ElCard class="art-card-xs">
      <template #header>
        <h4 class="m-0">Nâng caocôngnăngdiễnthị</h4>
      </template>
      <div class="flex flex-col gap-6">
        <!-- SuKienLắng nghediễnthị -->
        <div class="p-4 bg-g-200 border-full-d rounded-lg">
          <h5 class="m-0 mb-4 text-sm font-semibold">SuKienLắng nghediễnthị</h5>
          <div class="flex flex-wrap gap-2 mb-3 last:mb-0">
            <ElButton @click="toggleEventDemo" :type="eventDemoEnabled ? 'success' : 'primary'">
              {{ eventDemoEnabled ? 'đóngđóng' : 'mởbật' }}SuKienLắng nghe
            </ElButton>
            <ElButton @click="clearEventLogs" v-if="eventDemoEnabled">xóakhôngNhatKy</ElButton>
          </div>
          <div
            v-if="eventDemoEnabled && eventLogs.length > 0"
            class="p-3 mt-3 bg-g-200 border border-g-400 rounded-md"
          >
            <div class="flex-cb mb-2 font-medium text-g-700">
              <span>nhấtcậnSuKienNhatKy：</span>
              <ElTag size="small">{{ eventLogs.length }} điều</ElTag>
            </div>
            <div class="flex flex-col gap-1 max-h-50 overflow-y-auto">
              <div
                v-for="(log, index) in eventLogs.slice(0, 20)"
                :key="index"
                class="flex-c gap-2 p-1.5 px-2 text-xs bg-g-300 border-l-1 border-g-400 rounded"
              >
                <ElTag :type="getEventType(log.type)" size="small">{{ log.type }}</ElTag>
                <span class="flex-1 text-g-700">{{ log.message }}</span>
                <span class="text-xs text-g-600">{{ log.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- BảngCauHinhdiễnthị -->
        <div class="p-4 bg-g-200 border-full-d rounded-lg">
          <h5 class="m-0 mb-4 text-sm font-semibold">BảngCauHinhdiễnthị</h5>
          <div class="flex flex-wrap gap-2 mb-3 last:mb-0">
            <ElSwitch
              v-model="tableConfig.fixedHeight"
              active-text="cốđịnhChiều cao (500px)"
              inactive-text="từthíchứngChiều cao"
              class="ml-2"
            />
          </div>
        </div>

        <!-- Tùy chỉnhcôngnăngdiễnthị -->
        <div class="p-4 bg-g-200 border-full-d rounded-lg">
          <h5 class="m-0 mb-4 text-sm font-semibold">Tùy chỉnhcôngnăng</h5>
          <div class="flex flex-wrap gap-2 mb-3 last:mb-0">
            <ElButton @click="handleScrollToTop">CuộnđếnPhía trên</ElButton>
            <ElButton @click="handleScrollToPosition">CuộnđếnđịnhViTri</ElButton>
            <ElButton @click="handleToggleSelection">Chuyển đổitoànvị</ElButton>
            <ElButton @click="handleGetTableInfo">LấyBảngThongTin</ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- CacheLàm mớisáchlượcdiễnthị -->
    <ElCard class="art-card-xs">
      <template #header>
        <h4 class="m-0">CacheLàm mớisáchlượcdiễnthị</h4>
      </template>
      <div class="flex flex-wrap gap-2 max-md:flex-col">
        <ElButton @click="refreshData" v-ripple>
          <ElIcon>
            <Refresh />
          </ElIcon>
          thôngdùngLàm mới
        </ElButton>
        <ElButton @click="refreshSoft" v-ripple>
          <ElIcon>
            <Refresh />
          </ElIcon>
          mềmLàm mới
        </ElButton>
        <ElButton @click="refreshCreate" v-ripple>
          <ElIcon>
            <Plus />
          </ElIcon>
          Thêm mớisauLàm mới
        </ElButton>
        <ElButton @click="refreshUpdate" v-ripple>
          <ElIcon>
            <Edit />
          </ElIcon>
          Chỉnh sửasauLàm mới
        </ElButton>
        <ElButton @click="refreshRemove" v-ripple>
          <ElIcon>
            <Delete />
          </ElIcon>
          XóasauLàm mới
        </ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import {
    Plus,
    Delete,
    Edit,
    Search,
    Refresh,
    QuestionFilled,
    ArrowDown
  } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'
  import { useTable, CacheInvalidationStrategy } from '@/hooks/core/useTable'
  import { fetchGetUserList } from '@/api/system-manage'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { getColumnKey } from '@/hooks/core/useTableColumns'

  defineOptions({ name: 'AdvancedTableDemo' })

  type UserListItem = Api.SystemManage.UserListItem

  // vịtrongcủadòng
  const selectedRows = ref<UserListItem[]>([])

  // Bảngthựcví dụtríchdùng
  const tableRef = ref()

  // điềuthửBảng (Panel)Trạng thái
  const showDebugPanel = ref(false)
  const debugActiveNames = ref(['cache', 'request', 'logs'])

  // CacheđiềuthửTrạng thái
  const cacheDebugLogs = ref<string[]>([])
  const requestParams = ref<any>({
    current: 1,
    size: 20,
    name: '',
    phone: '',
    status: '',
    department: '',
    daterange: undefined
  })

  // CachephímThongTin
  const cacheKeys = ref<string[]>([])

  // Số điện thoạiTimKiem
  const phoneSearch = ref('')

  // SuKiendiễnthịđóng
  const eventDemoEnabled = ref(false)
  const eventLogs = ref<Array<{ type: string; message: string; time: string }>>([])

  // BảngCauHinhdiễnthị
  const tableConfig = ref({
    height: '100%',
    fixedHeight: false // Thêm mới：làphủcốđịnhChiều caocủaCông tắc
  })

  // kếthựctếcủaBảngChiều cao
  const computedTableHeight = computed(() => {
    return tableConfig.value.fixedHeight ? '500px' : ''
  })

  // TimKiemForm ref
  const searchBarRef = ref()

  // soátnghiệmquy
  const rules = {
    name: [{ required: true, message: 'Vui lòng nhậpTên người dùng', trigger: 'blur' }],
    phone: [
      { required: true, message: 'Vui lòng nhậpSố điện thoại', trigger: 'blur' },
      {
        pattern: /^1[3456789]\d{9}$/,
        message: 'Vui lòng nhậpđúngChínhcủaSố điện thoại',
        trigger: 'blur'
      }
    ]
  }

  // FormTimKiemban đầuđầugiá trị
  const searchFormState = ref({
    name: '',
    phone: '',
    status: '1',
    department: '',
    daterange: ['2025-01-01', '2025-02-10']
  })

  // TimKiemFormTrạng thái
  // const searchFormState = ref({ ...defaultFilter.value })

  // NguoiDungTrạng tháiCauHinh
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: 'tạiđường' },
    '2': { type: 'info' as const, text: 'Ngoạiđường' },
    '3': { type: 'warning' as const, text: 'Bất thường' },
    '4': { type: 'danger' as const, text: 'tâmtác' }
  } as const

  // TimKiemFormCauHinh
  // NgàyBộ chọncóđaloạiloạikiểu，dụng cụthểCó thểlấyXem src/components/core/forms/art-search-bar/widget/art-search-date/README.md TaiLieu
  const searchItems = computed(() => [
    {
      key: 'name',
      label: 'Tên người dùng',
      type: 'input',
      props: {
        placeholder: 'Vui lòng nhậpTên người dùng'
      }
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      type: 'input',
      props: {
        placeholder: 'Vui lòng nhậpSố điện thoại',
        maxlength: '11'
      }
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: [
        { label: 'toànbộ', value: '' },
        { label: 'tạiđường', value: '1' },
        { label: 'Ngoạiđường', value: '2' },
        { label: 'Bất thường', value: '3' },
        { label: 'tâmtác', value: '4' }
      ]
    },
    {
      key: 'department',
      label: 'bộcửa',
      type: 'select',
      options: [
        { label: 'toànbộ', value: '' },
        { label: 'kỹthuậtbộ', value: 'kỹthuậtbộ' },
        { label: 'sinhsản phẩmbộ', value: 'sinhsản phẩmbộ' },
        { label: 'vậndoanhbộ', value: 'vậndoanhbộ' },
        { label: 'thịtrườngbộ', value: 'thịtrườngbộ' },
        { label: 'thiếtkếbộ', value: 'thiếtkếbộ' }
      ]
    },
    {
      key: 'daterange',
      label: 'Ngàyphạmvi',
      type: 'daterange',
      props: {
        type: 'daterange',
        startPlaceholder: 'Bắt đầuNgày',
        endPlaceholder: 'KếtthúcNgày',
        valueFormat: 'YYYY-MM-DD'
      }
    }
  ])

  // Xuất filecộtCauHinh
  const exportColumns = computed(() => ({
    userName: { title: 'Tên người dùng', width: 15 },
    userEmail: { title: 'Email', width: 20 },
    userPhone: { title: 'Số điện thoại', width: 15 },
    userGender: { title: 'GioiTinh', width: 10 },
    department: { title: 'bộcửa', width: 15 },
    status: {
      title: 'Trạng thái',
      width: 10,
      formatter: (value: string) => getUserStatusConfig(value).text
    }
  }))

  // LấyNguoiDungTrạng tháiCauHinh
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: 'Chưabáo'
      }
    )
  }

  const buildSearchParams = (params: typeof searchFormState.value) => {
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    return {
      ...filtersParams,
      startTime,
      endTime
    }
  }

  // môphỏngmạnglạcVui lòngcầu
  // const simulateNetworkRequest = (): Promise<void> => {
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve()
  //     }, 500)
  //   })
  // }

  // môphỏngmạnglạcVui lòngcầuhoànthànhsauLoadingDữ liệu
  // onMounted(async () => {
  //   // bằngđợimôphỏngcủamạnglạcVui lòngcầuhoànthành
  //   await simulateNetworkRequest()
  //   await fetchData({ name: 'ricky', phone: 19388828388 })
  // })

  /**
   * khiếndùng useTable Hook Quản lýBảngDữ liệu
   * gợicungĐầy đủcủaBảnggiảiphươngán，baobaoDữ liệuLấy、Cache、Phân trang、TimKiembằngcôngnăng
   */
  const {
    // Dữ liệuđóng
    data, // BảngDữ liệu
    loading, // Đang tảiTrạng thái
    error, // Dữ liệuLoadingLỗiTrạng thái
    hasData, // làphủcóDữ liệu
    // isEmpty, // Dữ liệulàphủvìkhông

    // Phân trangđóng
    pagination, // Phân trangThongTin
    // paginationMobile, // DiđộngđầuPhân trangCauHinh
    handleSizeChange, // Phân trangKích thướcbiếnhóaXuLy
    handleCurrentChange, // khitrướctrangbiếnhóaXuLy

    // TimKiemđóng
    searchParams, // TimKiemTham số
    replaceSearchParams, // thếđổiTimKiemTham số
    resetSearchParams, // Đặt lạiTimKiemTham số

    // Dữ liệuHanhDong
    // fetchData, // tayđộngLoadingDữ liệucủaPhuongThuc，Có thểdùngởbằngđợinóanh ấyVui lòngcầuhoànthànhsauđiềudùng，immediate vì false giờkhiếndùng
    getData, // LấyDữ liệu
    getDataDebounced, // LấyDữ liệu（Phòngrung）
    clearData, // xóakhôngDữ liệu

    // Làm mớisáchlược
    refreshData, // toànlượngLàm mới：xóakhôngnêncóCache，trùngmớiLấyDữ liệu（thíchdùngởtayđộngLàm mớiNút）
    refreshSoft, // nhẹlượngLàm mới：chỉxóakhôngkhitrướcTimKiemđiềuphần tửcủaCache，Duy trìPhân trangTrạng thái（thíchdùngởđịnhgiờLàm mới）
    refreshCreate, // Thêm mớisauLàm mới：vềđếnthứmộttrangđồng thờixóakhôngPhân trangCache（thíchdùngởThêm mớiDữ liệusau）
    refreshUpdate, // Cập nhậtsauLàm mới：Duy trìkhitrướctrang，chỉxóakhôngkhitrướcTimKiemCache（thíchdùngởCập nhậtDữ liệusau）
    refreshRemove, // XóasauLàm mới：trínăngXuLytrangmã，tránhmiễnkhôngtrangmặt（thíchdùngởXóaDữ liệusau）

    // Cachekhốngchế
    cacheInfo, // CachethốngkếThongTin
    clearCache, // xóachiaCache，liệuKhôngcùngcủanghiệpvụtrườngcảnhChọntínhđịaxóalýCache
    // chiếctrì4loạixóalýsáchlược
    // clearCache(CacheInvalidationStrategy.CLEAR_ALL, 'tayđộngLàm mới')     // xóakhôngnêncóCache
    // clearCache(CacheInvalidationStrategy.CLEAR_CURRENT, 'TimKiemDữ liệu') // chỉxóakhôngkhitrướcTimKiemđiềuphần tửcủaCache
    // clearCache(CacheInvalidationStrategy.CLEAR_PAGINATION, 'Thêm mớiDữ liệu') // xóakhôngPhân trangđóngCache
    // clearCache(CacheInvalidationStrategy.KEEP_ALL, 'Duy trìCache')      // KhôngxóalýnhiệmnàoCache
    clearExpiredCache, // xóalýĐãquakỳcủaCache，giảiphóngtrongtồnkhônggian

    // Vui lòngcầukhốngchế
    cancelRequest, // HủykhitrướcVui lòngcầu

    // Hoạt độngcộtCauHinhPhuongThuc
    columns, // BảngcộtCauHinh
    columnChecks, // cộtHiển thị、Kéo thảCauHinh
    addColumn, // Thêm mớicột（chiếctrìđơnchiếchoặclôlượng）
    removeColumn, // Xóacột（chiếctrìđơnchiếchoặclôlượng）
    updateColumn, // Cập nhậtcột（chiếctrìđơnchiếchoặclôlượng）
    toggleColumn, // Chuyển đổicộtHiển thịTrạng thái（chiếctrìđơnchiếchoặclôlượng）
    resetColumns, // Đặt lạicộtCauHinh
    reorderColumns, // trùngmớixếpthứcột
    getColumnConfig, // LấycộtCauHinh
    getAllColumns // LấynêncócộtCauHinh
  } = useTable({
    // Cốt lõiCauHinh
    core: {
      apiFn: (params) => {
        // tạiAPIđiềudùngtrướcThêm mớiđiềuthửThongTin
        const requestKey = JSON.stringify(params)
        console.log('🚀 API Vui lòngcầuTham số:', params)
        addCacheLog(`🚀 API Vui lòngcầu: current=${params.current}, size=${params.size}`)
        addCacheLog(`🔑 Vui lòngcầuphím: ${requestKey.substring(0, 100)}...`)

        // Ghi chépCachephím（nàytronggiảthiếtsẽbịCache）
        updateCacheKeys(requestKey)

        return fetchGetUserList(params)
      },
      apiParams: {
        current: 1,
        size: 20,
        ...searchFormState.value
      },
      // xếpchia apiParams trongcủaThuocTinh
      excludeParams: ['daterange'],
      // Tùy chỉnhPhân trangchữđoạnảnhxạ，ChưaCaiDatgiờtươngkhiếndùngtoànbộCauHinh tableConfig.ts trongcủa paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      immediate: true, // làphủlậplàLoadingDữ liệu
      columnsFactory: () => [
        // {
        //   type: 'expand',
        //   label: 'Mở rộngdòng',
        //   width: 80,
        //   formatter: (row) =>
        //     h('div', { style: 'padding: 10px 30px' }, [
        //       h('p', {}, 'NguoiDungID: ' + row.id),
        //       h('p', {}, 'Tên người dùng: ' + row.userName),
        //       h('p', {}, 'Số điện thoại: ' + row.userPhone),
        //       h('p', {}, 'Email: ' + row.userEmail),
        //       h('p', {}, 'GioiTinh: ' + row.userGender),
        //       h('p', {}, 'Trạng thái: ' + row.status),
        //       h('p', {}, 'xâyNgày: ' + row.createTime)
        //     ])
        // },
        { type: 'selection', width: 50 },
        // { type: 'index', width: 60, label: 'thứsố' }, // quyểnđịathứsốcột
        { type: 'globalIndex', width: 60, label: 'thứsố' }, // toànbộthứsốcột
        {
          prop: 'avatar',
          label: 'NguoiDungThongTin',
          minWidth: 200,
          useSlot: true,
          useHeaderSlot: true,
          sortable: false
          // visible: false, // Ẩncột
        },
        {
          prop: 'userGender',
          label: 'GioiTinh',
          sortable: true,
          formatter: (row) => row.userGender || 'Chưabáo'
        },
        {
          prop: 'userPhone',
          label: 'Số điện thoại',
          useHeaderSlot: true,
          sortable: true
        },
        {
          prop: 'department',
          label: 'bộcửa',
          sortable: true
        },
        {
          prop: 'score',
          label: 'Đánh giá',
          useSlot: true,
          sortable: true
        },
        {
          prop: 'status',
          label: 'Trạng thái',
          useSlot: true,
          sortable: true
        },
        {
          prop: 'operation',
          label: 'HanhDong',
          width: 190,
          useSlot: true,
          fixed: 'right'
        }
      ]
    },

    // Dữ liệuXuLy
    transform: {
      dataTransformer: (records) => {
        if (!Array.isArray(records)) return []

        return records.map((item, index: number) => ({
          ...item,
          avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar,
          department: ['kỹthuậtbộ', 'sinhsản phẩmbộ', 'vậndoanhbộ', 'thịtrườngbộ', 'thiếtkếbộ'][
            Math.floor(Math.random() * 5)
          ],
          score: Math.floor(Math.random() * 5) + 1,
          status: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)]
        }))
      }
      // Tùy chỉnhứngthíchPhânthiết bị，XuLysauđầuđặcthùcủaQuay lạicáchkiểu
      // responseAdapter: (data) => {
      //   const { list, total, pageNum, pageSize } = data
      //   return {
      //     records: list,
      //     total: total,
      //     current: pageNum,
      //     size: pageSize
      //   }
      // }
    },

    // tínhnăngTốihóa
    performance: {
      enableCache: true, // mởbậtCache
      cacheTime: 5 * 60 * 1000, // 5phầnchuông
      debounceTime: 300,
      maxCacheSize: 100
    },

    // sinhmệnhtuầnkỳHook
    hooks: {
      onSuccess: (data, response) => {
        console.log('📊 ứngChiTiet:', response)
        addCacheLog(`✅ mạnglạcVui lòngcầuThanhCong: ${data.length} điềuDữ liệu`)
        addCacheLog(
          `📝 ứngThongTin: total=${response.total}, current=${response.current}, size=${response.size}`
        )
      },
      onError: (error) => {
        console.error('❌ Dữ liệuLoadingThatBai:', error)
        addCacheLog(`❌ Yêu cầu thất bại: ${error.message}`)
        ElMessage.error(error.message)
      },
      onCacheHit: (data, response) => {
        console.log('🎯 Cachemệnhtrong:', data.length, 'điều')
        console.log('🔑 Cacheđếnnguồn:', response)
        addCacheLog(
          `🎯 Cachemệnhtrong: ${data.length} điềuDữ liệu (current=${response.current}, size=${response.size})`
        )
        ElMessage.info('Dữ liệuđếntừCache')
      },
      resetFormCallback: () => {
        console.log('🔄 FormĐãĐặt lại')
        addCacheLog('🔄 FormĐãĐặt lại')
      }
    },

    // điềuthửCauHinh
    debug: {
      enableLog: true,
      logLevel: 'info'
    }
  })

  // SuKienXuLyHàm
  const handleSelectionChange = (selection: UserListItem[]) => {
    selectedRows.value = selection
    console.log('Chọnbiếnhơn:', selection)
  }

  const handleRowClick = (row: UserListItem) => {
    console.log('dòngNhấn:', row)
    logEvent('dòngNhấn', `NhấnrồiNguoiDung: ${row.userName}`)
  }

  /**
   * bảngđầuNhấnSuKienXuLy
   * @param column cộtThongTin
   */
  const handleHeaderClick = (column: { label: string; property: string }) => {
    console.log('bảngđầuNhấn:', column)
    logEvent('bảngđầuNhấn', `Nhấnrồi ${column.label} Danh sáchđầu`)
  }

  /**
   * xếpthứThongTinloạikiểu
   */
  interface SortInfo {
    prop: string
    order: 'ascending' | 'descending' | null
  }

  /**
   * xếpthứbiếnhơnSuKienXuLy
   * @param sortInfo xếpthứThongTin
   */
  const handleSortChange = (sortInfo: SortInfo) => {
    console.log('xếpthứSuKien:', sortInfo)
    console.log('xếpthứchữđoạn:', sortInfo.prop)
    console.log('xếpthứphươnghướng:', sortInfo.order)
    logEvent('xếpthứbiếnhơn', `chữđoạn: ${sortInfo.prop}, phươnghướng: ${sortInfo.order}`)
  }

  // SuKienNhatKyGhi chép
  const logEvent = (type: string, message: string) => {
    if (!eventDemoEnabled.value) return

    const time = new Date().toLocaleTimeString()
    eventLogs.value.unshift({ type, message, time })

    // hạnchếNhatKySố lượng
    if (eventLogs.value.length > 20) {
      eventLogs.value = eventLogs.value.slice(0, 20)
    }
  }

  // LấySuKienloạikiểuKiểu dáng
  const getEventType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      dòngNhấn: 'primary',
      dòngđôichuột: 'success',
      dòngphảiphím: 'warning',
      đơnnguyêncáchNhấn: 'info',
      đơnnguyêncáchđôichuột: 'success',
      bảngđầuNhấn: 'primary',
      Chọnbiếnhơn: 'warning',
      xếpthứbiếnhơn: 'success'
    }
    return typeMap[type] || 'info'
  }

  // diễnthịcôngnăngPhuongThuc
  const toggleEventDemo = () => {
    eventDemoEnabled.value = !eventDemoEnabled.value
    if (eventDemoEnabled.value) {
      ElMessage.success('SuKienLắng ngheĐãmởbật，Vui lòngvớiBảngnộpXemHiệu quả')
    } else {
      ElMessage.info('SuKienLắng ngheĐãđóngđóng')
    }
  }

  const clearEventLogs = () => {
    eventLogs.value = []
    ElMessage.info('SuKienNhatKyĐãxóakhông')
  }

  const handleScrollToTop = () => {
    tableRef.value?.scrollToTop()
  }

  const handleScrollToPosition = () => {
    tableRef.value?.elTableRef.setScrollTop(200)
  }

  const handleToggleSelection = () => {
    if (selectedRows.value.length === 0) {
      tableRef.value?.elTableRef.toggleAllSelection()
      ElMessage.info('Đãtoànvị')
    } else {
      tableRef.value?.elTableRef.clearSelection()
      ElMessage.info('ĐãHủytoànvị')
    }
  }

  const handleGetTableInfo = () => {
    const info = {
      dataCount: data.value.length,
      selectedCount: selectedRows.value.length,
      columnCount: columns?.value?.length ?? 0,
      currentPage: pagination.current,
      pageSize: pagination.size,
      totalCount: pagination.total
    }

    console.log('BảngThongTin:', info)
    ElMessage.info(`BảngThongTinĐãnhậprađếnBangDieuKhien，khitrước ${info.dataCount} điềuDữ liệu`)
  }

  const handleSearch = async () => {
    await searchBarRef.value.validate()

    console.log('TimKiemTham số:', searchFormState.value)
    replaceSearchParams(buildSearchParams(searchFormState.value))
    getData()
  }

  const handleReset = () => {
    addCacheLog('🔄 Đặt lạiTimKiem')
    // Đặt lạiTimKiemFormTrạng thái
    // searchFormState.value = { ...defaultFilter.value }
    resetSearchParams()
  }

  const handlePhoneSearch = (value: string) => {
    searchFormState.value.phone = value
    replaceSearchParams(buildSearchParams(searchFormState.value))
    requestParams.value = { ...searchParams }
    addCacheLog(`📱 Số điện thoạiTimKiem: ${value}`)
    getDataDebounced()
  }

  const handleRefresh = () => {
    addCacheLog('🔄 tayđộngLàm mới')
    refreshData()
  }

  // CRUD HanhDong
  const handleAdd = () => {
    ElMessage.success('Thêm mớiNguoiDungThanhCong')
    refreshCreate()
  }

  const handleEdit = (row: UserListItem) => {
    ElMessage.success(`Chỉnh sửaNguoiDung ${row.userName} ThanhCong`)
    setTimeout(() => {
      refreshUpdate()
    }, 1000)
  }

  const handleDelete = async (row: UserListItem) => {
    try {
      await ElMessageBox.confirm(`Xác địnhcầnXóaNguoiDung ${row.userName} không？`, 'CanhBao', {
        confirmButtonText: 'Xác định',
        cancelButtonText: 'Hủy',
        type: 'warning'
      })

      ElMessage.success('XóaThanhCong')
      setTimeout(() => {
        refreshRemove()
      }, 1000)
    } catch {
      ElMessage.info('ĐãHủyXóa')
    }
  }

  const handleView = (row: UserListItem) => {
    ElMessage.info(`XemNguoiDung ${row.userName}`)
  }

  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `Xác địnhcầnXóavịtrongcủa ${selectedRows.value.length} chiếcNguoiDungkhông？`,
        'CanhBao',
        {
          confirmButtonText: 'Xác định',
          cancelButtonText: 'Hủy',
          type: 'warning'
        }
      )

      ElMessage.success(`lôlượngXóa ${selectedRows.value.length} chiếcNguoiDungThanhCong`)
      selectedRows.value = []
      setTimeout(() => {
        refreshRemove()
      }, 1000)
    } catch {
      ElMessage.info('ĐãHủyXóa')
    }
  }

  // Nhập fileXuất file
  const handleExportSuccess = (filename: string, count: number) => {
    ElMessage.success(`Xuất file ${count} điềuDữ liệuThanhCong`)
  }

  /**
   * Excel Nhập fileThanhCongXuLy
   * @param data Nhập filecủaDữ liệuMảng
   */
  const handleImportSuccess = (data: Record<string, any>[]) => {
    ElMessage.success(`Nhập file ${data.length} điềuDữ liệuThanhCong`)
    refreshCreate()
  }

  const handleImportError = (error: Error) => {
    ElMessage.error(`Nhập fileThatBai：${error.message}`)
  }

  // điềuthửcôngnăng
  const handleClearCache = () => {
    clearCache(CacheInvalidationStrategy.CLEAR_ALL, 'tayđộngxóakhông')
    cacheKeys.value = [] // xóakhôngCachephímDanh sách
    addCacheLog('🗑️ tayđộngxóakhôngnêncóCache')
    ElMessage.success('CacheĐãxóakhông')
  }

  const handleCleanExpiredCache = () => {
    const count = clearExpiredCache()
    addCacheLog(`🧹 xóalýrồi ${count} điềuquakỳCache`)
    ElMessage.info(`xóalýrồi ${count} điềuquakỳCache`)
  }

  const handleCancelRequest = () => {
    cancelRequest()
    addCacheLog('❌ HủykhitrướcVui lòngcầu')
    ElMessage.info('Vui lòngcầuĐãHủy')
  }

  const handleClearData = () => {
    clearData()
    addCacheLog('🗑️ xóakhôngnêncóDữ liệu')
    ElMessage.info('Dữ liệuĐãxóakhông')
  }

  const handleTestCache = () => {
    // môphỏngkhoáiChuyển đổitrangmặtđếnđothửCache
    const testPages = [1, 2, 3, 2, 1] // đothửtrangmặtthứcột

    ElMessage.info('Bắt đầuCacheđonghiệm...')
    addCacheLog('🧪 Bắt đầuCacheđothử')

    let index = 0
    const testInterval = setInterval(() => {
      if (index >= testPages.length) {
        clearInterval(testInterval)
        addCacheLog('✅ Cacheđothửhoànthành')
        ElMessage.success('Cacheđothửhoànthành！quansátCachethốngkếcủabiếnhóa')
        return
      }

      const page = testPages[index]
      addCacheLog(`📄 đothửChuyển đổiđếnthứ ${page} trang`)
      // Cập nhậtVui lòngcầuTham số
      requestParams.value = { ...requestParams.value, current: page }

      // Chuyển đổiđếnđothửtrangmặt
      handleCurrentChange(page)
      index++
    }, 1000)
  }

  /**
   * Thêm mớiCacheđiềuthửNhatKy
   * @param message NhatKyTinNhan
   */
  const addCacheLog = (message: string): void => {
    const timestamp = new Date().toLocaleTimeString()
    cacheDebugLogs.value.unshift(`[${timestamp}] ${message}`)
    if (cacheDebugLogs.value.length > 20) {
      cacheDebugLogs.value = cacheDebugLogs.value.slice(0, 20)
    }
  }

  /**
   * Cập nhậtCachephímDanh sách
   * @param key Cachephím
   * @param operation HanhDongloạikiểu
   */
  const updateCacheKeys = (key: string, operation: 'add' | 'remove' = 'add'): void => {
    if (operation === 'add' && !cacheKeys.value.includes(key)) {
      cacheKeys.value.push(key)
      addCacheLog(`Thêm mớiCachephím: ${getCacheKeySummary(key)}`)
    } else if (operation === 'remove') {
      const index = cacheKeys.value.indexOf(key)
      if (index > -1) {
        cacheKeys.value.splice(index, 1)
        addCacheLog(`DichiaCachephím: ${getCacheKeySummary(key)}`)
      }
    }
  }

  /**
   * LấyCachephímngắtcầnThongTin
   * @param key Cachephím
   * @returns Cachephímngắtcần
   */
  const getCacheKeySummary = (key: string): string => {
    try {
      const params = JSON.parse(key)
      return `trangmã: ${params.current || 1}, Kích thước: ${params.size || 20}${params.name ? ', danhtên: ' + params.name : ''}${params.status ? ', Trạng thái: ' + params.status : ''}`
    } catch {
      return 'vôhiệucủaCachephím'
    }
  }

  /**
   * cườngchếLàm mớiCacheThongTin
   */
  const forceRefreshCacheInfo = (): void => {
    const currentStats = cacheInfo.value
    addCacheLog(`CacheThongTinLàm mới: ${currentStats.total} điềuCache`)

    if (currentStats.total === 0) {
      cacheKeys.value = []
    }

    nextTick(() => {
      console.log('khitrướcCachethốngkế:', cacheInfo.value)
    })
  }

  // Lắng nghePhân trangvàTimKiemTrạng tháibiếnhóa
  watch(
    () => [pagination.current, pagination.size, searchFormState.value],
    ([current, size, search]) => {
      requestParams.value = {
        ...(search as any),
        current,
        size
      }
    },
    { deep: true, immediate: true }
  )

  /**
   * XuLyHoạt độngcộtCauHinhmệnhlệnh
   */
  const handleColumnCommand = (command: string): void => {
    switch (command) {
      case 'addColumn': {
        // Thêm mớiđơnchiếccột
        addColumn?.({
          prop: 'remark',
          label: 'GhiChu',
          width: 150,
          formatter: () => h('span', { style: 'color: #999' }, 'TạmvôGhiChu')
        })
        ElMessage.success('ĐãThêm mới"GhiChu"cột')
        break
      }

      case 'batchAddColumns': {
        // lôlượngThêm mớiđachiếccột
        addColumn?.(
          [
            {
              prop: 'remark',
              label: 'GhiChu',
              width: 150,
              formatter: () => h('span', { style: 'color: #999' }, 'TạmvôGhiChu')
            },
            {
              prop: 'tags',
              label: 'Tag',
              width: 120,
              formatter: () => h('span', { style: 'color: #67c23a' }, 'NguoiDung mới')
            }
          ],
          5
        ) // tạithứ5chiếcViTrichènvào
        ElMessage.success('ĐãlôlượngThêm mới"GhiChu"và"Tag"cột')
        break
      }

      case 'toggleColumn': {
        // Chuyển đổiđơnchiếccộtHiển thị/Ẩn
        if (getColumnConfig?.('userPhone')) {
          toggleColumn?.('userPhone')
          ElMessage.success('ĐãChuyển đổiSố điện thoạicộtHiển thịTrạng thái')
        }
        break
      }

      case 'batchToggleColumns': {
        // lôlượngChuyển đổiđachiếccộtHiển thị/Ẩn
        toggleColumn?.(['userGender', 'userPhone'])
        ElMessage.success('ĐãlôlượngChuyển đổiGioiTinhvàSố điện thoạicộtHiển thịTrạng thái')
        break
      }

      case 'removeColumn': {
        // Xóađơnchiếccột
        removeColumn?.('status')
        ElMessage.success('ĐãXóaTrạng tháicột')
        break
      }

      case 'batchRemoveColumns': {
        // lôlượngXóađachiếccột
        removeColumn?.(['status', 'score'])
        ElMessage.success('ĐãlôlượngXóaTrạng tháivàĐánh giácột')
        break
      }

      case 'updateColumn': {
        // Cập nhậtđơnchiếccột
        updateColumn?.('userPhone', {
          label: 'liênhệđiệnlời',
          width: 140
        })
        ElMessage.success('Số điện thoạicộtĐãCập nhậtvì"liênhệđiệnlời"')
        break
      }

      case 'batchUpdateColumns': {
        // lôlượngCập nhậtđachiếccột（mớingônpháp）
        updateColumn?.([
          {
            prop: 'userGender',
            updates: { width: 200, label: 'GioiTinh-ĐãCập nhật', sortable: false }
          },
          {
            prop: 'userPhone',
            updates: { width: 200, label: 'Số điện thoại-ĐãCập nhật', sortable: false }
          }
        ])
        ElMessage.success('ĐãlôlượngCập nhậtGioiTinhvàSố điện thoạicột')
        break
      }

      case 'reorderColumns': {
        // nộpđổicộtViTri
        const allCols = getAllColumns?.()
        if (allCols) {
          const genderIndex = allCols.findIndex((col) => getColumnKey(col) === 'userGender')
          const phoneIndex = allCols.findIndex((col) => getColumnKey(col) === 'userPhone')

          if (genderIndex !== -1 && phoneIndex !== -1) {
            reorderColumns?.(genderIndex, phoneIndex)
            ElMessage.success('ĐãnộpđổiGioiTinhvàSố điện thoạicộtViTri')
          }
        }
        break
      }

      case 'resetColumns': {
        // Đặt lạinêncócộtCauHinh
        resetColumns?.()
        ElMessage.success('ĐãĐặt lạinêncócộtCauHinh')
        break
      }

      default:
        console.warn('ChưabáocủacộtCauHinhmệnhlệnh:', command)
    }
  }
</script>

<style scoped>
  .user-info .el-avatar {
    flex-shrink: 0;
    width: 40px !important;
    height: 40px !important;
  }

  .user-info .el-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .custom-header:hover {
    color: var(--el-color-primary-light-3);
  }

  .demo-group .config-toggles .el-switch {
    --el-switch-on-color: var(--el-color-primary);
  }

  .demo-group .performance-info .el-alert {
    --el-alert-padding: 12px;
  }
</style>
