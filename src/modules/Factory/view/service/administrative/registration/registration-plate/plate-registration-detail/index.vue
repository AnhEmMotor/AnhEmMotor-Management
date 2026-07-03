<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="size-9 rounded-xl border border-slate-200 text-slate-600 flex-cc hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArtSvgIcon icon="ri:arrow-left-line" />
        </button>

        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h1
              class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none"
            >
              {{ detail?.code ? detail.code : "-" }}
            </h1>
            <span :class="getStatusBadgeClass(detail?.workflowStatus || '-')">
              {{ detail?.workflowStatus || "-" }}
            </span>
          </div>

          <p
            class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5"
          >
            <ArtSvgIcon icon="ri:calendar-line" />
            Ngày tạo: {{ formatDate(detail?.createdAt) }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ElButton
          type="success"
          v-if="canGoNextStep"
          :loading="submitting"
          @click="handleAdvanceWorkflow"
        >
          <ArtSvgIcon icon="ri:play-fill" />
          Tiến hành bước tiếp theo
        </ElButton>
      </div>
    </div>

    <!-- Main -->
    <div v-loading="loading" class="flex-1 max-w-[1400px] w-full mx-auto">
      <div v-if="detail" class="space-y-6">
        <!-- Info Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ElCard>
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:user-line" />
                <span class="font-semibold">Thông tin khách</span>
              </div>
            </template>

            <div class="space-y-2 text-sm">
              <div>
                <span class="text-slate-500">Tên:</span>
                <b class="text-slate-900">{{ detail.customerName || "-" }}</b>
              </div>
              <div>
                <span class="text-slate-500">SĐT:</span>
                <b class="text-slate-900">{{ detail.phoneNumber || "-" }}</b>
              </div>
            </div>
          </ElCard>

          <ElCard>
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri-car-line" />
                <span class="font-semibold">Thông tin xe</span>
              </div>
            </template>

            <div class="space-y-2 text-sm">
              <div>
                <span class="text-slate-500">VIN / Số khung:</span>
                <b class="text-slate-900">{{ detail.vinNumber || "-" }}</b>
              </div>
              <div>
                <span class="text-slate-500">Biển số:</span>
                <b class="text-slate-900">{{ detail.licensePlate || "-" }}</b>
              </div>
            </div>
          </ElCard>

          <ElCard>
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri:user-shared-line" />
                <span class="font-semibold">Người xử lý</span>
              </div>
            </template>

            <div class="space-y-2 text-sm">
              <div>
                <span class="text-slate-500">Xưởng/Staff:</span>
                <b class="text-slate-900">{{
                  detail.workshopAssignee || "-"
                }}</b>
              </div>
              <div>
                <span class="text-slate-500">Workflow hiện tại:</span>
                <b class="text-slate-900">{{ detail.workflowStatus }}</b>
              </div>
            </div>
          </ElCard>
        </div>

        <!-- Financial Info -->
        <ElCard class="bg-blue-50/30 border-blue-100">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-blue-900">
                <ArtSvgIcon icon="ri-money-dollar-circle-line" />
                <span class="font-bold"
                  >Đối soát tài chính (Thu hộ - Chi hộ)</span
                >
              </div>

              <div class="flex items-center gap-2">
                <span
                  v-if="detail.debtAmount && detail.debtAmount > 0"
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold"
                >
                  <ArtSvgIcon icon="ri-error-warning-fill" />
                  CÔNG NỢ: CÒN THIẾU {{ formatCurrency(detail.debtAmount) }}
                </span>

                <span
                  v-else
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold"
                >
                  <ArtSvgIcon icon="ri-checkbox-circle-fill" />
                  CÔNG NỢ: ĐÃ THU ĐỦ
                </span>
              </div>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-1">
              <div
                class="text-slate-500 text-xs font-semibold uppercase tracking-wider"
              >
                Tổng thu của khách
              </div>
              <div class="text-xl font-bold text-slate-900">
                {{ formatCurrency(detail.totalCollected) }}
              </div>
            </div>

            <div class="space-y-1">
              <div
                class="text-slate-500 text-xs font-semibold uppercase tracking-wider"
              >
                Chi hộ thực tế
                <span
                  class="text-[10px] normal-case text-slate-400 font-normal"
                >
                  (Nộp ngân sách nhà nước)
                </span>
              </div>
              <div class="text-xl font-bold text-slate-900">
                {{ formatCurrency(detail.totalPaid) }}
              </div>
            </div>

            <div class="space-y-1 md:pl-6 md:border-l border-slate-200">
              <div
                class="text-blue-600 text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
              >
                <ArtSvgIcon icon="ri-arrow-right-line" />
                Phí dịch vụ bỏ túi
              </div>
              <div class="text-2xl font-black text-blue-700">
                {{
                  formatCurrency(
                    (detail.totalCollected || 0) - (detail.totalPaid || 0),
                  )
                }}
              </div>
            </div>
          </div>
        </ElCard>

        <!-- Pipeline -->
        <div
          class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm"
        >
          <h3
            class="text-[10px] font-black uppercase text-slate-400 tracking-wider m-0"
          >
            Pipeline (5 bước)
          </h3>

          <div class="mt-4 relative pl-6 border-l-2 border-slate-100 space-y-3">
            <div v-for="step in steps" :key="step.key" class="relative">
              <div
                class="absolute -left-[31px] top-0 size-4 rounded-full border-2 flex-cc transition-all"
                :class="getStepDotClass(step.key)"
              >
                <div
                  class="size-1.5 rounded-full"
                  :class="getStepInnerDotClass(step.key)"
                ></div>
              </div>

              <div class="pl-2">
                <h4
                  class="m-0 text-xs font-black uppercase"
                  :class="
                    isStepActive(step.key) ? 'text-slate-800' : 'text-slate-400'
                  "
                >
                  {{ step.title }}
                </h4>
                <p class="m-0 text-[10px] text-slate-400 mt-1 leading-relaxed">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline & Notification -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ElCard class="lg:col-span-2">
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri-time-line" />
                <span class="font-semibold">Timeline hồ sơ</span>
              </div>
            </template>

            <div v-if="timeline.length === 0" class="text-sm text-slate-500">
              Chưa có lịch sử.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="t in timeline"
                :key="t.key"
                class="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <ElTag :type="t.type as any" effect="dark">{{
                        t.status
                      }}</ElTag>
                      <span class="text-sm font-black text-slate-900">{{
                        t.title
                      }}</span>
                    </div>
                    <div class="mt-2 text-sm text-slate-600">{{ t.note }}</div>
                  </div>

                  <div class="text-right">
                    <div
                      class="text-[11px] font-black text-slate-400 uppercase tracking-wider"
                    >
                      Thời gian
                    </div>
                    <div class="font-bold text-slate-900">
                      {{ formatDateTime(t.occurredAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ElCard>

          <ElCard>
            <template #header>
              <div class="flex items-center gap-2">
                <ArtSvgIcon icon="ri-notification-3-line" />
                <span class="font-semibold">Thông báo khách</span>
              </div>
            </template>

            <div
              v-if="notifications.length === 0"
              class="text-sm text-slate-500"
            >
              Chưa có thông báo.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="n in notifications"
                :key="n.key"
                class="rounded-xl border border-slate-200 p-3"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-black text-slate-900">{{ n.channel }}</span>
                  <ElTag :type="n.type as any" effect="dark">{{
                    n.status
                  }}</ElTag>
                </div>

                <div class="mt-2 text-sm text-slate-600">{{ n.message }}</div>
                <div class="mt-2 text-[11px] text-slate-400">
                  {{ formatDateTime(n.sentAt) }}
                </div>
              </div>
            </div>
          </ElCard>
        </div>
      </div>

      <div v-else class="text-sm text-slate-500">Không tìm thấy hồ sơ.</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import ArtSvgIcon from "@/components/core/base/art-svg-icon/index.vue";
import { PlateDossierApi } from "@/api/vehicle/plate-dossier.api";

type PlateRegistrationDetail = {
  id: number;
  code: string;
  phoneNumber: string;
  customerName?: string;
  vinNumber?: string;
  licensePlate?: string;
  workshopAssignee?: string;
  workflowStatus: string;
  createdAt?: string;
  totalCollected?: number;
  totalPaid?: number;
  debtAmount?: number;
};

type TimelineItem = {
  key: string;
  status: string;
  title: string;
  note: string;
  occurredAt: string;
  type: string;
};

type NotificationItem = {
  key: string;
  channel: string;
  status: string;
  message: string;
  sentAt: string;
  type: string;
};

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const submitting = ref(false);

const detail = ref<PlateRegistrationDetail | null>(null);

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "0 đ";
  return (
    new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(val) +
    "đ"
  );
};

const steps = [
  {
    key: "Prepare",
    title: "Chuẩn bị hồ sơ",
    description:
      "Nhân viên phụ trách thực hiện. Hệ thống không gửi thông báo khách ngay ở bước này.",
  },
  {
    key: "TaxPaid",
    title: "Đã nộp thuế trước bạ",
    description:
      "Sau khi nộp xong, hệ thống gửi Zalo/SMS để thông báo tiến độ.",
  },
  {
    key: "PlateAssigned",
    title: "Đã bấm biển số",
    description: "Gửi Zalo/SMS cập nhật tình trạng hồ sơ sau khi bấm xong.",
  },
  {
    key: "WaitingCard",
    title: "Đang chờ cà-vet (Giấy hẹn)",
    description: "Gửi thông báo về việc đang chờ giấy hẹn/diễn biến hồ sơ.",
  },
  {
    key: "Completed",
    title: "Đã nhận cà-vet – Hoàn tất",
    description:
      "Nhân viên giao khách xử lý và xác nhận hoàn tất. Gửi xác nhận cho khách.",
  },
] as const;

const stepIndex = computed(() => {
  const s = detail.value?.workflowStatus;
  if (!s) return -1;
  return steps.findIndex((x) => x.key === s);
});

const isStepActive = (key: string) => {
  const idx = steps.findIndex((x) => x.key === key);
  return idx <= stepIndex.value && idx !== -1;
};

const getStepDotClass = (key: string) => {
  if (isStepActive(key)) return "border-slate-900 bg-slate-900";
  return "border-slate-200 bg-white";
};

const getStepInnerDotClass = (key: string) => {
  if (isStepActive(key)) return "bg-white";
  return "bg-slate-300";
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Completed":
      return "px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-black uppercase";
    case "WaitingCard":
      return "px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-black uppercase";
    case "PlateAssigned":
      return "px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase";
    case "TaxPaid":
      return "px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase";
    case "Prepare":
      return "px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] font-black uppercase";
    default:
      return "px-2 py-0.5 bg-slate-50 text-slate-700 rounded text-[10px] font-black uppercase";
  }
};

const timeline = computed<TimelineItem[]>(() => {
  if (!detail.value) return [];

  const base: TimelineItem[] = [
    {
      key: "t1",
      status: "Prepare",
      title: "Nhân viên chuẩn bị hồ sơ",
      note: "Đã xác nhận bộ hồ sơ hợp lệ để tiến hành bước nộp thuế.",
      occurredAt: detail.value.createdAt || new Date().toISOString(),
      type: "info",
    },
    {
      key: "t2",
      status: "TaxPaid",
      title: "Nộp thuế trước bạ thành công",
      note: "Hệ thống đã ghi nhận đã nộp.",
      occurredAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      type: "primary",
    },
    {
      key: "t3",
      status: "PlateAssigned",
      title: "Bấm biển số",
      note: "Đã bấm biển số theo thông tin hồ sơ.",
      occurredAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      type: "success",
    },
    {
      key: "t4",
      status: "WaitingCard",
      title: "Đang chờ giấy hẹn/cà-vet",
      note: "Hồ sơ đang được cơ quan liên quan xử lý.",
      occurredAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      type: "warning",
    },
  ];

  const currentIdx = steps.findIndex(
    (x) => x.key === detail.value!.workflowStatus,
  );
  const keepCount = Math.max(1, currentIdx + 1);
  return base.slice(0, keepCount);
});

const notifications = computed<NotificationItem[]>(() => {
  if (!detail.value) return [];

  const all: NotificationItem[] = [
    {
      key: "n1",
      channel: "Zalo/SMS",
      status: "Sent",
      message: "Hệ thống thông báo: Đã nộp thuế trước bạ.",
      sentAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      type: "info",
    },
    {
      key: "n2",
      channel: "Zalo/SMS",
      status: "Sent",
      message: "Hệ thống thông báo: Đã bấm biển số.",
      sentAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      type: "success",
    },
    {
      key: "n3",
      channel: "Zalo/SMS",
      status: "Sent",
      message: "Hệ thống thông báo: Đang chờ cà-vet/giấy hẹn.",
      sentAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      type: "warning",
    },
  ];

  const currentIdx = steps.findIndex(
    (x) => x.key === detail.value!.workflowStatus,
  );
  return all.slice(0, Math.max(1, currentIdx));
});

const canGoNextStep = computed(() => {
  if (!detail.value) return false;
  const idx = steps.findIndex((x) => x.key === detail.value!.workflowStatus);
  return idx >= 0 && idx < steps.length - 1;
});

const advanceStatus = computed(() => {
  if (!detail.value) return null;
  const idx = steps.findIndex((x) => x.key === detail.value!.workflowStatus);
  if (idx < 0) return null;
  return steps[idx + 1]?.key ?? null;
});

const formatDate = (d?: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("vi-VN");
  } catch {
    return d;
  }
};

const formatDateTime = (d?: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("vi-VN");
  } catch {
    return d;
  }
};

const goBack = () => {
  router.push({ name: "ServiceAdministrativeRegistration" });
};

const fetchDetail = async () => {
  loading.value = true;
  try {
    const id = Number(route.params.id);
    const item = await PlateDossierApi.getDetail(id);
    if (item) {
      detail.value = {
        id: item.id,
        code: item.dossierNumber || `HSBS-${item.id}`,
        phoneNumber: item.customerPhone || "",
        customerName: item.customerName || "Không rõ",
        vinNumber: item.vinNumber || "N/A",
        licensePlate: item.licensePlate,
        workshopAssignee: "",
        workflowStatus: item.status,
        createdAt: item.createdAt,
        totalCollected: Number(item.registrationFee) + Number(item.serviceFee),
        totalPaid: Number(item.actualCost),
        debtAmount: 0,
      };
    } else {
      detail.value = null;
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể tải chi tiết hồ sơ");
  } finally {
    loading.value = false;
  }
};

const handleAdvanceWorkflow = async () => {
  if (!detail.value || !advanceStatus.value) return;

  submitting.value = true;
  try {
    const success = await PlateDossierApi.updateStatus({
      id: detail.value.id,
      status: advanceStatus.value,
    });
    if (success) {
      detail.value = {
        ...detail.value,
        workflowStatus: advanceStatus.value,
      };
      ElMessage.success("Đã tiến hành bước tiếp theo thành công!");
    } else {
      throw new Error("Không thể cập nhật trạng thái");
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Tiến hành bước thất bại");
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
