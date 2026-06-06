<template>
  <div class="page-content">
    <ArtExcelImport @import-success="handleImportSuccess" @import-error="handleImportError">
      <template #import-text> Tải lên Excel </template>
    </ArtExcelImport>

    <ArtExcelExport
      style="margin-left: 10px"
      :data="tableData"
      filename="NguoiDungDữ liệu-1"
      sheetName="NguoiDungDanh sách"
      type="success"
      :headers="headers"
      auto-index
      :columns="columnConfig"
      @export-success="handleExportSuccess"
      @export-error="handleExportError"
      @export-progress="handleProgress"
    >
      Xuất file Excel
    </ArtExcelExport>

    <ElButton type="danger" @click="handleClear" v-ripple>xóachiaDữ liệu</ElButton>

    <ArtTable :data="tableData" style="margin-top: 10px">
      <ElTableColumn
        v-for="key in Object.keys(headers)"
        :key="key"
        :prop="key"
        :label="headers[key as keyof typeof headers]"
      />
    </ArtTable>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'WidgetsExcel' })

  interface TableData {
    name: string
    age: number
    city: string
  }

  const tableData = ref<TableData[]>([
    { name: 'lýbốn', age: 20, city: 'Thượng Hải' },
    { name: 'tờba', age: 25, city: 'Bắc Kinh' },
    { name: 'vươngnăm', age: 30, city: 'Quảng Châu' },
    { name: 'triệusáu', age: 35, city: 'Thâm Quyến' },
    { name: 'cháubảy', age: 28, city: 'Hàng Châu' },
    { name: 'tuầntám', age: 32, city: 'Thành Đô' },
    { name: 'ngôchín', age: 27, city: 'Vũ Hán' },
    { name: 'trịnhmười', age: 40, city: 'Nam Kinh' },
    { name: 'lưumột', age: 22, city: 'trùngmừng' },
    { name: 'trầnhai', age: 33, city: 'Tây An' },
  ])

  const headers = {
    name: 'Họ tên',
    age: 'Tuổi',
    city: 'Thànhthị',
  }

  const columnConfig = {
    name: {
      title: 'Họ tên',
      width: 20,
      formatter: (value: unknown) => (value ? String(value) : 'Chưabáo'),
    },
    age: {
      title: 'Tuổi',
      width: 10,
      formatter: (value: unknown) => (value ? `${value}tuổi` : '0tuổi'),
    },
    city: {
      title: 'Thànhthị',
      width: 12,
      formatter: (value: unknown) => (value ? `${value}thị` : 'Chưabáo'),
    },
  }

  const handleImportSuccess = (data: Array<Record<string, unknown>>) => {
    const formattedData: TableData[] = data.map((item) => ({
      name: String(item['Họ tên'] || ''),
      age: Number(item['Tuổi']) || 0,
      city: String(item['Thànhthị'] || ''),
    }))
    tableData.value = formattedData
    ElMessage.success(`ThanhCongNhập file ${formattedData.length} điềuDữ liệu`)
  }

  const handleImportError = (error: Error) => {
    console.error('Nhập fileThatBai:', error)
    ElMessage.error(`Nhập fileThatBai: ${error.message}`)
  }

  const handleExportSuccess = () => {
    console.log('Xuất fileThanhCong')
    ElMessage.success('Excel Xuất fileThanhCong')
  }

  const handleExportError = (error: Error) => {
    ElMessage.error(`Xuất fileThatBai: ${error.message}`)
  }

  const handleProgress = (progress: number) => {
    console.log('Xuất filevàođộ:', progress)
  }

  const handleClear = () => {
    tableData.value = []
    ElMessage.info('ĐãxóakhôngDữ liệu')
  }
</script>
