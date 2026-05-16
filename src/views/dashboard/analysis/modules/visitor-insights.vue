<template>
  <div class="art-card h-82 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t48') }}</h4>
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 30px)"
      :data="chartData"
      :xAxisData="xAxisData"
      :showLegend="true"
      :showAxisLabel="true"
      :showAxisLine="false"
      :showSplitLine="true"
    />
  </div>
</template>

<script setup lang="ts">
  import type { LineDataItem } from '@/types/component/chart'

  /**
   * X TrụcDữ liệuCauHinh
   * bảngthịmộtnămcủatháng（1-12tháng）
   */
  const xAxisData = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

  /**
   * PhanTich khách truy cậpBiểu đồDữ liệu
   * đốiso sánhgiàkháchkhoảnvàmớikháchkhoảncủatoànnămTruy cậpXu hướng
   */
  const chartData = computed<LineDataItem[]>(() => [
    {
      name: 'giàkháchkhoản',
      data: [280, 350, 300, 250, 230, 210, 240, 280, 320, 350, 300, 200]
    },
    {
      name: 'mớikháchkhoản',
      data: [260, 200, 150, 130, 180, 270, 340, 380, 300, 220, 170, 130]
    }
  ])
</script>
