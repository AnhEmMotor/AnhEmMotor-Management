<template>
  <div
    class="returns-detail-page p-6 flex flex-col gap-6 animate__animated animate__fadeIn"
  >
    <!-- Header: Nút back và Tiêu đề -->
    <div class="flex items-center gap-4">
      <ElButton :icon="Back" circle @click="goBack" />
      <h1
        class="m-0 text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none"
      >
        Chi tiết đơn hoàn RET-{{ String(route.params.id).padStart(3, "0") }}
      </h1>
    </div>

    <!-- Nội dung chính -->
    <div
      v-loading="loadingDetail"
      class="bg-white rounded-xl shadow-sm border border-color p-6"
      v-if="detail"
    >
      <div
        class="flex justify-between items-center mb-6 bg-fill-lighter p-5 rounded-xl border border-color"
      >
        <p class="text-secondary m-0 text-base">
          Đơn gốc:
          <span class="font-bold text-primary text-xl ml-2">{{
            detail.originalTrackingNumber
          }}</span>
        </p>
        <ElTag
          :type="getStatusTag(detail.status)"
          effect="dark"
          size="large"
          class="text-sm px-4"
        >
          {{ getStatusLabel(detail.status) }}
        </ElTag>
      </div>

      <div class="flex flex-col gap-6">
        <!-- LÝ DO -->
        <ElAlert
          :title="`Lý do hoàn: ${detail.reason}`"
          :type="getReasonAlertType(detail.reason)"
          :closable="false"
          show-icon
        />

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-lg border bg-fill-blank border-color"
        >
          <div class="flex flex-col">
            <span class="text-xs uppercase text-secondary"
              >Giá trị hoàn lại</span
            >
            <span class="font-bold text-red-500 text-lg mt-1">{{
              formatCurrency(detail.refundAmount || 0)
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs uppercase text-secondary"
              >Phí hoàn phát sinh</span
            >
            <span class="font-bold text-lg mt-1 text-primary-dark">{{
              formatCurrency(detail.returnShippingCost || 0)
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-xs uppercase text-secondary">Nhà vận chuyển</span>
            <div class="flex items-center gap-2 mt-1">
              <el-tag size="small" type="info" effect="plain">{{
                detail.carrier
              }}</el-tag>
              <span class="text-sm font-mono text-secondary">{{
                detail.trackingNumber
              }}</span>
            </div>
          </div>
        </div>

        <el-alert
          v-if="detail.carrierReturnNote"
          title="Ghi chú từ bưu tá"
          :description="detail.carrierReturnNote"
          type="warning"
          show-icon
          :closable="false"
        />

        <div>
          <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
            <ElIcon><Box /></ElIcon> Chi tiết kiện hàng
          </h3>
          <div class="border border-color rounded-lg overflow-hidden shadow-sm">
            <ElTable :data="detail.items" style="width: 100%" stripe>
              <ElTableColumn width="100" align="center">
                <template #default="{ row }">
                  <ElImage
                    :src="row.thumbnailUrl || '/placeholder.png'"
                    class="w-12 h-12 rounded"
                    fit="cover"
                  >
                    <template #error>
                      <div
                        class="w-12 h-12 bg-fill-lighter flex items-center justify-center text-secondary text-xs rounded"
                      >
                        <ElIcon><Picture /></ElIcon>
                      </div>
                    </template>
                  </ElImage>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="sku" label="Mã SKU" width="150" />
              <ElTableColumn
                prop="productName"
                label="Tên phụ tùng"
                min-width="250"
                show-overflow-tooltip
              />
              <ElTableColumn
                prop="quantity"
                label="Số lượng"
                width="100"
                align="center"
              />
            </ElTable>
          </div>
        </div>

        <div
          v-if="detail.status === 'pending'"
          class="bg-fill-lighter p-6 rounded-xl border border-color mt-4"
        >
          <h3
            class="text-lg font-bold mb-5 flex items-center gap-2 text-primary"
          >
            <ElIcon><Check /></ElIcon> Kiểm định thực tế tại kho
          </h3>

          <ElForm
            :model="inspectForm"
            label-position="top"
            :disabled="submitting"
            size="large"
          >
            <div class="grid grid-cols-2 gap-8">
              <ElFormItem label="Tình trạng vỏ hộp/bao bì">
                <ElRadioGroup v-model="inspectForm.boxCondition">
                  <ElRadio value="Còn nguyên vẹn">Còn nguyên vẹn</ElRadio>
                  <ElRadio value="Đã bóc tem">Đã bóc tem</ElRadio>
                  <ElRadio value="Rách nát">Rách nát</ElRadio>
                </ElRadioGroup>
              </ElFormItem>
              <ElFormItem label="Tình trạng phụ tùng">
                <ElRadioGroup v-model="inspectForm.productCondition">
                  <ElRadio value="Sử dụng tốt">Sử dụng tốt</ElRadio>
                  <ElRadio value="Trầy xước nhẹ">Trầy xước nhẹ</ElRadio>
                  <ElRadio value="Hư hỏng hoàn toàn">Hư hỏng hoàn toàn</ElRadio>
                </ElRadioGroup>
              </ElFormItem>
            </div>

            <!-- Financial Input Fields -->
            <div class="grid grid-cols-2 gap-8 mt-2">
              <ElFormItem label="Giá trị hoàn lại cho khách (VND)">
                <ElInputNumber
                  v-model="inspectForm.refundAmount"
                  :min="0"
                  placeholder="Ví dụ: 500,000"
                  class="w-full"
                  :controls="false"
                />
              </ElFormItem>
              <ElFormItem label="Chi phí chuyển hoàn phát sinh (VND)">
                <ElInputNumber
                  v-model="inspectForm.returnShippingCost"
                  :min="0"
                  placeholder="Ví dụ: 30,000"
                  class="w-full"
                  :controls="false"
                />
              </ElFormItem>
            </div>

            <ElFormItem label="Ảnh bằng chứng khui hộp" class="mt-2">
              <div class="flex items-center gap-4">
                <input
                  type="file"
                  ref="fileInput"
                  class="hidden"
                  accept="image/*"
                  @change="onFileChange"
                />
                <ElButton :icon="Camera" @click="handleUploadClick"
                  >Tải ảnh lên</ElButton
                >
                <span
                  v-if="inspectForm.returnProofImage"
                  class="text-success text-sm flex items-center gap-1 font-medium"
                >
                  <ElIcon><CircleCheck /></ElIcon> Đã tải lên ảnh bằng chứng
                </span>
              </div>
            </ElFormItem>

            <ElFormItem
              label="Ghi chú nội bộ (Lưu vết trách nhiệm)"
              class="mt-2"
            >
              <ElInput
                v-model="inspectForm.returnInternalNote"
                type="textarea"
                :rows="4"
                placeholder="Ghi rõ đánh giá của thủ kho, ví dụ: 'Hàng móp do vận chuyển Viettel Post'"
              />
            </ElFormItem>
          </ElForm>

          <div class="pt-6 mt-4 border-t border-color flex gap-3 justify-end">
            <ElButton
              type="primary"
              size="large"
              :loading="submitting"
              @click="submitInspection"
            >
              <ElIcon class="mr-1"><Check /></ElIcon> Chuyển Admin phê duyệt
            </ElButton>
          </div>
        </div>

        <div
          v-else-if="detail.status === 'inspecting'"
          class="pt-4 mt-2 flex justify-end"
        >
          <ElTag
            type="warning"
            size="large"
            effect="dark"
            class="px-6 py-2 h-auto text-base"
            >Đang chờ Admin phê duyệt</ElTag
          >
        </div>

        <div
          v-else
          class="bg-success-light-9 p-6 rounded-xl border border-success-light-5 mt-4"
        >
          <h3
            class="text-lg font-bold mb-5 flex items-center gap-2 text-success"
          >
            <ElIcon><SuccessFilled /></ElIcon> Đã hoàn tất xử lý
          </h3>
          <div class="grid grid-cols-2 gap-y-4 text-base">
            <div class="text-secondary">Quyết định:</div>
            <div class="font-bold text-primary">
              {{ getActionLabel(detail.returnAction) }}
            </div>

            <div class="text-secondary">Vỏ hộp:</div>
            <div class="font-medium">
              {{ detail.boxCondition || "Không có" }}
            </div>

            <div class="text-secondary">Sản phẩm:</div>
            <div class="font-medium">
              {{ detail.productCondition || "Không có" }}
            </div>

            <div class="text-secondary">Giá trị hoàn:</div>
            <div class="font-bold text-red-500">
              {{ formatCurrency(detail.refundAmount || 0) }}
            </div>

            <div class="text-secondary">Phí hoàn phát sinh:</div>
            <div class="font-bold text-primary-dark">
              {{ formatCurrency(detail.returnShippingCost || 0) }}
            </div>

            <div class="text-secondary">Ghi chú:</div>
            <div class="font-medium italic">
              {{ detail.returnInternalNote || "Không có" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Box,
  Picture,
  Check,
  Camera,
  CircleCheck,
  SuccessFilled,
  Back,
} from "@element-plus/icons-vue";
import { getReturnDetail, inspectReturn } from "@/api/logistics/returns";
import type {
  ReturnDetailDto,
  InspectReturnCommand,
} from "@/domain/logistics/returns.types";
import { FileApi } from "@/api/operations/file.api";

defineOptions({ name: "ReturnDetail" });

const route = useRoute();
const router = useRouter();

const detail = ref<ReturnDetailDto | null>(null);
const loadingDetail = ref(false);

const inspectForm = ref<InspectReturnCommand>({
  boxCondition: "",
  productCondition: "",
  returnProofImage: "",
  returnInternalNote: "",
  action: "",
  refundAmount: 0,
  returnShippingCost: 0,
});
const submitting = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchDetail(id);
  }
});

const fetchDetail = async (id: number) => {
  loadingDetail.value = true;
  try {
    const res = await getReturnDetail(id);
    detail.value = res as unknown as ReturnDetailDto;

    // Reset form
    inspectForm.value = {
      boxCondition: detail.value?.boxCondition || "Còn nguyên vẹn",
      productCondition: detail.value?.productCondition || "Sử dụng tốt",
      returnProofImage: detail.value?.returnProofImage || "",
      returnInternalNote: detail.value?.returnInternalNote || "",
      action: "",
      refundAmount:
        detail.value?.refundAmount !== undefined &&
        detail.value?.refundAmount > 0
          ? detail.value.refundAmount
          : detail.value?.codAmount || 0,
      returnShippingCost:
        detail.value?.returnShippingCost !== undefined &&
        detail.value?.returnShippingCost > 0
          ? detail.value.returnShippingCost
          : Math.round((detail.value?.shippingCost || 0) * 0.5),
    };
  } catch (_error) {
    ElMessage.error("Lỗi khi tải chi tiết hàng hoàn");
    goBack();
  } finally {
    loadingDetail.value = false;
  }
};

const goBack = () => {
  router.push({ name: "OrderLogisticsReturns" });
};

const handleUploadClick = () => {
  fileInput.value?.click();
};

const onFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    try {
      const res = await FileApi.uploadProductImage(file);
      const data = (res as any).data || res;
      inspectForm.value.returnProofImage = data.publicUrl;
      ElMessage.success("Tải ảnh bằng chứng thành công!");
    } catch (error) {
      console.error(error);
      ElMessage.error("Không thể tải ảnh lên hệ thống.");
    }
  }
};

const submitInspection = async () => {
  if (!detail.value) return;

  if (!inspectForm.value.boxCondition || !inspectForm.value.productCondition) {
    ElMessage.warning("Vui lòng nhập tình trạng hộp và phụ tùng");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `Xác nhận lưu thông tin kiểm định và chuyển Admin phê duyệt?`,
      "Xác nhận chuyển",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        type: "info",
      },
    );

    submitting.value = true;
    inspectForm.value.action = ""; // Admin se duyet sau

    await inspectReturn(detail.value.id, inspectForm.value);

    ElMessage.success(`Chuyển Admin phê duyệt thành công`);

    // Reload
    fetchDetail(detail.value.id);
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error("Có lỗi xảy ra khi xử lý");
    }
  } finally {
    submitting.value = false;
  }
};

const getReasonAlertType = (reason: string) => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "error";
};

const getStatusTag = (
  status: string | number,
): "danger" | "warning" | "success" | "info" => {
  const strStatus = String(status).toLowerCase();
  const map: Record<string, "danger" | "warning" | "success" | "info"> = {
    pending: "danger",
    "0": "danger",
    inspecting: "warning",
    "1": "warning",
    completed: "success",
    "2": "success",
  };
  return map[strStatus] || "info";
};

const getStatusLabel = (status: string | number) => {
  const strStatus = String(status).toLowerCase();
  const map: Record<string, string> = {
    pending: "Chờ kiểm tra",
    "0": "Chờ kiểm tra",
    inspecting: "Đang kiểm tra",
    "1": "Đang kiểm tra",
    completed: "Đã hoàn tất",
    "2": "Đã hoàn tất",
  };
  return map[strStatus] || String(status);
};

const getActionLabel = (action?: string) => {
  if (!action) return "Chưa xử lý";
  const map: Record<string, string> = {
    restock: "Nhập lại kho bán lẻ",
    defect: "Cách ly chờ hủy",
    refund: "Hoàn tiền cho khách",
  };
  return map[action] || action;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};
</script>

<style scoped lang="scss">
.border-color {
  border-color: var(--el-border-color-light);
}

.bg-fill-lighter {
  background-color: var(--el-fill-color-light);
}

.bg-fill-blank {
  background-color: var(--el-fill-color-blank);
}

.bg-success-light-9 {
  background-color: var(--el-color-success-light-9);
}

.border-success-light-5 {
  border-color: var(--el-color-success-light-5);
}

.text-primary {
  color: var(--el-color-primary);
}

.text-primary-dark {
  color: var(--el-text-color-primary);
}

.text-secondary {
  color: var(--el-text-color-regular);
}

.text-success {
  color: var(--el-color-success);
}

:deep(.el-radio) {
  margin-right: 20px;
}
</style>
