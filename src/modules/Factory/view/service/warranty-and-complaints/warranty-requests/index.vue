<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div
      class="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <el-icon class="text-primary"><Tickets /></el-icon>
          {{ $t("menus.service.warrantyAndComplaints.warrantyRequests") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý danh sách, tra cứu điều kiện bảo hành của khách hàng và tạo
          phiếu bảo hành mới.
        </p>
      </div>
      <div>
        <el-button
          type="primary"
          :icon="Plus"
          size="large"
          class="shadow-md hover:shadow-lg transition-all"
          @click="openCreateDrawer"
          v-auth="Permissions.Factory.CustomerManagement.View"
        >
          Tạo Phiếu Bảo hành
        </el-button>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <el-form
        :inline="true"
        :model="filters"
        class="flex flex-wrap gap-4 items-center"
      >
        <el-form-item label="Tìm kiếm" class="mb-0">
          <el-input
            v-model="filters.search"
            placeholder="Biển số, tên khách hàng, mã phiếu..."
            clearable
            :prefix-icon="Search"
            class="w-72"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="Trạng thái" class="mb-0">
          <el-select
            v-model="filters.status"
            placeholder="Tất cả trạng thái"
            clearable
            class="w-56"
            @change="handleSearch"
          >
            <el-option label="Tiếp nhận" :value="1" />
            <el-option label="Chờ hãng thẩm định" :value="2" />
            <el-option label="Đã duyệt bồi hoàn" :value="3" />
            <el-option label="Thợ thay thế" :value="4" />
            <el-option label="Hoàn tất - Đóng hồ sơ" :value="5" />
            <el-option label="Từ chối" :value="6" />
          </el-select>
        </el-form-item>

        <el-form-item class="mb-0">
          <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
          <el-button @click="resetFilters">Làm mới</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table List -->
    <div
      class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        header-cell-class-name="bg-slate-50 text-slate-700 font-semibold"
      >
        <el-table-column prop="claimNumber" label="Mã Phiếu" min-width="150">
          <template #default="{ row }">
            <span
              class="font-mono font-semibold text-primary cursor-pointer hover:underline"
              @click="openDetail(row.id)"
            >
              {{ row.claimNumber }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="Khách Hàng" min-width="160">
          <template #default="{ row }">
            <div class="font-medium text-slate-800">
              {{ row.customerName || "N/A" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="customerPhone"
          label="Số Điện Thoại"
          min-width="130"
        />
        <el-table-column prop="vehiclePlate" label="Biển Số Xe" min-width="130">
          <template #default="{ row }">
            <el-tag
              effect="plain"
              class="font-bold border-slate-300 text-slate-700"
            >
              {{ row.vehiclePlate || "N/A" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Ngày Tạo" min-width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="Trạng Thái" min-width="150">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.statusText)"
              effect="dark"
              class="capitalize"
            >
              {{ getStatusLabel(row.statusText) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Hành động"
          min-width="120"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              plain
              @click="openDetail(row.id)"
              v-auth="Permissions.Factory.CustomerManagement.View"
            >
              Xem chi tiết
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end p-4 border-t border-slate-100">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Dialog / Drawer Tạo Mới Phiếu Bảo Hành -->
    <el-drawer
      v-model="drawerVisible"
      title="TẠO MỚI PHIẾU BẢO HÀNH"
      size="50%"
      :destroy-on-close="true"
      custom-class="warranty-drawer"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        class="space-y-6"
      >
        <!-- Nhóm 1: Thông tin khách hàng -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><User /></el-icon>
            Thông tin khách hàng
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Số điện thoại" prop="customerPhone">
              <el-input
                v-model="form.customerPhone"
                placeholder="Nhập SĐT khách hàng (10 số)"
                clearable
                @input="handlePhoneInput"
              />
            </el-form-item>
            <el-form-item label="Họ tên khách hàng" prop="customerName">
              <el-input
                v-model="form.customerName"
                placeholder="Họ tên khách hàng"
                :disabled="isReadOnlyCustomer"
              />
            </el-form-item>
          </div>

          <!-- Lịch sử bảo hành của khách hàng -->
          <div
            v-if="customerHistory.length > 0"
            class="mt-4 p-3 bg-white rounded border border-slate-100"
          >
            <div class="text-xs font-semibold text-slate-500 mb-2">
              TÓM TẮT LỊCH SỬ BẢO HÀNH KHÁCH HÀNG (SĐT):
            </div>
            <ul class="text-xs text-slate-600 list-disc pl-4 space-y-1">
              <li v-for="h in customerHistory" :key="h.id">
                Mã xe: <span class="font-medium">{{ h.licensePlate }}</span> -
                Vin: {{ h.vinNumber }} - Mua ngày:
                {{ formatDateOnly(h.purchaseDate) }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Nhóm 2: Thông tin xe -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><Setting /></el-icon>
            Thông tin xe
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-form-item
              label="Biển số xe"
              prop="licensePlate"
              class="md:col-span-1"
            >
              <el-input
                v-model="form.licensePlate"
                placeholder="VD: 29-A1 999.99"
                clearable
                @input="handlePlateInput"
              />
            </el-form-item>
            <el-form-item label="Màu sắc" prop="vehicleColor">
              <el-input
                v-model="form.vehicleColor"
                placeholder="Tự động điền"
                disabled
              />
            </el-form-item>
            <el-form-item label="Hãng xe" prop="vehicleBrand">
              <el-input
                v-model="form.vehicleBrand"
                placeholder="Tự động điền"
                disabled
              />
            </el-form-item>
          </div>

          <!-- Lịch sử sửa chữa/bảo hành xe -->
          <div
            v-if="vehicleHistory.length > 0"
            class="mt-4 p-3 bg-white rounded border border-slate-100"
          >
            <div class="text-xs font-semibold text-slate-500 mb-2">
              LỊCH SỬ SỬA CHỮA / BẢO DƯỠNG XE NÀY:
            </div>
            <el-timeline class="mt-2 max-h-40 overflow-y-auto pl-1">
              <el-timeline-item
                v-for="(h, idx) in vehicleHistory"
                :key="idx"
                :timestamp="formatDateOnly(h.createdAt)"
                type="primary"
              >
                <div class="text-xs font-medium text-slate-700">
                  Mã lệnh: {{ h.repairOrderNumber }} - ODO: {{ h.mileage }} km
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  Nội dung:
                  {{
                    h.description || h.issueDescription || "Bảo dưỡng định kỳ"
                  }}
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <div
            v-else-if="vehicleSearched && vehicleHistory.length === 0"
            class="mt-2 text-xs text-slate-400 italic"
          >
            Không có lịch sử sửa chữa/bảo hành nào được ghi nhận trước đó.
          </div>
        </div>

        <!-- Nhóm 3: Kiểm tra thông số kỹ thuật bảo hành -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><Warning /></el-icon>
            Kiểm tra thông số kỹ thuật bảo hành
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item
              label="Ngày mua xe / Ngày bắt đầu BH"
              prop="purchaseDate"
            >
              <el-date-picker
                v-model="form.purchaseDate"
                type="date"
                placeholder="Ngày mua xe"
                style="width: 100%"
                disabled
              />
            </el-form-item>
            <el-form-item
              label="Thời hạn bảo hành (tháng)"
              prop="warrantyPeriodMonths"
            >
              <el-input-number
                v-model="form.warrantyPeriodMonths"
                :min="0"
                style="width: 100%"
                disabled
              />
            </el-form-item>
            <el-form-item label="Số km hiện tại" prop="currentOdo">
              <el-input-number
                v-model="form.currentOdo"
                :min="0"
                style="width: 100%"
                placeholder="Nhập số km hiện tại của xe"
                @change="calculateWarrantyStatus"
              />
            </el-form-item>
            <el-form-item label="Giới hạn km bảo hành" prop="limitOdo">
              <el-input-number
                v-model="form.limitOdo"
                :min="0"
                style="width: 100%"
                disabled
              />
            </el-form-item>
          </div>

          <!-- Kết quả thẩm định điều kiện bảo hành -->
          <div v-if="vehicleSearched" class="mt-4">
            <div
              v-if="isWarrantyValid"
              class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3"
            >
              <el-icon class="text-emerald-600 text-xl mt-0.5"
                ><Check
              /></el-icon>
              <div>
                <div class="text-sm font-bold text-emerald-800">
                  Xe đủ điều kiện bảo hành tiêu chuẩn
                </div>
                <div class="text-xs text-emerald-600 mt-1">
                  - Ngày hết hạn lý thuyết:
                  {{ formatDateOnly(warrantyExpiryDate) }} (Còn
                  {{ warrantyRemainingDays }} ngày)<br />
                  - ODO hiện tại hợp lệ ({{ form.currentOdo }} km &le;
                  {{ form.limitOdo }} km)
                </div>
              </div>
            </div>
            <div
              v-else
              class="p-4 bg-rose-50 border border-rose-200 rounded-lg"
            >
              <div class="flex items-start gap-3">
                <el-icon class="text-rose-600 text-xl mt-0.5"
                  ><Warning
                /></el-icon>
                <div>
                  <div class="text-sm font-bold text-rose-800">
                    Xe đã hết hạn bảo hành!
                  </div>
                  <div class="text-xs text-rose-600 mt-1">
                    <span
                      :class="{ 'text-rose-800 font-semibold': isTimeExpired }"
                    >
                      - Hạn thời gian:
                      {{ isTimeExpired ? "HẾT HẠN" : "CÒN HẠN" }} (Hết hạn ngày
                      {{ formatDateOnly(warrantyExpiryDate) }}) </span
                    ><br />
                    <span
                      :class="{ 'text-rose-800 font-semibold': isOdoExpired }"
                    >
                      - Hạn ODO:
                      {{ isOdoExpired ? "HẾT HẠN" : "CÒN HẠN" }} (Hiện tại
                      {{ form.currentOdo }} km / Giới hạn
                      {{ form.limitOdo }} km)
                    </span>
                  </div>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-rose-200">
                <el-form-item prop="confirmExpiredWarranty" class="mb-0">
                  <el-checkbox v-model="form.confirmExpiredWarranty">
                    <span class="text-xs font-bold text-rose-800"
                      >Xác nhận: Xe đã hết bảo hành, tôi muốn tiếp tục tạo phiếu
                      bảo hành ngoại lệ.</span
                    >
                  </el-checkbox>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>

        <!-- Nhóm 4: Thông tin tiếp nhận -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><Edit /></el-icon>
            Thông tin tiếp nhận & Chi phí
          </h3>
          <div class="space-y-4">
            <el-form-item label="Kỹ thuật viên tiếp nhận" prop="technicianId">
              <el-select
                v-model="form.technicianId"
                placeholder="Chọn kỹ thuật viên tiếp nhận"
                class="w-full"
                filterable
              >
                <el-option
                  v-for="emp in technicians"
                  :key="emp.id"
                  :label="`${emp.fullName} (${emp.jobTitle})`"
                  :value="emp.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item
              label="Mô tả lỗi / yêu cầu bảo hành"
              prop="issueDescription"
            >
              <el-input
                v-model="form.issueDescription"
                type="textarea"
                :rows="3"
                placeholder="Mô tả chi tiết tình trạng lỗi của xe khi tiếp nhận..."
              />
            </el-form-item>

            <!-- Nghiệp vụ linh kiện phụ tùng -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >Danh sách phụ tùng thay thế (nếu có)</span
                >
                <el-button
                  type="primary"
                  size="small"
                  :icon="Plus"
                  plain
                  @click="addPart"
                  v-auth="Permissions.Factory.CustomerManagement.View"
                  >Thêm phụ tùng</el-button
                >
              </div>

              <el-table
                :data="form.parts"
                border
                class="parts-table"
                size="small"
              >
                <el-table-column label="Tên Phụ Tùng" min-width="200">
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="'parts.' + $index + '.selectedVariantId'"
                      :rules="partRules.selectedVariantId"
                      class="mb-0"
                    >
                      <el-select
                        v-model="row.selectedVariantId"
                        placeholder="Chọn phụ tùng"
                        filterable
                        class="w-full"
                        @change="(val) => handlePartSelect(val, row)"
                      >
                        <el-option
                          v-for="p in availableParts"
                          :key="p.id"
                          :label="p.displayName"
                          :value="p.id"
                        />
                      </el-select>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="Phân Loại BH" width="130">
                  <template #default="{ row }">
                    <el-select
                      v-model="row.isWarranty"
                      @change="handlePartTypeChange(row)"
                    >
                      <el-option label="Trong diện BH" :value="true" />
                      <el-option label="Ngoài diện BH" :value="false" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="Đơn giá" width="130">
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="'parts.' + $index + '.unitPrice'"
                      :rules="partRules.unitPrice"
                      class="mb-0"
                    >
                      <el-input-number
                        v-model="row.unitPrice"
                        :min="0"
                        style="width: 100%"
                        :disabled="row.isWarranty"
                        :controls="false"
                      />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="Số lượng" width="100">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.quantity"
                      :min="1"
                      size="small"
                      style="width: 100%"
                      :controls="true"
                      @change="row.total = row.unitPrice * row.quantity"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="Thành tiền" width="120" align="right">
                  <template #default="{ row }">
                    <span class="font-semibold text-slate-700">{{
                      formatPrice(row.total || row.unitPrice * row.quantity)
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Thao tác" width="70" align="center">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      circle
                      @click="removePart($index)"
                      v-auth="Permissions.Factory.CustomerManagement.Delete"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- Tổng chi phí -->
            <div
              class="mt-4 p-4 bg-white rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <div class="text-xs text-slate-500 font-medium">
                  Chi phí sửa chữa (Công thợ)
                </div>
                <div class="text-lg font-bold text-slate-400 mt-1 line-through">
                  0 đ
                </div>
                <div class="text-[10px] text-slate-400 italic mt-0.5">
                  (Được miễn phí 100%)
                </div>
              </div>
              <div>
                <div class="text-xs text-slate-500 font-medium">
                  Chi phí linh kiện phát sinh
                </div>
                <div class="text-lg font-bold text-amber-600 mt-1">
                  {{ formatPrice(totalPartsCost) }}
                </div>
                <div class="text-[10px] text-slate-500 italic mt-0.5">
                  (Chỉ tính phụ tùng ngoài diện bảo hành)
                </div>
              </div>
              <div class="border-l border-slate-200 pl-4">
                <div class="text-xs text-slate-500 font-medium">
                  Khách hàng cần trả
                </div>
                <div class="text-xl font-extrabold text-primary mt-1">
                  {{ formatPrice(totalPartsCost) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-3 p-4 border-t border-slate-100">
          <el-button
            @click="drawerVisible = false"
            v-auth="Permissions.Factory.CustomerManagement.View"
            >Hủy bỏ</el-button
          >
          <el-button
            type="primary"
            :loading="submitting"
            @click="submitForm"
            v-auth="Permissions.Factory.CustomerManagement.View"
            >Tạo Phiếu Bảo Hành</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  Tickets,
  Plus,
  Search,
  View,
  User,
  Setting,
  Warning,
  Edit,
  Delete,
  Check,
} from "@element-plus/icons-vue";
import { WarrantyClaimApi } from "@/api/service/warranty-claim.api";
import { VehicleApi } from "@/api/vehicle/vehicle.api";
import { EmployeeApi } from "@/api/operations/employee.api";
import { ProductApi } from "@/api/product/product.api";
import dayjs from "dayjs";

const router = useRouter();

// Filters & State
const loading = ref(false);
const submitting = ref(false);
const drawerVisible = ref(false);
const formRef = ref<FormInstance>();

const filters = reactive({
  search: "",
  status: "" as any,
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

type WarrantyClaimRow = {
  id: number;
  claimNumber: string;
  vehiclePlate?: string;
  customerName?: string;
  customerPhone?: string;
  statusText: string;
  createdAt: string;
};

const tableData = ref<WarrantyClaimRow[]>([]);

// Drawer states
const technicians = ref<any[]>([]);
const customerHistory = ref<any[]>([]);
const vehicleHistory = ref<any[]>([]);
const vehicleSearched = ref(false);
const isReadOnlyCustomer = ref(false);

// Form
const form = reactive({
  customerPhone: "",
  customerName: "",
  licensePlate: "",
  vehicleColor: "",
  vehicleBrand: "",
  purchaseDate: "" as any,
  warrantyPeriodMonths: 36,
  currentOdo: 0,
  limitOdo: 100000,
  confirmExpiredWarranty: false,
  technicianId: "" as any,
  issueDescription: "",
  parts: [] as Array<{
    selectedVariantId?: number;
    partName: string;
    partCode: string;
    isWarranty: boolean;
    unitPrice: number;
    quantity: number;
    total: number;
  }>,
});

// Part inline validation rules
const partRules = {
  selectedVariantId: [
    { required: true, message: "Chọn phụ tùng", trigger: "change" },
  ],
  unitPrice: [{ required: true, message: "Nhập đơn giá", trigger: "blur" }],
};

// Form main validation rules
const formRules = reactive<FormRules>({
  customerPhone: [
    { required: true, message: "Vui lòng nhập số điện thoại", trigger: "blur" },
    {
      pattern: /^(03|05|07|08|09)\d{8}$/,
      message:
        "Số điện thoại Việt Nam không hợp lệ (10 số, bắt đầu bằng 03/05/07/08/09)",
      trigger: "blur",
    },
  ],
  customerName: [
    {
      required: true,
      message: "Vui lòng nhập họ tên khách hàng",
      trigger: "blur",
    },
  ],
  licensePlate: [
    { required: true, message: "Vui lòng nhập biển số xe", trigger: "blur" },
  ],
  currentOdo: [
    {
      required: true,
      message: "Vui lòng nhập số km hiện tại",
      trigger: "blur",
    },
  ],
  technicianId: [
    {
      required: true,
      message: "Vui lòng chọn kỹ thuật viên",
      trigger: "change",
    },
  ],
  issueDescription: [
    { required: true, message: "Vui lòng nhập mô tả lỗi", trigger: "blur" },
  ],
});

// Computed properties
const warrantyExpiryDate = computed(() => {
  if (!form.purchaseDate) return null;
  return dayjs(form.purchaseDate)
    .add(form.warrantyPeriodMonths, "month")
    .toDate();
});

const isTimeExpired = computed(() => {
  if (!warrantyExpiryDate.value) return false;
  return dayjs().isAfter(dayjs(warrantyExpiryDate.value));
});

const isOdoExpired = computed(() => {
  return form.currentOdo > form.limitOdo;
});

const isWarrantyValid = computed(() => {
  return !isTimeExpired.value && !isOdoExpired.value;
});

const warrantyRemainingDays = computed(() => {
  if (!warrantyExpiryDate.value) return 0;
  const diff = dayjs(warrantyExpiryDate.value).diff(dayjs(), "day");
  return diff > 0 ? diff : 0;
});

const totalPartsCost = computed(() => {
  return form.parts.reduce((sum, part) => {
    return sum + (part.isWarranty ? 0 : part.unitPrice * part.quantity || 0);
  }, 0);
});

// Methods
const formatDate = (val: string) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY HH:mm");
};

const formatDateOnly = (val: any) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY");
};

const formatPrice = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const getStatusTagType = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s.includes("completed")) return "success";
  if (s.includes("approved")) return "warning";
  if (s.includes("replaced")) return "primary";
  if (s.includes("rejected")) return "danger";
  return "info";
};

const getStatusLabel = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s === "received") return "Tiếp nhận";
  if (s === "pendingmanufacturer") return "Chờ hãng thẩm định";
  if (s === "approved") return "Đã duyệt bồi hoàn";
  if (s === "replaced") return "Thợ thay thế";
  if (s === "completed") return "Hoàn tất - Đóng hồ sơ";
  if (s === "rejected") return "Từ chối";
  return status;
};

// APIs integration
async function loadData() {
  loading.value = true;
  try {
    const sieveFilters: string[] = [];
    if (filters.search) {
      sieveFilters.push(`search==${filters.search}`);
    }
    if (filters.status) {
      sieveFilters.push(`status==${filters.status}`);
    }

    const res = await WarrantyClaimApi.getList({
      current: pagination.current,
      size: pagination.size,
      filters: sieveFilters.join(","),
    });

    if (res && res.items) {
      tableData.value = res.items;
      pagination.total = res.totalCount;
    } else {
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách bảo hành:", error);
    ElMessage.error("Không thể tải danh sách phiếu bảo hành.");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  void loadData();
}

function resetFilters() {
  filters.search = "";
  filters.status = "";
  handleSearch();
}

function handleSizeChange(size: number) {
  pagination.size = size;
  handleSearch();
}

function handleCurrentChange(page: number) {
  pagination.current = page;
  void loadData();
}

function openDetail(id: number) {
  router
    .push({ name: "ServiceWarrantyClaimDetail", params: { id } })
    .catch(() => null);
}

// Dialog/Drawer Functions
async function openCreateDrawer() {
  // Clear form
  Object.assign(form, {
    customerPhone: "",
    customerName: "",
    licensePlate: "",
    vehicleColor: "",
    vehicleBrand: "",
    purchaseDate: "",
    warrantyPeriodMonths: 36,
    currentOdo: 0,
    limitOdo: 100000,
    confirmExpiredWarranty: false,
    technicianId: "",
    issueDescription: "",
    parts: [],
  });

  customerHistory.value = [];
  vehicleHistory.value = [];
  vehicleSearched.value = false;
  isReadOnlyCustomer.value = false;
  drawerVisible.value = true;
  void loadAvailableParts();

  // Load employees
  try {
    const res = await EmployeeApi.getList();
    // Filter technicians
    technicians.value = res || [];
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên:", error);
  }
}

// Tra cứu theo SĐT
let phoneTimeout: any = null;
function handlePhoneInput() {
  if (phoneTimeout) clearTimeout(phoneTimeout);

  const phone = form.customerPhone.trim();
  if (/^\d{10}$/.test(phone)) {
    phoneTimeout = setTimeout(async () => {
      try {
        const res = await VehicleApi.getPortfolio({
          query: phone,
          queryType: "phone",
          page: 1,
          pageSize: 10,
        });

        if (res && res.vehicle) {
          form.customerName = res.vehicle.fullName;
          isReadOnlyCustomer.value = true;
          // Hiển thị danh sách xe của khách
          customerHistory.value = [res.vehicle];
        } else {
          isReadOnlyCustomer.value = false;
          customerHistory.value = [];
        }
      } catch (err) {
        console.error("Lỗi tra cứu SĐT:", err);
      }
    }, 400);
  } else {
    isReadOnlyCustomer.value = false;
    customerHistory.value = [];
  }
}

// Tra cứu theo Biển số xe
let plateTimeout: any = null;
function handlePlateInput() {
  if (plateTimeout) clearTimeout(plateTimeout);

  const plate = form.licensePlate.trim();
  if (plate.length >= 7) {
    plateTimeout = setTimeout(async () => {
      try {
        const res = await VehicleApi.getPortfolio({
          query: plate,
          queryType: "licensePlate",
          page: 1,
          pageSize: 10,
        });

        if (res && res.vehicle) {
          form.customerName = res.vehicle.fullName;
          form.customerPhone = res.vehicle.phoneNumber;
          form.vehicleColor = res.vehicle.colorName || "N/A";
          form.vehicleBrand =
            `${res.vehicle.brandName || ""} ${res.vehicle.variantName || ""}`.trim() ||
            "N/A";
          form.purchaseDate = res.vehicle.purchaseDate;
          form.warrantyPeriodMonths = Number(res.vehicle.warrantyPeriod || 36);
          form.limitOdo = 100000;

          isReadOnlyCustomer.value = true;
          vehicleSearched.value = true;

          // Lịch sử sửa chữa/bảo hành xe
          vehicleHistory.value = res.history || [];
          calculateWarrantyStatus();
        } else {
          vehicleSearched.value = false;
          vehicleHistory.value = [];
        }
      } catch (err) {
        console.error("Lỗi tra cứu biển số:", err);
        vehicleSearched.value = false;
        vehicleHistory.value = [];
      }
    }, 400);
  } else {
    vehicleSearched.value = false;
    vehicleHistory.value = [];
  }
}

function calculateWarrantyStatus() {
  // Trigger update state computed
}

const availableParts = ref<any[]>([]);

async function loadAvailableParts() {
  try {
    const res = await ProductApi.getVariantsForOutput({
      current: 1,
      size: 500,
    });
    if (res && res.items) {
      availableParts.value = res.items;
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách phụ tùng:", error);
  }
}

function handlePartSelect(variantId: number, row: any) {
  const variant = availableParts.value.find((p) => p.id === variantId);
  if (variant) {
    row.partName = variant.displayName;
    row.partCode = variant.sku || String(variant.id);
    row.unitPrice = row.isWarranty ? 0 : variant.price || 0;
    row.total = row.unitPrice * row.quantity;
  }
}

// Parts management
function addPart() {
  form.parts.push({
    selectedVariantId: undefined,
    partName: "",
    partCode: "",
    isWarranty: true,
    unitPrice: 0,
    quantity: 1,
    total: 0,
  });
}

function removePart(index: number) {
  form.parts.splice(index, 1);
}

function handlePartTypeChange(row: any) {
  if (row.isWarranty) {
    row.unitPrice = 0;
  } else if (row.selectedVariantId) {
    const variant = availableParts.value.find(
      (p) => p.id === row.selectedVariantId,
    );
    row.unitPrice = variant ? variant.price || 0 : 0;
  }
  row.total = row.unitPrice * row.quantity;
}

// Submit Form
async function submitForm() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    // Check điều kiện bảo hành
    if (!isWarrantyValid.value && !form.confirmExpiredWarranty) {
      ElMessageBox.alert(
        "Xe đã hết thời hạn bảo hành! Bạn phải tích chọn xác nhận tạo phiếu bảo hành ngoại lệ ở Nhóm 3 để tiếp tục.",
        "Cảnh báo hết bảo hành",
        {
          type: "warning",
          confirmButtonText: "Đã hiểu",
        },
      );
      return;
    }

    submitting.value = true;
    try {
      // Map data to api (flatten based on quantity)
      const partsPayload: any[] = [];
      for (const p of form.parts) {
        const qty = p.quantity || 1;
        for (let i = 0; i < qty; i++) {
          partsPayload.push({
            partName: p.partName,
            partCode: p.partCode,
            unitPrice: p.isWarranty ? 0 : p.unitPrice,
          });
        }
      }

      await WarrantyClaimApi.create({
        licensePlate: form.licensePlate,
        issueDescription: form.issueDescription,
        serviceCenterName: "Trung tâm bảo hành AnhEmMotor",
        manufacturerClaimNumber: "",
        parts: partsPayload,
      });

      ElMessage.success("Tạo phiếu bảo hành thành công!");
      drawerVisible.value = false;
      handleSearch();
    } catch (error: any) {
      console.error("Lỗi khi tạo phiếu bảo hành:", error);
      ElMessage.error(error.message || "Tạo phiếu bảo hành thất bại.");
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.parts-table :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.warranty-drawer :deep(.el-drawer__body) {
  padding-bottom: 80px;
}
</style>
