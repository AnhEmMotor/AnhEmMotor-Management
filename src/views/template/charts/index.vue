<template>
  <div class="pt-5">
    <h1 class="page-title">{{ $t('admin.t198') }}</h1>

    <ElRow :gutter="20">
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t199') }}</span>
          </div>
          <ArtBarChart
            :data="singleBarData"
            :xAxisData="xAxisData"
            :showLegend="true"
            legendPosition="right"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t200') }}</span>
          </div>
          <ArtBarChart
            :data="multiBarData"
            :xAxisData="xAxisData"
            :showLegend="true"
            barWidth="26%"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t201') }}</span>
          </div>
          <ArtBarChart
            :data="stackBarData"
            :xAxisData="stackXAxisData"
            :showLegend="true"
            :stack="true"
            barWidth="26%"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t202') }}</span>
          </div>
          <ArtLineChart
            :data="[58, 15, 82, 35, 120, 62, 45]"
            :xAxisData="[
              'mộttháng',
              'haitháng',
              'batháng',
              'bốntháng',
              'nămtháng',
              'sáutháng',
              'bảytháng'
            ]"
            symbol="none"
            :symbolSize="7"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t203') }}</span>
          </div>
          <ArtLineChart
            :data="[28, 45, 82, 35, 100, 32, 55]"
            :xAxisData="[
              'mộttháng',
              'haitháng',
              'batháng',
              'bốntháng',
              'nămtháng',
              'sáutháng',
              'bảytháng'
            ]"
            :showAreaColor="true"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t204') }}</span>
          </div>
          <ArtLineChart
            :data="multiLineData"
            :xAxisData="['1tháng', '2tháng', '3tháng', '4tháng', '5tháng', '6tháng']"
            :showLegend="true"
          />
        </div>
      </ElCol>

      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t205') }}</span>
          </div>
          <ArtHBarChart
            :data="[50, 80, 120, 90, 60]"
            :xAxisData="[
              'sinhsản phẩmA',
              'sinhsản phẩmB',
              'sinhsản phẩmC',
              'sinhsản phẩmD',
              'sinhsản phẩmE'
            ]"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t206') }}</span>
          </div>

          <ArtHBarChart
            :data="[
              { name: 'hệcột1', data: [10, 20, 30] },
              { name: 'hệcột2', data: [15, 25, 35] }
            ]"
            :xAxisData="['loạimục1', 'loạimục2', 'loạimục3']"
            :showLegend="true"
            barWidth="30%"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t207') }}</span>
          </div>
          <ArtHBarChart
            :data="[
              { name: 'hệcột1', data: [10, 20, 30] },
              { name: 'hệcột2', data: [15, 25, 35] }
            ]"
            :xAxisData="['loạimục1', 'loạimục2', 'loạimục3']"
            :showLegend="true"
            :stack="true"
            barWidth="30%"
          />
        </div>
      </ElCol>

      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t208') }}</span>
          </div>
          <ArtRingChart
            :data="[
              { value: 35, name: 'Phân loạiA' },
              { value: 28, name: 'Phân loạiB' },
              { value: 42, name: 'Phân loạiC' }
            ]"
            :radius="['54%', '70%']"
            legendPosition="bottom"
          />
        </div>
      </ElCol>

      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t209') }}</span>
          </div>
          <ArtRingChart
            :data="[
              { value: 35, name: 'Phân loạiA' },
              { value: 28, name: 'Phân loạiB' },
              { value: 42, name: 'Phân loạiC' },
              { value: 32, name: 'Phân loạiD' },
              { value: 26, name: 'Phân loạiE' },
              { value: 37, name: 'Phân loạiF' }
            ]"
            :radius="['54%', '70%']"
            :borderRadius="0"
            :showLegend="true"
            legendPosition="bottom"
            centerText="¥300,458"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t210') }}</span>
          </div>
          <ArtRingChart
            :data="[
              { value: 30, name: 'Phân loạiA' },
              { value: 25, name: 'Phân loạiB' },
              { value: 45, name: 'Phân loạiC' }
            ]"
            :radius="['0%', '70%']"
            :showLegend="true"
            legendPosition="right"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t211') }}</span>
          </div>
          <ArtScatterChart
            :data="[
              { value: [1, 3] },
              { value: [2, 4] },
              { value: [3, 5] },
              { value: [4, 6] },
              { value: [5, 7] },
              { value: [6, 8] },
              { value: [7, 7] },
              { value: [8, 9] },
              { value: [9, 8] },
              { value: [10, 6] },
              { value: [11, 7] },
              { value: [12, 8] }
            ]"
          />
        </div>
      </ElCol>

      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t212') }}</span>
          </div>
          <ArtRadarChart
            :indicator="[
              { name: 'tácbán', max: 100 },
              { name: 'Quản lý', max: 100 },
              { name: 'kỹthuật', max: 100 },
              { name: 'kháchphục', max: 100 },
              { name: 'mởphát', max: 100 }
            ]"
            :data="[
              {
                name: 'trướcphầnPhân',
                value: [80, 70, 90, 85, 75]
              },
              {
                name: 'thựctếmởtác',
                value: [70, 75, 85, 80, 70]
              }
            ]"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t213') }}</span>
          </div>
          <ArtKLineChart
            :data="[
              { time: '2024-01-01', open: 20, close: 23, high: 25, low: 18 },
              { time: '2024-01-02', open: 23, close: 21, high: 24, low: 20 },
              { time: '2024-01-03', open: 21, close: 25, high: 26, low: 21 }
            ]"
            :showDataZoom="false"
            :dataZoomStart="0"
            :dataZoomEnd="100"
          />
        </div>
      </ElCol>
      <ElCol :xs="24" :md="12" :lg="8" class="mb-5">
        <div class="art-card">
          <div class="pb-3.5">
            <span class="text-base font-medium">{{ $t('admin.t214') }}</span>
          </div>
          <ArtDualBarCompareChart
            :positiveData="[50, 28, 80, 65, 68, 70, 60, 55]"
            :negativeData="[50, 28, 40, 45, 38, 50, 42, 48]"
            :xAxisData="[
              '0-4tuổi',
              '5-14tuổi',
              '15-24tuổi',
              '25-34tuổi',
              '35-44tuổi',
              '45-54tuổi',
              '55-64tuổi',
              '65tuổilấytrên'
            ]"
            positiveName="NamtínhTuổiPhân bố"
            negativeName="NữtínhTuổiPhân bố"
          />
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import type { LineDataItem } from '@/types/component/chart'

  defineOptions({ name: 'TemplateCharts' })

  const multiLineData: LineDataItem[] = [
    {
      name: 'tácbántrán',
      data: [120, 132, 101, 134, 90, 130],
      areaStyle: {
        startOpacity: 0.1,
        endOpacity: 0
      }
    },
    {
      name: 'Lợi nhuận',
      data: [80, 92, 71, 94, 60, 80],
      areaStyle: {
        startOpacity: 0.1,
        endOpacity: 0
      }
    }
  ]

  const singleBarData = ref([120, 200, 150, 80, 70, 110, 130])
  const xAxisData = ref([
    'tuầnmột',
    'tuầnhai',
    'tuầnba',
    'tuầnbốn',
    'tuầnnăm',
    'tuầnsáu',
    'tuầnngày'
  ])

  const multiBarData = ref([
    { name: 'tácbántrán', data: [120, 200, 150, 80, 70, 110, 130] },
    { name: 'Lợi nhuận', data: [20, 50, 30, 15, 10, 25, 35] }
  ])

  const stackBarData = ref([
    { name: 'Q1', data: [20, 25, 30, 35, 40], stack: 'total' },
    { name: 'Q2', data: [30, 35, 40, 45, 50], stack: 'total' }
  ])

  const stackXAxisData = ref([
    'sinhsản phẩmA',
    'sinhsản phẩmB',
    'sinhsản phẩmC',
    'sinhsản phẩmD',
    'sinhsản phẩmE'
  ])
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .page-title {
    @apply my-5 text-xl font-medium first:mt-0;
  }

  .art-card {
    @apply p-5;
  }
</style>
