<!-- MenuQuản lýtrangmặt -->
<template>
  <div class="menu-page art-full-height">
    <!-- TimKiemlan -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card">
      <!-- Bảngđầubộ -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-auth="'add'" @click="handleAddMenu" v-ripple>{{ $t('admin.t124') }}</ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? 'Thu gọn' : 'Mở rộng' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="path"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <!-- MenuPopup -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :editData="editData"
        :lockType="lockMenuType"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import type { AppRouteRecord } from '@/types/router'
  import MenuDialog from './modules/menu-dialog.vue'
  import { fetchGetMenuList } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Menus' })

  // Trạng tháiQuản lý
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // Popupđóng
  const dialogVisible = ref(false)
  const dialogType = ref<'menu' | 'button'>('menu')
  const editData = ref<AppRouteRecord | any>(null)
  const lockMenuType = ref(false)

  // TimKiemđóng
  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: 'Menudanhtên',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: 'RoutingDiaChi',
      key: 'route',
      type: 'input',
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  /**
   * LấyMenuDanh sáchDữ liệu
   */
  const getMenuList = async (): Promise<void> => {
    loading.value = true

    try {
      const list = await fetchGetMenuList()
      tableData.value = list
    } catch (error) {
      throw error instanceof Error ? error : new Error('LấyMenuThatBai')
    } finally {
      loading.value = false
    }
  }

  /**
   * LấyMenuloạikiểuTagMàu sắc
   * @param row MenudòngDữ liệu
   * @returns TagMàu sắcloạikiểu
   */
  const getMenuTypeTag = (
    row: AppRouteRecord
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (row.meta?.isAuthButton) return 'danger'
    if (row.children?.length) return 'info'
    if (row.meta?.link && row.meta?.isIframe) return 'success'
    if (row.path) return 'primary'
    if (row.meta?.link) return 'warning'
    return 'info'
  }

  /**
   * LấyMenuloạikiểuvănquyển
   * @param row MenudòngDữ liệu
   * @returns Menuloạikiểuvănquyển
   */
  const getMenuTypeText = (row: AppRouteRecord): string => {
    if (row.meta?.isAuthButton) return 'Nút'
    if (row.children?.length) return 'mụclục'
    if (row.meta?.link && row.meta?.isIframe) return 'trongnhúng'
    if (row.path) return 'Menu'
    if (row.meta?.link) return 'ngoàiliên'
    return 'Chưabáo'
  }

  // BảngcộtCauHinh
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: 'Menudanhtên',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => formatMenuTitle(row.meta?.title)
    },
    {
      prop: 'type',
      label: 'Menuloạikiểu',
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: 'Routing',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.isAuthButton) return ''
        return row.meta?.link || row.path || ''
      }
    },
    {
      prop: 'meta.authList',
      label: 'QuyenHantiêu',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.isAuthButton) {
          return row.meta?.authMark || ''
        }
        if (!row.meta?.authList?.length) return ''
        return `${row.meta.authList.length} chiếcQuyenHantiêu`
      }
    },
    {
      prop: 'date',
      label: 'Chỉnh sửaThoiGian',
      formatter: () => '2022-3-12 12:00:00'
    },
    {
      prop: 'status',
      label: 'Trạng thái',
      formatter: () => h(ElTag, { type: 'success' }, () => 'Bật')
    },
    {
      prop: 'operation',
      label: 'HanhDong',
      width: 180,
      align: 'right',
      formatter: (row: AppRouteRecord) => {
        const buttonStyle = { style: 'text-align: right' }

        if (row.meta?.isAuthButton) {
          return h('div', buttonStyle, [
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => handleEditAuth(row)
            }),
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDeleteAuth()
            })
          ])
        }

        return h('div', buttonStyle, [
          h(ArtButtonTable, {
            type: 'add',
            onClick: () => handleAddAuth(),
            title: 'Thêm mớiQuyenHan'
          }),
          h(ArtButtonTable, {
            type: 'edit',
            onClick: () => handleEditMenu(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => handleDeleteMenu()
          })
        ])
      }
    }
  ])

  // Dữ liệuđóng
  const tableData = ref<AppRouteRecord[]>([])

  /**
   * Đặt lạiTimKiemđiềuphần tử
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getMenuList()
  }

  /**
   * ThựcdòngTimKiem
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    getMenuList()
  }

  /**
   * Làm mớiMenuDanh sách
   */
  const handleRefresh = (): void => {
    getMenuList()
  }

  /**
   * thâmđộkhắcDoiTuong
   * @param obj cầnkhắccủaDoiTuong
   * @returns khắcsaucủaDoiTuong
   */
  const deepClone = <T,>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj) as T
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * tươngQuyenHanDanh sáchchuyểnđổivìtửtiếtđiểm
   * @param items MenumụcMảng
   * @returns chuyểnđổisaucủaMenumụcMảng
   */
  const convertAuthListToChildren = (items: AppRouteRecord[]): AppRouteRecord[] => {
    return items.map((item) => {
      const clonedItem = deepClone(item)

      if (clonedItem.children?.length) {
        clonedItem.children = convertAuthListToChildren(clonedItem.children)
      }

      if (item.meta?.authList?.length) {
        const authChildren: AppRouteRecord[] = item.meta.authList.map(
          (auth: { title: string; authMark: string }) => ({
            path: `${item.path}_auth_${auth.authMark}`,
            name: `${String(item.name)}_auth_${auth.authMark}`,
            meta: {
              title: auth.title,
              authMark: auth.authMark,
              isAuthButton: true,
              parentPath: item.path
            }
          })
        )

        clonedItem.children = clonedItem.children?.length
          ? [...clonedItem.children, ...authChildren]
          : authChildren
      }

      return clonedItem
    })
  }

  /**
   * TimKiemMenu
   * @param items MenumụcMảng
   * @returns TimKiemKetQuaMảng
   */
  const searchMenu = (items: AppRouteRecord[]): AppRouteRecord[] => {
    const results: AppRouteRecord[] = []

    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.route?.toLowerCase().trim() || ''
      const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch) {
        results.push(deepClone(item))
      }
    }

    return results
  }

  // qualọcsaucủaBảngDữ liệu
  const filteredTableData = computed(() => {
    const searchedData = searchMenu(tableData.value)
    return convertAuthListToChildren(searchedData)
  })

  /**
   * Thêm mớiMenu
   */
  const handleAddMenu = (): void => {
    dialogType.value = 'menu'
    editData.value = null
    lockMenuType.value = true
    dialogVisible.value = true
  }

  /**
   * Thêm mớiQuyenHanNút
   */
  const handleAddAuth = (): void => {
    dialogType.value = 'menu'
    editData.value = null
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * Chỉnh sửaMenu
   * @param row MenudòngDữ liệu
   */
  const handleEditMenu = (row: AppRouteRecord): void => {
    dialogType.value = 'menu'
    editData.value = row
    lockMenuType.value = true
    dialogVisible.value = true
  }

  /**
   * Chỉnh sửaQuyenHanNút
   * @param row QuyenHandòngDữ liệu
   */
  const handleEditAuth = (row: AppRouteRecord): void => {
    dialogType.value = 'button'
    editData.value = {
      title: row.meta?.title,
      authMark: row.meta?.authMark
    }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * MenuFormDữ liệuloạikiểu
   */
  interface MenuFormData {
    name: string
    path: string
    component?: string
    icon?: string
    roles?: string[]
    sort?: number
    [key: string]: any
  }

  /**
   * GửiFormDữ liệu
   * @param formData FormDữ liệu
   */
  const handleSubmit = (formData: MenuFormData): void => {
    console.log('GửiDữ liệu:', formData)
    // TODO: điềudùngAPILưutồnDữ liệu
    getMenuList()
  }

  /**
   * XóaMenu
   */
  const handleDeleteMenu = async (): Promise<void> => {
    try {
      await ElMessageBox.confirm('Xác địnhcầnXóanênMenukhông？Xóasauvôphápkhôiphục', 'Gợi ý', {
        confirmButtonText: 'Xác định',
        cancelButtonText: 'Hủy',
        type: 'warning'
      })
      ElMessage.success('XóaThanhCong')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('XóaThatBai')
      }
    }
  }

  /**
   * XóaQuyenHanNút
   */
  const handleDeleteAuth = async (): Promise<void> => {
    try {
      await ElMessageBox.confirm('Xác địnhcầnXóanênQuyenHankhông？Xóasauvôphápkhôiphục', 'Gợi ý', {
        confirmButtonText: 'Xác định',
        cancelButtonText: 'Hủy',
        type: 'warning'
      })
      ElMessage.success('XóaThanhCong')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('XóaThatBai')
      }
    }
  }

  /**
   * Chuyển đổiMở rộng/Thu gọnnêncóMenu
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: AppRouteRecord[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }
</script>
