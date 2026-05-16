<!-- Xuất file Excel vănphần tử -->
<template>
  <ElButton
    :type="type"
    :size="size"
    :loading="isExporting"
    :disabled="disabled || !hasData"
    v-ripple
    @click="handleExport"
  >
    <template #loading>
      <ElIcon class="is-loading">
        <Loading />
      </ElIcon>
      {{ loadingText }}
    </template>
    <slot>{{ buttonText }}</slot>
  </ElButton>
</template>

<script setup lang="ts">
  import * as XLSX from 'xlsx'
  import FileSaver from 'file-saver'
  import { ref, computed, nextTick } from 'vue'
  import { Loading } from '@element-plus/icons-vue'
  import type { ButtonType } from 'element-plus'
  import { useThrottleFn } from '@vueuse/core'

  defineOptions({ name: 'ArtExcelExport' })

  /** Xuất fileDữ liệuloạikiểu */
  type ExportValue = string | number | boolean | null | undefined | Date

  interface ExportData {
    [key: string]: ExportValue
  }

  /** cộtCauHinh */
  interface ColumnConfig {
    /** cộtTieuDe */
    title: string
    /** cộtChiều rộng */
    width?: number
    /** Dữ liệucáchkiểuhóaHàm */
    formatter?: (value: ExportValue, row: ExportData, index: number) => string
  }

  /** Xuất fileCauHinhvịmục */
  interface ExportOptions {
    /** Dữ liệunguồn */
    data: ExportData[]
    /** vănphần tửdanh（Khônghàmmởtriểndanh） */
    filename?: string
    /** cônglàmbảngdanhtên */
    sheetName?: string
    /** Nútloạikiểu */
    type?: ButtonType
    /** Nútthướctấc */
    size?: 'large' | 'default' | 'small'
    /** làphủTắt */
    disabled?: boolean
    /** Nútvănquyển */
    buttonText?: string
    /** Đang tảivănquyển */
    loadingText?: string
    /** làphủtừđộngThêm mớithứsốcột */
    autoIndex?: boolean
    /** thứsốcộtTieuDe */
    indexColumnTitle?: string
    /** cộtCauHinhảnhxạ */
    columns?: Record<string, ColumnConfig>
    /** bảngđầuảnhxạ（rúthóabảnquyển，hướngsaukiêmdung） */
    headers?: Record<string, string>
    /** nhấtđạiXuất filedòngsố */
    maxRows?: number
    /** làphủHiển thịThanhCongTinNhan */
    showSuccessMessage?: boolean
    /** làphủHiển thịLỗiTinNhan */
    showErrorMessage?: boolean
    /** cônglàmsổCauHinh */
    workbookOptions?: {
      /** xây */
      creator?: string
      /** nhấtsausửasửa */
      lastModifiedBy?: string
      /** ThoiGian tạo */
      created?: Date
      /** ThoiGian sửa */
      modified?: Date
    }
  }

  const props = withDefaults(defineProps<ExportOptions>(), {
    filename: () => `export_${new Date().toISOString().slice(0, 10)}`,
    sheetName: 'Sheet1',
    type: 'primary',
    size: 'default',
    disabled: false,
    buttonText: 'Xuất file Excel',
    loadingText: 'Xuất filetrong...',
    autoIndex: false,
    indexColumnTitle: 'thứsố',
    columns: () => ({}),
    headers: () => ({}),
    maxRows: 100000,
    showSuccessMessage: true,
    showErrorMessage: true,
    workbookOptions: () => ({})
  })

  const emit = defineEmits<{
    'before-export': [data: ExportData[]]
    'export-success': [filename: string, rowCount: number]
    'export-error': [error: ExportError]
    'export-progress': [progress: number]
  }>()

  /** Xuất fileLỗiloạikiểu */
  class ExportError extends Error {
    constructor(
      message: string,
      public code: string,
      public details?: any
    ) {
      super(message)
      this.name = 'ExportError'
    }
  }

  const isExporting = ref(false)

  /** làphủcóDữ liệuCó thểXuất file */
  const hasData = computed(() => Array.isArray(props.data) && props.data.length > 0)

  /** nghiệmtínhXuất fileDữ liệu */
  const validateData = (data: ExportData[]): void => {
    if (!Array.isArray(data)) {
      throw new ExportError('Dữ liệutấtphảilàMảngcáchkiểu', 'INVALID_DATA_TYPE')
    }

    if (data.length === 0) {
      throw new ExportError('khôngcóCó thểXuất filecủaDữ liệu', 'NO_DATA')
    }

    if (data.length > props.maxRows) {
      throw new ExportError(
        `Dữ liệudòngsốsiêuquahạnchế（${props.maxRows}dòng）`,
        'EXCEED_MAX_ROWS',
        {
          currentRows: data.length,
          maxRows: props.maxRows
        }
      )
    }
  }

  const formatCellValue = (
    value: ExportValue,
    key: string,
    row: ExportData,
    index: number
  ): string => {
    const column = props.columns[key]
    if (column?.formatter) {
      return column.formatter(value, row, index)
    }

    if (value === null || value === undefined) {
      return ''
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('zh-CN')
    }

    if (typeof value === 'boolean') {
      return value ? 'là' : 'phủ'
    }

    return String(value)
  }

  const processData = (data: ExportData[]): Record<string, string>[] => {
    const processedData = data.map((item, index) => {
      const processedItem: Record<string, string> = {}

      if (props.autoIndex) {
        processedItem[props.indexColumnTitle] = String(index + 1)
      }

      Object.entries(item).forEach(([key, value]) => {
        let columnTitle = key
        if (props.columns[key]?.title) {
          columnTitle = props.columns[key].title
        } else if (props.headers[key]) {
          columnTitle = props.headers[key]
        }
        processedItem[columnTitle] = formatCellValue(value, key, item, index)
      })

      return processedItem
    })

    return processedData
  }

  const calculateColumnWidths = (data: Record<string, string>[]): XLSX.ColInfo[] => {
    if (data.length === 0) return []

    const sampleSize = Math.min(data.length, 100)
    const columns = Object.keys(data[0])

    return columns.map((column) => {
      const configWidth = Object.values(props.columns).find((col) => col.title === column)?.width

      if (configWidth) {
        return { wch: configWidth }
      }

      const maxLength = Math.max(
        column.length,
        ...data.slice(0, sampleSize).map((row) => String(row[column] || '').length)
      )

      const width = Math.min(Math.max(maxLength + 2, 8), 50)
      return { wch: width }
    })
  }

  const exportToExcel = async (
    data: ExportData[],
    filename: string,
    sheetName: string
  ): Promise<void> => {
    try {
      emit('export-progress', 10)

      const processedData = processData(data)
      emit('export-progress', 30)

      const workbook = XLSX.utils.book_new()

      if (props.workbookOptions) {
        workbook.Props = {
          Title: filename,
          Subject: 'Dữ liệuXuất file',
          Author: props.workbookOptions.creator || 'Art Design Pro',
          Manager: props.workbookOptions.lastModifiedBy || '',
          Company: 'HeThongXuất file',
          Category: 'Dữ liệu',
          Keywords: 'excel,export,data',
          Comments: 'doHeThongtừđộngsinhthành',
          CreatedDate: props.workbookOptions.created || new Date(),
          ModifiedDate: props.workbookOptions.modified || new Date()
        }
      }

      emit('export-progress', 50)

      const worksheet = XLSX.utils.json_to_sheet(processedData)

      worksheet['!cols'] = calculateColumnWidths(processedData)

      emit('export-progress', 70)

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

      emit('export-progress', 85)

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
        compression: true
      })

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      emit('export-progress', 95)

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const finalFilename = `${filename}_${timestamp}.xlsx`

      FileSaver.saveAs(blob, finalFilename)

      emit('export-progress', 100)

      await nextTick()

      return Promise.resolve()
    } catch (error) {
      throw new ExportError(
        `Excel Xuất fileThatBai: ${(error as Error).message}`,
        'EXPORT_FAILED',
        error
      )
    }
  }

  const handleExport = useThrottleFn(async () => {
    if (isExporting.value) return

    isExporting.value = true

    try {
      validateData(props.data)

      emit('before-export', props.data)

      await exportToExcel(props.data, props.filename, props.sheetName)

      emit('export-success', props.filename, props.data.length)

      if (props.showSuccessMessage) {
        ElMessage.success({
          message: `ThanhCongXuất file ${props.data.length} điềuDữ liệu`,
          duration: 3000
        })
      }
    } catch (error) {
      const exportError =
        error instanceof ExportError
          ? error
          : new ExportError(`Xuất fileThatBai: ${(error as Error).message}`, 'UNKNOWN_ERROR', error)

      emit('export-error', exportError)

      if (props.showErrorMessage) {
        ElMessage.error({
          message: exportError.message,
          duration: 5000
        })
      }

      console.error('Excel Xuất fileLỗi:', exportError)
    } finally {
      isExporting.value = false
      emit('export-progress', 0)
    }
  }, 1000)

  defineExpose({
    exportData: handleExport,
    isExporting: readonly(isExporting),
    hasData
  })
</script>

<style scoped>
  .is-loading {
    animation: rotating 2s linear infinite;
  }

  @keyframes rotating {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
