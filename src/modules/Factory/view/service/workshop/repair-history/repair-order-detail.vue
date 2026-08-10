<template>
  <WorkshopRepairHistoryDetail :order-id="orderId" back-path="/factory/workshop/repair-history" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import WorkshopRepairHistoryDetail from '@/components/business/workshop-repair-history-detail.vue';

defineOptions({ name: 'FactoryWorkshopRepairHistoryDetail' });

const route = useRoute();
const orderId = Number(route.params.id);
</script>
