<template>
  <div class="customer-progress-page">
    <header class="page-header">
      <div>
        <h2>
          <ArtSvgIcon icon="ri:git-commit-line" />
          Tiến độ khách hàng
        </h2>
        <p>Theo dõi vòng đời giao dịch của khách hàng</p>
      </div>
      <ElButton type="primary" @click="refreshLeads">
        <ArtSvgIcon icon="ri:refresh-line" />
        Tải lại
      </ElButton>
    </header>

    <section class="progress-layout">
      <aside class="lead-panel">
        <ElInput
          v-model="keyword"
          clearable
          placeholder="Tìm tên hoặc số điện thoại"
          class="mb-3"
        />
        <div v-loading="loadingLeads" class="lead-list">
          <ElEmpty
            v-if="!loadingLeads && filteredLeads.length === 0"
            description="Chưa có khách hàng"
          />
          <button
            v-for="lead in filteredLeads"
            :key="lead.id"
            class="lead-row"
            :class="{ active: selectedLeadId === lead.id }"
            @click="selectLead(lead.id)"
            v-auth="Permissions.Marketing.CustomerManagement.View"
          >
            <strong>{{ lead.fullName || "Chưa có tên" }}</strong>
            <span>{{ lead.phoneNumber || "-" }}</span>
            <ElTag size="small" effect="plain">{{ lead.status || "-" }}</ElTag>
          </button>
        </div>
      </aside>

      <main class="progress-panel" v-loading="loadingProfile">
        <ElEmpty
          v-if="!selectedLeadId"
          description="Chọn khách hàng để xem tiến độ"
        />
        <ElEmpty
          v-else-if="!loadingProfile && profile && profile.outputs.length === 0"
          description="Khách hàng chưa có giao dịch"
        />

        <template v-else-if="profile">
          <div class="profile-summary">
            <div>
              <h3>{{ profile.fullName }}</h3>
              <p>
                {{ profile.phoneNumber }} ·
                {{ profile.assignedToName || "Chưa giao Sale" }}
              </p>
            </div>
            <ElButton type="primary" plain @click="openProfile(profile.id)">
              Hồ sơ 360
            </ElButton>
          </div>

          <article
            v-for="output in profile.outputs"
            :key="output.id"
            class="output-card"
          >
            <div class="output-header">
              <div>
                <h4>Giao dịch #{{ output.id }}</h4>
                <p>
                  {{
                    output.statusDisplayName ||
                    getOutputStatusLabel(output.statusId)
                  }}
                  <span v-if="output.lastStatusChangedAt">
                    · cập nhật {{ formatDate(output.lastStatusChangedAt) }}
                  </span>
                </p>
              </div>
              <ElTag :type="getOutputTagType(output.statusId)" effect="plain">
                {{ output.statusId || "unknown" }}
              </ElTag>
            </div>

            <div class="lifecycle-strip">
              <div
                v-for="(step, index) in OUTPUT_STATUS_OPTIONS"
                :key="step.value"
                class="lifecycle-step"
                :class="getStepClass(output.statusId, index)"
              >
                <span></span>
                <small>{{ step.label }}</small>
              </div>
            </div>
          </article>
        </template>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/common/constants/permissions";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import {
  fetchGetLeadList,
  fetchGetProfile360,
  type Lead,
  type Profile360Data,
} from "@/api/customer";
import {
  getOutputStatusIndex,
  getOutputStatusLabel,
  OUTPUT_STATUS_OPTIONS,
} from "@/modules/Marketing/constants/customerCrm";

defineOptions({ name: "CustomerProgress" });

const router = useRouter();
const keyword = ref("");
const leads = ref<Lead[]>([]);
const profile = ref<Profile360Data | null>(null);
const selectedLeadId = ref<number | null>(null);
const loadingLeads = ref(false);
const loadingProfile = ref(false);

const filteredLeads = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return leads.value;
  return leads.value.filter((lead) =>
    [lead.fullName, lead.phoneNumber]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(q)),
  );
});

const refreshLeads = async () => {
  loadingLeads.value = true;
  try {
    const res = await fetchGetLeadList({
      Page: 1,
      PageSize: 100,
      Sorts: "-createdAt",
    });
    leads.value = Array.isArray(res) ? res : (res.items ?? res.records ?? []);
    if (!selectedLeadId.value && leads.value.length > 0) {
      await selectLead(leads.value[0].id);
    }
  } catch (error: any) {
    ElMessage.error(error?.message || "Không thể tải danh sách khách hàng");
  } finally {
    loadingLeads.value = false;
  }
};

const selectLead = async (leadId: number) => {
  selectedLeadId.value = leadId;
  loadingProfile.value = true;
  try {
    profile.value = await fetchGetProfile360(leadId);
  } catch (error: any) {
    profile.value = null;
    ElMessage.error(error?.message || "Không thể tải tiến độ khách hàng");
  } finally {
    loadingProfile.value = false;
  }
};

const getStepClass = (statusId: string | undefined, index: number) => {
  const current = getOutputStatusIndex(statusId);
  if (current < 0) return "pending";
  if (index < current) return "done";
  if (index === current) return "active";
  return "pending";
};

const getOutputTagType = (statusId?: string) => {
  if (statusId === "completed") return "success";
  if (statusId === "cancelled" || statusId === "refunded") return "danger";
  if (statusId === "refunding") return "warning";
  return "primary";
};

const formatDate = (value: string) => dayjs(value).format("DD/MM/YYYY HH:mm");

const openProfile = (leadId: number) => {
  router.push(`/Marketing/customer/profile/${leadId}`);
};

onMounted(refreshLeads);
</script>

<style scoped lang="scss">
.customer-progress-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-header,
.lead-panel,
.progress-panel,
.output-card {
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

.page-header h2,
.profile-summary h3,
.output-header h4 {
  margin: 0;
}

.page-header h2 {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 20px;
  font-weight: 800;
}

.page-header p,
.profile-summary p,
.output-header p {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.progress-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
}

.lead-panel,
.progress-panel {
  padding: 14px;
}

.lead-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 230px);
  overflow: auto;
}

.lead-row {
  display: grid;
  gap: 4px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid transparent;
  border-radius: 8px;
}

.lead-row.active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}

.lead-row span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.profile-summary,
.output-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.output-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  margin-top: 12px;
}

.lifecycle-strip {
  display: grid;
  grid-template-columns: repeat(13, minmax(72px, 1fr));
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.lifecycle-step {
  display: grid;
  gap: 6px;
  min-width: 72px;
  color: var(--el-text-color-secondary);
  font-size: 11px;
}

.lifecycle-step span {
  height: 6px;
  border-radius: 999px;
  background: var(--el-fill-color);
}

.lifecycle-step.done span {
  background: var(--el-color-success);
}

.lifecycle-step.active {
  color: var(--el-color-primary);
  font-weight: 700;
}

.lifecycle-step.active span {
  background: var(--el-color-primary);
}

@media (width <= 900px) {
  .page-header,
  .profile-summary,
  .output-header {
    align-items: stretch;
    flex-direction: column;
  }

  .progress-layout {
    grid-template-columns: 1fr;
  }
}
</style>
