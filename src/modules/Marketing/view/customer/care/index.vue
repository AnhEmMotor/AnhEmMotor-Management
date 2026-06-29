<template>
  <div class="customer-care-page flex flex-col gap-5 pb-10">
    <div class="page-header flex items-center justify-between">
      <div>
        <h2
          class="m-0 text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2"
        >
          <ArtSvgIcon icon="ri:gift-line" class="text-amber-500" />
          Chăm sóc Khách hàng
        </h2>
        <p
          class="m-0 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"
        >
          Quản lý vòng đời & Trải nghiệm khách hàng
        </p>
      </div>
    </div>

    <div
      class="search-bar-wrapper bg-white rounded-xl shadow-sm border border-gray-100 p-2"
    >
      <ArtSearchBar
        v-model="searchModel"
        :items="searchItems"
        :label-width="120"
        :span="8"
        :show-expand="true"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <div class="content-section" v-loading="loading">
      <div v-if="customers.length > 0" class="flex flex-col gap-4">
        <div
          v-for="customer in customers"
          :key="customer.id"
          class="customer-row-card group bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 flex items-center hover:border-amber-200 cursor-pointer overflow-hidden"
          :class="{ 'is-expanded': expandedId === customer.id }"
          @click="handleToggleExpand(customer.id)"
        >
          <div class="flex flex-1 items-center p-5 gap-6">
            <div
              class="priority-column shrink-0 w-24 flex flex-col items-center gap-1.5"
            >
              <div
                class="priority-label flex flex-col items-center justify-center p-2 rounded-xl text-white w-20 h-14"
                :style="{ backgroundColor: getPriority(customer).color }"
              >
                <ArtSvgIcon
                  :icon="getPriority(customer).icon"
                  class="text-xl"
                />
                <span class="text-[9px] font-black tracking-tighter uppercase">
                  {{ getPriority(customer).label }}
                </span>
              </div>
            </div>

            <div
              class="identity-column shrink-0 w-64 border-l border-gray-50 pl-4"
            >
              <div class="flex flex-col gap-1">
                <h4
                  class="m-0 text-gray-900 font-extrabold text-base group-hover:text-amber-600 transition-colors"
                >
                  {{ customer.fullName }}
                </h4>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-500 font-bold">
                    {{ customer.phoneNumber }}
                  </span>
                </div>
              </div>
            </div>

            <div class="flex-1 px-4 border-l border-gray-50">
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] font-bold text-gray-300 uppercase tracking-widest"
                >
                  Nhắc nhở gần nhất
                </span>
                <p class="m-0 text-xs text-gray-600 italic line-clamp-1">
                  "{{ getTopReminder(customer) }}"
                </p>
              </div>
            </div>

            <div class="w-48 px-4 border-l border-gray-50">
              <div class="flex flex-col gap-1">
                <span
                  class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter"
                >
                  Điểm / Hạng
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-black text-amber-500">
                    {{ customer.points }} pts
                  </span>
                  <ElTag size="small" effect="plain" round class="text-[9px]">
                    {{ customer.tier }}
                  </ElTag>
                </div>
              </div>
            </div>

            <div
              class="flex items-center gap-2 border-l border-gray-50 pl-6 pr-2"
            >
              <div class="flex gap-1" @click.stop>
                <ElTooltip content="Hồ sơ 360">
                  <div
                    class="size-8 bg-amber-50 text-amber-500 rounded-lg flex-cc hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                    @click="handleView360(customer)"
                  >
                    <ArtSvgIcon icon="ri:eye-line" class="text-sm" />
                  </div>
                </ElTooltip>
                <ElTooltip content="Xử lý nhắc nhở">
                  <div
                    class="size-8 bg-gray-50 text-gray-400 rounded-lg flex-cc hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                    @click="handleCareAction(customer)"
                  >
                    <ArtSvgIcon icon="ri:heart-line" class="text-sm" />
                  </div>
                </ElTooltip>
              </div>
              <ArtSvgIcon
                :icon="
                  expandedId === customer.id
                    ? 'ri:arrow-up-s-line'
                    : 'ri:arrow-down-s-line'
                "
                class="text-xl text-gray-300"
              />
            </div>
          </div>

          <div v-if="expandedId === customer.id" class="expansion-container">
            <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <h3
                  class="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2"
                >
                  <ArtSvgIcon icon="ri:bell-line" class="text-amber-500" />
                  Nhắc nhở chăm sóc
                </h3>
                <div
                  v-if="getCareReminders(customer).length === 0"
                  class="text-center text-gray-400 py-8"
                >
                  <ArtSvgIcon
                    icon="ri:checkbox-circle-line"
                    class="text-3xl mb-2 text-emerald-400"
                  />
                  <p class="text-sm font-bold">Không có nhắc nhở quá hạn</p>
                </div>
                <div class="flex flex-col gap-3">
                  <div
                    v-for="reminder in getCareReminders(customer)"
                    :key="reminder.type + reminder.title"
                    class="reminder-item flex items-start gap-3 p-3 rounded-xl border border-gray-50"
                  >
                    <div
                      class="mt-0.5"
                      :class="reminderPriorityClass(reminder.priority)"
                    >
                      <ArtSvgIcon
                        :icon="reminderIcon(reminder.type)"
                        class="text-base"
                      />
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-gray-800 text-sm">
                        {{ reminder.title }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ reminder.description }}
                      </div>
                      <div
                        v-if="reminder.dueDate"
                        class="text-xs text-gray-400 mt-1"
                      >
                        Hạn: {{ formatDate(reminder.dueDate) }}
                      </div>
                    </div>
                    <ElButton
                      size="small"
                      type="primary"
                      round
                      class="shrink-0"
                      @click.stop="handleReminderAction(customer, reminder)"
                    >
                      Xử lý
                    </ElButton>
                  </div>
                </div>
              </div>

              <div
                class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <h3
                  class="text-sm font-black text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2"
                >
                  <ArtSvgIcon icon="ri:history-line" class="text-blue-500" />
                  Lịch sử tương tác
                </h3>
                <div
                  v-if="
                    !customer.activities || customer.activities.length === 0
                  "
                  class="text-center text-gray-400 py-8"
                >
                  <ArtSvgIcon icon="ri:inbox-line" class="text-3xl mb-2" />
                  <p class="text-sm font-bold">Chưa có tương tác</p>
                </div>
                <div class="flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                  <div
                    v-for="act in getSortedActivities(customer)"
                    :key="act.id"
                    class="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50"
                  >
                    <div
                      class="size-8 rounded-lg flex-cc shrink-0"
                      :class="activityIconClass(act.activityType)"
                    >
                      <ArtSvgIcon
                        :icon="activityIcon(act.activityType)"
                        class="text-sm"
                      />
                    </div>
                    <div class="flex-1">
                      <div class="text-xs font-bold text-gray-500 uppercase">
                        {{ act.activityType }}
                      </div>
                      <div class="text-sm text-gray-800 mt-0.5">
                        {{ act.description }}
                      </div>
                      <div class="text-[10px] text-gray-400 mt-1">
                        {{ formatDate(act.createdAt) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="!loading"
        class="empty-state p-20 flex flex-col items-center bg-white rounded-3xl border border-dashed border-gray-200 mx-4"
      >
        <ArtSvgIcon icon="ri:gift-line" class="text-6xl text-gray-200 mb-4" />
        <p class="text-gray-400 font-bold">Chưa có khách hàng nào</p>
        <p class="text-xs mt-1">Dữ liệu sẽ được tải từ hệ thống</p>
      </div>
    </div>

    <ElDialog
      v-model="actionDialogVisible"
      title="Xử lý nhắc nhở"
      width="500px"
      destroy-on-close
    >
      <div class="flex flex-col gap-4">
        <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p class="text-sm font-bold text-gray-800">
            {{ activeReminder?.title }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            {{ activeReminder?.description }}
          </p>
        </div>
        <ElSelect
          v-model="selectedAction"
          placeholder="Chọn hành động"
          class="w-full"
        >
          <ElOption label="📞 Gọi điện" value="Call" />
          <ElOption label="💬 Zalo / Tin nhắn" value="Phone" />
          <ElOption label="📝 Ghi chú" value="Note" />
          <ElOption label="📅 Đặt lịch hẹn" value="Booking" />
          <ElOption label="✅ Đánh dấu đã xử lý" value="Handled" />
        </ElSelect>
        <ElInput
          v-model="actionNote"
          type="textarea"
          :rows="3"
          placeholder="Nhập nội dung tương tác..."
        />
      </div>
      <template #footer>
        <div class="flex gap-3 justify-end">
          <ElButton @click="actionDialogVisible = false">Hủy</ElButton>
          <ElButton
            type="primary"
            @click="submitCareAction"
            :loading="actionLoading"
          >
            Lưu
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  fetchGetLeadList,
  fetchAddLeadActivity,
  type Lead,
} from "@/api/customer/lead.api";
import { isHighIntentLeadStatus } from "@/modules/Marketing/constants/customerCrm";

dayjs.locale("vi");

defineOptions({ name: "CustomerCare" });

const router = useRouter();
const data = ref<Lead[]>([]);
const loading = ref(false);
const searchModel = ref({});
const expandedId = ref<number | null>(null);

const actionDialogVisible = ref(false);
const actionLoading = ref(false);
const activeCustomer = ref<Lead | null>(null);
const activeReminder = ref<any>(null);
const selectedAction = ref("");
const actionNote = ref("");

const customers = computed(() => data.value);

const searchItems = [
  {
    key: "fullName",
    label: "Tìm kiếm",
    type: "input",
    props: {
      placeholder: "Tên hoặc SĐT...",
      clearable: true,
    },
  },
  {
    key: "tier",
    label: "Hạng thành viên",
    type: "select",
    props: {
      placeholder: "Tất cả hạng",
      clearable: true,
      options: [
        { label: "Thành viên mới", value: "Thành viên mới" },
        { label: "VIP", value: "VIP" },
        { label: "Thân thiết", value: "Thân thiết" },
      ],
    },
  },
];

const getPriority = (lead: Lead) => {
  if (isHighIntentLeadStatus(lead.status)) {
    return {
      level: 3,
      label: "CẤP BÁCH",
      icon: "ri:fire-fill",
      color: "#ef4444",
    };
  }
  if (lead.interestedVehicle) {
    return {
      level: 2,
      label: "TIỀM NẠNG",
      icon: "ri:star-fill",
      color: "#f97316",
    };
  }
  return {
    level: 1,
    label: "THEO DÕI",
    icon: "ri:folder-user-fill",
    color: "#64748b",
  };
};

const getTopReminder = (customer: Lead) => {
  const reminders = computeCareReminders(customer);
  if (reminders.length === 0) return "Không có nhắc nhở";
  return reminders[0].title;
};

const getCareReminders = (customer: Lead) => {
  return computeCareReminders(customer);
};

const computeCareReminders = (customer: Lead) => {
  const reminders: any[] = [];
  const now = dayjs();

  if (customer.birthday) {
    const birthDate = dayjs(customer.birthday);
    let nextBirthday = birthDate.set("year", now.year());
    if (nextBirthday.isBefore(now)) {
      nextBirthday = nextBirthday.add(1, "year");
    }
    const daysUntil = nextBirthday.diff(now, "day");
    reminders.push({
      type: "birthday",
      title: "Sinh nhật khách hàng",
      description: `${customer.fullName} - ${nextBirthday.format("DD/MM/YYYY")}`,
      dueDate: nextBirthday.toISOString(),
      priority: daysUntil <= 7 ? "urgent" : daysUntil <= 30 ? "high" : "normal",
    });
  }

  if (customer.tier === "VIP" || customer.tier === "Thân thiết") {
    reminders.push({
      type: "tier",
      title: `Khách hàng ${customer.tier}`,
      description: "Ưu tiên chăm sóc và ưu đãi đặc biệt",
      priority: "high",
    });
  }

  if (customer.points < 50 && customer.status !== "New") {
    reminders.push({
      type: "points",
      title: "Điểm tích lũy thấp",
      description: `Khách hàng chỉ có ${customer.points} điểm. Cần kích hoạt lại.`,
      priority: "normal",
    });
  }

  return reminders;
};

const getSortedActivities = (customer: Lead) => {
  if (!customer.activities) return [];
  return [...customer.activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

const formatDate = (val: string) => {
  return dayjs(val).format("DD/MM/YYYY HH:mm");
};

const reminderIcon = (type: string) => {
  const map: Record<string, string> = {
    birthday: "ri:cake-line",
    tier: "ri:vip-crown-line",
    points: "ri:star-line",
    maintenance: "ri:tools-line",
    stalled_order: "ri:alert-line",
  };
  return map[type] || "ri:information-line";
};

const reminderPriorityClass = (priority: string) => {
  const map: Record<string, string> = {
    urgent: "text-red-500",
    high: "text-amber-500",
    normal: "text-blue-500",
    low: "text-gray-400",
  };
  return map[priority] || "text-gray-400";
};

const activityIcon = (type: string) => {
  const map: Record<string, string> = {
    Call: "ri:phone-line",
    Phone: "ri:phone-line",
    Note: "ri:edit-line",
    Booking: "ri:calendar-line",
    TestDrive: "ri:motorbike-line",
    Contact: "ri:message-3-line",
  };
  return map[type] || "ri:information-line";
};

const activityIconClass = (type: string) => {
  const map: Record<string, string> = {
    Call: "bg-green-50 text-green-500",
    Phone: "bg-green-50 text-green-500",
    Note: "bg-amber-50 text-amber-500",
    Booking: "bg-blue-50 text-blue-500",
    TestDrive: "bg-purple-50 text-purple-500",
    Contact: "bg-gray-100 text-gray-500",
  };
  return map[type] || "bg-gray-100 text-gray-500";
};

const handleToggleExpand = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const handleView360 = (customer: Lead) => {
  router.push(`/Marketing/customer/profile/${customer.id}`);
};

const handleCareAction = (customer: Lead) => {
  activeCustomer.value = customer;
  activeReminder.value = null;
  selectedAction.value = "";
  actionNote.value = "";
  actionDialogVisible.value = true;
};

const handleReminderAction = (customer: Lead, reminder: any) => {
  activeCustomer.value = customer;
  activeReminder.value = reminder;
  selectedAction.value = "";
  actionNote.value = "";
  actionDialogVisible.value = true;
};

const submitCareAction = async () => {
  if (!activeCustomer.value) return;
  if (!selectedAction.value) {
    ElMessage.warning("Vui lòng chọn hành động");
    return;
  }

  actionLoading.value = true;
  try {
    const description = actionNote.value || selectedAction.value;
    await fetchAddLeadActivity(activeCustomer.value.id, {
      activityType: selectedAction.value,
      description,
    });
    ElMessage.success("Đã ghi nhận tương tác");
    actionDialogVisible.value = false;
    await refreshData();
  } catch {
    ElMessage.error("Lỗi khi ghi nhận tương tác");
  } finally {
    actionLoading.value = false;
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    const res = await fetchGetLeadList();
    const leads = Array.isArray(res) ? res : (res as any).items || [];
    data.value = leads;
  } catch (_err: any) {
    ElMessage.error("Lỗi khi tải dữ liệu khách hàng");
  } finally {
    loading.value = false;
  }
};

const handleSearch = (_params: any) => {
  refreshData();
};

const handleReset = () => {
  refreshData();
};

onMounted(() => {
  refreshData();
});
</script>

<style lang="scss" scoped>
.customer-care-page {
  .customer-row-card {
    border: 1px solid #f3f4f6;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: #fffdf7;
      border-color: #f59e0b;
      box-shadow: 0 12px 24px rgb(0 0 0 / 5%);
      transform: translateY(-2px);
    }

    &.is-expanded {
      background-color: white;
      border-color: #f59e0b;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      box-shadow: 0 10px 30px rgb(0 0 0 / 5%);
    }

    .priority-label {
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .expansion-container {
    overflow: hidden;
    background-color: #fafafa;
    border: 1px solid #f59e0b;
    border-top: none;
    border-bottom-right-radius: 1.5rem;
    border-bottom-left-radius: 1.5rem;
  }

  .reminder-item {
    border-radius: 12px;
    transition: background 0.15s;

    &:hover {
      background: #fefce8;
    }
  }

  .search-bar-wrapper {
    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #4b5563;
      white-space: nowrap !important;
    }
  }
}
</style>
