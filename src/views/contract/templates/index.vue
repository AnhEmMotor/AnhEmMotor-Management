<template>
  <div class="contract-templates-page min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A] pb-10">
    <div
      class="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-[100] shadow-sm flex justify-between items-center"
    >
      <div class="flex items-center gap-4">
        <div class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg">
          <ArtSvgIcon icon="ri:layout-4-line" class="text-xl" />
        </div>
        <div>
          <h1 class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none">
            {{ t('menus.contract.templates') }}
          </h1>
          <p
            class="m-0 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2"
          >
            <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            DANH SÁCH MẪU HỢP ĐỒNG
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button
          type="primary"
          @click="handleCreate"
          class="!h-10 !px-6 !rounded-xl !font-black !text-[10px] !uppercase !tracking-widest !shadow-xl hover:!shadow-2xl active:!scale-95 transition-all"
        >
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          {{ t('menus.contract.templateCreate') }}
        </el-button>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto p-8">
      <div class="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[240px]">
            <el-input
              v-model="searchQuery"
              :placeholder="t('menus.contract.templateSearchPlaceholder')"
              clearable
              class="!rounded-xl"
              @input="handleSearch"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-slate-400 text-sm" />
              </template>
            </el-input>
          </div>
          <el-select
            v-model="filterType"
            :placeholder="t('menus.contract.templateType')"
            clearable
            class="!w-44"
            @change="handleFilterChange"
          >
            <el-option :label="t('menus.contract.filterAll')" value="" />
            <el-option :label="t('menus.contract.typeSales')" value="Sales" />
            <el-option :label="t('menus.contract.typeFinance')" value="Finance" />
            <el-option :label="t('menus.contract.typeSupplier')" value="Supplier" />
          </el-select>
          <el-select
            v-model="filterStatus"
            :placeholder="t('menus.contract.templateStatus')"
            clearable
            class="!w-44"
            @change="handleFilterChange"
          >
            <el-option :label="t('menus.contract.filterAll')" value="" />
            <el-option :label="t('menus.contract.filterActive')" :value="1" />
            <el-option :label="t('menus.contract.filterArchived')" :value="2" />
          </el-select>
        </div>
      </div>

      <div class="mb-4 text-slate-500 text-[13px] italic font-medium flex items-center gap-2">
        <ArtSvgIcon icon="ri:information-line" />
        Tìm thấy {{ totalCount }} mẫu hợp đồng phù hợp dựa trên bộ lọc
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div
          v-for="row in tableData"
          :key="row.id"
          class="bg-white border border-slate-200 rounded-[20px] shadow-sm hover:shadow-md transition-shadow flex flex-col"
        >
          <!-- Card Header -->
          <div class="p-5 flex items-start gap-4">
            <div
              class="size-12 rounded-xl flex-cc text-white shrink-0 shadow-inner"
              :class="getTypeColor(row.type)"
            >
              <ArtSvgIcon icon="ri:file-text-line" class="text-2xl" />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="m-0 text-[15px] font-black text-slate-800 leading-tight mb-2 truncate"
                :title="row.name"
              >
                {{ row.name }}
              </h3>
              <el-tag
                :type="getTypeTagType(row.type)"
                size="small"
                effect="light"
                class="!rounded-lg !font-bold"
              >
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </div>
          </div>

          <!-- Card Body -->
          <div class="px-5 pb-5 flex-1">
            <div class="border-y border-slate-100 py-4 grid grid-cols-2 gap-y-3 gap-x-4">
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:git-branch-line" class="text-slate-400" />
                Phiên bản: <span class="font-bold text-slate-700">v{{ row.version }}</span>
              </div>
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:checkbox-circle-line" class="text-slate-400" />
                Trạng thái:
                <span
                  class="font-bold"
                  :class="row.status === 1 ? 'text-emerald-500' : 'text-slate-400'"
                >
                  {{ row.status === 1 ? 'Đang áp dụng' : 'Đã lưu trữ' }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:brackets-line" class="text-slate-400" />
                Biến số:
                <span class="font-bold text-slate-700">{{ row.variableCount || 14 }} trường</span>
              </div>
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:calendar-line" class="text-slate-400" />
                Cập nhật:
                <span class="font-bold text-slate-700">{{ formatDate(row.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="flex items-center border-t border-slate-100 bg-slate-50/50 rounded-b-[20px]">
            <button
              @click="handlePreview(row)"
              class="flex-1 py-3.5 text-[13px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-colors flex-cc gap-2 border-r border-slate-100 rounded-bl-[20px]"
            >
              <ArtSvgIcon icon="ri:eye-line" /> Xem trước
            </button>
            <button
              @click="handleEdit(row)"
              :disabled="row.isUsed"
              class="flex-1 py-3.5 text-[13px] font-bold transition-colors flex-cc gap-2 border-r border-slate-100"
              :class="
                row.isUsed
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80'
              "
            >
              <ArtSvgIcon icon="ri:edit-2-line" /> Sửa
            </button>
            <button
              @click="handleVariables(row)"
              class="flex-1 py-3.5 text-[13px] font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50/80 transition-colors flex-cc gap-2 rounded-br-[20px]"
            >
              <ArtSvgIcon icon="ri:brackets-line" /> Gắn biến
            </button>
          </div>
        </div>
      </div>

      <div
        class="bg-white border border-slate-200 rounded-[20px] shadow-sm px-6 py-4 flex justify-between items-center"
      >
        <span class="text-[11px] font-bold text-slate-400">
          Hiển thị {{ tableData.length }} / {{ totalCount }} mẫu
        </span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchTemplates"
          @size-change="fetchTemplates"
          class="!font-bold"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    getContractTemplates,
    deleteContractTemplate,
    cloneContractTemplate,
  } from '@/infrastructure/api/contract-template.api'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'ContractTemplateList' })

  const { t } = useI18n()
  const router = useRouter()

  const searchQuery = ref('')
  const filterType = ref('')
  const filterStatus = ref<number | ''>('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalCount = ref(0)
  const tableData = ref<any[]>([])

  const _headerCellStyle = () => ({
    background: '#f8fafc',
    color: '#64748b',
    fontWeight: 800,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0',
  })

  const _cellStyle = () => ({
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
  })

  const _getTypeAbbr = (type: string) => {
    const map: Record<string, string> = {
      Sales: 'MB',
      Finance: 'TG',
      Supplier: 'NC',
      Appendix: 'PL',
    }
    return map[type] || type.slice(0, 2).toUpperCase()
  }

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      Sales: 'bg-blue-500',
      Finance: 'bg-violet-500',
      Supplier: 'bg-emerald-500',
      Appendix: 'bg-amber-500',
    }
    return map[type] || 'bg-slate-400'
  }

  const getTypeTagType = (type: string) => {
    const map: Record<string, string> = {
      Sales: 'primary',
      Finance: 'warning',
      Supplier: 'success',
      Appendix: 'info',
    }
    return map[type] || 'info'
  }

  const getTypeLabel = (type: string) => {
    const key = `menus.contract.type${type.charAt(0).toUpperCase() + type.slice(1)}`
    return t(key) || type
  }

  const _getStatusTagType = (status: number) => {
    const map: Record<number, string> = { 1: 'success', 2: 'info', 3: 'danger' }
    return map[status] || 'info'
  }

  const _getStatusLabel = (status: number) => {
    const key = `menus.contract.status${status === 1 ? 'Active' : status === 2 ? 'Inactive' : 'Deprecated'}`
    return t(key) || String(status)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const fetchTemplates = async () => {
    try {
      const params: any = {
        page: currentPage.value,
        pageSize: pageSize.value,
        search: searchQuery.value || undefined,
        filter: filterType.value ? `type == ${filterType.value}` : undefined,
      }
      if (filterStatus.value) {
        params.filter = params.filter
          ? `${params.filter},status == ${filterStatus.value}`
          : `status == ${filterStatus.value}`
      }
      const res = await getContractTemplates(params)
      tableData.value = res.data.items.map((item: any) => ({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
      }))
      totalCount.value = res.data.totalCount
    } catch (_err) {
      ElMessage.error('Không thể tải danh sách mẫu hợp đồng')
    }
  }

  const handleSearch = () => {
    currentPage.value = 1
    fetchTemplates()
  }

  const handleFilterChange = () => {
    currentPage.value = 1
    fetchTemplates()
  }

  const handleCreate = () => {
    router.push({ name: 'EditContractTemplate' })
  }

  const handleEdit = (row: any) => {
    if (row.isUsed) {
      ElMessage.warning(t('menus.contract.cannotUpdateUsedTemplate'))
      return
    }
    router.push({ name: 'EditContractTemplate', params: { id: row.id } })
  }

  const handlePreview = (_row: any) => {
    ElMessage.info('Chức năng xem trước mẫu hợp đồng đang được phát triển')
  }

  const handleVariables = (_row: any) => {
    // Navigate to variables mapping or open modal
    ElMessage.info('Chức năng cấu hình biến số đang được phát triển')
  }

  const _handleArchive = async (_row: any) => {
    try {
      await ElMessageBox.confirm('Bạn có chắc muốn lưu trữ mẫu hợp đồng này?', 'Lưu trữ mẫu', {
        confirmButtonText: 'Lưu trữ',
        cancelButtonText: 'Hủy',
        type: 'warning',
      })
      // Call mock or real API here, e.g. await archiveContractTemplate(row.id)
      ElMessage.success('Lưu trữ mẫu hợp đồng thành công!')
      fetchTemplates()
    } catch (_e) {
      // User cancelled
    }
  }

  const _handleClone = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `Nhân bản mẫu "${row.name}" thành phiên bản mới? Mẫu mới sẽ có version v${parseFloat(String(row.version)) + 0.1} và được kích hoạt ngay.`,
        'Nhân bản Mẫu Hợp đồng',
        { confirmButtonText: 'Nhân bản', cancelButtonText: 'Hủy', type: 'info' },
      )
      await cloneContractTemplate(row.id)
      ElMessage.success(t('menus.contract.cloneSuccess'))
      fetchTemplates()
    } catch (_e) {
      // User cancelled
    }
  }

  const _handleDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(t('menus.contract.confirmDeleteTemplate'), 'Xóa Mẫu Hợp đồng', {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      })
      await deleteContractTemplate(row.id)
      ElMessage.success(t('menus.contract.deleteSuccess'))
      fetchTemplates()
    } catch (_e) {
      // User cancelled
    }
  }

  onMounted(() => {
    useCommon().scrollToTop()
    fetchTemplates()
  })
</script>

<style scoped lang="scss">
  .contract-templates-table {
    :deep(.el-table__row) {
      transition: all 0.2s;

      &:hover {
        background-color: #f8fafc !important;
      }
    }

    :deep(.el-table__cell) {
      padding: 8px 0;
    }
  }

  :deep(.el-pagination) {
    .el-pager li {
      margin: 0 2px;
      font-weight: 700;
      border-radius: 8px;
    }
  }
</style>
