import { nextTick } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import { Router } from 'vue-router'
import NProgress from 'nprogress'
import { useCommon } from '@/hooks/core/useCommon'
import { loadingService } from '@/utils/ui'
import { getPendingLoading, resetPendingLoading } from './beforeEach'

/** Routingtoànbộsauđặtgiữvệ */
export function setupAfterEachGuard(router: Router) {
  const { scrollToTop } = useCommon()

  router.afterEach(() => {
    scrollToTop()

    // đóngđóngThanh tiến trình
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) {
      NProgress.done()
      // Đảm bảoThanh tiến trìnhhoàntoànDichia，tránhmiễntànảnh
      setTimeout(() => {
        NProgress.remove()
      }, 600)
    }

    // đóngđóng loading Hiệu quả
    if (getPendingLoading()) {
      nextTick(() => {
        loadingService.hideLoading()
        resetPendingLoading()
      })
    }
  })
}
