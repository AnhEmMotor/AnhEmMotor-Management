<template>
  <div class="h-full flex gap-4 reverse-logistics-container">
    <!-- CỘT TRÁI (30%): DANH SÁCH ĐƠN CHỜ HOÀN -->
    <div class="w-1/3 flex flex-col gap-4 h-full">
      <ElCard
        class="flex-1 overflow-hidden flex flex-col art-card-list"
        body-class="p-0 flex flex-col h-full"
      >
        <!-- Header -->
        <div class="p-4 border-b border-color flex flex-col gap-3 shrink-0">
          <div class="flex justify-between items-center">
            <h3 class="m-0 font-medium text-lg flex items-center gap-2">
              <ElIcon><List /></ElIcon> Đơn chờ hoàn
            </h3>
            <ElTag
              type="danger"
              effect="dark"
              round
              v-if="returnsList.length > 0"
              >{{ returnsList.length }}</ElTag
            >
          </div>

          <ElInput
            v-model="searchQuery"
            placeholder="Tìm mã đơn..."
            clearable
            :prefix-icon="Search"
          />

          <ElRadioGroup
            v-model="statusFilter"
            @change="fetchReturns"
            size="small"
            class="w-full"
          >
            <ElRadioButton label="">Tất cả</ElRadioButton>
            <ElRadioButton label="pending">Chờ xử lý</ElRadioButton>
            <ElRadioButton label="inspecting">Đang kiểm tra</ElRadioButton>
            <ElRadioButton label="completed">Đã xong</ElRadioButton>
          </ElRadioGroup>
        </div>

        <!-- List -->
        <div class="flex-1 overflow-y-auto p-2" v-loading="loadingList">
          <ElEmpty
            v-if="filteredReturns.length === 0"
            description="Không có đơn hàng hoàn nào"
            :image-size="80"
          />

          <div
            v-for="item in filteredReturns"
            :key="item.id"
            class="return-card cursor-pointer p-3 rounded-md border mb-2 transition-all"
            :class="[
              selectedId === item.id
                ? 'border-primary bg-primary-light-9'
                : 'border-color hover:border-primary-light-5 hover:bg-fill-lighter',
            ]"
            @click="handleSelect(item.id)"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-bold text-base text-primary">{{
                item.originalTrackingNumber
              }}</span>
              <ElTag
                :type="getCarrierTag(item.carrier)"
                size="small"
                effect="plain"
                >{{ item.carrier }}</ElTag
              >
            </div>

            <div class="text-sm text-regular mb-2 flex items-center gap-2">
              <ElIcon><User /></ElIcon> {{ item.customerName }}
            </div>

            <div class="flex justify-between items-end">
              <ElTag
                :type="getReasonTag(item.reason)"
                size="small"
                class="max-w-[150px] truncate"
                :title="item.reason"
              >
                {{ item.reason }}
              </ElTag>
              <ElTag
                :type="getStatusTag(item.status)"
                size="small"
                effect="dark"
                >{{ getStatusLabel(item.status) }}</ElTag
              >
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <!-- CỘT PHẢI (70%): PANEL KHUI HỘP & QUYẾT ĐỊNH XỬ LÝ -->
    <div class="w-2/3 h-full">
      <ElCard
        v-if="selectedId && detail"
        class="h-full flex flex-col"
        body-class="p-0 flex flex-col h-full overflow-hidden"
        v-loading="loadingDetail"
      >
        <!-- Detail Header -->
        <div class="p-4 border-b border-color bg-fill-lighter shrink-0">
          <div class="flex justify-between items-center mb-2">
            <h2 class="m-0 text-xl font-bold">
              Đơn hoàn RET-{{ detail.id.toString().padStart(3, "0") }}
            </h2>
            <ElTag
              :type="getStatusTag(detail.status)"
              effect="dark"
              size="large"
              >{{ getStatusLabel(detail.status) }}</ElTag
            >
          </div>
          <p class="text-secondary m-0">
            Đơn gốc:
            <span class="font-medium text-primary">{{
              detail.originalTrackingNumber
            }}</span>
          </p>
        </div>

        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <!-- LÝ DO -->
          <ElAlert
            :title="`Lý do: ${detail.reason}`"
            :type="getReasonAlertType(detail.reason)"
            :closable="false"
            show-icon
          />

          <!-- THÔNG TIN PHỤ TÙNG -->
          <div>
            <h3 class="text-base font-semibold mb-3 flex items-center gap-2">
              <ElIcon><Box /></ElIcon> Chi tiết kiện hàng
            </h3>
            <div class="border border-color rounded-md overflow-hidden">
              <ElTable :data="detail.items" style="width: 100%">
                <ElTableColumn width="80" align="center">
                  <template #default="{ row }">
                    <ElImage
                      :src="row.thumbnailUrl || '/placeholder.png'"
                      class="w-10 h-10 rounded"
                      fit="cover"
                    >
                      <template #error>
                        <div
                          class="w-10 h-10 bg-fill-lighter flex items-center justify-center text-secondary text-xs rounded"
                        >
                          <ElIcon><Picture /></ElIcon>
                        </div>
                      </template>
                    </ElImage>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="sku" label="Mã SKU" width="120" />
                <ElTableColumn
                  prop="productName"
                  label="Tên phụ tùng"
                  min-width="150"
                  show-overflow-tooltip
                />
                <ElTableColumn
                  prop="quantity"
                  label="SL"
                  width="80"
                  align="center"
                />
              </ElTable>
            </div>
          </div>

          <!-- KHỐI KIỂM ĐỊNH -->
          <div
            v-if="detail.status !== 'completed'"
            class="bg-fill-lighter p-5 rounded-lg border border-color"
          >
            <h3
              class="text-base font-semibold mb-4 flex items-center gap-2 text-primary"
            >
              <ElIcon><Check /></ElIcon> Kiểm định thực tế tại kho
            </h3>

            <ElForm
              :model="inspectForm"
              label-position="top"
              :disabled="submitting"
            >
              <div class="grid grid-cols-2 gap-4">
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
                    <ElRadio value="Hư hỏng hoàn toàn"
                      >Hư hỏng hoàn toàn</ElRadio
                    >
                  </ElRadioGroup>
                </ElFormItem>
              </div>

              <ElFormItem label="Ảnh bằng chứng khui hộp">
                <div class="flex items-center gap-4">
                  <ElButton :icon="Camera" @click="handleUploadClick"
                    >Tải ảnh lên</ElButton
                  >
                  <span
                    v-if="inspectForm.returnProofImage"
                    class="text-success text-sm flex items-center gap-1"
                  >
                    <ElIcon><CircleCheck /></ElIcon> Đã tải lên ảnh bằng chứng
                  </span>
                </div>
              </ElFormItem>

              <ElFormItem label="Ghi chú nội bộ (Lưu vết trách nhiệm)">
                <ElInput
                  v-model="inspectForm.returnInternalNote"
                  type="textarea"
                  :rows="3"
                  placeholder="Ghi rõ đánh giá của thủ kho, ví dụ: 'Hàng móp do vận chuyển Viettel Post'"
                />
              </ElFormItem>
            </ElForm>
          </div>

          <!-- Hiển thị lại nếu đã completed -->
          <div
            v-else
            class="bg-success-light-9 p-5 rounded-lg border border-success-light-5"
          >
            <h3
              class="text-base font-semibold mb-4 flex items-center gap-2 text-success"
            >
              <ElIcon><SuccessFilled /></ElIcon> Đã hoàn tất xử lý
            </h3>
            <div class="grid grid-cols-2 gap-y-3 text-sm">
              <div class="text-secondary">Quyết định:</div>
              <div class="font-medium text-primary">
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

              <div class="text-secondary">Ghi chú:</div>
              <div class="font-medium italic">
                {{ detail.returnInternalNote || "Không có" }}
              </div>
            </div>
          </div>
        </div>

        <!-- KHỐI ĐÓNG HỒ SƠ (Nút bấm hành động) -->
        <div
          v-if="detail.status !== 'completed'"
          class="p-4 border-t border-color shrink-0 bg-fill-lighter flex gap-3 justify-end"
        >
          <ElButton
            type="primary"
            plain
            size="large"
            :loading="submitting"
            @click="submitDecision('restock')"
          >
            <ElIcon class="mr-1"><Refresh /></ElIcon> Nhập kho bán lẻ
          </ElButton>

          <ElButton
            type="danger"
            plain
            size="large"
            :loading="submitting"
            @click="submitDecision('defect')"
          >
            <ElIcon class="mr-1"><Warning /></ElIcon> Cách ly chờ hủy
          </ElButton>

          <ElButton
            type="warning"
            plain
            size="large"
            :loading="submitting"
            @click="submitDecision('refund')"
          >
            <ElIcon class="mr-1"><Money /></ElIcon> Hoàn tiền
          </ElButton>
        </div>
      </ElCard>

      <ElCard
        v-else
        class="h-full flex items-center justify-center bg-fill-lighter"
        body-class="flex flex-col items-center p-10 text-secondary"
      >
        <ElIcon :size="60" class="mb-4 text-color-secondary"
          ><Document
        /></ElIcon>
        <h3 class="m-0 font-normal text-lg">
          Chọn một đơn hàng hoàn ở danh sách bên trái để xử lý
        </h3>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  List,
  Search,
  User,
  Box,
  Picture,
  Check,
  Camera,
  CircleCheck,
  SuccessFilled,
  Refresh,
  Warning,
  Money,
  Document,
} from "@element-plus/icons-vue";
import {
  getReturns,
  getReturnDetail,
  inspectReturn,
} from "@/api/logistics/returns";
import type {
  ReturnOrderDto,
  ReturnDetailDto,
  InspectReturnCommand,
} from "@/domain/logistics/returns.types";

defineOptions({ name: "ReverseLogistics" });

// State for List
const returnsList = ref<ReturnOrderDto[]>([]);
const loadingList = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");

// State for Detail
const selectedId = ref<number | null>(null);
const detail = ref<ReturnDetailDto | null>(null);
const loadingDetail = ref(false);

// State for Form
const inspectForm = ref<InspectReturnCommand>({
  boxCondition: "",
  productCondition: "",
  returnProofImage: "",
  returnInternalNote: "",
  action: "",
});
const submitting = ref(false);

// Filter logic
const filteredReturns = computed(() => {
  if (!searchQuery.value) return returnsList.value;
  const q = searchQuery.value.toLowerCase();
  return returnsList.value.filter(
    (item) =>
      item.originalTrackingNumber.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      (item.reason && item.reason.toLowerCase().includes(q)),
  );
});

// Lifecycle
onMounted(() => {
  fetchReturns();
});

// Fetch Data
const fetchReturns = async () => {
  loadingList.value = true;
  try {
    const res = await getReturns(statusFilter.value);
    returnsList.value = (res as unknown as ReturnOrderDto[]) || [];

    // Auto select first item if list is not empty and none is selected
    if (returnsList.value.length > 0 && !selectedId.value) {
      handleSelect(returnsList.value[0].id);
    }
  } catch (_error) {
    ElMessage.error("Lỗi khi tải danh sách hàng hoàn");
  } finally {
    loadingList.value = false;
  }
};

const handleSelect = async (id: number) => {
  selectedId.value = id;
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
    };
  } catch (_error) {
    ElMessage.error("Lỗi khi tải chi tiết hàng hoàn");
  } finally {
    loadingDetail.value = false;
  }
};

// Actions
const handleUploadClick = () => {
  // Simulate image upload
  setTimeout(() => {
    inspectForm.value.returnProofImage =
      "https://fakeimg.pl/350x200/?text=Proof";
    ElMessage.success("Tải ảnh thành công");
  }, 500);
};

const submitDecision = async (action: "restock" | "defect" | "refund") => {
  if (!detail.value) return;

  const actionMap: Record<string, string> = {
    restock: "Nhập lại kho bán lẻ",
    defect: "Cách ly chờ hủy",
    refund: "Hoàn tiền cho khách",
  };

  try {
    await ElMessageBox.confirm(
      `Bạn chắc chắn muốn đóng hồ sơ đơn hàng này với quyết định: <strong>${actionMap[action]}</strong>?`,
      "Xác nhận xử lý",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
        type: "warning",
        dangerouslyUseHTMLString: true,
      },
    );

    submitting.value = true;
    inspectForm.value.action = action;

    await inspectReturn(detail.value.id, inspectForm.value);

    ElMessage.success(`Xử lý thành công: ${actionMap[action]}`);

    // Refresh
    await fetchReturns();
    await handleSelect(detail.value.id); // reload detail to show completed state
  } catch (e: any) {
    if (e !== "cancel") {
      ElMessage.error("Có lỗi xảy ra khi xử lý");
    }
  } finally {
    submitting.value = false;
  }
};

// Helpers
const getCarrierTag = (carrier: string) => {
  const c = carrier.toLowerCase();
  if (c.includes("ghtk")) return "success";
  if (c.includes("viettel") || c.includes("vtp")) return "warning";
  return "info";
};

const getReasonTag = (reason: string): "warning" | "danger" => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "danger";
};

const getReasonAlertType = (reason: string) => {
  const r = reason.toLowerCase();
  if (r.includes("bom") || r.includes("không nhận")) return "warning";
  return "error";
};

const getStatusTag = (
  status: string,
): "danger" | "warning" | "success" | "info" => {
  const map: Record<string, "danger" | "warning" | "success" | "info"> = {
    pending: "danger",
    inspecting: "warning",
    completed: "success",
  };
  return map[status] || "info";
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: "Chờ xử lý",
    inspecting: "Đang kiểm tra",
    completed: "Đã hoàn tất",
  };
  return map[status] || status;
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
</script>

<style scoped>
.reverse-logistics-container {
  height: calc(100vh - 120px);
}
</style>
