/**
 * useTableColumns - BảngcộtCauHinhQuản lý
 *
 * gợicungHoạt độngcủaBảngcộtCauHinhQuản lýnănglực，chiếctrìvậndònggiờlinhsốngkhốngchếcộtcủaHiển thị、Ẩn、xếpthứbằngHanhDong。
 * thônglệvới useTable Phânhợpkhiếndùng，vìBảnggợicungĐầy đủcủacộtQuản lýcôngnăng。
 *
 * ## chủcầncôngnăng
 *
 * 1. cộtHiển thịkhốngchế - Hoạt độngHiểnthị/ẩngiấucột，chitrìlôsốHanhDong
 * 2. cộtxếpthứ - Kéo thảhoặcbiêntrìnhphươngkiểutrùngmớixếpcộtcộtthuậnthứ
 * 3. cộtCauHinhQuản lý - Thêm mới、Xóa、Cập nhậtcộtCauHinh
 * 4. đặcthùcộtchiếctrì - từđộngXuLy selection、expand、index bằngđặcthùcột
 * 5. Trạng tháitrìlâuhóa - Duy trìcộtcủaHiển thịTrạng thái，chiếctrìĐặt lạiđếnban đầuđầuTrạng thái
 *
 * ## Ví dụ sử dụng
 *
 * ```typescript
 * const { columns, columnChecks, toggleColumn, reorderColumns } = useTableColumns(() => [
 *   { prop: 'name', label: 'Họ tên', visible: true },
 *   { prop: 'email', label: 'Email', visible: true },
 *   { prop: 'status', label: 'Trạng thái', visible: false }
 * ])
 *
 * // Chuyển đổicộtHiển thị
 * toggleColumn('email', false)
 *
 * // trùngmớixếpthứ
 * reorderColumns(0, 2)
 * ```
 *
 * @module useTableColumns
 * @author Art Design Pro Team
 */

import { ref, computed, watch } from 'vue'
import { $t } from '@/i18n'
import type { ColumnOption } from '@/types/component'

/**
 * đặcthùcộtloạikiểu
 */
const SPECIAL_COLUMNS: Record<string, { prop: string; label: string }> = {
  selection: { prop: '__selection__', label: $t('table.column.selection') },
  expand: { prop: '__expand__', label: $t('table.column.expand') },
  index: { prop: '__index__', label: $t('table.column.index') }
}

/**
 * Lấycộtcủaduymộttiêu
 */
export const getColumnKey = <T>(col: ColumnOption<T>) =>
  SPECIAL_COLUMNS[col.type as keyof typeof SPECIAL_COLUMNS]?.prop ?? (col.prop as string)

/**
 * LấycộtcủaHiển thịTrạng thái
 * Tốikhiếndùng visible chữđoạn，nếuquảKhôngtồntạikhiếndùng checked chữđoạn
 */
export const getColumnVisibility = <T>(col: ColumnOption<T>): boolean => {
  // visible Tốicấpcaoở checked
  if (col.visible !== undefined) {
    return col.visible
  }
  // nếuquả visible ChưaĐịnh nghĩa，khiếndùng checked，MacDinhvì true
  return col.checked ?? true
}

/**
 * LấycộtcủaTìmTrạng thái
 */
export const getColumnChecks = <T>(columns: ColumnOption<T>[]) =>
  columns.map((col) => {
    const special = col.type && SPECIAL_COLUMNS[col.type]
    const visibility = getColumnVisibility(col)

    if (special) {
      return { ...col, prop: special.prop, label: special.label, checked: true, visible: true }
    }
    return { ...col, checked: visibility, visible: visibility }
  })

/**
 * Hoạt độngcộtCauHinhGiao diện (Interface)
 */
export interface DynamicColumnConfig<T = any> {
  /**
   * Thêm mớicột（chiếctrìđơnchiếchoặclôlượng）
   * @param column cộtCauHinhhoặccộtCauHinhMảng
   * @param index Có thểvịcủachènvàoViTri，MacDinhcuốiđuôi（lôlượnggiờvìthứmộtchiếccộtcủaViTri）
   */
  addColumn: (column: ColumnOption<T> | ColumnOption<T>[], index?: number) => void
  /**
   * Xóacột（chiếctrìđơnchiếchoặclôlượng）
   * @param prop cộtcủaduymộttiêuhoặctiêuMảng
   */
  removeColumn: (prop: string | string[]) => void
  /**
   * Chuyển đổicộtHiển thịTrạng thái（chiếctrìđơnchiếchoặclôlượng）
   * @param prop cộtcủaduymộttiêuhoặctiêuMảng
   * @param visible Có thểvịcủaHiển thịTrạng thái，MacDinhHủyngược
   */
  toggleColumn: (prop: string | string[], visible?: boolean) => void

  /**
   * Cập nhậtcột（chiếctrìđơnchiếchoặclôlượng）
   * @param prop cộtcủaduymộttiêuhoặcCập nhậtCauHinhMảng
   * @param updates cộtCauHinhCập nhật（khi prop vìChuỗigiờkhiếndùng）
   */
  updateColumn: (
    prop: string | Array<{ prop: string; updates: Partial<ColumnOption<T>> }>,
    updates?: Partial<ColumnOption<T>>
  ) => void
  /**
   * lôlượngCập nhậtcột（kiêmdungcũbảnquyển，đẩygiới thiệukhiếndùng updateColumn củaMảngmôkiểu）
   * @param updates cộtCập nhậtCauHinh
   * @deprecated đẩygiới thiệukhiếndùng updateColumn củaMảngmôkiểu
   */
  batchUpdateColumns: (updates: Array<{ prop: string; updates: Partial<ColumnOption<T>> }>) => void
  /**
   * trùngmớixếpthứcột
   * @param fromIndex nguồnChỉ mục
   * @param toIndex mụctiêuChỉ mục
   */
  reorderColumns: (fromIndex: number, toIndex: number) => void
  /**
   * LấycộtCauHinh
   * @param prop cộtcủaduymộttiêu
   * @returns cộtCauHinh
   */
  getColumnConfig: (prop: string) => ColumnOption<T> | undefined
  /**
   * LấynêncócộtCauHinh
   * @returns nêncócộtCauHinh
   */
  getAllColumns: () => ColumnOption<T>[]
  /**
   * Đặt lạinêncócột
   */
  resetColumns: () => void
}

export function useTableColumns<T = any>(
  columnsFactory: () => ColumnOption<T>[]
): {
  columns: any
  columnChecks: any
} & DynamicColumnConfig<T> {
  const dynamicColumns = ref<ColumnOption<T>[]>(columnsFactory())
  const columnChecks = ref<ColumnOption<T>[]>(getColumnChecks(dynamicColumns.value))

  // khi dynamicColumns biếnđộnggiờ，trùngmớisinhthành columnChecks vừaLưugiữĐãtồntạicủaHiển thịTrạng thái
  watch(
    dynamicColumns,
    (newCols) => {
      const visibilityMap = new Map(
        columnChecks.value.map((c) => [getColumnKey(c), getColumnVisibility(c)])
      )
      const newChecks = getColumnChecks(newCols).map((c) => {
        const key = getColumnKey(c)
        const visibility = visibilityMap.has(key) ? visibilityMap.get(key) : getColumnVisibility(c)
        return {
          ...c,
          checked: visibility,
          visible: visibility
        }
      })
      columnChecks.value = newChecks
    },
    { deep: true }
  )

  // khitrướcHiển thịcột（ở columnChecks của checked hoặc visible）
  const columns = computed(() => {
    const colMap = new Map(dynamicColumns.value.map((c) => [getColumnKey(c), c]))
    return columnChecks.value
      .filter((c) => getColumnVisibility(c))
      .map((c) => colMap.get(getColumnKey(c)))
      .filter(Boolean) as ColumnOption<T>[]
  })

  // chiếctrì updater Quay lạimớiMảnghoặcthẳngtiếptạitruyềnvàoMảngtrên mutate
  const setDynamicColumns = (updater: (cols: ColumnOption<T>[]) => void | ColumnOption<T>[]) => {
    const copy = [...dynamicColumns.value]
    const result = updater(copy)
    dynamicColumns.value = Array.isArray(result) ? result : copy
  }

  return {
    columns,
    columnChecks,

    /**
     * Thêm mớicột（chiếctrìđơnchiếchoặclôlượng）
     */
    addColumn: (column: ColumnOption<T> | ColumnOption<T>[], index?: number) =>
      setDynamicColumns((cols) => {
        const next = [...cols]
        const columnsToAdd = Array.isArray(column) ? column : [column]
        const insertIndex =
          typeof index === 'number' && index >= 0 && index <= next.length ? index : next.length

        // lôlượngchènvào
        next.splice(insertIndex, 0, ...columnsToAdd)
        return next
      }),

    /**
     * Xóacột（chiếctrìđơnchiếchoặclôlượng）
     */
    removeColumn: (prop: string | string[]) =>
      setDynamicColumns((cols) => {
        const propsToRemove = Array.isArray(prop) ? prop : [prop]
        return cols.filter((c) => !propsToRemove.includes(getColumnKey(c)))
      }),

    /**
     * Cập nhậtcột（chiếctrìđơnchiếchoặclôlượng）
     */
    updateColumn: (
      prop: string | Array<{ prop: string; updates: Partial<ColumnOption<T>> }>,
      updates?: Partial<ColumnOption<T>>
    ) => {
      // lôlượngmôkiểu：prop làMảng
      if (Array.isArray(prop)) {
        setDynamicColumns((cols) => {
          const map = new Map(prop.map((u) => [u.prop, u.updates]))
          return cols.map((c) => {
            const key = getColumnKey(c)
            const upd = map.get(key)
            return upd ? { ...c, ...upd } : c
          })
        })
      }
      // đơnchiếcmôkiểu：prop làChuỗi
      else if (updates) {
        setDynamicColumns((cols) =>
          cols.map((c) => (getColumnKey(c) === prop ? { ...c, ...updates } : c))
        )
      }
    },

    /**
     * Chuyển đổicộtHiển thịTrạng thái（chiếctrìđơnchiếchoặclôlượng）
     */
    toggleColumn: (prop: string | string[], visible?: boolean) => {
      const propsToToggle = Array.isArray(prop) ? prop : [prop]
      const next = [...columnChecks.value]

      propsToToggle.forEach((p) => {
        const i = next.findIndex((c) => getColumnKey(c) === p)
        if (i > -1) {
          const currentVisibility = getColumnVisibility(next[i])
          const newVisibility = visible ?? !currentVisibility
          // cùnggiờCập nhật checked và visible lấyDuy trìkiêmdungtính
          next[i] = { ...next[i], checked: newVisibility, visible: newVisibility }
        }
      })

      columnChecks.value = next
    },

    /**
     * Đặt lạinêncócột
     */
    resetColumns: () => {
      dynamicColumns.value = columnsFactory()
    },

    /**
     * lôlượngCập nhậtcột（kiêmdungcũbảnquyển）
     * @deprecated đẩygiới thiệukhiếndùng updateColumn củaMảngmôkiểu
     */
    batchUpdateColumns: (updates) =>
      setDynamicColumns((cols) => {
        const map = new Map(updates.map((u) => [u.prop, u.updates]))
        return cols.map((c) => {
          const key = getColumnKey(c)
          const upd = map.get(key)
          return upd ? { ...c, ...upd } : c
        })
      }),

    /**
     * trùngmớixếpthứcột
     */
    reorderColumns: (fromIndex: number, toIndex: number) =>
      setDynamicColumns((cols) => {
        if (
          fromIndex < 0 ||
          fromIndex >= cols.length ||
          toIndex < 0 ||
          toIndex >= cols.length ||
          fromIndex === toIndex
        ) {
          return cols
        }
        const next = [...cols]
        const [moved] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, moved)
        return next
      }),

    /**
     * LấycộtCauHinh
     */
    getColumnConfig: (prop: string) => dynamicColumns.value.find((c) => getColumnKey(c) === prop),

    /**
     * LấynêncócộtCauHinh
     */
    getAllColumns: () => [...dynamicColumns.value]
  }
}
