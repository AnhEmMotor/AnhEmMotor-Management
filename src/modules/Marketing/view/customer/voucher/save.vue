<template>
  <div
    class="voucher-save-page flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#020617] overflow-hidden"
  >
    <!-- Header -->
    <div
      class="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
    >
      <div class="flex items-center gap-4">
        <button
          @click="goBack"
          class="size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 flex-cc transition-all border border-transparent dark:border-transparent text-gray-500"
        >
          <ArtSvgIcon icon="ri:arrow-left-s-line" class="text-2xl" />
        </button>
        <div>
          <h2
            class="m-0 text-base font-bold text-gray-800 dark:text-slate-100 tracking-tight uppercase"
          >
            {{ isEdit ? "CHỈNH SỬA VOUCHER" : "TẠO VOUCHER MỚI" }}
          </h2>
          <span
            class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none"
          >
            {{
              isEdit
                ? "Cập nhật thông tin khuyến mãi"
                : "Thiết lập chương trình mới"
            }}
          </span>
        </div>
      </div>
      <div class="flex gap-3">
        <ElButton @click="goBack">Hủy bỏ</ElButton>
        <ElButton type="primary" @click="handleSave">Lưu Voucher</ElButton>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <div class="max-w-7xl mx-auto flex flex-col gap-6">
        <!-- General Info -->
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6"
        >
          <h3
            class="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2"
          >
            <ArtSvgIcon
              icon="ri:information-line"
              class="text-blue-500 text-lg"
            />
            Thông tin chung
          </h3>
          <ElForm
            :model="form"
            label-position="top"
            class="grid grid-cols-2 gap-x-6 gap-y-2"
          >
            <ElFormItem label="Mã Voucher" class="is-required">
              <ElInput
                v-model="form.code"
                placeholder="VD: TET2027"
                class="uppercase-input"
                :disabled="isEdit"
              />
            </ElFormItem>
            <ElFormItem label="Tên chương trình" class="is-required">
              <ElInput
                v-model="form.name"
                placeholder="VD: Khuyến mãi Tết..."
              />
            </ElFormItem>
            <ElFormItem label="Phạm vi áp dụng" class="col-span-1">
              <ElRadioGroup v-model="form.applyFor" class="custom-radio-group">
                <ElRadioButton value="ALL">Cả Xe & Phụ tùng</ElRadioButton>
                <ElRadioButton value="VEHICLE">Chỉ Xe máy</ElRadioButton>
                <ElRadioButton value="PART">Chỉ Phụ tùng</ElRadioButton>
              </ElRadioGroup>
            </ElFormItem>
            <ElFormItem label="Kênh áp dụng" class="col-span-1">
              <ElRadioGroup v-model="form.channel" class="custom-radio-group">
                <ElRadioButton value="ALL">Tất cả</ElRadioButton>
                <ElRadioButton value="STORE">Cửa hàng</ElRadioButton>
                <ElRadioButton value="WEBSITE">Website</ElRadioButton>
              </ElRadioGroup>
            </ElFormItem>
            <ElFormItem
              label="Thời gian áp dụng"
              class="col-span-2 is-required"
            >
              <ElDatePicker
                v-model="dateRange"
                type="daterange"
                range-separator="Đến"
                start-placeholder="Ngày bắt đầu"
                end-placeholder="Ngày kết thúc"
                class="w-full"
                format="DD/MM/YYYY"
                value-format="YYYY-MM-DDTHH:mm:ss"
              />
            </ElFormItem>
          </ElForm>
        </div>

        <!-- Value Config -->
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6"
        >
          <h3
            class="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2"
          >
            <ArtSvgIcon
              icon="ri:money-dollar-circle-line"
              class="text-emerald-500 text-lg"
            />
            Cấu hình giá trị
          </h3>
          <ElForm
            :model="form"
            label-position="top"
            class="grid grid-cols-2 gap-x-6 gap-y-2"
          >
            <ElFormItem label="Loại giảm giá">
              <ElSelect v-model="form.discountType" class="w-full">
                <ElOption label="Giảm theo %" value="PERCENT" />
                <ElOption label="Giảm tiền mặt (VNĐ)" value="AMOUNT" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="Giá trị giảm" class="is-required">
              <ElInputNumber
                v-model="form.discountValue"
                :min="1"
                :max="form.discountType === 'PERCENT' ? 100 : 999999999"
                class="w-full"
                controls-position="right"
              />
            </ElFormItem>
            <ElFormItem
              v-if="form.discountType === 'PERCENT'"
              label="Giảm tối đa (VNĐ)"
              class="col-span-2"
            >
              <ElInputNumber
                v-model="form.maxDiscountAmount"
                :min="0"
                class="w-full"
                controls-position="right"
                placeholder="Để trống nếu không giới hạn"
              />
            </ElFormItem>
          </ElForm>
        </div>

        <!-- Audience Config -->
        <div
          class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 mb-10"
        >
          <h3
            class="text-sm font-bold text-gray-800 dark:text-slate-100 uppercase tracking-widest mb-6 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:group-line" class="text-purple-500 text-lg" />
            Đối tượng áp dụng
          </h3>
          <ElForm :model="form" label-position="top">
            <ElFormItem label="Loại Voucher">
              <ElRadioGroup
                v-model="form.type"
                class="custom-radio-group w-full"
              >
                <ElRadioButton value="PUBLIC" class="flex-1 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <ArtSvgIcon icon="ri:global-line" /> Công khai (Ai cũng dùng
                    được)
                  </div>
                </ElRadioButton>
                <ElRadioButton value="PRIVATE" class="flex-1 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <ArtSvgIcon icon="ri:user-star-line" /> Tri ân đặc biệt
                    (Dành cho KH cụ thể)
                  </div>
                </ElRadioButton>
              </ElRadioGroup>
            </ElFormItem>

            <div
              v-if="form.type === 'PRIVATE'"
              class="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 mt-4"
            >
              <label class="el-form-item__label block mb-2 font-bold text-xs"
                >Chỉ định khách hàng ({{ form.assignedCustomers.length }} đã
                chọn)</label
              >
              <ElSelect
                v-model="form.assignedCustomers"
                multiple
                filterable
                remote
                reserve-keyword
                placeholder="Nhập tên hoặc SĐT khách hàng để tìm..."
                :remote-method="searchLeads"
                :loading="loadingLeads"
                class="w-full"
              >
                <ElOption
                  v-for="lead in leadOptions"
                  :key="lead.id"
                  :label="lead.fullName + ' - ' + lead.phoneNumber"
                  :value="lead.id"
                >
                  <div class="flex justify-between items-center w-full">
                    <span class="font-bold">{{ lead.fullName }}</span>
                    <span class="text-gray-400 text-xs">{{
                      lead.phoneNumber
                    }}</span>
                  </div>
                </ElOption>
              </ElSelect>
            </div>
          </ElForm>
        </div>

        <!-- Bottom Actions -->
        <div
          class="flex justify-end gap-4 mb-10 border-t border-gray-100 dark:border-slate-800 pt-6"
        >
          <ElButton size="large" @click="goBack" class="w-32">Hủy bỏ</ElButton>
          <ElButton
            size="large"
            type="primary"
            @click="handleSave"
            class="w-48 shadow-md"
            >Lưu Voucher</ElButton
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  createVoucher,
  updateVoucher,
  getVoucherById,
} from "@/api/marketing/voucher.api";
import { fetchGetLeadList } from "@/api/customer/lead.api";

defineOptions({ name: "CustomerVoucherSave" });

const router = useRouter();
const route = useRoute();
const formRef = ref<FormInstance>();
const isEdit = ref(false);
const voucherId = ref<number | null>(null);
const dateRange = ref<[string, string] | null>(null);

const form = ref<any>({
  code: "",
  name: "",
  applyFor: "ALL",
  channel: "ALL",
  type: "PUBLIC",
  discountType: "PERCENT",
  discountValue: 0,
  maxDiscountAmount: undefined,
  assignedCustomers: [],
});

const leadOptions = ref<any[]>([]);
const loadingLeads = ref(false);

const goBack = () => {
  router.push("/Marketing/customer/voucher");
};

const searchLeads = async (query: string) => {
  loadingLeads.value = true;
  try {
    const res = await fetchGetLeadList({
      Filters: query ? `search=${query}` : "",
      PageSize: 20,
    });
    leadOptions.value = Array.isArray(res)
      ? res
      : (res as any).items || (res as any).records || [];
  } catch (error) {
    console.error("Failed to load leads", error);
  } finally {
    loadingLeads.value = false;
  }
};

const handleSave = async () => {
  if (
    !form.value.code ||
    !form.value.name ||
    !dateRange.value ||
    !dateRange.value[0] ||
    !dateRange.value[1]
  ) {
    ElMessage.warning("Vui lòng nhập đầy đủ Mã, Tên và Thời hạn áp dụng!");
    return;
  }

  const payload = {
    ...form.value,
    validFrom: new Date(dateRange.value[0]).toISOString(),
    validTo: new Date(dateRange.value[1]).toISOString(),
    // Convert ENUMS
    applyFor:
      form.value.applyFor === "ALL"
        ? 0
        : form.value.applyFor === "MOTORCYCLE"
          ? 1
          : 2,
    channel:
      form.value.channel === "ALL" ? 0 : form.value.channel === "STORE" ? 1 : 2,
    type: form.value.type === "PUBLIC" ? 0 : 1,
    discountType: form.value.discountType === "PERCENT" ? 0 : 1,
    assignedCustomerIds:
      form.value.type === "PRIVATE" ? form.value.assignedCustomers : [],
  };

  try {
    if (isEdit.value && voucherId.value) {
      await updateVoucher(voucherId.value, payload);
      ElMessage.success("Cập nhật voucher thành công!");
    } else {
      await createVoucher(payload);
      ElMessage.success("Tạo voucher mới thành công!");
    }
    goBack();
  } catch (error) {
    ElMessage.error("Có lỗi xảy ra, vui lòng thử lại!");
  }
};

onMounted(async () => {
  searchLeads("");
  const id = route.query.id;
  if (id) {
    isEdit.value = true;
    voucherId.value = Number(id);
    try {
      const res: any = await getVoucherById(voucherId.value);
      if (res.data) {
        form.value = {
          ...res.data,
          applyFor:
            res.data.applyFor === 0
              ? "ALL"
              : res.data.applyFor === 1
                ? "MOTORCYCLE"
                : "ACCESSORY",
          channel:
            res.data.channel === 0
              ? "ALL"
              : res.data.channel === 1
                ? "STORE"
                : "WEBSITE",
          type: res.data.type === 0 ? "PUBLIC" : "PRIVATE",
          discountType: res.data.discountType === 0 ? "PERCENT" : "FIXED",
          assignedCustomers: res.data.assignedCustomerIds || [],
        };
        if (res.data.validFrom && res.data.validTo) {
          dateRange.value = [res.data.validFrom, res.data.validTo];
        }
      }
    } catch (e) {
      ElMessage.error("Không thể lấy thông tin voucher");
    }
  }
});
</script>

<style lang="scss" scoped>
.voucher-save-page {
  .uppercase-input :deep(input) {
    text-transform: uppercase;
  }

  .custom-radio-group {
    :deep(.el-radio-button__inner) {
      border-radius: 8px !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: none !important;
      margin-right: 8px;
    }

    :deep(.el-radio-button:last-child .el-radio-button__inner) {
      margin-right: 0;
    }

    :deep(.el-radio-button.is-active .el-radio-button__inner) {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary) !important;
      color: white;
    }
  }
}
</style>
