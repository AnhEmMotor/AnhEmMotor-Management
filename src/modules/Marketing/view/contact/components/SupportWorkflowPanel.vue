<template>
  <section class="support-workflow" aria-label="Quy trình hỗ trợ khách hàng">
    <div class="support-workflow__heading">
      <div>
        <p class="support-workflow__eyebrow">Quy trình hỗ trợ</p>
        <h3>{{ currentStepLabel }}</h3>
      </div>
      <ElTag v-if="request.assignedUserName" type="danger" effect="plain" round>
        {{ request.assignedUserName }}
      </ElTag>
      <ElTag v-else type="info" effect="plain" round>Chưa phân công</ElTag>
    </div>

    <div class="support-workflow__track" role="list">
      <div
        v-for="(step, index) in steps"
        :key="step.status"
        class="support-workflow__step"
        :class="{
          'is-complete': index < currentStepIndex,
          'is-current': index === currentStepIndex,
        }"
        role="listitem"
      >
        <div class="support-workflow__marker">
          <ArtSvgIcon
            :icon="index < currentStepIndex ? 'ri:check-line' : step.icon"
          />
        </div>
        <div class="support-workflow__copy">
          <strong>{{ step.label }}</strong>
          <span>{{ stepTime(step.status) }}</span>
        </div>
      </div>
    </div>

    <div v-if="request.status === 'Closed'" class="support-workflow__ratings">
      <article class="support-workflow__rating-card">
        <p>Nhân viên đánh giá khách hàng</p>
        <ElRate v-model="employeeRating" :disabled="submitting" />
        <ElInput
          v-model="employeeComment"
          type="textarea"
          :rows="2"
          maxlength="1000"
          show-word-limit
          placeholder="Ghi nhận mức độ hợp tác của khách hàng"
        />
        <ElButton
          type="primary"
          :loading="submitting"
          :disabled="employeeRating === 0"
          @click="submitEmployeeRating"
        >
          Lưu đánh giá khách hàng
        </ElButton>
      </article>

      <article
        class="support-workflow__rating-card support-workflow__rating-card--customer"
      >
        <p>Khách hàng đánh giá nhân viên</p>
        <ElRate :model-value="request.customerRatingOfEmployee ?? 0" disabled />
        <span class="support-workflow__rating-note">
          {{ request.customerRatingComment || "Khách hàng chưa gửi đánh giá." }}
        </span>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Contact } from "@/types";

const props = defineProps<{
  request: Contact.SupportRequest;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  rateCustomer: [payload: { rating: number; comment: string }];
}>();

const steps = [
  { status: "New", label: "Tiếp nhận", icon: "ri:inbox-archive-line" },
  {
    status: "Assigned",
    label: "Đã phân công",
    icon: "ri:user-received-2-line",
  },
  {
    status: "InProgress",
    label: "Đang hỗ trợ",
    icon: "ri:customer-service-2-line",
  },
  { status: "Closed", label: "Hoàn tất", icon: "ri:checkbox-circle-line" },
] as const;

const employeeRating = ref(0);
const employeeComment = ref("");

watch(
  () => [props.request.id, props.request.employeeRatingOfCustomer] as const,
  () => {
    employeeRating.value = props.request.employeeRatingOfCustomer ?? 0;
    employeeComment.value = props.request.employeeRatingComment ?? "";
  },
  { immediate: true },
);

const currentStepIndex = computed(() => {
  const index = steps.findIndex((step) => step.status === props.request.status);
  return index < 0 ? 0 : index;
});

const currentStepLabel = computed(() => steps[currentStepIndex.value].label);

const formatTime = (value?: string) => {
  if (!value) return "Chưa ghi nhận";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

const stepTime = (status: (typeof steps)[number]["status"]) => {
  const values = {
    New: props.request.createdAt,
    Assigned: props.request.assignedAt,
    InProgress: props.request.startedAt,
    Closed: props.request.closedAt,
  };
  return formatTime(values[status]);
};

const submitEmployeeRating = () => {
  emit("rateCustomer", {
    rating: employeeRating.value,
    comment: employeeComment.value.trim(),
  });
};
</script>

<style scoped lang="scss">
.support-workflow {
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  background: var(--el-bg-color);
}

.support-workflow__heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3,
  p {
    margin: 0;
  }

  h3 {
    color: var(--el-text-color-primary);
    font-size: 15px;
  }
}

.support-workflow__eyebrow {
  color: var(--el-color-danger);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.support-workflow__track {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.support-workflow__step {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
}

.support-workflow__marker {
  display: grid;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  color: var(--el-text-color-secondary);
  border-radius: 10px;
  background: var(--el-fill-color);
  place-items: center;
}

.support-workflow__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;

  strong {
    color: var(--el-text-color-primary);
    font-size: 12px;
  }

  span {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.support-workflow__step.is-current {
  border-color: var(--el-color-danger);
  background: color-mix(in srgb, var(--el-color-danger) 8%, var(--el-bg-color));

  .support-workflow__marker {
    color: #fff;
    background: var(--el-color-danger);
  }
}

.support-workflow__step.is-complete .support-workflow__marker {
  color: #fff;
  background: var(--el-color-success);
}

.support-workflow__ratings {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 16px;
}

.support-workflow__rating-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: var(--el-fill-color-lighter);

  p {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 12px;
    font-weight: 700;
  }
}

.support-workflow__rating-card--customer {
  align-content: start;
}

.support-workflow__rating-note {
  color: var(--el-text-color-secondary);
  font-size: 11px;
  line-height: 1.5;
}

@media (width >= 768px) {
  .support-workflow__track,
  .support-workflow__ratings {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 1200px) {
  .support-workflow__track {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
