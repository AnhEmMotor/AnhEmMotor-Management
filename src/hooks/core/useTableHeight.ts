/**
 * useTableHeight - BảngChiều caotừđộngkế
 *
 * từđộngkếBảngContainercủanhấttốtChiều cao，Đảm bảoBảngtạiKhôngcùngBố cụctrườngcảnhdướiđềunăngđúngChínhHiển thị。
 * liệuBảngđầubộ、Phân trangthiết bịbằngnguyêntốcủaChiều caoHoạt độngđiềuchỉnhContainerChiều cao，tránhmiễnrahiệnCuộnđiềuhoặcBố cụcLỗiloạn。
 *
 * ## chủcầncôngnăng
 *
 * 1. Hoạt độngChiều caokế - liệuBảngđầubộ、Phân trangthiết bịChiều caotừđộngkếContainerChiều cao
 * 2. ứngkiểuCập nhật - CauHinhbiếnhóagiờtừđộngtrùngmớikếChiều cao
 * 3. linhsốngCauHinh - chiếctrìTùy chỉnhcácbộphầnChiều caovàgian
 * 4. trínăngthíchPhân - vôtránngoàinguyêntốgiờtừđộngkhiếndùng 100% Chiều cao
 *
 * @module useTableHeight
 * @author Art Design Pro Team
 */

import { computed, type Ref } from 'vue'

/**
 * BảngChiều caokếthiết bịCauHinhGiao diện (Interface)
 */
interface TableHeightOptions {
  /** làphủHiển thịBảngđầubộ */
  showTableHeader: Ref<boolean>
  /** Phân trangthiết bịChiều cao */
  paginationHeight: Ref<number>
  /** BảngđầubộChiều cao */
  tableHeaderHeight: Ref<number>
  /** Phân trangthiết bịgian */
  paginationSpacing: Ref<number>
}

/**
 * BảngChiều caokếthiết bịloại
 */
class TableHeightCalculator {
  // lệlượngCauHinh
  private static readonly DEFAULT_TABLE_HEADER_HEIGHT = 44
  private static readonly TABLE_HEADER_SPACING = 12

  constructor(private options: TableHeightOptions) {}

  /**
   * kếContainerChiều cao
   */
  calculate(): { height: string } {
    const offset = this.calculateOffset()
    return {
      height: offset === 0 ? '100%' : `calc(100% - ${offset}px)`
    }
  }

  /**
   * kếthiênDilượng
   */
  private calculateOffset(): number {
    if (!this.options.showTableHeader.value) {
      return this.calculatePaginationOffset()
    }

    const headerHeight = this.getHeaderHeight()
    const paginationOffset = this.calculatePaginationOffset()

    return headerHeight + paginationOffset + TableHeightCalculator.TABLE_HEADER_SPACING
  }

  /**
   * LấyBảngđầubộChiều cao
   */
  private getHeaderHeight(): number {
    return this.options.tableHeaderHeight.value || TableHeightCalculator.DEFAULT_TABLE_HEADER_HEIGHT
  }

  /**
   * kếPhân trangthiết bịthiênDilượng
   */
  private calculatePaginationOffset(): number {
    const { paginationHeight, paginationSpacing } = this.options
    return paginationHeight.value === 0 ? 0 : paginationHeight.value + paginationSpacing.value
  }
}

/**
 * BảngChiều caokế Hook
 *
 * gợicungBảngContainerChiều caocủatừđộngkếcôngnăng，chiếctrì：
 * - BảngđầubộChiều cao
 * - Phân trangthiết bịChiều cao
 * - Hoạt độnggiankế
 *
 * @param options CauHinhvịmục
 * @returns ContainerChiều caokếKetQua
 */
export function useTableHeight(options: TableHeightOptions) {
  const containerHeight = computed(() => {
    const calculator = new TableHeightCalculator(options)
    return calculator.calculate()
  })

  return {
    /** ContainerChiều caoKiểu dángDoiTuong */
    containerHeight
  }
}
