/**
 * BảngTrạng tháiQuản lýmôkhối
 *
 * gợicungBảngHiển thịCauHinhcủaTrạng tháiQuản lý
 *
 * ## chủcầncôngnăng
 *
 * - BảngthướctấcCauHinh（chặtgần、MacDinh、Rộnglỏng）
 * - vằnngựavânHiển thịCông tắc
 * - ViềnHiển thịCông tắc
 * - bảngđầuNềnHiển thịCông tắc
 * - Toàn màn hìnhmôkiểuCông tắc
 *
 * ## khiếndùngtrườngcảnh
 * - BảngComponentKiểu dángCauHinh
 * - NguoiDungBảngthiênhảoCaiDat
 * - BảngThanh công cụcôngnăngkhốngchế
 *
 * ## trìlâuhóa
 *
 * - khiếndùng localStorage tồntrữ
 * - tồntrữphím：sys-v{version}-table
 * - NguoiDungCauHinhvượttrangmặtDuy trì
 *
 * @module store/modules/table
 * @author Art Design Pro Team
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TableSizeEnum } from '@/enums/formEnum'

// Bảng
export const useTableStore = defineStore(
  'tableStore',
  () => {
    // BảngKích thước
    const tableSize = ref(TableSizeEnum.DEFAULT)
    // vằnngựavân
    const isZebra = ref(false)
    // Viền
    const isBorder = ref(false)
    // bảngđầuNền
    const isHeaderBackground = ref(false)

    // làphủToàn màn hình
    const isFullScreen = ref(false)

    /**
     * CaiDatBảngKích thước
     * @param size BảngKích thướcchiếcBáogiá trị
     */
    const setTableSize = (size: TableSizeEnum) => (tableSize.value = size)

    /**
     * CaiDatvằnngựavânHiển thịTrạng thái
     * @param value làphủHiển thịvằnngựavân
     */
    const setIsZebra = (value: boolean) => (isZebra.value = value)

    /**
     * CaiDatBảngViềnHiển thịTrạng thái
     * @param value làphủHiển thịViền
     */
    const setIsBorder = (value: boolean) => (isBorder.value = value)

    /**
     * CaiDatbảngđầuNềnHiển thịTrạng thái
     * @param value làphủHiển thịbảngđầuNền
     */
    const setIsHeaderBackground = (value: boolean) => (isHeaderBackground.value = value)

    /**
     * CaiDatlàphủToàn màn hình
     * @param value làphủToàn màn hình
     */
    const setIsFullScreen = (value: boolean) => (isFullScreen.value = value)

    return {
      tableSize,
      isZebra,
      isBorder,
      isHeaderBackground,
      setTableSize,
      setIsZebra,
      setIsBorder,
      setIsHeaderBackground,
      isFullScreen,
      setIsFullScreen
    }
  },
  {
    persist: {
      key: 'table',
      storage: localStorage
    }
  }
)
