<template>
  <div class="lead-management flex flex-col gap-5 pb-8">
    <div class="page-header flex items-center justify-between">
      <h2 class="m-0 text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
        <ArtSvgIcon icon="ri:user-star-line" class="text-red-500" />
        Khách hàng tiềm năng
      </h2>
    </div>

    <!-- A. Khu vực Chỉ số (Stat Cards) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ArtStatsCard
        title="Tổng khách tiềm năng"
        :count="pagination.total"
        description="Quy mô tệp khách hiện có"
        icon="ri:team-line"
        iconStyle="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-100"
      />
      <ArtStatsCard
        title="Đang chăm sóc"
        :count="
          data.filter((i) => i.status !== 'New' && i.status !== 'Lost' && i.status !== 'Won').length
        "
        description="Khối lượng công việc của Sale"
        icon="ri:customer-service-2-line"
        iconStyle="bg-gradient-to-br from-orange-400 to-orange-500 shadow-orange-100"
      />
      <ArtStatsCard
        title="Lead nóng"
        :count="data.filter((i) => getPriority(i).level === 3).length"
        description="Khách cần ưu tiên xử lý ngay"
        icon="ri:fire-line"
        iconStyle="bg-gradient-to-br from-red-500 to-red-600 shadow-red-100"
      />
      <ArtStatsCard
        title="Mới trong ngày"
        :count="data.filter((i) => isToday(i.createdAt)).length"
        description="Cơ hội mới từ Web/Facebook"
        icon="ri:user-add-line"
        iconStyle="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-100"
      />
    </div>

    <!-- B. Bộ lọc thông minh -->
    <div class="search-bar-wrapper bg-white rounded-xl shadow-sm border border-gray-100 p-2">
      <ArtSearchBar
        v-model="searchModel"
        :items="searchItems"
        :label-width="120"
        :span="8"
        :show-expand="true"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <!-- 2. Danh sách khách hàng -->
    <div class="content-section" v-loading="loading">
      <div v-if="data.length > 0" class="flex flex-col gap-4">
        <div
          v-for="lead in data"
          :key="lead.id"
          class="lead-row-card group bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 flex items-center hover:border-red-200"
          :class="{
            'is-selected': selectedIds.includes(lead.id),
            'is-critical': isCriticalWait(lead)
          }"
        >
          <!-- Bulk Checkbox -->
          <div class="px-5 flex-cc border-r border-gray-50 h-full min-h-[100px]">
            <ElCheckbox
              :model-value="selectedIds.includes(lead.id)"
              @change="toggleSelect(lead.id)"
              size="large"
            />
          </div>

          <div class="flex flex-1 items-center p-5 gap-6">
            <!-- Mức độ ưu tiên -->
            <div class="priority-column flex-shrink-0 relative">
              <div v-if="isNeglected(lead)" class="neglected-ribbon">Chăm sóc chậm</div>
              <div class="flex flex-col items-center gap-1.5">
                <div
                  class="priority-badge flex flex-col items-center justify-center text-white font-black"
                  :class="{ blinking: isCriticalWait(lead) }"
                  :style="{ backgroundColor: getPriority(lead).color }"
                >
                  <ArtSvgIcon :icon="getPriority(lead).icon" class="text-xl" />
                  <span class="text-[10px] tracking-tighter uppercase">{{
                    getPriority(lead).label
                  }}</span>
                </div>
                <div
                  class="flex items-center gap-1 text-[10px] font-bold"
                  :class="
                    dayjs().diff(dayjs(lead.createdAt), 'hour') >= 24
                      ? 'text-red-500'
                      : 'text-gray-400'
                  "
                >
                  <ArtSvgIcon icon="ri:time-line" />
                  {{ getWaitTime(lead.createdAt) }}
                </div>
              </div>
            </div>

            <!-- Định danh -->
            <div class="identity-column flex-shrink-0 w-72">
              <div class="flex items-center gap-4">
                <ElAvatar
                  :size="54"
                  class="bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-500 font-bold text-xl border-2 border-white"
                >
                  {{ lead.fullName.charAt(0) }}
                </ElAvatar>
                <div class="flex flex-col gap-1">
                  <h4 class="m-0 text-gray-900 font-extrabold text-lg line-clamp-1">{{
                    lead.fullName
                  }}</h4>
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500 font-bold">{{ lead.phoneNumber }}</span>
                    <div class="flex gap-1.5 ml-1">
                      <a
                        :href="'tel:' + lead.phoneNumber"
                        class="size-7 bg-green-500 text-white rounded-lg flex-cc hover:bg-green-600 transition-all"
                      >
                        <ArtSvgIcon icon="ri:phone-fill" class="text-xs" />
                      </a>
                      <div
                        class="size-7 bg-blue-500 text-white rounded-lg flex-cc hover:bg-blue-600 transition-all"
                      >
                        <ArtSvgIcon icon="ri:chat-1-fill" class="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nội dung -->
            <div class="interest-column flex-1 px-4 border-l border-r border-gray-50">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-base font-bold text-gray-700">{{
                    lead.interestedVehicle || 'Chưa xác định'
                  }}</span>
                  <ElTag
                    v-if="lead.interestedVehicle"
                    size="small"
                    :type="getVehicleBrandType(lead.interestedVehicle)"
                    effect="dark"
                    class="rounded-md border-none px-2 uppercase font-bold text-[10px]"
                  >
                    {{ getBrand(lead.interestedVehicle) }}
                  </ElTag>
                </div>
                <div class="flex items-center gap-1.5 text-xs">
                  <ArtSvgIcon icon="ri:megaphone-line" class="text-red-500" />
                  <span class="font-black text-gray-800">Mega Sale 2024</span>
                </div>
              </div>
            </div>

            <!-- Trạng thái -->
            <div class="status-column w-44 px-4 flex flex-col items-center justify-center">
              <ElTag
                :type="getStatusType(lead.status)"
                class="status-tag-premium w-full"
                effect="dark"
              >
                {{ getStatusLabel(lead.status) }}
              </ElTag>
              <div class="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider italic">
                Phễu: <span class="text-gray-600">{{ getFunnelStep(lead.status) }}</span>
              </div>
            </div>

            <!-- Sale phụ trách -->
            <div class="time-column w-48 text-right pr-4 border-l border-gray-50">
              <div class="flex flex-col gap-1.5 items-end">
                <span class="text-[11px] text-gray-400 font-bold uppercase tracking-tighter"
                  >Sale phụ trách</span
                >
                <ElSelect
                  :model-value="lead.saleId || null"
                  size="small"
                  class="sale-select"
                  :class="{ 'is-unassigned': !lead.saleId }"
                  :placeholder="!lead.saleId ? 'CHƯA BÀN GIAO' : 'Giao Sale...'"
                >
                  <ElOption
                    v-for="sale in salesList"
                    :key="sale.id"
                    :label="sale.name"
                    :value="sale.id"
                  />
                </ElSelect>
              </div>
            </div>

            <!-- Hành động -->
            <div class="action-column flex-shrink-0">
              <ElButton
                type="danger"
                circle
                class="size-11 flex-cc shadow-lg shadow-red-100 hover:scale-110 transition-transform"
                @click="$router.push('/customer/profile')"
              >
                <ArtSvgIcon icon="ri:arrow-right-line" class="text-lg" />
              </ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useLeadTable } from './hooks/useLeadTable'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/vi'

  dayjs.extend(relativeTime)
  dayjs.locale('vi')

  defineOptions({ name: 'CustomerPotential' })

  const {
    data,
    loading,
    pagination,
    handleSearch,
    handleReset,
    selectedIds,
    salesList,
    toggleSelect,
    getPriority
  } = useLeadTable()

  const searchModel = ref({})

  const getWaitTime = (date: string) => {
    const diff = dayjs().diff(dayjs(date), 'minute')
    if (diff < 60) return `${diff} phút`
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return `${hours}h ${mins}m`
  }

  const isCriticalWait = (lead: any) => {
    const priority = getPriority(lead)
    const diffInMinutes = dayjs().diff(dayjs(lead.createdAt), 'minute')
    return priority.level === 3 && diffInMinutes > 60
  }

  const searchItems = [
    {
      key: 'fullName',
      label: 'Tìm kiếm nhanh',
      type: 'input',
      props: { placeholder: 'Họ tên, SĐT...', clearable: true }
    },
    {
      key: 'source',
      label: 'Nguồn khách',
      type: 'select',
      props: {
        placeholder: 'Chọn nguồn...',
        clearable: true,
        options: [
          { label: 'Facebook', value: 'Facebook' },
          { label: 'Website', value: 'Website' }
        ]
      }
    }
  ]

  const getStatusType = (status: string) => {
    if (status === 'New') return 'info'
    if (status === 'TestDrive') return 'primary'
    return 'success'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'New') return 'Mới đăng ký'
    if (status === 'TestDrive') return 'Đang lái thử'
    return 'Đang tư vấn'
  }

  const getFunnelStep = (status: string) => {
    if (status === 'New') return 'Tiếp cận'
    return 'Cân nhắc'
  }

  const getVehicleBrandType = (v: string) =>
    v.toLowerCase().includes('honda') ? 'danger' : 'primary'
  const getBrand = (v: string) => (v.toLowerCase().includes('honda') ? 'Honda' : 'Hãng khác')
  const isNeglected = (lead: any) =>
    dayjs().diff(dayjs(lead.createdAt), 'hour') > 24 && lead.status === 'New'
  const isToday = (date: string) => dayjs(date).isSame(dayjs(), 'day')
</script>

<style lang="scss" scoped>
  .lead-management {
    .search-bar-wrapper {
      :deep(.el-form-item__label) {
        font-weight: 600;
        white-space: nowrap !important;
      }
    }

    .lead-row-card {
      position: relative;

      &.is-critical {
        animation: critical-blink 2s infinite;
      }

      .neglected-ribbon {
        position: absolute;
        top: -8px;
        right: -8px;
        z-index: 20;
        padding: 4px 12px;
        font-size: 10px;
        font-weight: 800;
        color: white;
        background: #ff4d4f;
        border-radius: 6px;
      }

      .priority-badge {
        display: flex;
        flex-direction: column;
        gap: 2px;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 60px;
        border-radius: 12px;

        &.blinking {
          animation: badge-blink 1s infinite;
        }
      }

      .sale-select.is-unassigned {
        :deep(.el-input__inner::placeholder) {
          font-weight: 800;
          color: #ef4444;
        }

        :deep(.el-input__wrapper) {
          background-color: #fef2f2;
        }
      }
    }
  }

  @keyframes critical-blink {
    50% {
      background-color: #fff1f0;
      border-color: #ff4d4f;
    }
  }

  @keyframes badge-blink {
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  .custom-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
    }
  }
</style>
