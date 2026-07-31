<template>
  <div
    class="plan-card border border-gray-200 dark:border-slate-700 rounded-lg p-3 my-2 bg-slate-50 dark:bg-slate-800/60 max-w-full"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="font-semibold text-sm">📋 Kế hoạch thực hiện</span>
      <span class="text-xs text-gray-400">{{ statusLabel }}</span>
    </div>

    <div
      v-if="hasInvalidStep"
      class="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded px-2 py-1 mb-2"
    >
      ⚠️ Hệ thống đã cập nhật, một số bước trong kế hoạch không còn khả dụng.
      Vui lòng xem lại kế hoạch trước khi duyệt lại.
    </div>

    <VueDraggable
      v-model="orderedSteps"
      :disabled="!canEdit"
      class="flex flex-col gap-1.5"
      ghost-class="plan-step-ghost"
      @end="onReorder"
    >
      <div
        v-for="step in orderedSteps"
        :key="step.id"
        class="flex items-start gap-2 px-2 py-1.5 rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        :class="{
          'opacity-50': step.status === 'skipped',
          'border-red-400': step.status === 'invalid',
        }"
      >
        <span class="mt-0.5 shrink-0">{{ statusIcon(step.status) }}</span>
        <div class="flex-1 min-w-0">
          <template v-if="editingStepId === step.id">
            <ElInput
              v-model="editTitle"
              size="small"
              class="mb-1"
              @keyup.enter="commitEdit(step)"
            />
            <ElInput
              v-model="editDetail"
              size="small"
              type="textarea"
              :rows="2"
              @blur="commitEdit(step)"
              @keyup.enter="commitEdit(step)"
            />
          </template>
          <template v-else>
            <div
              class="text-sm font-medium"
              :class="{ 'line-through': step.status === 'skipped' }"
            >
              {{ step.order }}. {{ step.title }}
              <span
                v-if="step.editedByUser"
                class="text-[10px] text-amber-500 font-normal"
                >✏️ đã sửa</span
              >
            </div>
            <div class="text-xs text-gray-500 dark:text-slate-400">
              {{ step.detail }}
            </div>
            <div
              v-if="step.result"
              class="text-xs text-gray-400 dark:text-slate-500 mt-0.5"
            >
              {{ step.result }}
            </div>
          </template>
        </div>
        <div
          v-if="canEdit && step.status !== 'skipped'"
          class="flex gap-1 shrink-0"
        >
          <ElIcon
            class="cursor-pointer text-gray-400 hover:text-gray-600"
            @click="startEdit(step)"
          >
            <Edit />
          </ElIcon>
          <ElIcon
            class="cursor-pointer text-gray-400 hover:text-red-500"
            @click="removeStep(step)"
          >
            <Delete />
          </ElIcon>
        </div>
      </div>
    </VueDraggable>

    <button
      v-if="canEdit"
      class="text-xs text-blue-500 hover:text-blue-600 mt-2"
      @click="addStep"
    >
      + Thêm bước
    </button>

    <div class="flex justify-end gap-2 mt-3">
      <ElButton size="small" :disabled="!canEdit" @click="onReject"
        >Huỷ</ElButton
      >
      <ElButton
        size="small"
        type="primary"
        :disabled="plan.status !== 'Ready'"
        :loading="approving"
        @click="onApprove"
      >
        Duyệt & chạy
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { VueDraggable } from "vue-draggable-plus";
import { ElButton, ElIcon, ElInput, ElMessage } from "element-plus";
import { Edit, Delete } from "@element-plus/icons-vue";
import {
  ManagerChatApi as ChatApi,
  type ChatPlanDto,
  type PlanStepDto,
  type PlanStepOperation,
} from "@/api/chat/chat.api";
import { HttpError } from "@/utils/http/error";

const props = defineProps<{
  plan: ChatPlanDto;
}>();

const emit = defineEmits<{
  "update:plan": [plan: ChatPlanDto];
}>();

const sortByOrder = (steps: PlanStepDto[]) =>
  [...steps].sort((a, b) => a.order - b.order);

const orderedSteps = ref<PlanStepDto[]>(sortByOrder(props.plan.steps));
watch(
  () => props.plan.steps,
  (steps) => {
    orderedSteps.value = sortByOrder(steps);
  },
);

const canEdit = computed(
  () => props.plan.status === "Drafting" || props.plan.status === "Ready",
);
const hasInvalidStep = computed(() =>
  props.plan.steps.some((s) => s.status === "invalid"),
);
const approving = ref(false);

const STATUS_LABELS: Record<string, string> = {
  Drafting: "Đang tạo…",
  Ready: "Chờ duyệt",
  Approved: "Đã duyệt",
  Executing: "Đang thực hiện…",
  Completed: "Hoàn tất",
  Rejected: "Đã huỷ",
};
const statusLabel = computed(
  () => STATUS_LABELS[props.plan.status] ?? props.plan.status,
);

const STEP_ICONS: Record<string, string> = {
  pending: "⚪",
  running: "🔵",
  done: "✅",
  failed: "❌",
  skipped: "➖",
  invalid: "⚠️",
};
const statusIcon = (status: string) => STEP_ICONS[status] ?? "⚪";

const editingStepId = ref<string | null>(null);
const editTitle = ref("");
const editDetail = ref("");

const startEdit = (step: PlanStepDto) => {
  editingStepId.value = step.id;
  editTitle.value = step.title;
  editDetail.value = step.detail;
};

const applyPlanUpdate = (updated: ChatPlanDto) => {
  emit("update:plan", updated);
};

const refetchPlan = async () => {
  const fresh = await ChatApi.getPlan(props.plan.runId);
  applyPlanUpdate(fresh);
};

const applyOperations = async (operations: PlanStepOperation[]) => {
  try {
    const updated = await ChatApi.updatePlan(
      props.plan.runId,
      props.plan.version,
      operations,
    );
    applyPlanUpdate(updated);
  } catch (err) {
    if (err instanceof HttpError && err.code === 409) {
      ElMessage.warning("Kế hoạch vừa được cập nhật, vui lòng xem lại");
      await refetchPlan();
    } else {
      ElMessage.error("Không thể sửa kế hoạch.");
    }
  }
};

const commitEdit = async (step: PlanStepDto) => {
  if (editingStepId.value !== step.id) return;
  editingStepId.value = null;
  if (editTitle.value === step.title && editDetail.value === step.detail)
    return;
  await applyOperations([
    {
      type: "edit",
      stepId: step.id,
      title: editTitle.value,
      detail: editDetail.value,
    },
  ]);
};

const removeStep = async (step: PlanStepDto) => {
  await applyOperations([{ type: "remove", stepId: step.id }]);
};

const addStep = async () => {
  await applyOperations([{ type: "add", title: "Bước mới", detail: "" }]);
};

const onReorder = async () => {
  const previousIds = sortByOrder(props.plan.steps).map((s) => s.id);
  const newIds = orderedSteps.value.map((s) => s.id);
  if (JSON.stringify(previousIds) === JSON.stringify(newIds)) return;

  const operations: PlanStepOperation[] = orderedSteps.value.map((s, idx) => ({
    type: "reorder",
    stepId: s.id,
    order: idx + 1,
  }));
  await applyOperations(operations);
};

const onReject = async () => {
  try {
    await ChatApi.rejectPlan(props.plan.runId);
    emit("update:plan", { ...props.plan, status: "Rejected" });
  } catch {
    ElMessage.error("Không thể huỷ kế hoạch.");
  }
};

const onApprove = async () => {
  approving.value = true;
  try {
    await ChatApi.approvePlan(props.plan.runId, props.plan.version);
    emit("update:plan", { ...props.plan, status: "Executing" });
  } catch (err) {
    if (err instanceof HttpError && err.code === 409) {
      ElMessage.warning("Kế hoạch vừa được cập nhật, vui lòng xem lại");
    } else {
      ElMessage.error(
        "Không thể duyệt kế hoạch — có thể một số bước không còn khả dụng, vui lòng xem lại.",
      );
    }
    await refetchPlan();
  } finally {
    approving.value = false;
  }
};
</script>

<style scoped>
.plan-step-ghost {
  opacity: 0.4;
}
</style>
