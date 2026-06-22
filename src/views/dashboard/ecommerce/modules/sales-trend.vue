<template>
  <div class="art-card p-5 mb-5 h-105 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t("dashboard.ecommerce.salesTrend") }}</h4>
        <p>{{ $t("dashboard.ecommerce.monthlyComparison") }}</p>
      </div>
    </div>

    <ArtDualBarCompareChart
      :positiveData="[50, 80, 120, 90, 60]"
      :negativeData="[30, 60, 90, 70, 40]"
      :xAxisData="['mộttháng', 'haitháng', 'batháng', 'bốntháng', 'nămtháng']"
      height="19rem"
    />
  </div>
</template>
