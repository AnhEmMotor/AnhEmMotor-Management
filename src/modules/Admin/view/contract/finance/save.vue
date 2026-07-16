<template>
  <div class="resp-page finance-save-page art-full-height flex flex-col gap-4 pb-5">
    <ReportPageHeader
      :title="
        isEdit ? 'CHỈNH SỬA HỢP ĐỒNG TÀI CHÍNH' : 'TẠO HỢP ĐỒNG TÀI CHÍNH MỚI'
      "
      :description="
        isEdit
          ? 'Cập nhật thông tin hồ sơ tài chính'
          : 'Nhập thông tin hồ sơ tài chính mới'
      "
      icon="ri:file-list-3-line"
    >
      <template #actions>
        <ElButton @click="goBack">Hủy bỏ</ElButton>
        <ElButton type="primary" :loading="saving" @click="handleSave">
          {{ isEdit ? "Cập nhật" : "Tạo hồ sơ" }}
        </ElButton>
      </template>
    </ReportPageHeader>

    <ElCard shadow="never" class="finance-form-card">
      <ElForm
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        label-width="160px"
      >
        <div class="resp-stats-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ElFormItem label="Số hợp đồng" prop="contractNumber">
            <ElInput
              v-model="form.contractNumber"
              placeholder="Nhập số hợp đồng"
              :disabled="isEdit"
            />
          </ElFormItem>

          <ElFormItem label="Mã đơn hàng" prop="salesOrderId">
            <ElInput
              v-model="form.salesOrderId"
              placeholder="Nhập mã đơn hàng"
            />
          </ElFormItem>

          <ElFormItem label="Đối tác tài chính" prop="partnerId">
            <ElInput v-model="form.partnerId" placeholder="Nhập ID đối tác" />
          </ElFormItem>

          <ElFormItem label="Số tiền gốc (VNĐ)" prop="principalAmount">
            <ElInputNumber
              v-model="form.principalAmount"
              :min="0"
              :step="1000000"
              class="w-full"
              placeholder="0"
            />
          </ElFormItem>

          <ElFormItem label="Kỳ hạn (tháng)" prop="termMonths">
            <ElInputNumber
              v-model="form.termMonths"
              :min="1"
              :max="120"
              class="w-full"
              placeholder="12"
            />
          </ElFormItem>

          <ElFormItem label="Lãi suất (%)" prop="interestRate">
            <ElInputNumber
              v-model="form.interestRate"
              :min="0"
              :step="0.1"
              :precision="2"
              class="w-full"
              placeholder="0"
            />
          </ElFormItem>

          <ElFormItem label="Trả góp/tháng (VNĐ)" prop="monthlyPaymentAmount">
            <ElInputNumber
              v-model="form.monthlyPaymentAmount"
              :min="0"
              :step="100000"
              class="w-full"
              placeholder="0"
            />
          </ElFormItem>

          <ElFormItem label="Ngày dự kiến giải ngân" prop="expectedDate">
            <ElDatePicker
              v-model="form.expectedDate"
              type="date"
              placeholder="Chọn ngày"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
        </div>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { type FormInstance, type FormRules } from "element-plus";
import ReportPageHeader from "@/modules/Accountant/view/reporting/ReportPageHeader.vue";
import { FinanceContractApi } from "@/api/finance";
import { Permissions } from "@/domain/constants/permissions";

const route = useRoute();
const router = useRouter();

const contractId = route.params.id as string | undefined;
const isEdit = !!contractId;

const formRef = ref<FormInstance>();
const saving = ref(false);

const form = reactive({
  contractNumber: "",
  salesOrderId: "",
  partnerId: "",
  principalAmount: 0,
  termMonths: 12,
  interestRate: 0,
  monthlyPaymentAmount: 0,
  expectedDate: "",
});

const rules: FormRules = {
  contractNumber: [
    { required: true, message: "Vui lòng nhập số hợp đồng", trigger: "blur" },
  ],
  salesOrderId: [
    { required: true, message: "Vui lòng nhập mã đơn hàng", trigger: "blur" },
  ],
  principalAmount: [
    { required: true, message: "Vui lòng nhập số tiền gốc", trigger: "blur" },
  ],
  termMonths: [
    { required: true, message: "Vui lòng nhập kỳ hạn", trigger: "blur" },
  ],
  expectedDate: [
    {
      required: true,
      message: "Vui lòng chọn ngày dự kiến giải ngân",
      trigger: "change",
    },
  ],
};

const loadDetail = async () => {
  if (!contractId) return;
  try {
    const data = await FinanceContractApi.getFinanceContractDetail(contractId);
    form.contractNumber = data.contractNumber;
    form.salesOrderId = data.salesOrderId;
    form.partnerId = data.financialPartner?.name ?? "";
    form.principalAmount = data.creditPackage?.principalAmount ?? 0;
    form.termMonths = data.creditPackage?.termMonths ?? 12;
    form.interestRate = data.creditPackage?.interestRateRange
      ? parseFloat(data.creditPackage.interestRateRange)
      : 0;
    form.monthlyPaymentAmount = data.creditPackage?.monthlyPaymentAmount ?? 0;
    form.expectedDate = data.disbursement?.expectedDate?.split("T")[0] ?? "";
  } catch {
    ElMessage.error("Không tải được thông tin hợp đồng");
  }
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    saving.value = true;
    try {
      if (isEdit && contractId) {
        await FinanceContractApi.updateFinanceContract(contractId, {
          salesOrderId: form.salesOrderId,
          contractNumber: form.contractNumber,
          partnerId: form.partnerId || undefined,
          principalAmount: form.principalAmount,
          termMonths: form.termMonths,
          interestRate: form.interestRate || undefined,
          monthlyPaymentAmount: form.monthlyPaymentAmount || undefined,
          expectedDate: form.expectedDate,
        });
        ElMessage.success("Cập nhật hợp đồng thành công");
      } else {
        await FinanceContractApi.createFinanceContract({
          salesOrderId: form.salesOrderId,
          contractNumber: form.contractNumber,
          partnerId: form.partnerId || undefined,
          principalAmount: form.principalAmount,
          termMonths: form.termMonths,
          interestRate: form.interestRate || undefined,
          monthlyPaymentAmount: form.monthlyPaymentAmount || undefined,
          expectedDate: form.expectedDate,
        });
        ElMessage.success("Tạo hợp đồng thành công");
      }
      goBack();
    } catch {
      ElMessage.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      saving.value = false;
    }
  });
};

const goBack = () => {
  router.push({ name: "FinanceContractPreview" });
};

onMounted(() => {
  if (isEdit) loadDetail();
});
</script>

<style scoped lang="scss">
.finance-form-card {
  max-width: 900px;
}
</style>
