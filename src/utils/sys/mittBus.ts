/**
 * toànbộSuKientổngđườngmôkhối
 *
 * ở mitt Thư việnthựchiệncủaloạikiểuantoàncủaSuKientổngđường
 *
 * ## chủcầncôngnăng
 *
 * - vượtComponentthôngnhắn（Đăng tải/đặtkýmôthức）
 * - loạikiểuantoàncủaSuKienĐịnh nghĩavàđiềudùng
 * - toànbộSuKienQuản lý（khóihoaHiệu quả、CaiDatBảng (Panel)、TimKiemHộp thoạibằng）
 * - giảighépComponentgiancủathẳngtiếpylại
 *
 * ## khiếndùngtrườngcảnh
 *
 * - vượttầngcấpComponentthôngnhắn
 * - toànbộcôngnăngKích hoạt（CaiDat、TimKiem、tròngày、khóamàn hìnhbằng）
 * - đặchiệuKích hoạt（khóihoaHiệu quả）
 * - tránhmiễn props tầngtầngtruyềnchuyển
 *
 * ## dùngphápVí dụ
 *
 * ```typescript
 * // đặtkýSuKien
 * mittBus.on('openSetting', () => { ... })
 *
 * // Đăng tảiSuKien
 * mittBus.emit('openSetting')
 *
 * // mangTham sốcủaSuKien
 * mittBus.emit('triggerFireworks', 'image-url')
 * ```
 *
 * ## ĐãĐịnh nghĩacủaSuKien
 *
 * - triggerFireworks: Kích hoạtkhóihoaHiệu quả（Có thểvịHình ảnhURL）
 * - openSetting: mởmởCaiDatBảng (Panel)
 * - openSearchDialog: mởmởTimKiemHộp thoại
 * - openChat: mởmởtròngàysổdiện
 * - openLockScreen: mởmởkhóamàn hình
 *
 * @module utils/sys/mittBus
 * @author Art Design Pro Team
 */
import mitt, { type Emitter } from 'mitt'

// Định nghĩaSuKienloạikiểuảnhxạ
type Events = {
  // khóihoaHiệu quảSuKien - Có thểvịcủaHình ảnhURLTham số
  triggerFireworks: string | undefined
  // mởmởCaiDatBảng (Panel)SuKien - vôTham số
  openSetting: void
  // mởmởTimKiemHộp thoạiSuKien - vôTham số
  openSearchDialog: void
  // mởmởtròngàysổdiệnSuKien - vôTham số
  openChat: void
  // mởmởkhóamàn hìnhSuKien - vôTham số
  openLockScreen: void
}

// xâyloạikiểuantoàncủaSuKientổngđườngthựcví dụ
const mittBus: Emitter<Events> = mitt<Events>()

export default mittBus
