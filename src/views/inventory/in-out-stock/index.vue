<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Stats Cards -->
    <div class="grid grid-cols-5 gap-4">
      <ArtStatsCard
        title="Tổng đã nhập"
        :count="totalStats.imported"
        icon="ri:download-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Tổng đã xuất"
        :count="totalStats.exported"
        icon="ri:upload-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Tổng tồn kho"
        :count="totalStats.inStock"
        icon="ri:archive-line"
        iconStyle="bg-warning"
      />
      <ArtStatsCard
        title="Tổng đã đặt"
        :count="totalStats.ordered"
        icon="ri:shopping-cart-2-line"
        iconStyle="bg-danger"
      />
      <ArtStatsCard
        title="Tổng còn lại"
        :count="totalStats.remaining"
        icon="ri:check-double-line"
        iconStyle="bg-info"
      />
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="150"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Table Card -->
    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader :showColumns="false" @refresh="refreshData">
        <template #left>
          <div class="flex items-center gap-2">
            <h4 class="m-0 font-bold text-gray-800 text-lg">Báo cáo Xuất - Nhập - Tồn</h4>
            <ElButton type="primary" :loading="exporting" @click="handleExport" class="ml-4">
              <ElIcon class="mr-1"><Download /></ElIcon> Xuất báo cáo
            </ElButton>
          </div>
        </template>
        <template #right>
          <ElButton type="primary" link @click="expandAll">Mở rộng tất cả</ElButton>
          <ElButton type="info" link @click="collapseAll">Thu gọn tất cả</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :data="filteredTableData"
        :columns="columns"
        row-key="id"
        default-expand-all
      >
        <!-- Custom slot for product/variant/color name with indentation support and icon indicators -->
        <template #name="{ row }">
          <span class="inline-flex items-center gap-2 text-left align-middle">
            <span :class="getNameClass(row)">{{ row.name }}</span>
          </span>
        </template>

        <!-- Custom slot for showing remaining with custom warning colors if low -->
        <template #remaining="{ row }">
          <span :class="getRemainingClass(row)">
            {{ row.remaining }}
          </span>
        </template>

        <!-- Custom slot for operation (only leaf nodes can click) -->
        <template #operation="{ row }">
          <ElButton
            v-if="isLeafNode(row)"
            type="primary"
            link
            size="small"
            @click="handleViewHistory(row)"
          >
            <ElIcon class="mr-1"><Memo /></ElIcon> Chi tiết phiếu
          </ElButton>
          <span v-else class="text-gray-300 font-light text-xs">-</span>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Dialog for viewing transactions list (Goods Receipts & Sales Invoices) -->
    <ElDialog
      v-model="dialogVisible"
      :title="`Lịch sử giao dịch biến động kho: ${selectedRowName}`"
      width="850px"
      append-to-body
      destroy-on-close
    >
      <div v-if="selectedRow" class="flex flex-col gap-4">
        <!-- Summary Alert -->
        <div class="p-3 bg-gray-50 border border-gray-100 rounded flex gap-4 text-sm text-gray-600">
          <div><strong>Tồn kho hiện tại:</strong> {{ selectedRow.inStock }} xe</div>
          <div><strong>Đã nhập:</strong> {{ selectedRow.imported }} xe</div>
          <div><strong>Đã xuất:</strong> {{ selectedRow.exported }} xe</div>
          <div><strong>Đã đặt trước:</strong> {{ selectedRow.ordered }} xe</div>
        </div>

        <!-- Tabs for Goods Receipts vs Sales Invoices -->
        <ElTabs v-model="activeTab" class="pl-4 pr-2">
          <!-- Goods Receipts Tab -->
          <ElTabPane name="receipts">
            <template #label>
              <span class="flex items-center gap-1">
                <span>Phiếu Nhập Hàng ({{ mockReceipts.length }})</span>
              </span>
            </template>
            <ElTable :data="mockReceipts" border stripe style="width: 100%">
              <ElTableColumn prop="supplier" label="Nhà cung cấp" min-width="180" />
              <ElTableColumn prop="quantity" label="SL nhập" width="100" align="right" />
              <ElTableColumn prop="price" label="Đơn giá nhập" width="150" align="right">
                <template #default="{ row }"> {{ row.price.toLocaleString() }} VNĐ </template>
              </ElTableColumn>
              <ElTableColumn prop="date" label="Ngày nhập" width="140" align="center" />
              <ElTableColumn prop="status" label="Trạng thái" width="120" align="center">
                <template #default>
                  <ElTag type="success" size="small">Đã nhập kho</ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>

          <!-- Sales Invoices Tab -->
          <ElTabPane name="invoices">
            <template #label>
              <span class="flex items-center gap-1">
                <span>Phiếu Xuất Bán Hàng ({{ mockInvoices.length }})</span>
              </span>
            </template>
            <ElTable :data="mockInvoices" border stripe style="width: 100%">
              <ElTableColumn prop="customer" label="Khách hàng" min-width="180" />
              <ElTableColumn prop="quantity" label="SL bán" width="100" align="right" />
              <ElTableColumn prop="price" label="Đơn giá bán" width="150" align="right">
                <template #default="{ row }"> {{ row.price.toLocaleString() }} VNĐ </template>
              </ElTableColumn>
              <ElTableColumn prop="date" label="Ngày xuất" width="140" align="center" />
              <ElTableColumn prop="status" label="Trạng thái" width="120" align="center">
                <template #default>
                  <ElTag type="success" size="small">Đã bàn giao</ElTag>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElTabPane>
        </ElTabs>
      </div>
      <template #footer>
        <div class="flex justify-end">
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, nextTick } from 'vue'
  import { Download, Memo } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'InventoryInOutStock' })

  // Define interfaces
  interface StockItem {
    id: string
    name: string
    level: number // 0: Product, 1: Variant, 2: Color
    imported: number
    exported: number
    inStock: number
    ordered: number
    remaining: number
    children?: StockItem[]
  }

  interface MockReceipt {
    code: string
    supplier: string
    quantity: number
    price: number
    date: string
  }

  interface MockInvoice {
    code: string
    customer: string
    quantity: number
    price: number
    date: string
  }

  // State variables
  const searchQuery = ref('')
  const tableRef = ref()
  const exporting = ref(false)

  // Dialog & Detail viewing state
  const dialogVisible = ref(false)
  const activeTab = ref('receipts')
  const selectedRow = ref<StockItem | null>(null)
  const selectedRowName = ref('')
  const mockReceipts = ref<MockReceipt[]>([])
  const mockInvoices = ref<MockInvoice[]>([])

  // Generate consistent static mock data
  const generateMockData = (): StockItem[] => {
    const rawData = [
      {
        id: 'p1',
        name: 'Honda Vision 2026',
        variants: [
          {
            id: 'p1-v1',
            name: 'Vision Tiêu chuẩn (Khóa cơ)',
            colors: [] // No color variants
          },
          {
            id: 'p1-v2',
            name: 'Vision Cao cấp (Smartkey)',
            colors: [
              { id: 'p1-v2-c1', name: 'Đỏ đậm' },
              { id: 'p1-v2-c2', name: 'Xanh dương' }
            ]
          },
          {
            id: 'p1-v3',
            name: 'Vision Thể thao',
            colors: [
              { id: 'p1-v3-c1', name: 'Xám xi măng' },
              { id: 'p1-v3-c2', name: 'Đen nhám' }
            ]
          }
        ]
      },
      {
        id: 'p2',
        name: 'Yamaha Exciter 155 VVA',
        variants: [
          {
            id: 'p2-v1',
            name: 'Exciter 155 Tiêu chuẩn',
            colors: [
              { id: 'p2-v1-c1', name: 'Đỏ nhám' },
              { id: 'p2-v1-c2', name: 'Đen bóng' },
              { id: 'p2-v1-c3', name: 'Trắng đỏ' }
            ]
          },
          {
            id: 'p2-v2',
            name: 'Exciter 155 Cao cấp ABS',
            colors: [
              { id: 'p2-v2-c1', name: 'Xanh GP' },
              { id: 'p2-v2-c2', name: 'Vàng Xám' }
            ]
          },
          {
            id: 'p2-v3',
            name: 'Exciter 155 Bản Giới hạn',
            colors: [] // No color variants
          }
        ]
      },
      {
        id: 'p3',
        name: 'Honda SH 160i 2026',
        variants: [
          {
            id: 'p3-v1',
            name: 'SH 160i Tiêu chuẩn CBS',
            colors: [
              { id: 'p3-v1-c1', name: 'Trắng' },
              { id: 'p3-v1-c2', name: 'Đỏ' },
              { id: 'p3-v1-c3', name: 'Đen' }
            ]
          },
          {
            id: 'p3-v2',
            name: 'SH 160i Thể thao ABS',
            colors: [
              { id: 'p3-v2-c1', name: 'Xám đen' },
              { id: 'p3-v2-c2', name: 'Đỏ đen' }
            ]
          }
        ]
      },
      {
        id: 'p4',
        name: 'Suzuki Raider R150',
        variants: [
          {
            id: 'p4-v1',
            name: 'Raider R150 Thể thao',
            colors: [] // No color variants
          }
        ]
      }
    ]

    // Simple pseudo-random helper for consistent static values
    let seed = 42
    const random = (min: number, max: number) => {
      const x = Math.sin(seed++) * 10000
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min
    }

    return rawData.map((p) => {
      const variantsList = p.variants.map((v) => {
        if (v.colors && v.colors.length > 0) {
          const colorsList = v.colors.map((c) => {
            const imported = random(40, 150)
            const exported = random(20, imported - 10)
            const inStock = imported - exported
            const ordered = random(0, Math.max(0, inStock - 5))
            const remaining = inStock - ordered

            return {
              id: c.id,
              name: c.name,
              level: 2,
              imported,
              exported,
              inStock,
              ordered,
              remaining
            } as StockItem
          })

          // Calculate parent variant values from colors
          const imported = colorsList.reduce((acc, curr) => acc + curr.imported, 0)
          const exported = colorsList.reduce((acc, curr) => acc + curr.exported, 0)
          const inStock = colorsList.reduce((acc, curr) => acc + curr.inStock, 0)
          const ordered = colorsList.reduce((acc, curr) => acc + curr.ordered, 0)
          const remaining = colorsList.reduce((acc, curr) => acc + curr.remaining, 0)

          return {
            id: v.id,
            name: v.name,
            level: 1,
            imported,
            exported,
            inStock,
            ordered,
            remaining,
            children: colorsList
          } as StockItem
        } else {
          // No colors, generate direct values
          const imported = random(50, 180)
          const exported = random(20, imported - 15)
          const inStock = imported - exported
          const ordered = random(0, Math.max(0, inStock - 8))
          const remaining = inStock - ordered

          return {
            id: v.id,
            name: v.name,
            level: 1,
            imported,
            exported,
            inStock,
            ordered,
            remaining
          } as StockItem
        }
      })

      // Calculate product values from variants
      const imported = variantsList.reduce((acc, curr) => acc + curr.imported, 0)
      const exported = variantsList.reduce((acc, curr) => acc + curr.exported, 0)
      const inStock = variantsList.reduce((acc, curr) => acc + curr.inStock, 0)
      const ordered = variantsList.reduce((acc, curr) => acc + curr.ordered, 0)
      const remaining = variantsList.reduce((acc, curr) => acc + curr.remaining, 0)

      return {
        id: p.id,
        name: p.name,
        level: 0,
        imported,
        exported,
        inStock,
        ordered,
        remaining,
        children: variantsList
      } as StockItem
    })
  }

  const tableData = ref<StockItem[]>(generateMockData())

  // Compute overall stats for the cards
  const totalStats = computed(() => {
    return tableData.value.reduce(
      (acc, p) => {
        acc.imported += p.imported
        acc.exported += p.exported
        acc.inStock += p.inStock
        acc.ordered += p.ordered
        acc.remaining += p.remaining
        return acc
      },
      { imported: 0, exported: 0, inStock: 0, ordered: 0, remaining: 0 }
    )
  })

  // Table columns definition
  const columns = [
    { label: 'Tên Sản phẩm / Biến thể / Màu sắc', prop: 'name', minWidth: 320, useSlot: true },
    { label: 'Số lượng đã nhập', prop: 'imported', width: 160, align: 'right' },
    { label: 'Số lượng đã xuất', prop: 'exported', width: 160, align: 'right' },
    { label: 'Số lượng tồn kho', prop: 'inStock', width: 160, align: 'right' },
    { label: 'Số lượng đã đặt', prop: 'ordered', width: 160, align: 'right' },
    { label: 'Số lượng còn lại', prop: 'remaining', width: 160, align: 'right', useSlot: true },
    { label: 'Thao tác', prop: 'operation', width: 150, align: 'center', useSlot: true }
  ]

  // Search definition
  const searchItems = computed(() => [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      type: 'input',
      props: { placeholder: 'Nhập tên xe, phiên bản hoặc màu sắc...' }
    }
  ])

  // Helper: check if leaf node
  // - If level is 2 (Color variant), it's a leaf node.
  // - If level is 1 (Product Variant) AND has no children (no color variants), it's a leaf node.
  const isLeafNode = (row: StockItem): boolean => {
    return row.level === 2 || (row.level === 1 && (!row.children || row.children.length === 0))
  }

  // Search handlers
  const handleSearch = (form: Record<string, any>) => {
    searchQuery.value = form.name || ''
  }

  const handleReset = () => {
    searchQuery.value = ''
  }

  const refreshData = () => {
    tableData.value = generateMockData()
  }

  // Filter tree recursively based on query
  const filteredTableData = computed(() => {
    if (!searchQuery.value) return tableData.value

    const query = searchQuery.value.toLowerCase().trim()

    const filterNode = (node: StockItem): StockItem | null => {
      const matchesName = node.name.toLowerCase().includes(query)
      let filteredChildren: StockItem[] = []

      if (node.children) {
        filteredChildren = node.children
          .map((child) => filterNode(child))
          .filter((child): child is StockItem => child !== null)
      }

      if (matchesName || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        }
      }

      return null
    }

    return tableData.value
      .map((node) => filterNode(node))
      .filter((node): node is StockItem => node !== null)
  })

  // Table row styling helpers
  const getNameClass = (row: StockItem) => {
    if (row.level === 0) return 'text-gray-900 font-bold text-sm md:text-base'
    if (row.level === 1) return 'text-gray-700 font-medium text-sm'
    return 'text-gray-500 text-sm italic'
  }

  const getRemainingClass = (row: StockItem) => {
    if (row.remaining < 5) return 'font-bold text-danger'
    if (row.remaining < 15) return 'font-medium text-warning'
    return 'text-success font-semibold'
  }

  // Export report button action
  const handleExport = () => {
    exporting.value = true
    setTimeout(() => {
      exporting.value = false
      ElMessage.success('Đã xuất báo cáo Xuất - Nhập - Tồn thành công (file Excel/PDF giả lập)!')
    }, 1200)
  }

  // Show transactional history for leaf node variant/color
  const handleViewHistory = (row: StockItem) => {
    selectedRow.value = row
    selectedRowName.value = row.name
    activeTab.value = 'receipts'

    // Mock receipts to match total row.imported
    const suppliers = [
      'Honda Việt Nam',
      'Yamaha Motor Việt Nam',
      'Tập đoàn Suzuki',
      'Nhà Nhập Khẩu Quang Mạnh'
    ]
    const receiptCount = Math.min(3, Math.max(1, Math.ceil(row.imported / 40)))
    const receipts: MockReceipt[] = []
    let remainingImported = row.imported

    for (let i = 0; i < receiptCount; i++) {
      const isLast = i === receiptCount - 1
      const qty = isLast ? remainingImported : Math.floor(row.imported / receiptCount)
      remainingImported -= qty

      if (qty > 0) {
        receipts.push({
          code: `PN202605${10 + i}`,
          supplier: suppliers[i % suppliers.length],
          quantity: qty,
          price: row.level === 2 ? 32000000 : 45000000,
          date: `2026-05-${10 + i * 3}`
        })
      }
    }
    mockReceipts.value = receipts

    // Mock invoices to match total row.exported
    const customers = ['Nguyễn Văn Bình', 'Trần Thị Thúy', 'Lê Hữu Hoàng', 'Hoàng Minh Tuấn']
    const invoiceCount = Math.min(3, Math.max(1, Math.ceil(row.exported / 30)))
    const invoices: MockInvoice[] = []
    let remainingExported = row.exported

    for (let i = 0; i < invoiceCount; i++) {
      const isLast = i === invoiceCount - 1
      const qty = isLast ? remainingExported : Math.floor(row.exported / invoiceCount)
      remainingExported -= qty

      if (qty > 0) {
        invoices.push({
          code: `HD2605${20 + i}`,
          customer: customers[i % customers.length],
          quantity: qty,
          price: row.level === 2 ? 38500000 : 52000000,
          date: `2026-05-${12 + i * 4}`
        })
      }
    }
    mockInvoices.value = invoices

    dialogVisible.value = true
  }

  // Expand / Collapse actions
  const expandAll = () => {
    nextTick(() => {
      if (tableRef.value?.elTableRef) {
        const toggleAll = (rows: StockItem[], expand: boolean) => {
          rows.forEach((row) => {
            tableRef.value.elTableRef.toggleRowExpansion(row, expand)
            if (row.children) {
              toggleAll(row.children, expand)
            }
          })
        }
        toggleAll(filteredTableData.value, true)
      }
    })
  }

  const collapseAll = () => {
    nextTick(() => {
      if (tableRef.value?.elTableRef) {
        const toggleAll = (rows: StockItem[], expand: boolean) => {
          rows.forEach((row) => {
            tableRef.value.elTableRef.toggleRowExpansion(row, expand)
            if (row.children) {
              toggleAll(row.children, expand)
            }
          })
        }
        toggleAll(filteredTableData.value, false)
      }
    })
  }
</script>

<style scoped>
  .art-table-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
  }

  .bg-primary {
    background-color: var(--main-color);
  }

  /* Custom tree table row styles for premium hierarchy feel */
  :deep(.el-table__row--level-0) {
    background-color: var(--default-box-color) !important;
  }

  :deep(.el-table__row--level-1) {
    background-color: var(--el-fill-color-light) !important;
  }

  :deep(.el-table__row--level-2) {
    background-color: var(--el-fill-color-lighter) !important;
  }

  :deep(.el-table__expand-icon) {
    margin-right: 8px !important;
    font-weight: bold;
    color: var(--main-color) !important;
  }
</style>
