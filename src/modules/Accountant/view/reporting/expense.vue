<template>
  <div class="resp-page expense-management">
    <div
      class="reporting-actions resp-search mb-4 flex items-center justify-between flex-wrap gap-3"
    >
      <ElInput
        v-model="searchInput"
        placeholder="Tìm kiếm tên khoản chi..."
        clearable
        style="width: 300px"
        @clear="onSearch"
        @keyup.enter="onSearch"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>
      <ElButton type="primary" @click="openCreateForm">
        <ElIcon><Plus /></ElIcon>
        Thêm khoản chi
      </ElButton>
    </div>

    <ElTable
      :data="tableExpenses"
      class="reporting-table resp-table"
      v-loading="props.loading"
      empty-text="Không có dữ liệu chi phí"
    >
      <ElTableColumn prop="expenseDate" label="Ngày ghi nhận" min-width="140" />
      <ElTableColumn prop="name" label="Tên khoản chi" min-width="220" />
      <ElTableColumn prop="category" label="Phân loại" min-width="150">
        <template #default="{ row }">
          <ElTag
            :type="row.category === 0 ? 'danger' : 'warning'"
            effect="light"
            round
          >
            {{ row.category === 0 ? "Chi phí cố định" : "Chi phí biến đổi" }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="amount"
        label="Số tiền (VNĐ)"
        min-width="150"
        align="right"
      >
        <template #default="{ row }">{{ formatCurrency(row.amount) }}</template>
      </ElTableColumn>
      <ElTableColumn prop="note" label="Ghi chú" min-width="220" />
      <ElTableColumn label="Hành động" width="120" align="center">
        <template #default="{ row }">
          <ElButton type="primary" link @click="editExpense(row as Expense)"
            >Sửa</ElButton
          >
          <ElButton
            type="danger"
            link
            @click="deleteExpense((row as Expense).id)"
            >Xóa</ElButton
          >
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="flex justify-end mt-4">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchExpenses"
        @current-change="fetchExpenses"
      />
    </div>

    <ElDialog
      v-if="isFormVisible"
      v-model="isFormVisible"
      :title="dialogTitle"
      width="520px"
      class="reporting-dialog resp-dialog"
      destroy-on-close
      align-center
    >
      <ExpenseForm
        :mode="formMode"
        :expense-id="editingId"
        :initial-data="editingData"
        @close="closeForm"
        @submit="handleFormSubmit"
      />
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { ElMessageBox } from "element-plus";
import { Search, Plus } from "@element-plus/icons-vue";
import { AnalyticsService } from "@/services/analytics.service";
import type { Expense } from "@/services/analytics.types";
import ExpenseForm from "./expense-form.vue";

type ExpenseFormData = {
  name: string;
  category: number;
  amount: number;
  expenseDate: string;
  note?: string;
};

const props = withDefaults(
  defineProps<{
    expenses?: Expense[];
    loading?: boolean;
    totalCount?: number;
  }>(),
  { loading: false, totalCount: 0 },
);

const emit = defineEmits<{
  add: [];
  edit: [expense: Expense];
  delete: [id: number];
  search: [keyword: string];
  refresh: [];
}>();

const searchInput = ref("");
const currentPage = ref(1);
const pageSize = ref(20);
const localTotalCount = ref(0);

const localExpenses = ref<Expense[]>([]);
const isFormVisible = ref(false);
const formMode = ref<"create" | "edit">("create");
const editingId = ref<number | undefined>(undefined);
const editingData = ref<Partial<Expense>>({});

const isControlled = computed(() => props.expenses !== undefined);

const tableExpenses = computed(() => props.expenses ?? localExpenses.value);

const paginatedTotal = computed(
  () => props.totalCount || localTotalCount.value,
);

const dialogTitle = computed(() =>
  formMode.value === "edit" ? "Cập nhật khoản chi" : "Ghi nhận khoản chi",
);

function isControlledMode() {
  return props.expenses !== undefined;
}

function buildFilters(keyword?: string): string | undefined {
  if (!keyword || keyword.trim() === "") return undefined;
  return `Name@=${keyword.trim()}`;
}

async function fetchExpenses() {
  if (isControlledMode()) return;
  const keyword = searchInput.value;
  try {
    const result = await AnalyticsService.getExpenses({
      page: currentPage.value,
      pageSize: pageSize.value,
      filters: buildFilters(keyword),
      sorts: "ExpenseDate desc",
    });
    localExpenses.value = result.items;
    localTotalCount.value = result.totalCount;
  } catch {
    localExpenses.value = [];
  }
}

function onSearch() {
  currentPage.value = 1;
  fetchExpenses();
}

function openCreateForm() {
  if (isControlledMode()) {
    emit("add");
    return;
  }
  formMode.value = "create";
  editingId.value = undefined;
  editingData.value = {};
  isFormVisible.value = true;
}

function editExpense(row: Expense) {
  if (isControlledMode()) {
    emit("edit", row);
    return;
  }
  formMode.value = "edit";
  editingId.value = row.id;
  editingData.value = {
    name: row.name,
    category: row.category,
    amount: row.amount,
    expenseDate: row.expenseDate,
    note: row.note,
  };
  isFormVisible.value = true;
}

function closeForm() {
  isFormVisible.value = false;
  editingId.value = undefined;
  editingData.value = {};
}

async function handleFormSubmit(
  formData: ExpenseFormData & { editId?: number },
) {
  try {
    if (formData.editId) {
      await AnalyticsService.updateExpense(formData.editId, formData);
    } else {
      await AnalyticsService.createExpense(formData);
    }
    await fetchExpenses();
    closeForm();
  } catch {
    ElMessage.error("Không thể lưu khoản chi. Vui lòng thử lại.");
  }
}

async function deleteExpense(id: number) {
  if (isControlledMode()) {
    emit("delete", id);
    return;
  }
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc chắn muốn xóa khoản chi này?",
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
  } catch {
    return;
  }
  await AnalyticsService.deleteExpense(id);
  await fetchExpenses();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

onMounted(fetchExpenses);
</script>
