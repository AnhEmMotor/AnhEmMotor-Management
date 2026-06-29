<template>
  <div class="customer-potential-page">
    <header class="page-header">
      <div>
        <h2>
          <ArtSvgIcon icon="ri:user-star-line" />
          Khách hàng tiềm năng
        </h2>
        <p>Quản lý lead, giao Sale và mở hồ sơ 360</p>
      </div>
      <ElButton type="primary" @click="refreshData">
        <ArtSvgIcon icon="ri:refresh-line" />
        Tải lại
      </ElButton>
    </header>

    <section class="kpi-grid">
      <ArtStatsCard
        title="Tổng lead"
        :count="pagination.total"
        description="Số lead đang quản lý"
        icon="ri:team-line"
        iconStyle="bg-gradient-to-br from-blue-500 to-blue-600"
      />
      <ArtStatsCard
        title="Lead nóng"
        :count="hotLeadCount"
        description="Cần ưu tiên chăm sóc"
        icon="ri:fire-line"
        iconStyle="bg-gradient-to-br from-red-500 to-red-600"
      />
      <ArtStatsCard
        title="Đã giao Sale"
        :count="assignedCount"
        description="Lead có người phụ trách"
        icon="ri:user-follow-line"
        iconStyle="bg-gradient-to-br from-emerald-500 to-emerald-600"
      />
      <ArtStatsCard
        title="Mới hôm nay"
        :count="todayCount"
        description="Lead phát sinh trong ngày"
        icon="ri:user-add-line"
        iconStyle="bg-gradient-to-br from-amber-500 to-orange-500"
      />
    </section>

    <section class="filter-bar">
      <ArtSearchBar
        v-model="searchModel"
        :items="searchItems"
        :label-width="110"
        :span="8"
        :show-expand="true"
        @search="handleSearch"
        @reset="handleReset"
      />
    </section>

    <section class="lead-list" v-loading="loading">
      <ElEmpty
        v-if="!loading && data.length === 0"
        description="Chưa có lead phù hợp"
      />

      <article v-for="lead in data" :key="lead.id" class="lead-card">
        <div
          class="lead-score"
          :style="{ backgroundColor: getPriority(lead).color }"
        >
          <ArtSvgIcon :icon="getPriority(lead).icon" />
          <span>{{ getPriority(lead).label }}</span>
        </div>

        <div class="lead-main">
          <div class="lead-title-row">
            <h3>{{ lead.fullName || "Chưa có tên" }}</h3>
            <ElTag :type="getLeadStatusType(lead.status)" effect="plain">
              {{ getLeadStatusLabel(lead.status) }}
            </ElTag>
          </div>
          <div class="lead-meta">
            <span>{{ lead.phoneNumber || "-" }}</span>
            <span>{{ lead.source || "-" }}</span>
            <span>{{ lead.interestedVehicle || "Chưa chọn xe" }}</span>
          </div>
          <p class="lead-note">{{ getLastActivity(lead) }}</p>
        </div>

        <div class="lead-actions">
          <ElSelect
            :model-value="lead.assignedToId || null"
            placeholder="Giao Sale"
            clearable
            filterable
            @change="
              (saleId: string | null) => handleAssignSingle(lead.id, saleId)
            "
          >
            <ElOption
              v-for="sale in salesList"
              :key="sale.id"
              :label="sale.name"
              :value="sale.id"
            />
          </ElSelect>
          <ElButton type="primary" plain @click="openProfile(lead.id)">
            <ArtSvgIcon icon="ri:eye-line" />
            Hồ sơ 360
          </ElButton>
        </div>
      </article>
    </section>

    <footer class="pagination-row">
      <ElPagination
        background
        layout="sizes, prev, pager, next, total"
        :current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { useLeadTable } from "@/modules/Marketing/logic/useLeadTable";
import {
  getLeadStatusLabel,
  getLeadStatusType,
  LEAD_STATUS_OPTIONS,
} from "@/modules/Marketing/constants/customerCrm";
import type { Lead } from "@/api/customer";

defineOptions({ name: "CustomerPotential" });

const router = useRouter();
const searchModel = ref({});

const {
  data,
  loading,
  pagination,
  salesList,
  getPriority,
  handleAssignSingle,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  refreshData,
} = useLeadTable();

const searchItems = [
  {
    key: "fullName",
    label: "Tìm kiếm",
    type: "input",
    props: { placeholder: "Tên hoặc số điện thoại", clearable: true },
  },
  {
    key: "source",
    label: "Nguồn",
    type: "select",
    props: {
      placeholder: "Tất cả nguồn",
      clearable: true,
      options: [
        { label: "Facebook", value: "Facebook" },
        { label: "Website", value: "Website" },
        { label: "Showroom", value: "Showroom" },
      ],
    },
  },
  {
    key: "status",
    label: "Trạng thái",
    type: "select",
    props: {
      placeholder: "Tất cả trạng thái",
      clearable: true,
      options: LEAD_STATUS_OPTIONS.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    },
  },
];

const hotLeadCount = computed(
  () => data.value.filter((lead) => getPriority(lead).level === 3).length,
);
const assignedCount = computed(
  () => data.value.filter((lead) => Boolean(lead.assignedToId)).length,
);
const todayCount = computed(
  () =>
    data.value.filter((lead) => dayjs(lead.createdAt).isSame(dayjs(), "day"))
      .length,
);

const getLastActivity = (lead: Lead) => {
  const activity = [...(lead.activities ?? [])].sort(
    (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf(),
  )[0];
  return activity?.description ?? "Chưa có ghi chú chăm sóc";
};

const openProfile = (leadId: number) => {
  router.push(`/Marketing/customer/profile/${leadId}`);
};
</script>

<style lang="scss" scoped>
.customer-potential-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
}

.page-header,
.filter-bar,
.lead-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.page-header h2 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.page-header p {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 12px;
}

.filter-bar {
  padding: 8px;
}

.lead-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lead-card {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) minmax(240px, 320px);
  gap: 14px;
  align-items: center;
  padding: 14px;
}

.lead-score {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  color: #fff;
  border-radius: 8px;
}

.lead-score span {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.lead-title-row,
.lead-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.lead-title-row h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font-size: 16px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lead-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.lead-note {
  margin: 8px 0 0;
  color: var(--el-text-color-regular);
  font-size: 12px;
}

.lead-actions {
  justify-content: flex-end;
}

.lead-actions .el-select {
  min-width: 160px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
}

@media (width >= 640px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (width <= 768px) {
  .page-header,
  .lead-card,
  .lead-actions {
    align-items: stretch;
  }

  .page-header,
  .lead-actions {
    flex-direction: column;
  }

  .lead-card {
    grid-template-columns: 1fr;
  }
}
</style>
