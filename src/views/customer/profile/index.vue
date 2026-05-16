<template>
  <div class="customer-profile-management flex flex-col gap-6 pb-10">
    <div class="page-header flex items-center justify-between px-4">
      <h2 class="m-0 text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
        <ArtSvgIcon icon="ri:user-search-line" class="text-blue-600" />
        Hồ sơ & Danh bạ khách hàng
      </h2>
      <ElButton type="primary" round class="shadow-md shadow-blue-100" @click="handleAdd">
        <ArtSvgIcon icon="ri:user-add-line" class="mr-2" /> Thêm khách hàng mới
      </ElButton>
    </div>

    <!-- Smart Filter Bar -->
    <div class="search-bar-wrapper bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mx-4">
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

    <!-- Customer Database List -->
    <div class="content-section px-4" v-loading="loading">
      <div v-if="data.length > 0" class="flex flex-col gap-4">
        <div 
          v-for="customer in data" 
          :key="customer.id" 
          class="customer-row-container flex flex-col"
        >
          <!-- Customer Row Card -->
          <div 
            class="customer-row-card group bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 flex items-center hover:border-blue-200 cursor-pointer overflow-hidden"
            :class="{ 
              'is-expanded': expandedId === customer.id 
            }"
            @click="handleToggleExpand(customer.id)"
          >
            <div class="flex flex-1 items-center p-5 gap-6">
              
              <!-- 1. Cột Mức độ ưu tiên (Priority) -->
              <div class="priority-column flex-shrink-0 w-24 flex flex-cc">
                <div 
                  class="priority-label flex flex-col items-center justify-center p-2 rounded-xl text-white w-20 h-14"
                  :style="{ backgroundColor: getPriority(customer).color }"
                >
                  <ArtSvgIcon :icon="getPriority(customer).icon" class="text-xl" />
                  <span class="text-[9px] font-black tracking-tighter uppercase">{{ getPriority(customer).label }}</span>
                </div>
              </div>

              <!-- 2. Cột Định danh & Nguồn (Identity & Source) -->
              <div class="identity-column flex-shrink-0 w-64 border-l border-gray-50 pl-4">
                <div class="flex items-center gap-3">
                  <div class="flex flex-col">
                    <h4 class="m-0 text-gray-900 font-extrabold text-base group-hover:text-blue-600 transition-colors">
                      {{ customer.fullName }}
                    </h4>
                    <div class="flex items-center gap-2 mt-1">
                      <!-- Source Icons -->
                      <ElTooltip :content="'Nguồn: ' + customer.source">
                        <div class="size-5 rounded-md flex-cc" :class="getSourceClass(customer.source)">
                          <ArtSvgIcon :icon="getSourceIcon(customer.source)" class="text-[10px]" />
                        </div>
                      </ElTooltip>
                      <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Mega Sale 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. Cột Giai đoạn phễu (Pipeline Stage) -->
              <div class="pipeline-column w-40 px-4 border-l border-gray-50 flex flex-col items-center justify-center">
                <ElTag :type="getPipelineType(customer.status)" effect="dark" round size="small" class="font-bold border-none w-full text-center py-1 h-auto">
                  {{ getPipelineLabel(customer.status) }}
                </ElTag>
                <span class="text-[10px] text-gray-400 mt-1 font-bold">ID: {{ customer.id }}</span>
              </div>

              <!-- 4. Cột Ghi chú gần nhất (Last Note) -->
              <div class="note-column flex-1 px-4 border-l border-gray-50">
                <div class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Ghi chú gần nhất</span>
                  <p class="m-0 text-xs text-gray-600 italic line-clamp-1">
                    "{{ getLastNote(customer) }}"
                  </p>
                </div>
              </div>

              <!-- 5. Cột Người phụ trách (Assignee) -->
              <div class="assignee-column w-48 px-4 border-l border-gray-50">
                <div class="flex flex-col gap-1.5" @click.stop>
                  <span class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Người phụ trách</span>
                  <ElSelect 
                    :model-value="customer.saleId || null" 
                    size="small" 
                    class="sale-select-premium"
                    :placeholder="!customer.saleId ? 'CHƯA BÀN GIAO' : 'Giao Sale...'"
                  >
                    <ElOption v-for="sale in salesList" :key="sale.id" :label="sale.name" :value="sale.id" />
                  </ElSelect>
                </div>
              </div>

              <!-- Quick Actions & Expand Indicator -->
              <div class="flex items-center gap-2 border-l border-gray-50 pl-6 pr-2">
                <div class="flex gap-1" @click.stop>
                  <ElTooltip content="Chỉnh sửa hồ sơ">
                    <div 
                      class="size-8 bg-gray-50 text-gray-400 rounded-lg flex-cc hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                      @click="handleEdit(customer)"
                    >
                      <ArtSvgIcon icon="ri:edit-line" class="text-sm" />
                    </div>
                  </ElTooltip>
                  <ElTooltip content="Xóa khách hàng">
                    <div 
                      class="size-8 bg-gray-50 text-gray-400 rounded-lg flex-cc hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                      @click="handleDelete(customer)"
                    >
                      <ArtSvgIcon icon="ri:delete-bin-7-line" class="text-sm" />
                    </div>
                  </ElTooltip>
                </div>
                <div class="h-6 w-px bg-gray-100 mx-2"></div>
                <ArtSvgIcon 
                  :icon="expandedId === customer.id ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" 
                  class="text-xl text-gray-300"
                />
              </div>
            </div>
          </div>

          <!-- Expanded 3-Column Dashboard -->
          <div v-if="expandedId === customer.id" class="expansion-container">
            <CustomerDetailExpansion :lead="customer" />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading" class="empty-state p-20 flex flex-col items-center bg-white rounded-3xl border border-dashed border-gray-200 mx-4">
        <ArtSvgIcon icon="ri:user-search-line" class="text-6xl text-gray-200 mb-4" />
        <p class="text-gray-400 font-bold">Không tìm thấy khách hàng nào phù hợp</p>
      </div>
    </div>

    <!-- Customer Form Dialog -->
    <CustomerFormDialog v-model="addDialogVisible" :initial-data="editData" @success="refreshData" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useLeadTable } from '../potential/hooks/useLeadTable'
  import CustomerDetailExpansion from '../components/CustomerDetailExpansion.vue'
  import CustomerFormDialog from '../components/CustomerFormDialog.vue'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/vi'

  dayjs.extend(relativeTime)
  dayjs.locale('vi')

  defineOptions({ name: 'CustomerProfileManagement' })

  // Reusing useLeadTable logic for customer list
  const {
    data,
    loading,
    refreshData,
    handleSearch,
    handleReset,
    salesList,
    getPriority
  } = useLeadTable()

  const searchModel = ref({})
  const expandedId = ref<number | null>(null)
  const addDialogVisible = ref(false)
  const editData = ref<any>(null)

  const handleToggleExpand = (id: number) => {
    expandedId.value = expandedId.value === id ? null : id
  }

  const handleAdd = () => {
    editData.value = null
    addDialogVisible.value = true
  }

  const handleEdit = (customer: any) => {
    editData.value = { ...customer }
    addDialogVisible.value = true
  }

  const handleDelete = (customer: any) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa hồ sơ khách hàng ${customer.fullName}? Dữ liệu này không thể khôi phục.`,
      'Cảnh báo xóa dữ liệu',
      {
        confirmButtonText: 'XÓA NGAY',
        cancelButtonText: 'HỦY',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    ).then(() => {
      ElMessage.success('Đã xóa hồ sơ khách hàng thành công')
      refreshData()
    })
  }

  const searchItems = [
    { key: 'fullName', label: 'Tên khách hàng', type: 'input', props: { placeholder: 'Nhập tên hoặc SĐT...', clearable: true } },
    { key: 'status', label: 'Loại khách', type: 'select', props: { placeholder: 'Tất cả trạng thái', clearable: true, options: [
      { label: 'Chính thức', value: 'Official' },
      { label: 'Đang mua', value: 'Purchasing' },
      { label: 'Tiềm năng', value: 'Potential' }
    ]}}
  ]

  // --- Helpers for the new columns ---
  
  const getSourceIcon = (source: string) => {
    if (source === 'Facebook') return 'ri:facebook-fill'
    if (source === 'Website') return 'ri:global-line'
    return 'ri:store-2-line'
  }

  const getSourceClass = (source: string) => {
    if (source === 'Facebook') return 'bg-blue-600 text-white'
    if (source === 'Website') return 'bg-emerald-500 text-white'
    return 'bg-orange-500 text-white'
  }

  const getPipelineLabel = (status: string) => {
    const map: any = {
      'New': 'Mới đăng ký',
      'TestDrive': 'Đã lái thử',
      'Negotiating': 'Thương lượng',
      'Consulting': 'Đang tư vấn',
      'Won': 'Đã chốt đơn',
      'Official': 'Khách chính thức'
    }
    return map[status] || 'Đang tư vấn'
  }

  const getPipelineType = (status: string) => {
    if (status === 'New') return 'info'
    if (status === 'TestDrive' || status === 'Negotiating') return 'warning'
    if (status === 'Won' || status === 'Official') return 'success'
    return 'primary'
  }

  const getLastNote = (customer: any) => {
    // Mocking last notes based on some logic or hardcoded for demo
    const notes = [
      "Khách thích màu đỏ đen nhám",
      "Đang chờ duyệt hồ sơ trả góp",
      "Đã gửi báo giá lăn bánh chi tiết",
      "Hẹn xem xe vào sáng Thứ 7",
      "Quan tâm đến chính sách bảo hành 3 năm"
    ]
    return notes[customer.id % notes.length]
  }

  const formatRelativeTime = (date: string) => dayjs(date).fromNow()
</script>

<style lang="scss" scoped>
  .customer-profile-management {
    .customer-row-card {
      border: 1px solid #f3f4f6;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
        border-color: #3b82f6;
        background-color: #f8faff;
      }

      &.is-expanded {
        border-color: #3b82f6;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        background-color: white;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }

      .priority-label {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s;
        &:hover { transform: scale(1.05); }
      }

      .sale-select-premium {
        :deep(.el-input__wrapper) {
          border-radius: 8px;
          background-color: #f3f4f6;
          border: none;
          box-shadow: none;
          &:hover { background-color: #e5e7eb; }
        }
      }
    }

    .expansion-container {
      border: 1px solid #3b82f6;
      border-top: none;
      border-bottom-left-radius: 1.5rem;
      border-bottom-right-radius: 1.5rem;
      overflow: hidden;
      background-color: #fafafa;
    }

    .search-bar-wrapper {
      :deep(.el-form-item__label) {
        white-space: nowrap !important;
        font-weight: 600;
        color: #4b5563;
      }
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
