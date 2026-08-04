<template>
  <div class="kpi-page">
    <header class="kpi-page__header">
      <div class="kpi-page__header-copy">
        <span class="kpi-page__eyebrow">
          <ElIcon><TrendCharts /></ElIcon>
          {{ t("menus.hr.kpiManagement.eyebrow") }}
        </span>
        <h1>{{ t("menus.hr.kpiManagement.title") }}</h1>
        <p>{{ t("menus.hr.kpiManagement.subtitle") }}</p>
      </div>
      <div class="kpi-page__header-actions">
        <ElButton :loading="loading" @click="loadData">
          <ElIcon><Refresh /></ElIcon>
          {{ t("menus.hr.kpiManagement.refresh") }}
        </ElButton>
        <ElButton type="primary" @click="handleAdd">
          <ElIcon><Plus /></ElIcon>
          {{ t("menus.hr.kpiManagement.add") }}
        </ElButton>
      </div>
    </header>

    <section class="kpi-summary-grid" aria-label="KPI summary">
      <template v-if="loading && !rows.length">
        <div v-for="index in 4" :key="index" class="kpi-summary-card">
          <ElSkeleton :rows="2" animated />
        </div>
      </template>
      <template v-else>
        <article class="kpi-summary-card kpi-summary-card--featured">
          <div class="kpi-summary-card__icon">
            <ElIcon><DataAnalysis /></ElIcon>
          </div>
          <div>
            <span>{{ t("menus.hr.kpiManagement.summary.total") }}</span>
            <strong>{{ summary.total }}</strong>
          </div>
        </article>
        <article class="kpi-summary-card">
          <div class="kpi-summary-card__icon kpi-summary-card__icon--success">
            <ElIcon><CircleCheckFilled /></ElIcon>
          </div>
          <div>
            <span>{{ t("menus.hr.kpiManagement.summary.met") }}</span>
            <strong>{{ summary.met }}</strong>
          </div>
        </article>
        <article class="kpi-summary-card">
          <div class="kpi-summary-card__icon kpi-summary-card__icon--warning">
            <ElIcon><WarningFilled /></ElIcon>
          </div>
          <div>
            <span>{{ t("menus.hr.kpiManagement.summary.near") }}</span>
            <strong>{{ summary.near }}</strong>
          </div>
        </article>
        <article class="kpi-summary-card">
          <div class="kpi-summary-card__icon">
            <ElIcon><Aim /></ElIcon>
          </div>
          <div>
            <span>{{ t("menus.hr.kpiManagement.summary.average") }}</span>
            <strong>{{ formatPercent(summary.average) }}</strong>
          </div>
        </article>
      </template>
    </section>

    <ElCard class="kpi-filter-card" shadow="never">
      <div class="kpi-filter-grid">
        <ElInput
          v-model="filters.keyword"
          clearable
          :prefix-icon="Search"
          :placeholder="t('menus.hr.kpiManagement.filter.keyword')"
          @input="resetPage"
        />
        <ElSelect
          v-model="filters.employeeId"
          clearable
          filterable
          :placeholder="t('menus.hr.kpiManagement.filter.employee')"
          @change="resetPage"
        >
          <ElOption
            v-for="employee in employees"
            :key="employee.id"
            :label="`${employee.fullName} · ${employee.jobTitle}`"
            :value="employee.id"
          />
        </ElSelect>
        <ElSelect
          v-model="filters.status"
          clearable
          :placeholder="t('menus.hr.kpiManagement.filter.status')"
          @change="resetPage"
        >
          <ElOption
            :label="t('menus.hr.kpiManagement.status.met')"
            value="met"
          />
          <ElOption
            :label="t('menus.hr.kpiManagement.status.near')"
            value="near"
          />
          <ElOption
            :label="t('menus.hr.kpiManagement.status.behind')"
            value="behind"
          />
        </ElSelect>
        <ElDatePicker
          v-model="filters.period"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="—"
          :start-placeholder="t('menus.hr.kpiManagement.form.periodStart')"
          :end-placeholder="t('menus.hr.kpiManagement.form.periodEnd')"
          @change="resetPage"
        />
        <ElButton class="kpi-filter-card__reset" @click="handleReset">
          {{ t("menus.hr.kpiManagement.filter.reset") }}
        </ElButton>
      </div>
    </ElCard>

    <ElAlert
      v-if="loadError"
      class="kpi-page__alert"
      type="error"
      :closable="false"
      show-icon
    >
      <template #title>
        <div class="kpi-page__alert-title">
          <span>{{ loadError }}</span>
          <ElButton link type="primary" @click="loadData">
            {{ t("menus.hr.kpiManagement.refresh") }}
          </ElButton>
        </div>
      </template>
    </ElAlert>

    <ElCard class="kpi-table-card" shadow="never">
      <div class="kpi-table-card__header">
        <div>
          <h2>{{ t("menus.hr.kpiManagement.title") }}</h2>
          <span>{{ filteredRows.length }} KPI</span>
        </div>
      </div>

      <div v-if="filteredRows.length || loading" class="kpi-table-scroll">
        <ElTable
          v-loading="loading"
          :data="pagedRows"
          row-key="id"
          class="kpi-table"
        >
          <ElTableColumn
            :label="t('menus.hr.kpiManagement.table.employee')"
            min-width="230"
          >
            <template #default="{ row }">
              <div class="employee-cell">
                <span class="employee-cell__avatar">
                  {{ getInitials(row.employeeName) }}
                </span>
                <div>
                  <strong>{{ row.employeeName }}</strong>
                  <span>{{ row.jobTitle || "—" }}</span>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="t('menus.hr.kpiManagement.table.metric')"
            min-width="230"
          >
            <template #default="{ row }">
              <div class="metric-cell">
                <strong>{{ row.kpiName }}</strong>
                <span>{{ row.description || "—" }}</span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="t('menus.hr.kpiManagement.table.period')"
            width="190"
          >
            <template #default="{ row }">
              <div class="period-cell">
                <ElIcon><Calendar /></ElIcon>
                <span>
                  {{ formatDate(row.periodStart) }}<br />
                  {{ formatDate(row.periodEnd) }}
                </span>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="t('menus.hr.kpiManagement.table.progress')"
            min-width="260"
          >
            <template #default="{ row }">
              <div class="progress-cell">
                <div class="progress-cell__values">
                  <span>
                    {{ t("menus.hr.kpiManagement.table.actual") }}
                    <strong>{{ formatNumber(row.actualValue) }}</strong>
                  </span>
                  <span>
                    {{ t("menus.hr.kpiManagement.table.target") }}
                    <strong>{{ formatNumber(row.targetValue) }}</strong>
                  </span>
                </div>
                <ElProgress
                  :percentage="getProgressPercentage(row.score)"
                  :stroke-width="8"
                  :show-text="false"
                  :color="getProgressColor(row.score)"
                />
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="t('menus.hr.kpiManagement.table.score')"
            width="130"
            align="center"
          >
            <template #default="{ row }">
              <ElTag :type="getStatusType(row.score)" effect="light" round>
                {{ formatPercent(row.score) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn
            :label="t('menus.hr.kpiManagement.table.actions')"
            width="152"
            fixed="right"
            align="center"
          >
            <template #default="{ row }">
              <div class="kpi-actions">
                <ElTooltip :content="t('menus.hr.kpiManagement.action.view')">
                  <ElButton circle text @click="handleView(row)">
                    <ElIcon><View /></ElIcon>
                  </ElButton>
                </ElTooltip>
                <ElTooltip :content="t('menus.hr.kpiManagement.action.edit')">
                  <ElButton circle text type="primary" @click="handleEdit(row)">
                    <ElIcon><EditPen /></ElIcon>
                  </ElButton>
                </ElTooltip>
                <ElTooltip :content="t('menus.hr.kpiManagement.action.delete')">
                  <ElButton
                    circle
                    text
                    type="danger"
                    :loading="deletingId === row.id"
                    @click="handleDelete(row)"
                  >
                    <ElIcon><Delete /></ElIcon>
                  </ElButton>
                </ElTooltip>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <div v-else class="kpi-empty-state">
        <ElIcon><Document /></ElIcon>
        <strong>{{ t("menus.hr.kpiManagement.empty.title") }}</strong>
        <p>{{ t("menus.hr.kpiManagement.empty.description") }}</p>
        <ElButton type="primary" @click="handleAdd">
          <ElIcon><Plus /></ElIcon>
          {{ t("menus.hr.kpiManagement.add") }}
        </ElButton>
      </div>

      <div v-if="filteredRows.length" class="kpi-pagination">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="filteredRows.length"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="min(720px, calc(100vw - 24px))"
      append-to-body
      destroy-on-close
      class="kpi-dialog"
      @closed="handleDialogClosed"
    >
      <ElForm
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        :disabled="isViewMode"
      >
        <div class="kpi-form-grid">
          <ElFormItem
            class="kpi-form-grid__full"
            :label="t('menus.hr.kpiManagement.form.employee')"
            prop="employeeProfileId"
          >
            <ElSelect
              v-model="form.employeeProfileId"
              filterable
              class="w-full"
              :placeholder="
                t('menus.hr.kpiManagement.form.employeePlaceholder')
              "
            >
              <ElOption
                v-for="employee in employees"
                :key="employee.id"
                :label="`${employee.fullName} · ${employee.jobTitle}`"
                :value="employee.id"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem
            class="kpi-form-grid__full"
            :label="t('menus.hr.kpiManagement.form.metric')"
            prop="metricName"
          >
            <ElInput
              v-model="form.metricName"
              maxlength="100"
              show-word-limit
              :placeholder="t('menus.hr.kpiManagement.form.metricPlaceholder')"
            />
          </ElFormItem>
          <ElFormItem
            :label="t('menus.hr.kpiManagement.form.periodStart')"
            prop="periodStart"
          >
            <ElDatePicker
              v-model="form.periodStart"
              type="date"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem
            :label="t('menus.hr.kpiManagement.form.periodEnd')"
            prop="periodEnd"
          >
            <ElDatePicker
              v-model="form.periodEnd"
              type="date"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem
            :label="t('menus.hr.kpiManagement.form.target')"
            prop="targetValue"
          >
            <ElInputNumber
              v-model="form.targetValue"
              :min="0"
              :precision="2"
              :controls="false"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem
            :label="t('menus.hr.kpiManagement.form.actual')"
            prop="actualValue"
          >
            <ElInputNumber
              v-model="form.actualValue"
              :min="0"
              :precision="2"
              :controls="false"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem
            class="kpi-form-grid__full"
            :label="t('menus.hr.kpiManagement.form.description')"
            prop="description"
          >
            <ElInput
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="2000"
              show-word-limit
              :placeholder="
                t('menus.hr.kpiManagement.form.descriptionPlaceholder')
              "
            />
          </ElFormItem>
        </div>
      </ElForm>
      <template #footer>
        <div class="kpi-dialog__footer">
          <ElButton @click="dialogVisible = false">
            {{
              isViewMode
                ? t("menus.hr.kpiManagement.action.close")
                : t("menus.hr.kpiManagement.action.cancel")
            }}
          </ElButton>
          <ElButton
            v-if="!isViewMode"
            type="primary"
            :loading="saving"
            @click="handleSubmit"
          >
            {{
              dialogMode === "create"
                ? t("menus.hr.kpiManagement.action.save")
                : t("menus.hr.kpiManagement.action.update")
            }}
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import {
  Aim,
  Calendar,
  CircleCheckFilled,
  DataAnalysis,
  Delete,
  Document,
  EditPen,
  Plus,
  Refresh,
  Search,
  TrendCharts,
  View,
  WarningFilled,
} from "@element-plus/icons-vue";
import type { FormInstance, FormRules, TagProps } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  EmployeeApi,
  type EmployeeResponse,
} from "@/api/operations/employee.api";
import {
  kpiApi,
  type KpiResponse,
  type KpiUpsertRequest,
} from "@/api/operations/kpi.api";

defineOptions({ name: "HRKPI" });

type DialogMode = "create" | "edit" | "view";
type KpiStatus = "" | "met" | "near" | "behind";

interface KpiFormModel {
  id?: number;
  employeeProfileId?: number;
  metricName: string;
  targetValue: number;
  actualValue: number;
  periodStart: string;
  periodEnd: string;
  description: string;
}

interface KpiFilters {
  keyword: string;
  employeeId?: number;
  status: KpiStatus;
  period: string[];
}

const { t } = useI18n();
const loading = ref(false);
const saving = ref(false);
const deletingId = ref<number>();
const loadError = ref("");
const rows = ref<KpiResponse[]>([]);
const employees = ref<EmployeeResponse[]>([]);
const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>("create");
const formRef = ref<FormInstance>();

const filters = reactive<KpiFilters>({
  keyword: "",
  employeeId: undefined,
  status: "",
  period: [],
});

const pagination = reactive({
  current: 1,
  size: 10,
});

const createEmptyForm = (): KpiFormModel => ({
  id: undefined,
  employeeProfileId: undefined,
  metricName: "",
  targetValue: 0,
  actualValue: 0,
  periodStart: "",
  periodEnd: "",
  description: "",
});

const form = reactive<KpiFormModel>(createEmptyForm());

const formRules = computed<FormRules<KpiFormModel>>(() => ({
  employeeProfileId: [
    {
      required: true,
      message: t("menus.hr.kpiManagement.validation.employee"),
      trigger: "change",
    },
  ],
  metricName: [
    {
      required: true,
      whitespace: true,
      message: t("menus.hr.kpiManagement.validation.metric"),
      trigger: "blur",
    },
  ],
  targetValue: [
    {
      validator: (_rule, value: number, callback) => {
        if (value <= 0) {
          callback(new Error(t("menus.hr.kpiManagement.validation.target")));
          return;
        }
        callback();
      },
      trigger: "change",
    },
  ],
  actualValue: [
    {
      validator: (_rule, value: number, callback) => {
        if (value < 0) {
          callback(new Error(t("menus.hr.kpiManagement.validation.actual")));
          return;
        }
        callback();
      },
      trigger: "change",
    },
  ],
  periodStart: [
    {
      required: true,
      message: t("menus.hr.kpiManagement.validation.periodStart"),
      trigger: "change",
    },
  ],
  periodEnd: [
    {
      required: true,
      message: t("menus.hr.kpiManagement.validation.periodEnd"),
      trigger: "change",
    },
    {
      validator: (_rule, value: string, callback) => {
        if (form.periodStart && value && value < form.periodStart) {
          callback(
            new Error(t("menus.hr.kpiManagement.validation.periodOrder")),
          );
          return;
        }
        callback();
      },
      trigger: "change",
    },
  ],
}));

const dialogTitle = computed(() => {
  const keyByMode: Record<DialogMode, string> = {
    create: "menus.hr.kpiManagement.form.createTitle",
    edit: "menus.hr.kpiManagement.form.editTitle",
    view: "menus.hr.kpiManagement.form.viewTitle",
  };
  return t(keyByMode[dialogMode.value]);
});

const isViewMode = computed(() => dialogMode.value === "view");

const getStatus = (score: number): Exclude<KpiStatus, ""> => {
  if (score >= 100) return "met";
  if (score >= 80) return "near";
  return "behind";
};

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLocaleLowerCase();
  const [filterStart, filterEnd] = filters.period;
  return rows.value.filter((row) => {
    const matchesKeyword =
      !keyword ||
      row.employeeName.toLocaleLowerCase().includes(keyword) ||
      row.kpiName.toLocaleLowerCase().includes(keyword);
    const matchesEmployee =
      !filters.employeeId || row.employeeId === filters.employeeId;
    const matchesStatus =
      !filters.status || getStatus(row.score) === filters.status;
    const rowStart = row.periodStart.slice(0, 10);
    const rowEnd = row.periodEnd.slice(0, 10);
    const matchesPeriod =
      !filterStart ||
      !filterEnd ||
      (rowStart <= filterEnd && rowEnd >= filterStart);
    return matchesKeyword && matchesEmployee && matchesStatus && matchesPeriod;
  });
});

const pagedRows = computed(() => {
  const offset = (pagination.current - 1) * pagination.size;
  return filteredRows.value.slice(offset, offset + pagination.size);
});

const summary = computed(() => {
  const records = filteredRows.value;
  const totalScore = records.reduce((total, row) => total + row.score, 0);
  return {
    total: records.length,
    met: records.filter((row) => row.score >= 100).length,
    near: records.filter((row) => row.score >= 80 && row.score < 100).length,
    average: records.length ? totalScore / records.length : 0,
  };
});

watch(
  () => [filteredRows.value.length, pagination.size] as const,
  ([total]) => {
    const lastPage = Math.max(1, Math.ceil(total / pagination.size));
    if (pagination.current > lastPage) pagination.current = lastPage;
  },
);

const resetPage = () => {
  pagination.current = 1;
};

const loadData = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    rows.value = await kpiApi.getAll();
  } catch {
    loadError.value = t("menus.hr.kpiManagement.message.loadError");
    ElMessage.error(loadError.value);
  } finally {
    loading.value = false;
  }
};

const loadEmployees = async () => {
  try {
    employees.value = await EmployeeApi.getList();
  } catch {
    ElMessage.error(t("menus.hr.kpiManagement.message.employeeLoadError"));
  }
};

const handleReset = () => {
  filters.keyword = "";
  filters.employeeId = undefined;
  filters.status = "";
  filters.period = [];
  resetPage();
};

const assignForm = (row?: KpiResponse) => {
  Object.assign(
    form,
    row
      ? {
          id: row.id,
          employeeProfileId: row.employeeId,
          metricName: row.kpiName,
          targetValue: row.targetValue,
          actualValue: row.actualValue,
          periodStart: row.periodStart.slice(0, 10),
          periodEnd: row.periodEnd.slice(0, 10),
          description: row.description ?? "",
        }
      : createEmptyForm(),
  );
};

const openDialog = (mode: DialogMode, row?: KpiResponse) => {
  dialogMode.value = mode;
  assignForm(row);
  dialogVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};

const resolveKpiRow = (value: unknown) => {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    typeof value.id !== "number"
  ) {
    return undefined;
  }
  return rows.value.find((row) => row.id === value.id);
};

const handleAdd = () => openDialog("create");
const handleEdit = (value: unknown) => {
  const row = resolveKpiRow(value);
  if (row) openDialog("edit", row);
};
const handleView = (value: unknown) => {
  const row = resolveKpiRow(value);
  if (row) openDialog("view", row);
};

const toRequest = (): KpiUpsertRequest => ({
  employeeProfileId: form.employeeProfileId!,
  metricName: form.metricName.trim(),
  targetValue: form.targetValue,
  actualValue: form.actualValue,
  periodStart: `${form.periodStart}T00:00:00`,
  periodEnd: `${form.periodEnd}T23:59:59`,
  description: form.description.trim() || null,
});

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate().catch(() => false);
  if (!isValid) return;
  saving.value = true;
  try {
    if (dialogMode.value === "create") {
      await kpiApi.create(toRequest());
      ElMessage.success(t("menus.hr.kpiManagement.message.created"));
    } else if (form.id) {
      await kpiApi.update(form.id, toRequest());
      ElMessage.success(t("menus.hr.kpiManagement.message.updated"));
    }
    dialogVisible.value = false;
    await loadData();
  } catch {
    ElMessage.error(t("menus.hr.kpiManagement.message.saveError"));
  } finally {
    saving.value = false;
  }
};

const handleDelete = async (value: unknown) => {
  const row = resolveKpiRow(value);
  if (!row) return;
  try {
    await ElMessageBox.confirm(
      t("menus.hr.kpiManagement.message.deleteConfirm", {
        name: row.kpiName,
        employee: row.employeeName,
      }),
      t("menus.hr.kpiManagement.message.deleteTitle"),
      {
        type: "warning",
        confirmButtonText: t("menus.hr.kpiManagement.action.delete"),
        cancelButtonText: t("menus.hr.kpiManagement.action.cancel"),
      },
    );
    deletingId.value = row.id;
    await kpiApi.delete(row.id);
    ElMessage.success(t("menus.hr.kpiManagement.message.deleted"));
    await loadData();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      ElMessage.error(t("menus.hr.kpiManagement.message.deleteError"));
    }
  } finally {
    deletingId.value = undefined;
  }
};

const handleDialogClosed = () => {
  assignForm();
  formRef.value?.clearValidate();
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(value);

const formatPercent = (value: number) =>
  `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)}%`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");

const getProgressPercentage = (score: number) =>
  Math.max(0, Math.min(100, Math.round(score)));

const getProgressColor = (score: number) => {
  if (score >= 100) return "#22a06b";
  if (score >= 80) return "#d9902f";
  return "#e84a4a";
};

const getStatusType = (score: number): TagProps["type"] => {
  if (score >= 100) return "success";
  if (score >= 80) return "warning";
  return "danger";
};

onMounted(async () => {
  await Promise.all([loadData(), loadEmployees()]);
});
</script>

<style scoped lang="scss">
.kpi-page {
  --kpi-accent: #e84a4a;
  --kpi-accent-soft: rgb(232 74 74 / 10%);

  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(12px, 2vw, 20px);
  color: var(--el-text-color-primary);
}

.kpi-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  overflow: hidden;
  background:
    radial-gradient(circle at 88% 0%, rgb(232 74 74 / 13%), transparent 35%),
    var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
}

.kpi-page__header-copy {
  min-width: 0;

  h1 {
    margin: 6px 0 4px;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 750;
    line-height: 1.2;
    letter-spacing: -0.025em;
  }

  p {
    max-width: 720px;
    margin: 0;
    font-size: 14px;
    line-height: 1.65;
    color: var(--el-text-color-secondary);
  }
}

.kpi-page__eyebrow {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--kpi-accent);
}

.kpi-page__header-actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.kpi-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-summary-card {
  display: flex;
  gap: 13px;
  align-items: center;
  min-height: 104px;
  padding: 17px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;

  > div:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 5px;
  }

  span {
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 26px;
    line-height: 1;
    color: var(--el-text-color-primary);
  }
}

.kpi-summary-card--featured {
  border-color: rgb(232 74 74 / 34%);
  box-shadow: 0 10px 32px rgb(232 74 74 / 9%);
}

.kpi-summary-card__icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  font-size: 20px;
  color: var(--kpi-accent);
  background: var(--kpi-accent-soft);
  border-radius: 12px;
}

.kpi-summary-card__icon--success {
  color: #168f61;
  background: rgb(34 160 107 / 11%);
}

.kpi-summary-card__icon--warning {
  color: #b76e12;
  background: rgb(217 144 47 / 12%);
}

.kpi-filter-card,
.kpi-table-card {
  border-radius: 14px;
}

.kpi-filter-card :deep(.el-card__body) {
  padding: 14px;
  background: var(--el-fill-color-lighter);
}

.kpi-filter-grid {
  display: grid;
  grid-template-columns:
    minmax(220px, 1.4fr) minmax(190px, 1fr) minmax(160px, 0.8fr)
    minmax(260px, 1.2fr) auto;
  gap: 10px;
  align-items: center;
}

.kpi-filter-card__reset {
  min-width: 88px;
}

.kpi-page__alert-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.kpi-table-card :deep(.el-card__body) {
  padding: 0;
}

.kpi-table-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
  }

  span {
    display: block;
    margin-top: 3px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.kpi-table-scroll {
  overflow-x: auto;
}

.kpi-table {
  min-width: 1120px;
}

.employee-cell,
.period-cell {
  display: flex;
  gap: 10px;
  align-items: center;
}

.employee-cell__avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  font-size: 12px;
  font-weight: 750;
  color: var(--kpi-accent);
  background: var(--kpi-accent-soft);
  border-radius: 11px;
}

.employee-cell > div,
.metric-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;

  strong {
    overflow: hidden;
    font-size: 13px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.period-cell {
  font-size: 12px;
  line-height: 1.55;
  color: var(--el-text-color-regular);

  .el-icon {
    color: var(--kpi-accent);
  }
}

.progress-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-cell__values {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: var(--el-text-color-secondary);

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    margin-left: 4px;
    color: var(--el-text-color-primary);
  }
}

.kpi-actions {
  display: flex;
  justify-content: center;
}

.kpi-empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 54px 20px;
  text-align: center;

  > .el-icon {
    margin-bottom: 12px;
    font-size: 34px;
    color: var(--kpi-accent);
  }

  strong {
    font-size: 15px;
  }

  p {
    max-width: 420px;
    margin: 6px 0 18px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }
}

.kpi-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 14px 18px;
  overflow-x: auto;
  border-top: 1px solid var(--el-border-color-lighter);
}

.kpi-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2px 16px;
}

.kpi-form-grid__full {
  grid-column: 1 / -1;
}

.kpi-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:global(html.dark) .kpi-page__header {
  background:
    radial-gradient(circle at 88% 0%, rgb(232 74 74 / 16%), transparent 36%),
    var(--el-bg-color);
}

:global(html.dark) .kpi-summary-card--featured {
  border-color: rgb(232 74 74 / 42%);
  box-shadow: 0 10px 34px rgb(0 0 0 / 18%);
}

@media (width <= 1199px) {
  .kpi-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kpi-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kpi-filter-card__reset {
    width: 100%;
  }
}

@media (width <= 767px) {
  .kpi-page {
    gap: 12px;
    padding: 10px;
  }

  .kpi-page__header {
    align-items: stretch;
    flex-direction: column;
    padding: 17px;
  }

  .kpi-page__header-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;

    .el-button {
      width: 100%;
      margin: 0;
    }
  }

  .kpi-summary-grid,
  .kpi-filter-grid,
  .kpi-form-grid {
    grid-template-columns: 1fr;
  }

  .kpi-summary-card {
    min-height: 88px;
    padding: 14px;
  }

  .kpi-form-grid__full {
    grid-column: auto;
  }

  .kpi-pagination {
    justify-content: flex-start;
  }
}
</style>
