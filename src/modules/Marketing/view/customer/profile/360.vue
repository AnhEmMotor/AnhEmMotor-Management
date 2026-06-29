<template>
  <div class="customer-360-hub flex flex-col gap-5 pb-10">
    <!-- Loading / Error states -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <ElSkeleton :rows="5" animated />
    </div>
    <ElEmpty v-else-if="error" :description="error" />
    <template v-else-if="profile">
      <!-- Header -->
      <div
        class="hub-header bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
      >
        <div class="flex items-center gap-3 mb-4">
          <ElButton circle plain @click="goBack">
            <ArtSvgIcon icon="ri:arrow-left-line" class="text-lg" />
          </ElButton>
          <h2 class="m-0 text-xl font-black text-gray-800 tracking-tight">
            {{ profile.fullName }}
          </h2>
          <ElTag :type="getStatusType(profile.status)" effect="dark" round>
            {{ getStatusLabel(profile.status) }}
          </ElTag>
          <ElTag v-if="profile.isVerified" type="success" effect="dark" round>
            Đã xác minh
          </ElTag>
        </div>

        <!-- KPI summary row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="kpi-card bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 mb-1">
              Đơn hàng đang hoạt động
            </div>
            <div class="text-lg font-black text-gray-900">
              {{ profile.summary.activeOutputsCount }}
            </div>
          </div>
          <div class="kpi-card bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 mb-1">Xe đã sở hữu</div>
            <div class="text-lg font-black text-gray-900">
              {{ profile.summary.ownedVehiclesCount }}
            </div>
          </div>
          <div class="kpi-card bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 mb-1">Nhắc nhở quá hạn</div>
            <div
              class="text-lg font-black"
              :class="
                profile.summary.overdueRemindersCount > 0
                  ? 'text-red-500'
                  : 'text-gray-900'
              "
            >
              {{ profile.summary.overdueRemindersCount }}
            </div>
          </div>
          <div class="kpi-card bg-gray-50 rounded-xl p-3 text-center">
            <div class="text-xs text-gray-500 mb-1">Điểm tích lũy</div>
            <div class="text-lg font-black text-amber-600">
              {{ profile.points }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <ElTabs v-model="activeTab" type="border-card" class="hub-tabs">
        <!-- Overview Tab -->
        <ElTabPane label="Tổng quan" name="overview">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 p-1">
            <!-- Identity card -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3
                class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"
              >
                <ArtSvgIcon icon="ri:user-line" class="text-blue-500" />
                Thông tin cá nhân
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Họ tên</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.fullName
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Số điện thoại</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.phoneNumber
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Email</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.email || "—"
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Nguồn</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.source
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Giới tính</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.gender || "—"
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Ngày sinh</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.birthday
                      ? dayjs(profile.birthday).format("DD/MM/YYYY")
                      : "—"
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">CCCD</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.identificationNumber || "—"
                  }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-gray-400">Xếp hạng</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.tier
                  }}</span>
                </div>
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <span class="text-xs text-gray-400">Địa chỉ</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    fullAddress
                  }}</span>
                </div>
                <div class="flex flex-col gap-1 sm:col-span-2">
                  <span class="text-xs text-gray-400">Xe quan tâm</span>
                  <span class="text-sm font-semibold text-gray-800">{{
                    profile.interestedVehicle || "—"
                  }}</span>
                </div>
              </div>
              <div class="mt-4 flex gap-2">
                <ElButton type="primary" size="small" round @click="handleEdit">
                  <ArtSvgIcon icon="ri:edit-line" class="mr-1" /> Chỉnh sửa
                </ElButton>
                <ElButton size="small" round @click="handleAssign">
                  <ArtSvgIcon icon="ri:user-star-line" class="mr-1" /> Giao cho
                </ElButton>
              </div>
            </div>

            <!-- Active transactions -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3
                class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"
              >
                <ArtSvgIcon
                  icon="ri:shopping-cart-line"
                  class="text-green-500"
                />
                Đơn hàng đang hoạt động
              </h3>
              <div
                v-if="profile.outputs.length === 0"
                class="text-center text-gray-400 py-8"
              >
                Chưa có đơn hàng
              </div>
              <div
                v-for="output in profile.outputs"
                :key="output.id"
                class="output-item flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <div class="font-semibold text-gray-800">
                    Đơn #{{ output.id }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ output.statusDisplayName }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">
                    {{ formatMoney(output.total) }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ output.paymentMethod || "—" }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Vehicles -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3
                class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"
              >
                <ArtSvgIcon icon="ri:car-line" class="text-purple-500" />
                Xe đã sở hữu
              </h3>
              <div
                v-if="profile.vehicles.length === 0"
                class="text-center text-gray-400 py-8"
              >
                Chưa có xe
              </div>
              <div
                v-for="v in profile.vehicles"
                :key="v.id"
                class="output-item flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <div class="font-semibold text-gray-800">
                    {{ v.licensePlate || "Chưa biển số" }}
                  </div>
                  <div class="text-xs text-gray-500">
                    VIN: {{ v.vinNumber }}
                  </div>
                </div>
                <ElTag
                  :type="v.status === 'Sold' ? 'success' : 'info'"
                  size="small"
                  round
                >
                  {{ v.status }}
                </ElTag>
              </div>
            </div>

            <!-- Care reminders -->
            <div class="bg-white rounded-xl border border-gray-100 p-5">
              <h3
                class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"
              >
                <ArtSvgIcon icon="ri:alarm-line" class="text-amber-500" />
                Nhắc nhở chăm sóc
              </h3>
              <div
                v-if="profile.careReminders.length === 0"
                class="text-center text-gray-400 py-8"
              >
                Không có nhắc nhở
              </div>
              <div
                v-for="r in profile.careReminders"
                :key="r.title + r.type"
                class="reminder-item flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div class="mt-0.5" :class="reminderIconClass(r.priority)">
                  <ArtSvgIcon :icon="reminderIcon(r.type)" class="text-base" />
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-800 text-sm">
                    {{ r.title }}
                  </div>
                  <div class="text-xs text-gray-500">{{ r.description }}</div>
                </div>
                <ElTag
                  :type="reminderTagType(r.priority)"
                  size="small"
                  effect="plain"
                  round
                >
                  {{ r.priority }}
                </ElTag>
              </div>
            </div>
          </div>
        </ElTabPane>

        <!-- Timeline Tab -->
        <ElTabPane label="Dòng thời gian" name="timeline">
          <div class="p-1">
            <div
              v-if="profile.timelineEvents.length === 0"
              class="text-center text-gray-400 py-12"
            >
              Chưa có sự kiện
            </div>
            <div class="timeline-list">
              <div
                v-for="(evt, idx) in profile.timelineEvents"
                :key="idx"
                class="timeline-item flex gap-4 py-3"
              >
                <div class="flex flex-col items-center">
                  <div
                    class="timeline-dot"
                    :class="timelineDotClass(evt.type)"
                  ></div>
                  <div
                    v-if="idx < profile.timelineEvents.length - 1"
                    class="timeline-line flex-1 w-px bg-gray-200 mt-1"
                  ></div>
                </div>
                <div class="flex-1 pb-4">
                  <div class="text-sm font-semibold text-gray-800">
                    {{ evt.title }}
                  </div>
                  <div
                    v-if="evt.description"
                    class="text-xs text-gray-500 mt-0.5"
                  >
                    {{ evt.description }}
                  </div>
                  <div class="text-xs text-gray-400 mt-1">
                    {{ formatDate(evt.date) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>

        <!-- Assets Tab -->
        <ElTabPane label="Tài sản" name="assets">
          <div class="p-1">
            <div
              v-if="profile.vehicles.length === 0"
              class="text-center text-gray-400 py-12"
            >
              Chưa có tài sản xe máy
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="v in profile.vehicles"
                :key="v.id"
                class="asset-card bg-white rounded-xl border border-gray-100 p-4"
              >
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-10 h-10 rounded-lg bg-purple-50 flex flex-cc">
                    <ArtSvgIcon
                      icon="ri:motorbike-line"
                      class="text-purple-500 text-lg"
                    />
                  </div>
                  <div>
                    <div class="font-bold text-gray-900">
                      {{ v.licensePlate || "Chưa biển số" }}
                    </div>
                    <div class="text-xs text-gray-500">{{ v.vinNumber }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-gray-400">Số máy:</span>
                    {{ v.engineNumber }}
                  </div>
                  <div>
                    <span class="text-gray-400">Trạng thái:</span>
                    {{ v.status }}
                  </div>
                  <div>
                    <span class="text-gray-400">Ngày mua:</span>
                    {{ dayjs(v.purchaseDate).format("DD/MM/YYYY") }}
                  </div>
                  <div>
                    <span class="text-gray-400">ODO:</span>
                    {{ v.currentOdo.toLocaleString() }} km
                  </div>
                  <div v-if="v.nextMaintenanceDate">
                    <span class="text-gray-400">BV tiếp:</span>
                    {{ dayjs(v.nextMaintenanceDate).format("DD/MM/YYYY") }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>

        <!-- Care Tab -->
        <ElTabPane label="Chăm sóc" name="care">
          <div class="p-1">
            <div
              v-if="profile.careReminders.length === 0"
              class="text-center text-gray-400 py-12"
            >
              Không có nhắc nhở chăm sóc
            </div>
            <div class="flex flex-col gap-3">
              <div
                v-for="r in profile.careReminders"
                :key="r.title + r.type"
                class="care-card bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4"
              >
                <div class="mt-0.5" :class="reminderIconClass(r.priority)">
                  <ArtSvgIcon :icon="reminderIcon(r.type)" class="text-lg" />
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-gray-800">{{ r.title }}</div>
                  <div class="text-sm text-gray-500 mt-1">
                    {{ r.description }}
                  </div>
                  <div v-if="r.dueDate" class="text-xs text-gray-400 mt-1">
                    Hạn: {{ dayjs(r.dueDate).format("DD/MM/YYYY") }}
                  </div>
                </div>
                <ElTag
                  :type="reminderTagType(r.priority)"
                  size="small"
                  effect="plain"
                  round
                >
                  {{ r.priority }}
                </ElTag>
              </div>
            </div>
          </div>
        </ElTabPane>

        <!-- Progress Tab -->
        <ElTabPane label="Tiến độ" name="progress">
          <div class="p-1">
            <div
              v-if="profile.outputs.length === 0"
              class="text-center text-gray-400 py-12"
            >
              Chưa có đơn hàng
            </div>
            <div class="flex flex-col gap-4">
              <div
                v-for="output in profile.outputs"
                :key="output.id"
                class="progress-card bg-white rounded-xl border border-gray-100 p-5"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="font-bold text-gray-900">
                    Đơn hàng #{{ output.id }}
                  </div>
                  <ElTag
                    :type="getOutputStatusType(output.statusId)"
                    effect="dark"
                    round
                  >
                    {{ output.statusDisplayName }}
                  </ElTag>
                </div>
                <ElSteps
                  :active="getOutputStep(output.statusId)"
                  finish-status="success"
                  simple
                  class="progress-steps"
                >
                  <ElStep
                    v-for="step in outputSteps"
                    :key="step.key"
                    :title="step.label"
                  />
                </ElSteps>
                <div class="mt-3 text-xs text-gray-400">
                  Tạo: {{ formatDate(output.createdAt) }}
                  <span v-if="output.lastStatusChangedAt">
                    · Cập nhật: {{ formatDate(output.lastStatusChangedAt) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  fetchGetProfile360,
  type Profile360Data,
  type CareReminder,
} from "@/api/customer/lead.api";
import { ElMessage } from "element-plus";

dayjs.locale("vi");

defineOptions({ name: "CustomerProfile360Hub" });

const route = useRoute();
const router = useRouter();
const leadId = computed(() => Number(route.params.leadId));

const profile = ref<Profile360Data | null>(null);
const loading = ref(false);
const error = ref("");
const activeTab = ref("overview");

const fullAddress = computed(() => {
  if (!profile.value) return "";
  const parts = [
    profile.value.ward,
    profile.value.district,
    profile.value.province,
  ].filter(Boolean);
  return parts.join(", ") || "—";
});

const outputSteps = [
  { key: "pending", label: "Chờ xác nhận" },
  { key: "waiting_deposit", label: "Chờ đặt cọc" },
  { key: "deposit_paid", label: "Đã cọc" },
  { key: "waiting_installment", label: "Chờ duyệt trả góp" },
  { key: "installment_approved", label: "Đã duyệt trả góp" },
  { key: "confirmed_cod", label: "Xác nhận COD" },
  { key: "paid_processing", label: "Đang xử lý" },
  { key: "delivering", label: "Đang giao" },
  { key: "waiting_pickup", label: "Chờ lấy" },
  { key: "completed", label: "Hoàn thành" },
];

const loadProfile = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetchGetProfile360(leadId.value);
    profile.value = res as Profile360Data;
  } catch (e: any) {
    error.value = e?.message || "Không thể tải dữ liệu hồ sơ khách hàng.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (leadId.value) loadProfile();
});

const goBack = () => router.push("/Marketing/customer/profile");

const formatMoney = (val?: number) => {
  if (val == null) return "—";
  return new Intl.NumberFormat("vi-VN").format(val) + "đ";
};

const formatDate = (val: string) => {
  return dayjs(val).format("DD/MM/YYYY HH:mm");
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    New: "Mới đăng ký",
    TestDrive: "Đã lái thử",
    Negotiating: "Thương lượng",
    Consulting: "Đang tư vấn",
    Won: "Đã chốt đơn",
    Official: "Khách chính thức",
    Potential: "Tiềm năng",
    Contacted: "Đã liên hệ",
  };
  return map[status] || status;
};

const getStatusType = (status: string) => {
  if (status === "Won" || status === "Official") return "success";
  if (status === "TestDrive" || status === "Negotiating") return "warning";
  return "info";
};

const getOutputStatusType = (statusId?: string) => {
  if (!statusId) return "info";
  if (["completed"].includes(statusId)) return "success";
  if (["cancelled", "refunded"].includes(statusId)) return "danger";
  if (["refunding"].includes(statusId)) return "warning";
  return "primary";
};

const getOutputStep = (statusId?: string) => {
  if (!statusId) return 0;
  const idx = outputSteps.findIndex((s) => s.key === statusId);
  return idx >= 0 ? idx : 0;
};

const reminderIcon = (type: string) => {
  const map: Record<string, string> = {
    birthday: "ri:cake-line",
    maintenance: "ri:tools-line",
    stalled_order: "ri:alert-line",
  };
  return map[type] || "ri:information-line";
};

const reminderIconClass = (priority: string) => {
  const map: Record<string, string> = {
    urgent: "text-red-500",
    high: "text-amber-500",
    normal: "text-blue-500",
    low: "text-gray-400",
  };
  return map[priority] || "text-gray-400";
};

const reminderTagType = (priority: string) => {
  const map: Record<string, string> = {
    urgent: "danger",
    high: "warning",
    normal: "primary",
    low: "info",
  };
  return (map[priority] as any) || "info";
};

const timelineDotClass = (type: string) => {
  const map: Record<string, string> = {
    output_created: "bg-blue-400",
    output_status: "bg-green-400",
    plate_dossier: "bg-purple-400",
    service: "bg-amber-400",
    activity: "bg-gray-300",
  };
  return map[type] || "bg-gray-300";
};

const handleEdit = () => {
  if (profile.value) router.push(`/Marketing/customer/profile`);
};

const handleAssign = async () => {
  // Placeholder: will be wired to user picker
  ElMessage.info("Chức năng giao việc sẽ được bổ sung");
};
</script>

<style lang="scss" scoped>
.hub-tabs {
  :deep(.el-tabs__content) {
    padding: 0;
  }
}

.kpi-card {
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-1px);
  }
}

.output-item {
  transition: background 0.15s;
  border-radius: 8px;
  padding: 8px 12px;

  &:hover {
    background: #f9fafb;
  }
}

.reminder-item {
  border-radius: 10px;
  padding: 10px 12px;
  transition: background 0.15s;

  &:hover {
    background: #f9fafb;
  }
}

.care-card {
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
  }
}

.asset-card {
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
  }
}

.progress-card {
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
  }
}

.progress-steps {
  :deep(.el-step__title) {
    font-size: 12px;
    font-weight: 500;
  }
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-line {
  min-height: 40px;
}

.timeline-item {
  position: relative;
}
</style>
