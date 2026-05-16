/**
 * Pinia Store CauHinhmôkhối
 *
 * gợicungtoànbộTrạng tháiQuản lýcủaban đầuđầuhóavàCauHinh
 *
 * ## chủcầncôngnăng
 *
 * - Pinia Store thựcví dụxây
 * - trìlâuhóachènphần tửCauHinh（pinia-plugin-persistedstate）
 * - bảnquyểnhóatồntrữphímQuản lý
 * - từđộngDữ liệudờiDi（vượtbảnquyển）
 * - LocalStorage thứcộthóaCauHinh
 * - Store ban đầuđầuhóaHàm
 *
 * ## trìlâuhóasáchlược
 *
 * - khiếndùng StorageKeyManager sinhthànhbảnquyểnhóacủatồntrữphím
 * - cáchkiểu：sys-v{version}-{storeId}
 * - từđộngdờiDicũbảnquyểnDữ liệuđếnkhitrướcbảnquyển
 * - khiếndùng localStorage làmvìtồntrữgiớichất
 *
 * @module store/index
 * @author Art Design Pro Team
 */
import type { App } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { StorageKeyManager } from '@/utils/storage/storage-key-manager'

export const store = createPinia()

// xâytồntrữphímQuản lýthiết bịthựcví dụ
const storageKeyManager = new StorageKeyManager()

// CauHinhtrìlâuhóachènphần tử
store.use(
  createPersistedState({
    key: (storeId: string) => storageKeyManager.getStorageKey(storeId),
    storage: localStorage,
    serializer: {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
  })
)

/**
 * ban đầuđầuhóa Store
 */
export function initStore(app: App<Element>): void {
  app.use(store)
}
