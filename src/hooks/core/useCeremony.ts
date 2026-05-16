/**
 * useCeremony - tiếtngàymừngchúcQuản lý
 *
 * gợicungtiếtngàykhóihoaHiệu quảvàchúcphúcvănquyểntriểnthịcôngnăng，vìHeThongThêmtiếtngàykhívi。
 * từđộngđokhitrướcNgàylàphủvìtiếtngày，đồng thờitạiđầulầnvàovàogiờphátphóngkhóihoaHoatAnhvàHiển thịchúcphúcngôn。
 *
 * ## chủcầncôngnăng
 *
 * 1. tiếtngàyđo - từđộngngựaPhânkhitrướcNgàyvớitiếtngàyCauHinhDanh sách，chiếctrìđơnngàyvàvượtNgàytiếtngày
 * 2. khóihoaHoatAnh - phátphóngtiếtngàykhóihoađặchiệu，chiếctrìTùy chỉnhHình ảnhvàKích hoạtlầnsố
 * 3. chúcphúcvănquyển - khóihoaKếtthúcsauHiển thịtiếtngàychúcphúcvănquyển
 * 4. Trạng tháiQuản lý - Ghi chépkhóihoaphátphóngTrạng thái，tránhmiễntrùngphụcphátphóng
 * 5. xóalýmáychế - gợicungxóalýPhuongThuc，chiếctrìtayđộngdừngthúcvàĐặt lại
 *
 * ## Ví dụ sử dụng
 *
 * ```typescript
 * // tạiCauHinhvănphần tửtrongĐịnh nghĩatiếtngày
 * // đơnngàytiếtngày
 * {
 *   date: '2024-12-25',
 *   name: 'thánhđảntiết',
 *   image: christmasImage,
 *   count: 3 // Có thểvị，KhôngCaiDatkhiếndùngMacDinhgiá trị 3 lần
 *   scrollText: 'Merry Christmas!',
 * }
 *
 * // vượtNgàytiếtngày
 * {
 *   date: '2025-11-07',
 *   endDate: '2025-11-10',
 *   name: 'v3.0 đothửđoạn',
 *   image: '',
 *   count: 5 // Tùy chỉnhkhóihoaphátphónglầnsố
 *   scrollText: 'HeThong v3.0 đothửđoạnđúngkiểumởbật！',
 * }
 * ```
 *
 * @module useCeremony
 * @author Art Design Pro Team
 */

import { useTimeoutFn, useIntervalFn, useDateFormat } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useSettingStore } from '@/store/modules/setting'
import { mittBus } from '@/utils/sys'
import { festivalConfigList } from '@/config/modules/festival'

/**
 * tiếtngàymừngchúcCauHinhlệlượng
 */
const FESTIVAL_CONFIG = {
  /** ban đầuđầu（milligiây） */
  INITIAL_DELAY: 300,
  /** khóihoaphátphóngKhoảng cách（milligiây） */
  FIREWORK_INTERVAL: 1000,
  /** vănquyểnHiển thị（milligiây） */
  TEXT_DELAY: 2000,
  /** MacDinhkhóihoaphátphónglầnsố */
  DEFAULT_FIREWORKS_COUNT: 3
} as const

/**
 * tiếtngàymừngchúccôngnăng
 * gợicungtiếtngàykhóihoaHiệu quảvàchúcphúcvănquyểntriểnthị
 */
export function useCeremony() {
  const settingStore = useSettingStore()
  const { holidayFireworksLoaded, isShowFireworks } = storeToRefs(settingStore)

  let fireworksInterval: { pause: () => void } | null = null

  /**
   * TìmNgàylàphủtạitiếtngàyphạmvitrong
   * @param currentDate khitrướcNgày
   * @param festivalDate tiếtngàyBắt đầuNgày
   * @param festivalEndDate tiếtngàyKếtthúcNgày（Có thểvị）
   */
  const isDateInRange = (
    currentDate: string,
    festivalDate: string,
    festivalEndDate?: string
  ): boolean => {
    if (!festivalEndDate) {
      // đơnngàytiếtngày
      return currentDate === festivalDate
    }

    // vượtNgàytiếtngày
    const current = new Date(currentDate)
    const start = new Date(festivalDate)
    const end = new Date(festivalEndDate)

    return current >= start && current <= end
  }

  /**
   * LấykhitrướcNgàyđốiứngcủatiếtngàyDữ liệu
   */
  const currentFestivalData = computed(() => {
    const currentDate = useDateFormat(new Date(), 'YYYY-MM-DD').value
    return festivalConfigList.find((item) => isDateInRange(currentDate, item.date, item.endDate))
  })

  /**
   * Cập nhậttiếtngàyNgàyđến store
   */
  const updateFestivalDate = () => {
    settingStore.setFestivalDate(currentFestivalData.value?.date || '')
  }

  /**
   * Kích hoạtkhóihoaHiệu quả
   */
  const triggerFirework = () => {
    mittBus.emit('triggerFireworks', currentFestivalData.value?.image)
  }

  /**
   * hoànthànhkhóihoaHiệu quảsauHiển thịvănquyển
   */
  const showFestivalText = () => {
    settingStore.setholidayFireworksLoaded(true)

    useTimeoutFn(() => {
      settingStore.setShowFestivalText(true)
      updateFestivalDate()
    }, FESTIVAL_CONFIG.TEXT_DELAY)
  }

  /**
   * bậtđộngkhóihoaVòng lặp
   */
  const startFireworksLoop = () => {
    let playedCount = 0
    // khiếndùngtiếtngàyCauHinhcủaphátphónglầnsố，nếuquảkhôngcókhiếndùngMacDinhgiá trị
    const count = currentFestivalData.value?.count ?? FESTIVAL_CONFIG.DEFAULT_FIREWORKS_COUNT

    const { pause } = useIntervalFn(() => {
      triggerFirework()
      playedCount++

      if (playedCount >= count) {
        pause()
        showFestivalText()
      }
    }, FESTIVAL_CONFIG.FIREWORK_INTERVAL)

    fireworksInterval = { pause }
  }

  /**
   * mởbậttiếtngàymừngchúc
   */
  const openFestival = () => {
    if (!currentFestivalData.value || !isShowFireworks.value) {
      return
    }

    const { start } = useTimeoutFn(startFireworksLoop, FESTIVAL_CONFIG.INITIAL_DELAY)
    start()
  }

  /**
   * xóalýkhóihoaHiệu quả
   */
  const cleanup = () => {
    if (fireworksInterval) {
      fireworksInterval.pause()
      fireworksInterval = null
    }
    settingStore.setShowFestivalText(false)
    updateFestivalDate()
  }

  return {
    openFestival,
    cleanup,
    holidayFireworksLoaded,
    currentFestivalData,
    isShowFireworks
  }
}
