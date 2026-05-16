<template>
  <div class="art-card h-82 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t49') }}</h4>
      </div>
    </div>

    <ArtBarChart
      class="mt-6"
      height="14.3rem"
      :data="volumeServiceData"
      :xAxisData="serviceCategories"
      :showLegend="true"
      :showAxisLine="false"
      :stack="true"
      barWidth="22%"
    />
  </div>
</template>

<script setup lang="ts">
  interface VolumeServiceDataItem {
    name: string
    data: number[]
    stack: string
  }

  /**
   * phụcvụloạitínhDữ liệu
   * Khôngcùngsinhsản phẩmcủaPhân loạiTag
   */
  const serviceCategories = ref([
    'sinhsản phẩmA',
    'sinhsản phẩmB',
    'sinhsản phẩmC',
    'sinhsản phẩmD',
    'sinhsản phẩmE'
  ])

  /**
   * nghiệpvụlượngvớiphụcvụlượngDữ liệu
   * triểnthịcácsinhsản phẩmcủanghiệpvụlượngvàphụcvụlượngđốiso sánh，khiếndùngtrạngảnhtriểnthị
   */
  const volumeServiceData = ref<VolumeServiceDataItem[]>([
    {
      name: 'nghiệpvụlượng',
      data: [20, 25, 30, 35, 40],
      stack: 'total'
    },
    {
      name: 'phụcvụlượng',
      data: [30, 35, 40, 45, 50],
      stack: 'total'
    }
  ])
</script>
