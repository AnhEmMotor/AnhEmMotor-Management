<template>
  <div class="contract-sales-container">
    <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Hợp đồng mới (Draft)</div>
            <div class="text-2xl font-bold text-orange-500">
              {{ statistics.draftCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cần xử lý gấp để ký</div>
          </div>
          <el-icon class="text-4xl text-orange-200"><Document /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Trễ hạn bàn giao</div>
            <div class="text-2xl font-bold text-red-500">
              {{ statistics.overdueCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Cảnh báo nhắc Sale</div>
          </div>
          <el-icon class="text-4xl text-red-200"><Warning /></el-icon>
        </div>
      </el-card>
      <el-card shadow="hover" class="kpi-card">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Đã ký (Signed)</div>
            <div class="text-2xl font-bold text-blue-500">
              {{ statistics.signedCount }}
            </div>
            <div class="text-xs text-gray-400 mt-1">Chờ bàn giao xe</div>
          </div>
          <el-icon class="text-4xl text-blue-200"><Money /></el-icon>
        </div>
      </el-card>
    </div>

    <el-card shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span class="font-bold text-lg">{{
            $t("menus.contract.sales")
          }}</span>
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleOpenAddDialog"
            v-auth="Permissions.Admin.ContractManagement.Create"
          >
            Thêm hợp đồng
          </el-button>
        </div>
      </template>
      <div>
        <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <el-input
            v-model="searchQuery"
            placeholder="Số hợp đồng, Tên KH, Số CCCD, Số khung/máy"
            clearable
            :prefix-icon="Search"
            class="w-full"
            @input="debouncedSearch"
          />
          <el-select
            v-model="statusFilter"
            placeholder="Trạng thái"
            clearable
            class="w-full"
            @change="fetchData"
          >
            <el-option label="Nháp (Draft)" value="Draft" />
            <el-option label="Đã ký (Signed)" value="Signed" />
            <el-option label="Hoàn tất (Fulfilled)" value="Fulfilled" />
          </el-select>
          <el-select
            v-model="vehicleFilter"
            placeholder="Dòng xe"
            clearable
            class="w-full"
            @change="fetchData"
          >
            <el-option label="Honda SH" value="SH" />
            <el-option label="Honda Vision" value="Vision" />
            <el-option label="Yamaha Exciter" value="Exciter" />
          </el-select>
          <el-button
            type="primary"
            :icon="Search"
            class="w-full md:w-auto"
            @click="fetchData"
            >Tìm kiếm</el-button
          >
        </div>

        <el-table
          :data="tableData"
          border
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column
            prop="contractNumber"
            label="Số Hợp Đồng"
            width="160"
          />
          <el-table-column label="Mã Đơn Hàng" width="140">
            <template #default="scope">
              <el-button
                link
                type="primary"
                class="font-semibold"
                v-auth="Permissions.Admin.ContractManagement.Edit"
              >
                {{ scope.row.orderId }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="customerName"
            label="Khách Hàng"
            min-width="160"
          />
          <el-table-column
            prop="vehicle"
            label="Xe Giao Dịch"
            min-width="180"
          />

          <el-table-column label="Hạn Bàn Giao" width="130">
            <template #default="scope">
              <div class="flex flex-col items-start">
                <span
                  :class="{
                    'text-red-500 font-bold': isOverdue(
                      scope.row.deliveryDeadline,
                    ),
                  }"
                >
                  {{ formatDate(scope.row.deliveryDeadline) }}
                </span>
                <el-tag
                  size="small"
                  :type="getStatusType(scope.row.status)"
                  effect="dark"
                  class="mt-1 contract-status-tag"
                >
                  {{ getStatusLabel(scope.row.status) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column
            prop="status"
            label="Trạng Thái HĐ"
            width="130"
            align="center"
          >
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" effect="dark">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            label="Thao Tác"
            width="110"
            align="center"
            fixed="right"
          >
            <template #default="scope">
              <el-dropdown trigger="click">
                <el-button
                  type="primary"
                  link
                  v-auth="Permissions.Admin.ContractManagement.Edit"
                >
                  Thao tác
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      @click="goToPreview(scope.row.id)"
                      :icon="View"
                      v-auth="Permissions.Admin.ContractManagement.View"
                    >
                      Xem chi tiết
                    </el-dropdown-item>
                    <template v-if="scope.row.status === 'Draft'">
                      <el-dropdown-item
                        @click="goToPreview(scope.row.id)"
                        :icon="Edit"
                        v-auth="Permissions.Admin.ContractManagement.Edit"
                      >
                        Xem trước &amp; Chỉnh sửa
                      </el-dropdown-item>
                      <el-dropdown-item
                        :icon="UploadFilled"
                        v-auth="Permissions.Admin.ContractManagement.View"
                      >
                        Tải lên bản quét PDF
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        disabled
                        v-auth="Permissions.Admin.ContractManagement.View"
                      >
                        <el-icon class="text-orange-500"
                          ><WarningFilled
                        /></el-icon>
                        <span class="text-orange-500">Ký HĐ để giao xe</span>
                      </el-dropdown-item>
                    </template>
                    <template v-else-if="scope.row.status === 'Signed'">
                      <el-dropdown-item
                        :icon="DocumentAdd"
                        v-auth="Permissions.Admin.ContractManagement.Create"
                        >Tạo phụ lục</el-dropdown-item
                      >
                      <el-dropdown-item
                        v-if="isOverdue(scope.row.deliveryDeadline)"
                        divided
                        disabled
                        v-auth="Permissions.Admin.ContractManagement.Edit"
                      >
                        <el-icon class="text-red-500"
                          ><WarnTriangleFilled
                        /></el-icon>
                        <span class="text-red-500">Trễ hạn bàn giao!</span>
                      </el-dropdown-item>
                    </template>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt-4 flex justify-end">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            @current-change="fetchData"
            @size-change="fetchData"
          />
        </div>
      </div>
    </el-card>

    <!-- Create Contract Dialog -->
    <el-dialog
      v-model="dialogVisible"
      title="Thêm hợp đồng"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form
        :model="form"
        :rules="formRules"
        ref="formRef"
        label-position="top"
      >
        <el-form-item label="Chọn đơn hàng" prop="orderId">
          <el-select
            v-model="form.orderId"
            filterable
            remote
            reserve-keyword
            placeholder="Nhập tên KH, SĐT hoặc mã đơn hàng..."
            :remote-method="searchOrders"
            :loading="orderSearchLoading"
            class="w-full"
            clearable
          >
            <el-option
              v-for="item in orderOptions"
              :key="item.id"
              :label="`${item.customerName} - ${item.customerPhone} (Đơn hàng #${item.id})`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Điều khoản đặc biệt">
          <el-input
            v-model="form.specialTerms"
            type="textarea"
            :rows="3"
            placeholder="Nhập các điều khoản đặc biệt nếu có..."
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Thời gian bảo hành">
              <el-input
                v-model="form.warrantyPeriod"
                placeholder="VD: 3 năm hoặc 30.000km"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Phạm vi bảo hành">
              <el-input
                v-model="form.warrantyScope"
                placeholder="VD: Toàn quốc"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Ghi chú nội bộ">
          <el-input
            v-model="form.note"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú riêng nội bộ..."
          />
        </el-form-item>

        <el-form-item label="File hợp đồng (Bản scan/Word/PDF)">
          <el-upload
            :http-request="customUploadRequest"
            :show-file-list="false"
            drag
            class="w-full contract-file-upload"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          >
            <div
              v-if="contractFilePreviewUrl"
              class="contract-upload-preview flex flex-col items-center justify-center p-4 border border-dashed rounded-lg"
            >
              <img
                :src="contractFilePreviewUrl"
                alt="Xem trước file"
                class="max-h-[150px] object-contain rounded"
              />
              <span class="text-xs text-gray-500 mt-2"
                >Bấm để chọn file khác</span
              >
            </div>
            <template v-else>
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text text-sm">
                Kéo thả file hoặc <em>bấm vào đây</em> để tải lên
              </div>
            </template>
            <template #tip>
              <div class="el-upload__tip text-xs text-gray-400">
                Hỗ trợ PDF, Word (.doc, .docx), JPG, PNG (tối đa 10MB)
              </div>
            </template>
          </el-upload>
          <div
            v-if="contractFileName"
            class="contract-upload-filebar flex items-center justify-between mt-2 p-2 bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 rounded-lg text-xs"
          >
            <span class="truncate font-medium">{{ contractFileName }}</span>
            <el-button link type="danger" @click.stop="clearContractFile"
              >Xóa</el-button
            >
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button
            @click="dialogVisible = false"
            v-auth="Permissions.Admin.ContractManagement.View"
            >Hủy</el-button
          >
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
            v-auth="Permissions.Admin.ContractManagement.Edit"
          >
            Xác nhận
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  View,
  Search,
  Document,
  Warning,
  Money,
  Edit,
  UploadFilled,
  DocumentAdd,
  WarningFilled,
  WarnTriangleFilled,
  ArrowDown,
  Plus,
} from "@element-plus/icons-vue";

import { ElMessage } from "element-plus";
import { SalesContractApi, SalesOrderApi } from "@/api/sales";

const { t: $t } = useI18n();
const router = useRouter();

const loading = ref(false);
const searchQuery = ref("");
const statusFilter = ref("");
const vehicleFilter = ref("");

const tableData = ref<any[]>([]);
const statistics = reactive({
  draftCount: 0,
  overdueCount: 0,
  signedCount: 0,
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pagination.current = 1;
    fetchData();
  }, 400);
};

const fetchData = async () => {
  loading.value = true;
  try {
    const params: {
      current: number;
      size: number;
      keyword?: string;
      status?: string;
      vehicleModel?: string;
    } = {
      current: pagination.current,
      size: pagination.size,
    };
    if (searchQuery.value) params.keyword = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;
    if (vehicleFilter.value) params.vehicleModel = vehicleFilter.value;

    const res = await SalesContractApi.getList(params);
    tableData.value = res.items.map((c: any) => ({
      ...c,
      progress:
        c.status === "Fulfilled"
          ? "delivered"
          : c.status === "Signed"
            ? "paid"
            : "deposit",
    }));
    pagination.total = res.total;
  } catch (_e) {
    ElMessage.error("Không tải được danh sách hợp đồng.");
  } finally {
    loading.value = false;
  }
};

const loadStatistics = async () => {
  try {
    const stats = await SalesContractApi.getStatistics();
    statistics.draftCount = stats.draftCount;
    statistics.overdueCount = stats.overdueCount;
    statistics.signedCount = stats.signedCount;
  } catch (_e) {
    // silent fail for stats
  }
};

onMounted(() => {
  fetchData();
  loadStatistics();
});

const getStatusType = (status: string) => {
  switch (status) {
    case "Draft":
      return "warning";
    case "Signed":
      return "primary";
    case "Fulfilled":
      return "success";
    default:
      return "info";
  }
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    Draft: "Nháp (Draft)",
    Signed: "Đã ký (Signed)",
    Fulfilled: "Hoàn tất (Fulfilled)",
  };
  return map[status] || status;
};

const getProgressActive = (progress: string) => {
  switch (progress) {
    case "deposit":
      return 1;
    case "paid":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
};

const isOverdue = (dateStr: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const dialogVisible = ref(false);
const orderSearchLoading = ref(false);
const submitLoading = ref(false);
const orderOptions = ref<any[]>([]);
const formRef = ref<any>(null);

const selectedFile = ref<File | null>(null);
const contractFileName = ref("");
const contractFilePreviewUrl = ref("");

const customUploadRequest = async (options: any) => {
  const file = options.file as File;
  selectedFile.value = file;
  contractFileName.value = file.name;
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)) {
    contractFilePreviewUrl.value = URL.createObjectURL(file);
  } else {
    contractFilePreviewUrl.value = "";
  }
  options.onSuccess?.({});
};

const clearContractFile = () => {
  selectedFile.value = null;
  contractFileName.value = "";
  if (
    contractFilePreviewUrl.value &&
    contractFilePreviewUrl.value.startsWith("blob:")
  ) {
    URL.revokeObjectURL(contractFilePreviewUrl.value);
  }
  contractFilePreviewUrl.value = "";
};

const form = reactive({
  orderId: null as number | null,
  specialTerms: "",
  warrantyPeriod: "3 năm hoặc 30.000km",
  warrantyScope: "Toàn quốc",
  note: "",
});

const formRules = reactive({
  orderId: [
    { required: true, message: "Vui lòng chọn đơn hàng", trigger: "change" },
  ],
});

const handleOpenAddDialog = () => {
  form.orderId = null;
  form.specialTerms = "";
  form.warrantyPeriod = "3 năm hoặc 30.000km";
  form.warrantyScope = "Toàn quốc";
  form.note = "";
  selectedFile.value = null;
  contractFileName.value = "";
  contractFilePreviewUrl.value = "";
  if (formRef.value) {
    formRef.value.resetFields();
  }
  dialogVisible.value = true;
  searchOrders("");
};

const searchOrders = async (query: string) => {
  orderSearchLoading.value = true;
  try {
    const res = await SalesOrderApi.getConfirmedList({
      current: 1,
      size: 50,
      Search: query || undefined,
      Sorts: "-CreatedAt",
    });
    orderOptions.value = res.items || [];
  } catch (_e) {
    ElMessage.error("Không tải được danh sách đơn hàng.");
  } finally {
    orderSearchLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const res = await SalesContractApi.create({
        orderId: form.orderId!,
        specialTerms: form.specialTerms || undefined,
        warrantyPeriod: form.warrantyPeriod || undefined,
        warrantyScope: form.warrantyScope || undefined,
        note: form.note || undefined,
      });

      const createdContractId = res?.id;
      if (createdContractId && selectedFile.value) {
        await SalesContractApi.uploadScannedFile(
          createdContractId,
          selectedFile.value,
        );
      }

      ElMessage.success("Thêm hợp đồng thành công.");
      dialogVisible.value = false;
      fetchData();
      loadStatistics();
    } catch (_e) {
      ElMessage.error("Không thể tạo hợp đồng mới.");
    } finally {
      submitLoading.value = false;
    }
  });
};

const goToPreview = (id?: string) => {
  router.push({ name: "SalesContractPreview", params: { id: id || "" } });
};
</script>

<style scoped lang="scss">
.contract-sales-container {
  padding: 16px;
}

html.dark .contract-sales-container {
  min-height: 100vh;
  color: #f8fafc;
  background: #050506;
}

html.dark .contract-sales-container :deep(.el-card) {
  color: #f8fafc;
  background: #161618;
  border-color: rgb(255 255 255 / 9%);
}

html.dark .contract-sales-container :deep(.el-card__header),
html.dark .contract-sales-container :deep(.el-table),
html.dark .contract-sales-container :deep(.el-table .cell),
html.dark .contract-sales-container :deep(.el-table th.el-table__cell),
html.dark .contract-sales-container :deep(.el-table td.el-table__cell),
html.dark .contract-sales-container :deep(.el-pagination),
html.dark .contract-sales-container :deep(.el-pagination *) {
  color: #f8fafc !important;
}

html.dark .contract-sales-container :deep(.el-pagination .el-pager li) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 10%);
}

html.dark
  .contract-sales-container
  :deep(.el-pagination .el-pager li.is-active) {
  background: #e84a4a;
  border-color: #e84a4a;
}

html.dark .contract-sales-container :deep(.el-tag) {
  color: #fff;
  border-color: transparent;
}

html.dark .contract-sales-container :deep(.kpi-card) {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .contract-sales-container :deep(.kpi-card .text-gray-400),
html.dark .contract-sales-container :deep(.kpi-card .text-gray-500) {
  color: #f8fafc !important;
}

html.dark .contract-sales-container :deep(.el-card) {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 9%) !important;
}

html.dark .contract-sales-container :deep(.el-card__body) {
  background: transparent !important;
}

html.dark .contract-sales-container :deep(.el-table) {
  --el-table-bg-color: #161618;
  --el-table-tr-bg-color: #161618;
  --el-table-header-bg-color: #111214;
}

html.dark .contract-sales-container :deep(.el-table th.el-table__cell) {
  background: #111214;
}

html.dark .contract-sales-container :deep(.el-input__wrapper),
html.dark .contract-sales-container :deep(.el-select__wrapper) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 14%);
  box-shadow: none;
}

html.dark .contract-sales-container :deep(.el-input__inner),
html.dark .contract-sales-container :deep(.el-select__placeholder),
html.dark .contract-sales-container :deep(.el-select__selected-item) {
  color: #f8fafc;
}

html.dark .contract-sales-container .text-gray-400,
html.dark .contract-sales-container .text-gray-500,
html.dark .contract-sales-container .text-gray-600,
html.dark .contract-sales-container .text-gray-800,
html.dark .contract-sales-container .text-gray-900 {
  color: #f8fafc !important;
}

.kpi-card {
  border-radius: 8px;
}
</style>
