/**
 * tồntrữphímdanhQuản lýthiết bịmôkhối
 *
 * gợicungtrínăngcủabảnquyểnhóatồntrữphímQuản lývàDữ liệudờiDicôngnăng
 *
 * ## chủcầncôngnăng
 *
 * - từđộngsinhthànhkhitrướcbảnquyểncủatồntrữphímdanh
 * - đokhitrướcbảnquyểnDữ liệulàphủtồntại
 * - TimKiemnóanh ấybảnquyểncủacùngdanhtồntrữDữ liệu
 * - từđộngtươngcũbảnquyểnDữ liệudờiDiđếnkhitrướcbảnquyển
 * - Dữ liệudờiDiNhatKyGhi chép
 * - dờiDiThatBaicủaXuLy lỗi
 *
 * ## khiếndùngtrườngcảnh
 *
 * - Pinia Store trìlâuhóachènphần tửtrongLấytồntrữphím
 * - Ứng dụngbảnquyểnNâng cấpgiờtừđộngdờiDiNguoiDungDữ liệu
 * - tránhmiễnbảnquyểnNâng cấpXuấtđếncủaDữ liệumấtthất
 * - thựchiệntrượtcủabảnquyểnquađộ
 *
 * ## cônglàmchuyểntrình
 *
 * 1. Tốikhiếndùngkhitrướcbảnquyểncủatồntrữphím
 * 2. nếuquảkhitrướcbảnquyểnvôDữ liệu，TimKiemnóanh ấybảnquyểncủacùngdanhDữ liệu
 * 3. tìmđếncũbảnquyểnDữ liệusautừđộngdờiDiđếnkhitrướcbảnquyển
 * 4. Quay lạikhitrướcbảnquyểncủatồntrữphímcungkhiếndùng
 *
 * @module utils/storage/storage-key-manager
 * @author Art Design Pro Team
 */
import { StorageConfig } from '@/utils/storage'

/**
 * tồntrữphímdanhQuản lýthiết bị
 * tráchXuLybảnquyểnhóacủatồntrữphímdanhsinhthànhvàDữ liệudờiDi
 */
export class StorageKeyManager {
  /**
   * Lấykhitrướcbảnquyểncủatồntrữphímdanh
   */
  private getCurrentVersionKey(storeId: string): string {
    return StorageConfig.generateStorageKey(storeId)
  }

  /**
   * TìmkhitrướcbảnquyểncủaDữ liệulàphủtồntại
   */
  private hasCurrentVersionData(key: string): boolean {
    return localStorage.getItem(key) !== null
  }

  /**
   * TimKiemnóanh ấybảnquyểncủacùngdanhtồntrữphím
   */
  private findExistingKey(storeId: string): string | null {
    const storageKeys = Object.keys(localStorage)
    const pattern = StorageConfig.createKeyPattern(storeId)

    return storageKeys.find((key) => pattern.test(key) && localStorage.getItem(key)) || null
  }

  /**
   * tươngDữ liệutừcũbảnquyểndờiDiđếnkhitrướcbảnquyển
   */
  private migrateData(fromKey: string, toKey: string): void {
    try {
      const existingData = localStorage.getItem(fromKey)
      if (existingData) {
        localStorage.setItem(toKey, existingData)
        console.info(`[Storage] ĐãdờiDiDữ liệu: ${fromKey} → ${toKey}`)
      }
    } catch (error) {
      console.warn(`[Storage] Dữ liệudờiDiThatBai: ${fromKey}`, error)
    }
  }

  /**
   * Lấytrìlâuhóatồntrữcủaphímdanh（chiếctrìtừđộngDữ liệudờiDi）
   */
  getStorageKey(storeId: string): string {
    const currentKey = this.getCurrentVersionKey(storeId)

    // TốikhiếndùngkhitrướcbảnquyểncủaDữ liệu
    if (this.hasCurrentVersionData(currentKey)) {
      return currentKey
    }

    // TimKiemđồng thờidờiDinóanh ấybảnquyểncủaDữ liệu
    const existingKey = this.findExistingKey(storeId)
    if (existingKey) {
      this.migrateData(existingKey, currentKey)
    }

    return currentKey
  }
}
