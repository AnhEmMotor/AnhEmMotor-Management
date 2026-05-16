/**
 * tồntrữCauHinhQuản lýmôkhối
 *
 * gợicungthốngmộtcủaquyểnđịatồntrữCauHinhvàCông cụPhuongThuc
 *
 * ## chủcầncôngnăng
 *
 * - bảnquyểnhóatồntrữphímQuản lý，chiếctrìđabảnquyểnDữ liệuNgoại
 * - tồntrữphímdanhsinhthànhvàgiảiphân（mangbảnquyểntrướchậu tố）
 * - bảnquyểnsốgợiHủyvànghiệmtính
 * - tồntrữphímngựaPhâncủađúngbảngkiểusinhthành
 * - cũbảnquyểntồntrữphímkiêmdungXuLy
 * - Nâng cấpvàđăngraCauHinh
 * - ChuDetồntrữphímCauHinh
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Pinia Store trìlâuhóatồntrữ
 * - Ứng dụngbảnquyểnNâng cấpgiờcủaDữ liệudờiDi
 * - đabảnquyểnDữ liệuxóalý
 * - tồntrữphímcủathốngmộtQuản lývàquyphạm
 *
 * tồntrữphímcáchkiểu：sys-v{version}-{storeId}
 * ví dụnhư：sys-v1.0.0-user, sys-v1.0.0-setting
 *
 * @module utils/storage/storage-config
 * @author Art Design Pro Team
 */
export class StorageConfig {
  /** khitrướcỨng dụngbảnquyển */
  static readonly CURRENT_VERSION = __APP_VERSION__

  /** tồntrữphímtrướchậu tố */
  static readonly STORAGE_PREFIX = 'sys-v'

  /** bảnquyểnphímdanh */
  static readonly VERSION_KEY = 'sys-version'

  /** ChuDephímdanh（index.htmltrongkhiếndùngrồi，nếuquảsửasửa，cầncầncùngbướcsửasửa） */
  static readonly THEME_KEY = 'sys-theme'

  /** trênlầnDangNhapNguoiDungIDphímdanh（dùngởđoánlàphủvìcùngmộtNguoiDungDangNhap） */
  static readonly LAST_USER_ID_KEY = 'sys-last-user-id'

  /** ứngkiểuBố cụcChuyển đổigiờTạmtồnbànmặtđầuMenuloạikiểu */
  static readonly RESPONSIVE_MENU_TYPE_KEY = 'sys-responsive-menu-type'

  /** nhảyquaNâng cấpTìmcủabảnquyển */
  static readonly SKIP_UPGRADE_VERSION = '1.0.0'

  /** Nâng cấpXuLyThoiGian（milligiây） */
  static readonly UPGRADE_DELAY = 1000

  /** đăngraThoiGian（milligiây） */
  static readonly LOGOUT_DELAY = 1000

  /**
   * sinhthànhbảnquyểnhóacủatồntrữphímdanh
   * @param storeId tồntrữID
   * @param version bảnquyểnsố，MacDinhkhiếndùngkhitrướcbảnquyển
   */
  static generateStorageKey(storeId: string, version: string = this.CURRENT_VERSION): string {
    return `${this.STORAGE_PREFIX}${version}-${storeId}`
  }

  /**
   * sinhthànhcũbảnquyểncủatồntrữphímdanh（Khôngmangphầnký）
   * @param version bảnquyểnsố，MacDinhkhiếndùngkhitrướcbảnquyển
   */
  static generateLegacyKey(version: string = this.CURRENT_VERSION): string {
    return `${this.STORAGE_PREFIX}${version}`
  }

  /**
   * xâytồntrữphímngựaPhâncủađúngbảngkiểu
   * @param storeId tồntrữID
   */
  static createKeyPattern(storeId: string): RegExp {
    return new RegExp(`^${this.STORAGE_PREFIX}[^-]+-${storeId}$`)
  }

  /**
   * xâykhitrướcbảnquyểntồntrữphímngựaPhâncủađúngbảngkiểu
   */
  static createCurrentVersionPattern(): RegExp {
    return new RegExp(`^${this.STORAGE_PREFIX}${this.CURRENT_VERSION}-`)
  }

  /**
   * xâynhiệmýbảnquyểntồntrữphímngựaPhâncủađúngbảngkiểu
   */
  static createVersionPattern(): RegExp {
    return new RegExp(`^${this.STORAGE_PREFIX}`)
  }

  /**
   * Tìmlàphủvìkhitrướcbảnquyểncủaphím
   */
  static isCurrentVersionKey(key: string): boolean {
    return key.startsWith(`${this.STORAGE_PREFIX}${this.CURRENT_VERSION}`)
  }

  /**
   * Tìmlàphủvìbảnquyểnhóacủaphím
   */
  static isVersionedKey(key: string): boolean {
    return key.startsWith(this.STORAGE_PREFIX)
  }

  /**
   * từtồntrữphímtronggợiHủybảnquyểnsố
   */
  static extractVersionFromKey(key: string): string | null {
    const match = key.match(new RegExp(`^${this.STORAGE_PREFIX}([^-]+)`))
    return match ? match[1] : null
  }

  /**
   * từtồntrữphímtronggợiHủytồntrữID
   */
  static extractStoreIdFromKey(key: string): string | null {
    const match = key.match(new RegExp(`^${this.STORAGE_PREFIX}[^-]+-(.+)$`))
    return match ? match[1] : null
  }
}
