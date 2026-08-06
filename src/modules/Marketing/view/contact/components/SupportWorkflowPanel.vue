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

    <div v-if="request.status === 'Closed'" class="rating-history">
      <div class="rating-history__heading">
        <div>
          <p class="support-workflow__eyebrow">Đánh giá hai chiều</p>
          <h4>Lịch sử đánh giá</h4>
        </div>
        <ElTag type="warning" effect="plain" round>
          {{ ratingHistory.length }} lượt
        </ElTag>
      </div>

      <div v-if="ratingHistory.length" class="rating-history__list">
        <article
          v-for="entry in ratingHistory"
          :key="entry.key"
          class="rating-history__item"
        >
          <div class="rating-history__identity">
            <span class="rating-history__icon">
              <ArtSvgIcon :icon="entry.icon" />
            </span>
            <div>
              <strong>{{ entry.label }}</strong>
              <span>{{ formatTime(entry.ratedAt) }}</span>
            </div>
          </div>
          <div class="rating-history__score">
            <ElRate :model-value="entry.rating" disabled />
            <b>{{ entry.rating }}/5 sao</b>
          </div>
        </article>
      </div>
      <p v-else class="rating-history__empty">Chưa có lượt đánh giá nào.</p>

      <div
        v-if="canRateCustomer && request.employeeRatingOfCustomer == null"
        class="rating-history__action"
      >
        <div>
          <strong>Nhân viên đánh giá khách hàng</strong>
          <span>Chọn số sao theo mức độ hợp tác trong quá trình hỗ trợ.</span>
        </div>
        <div class="rating-history__action-controls">
          <ElRate v-model="employeeRating" :disabled="submitting" />
          <ElButton
            type="primary"
            :loading="submitting"
            :disabled="employeeRating === 0"
            @click="submitEmployeeRating"
          >
            Lưu số sao
          </ElButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Contact } from "@/types";

const props = defineProps<{
  request: Contact.SupportRequest;
  submitting?: boolean;
  canRateCustomer?: boolean;
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

watch(
  () => [props.request.id, props.request.employeeRatingOfCustomer] as const,
  () => {
    employeeRating.value = props.request.employeeRatingOfCustomer ?? 0;
  },
  { immediate: true },
);

const currentStepIndex = computed(() => {
  const index = steps.findIndex((step) => step.status === props.request.status);
  return index < 0 ? 0 : index;
});

const currentStepLabel = computed(() => steps[currentStepIndex.value].label);

const ratingHistory = computed(() => {
  const entries: Array<{
    key: string;
    label: string;
    icon: string;
    rating: number;
    ratedAt?: string;
  }> = [];

  if (props.request.employeeRatingOfCustomer != null) {
    entries.push({
      key: "employee-to-customer",
      label: "Nhân viên đánh giá khách hàng",
      icon: "ri:user-star-line",
      rating: props.request.employeeRatingOfCustomer,
      ratedAt: props.request.employeeRatedAt,
    });
  }

  if (props.request.customerRatingOfEmployee != null) {
    entries.push({
      key: "customer-to-employee",
      label: "Khách hàng đánh giá nhân viên",
      icon: "ri:star-smile-line",
      rating: props.request.customerRatingOfEmployee,
      ratedAt: props.request.customerRatedAt,
    });
  }

  return entries.sort((left, right) =>
    (left.ratedAt ?? "").localeCompare(right.ratedAt ?? ""),
  );
});

const formatTime = (value?: string) => {
  if (!value) return "Chưa ghi nhận thời gian";
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
    comment: "",
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

.support-workflow__heading,
.rating-history__heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h3,
  h4,
  p {
    margin: 0;
  }

  h3,
  h4 {
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

.rating-history {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.rating-history__list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.rating-history__item,
.rating-history__action {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
}

.rating-history__identity,
.rating-history__score,
.rating-history__action-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.rating-history__identity > div,
.rating-history__action > div:first-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.rating-history__identity strong,
.rating-history__action strong {
  color: var(--el-text-color-primary);
  font-size: 12px;
}

.rating-history__identity span,
.rating-history__action span,
.rating-history__empty {
  color: var(--el-text-color-secondary);
  font-size: 10px;
}

.rating-history__icon {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  color: var(--el-color-warning);
  border-radius: 10px;
  background: color-mix(in srgb, var(--el-color-warning) 12%, transparent);
  place-items: center;
}

.rating-history__score b {
  color: var(--el-text-color-primary);
  font-size: 11px;
  white-space: nowrap;
}

.rating-history__empty {
  margin: 0;
  padding: 14px;
  border-radius: 12px;
  background: var(--el-fill-color-lighter);
  text-align: center;
}

.rating-history__action {
  margin-top: 10px;
  border-color: color-mix(in srgb, var(--el-color-primary) 32%, transparent);
}

@media (width < 640px) {
  .rating-history__item,
  .rating-history__action {
    align-items: flex-start;
    flex-direction: column;
  }

  .rating-history__action-controls {
    width: 100%;
    justify-content: space-between;
  }
}

@media (width >= 768px) {
  .support-workflow__track,
  .rating-history__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width >= 1200px) {
  .support-workflow__track {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
