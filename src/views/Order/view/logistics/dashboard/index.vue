<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- 0) Range tabs -->
    <div class="flex items-center gap-3 flex-wrap">
      <ElButton
        v-for="t in ranges"
        :key="t.value"
        :type="t.value === range ? 'primary' : 'default'"
        size="small"
        @click="handleChangeRange(t.value)"
      >
        {{ t.label }}
      </ElButton>
    </div>

    <!-- 1) Summary cards (4) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        :title="$t('logistics.dashboard.fulfillmentWorkload')"
        :count="dashboard.summary.fulfillmentWorkload"
        icon="ri:truck-line"
        iconStyle="bg-primary"
        :class="dashboard.summary.fulfillmentWorkloadIsOverload ? 'bg-warning/10' : ''"
      />
      <ArtStatsCard
        :title="$t('logistics.dashboard.pendingCod')"
        :count="formatMoney(dashboard.summary.pendingUnreconciledCod)"
        icon="ri:bank-card-line"
        iconStyle="bg-info"
      />
      <ArtStatsCard
        :title="$t('logistics.dashboard.otifRate')"
        :count="`${(dashboard.summary.otifRate * 100).toFixed(1)}%`"
        icon="ri:time-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        :title="$t('logistics.dashboard.returnsClaimsRatio')"
        :count="`${(dashboard.summary.returnsClaimsRate * 100).toFixed(1)}%`"
        icon="ri:arrow-go-back-line"
        iconStyle="bg-danger"
      />
    </div>

    <!-- 2) Charts (2) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ElCard class="art-table-card">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{ $t('logistics.dashboard.fulfillmentFunnel') }}</span>
          </div>
        </template>

        <!-- Use lightweight fallback divs (chart lib integration TBD) -->
        <div class="h-72 flex items-center justify-center text-sm text-gray-500">
          {{ $t('logistics.dashboard.funnelPlaceholder') }}
        </div>
      </ElCard>

      <ElCard class="art-table-card">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{
              $t('logistics.dashboard.productionShippingCost')
            }}</span>
          </div>
        </template>

        <div class="h-72 flex items-center justify-center text-sm text-gray-500">
          {{ $t('logistics.dashboard.costPlaceholder') }}
        </div>
      </ElCard>
    </div>

    <!-- 3) Carrier scorecard -->
    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">{{ $t('logistics.dashboard.carrierScorecard') }}</span>
          <ElButton :loading="loading" @click="loadData" type="primary" size="small">
            {{ $t('logistics.dashboard.refresh') }}
          </ElButton>
        </div>
      </template>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :data="dashboard.carrierScorecard"
        :columns="columns"
        :pagination="{
          current: 1,
          size: dashboard.carrierScorecard.length,
          total: dashboard.carrierScorecard.length,
        }"
      >
        <template #returnsRatio="{ row }"> {{ (row.returnsRatio * 100).toFixed(1) }}% </template>
      </ArtTable>
    </ElCard>

    <!-- 4) Exceptions log -->
    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-red-500">{{
            $t('logistics.dashboard.exceptionsLog')
          }}</span>
          <span class="text-xs text-red-400"
            >{{ dashboard.exceptions.length }} {{ $t('logistics.dashboard.items') }}</span
          >
        </div>
      </template>

      <ElAlert v-if="dashboard.exceptions.length === 0" type="success" show-icon :closable="false">
        {{ $t('logistics.dashboard.noExceptions') }}
      </ElAlert>

      <ArtTable
        v-else
        ref="exTableRef"
        :loading="loading"
        :data="dashboard.exceptions"
        :columns="exceptionColumns"
        :pagination="{
          current: 1,
          size: dashboard.exceptions.length,
          total: dashboard.exceptions.length,
        }"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { ElCard, ElButton, ElAlert } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import type { LogisticsDashboardResponse } from '@/domain/logistics/dashboard.types'
  import { LogisticsService } from '@/services/logistics.service'
  import type { ArtTableColumn } from '@/types/table'

  defineOptions({ name: 'LogisticsDashboard' })

  const { t } = useI18n()

  const ranges = computed(() => [
    { value: 'today', label: t('logistics.dashboard.today') },
    { value: 'month', label: t('logistics.dashboard.thisMonth') },
    { value: 'year', label: t('logistics.dashboard.thisYear') },
  ])

  type RangeValue = 'today' | 'month' | 'year'
  const range = ref<RangeValue>('today')

  const loading = ref(false)

  const dashboard = ref<LogisticsDashboardResponse>({
    summary: {
      fulfillmentWorkload: 0,
      pendingUnreconciledCod: 0,
      otifRate: 0,
      returnsClaimsRate: 0,
      fulfillmentWorkloadIsOverload: false,
    },
    fulfillmentFunnel: {},
    trends: [],
    carrierScorecard: [],
    exceptions: [],
  })

  const columns = computed<ArtTableColumn[]>(() => [
    { label: t('logistics.dashboard.carrier'), prop: 'carrier', minWidth: 160 },
    { label: t('logistics.dashboard.deliveredCount'), prop: 'deliveredCount', minWidth: 160 },
    { label: t('logistics.dashboard.avgDeliveryDays'), prop: 'avgDeliveryDays', minWidth: 190 },
    {
      label: t('logistics.dashboard.avgShippingCostPerOrder'),
      prop: 'avgShippingCostPerOrder',
      minWidth: 190,
    },
    {
      label: t('logistics.dashboard.returnsRatio'),
      prop: 'returnsRatio',
      useSlot: true,
      minWidth: 150,
    },
  ])

  const exceptionColumns = computed<ArtTableColumn[]>(() => [
    { label: t('logistics.dashboard.type'), prop: 'type', minWidth: 160 },
    { label: t('logistics.dashboard.tracking'), prop: 'trackingNumber', minWidth: 180 },
    { label: t('logistics.dashboard.message'), prop: 'message', minWidth: 260 },
    { label: t('logistics.dashboard.createdAt'), prop: 'createdAt', minWidth: 180 },
  ])

  const handleChangeRange = (value: string) => {
    range.value = value as RangeValue
    void loadData()
  }

  const loadData = async () => {
    loading.value = true
    try {
      dashboard.value = await LogisticsService.getDashboard(range.value)
    } finally {
      loading.value = false
    }
  }

  const formatMoney = (value: number) => {
    try {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
    } catch {
      return value.toString()
    }
  }

  onMounted(() => loadData())
</script>
