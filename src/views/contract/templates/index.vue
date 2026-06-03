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
            {{ t('menus.contract.templateList') }}
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
            <el-option label="Tất cả" value="" />
            <el-option :label="t('menus.contract.typeSales')" value="Sales" />
            <el-option :label="t('menus.contract.typeFinance')" value="Finance" />
            <el-option :label="t('menus.contract.typeSupplier')" value="Supplier" />
            <el-option :label="t('menus.contract.typeAppendix')" value="Appendix" />
          </el-select>
          <el-select
            v-model="filterStatus"
            :placeholder="t('menus.contract.templateStatus')"
            clearable
            class="!w-44"
            @change="handleFilterChange"
          >
            <el-option :label="t('menus.contract.filterAll')" value="" />
            <el-option :label="t('menus.contract.statusActive')" :value="1" />
            <el-option :label="t('menus.contract.statusInactive')" :value="2" />
            <el-option :label="t('menus.contract.statusDeprecated')" :value="3" />
          </el-select>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
        <el-table
          :data="tableData"
          style="width: 100%"
          :header-cell-style="headerCellStyle"
          :cell-style="cellStyle"
          stripe
          class="contract-templates-table"
        >
          <el-table-column prop="name" :label="t('menus.contract.templateName')" min-width="220">
            <template #default="{ row }">
              <div class="flex items-center gap-3">
                <div
                  class="size-9 rounded-lg flex-cc text-white font-black text-xs shrink-0"
                  :class="getTypeColor(row.type)"
                >
                  {{ getTypeAbbr(row.type) }}
                </div>
                <div class="overflow-hidden">
                  <div class="font-bold text-slate-800 truncate text-[13px]">{{ row.name }}</div>
                  <div class="text-[10px] font-mono text-slate-400">{{ row.code }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="type"
            :label="t('menus.contract.templateType')"
            width="140"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="getTypeTagType(row.type)"
                size="small"
                effect="plain"
                class="!rounded-lg !font-bold"
              >
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="version"
            :label="t('menus.contract.templateVersion')"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span class="font-mono font-bold text-slate-600">v{{ row.version }}</span>
            </template>
          </el-table-column>

          <el-table-column
            prop="status"
            :label="t('menus.contract.templateStatus')"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="getStatusTagType(row.status)"
                size="small"
                effect="dark"
                class="!rounded-lg !font-black !text-[10px] !uppercase !tracking-wider"
              >
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="isUsed" label="" width="80" align="center">
            <template #default="{ row }">
              <el-tooltip
                v-if="row.isUsed"
                :content="t('menus.contract.usedBadge')"
                placement="top"
              >
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase border border-amber-200"
                >
                  <ArtSvgIcon icon="ri:lock-line" class="text-xs" />
                  {{ t('menus.contract.usedBadge') }}
                </span>
              </el-tooltip>
              <span v-else class="text-emerald-500">
                <ArtSvgIcon icon="ri:checkbox-circle-line" class="text-lg" />
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="Ngày tạo" width="120" align="center">
            <template #default="{ row }">
              <span class="text-[11px] font-medium text-slate-500">{{
                formatDate(row.createdAt)
              }}</span>
            </template>
          </el-table-column>

          <el-table-column label="" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-2">
                <el-tooltip :content="t('menus.contract.templateEdit')" placement="top">
                  <el-button
                    size="small"
                    type="primary"
                    circle
                    plain
                    @click="handleEdit(row)"
                    :disabled="row.isUsed"
                    class="!w-8 !h-8"
                  >
                    <ArtSvgIcon icon="ri:edit-2-line" class="text-sm" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="t('menus.contract.templateClone')" placement="top">
                  <el-button
                    size="small"
                    type="success"
                    circle
                    plain
                    @click="handleClone(row)"
                    class="!w-8 !h-8"
                  >
                    <ArtSvgIcon icon="ri:file-copy-line" class="text-sm" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="t('menus.contract.templateDelete')" placement="top">
                  <el-button
                    size="small"
                    type="danger"
                    circle
                    plain
                    @click="handleDelete(row)"
                    :disabled="row.isUsed"
                    class="!w-8 !h-8"
                  >
                    <ArtSvgIcon icon="ri:delete-bin-line" class="text-sm" />
                  </el-button>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div
          class="border-t border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50"
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
  } from '@/api/contract-template.api'
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

  const headerCellStyle = () => ({
    background: '#f8fafc',
    color: '#64748b',
    fontWeight: 800,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0',
  })

  const cellStyle = () => ({
    padding: '12px 16px',
    borderBottom: '1px solid #f1f5f9',
  })

  const getTypeAbbr = (type: string) => {
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

  const getStatusTagType = (status: number) => {
    const map: Record<number, string> = { 1: 'success', 2: 'info', 3: 'danger' }
    return map[status] || 'info'
  }

  const getStatusLabel = (status: number) => {
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
    } catch (err) {
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

  const handleClone = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `Nhân bản mẫu "${row.name}" thành phiên bản mới? Mẫu mới sẽ có version v${parseFloat(String(row.version)) + 0.1} và được kích hoạt ngay.`,
        'Nhân bản Mẫu Hợp đồng',
        { confirmButtonText: 'Nhân bản', cancelButtonText: 'Hủy', type: 'info' },
      )
      await cloneContractTemplate(row.id)
      ElMessage.success(t('menus.contract.cloneSuccess'))
      fetchTemplates()
    } catch (e) {
      // User cancelled
    }
  }

  const handleDelete = async (row: any) => {
    try {
      await ElMessageBox.confirm(t('menus.contract.confirmDeleteTemplate'), 'Xóa Mẫu Hợp đồng', {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      })
      await deleteContractTemplate(row.id)
      ElMessage.success(t('menus.contract.deleteSuccess'))
      fetchTemplates()
    } catch (e) {
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
      font-weight: 700;
      border-radius: 8px;
      margin: 0 2px;
    }
  }
</style>
