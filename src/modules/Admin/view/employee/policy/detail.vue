<template>
  <div class="p-4">
    <el-card shadow="never" class="border-none">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <ElButton @click="goBack" circle size="small"
              ><ElIcon><Back /></ElIcon
            ></ElButton>
            <span
              class="font-bold uppercase text-gray-800 dark:text-gray-100 text-lg"
            >
              {{
                isCreating
                  ? "Tạo Chính Sách Mới"
                  : isEditing
                    ? "Chỉnh Sửa Chính Sách"
                    : "Chi Tiết Chính Sách"
              }}
            </span>
            <ElTag
              v-if="!isCreating"
              :type="getStatusType(editForm.status || '')"
              effect="dark"
              round
            >
              {{ getStatusLabel(editForm.status || "") }}
            </ElTag>
          </div>

          <div class="flex gap-2">
            <template v-if="!isEditing">
              <ElButton
                v-if="editForm.status === 'pending'"
                type="danger"
                plain
                @click="deletePolicy"
              >
                Xóa
              </ElButton>
              <ElButton
                v-if="editForm.status === 'expired'"
                plain
                @click="duplicatePolicy"
              >
                Nhân bản
              </ElButton>
              <ElButton
                v-if="editForm.status !== 'expired'"
                type="primary"
                @click="enableEdit"
              >
                Chỉnh sửa
              </ElButton>
            </template>
            <template v-else>
              <ElButton @click="cancelEdit">Hủy bỏ</ElButton>
              <ElButton type="success" @click="savePolicy">
                {{ isCreating ? "Kích hoạt" : "Lưu thay đổi" }}
              </ElButton>
            </template>
          </div>
        </div>
      </template>

      <div class="policy-detail-content max-w-5xl mx-auto">
        <ElAlert
          v-if="isEditing && editForm.status === 'active' && !isCreating"
          title="Lưu ý quan trọng: Chính sách đang có hiệu lực!"
          type="warning"
          description="Sự thay đổi sẽ chỉ áp dụng cho các đơn hàng phát sinh từ thời điểm bạn bấm Lưu. Các đơn cũ vẫn giữ nguyên mức hoa hồng cũ."
          show-icon
          class="mb-6"
          :closable="false"
        />

        <ElAlert
          v-if="!isEditing && editForm.status === 'expired'"
          title="Chính sách đã đóng (Hết hạn)"
          type="info"
          description="Chính sách này được lưu lại dưới dạng lịch sử (Read-only)."
          show-icon
          class="mb-6"
          :closable="false"
        />

        <div
          v-if="
            !isCreating &&
            (editForm.status === 'active' || editForm.status === 'expired')
          "
          class="mb-6"
        >
          <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <ElIcon><DataLine /></ElIcon> Thống kê hiệu suất
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 p-4 rounded border border-gray-200">
              <p class="text-gray-500 text-sm mb-1">Tổng chi hoa hồng</p>
              <p class="text-xl font-bold text-blue-600">24.500.000 đ</p>
            </div>
            <div class="bg-gray-50 p-4 rounded border border-gray-200">
              <p class="text-gray-500 text-sm mb-1">Số lượng bán (Xe)</p>
              <p class="text-xl font-bold text-green-600">45</p>
            </div>
            <div class="bg-gray-50 p-4 rounded border border-gray-200">
              <p class="text-gray-500 text-sm mb-1">Nhân viên xuất sắc nhất</p>
              <p class="text-xl font-bold text-purple-600">Nguyễn Văn A (12)</p>
            </div>
          </div>
        </div>

        <ElForm :model="editForm" label-position="top" :disabled="!isEditing">
          <ElCard shadow="never" class="mb-6 bg-gray-50/50">
            <template #header>
              <div class="font-bold flex items-center gap-2 text-gray-800">
                <span
                  class="bg-blue-100 text-blue-600 w-6 h-6 rounded flex items-center justify-center text-sm"
                  >1</span
                >
                Thông tin chung
              </div>
            </template>

            <ElFormItem v-if="isCreating" label="Tạo nhanh từ mẫu có sẵn">
              <ElSelect
                v-model="cloneFromId"
                placeholder="-- Chọn một chính sách cũ --"
                class="w-full"
                clearable
                @change="handleClonePolicy"
              >
                <ElOption
                  v-for="p in allPolicies"
                  :key="p.id"
                  :label="`${p.name} (${formatDate(p.startDate)} - ${formatDate(p.endDate)})`"
                  :value="p.id"
                />
              </ElSelect>
            </ElFormItem>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <ElFormItem label="Tên chính sách" class="md:col-span-2">
                <ElInput
                  v-model="editForm.name"
                  placeholder="Nhập tên chính sách..."
                />
              </ElFormItem>

              <ElFormItem label="Thời gian hiệu lực">
                <div class="flex items-center gap-2 w-full">
                  <ElDatePicker
                    v-model="editForm.startDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    format="DD/MM/YYYY"
                    placeholder="Bắt đầu"
                    class="!w-full"
                  />
                  <span class="text-gray-400 mx-2">-</span>
                  <ElDatePicker
                    v-model="editForm.endDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    format="DD/MM/YYYY"
                    placeholder="Kết thúc"
                    class="!w-full"
                  />
                </div>
              </ElFormItem>

              <ElFormItem label="Phân hệ áp dụng">
                <ElSelect
                  v-model="editForm.department"
                  class="w-full"
                  :disabled="!isCreating"
                >
                  <ElOption label="Sale Xe máy" value="vehicle_sales" />
                  <ElOption
                    label="Sale Phụ tùng / Online"
                    value="parts_sales"
                  />
                  <ElOption label="Kỹ thuật viên" value="mechanic" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem
                label="Đối tượng cụ thể (Ghi chú)"
                class="md:col-span-2"
              >
                <ElInput
                  v-model="editForm.target"
                  placeholder="Ví dụ: Chỉ áp dụng cho thử việc..."
                />
              </ElFormItem>
            </div>
            <div class="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <ElIcon><InfoFilled /></ElIcon> Điều kiện ghi nhận: Hóa đơn xe đã
              thanh toán 100% hoặc Xe đã bàn giao.
            </div>
          </ElCard>

          <ElCard shadow="never" class="mb-6 bg-gray-50/50">
            <template #header>
              <div class="font-bold flex items-center gap-2 text-gray-800">
                <span
                  class="bg-blue-100 text-blue-600 w-6 h-6 rounded flex items-center justify-center text-sm"
                  >2</span
                >
                Cấu hình công thức thưởng
              </div>
            </template>

            <div v-if="editForm.department === 'vehicle_sales'">
              <ElSwitch
                v-model="enableTiers"
                active-text="Bật cấu hình hoa hồng Bậc Thang (Lũy tiến)"
                class="mb-4"
              />

              <div v-if="enableTiers" class="space-y-2">
                <div
                  v-for="(tier, index) in editForm.tiers"
                  :key="index"
                  class="flex items-end gap-4 p-3 bg-white border border-gray-200 rounded"
                >
                  <ElFormItem label="Bán từ (xe)" class="!mb-0 flex-1">
                    <ElInputNumber
                      v-model="tier.from"
                      :min="1"
                      class="!w-full"
                      controls-position="right"
                    />
                  </ElFormItem>
                  <ElFormItem label="Đến (xe)" class="!mb-0 flex-1">
                    <ElInputNumber
                      v-model="tier.to"
                      :min="1"
                      class="!w-full"
                      controls-position="right"
                      placeholder="Tối đa"
                    />
                  </ElFormItem>
                  <ElFormItem label="Mức thưởng (VNĐ/xe)" class="!mb-0 flex-1">
                    <ElInput v-model="tier.bonus" type="number" />
                  </ElFormItem>
                  <ElButton
                    v-if="isEditing"
                    type="danger"
                    :icon="Delete"
                    plain
                    @click="removeTier(index)"
                  />
                </div>
                <ElButton
                  v-if="isEditing"
                  plain
                  type="primary"
                  class="w-full mt-2 border-dashed"
                  @click="addTier"
                >
                  <ElIcon><Plus /></ElIcon> Thêm mốc mới
                </ElButton>
              </div>
            </div>

            <div v-else-if="editForm.department === 'parts_sales'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ElFormItem label="Điều kiện tính">
                  <ElRadioGroup v-model="editForm.basis">
                    <ElRadio value="revenue">Trên Doanh thu</ElRadio>
                    <ElRadio value="profit">Trên Lợi nhuận gộp</ElRadio>
                  </ElRadioGroup>
                </ElFormItem>
                <ElFormItem label="Tỷ lệ hoa hồng (%)">
                  <ElInputNumber
                    v-model="editForm.percentage"
                    :min="0"
                    :max="100"
                    class="!w-full"
                    controls-position="right"
                  />
                </ElFormItem>
              </div>
            </div>

            <div v-else-if="editForm.department === 'mechanic'">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ElFormItem label="Trích từ Tiền công (%)">
                  <ElInputNumber
                    v-model="editForm.laborPercentage"
                    :min="0"
                    :max="100"
                    class="!w-full"
                    controls-position="right"
                  />
                </ElFormItem>
                <ElFormItem label="Trích từ Phụ tùng (%)">
                  <ElInputNumber
                    v-model="editForm.partsPercentage"
                    :min="0"
                    :max="100"
                    class="!w-full"
                    controls-position="right"
                  />
                </ElFormItem>
              </div>
            </div>
          </ElCard>
        </ElForm>

        <!-- STEP 3: Simulator -->
        <ElCard shadow="never" class="mb-6 bg-blue-50/50 border-blue-100">
          <template #header>
            <div class="font-bold flex items-center gap-2 text-blue-800">
              <span
                class="bg-blue-600 text-white w-6 h-6 rounded flex items-center justify-center text-sm"
                >3</span
              >
              Simulator: Giả lập dòng tiền
            </div>
          </template>

          <div class="flex flex-col md:flex-row items-end gap-4">
            <div
              class="flex-1 w-full"
              v-if="editForm.department === 'vehicle_sales'"
            >
              <label class="block text-sm text-gray-700 mb-2"
                >Số lượng xe bán được</label
              >
              <ElInputNumber
                v-model="simInput"
                :min="0"
                class="!w-full"
                controls-position="right"
              />
            </div>
            <div
              class="flex-1 w-full"
              v-else-if="editForm.department === 'parts_sales'"
            >
              <label class="block text-sm text-gray-700 mb-2"
                >Giá trị (VNĐ)</label
              >
              <ElInput v-model="simInputVal" type="number" />
            </div>
            <div
              class="flex-1 w-full grid grid-cols-2 gap-4"
              v-else-if="editForm.department === 'mechanic'"
            >
              <div>
                <label class="block text-sm text-gray-700 mb-2"
                  >Tiền công (VNĐ)</label
                >
                <ElInput v-model="simLabor" type="number" />
              </div>
              <div>
                <label class="block text-sm text-gray-700 mb-2"
                  >Phụ tùng (VNĐ)</label
                >
                <ElInput v-model="simParts" type="number" />
              </div>
            </div>

            <ElButton type="primary" @click="runSimulation" class="px-6"
              >Tính toán</ElButton
            >
          </div>

          <div
            v-if="simResult !== null"
            class="mt-4 p-4 bg-white border border-blue-200 rounded"
          >
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Hoa hồng dự kiến:</span>
              <span class="text-2xl font-bold text-green-600">{{
                formatCurrency(simResult)
              }}</span>
            </div>
            <div
              v-if="simBreakdown"
              class="mt-2 text-sm text-gray-500 border-t border-gray-100 pt-2"
            >
              Diễn giải: {{ simBreakdown }}
            </div>
          </div>
        </ElCard>

        <!-- Audit Log -->
        <div class="text-center text-xs text-gray-400 mt-8">
          <p>Tạo bởi: Admin Bình (01/06/2026 14:30)</p>
          <p>Cập nhật cuối: Kế toán trưởng An (15/06/2026 18:00)</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Delete,
  Back,
  CopyDocument,
  Document,
  User,
  Aim,
  Money,
  DataLine,
  InfoFilled,
} from "@element-plus/icons-vue";

defineOptions({ name: "HRCommissionPolicyDetail" });

const route = useRoute();
const router = useRouter();

const isCreating = ref(false);
const isEditing = ref(false);
const enableTiers = ref(true);
const cloneFromId = ref<number | null>(null);

const editForm = ref<{
  id?: number;
  name?: string;
  department?: string;
  status?: string;
  target?: string;
  startDate?: string;
  endDate?: string;
  basis?: string;
  percentage?: number;
  laborPercentage?: number;
  partsPercentage?: number;
  tiers?: any[];
  [key: string]: any;
}>({});

// Mock Data local
const allPolicies = ref([
  {
    id: 1,
    name: "Thưởng nóng Winner X - T6/2026",
    department: "vehicle_sales",
    status: "active",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    target: "Toàn bộ Sale xe",
    tiers: [
      { from: 1, to: 5, bonus: 500000 },
      { from: 6, to: 999, bonus: 900000 },
    ],
  },
  {
    id: 2,
    name: "Cơ bản dòng xe Honda SH",
    department: "vehicle_sales",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "Toàn bộ Sale xe",
    tiers: [{ from: 1, to: 999, bonus: 1200000 }],
  },
  {
    id: 3,
    name: "Chiến dịch xe ga mùa Hè",
    department: "vehicle_sales",
    status: "pending",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    target: "Toàn bộ Sale xe",
    tiers: [
      { from: 1, to: 3, bonus: 300000 },
      { from: 4, to: 999, bonus: 600000 },
    ],
  },
  {
    id: 4,
    name: "Chính sách tháng Tết 2026",
    department: "vehicle_sales",
    status: "expired",
    startDate: "2026-01-01",
    endDate: "2026-02-28",
    target: "Toàn bộ Sale xe",
    tiers: [{ from: 1, to: 999, bonus: 1000000 }],
  },
  {
    id: 5,
    name: "Hoa hồng phụ tùng chung",
    department: "parts_sales",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "Sale Phụ tùng / Online",
    percentage: 5,
    basis: "revenue",
  },
  {
    id: 6,
    name: "Hoa hồng kỹ thuật viên",
    department: "mechanic",
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    target: "Kỹ thuật viên xưởng",
    laborPercentage: 15,
    partsPercentage: 2,
  },
]);

// Simulator state
const simInput = ref(0);
const simInputVal = ref("");
const simLabor = ref("");
const simParts = ref("");
const simResult = ref<number | null>(null);
const simBreakdown = ref<string>("");

const formatDate = (dateStr: string) => {
  if (!dateStr) return "---";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

const goBack = () => {
  router.push({ name: "HRCommissionPolicy" });
};

onMounted(() => {
  const policyId = route.params.id;
  const dept = route.query.dept as string;

  if (!policyId) {
    isCreating.value = true;
    isEditing.value = true;
    editForm.value = {
      department: dept || "vehicle_sales",
      status: "pending",
      tiers: [
        { from: 1, to: 5, bonus: 500000 },
        { from: 6, to: 999, bonus: 900000 },
      ],
      percentage: 0,
      laborPercentage: 0,
      partsPercentage: 0,
      basis: "revenue",
    };
    enableTiers.value = true;
  } else {
    const policy = allPolicies.value.find((p) => p.id === Number(policyId));
    if (policy) {
      editForm.value = JSON.parse(JSON.stringify(policy));
      enableTiers.value = !!(
        editForm.value.tiers && editForm.value.tiers.length > 0
      );
    } else {
      ElMessage.error("Không tìm thấy chính sách");
      goBack();
    }
  }
});

const handleClonePolicy = (id: number) => {
  if (!id) return;
  const policyToClone = allPolicies.value.find((p) => p.id === id);
  if (policyToClone) {
    editForm.value = {
      ...JSON.parse(JSON.stringify(policyToClone)),
      id: undefined,
      name: policyToClone.name + " (Bản sao)",
      status: "pending",
    };
    enableTiers.value = !!(
      editForm.value.tiers && editForm.value.tiers.length > 0
    );
    ElMessage.success("Đã nạp dữ liệu từ mẫu cũ!");
  }
};

const enableEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  if (isCreating.value) {
    goBack();
  } else {
    const original = allPolicies.value.find((p) => p.id === editForm.value.id);
    if (original) {
      editForm.value = JSON.parse(JSON.stringify(original));
      enableTiers.value = !!(original.tiers && original.tiers.length > 0);
    }
    isEditing.value = false;
  }
};

const savePolicy = () => {
  ElMessage.success(
    isCreating.value
      ? "Kích hoạt chính sách mới thành công!"
      : "Lưu thay đổi thành công!",
  );
  goBack();
};

const deletePolicy = () => {
  ElMessageBox.confirm("Xóa chính sách này?", "Xác nhận", { type: "error" })
    .then(() => {
      ElMessage.success("Đã xóa chính sách!");
      goBack();
    })
    .catch(() => {});
};

const duplicatePolicy = () => {
  const cloned = {
    ...JSON.parse(JSON.stringify(editForm.value)),
    id: undefined,
    name: editForm.value.name + " (Bản sao)",
    status: "pending",
  };
  editForm.value = cloned;
  isEditing.value = true;
  isCreating.value = true;
  ElMessage.success("Đã nhân bản thành bản nháp mới!");
};

// Tier logic
const addTier = () => {
  if (!editForm.value.tiers) editForm.value.tiers = [];
  editForm.value.tiers.push({ from: 1, to: 999, bonus: 0 });
};

const removeTier = (index: number) => {
  if (editForm.value.tiers) {
    editForm.value.tiers.splice(index, 1);
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "active":
      return "🟢 ĐANG ÁP DỤNG";
    case "pending":
      return "🟡 CHỜ KÍCH HOẠT";
    case "expired":
      return "⚪ HẾT HIỆU LỰC";
    default:
      return status;
  }
};

const getStatusType = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "expired":
      return "info";
    default:
      return "info";
  }
};

const getStatusRibbonClass = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200 border";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 border";
    case "expired":
      return "bg-slate-200 text-slate-700 border-slate-300 border";
    default:
      return "bg-slate-200 text-slate-700";
  }
};

// Simulator Logic
const runSimulation = () => {
  const dataToUse = editForm.value;
  simBreakdown.value = "";

  if (dataToUse.department === "vehicle_sales") {
    const qty = Number(simInput.value) || 0;
    let totalBonus = 0;

    if (enableTiers.value && dataToUse.tiers && dataToUse.tiers.length > 0) {
      // Sort tiers to be safe
      const sortedTiers = [...dataToUse.tiers].sort((a, b) => a.from - b.from);
      let remainingQty = qty;
      let breakdownTexts: string[] = [];

      for (let i = 0; i < sortedTiers.length; i++) {
        const tier = sortedTiers[i];
        if (remainingQty <= 0) break;

        // Calculate max items in this tier
        const tierMax = tier.to ? tier.to - tier.from + 1 : 99999;
        const itemsInTier = Math.min(remainingQty, tierMax);

        if (itemsInTier > 0) {
          const tierTotal = itemsInTier * Number(tier.bonus);
          totalBonus += tierTotal;
          breakdownTexts.push(
            `${itemsInTier} xe mốc ${i + 1} (${formatCurrency(tierTotal)})`,
          );
          remainingQty -= itemsInTier;
        }
      }

      simBreakdown.value =
        `Bán ${qty} xe: ` +
        breakdownTexts.join(" + ") +
        ` = Tổng ${formatCurrency(totalBonus)}`;
    }

    simResult.value = totalBonus;
  } else if (dataToUse.department === "parts_sales") {
    const amount = Number(simInputVal.value) || 0;
    const pct = Number(dataToUse.percentage) || 0;
    simResult.value = amount * (pct / 100);
  } else if (dataToUse.department === "mechanic") {
    const labor = Number(simLabor.value) || 0;
    const parts = Number(simParts.value) || 0;
    const lPct = Number(dataToUse.laborPercentage) || 0;
    const pPct = Number(dataToUse.partsPercentage) || 0;
    simResult.value = labor * (lPct / 100) + parts * (pPct / 100);
  }
};
</script>

<style scoped lang="scss">
.policy-detail-page {
  // Styles for the new page
}

.simulator-input :deep(.el-input__wrapper),
.simulator-input :deep(.el-input-number__increase),
.simulator-input :deep(.el-input-number__decrease) {
  background-color: rgb(255 255 255 / 90%) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%) !important;
}

/* Make disabled inputs look elegant and readable */
:deep(.el-form--disabled .el-input__wrapper),
:deep(.el-form--disabled .el-select__wrapper) {
  background-color: #f8fafc !important;
  box-shadow: none !important;
  border: 1px solid #e2e8f0 !important;
}

:deep(.el-form--disabled .el-input__inner),
:deep(.el-form--disabled .el-select__selected-item) {
  color: #334155 !important;
  font-weight: 600;
  -webkit-text-fill-color: #334155 !important;
}

:deep(
  .el-form--disabled .el-radio__input.is-disabled.is-checked .el-radio__inner
) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

:deep(.el-form--disabled .el-radio__input.is-disabled + span.el-radio__label) {
  color: #334155 !important;
  font-weight: 500;
}

:deep(.el-form--disabled .el-switch.is-disabled) {
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}
</style>
