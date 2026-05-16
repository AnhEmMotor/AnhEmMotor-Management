<template>
  <ArtTimelineListCard
    :list="timelineData"
    :title="$t('admin.t76')"
    subtitle="nayngàyĐơn hàngHoạt động"
    class="h-[27.8rem] mb-5 max-sm:mb-4"
  />
</template>

<script setup lang="ts">
  interface TimelineItem {
    time: string
    status: string
    content: string
    code?: string
  }

  /**
   * Giao dịch gần đâyThoiGianđườngDữ liệu
   * Ghi chépnayngàyĐơn hàngXuLy、thươngsản phẩmtrêngiá、chiếctrảbằngđóngphímsốngđộng
   */
  const timelineData: TimelineItem[] = [
    {
      time: 'trêntrưa 09:30',
      status: 'rgb(73, 190, 255)',
      content: 'BộđếnĐơn hàng #38291 chiếctrả ¥385.90'
    },
    {
      time: 'trêntrưa 10:00',
      status: 'rgb(54, 158, 255)',
      content: 'mớithươngsản phẩmtrêngiá',
      code: 'SKU-3467'
    },
    {
      time: 'trêntrưa 12:00',
      status: 'rgb(103, 232, 207)',
      content: 'hướngcungứngthươngchiếctrảrồi ¥6495.00'
    },
    {
      time: 'dướitrưa 14:30',
      status: 'rgb(255, 193, 7)',
      content: 'thúctácsốngđộngBắt đầu',
      code: 'PROMO-2023'
    },
    {
      time: 'dướitrưa 15:45',
      status: 'rgb(255, 105, 105)',
      content: 'Đơn hàngHủygợitỉnh',
      code: 'ORD-9876'
    },
    {
      time: 'dướitrưa 17:00',
      status: 'rgb(103, 232, 207)',
      content: 'hoànthànhngàytácbánbáobảng'
    }
  ]
</script>
