<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng nợ NCC"
        :count="formatCurrency(totalSuppliersDebt)"
        description="Số tiền nợ của các nhà cung cấp hiển thị trên trang này"
        icon="ri:money-cny-box-line"
        iconStyle="bg-danger"
      />
    </div>

    <ElCard class="flex-1 art-table-card">
      <template #header>
        <div class="flex items-center gap-4 justify-between">
          <div class="flex items-center gap-4">
            <h4 class="m-0 font-bold text-gray-800 text-lg">
              Quản lý Công nợ nhà cung cấp
            </h4>
          </div>
          <div class="flex gap-2">
            <ElButton type="warning" size="small" @click="openMissingProofs">
              Nợ thiếu ảnh minh chứng
            </ElButton>
            <ElButton type="primary" size="small" @click="fetchSupplierDebts">
              <ElIcon class="mr-1"><Refresh /></ElIcon> Làm mới
            </ElButton>
          </div>
        </div>
      </template>

      <ArtTable
        :data="supplierDebts"
        :columns="supplierColumns"
        v-loading="loading"
      >
        <template #totalDebt="{ row }">
          <span class="font-bold text-red-500">
            {{ formatCurrency(row.totalDebt) }}
          </span>
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center items-center">
            <ElButton
              type="success"
              size="small"
              :disabled="row.totalDebt <= 0"
              @click="openPaymentForm(row)"
            >
              Thanh toán
            </ElButton>
            <ElButton
              type="primary"
              size="small"
              link
              @click="openPaymentLogs(row)"
            >
              Lịch sử thanh toán
            </ElButton>
          </div>
        </template>
      </ArtTable>

      <div class="mt-4 flex justify-end">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <ElDialog
      v-model="paymentFormVisible"
      :title="`Thanh toán nợ cho nhà cung cấp: ${selectedSupplierToPay?.name}`"
      width="450px"
      append-to-body
    >
      <div v-if="selectedSupplierToPay" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-500">Tổng dư nợ hiện tại:</span>
            <span class="font-bold text-red-500">{{
              formatCurrency(selectedSupplierToPay.totalDebt)
            }}</span>
          </div>
          <div class="text-xs text-gray-500 mt-2">
            Hệ thống sẽ tự động cấn trừ số tiền thanh toán vào các đơn nợ từ cũ
            nhất đến mới nhất.
          </div>
        </div>
        <ElForm label-position="top">
          <ElFormItem label="Số tiền thanh toán (VNĐ)">
            <ElInputNumber
              v-model="paymentAmount"
              :min="1"
              :max="selectedSupplierToPay.totalDebt"
              class="w-full"
              :controls="false"
              :formatter="formatCurrencyInput"
              :parser="parseCurrencyInput"
            />
          </ElFormItem>
          <ElFormItem label="Hình ảnh minh chứng (không bắt buộc)">
            <ElUpload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              multiple
              v-model:file-list="paymentProofFiles"
              accept="image/*"
            >
              <ElIcon><Plus /></ElIcon>
            </ElUpload>
          </ElFormItem>
        </ElForm>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="paymentFormVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="paying" @click="submitPayment"
            >Xác nhận</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="paymentLogsVisible"
      :title="`Lịch sử thanh toán - ${selectedSupplierLogs?.name}`"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <div v-loading="logsLoading">
        <ElTable :data="paymentLogs" border stripe style="width: 100%">
          <ElTableColumn label="Thời gian" width="160" align="center">
            <template #default="{ row }">
              {{ new Date(row.paymentDate).toLocaleString("vi-VN") }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Người trả" min-width="150">
            <template #default="{ row }">
              {{
                row.createdBy?.fullName || row.createdBy?.userName || "Hệ thống"
              }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Số tiền trả" width="150" align="right">
            <template #default="{ row }">
              <span class="text-success font-bold">{{
                formatCurrency(row.amountPaid)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Dư nợ còn lại" width="150" align="right">
            <template #default="{ row }">
              <span class="text-danger">{{
                formatCurrency(row.remainingDebt)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Hình ảnh" width="120" align="center">
            <template #default="{ row }">
              <ElButton
                v-if="row.hasProofImage"
                type="primary"
                size="small"
                link
                @click="viewProofImages(row)"
              >
                Xem / Sửa
              </ElButton>
              <ElButton
                v-else
                type="success"
                size="small"
                link
                @click="viewProofImages(row)"
              >
                Thêm ảnh
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </ElDialog>

    <ElDialog
      v-model="missingProofsVisible"
      title="Danh sách thanh toán thiếu ảnh minh chứng"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <div v-loading="missingProofsLoading">
        <ElTable :data="missingProofsData" border stripe style="width: 100%">
          <ElTableColumn label="Thời gian" width="160" align="center">
            <template #default="{ row }">
              {{ new Date(row.paymentDate).toLocaleString("vi-VN") }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Nhà cung cấp" min-width="150">
            <template #default="{ row }">
              {{ row.supplier?.name }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Người trả" min-width="150">
            <template #default="{ row }">
              {{
                row.createdBy?.fullName || row.createdBy?.userName || "Hệ thống"
              }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Số tiền trả" width="150" align="right">
            <template #default="{ row }">
              <span class="text-success font-bold">{{
                formatCurrency(row.amountPaid)
              }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thao tác" width="120" align="center">
            <template #default="{ row }">
              <ElButton
                type="success"
                size="small"
                link
                @click="viewProofImages(row)"
              >
                Thêm ảnh
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
        <div class="mt-4 flex justify-end">
          <ElPagination
            v-model:current-page="mpCurrentPage"
            v-model:page-size="mpPageSize"
            :page-sizes="[10, 20, 50]"
            :total="mpTotal"
            layout="total, sizes, prev, pager, next"
            @size-change="mpFetch"
            @current-change="mpFetch"
          />
        </div>
      </div>
    </ElDialog>

    <ElDialog
      v-model="imageViewerVisible"
      title="Ảnh minh chứng"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <div v-loading="savingImages">
        <div class="flex flex-col gap-4 mb-4">
          <div
            v-for="(url, index) in currentImageUrls"
            :key="url"
            class="relative border rounded p-2 text-center group"
          >
            <ElImage
              :src="url"
              :preview-src-list="currentImageUrls"
              fit="contain"
              style="width: 100%; max-height: 400px"
            />
            <ElButton
              type="danger"
              circle
              size="small"
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeExistingImage(index)"
            >
              x
            </ElButton>
          </div>
        </div>

        <ElForm label-position="top">
          <ElFormItem label="Thêm ảnh mới">
            <ElUpload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              multiple
              v-model:file-list="additionalProofFiles"
              accept="image/*"
            >
              <ElIcon><Plus /></ElIcon>
            </ElUpload>
          </ElFormItem>
        </ElForm>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="imageViewerVisible = false">Hủy</ElButton>
          <ElButton
            type="primary"
            :loading="savingImages"
            @click="saveProofImages"
            >Lưu thay đổi</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Refresh, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { DebtApi } from "@/api/supplier";

defineOptions({ name: "InventoryDebt" });

// const activeTab = ref("suppliers");

const supplierDebts = ref<any[]>([]);

const supplierColumns = [
  { label: "Nhà cung cấp", prop: "name", minWidth: 200 },
  {
    label: "Số điện thoại",
    prop: "phone",
    width: 150,
    align: "right",
  },
  {
    label: "Còn nợ",
    prop: "totalDebt",
    width: 180,
    useSlot: true,
    align: "right",
  },
  {
    label: "Thao tác",
    prop: "operation",
    width: 240,
    useSlot: true,
    align: "center",
  },
];

const fetchSupplierDebts = async () => {
  loading.value = true;
  try {
    const res = await DebtApi.getSuppliersWithDebt({
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
    });
    if (res && res.items) {
      supplierDebts.value = res.items;
      total.value = res.totalCount || 0;
    } else if (Array.isArray(res)) {
      supplierDebts.value = res;
      total.value = res.length;
    } else {
      supplierDebts.value = [];
      total.value = 0;
    }

    totalSuppliersDebt.value = supplierDebts.value.reduce(
      (acc, curr) => acc + (curr.totalDebt || 0),
      0,
    );
  } catch (err) {
    console.error(err);
    ElMessage.error("Không thể tải danh sách công nợ");
  } finally {
    loading.value = false;
  }
};

const paymentFormVisible = ref(false);
const paying = ref(false);
const selectedSupplierToPay = ref<any | null>(null);
const paymentAmount = ref<number>(0);
const paymentProofFiles = ref<any[]>([]);

const openPaymentForm = (supplier: any) => {
  selectedSupplierToPay.value = supplier;
  paymentAmount.value = supplier.totalDebt;
  paymentProofFiles.value = [];
  paymentFormVisible.value = true;
};

const submitPayment = async () => {
  if (!selectedSupplierToPay.value) return;
  paying.value = true;
  try {
    const proofUrls: string[] = [];
    if (paymentProofFiles.value.length > 0) {
      for (const file of paymentProofFiles.value) {
        if (file.raw) {
          const res = await DebtApi.uploadProofImage(file.raw);
          if (res && res.url) {
            proofUrls.push(res.url);
          }
        }
      }
    }

    await DebtApi.paySupplierDebt(
      selectedSupplierToPay.value.id,
      paymentAmount.value,
      proofUrls.length > 0 ? proofUrls : undefined,
    );
    ElMessage.success("Thanh toán công nợ thành công!");
    paymentFormVisible.value = false;
    fetchSupplierDebts();
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response?.data?.Message || "Thanh toán thất bại");
  } finally {
    paying.value = false;
  }
};

const paymentLogsVisible = ref(false);
const logsLoading = ref(false);
const paymentLogs = ref<any[]>([]);
const selectedSupplierLogs = ref<any | null>(null);

const openPaymentLogs = async (supplier: any) => {
  selectedSupplierLogs.value = supplier;
  paymentLogsVisible.value = true;
  logsLoading.value = true;
  try {
    const res = await DebtApi.getSupplierDebtLogs(supplier.id);
    paymentLogs.value = res || [];
  } catch (err: any) {
    console.error(err);
    ElMessage.error("Không thể lấy lịch sử thanh toán");
  } finally {
    logsLoading.value = false;
  }
};

const formatCurrency = (val: number) => val?.toLocaleString() + " VNĐ";
const formatCurrencyInput = (value: string | number) => {
  if (!value) return "";
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
const parseCurrencyInput = (value: string) => {
  if (!value) return "0";
  return value.replace(/\$\s?|(,*)/g, "");
};

const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchSupplierDebts();
};
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchSupplierDebts();
};
const totalSuppliersDebt = ref(0);

// Missing Proofs logic
const missingProofsVisible = ref(false);
const missingProofsLoading = ref(false);
const missingProofsData = ref<any[]>([]);
const mpTotal = ref(0);
const mpCurrentPage = ref(1);
const mpPageSize = ref(10);

const openMissingProofs = () => {
  missingProofsVisible.value = true;
  mpCurrentPage.value = 1;
  mpFetch();
};

const mpFetch = async () => {
  missingProofsLoading.value = true;
  try {
    const res = await DebtApi.getMissingProofs({
      page: mpCurrentPage.value,
      pageSize: mpPageSize.value,
    });
    if (res) {
      missingProofsData.value = res.items || [];
      mpTotal.value = res.totalCount || 0;
    }
  } catch (err) {
    ElMessage.error("Không thể lấy dữ liệu thiếu ảnh minh chứng");
  } finally {
    missingProofsLoading.value = false;
  }
};

// Image Viewer logic
const imageViewerVisible = ref(false);
const currentImageUrls = ref<string[]>([]);
const additionalProofFiles = ref<any[]>([]);
const selectedDebtLogId = ref<number | null>(null);
const savingImages = ref(false);

const viewProofImages = async (row: any) => {
  if (!row) return;
  selectedDebtLogId.value = row.id;
  currentImageUrls.value = [];
  additionalProofFiles.value = [];
  imageViewerVisible.value = true;

  if (row.hasProofImage) {
    try {
      const urls = await DebtApi.getDebtLogProofImages(row.id);
      if (urls && urls.length > 0) {
        currentImageUrls.value = urls;
      }
    } catch (e) {
      console.error("Failed to load image URLs", e);
    }
  }
};

const removeExistingImage = (index: number) => {
  currentImageUrls.value.splice(index, 1);
};

const saveProofImages = async () => {
  if (!selectedDebtLogId.value) return;
  savingImages.value = true;
  try {
    const proofUrls: string[] = [...currentImageUrls.value];

    // Upload new files
    if (additionalProofFiles.value.length > 0) {
      for (const file of additionalProofFiles.value) {
        if (file.raw) {
          const res = await DebtApi.uploadProofImage(file.raw);
          if (res && res.url) {
            proofUrls.push(res.url);
          }
        }
      }
    }

    await DebtApi.updateProofImages(selectedDebtLogId.value, proofUrls);
    ElMessage.success("Cập nhật ảnh minh chứng thành công!");
    imageViewerVisible.value = false;

    // Refresh current views
    fetchSupplierDebts();
    if (paymentLogsVisible.value && selectedSupplierLogs.value) {
      openPaymentLogs(selectedSupplierLogs.value);
    }
    if (missingProofsVisible.value) {
      mpFetch();
    }
  } catch (err: any) {
    console.error(err);
    ElMessage.error(err.response?.data?.Message || "Cập nhật thất bại");
  } finally {
    savingImages.value = false;
  }
};

onMounted(() => {
  fetchSupplierDebts();
});
</script>

<style scoped>
.art-table-card {
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
}

.bg-primary {
  background-color: var(--main-color);
}
</style>
