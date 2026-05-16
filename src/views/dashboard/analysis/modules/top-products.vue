<template>
  <div class="art-card h-82 p-5 mb-5 overflow-hidden max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t44') }}</h4>
      </div>
    </div>
    <div class="overflow-auto h-full">
      <ArtTable
        :data="products"
        style="width: 100%"
        size="large"
        :border="false"
        :stripe="false"
        :header-cell-style="{ background: 'transparent' }"
      >
        <ElTableColumn prop="name" :label="$t('admin.t45')" width="200" />
        <ElTableColumn prop="popularity" :label="$t('admin.t46')">
          <template #default="scope">
            <ElProgress
              :percentage="scope.row.popularity"
              :color="getColor(scope.row.popularity)"
              :stroke-width="5"
              :show-text="false"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn prop="sales" label="Lượng bán" width="80">
          <template #default="scope">
            <span
              :style="{
                color: getColor(scope.row.popularity),
                backgroundColor: `rgba(${hexToRgb(getColor(scope.row.popularity))}, 0.08)`,
                border: '1px solid',
                padding: '3px 6px',
                borderRadius: '4px',
                fontSize: '12px'
              }"
              >{{ scope.row.sales }}</span
            >
          </template>
        </ElTableColumn>
      </ArtTable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { hexToRgb } from '@/utils/ui'

  interface Product {
    name: string
    popularity: number
    sales: string
  }

  const COLOR_THRESHOLDS = {
    LOW: 25,
    MEDIUM: 50,
    HIGH: 75
  } as const

  const POPULARITY_COLORS = {
    LOW: '#00E096',
    MEDIUM: '#0095FF',
    HIGH: '#884CFF',
    VERY_HIGH: '#FE8F0E'
  } as const

  /**
   * SanPham hotDanh sáchDữ liệu
   * Bao gồmTên sản phẩm、nóngđộvàLượng bánThongTin
   */
  const products = computed<Product[]>(() => [
    { name: 'trínăngtaymáy', popularity: 10, sales: '100' },
    { name: 'bútghiquyểnđiệnnão', popularity: 29, sales: '100' },
    { name: 'bảnđiệnnão', popularity: 65, sales: '100' },
    { name: 'trínăngtaybảng', popularity: 32, sales: '100' },
    { name: 'vôđườngtaimáy', popularity: 78, sales: '100' },
    { name: 'trínăngâmhộp', popularity: 41, sales: '100' }
  ])

  /**
   * liệunóngđộphầnso sánhLấyđốiứngcủaMàu sắc
   * @param percentage nóngđộphầnso sánh (0-100)
   * @returns đốiứngcủaMàu sắcgiá trị
   */
  const getColor = (percentage: number): string => {
    if (percentage < COLOR_THRESHOLDS.LOW) return POPULARITY_COLORS.LOW
    if (percentage < COLOR_THRESHOLDS.MEDIUM) return POPULARITY_COLORS.MEDIUM
    if (percentage < COLOR_THRESHOLDS.HIGH) return POPULARITY_COLORS.HIGH
    return POPULARITY_COLORS.VERY_HIGH
  }
</script>
