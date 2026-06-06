<template>
  <div class="art-card h-105 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t64') }}</h4>
        <p>{{ $t('admin.t65') }}<span class="text-success">+15%</span></p>
      </div>
    </div>
    <ArtLineChart
      height="calc(100% - 56px)"
      :data="data"
      :xAxisData="xAxisData"
      :showAreaColor="true"
      :showAxisLine="false"
    />
  </div>
</template>

<script setup lang="ts">
  const data = [50, 25, 40, 20, 70, 35, 65, 30, 35, 20, 40, 44]

  const xAxisData = [
    '1tháng',
    '2tháng',
    '3tháng',
    '4tháng',
    '5tháng',
    '6tháng',
    '7tháng',
    '8tháng',
    '9tháng',
    '10tháng',
    '11tháng',
    '12tháng',
  ]
</script>
