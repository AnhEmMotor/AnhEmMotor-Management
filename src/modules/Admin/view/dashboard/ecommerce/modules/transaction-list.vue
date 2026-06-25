<template>
  <ArtDataListCard
    class="mb-5 max-sm:mb-4"
    :maxCount="4"
    :list="dataList"
    :title="$t('dashboard.ecommerce.recentActivity')"
    :subtitle="$t('dashboard.ecommerce.orderStatus')"
    :showMoreButton="true"
    @more="handleMore"
  />
</template>

<script setup lang="ts">
interface TransactionItem {
  title: string;
  status: string;
  time: string;
  class: string;
  icon: string;
}

const dataList: TransactionItem[] = [
  {
    title: "Đơn hàng mới #38291",
    status: "Đang chờ",
    time: "5 phút",
    class: "bg-theme/12 text-theme",
    icon: "ri:shopping-bag-4-line",
  },
  {
    title: "Yêu cầu hoàn tiền #12845",
    status: "Đang xử lý",
    time: "10 phút",
    class: "bg-secondary/12 text-secondary",
    icon: "ri:profile-line",
  },
  {
    title: "Khiếu nại khách hàng",
    status: "Đang chờ",
    time: "15 phút",
    class: "bg-warning/12 text-warning",
    icon: "ri:customer-service-2-line",
  },
  {
    title: "CanhBao hết kho",
    status: "Khẩn cấp",
    time: "20 phút",
    class: "bg-danger/12 text-danger",
    icon: "ri:box-1-line",
  },
  {
    title: "Đơn hàng #29384 đã giao",
    status: "HoanThanh",
    time: "20 phút",
    class: "bg-success/12 text-success",
    icon: "ri:shopping-bag-3-line",
  },
];

const handleMore = (): void => {};
</script>
