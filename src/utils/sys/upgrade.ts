/**
 * HeThongbảnquyểnNâng cấpQuản lýmôkhối
 *
 * gợicungĐầy đủcủaỨng dụngbảnquyểnNâng cấpđovàXuLycôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - bảnquyểnsốso sánhsovàNâng cấpđo
 * - đầulầnTruy cậptínhvàXuLy
 * - cũbảnquyểnDữ liệutừđộngxóalý
 * - Nâng cấpNhatKytriểnthịvàThongBao
 * - cườngchếtrùngmớiDangNhapkhốngchế（liệuNâng cấpNhatKyCauHinh）
 * - bảnquyểnsốquyphạmhóaXuLy
 * - cũtồntrữKếtcấudờiDivàxóalý
 * - Nâng cấpchuyểntrìnhThựcdòng（Đảm bảoỨng dụnghoàntoànLoading）
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Ứng dụngbậtđộnggiờtừđộngđobảnquyểnNâng cấp
 * - bảnquyểnCập nhậtsauxóalýcũDữ liệu
 * - hướngNguoiDungtriểnthịbảnquyểnCập nhậtNoiDung
 * - trùngđạiCập nhậtgiờcầncầuNguoiDungtrùngmớiDangNhap
 * - PhòngthúccũbảnquyểnDữ liệubẩnmớibảnquyển
 *
 * ## cônglàmchuyểntrình
 *
 * 1. Tìmquyểnđịatồntrữcủabảnquyểnsố
 * 2. vớikhitrướcỨng dụngbảnquyểnđốiso sánh
 * 3. TimKiemđồng thờixóalýcũbảnquyểnDữ liệu
 * 4. triểnthịNâng cấpThongBao（Bao gồmNhatKy cập nhật）
 * 5. liệuCauHinhđịnhlàphủcườngchếtrùngmớiDangNhap
 * 6. Cập nhậtquyểnđịabảnquyểnsố
 *
 * @module utils/sys/upgrade
 * @author Art Design Pro Team
 */
import { upgradeLogList } from '@/mock/upgrade/changeLog'
import { ElNotification } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { StorageConfig } from '@/utils/storage/storage-config'

/**
 * bảnquyểnQuản lýthiết bị
 * tráchXuLybảnquyểnso sánhso、Nâng cấpđovàDữ liệuxóalý
 */
class VersionManager {
  /**
   * quyphạmhóabảnquyểnsốChuỗi，Dichiatrướchậu tố 'v'
   */
  private normalizeVersion(version: string): string {
    return version.replace(/^v/, '')
  }

  /**
   * Lấytồntrữcủabảnquyểnsố
   */
  private getStoredVersion(): string | null {
    return localStorage.getItem(StorageConfig.VERSION_KEY)
  }

  /**
   * CaiDatbảnquyểnsốđếntồntrữ
   */
  private setStoredVersion(version: string): void {
    localStorage.setItem(StorageConfig.VERSION_KEY, version)
  }

  /**
   * TìmlàphủứngnênnhảyquaNâng cấpXuLy
   */
  private shouldSkipUpgrade(): boolean {
    return StorageConfig.CURRENT_VERSION === StorageConfig.SKIP_UPGRADE_VERSION
  }

  /**
   * TìmlàphủvìđầulầnTruy cập
   */
  private isFirstVisit(storedVersion: string | null): boolean {
    return !storedVersion
  }

  /**
   * Tìmbảnquyểnlàphủcùng
   */
  private isSameVersion(storedVersion: string): boolean {
    return storedVersion === StorageConfig.CURRENT_VERSION
  }

  /**
   * TimKiemcũcủatồntrữKếtcấu
   */
  private findLegacyStorage(): { oldSysKey: string | null; oldVersionKeys: string[] } {
    const storageKeys = Object.keys(localStorage)
    const currentVersionPrefix = StorageConfig.generateStorageKey('').slice(0, -1) // Dichiacuốiđuôicủa '-'

    // TimKiemcũcủađơnmộttồntrữKếtcấu
    const oldSysKey =
      storageKeys.find(
        (key) =>
          StorageConfig.isVersionedKey(key) && key !== currentVersionPrefix && !key.includes('-')
      ) || null

    // TimKiemcũbảnquyểncủaphầnNgoạitồntrữphím
    const oldVersionKeys = storageKeys.filter(
      (key) =>
        StorageConfig.isVersionedKey(key) &&
        !StorageConfig.isCurrentVersionKey(key) &&
        key.includes('-')
    )

    return { oldSysKey, oldVersionKeys }
  }

  /**
   * TìmlàphủcầncầntrùngmớiDangNhap
   */
  private shouldRequireReLogin(storedVersion: string): boolean {
    const normalizedCurrent = this.normalizeVersion(StorageConfig.CURRENT_VERSION)
    const normalizedStored = this.normalizeVersion(storedVersion)

    return upgradeLogList.value.some((item) => {
      const itemVersion = this.normalizeVersion(item.version)
      return (
        item.requireReLogin && itemVersion > normalizedStored && itemVersion <= normalizedCurrent
      )
    })
  }

  /**
   * cấuxâyNâng cấpThongBaoTinNhan
   */
  private buildUpgradeMessage(requireReLogin: boolean): string {
    const { title: content } = upgradeLogList.value[0]

    const messageParts = [
      `<p style="color: var(--art-gray-800) !important; padding-bottom: 5px;">`,
      `HeThongĐãNâng cấpđến ${StorageConfig.CURRENT_VERSION} bảnquyển，nàylầnCập nhậtmangđếnrồilấydướisửavào：`,
      `</p>`,
      content
    ]

    if (requireReLogin) {
      messageParts.push(
        `<p style="color: var(--theme-color); padding-top: 5px;">Nâng cấphoànthành，Vui lòngtrùngmớiDangNhapsautiếptiếpkhiếndùng。</p>`
      )
    }

    return messageParts.join('')
  }

  /**
   * Hiển thịNâng cấpThongBao
   */
  private showUpgradeNotification(message: string): void {
    ElNotification({
      title: 'HeThongNâng cấpcôngbáo',
      message,
      duration: 0,
      type: 'success',
      dangerouslyUseHTMLString: true
    })
  }

  /**
   * xóalýcũbảnquyểnDữ liệu
   */
  private cleanupLegacyData(oldSysKey: string | null, oldVersionKeys: string[]): void {
    // xóalýcũcủađơnmộttồntrữKếtcấu
    if (oldSysKey) {
      localStorage.removeItem(oldSysKey)
      console.info(`[Upgrade] Đãxóalýcũtồntrữ: ${oldSysKey}`)
    }

    // xóalýcũbảnquyểncủaphầnNgoạitồntrữ
    oldVersionKeys.forEach((key) => {
      localStorage.removeItem(key)
      console.info(`[Upgrade] Đãxóalýcũtồntrữ: ${key}`)
    })
  }

  /**
   * ThựcdòngNâng cấpsaucủađăngraHanhDong
   */
  private performLogout(): void {
    try {
      useUserStore().logOut()
      console.info('[Upgrade] ĐãThựcdòngNâng cấpsauđăngra')
    } catch (error) {
      console.error('[Upgrade] Nâng cấpsauđăngraThatBai:', error)
    }
  }

  /**
   * ThựcdòngNâng cấpchuyểntrình
   */
  private async executeUpgrade(
    storedVersion: string,
    legacyStorage: ReturnType<typeof this.findLegacyStorage>
  ): Promise<void> {
    try {
      if (!upgradeLogList.value.length) {
        console.warn('[Upgrade] Nâng cấpNhatKyDanh sáchvìkhông')
        return
      }

      const requireReLogin = this.shouldRequireReLogin(storedVersion)
      const message = this.buildUpgradeMessage(requireReLogin)

      // Hiển thịNâng cấpThongBao
      this.showUpgradeNotification(message)

      // Cập nhậtbảnquyểnsố
      this.setStoredVersion(StorageConfig.CURRENT_VERSION)

      // xóalýcũDữ liệu
      this.cleanupLegacyData(legacyStorage.oldSysKey, legacyStorage.oldVersionKeys)

      // Thựcdòngđăngra（nếuquảcầncần）
      if (requireReLogin) {
        this.performLogout()
      }

      console.info(
        `[Upgrade] Nâng cấphoànthành: ${storedVersion} → ${StorageConfig.CURRENT_VERSION}`
      )
    } catch (error) {
      console.error('[Upgrade] HeThongNâng cấpXuLyThatBai:', error)
    }
  }

  /**
   * HeThongNâng cấpXuLychủchuyểntrình
   */
  async processUpgrade(): Promise<void> {
    // nhảyquađặcđịnhbảnquyển
    if (this.shouldSkipUpgrade()) {
      console.debug('[Upgrade] nhảyquabảnquyểnNâng cấpTìm')
      return
    }

    const storedVersion = this.getStoredVersion()

    // đầulầnTruy cậpXuLy
    if (this.isFirstVisit(storedVersion)) {
      this.setStoredVersion(StorageConfig.CURRENT_VERSION)
      // console.info('[Upgrade] đầulầnTruy cập，ĐãCaiDatkhitrướcbảnquyển')
      return
    }

    // bảnquyểncùng，vôcầnNâng cấp
    if (this.isSameVersion(storedVersion!)) {
      // console.debug('[Upgrade] bảnquyểncùng，vôcầnNâng cấp')
      return
    }

    // TìmlàphủcócầncầnNâng cấpcủacũDữ liệu
    const legacyStorage = this.findLegacyStorage()
    if (!legacyStorage.oldSysKey && legacyStorage.oldVersionKeys.length === 0) {
      this.setStoredVersion(StorageConfig.CURRENT_VERSION)
      console.info('[Upgrade] vôcũDữ liệu，ĐãCập nhậtbảnquyểnsố')
      return
    }

    // ThựcdòngNâng cấpchuyểntrình，Đảm bảoỨng dụngĐãhoàntoànLoading
    setTimeout(() => {
      this.executeUpgrade(storedVersion!, legacyStorage)
    }, StorageConfig.UPGRADE_DELAY)
  }
}

// xâybảnquyểnQuản lýthiết bịthựcví dụ
const versionManager = new VersionManager()

/**
 * HeThongNâng cấpXuLyvàodiệnHàm
 */
export async function systemUpgrade(): Promise<void> {
  await versionManager.processUpgrade()
}
