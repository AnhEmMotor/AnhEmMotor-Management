<template>
  <div class="resp-page invoices-page flex flex-col gap-4 pb-5">
    <!-- Header & Quick KPIs -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-blue-500"
        :class="{ 'ring-2 ring-blue-400': filterStatus === '' }"
        @click="filterStatus = ''; handleSearch();"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Tất cả hóa đơn</div>
            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{{ totalCount }}</div>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:file-list-3-line" />
          </div>
        </div>
      </ElCard>

      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-amber-500"
        :class="{ 'ring-2 ring-amber-400': filterStatus === 'pending' }"
        @click="filterStatus = 'pending'; handleSearch();"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Chờ xử lý</div>
            <div class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.pending }}</div>
          </div>
          <div class="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:time-line" />
          </div>
        </div>
      </ElCard>

      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-indigo-500"
        :class="{ 'ring-2 ring-indigo-400': filterStatus === 'processing' }"
        @click="filterStatus = 'processing'; handleSearch();"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Chờ Admin duyệt</div>
            <div class="text-2xl font-bold text-indigo-600 mt-1">{{ statusCounts.processing }}</div>
          </div>
          <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:user-shared-line" />
          </div>
        </div>
      </ElCard>

      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-emerald-500"
        :class="{ 'ring-2 ring-emerald-400': filterStatus === 'completed' }"
        @click="filterStatus = 'completed'; handleSearch();"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Đã duyệt / Hoàn tất</div>
            <div class="text-2xl font-bold text-emerald-600 mt-1">{{ statusCounts.completed }}</div>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:checkbox-circle-line" />
          </div>
        </div>
      </ElCard>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3 flex-wrap">
        <ElInput
          v-model="searchQuery"
          placeholder="Tìm theo mã HĐ, tên KH, SĐT, Số khung, Số máy..."
          clearable
          size="default"
          style="width: 360px"
          @input="handleSearch"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
        <ElSelect
          v-model="filterStatus"
          placeholder="Trạng thái hóa đơn"
          size="default"
          clearable
          style="width: 200px"
          @change="handleSearch"
        >
          <ElOption label="📋 Tất cả trạng thái" value="" />
          <ElOption label="📝 Chờ xử lý" value="pending" />
          <ElOption label="⏳ Chờ Admin duyệt" value="processing" />
          <ElOption label="✅ Đã duyệt / Hoàn tất" value="completed" />
          <ElOption label="❌ Đã hủy" value="cancelled" />
        </ElSelect>
        <ElButton plain @click="handleResetFilters">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
          Tải lại
        </ElButton>
      </div>
      <ElButton type="primary" @click="handleCreate">
        <ElIcon class="mr-1"><Plus /></ElIcon>
        Tạo hóa đơn mới
      </ElButton>
    </div>

    <!-- Main Invoices Table -->
    <ElCard shadow="never" class="invoice-list-card">
      <ElTable
        :data="paginatedInvoices"
        style="width: 100%"
        stripe
        border
        v-loading="loadingList"
        :header-cell-style="{ background: 'var(--el-fill-color-light)', color: 'var(--el-text-color-primary)', fontWeight: '600' }"
        @row-click="(row) => handleView(row)"
      >
        <ElTableColumn label="Mã HĐ" width="140" align="center">
          <template #default="{ row }">
            <ElTag size="small" type="primary" effect="plain" class="font-mono font-bold">
              {{ row.invoiceNumber }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Ngày lập" width="110" align="center">
          <template #default="{ row }">
            <span class="text-xs">{{ formatDate(row.issueDate) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Khách hàng" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-[var(--el-text-color-primary)]">{{ row.customerName }}</span>
              <span class="text-xs text-gray-500 flex items-center gap-1">
                <ArtSvgIcon icon="ri:phone-line" class="text-[11px]" />
                {{ row.customerPhone }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Xe bán" min-width="190">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-[var(--el-text-color-primary)]">{{ row.vehicleModel }}</span>
              <span class="text-xs text-gray-500">{{ row.vehicleColor }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số khung / Máy" width="150" align="center">
          <template #default="{ row }">
            <div class="flex flex-col text-xs font-mono">
              <span class="text-gray-700 dark:text-gray-300">K: {{ row.chassisNo }}</span>
              <span class="text-gray-400">M: {{ row.engineNo }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Tổng tiền" width="140" align="right">
          <template #default="{ row }">
            <span class="font-bold text-[var(--el-text-color-primary)]">
              {{ formatCurrency(row.totalAmount) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thanh toán" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="getPaymentTagType(row.paymentMethod)" size="small">
              {{ getPaymentLabel(row.paymentMethod) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Trạng thái" width="140" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusTagType(row.status)" size="small" effect="light" class="font-medium">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thao tác" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1.5 whitespace-nowrap" @click.stop>
              <!-- Nút Gửi duyệt khi đang pending -->
              <ElButton
                v-if="row.status === 'pending'"
                type="warning"
                size="small"
                plain
                :loading="row._loading"
                @click="handleSendForApproval(row)"
              >
                📤 Gửi duyệt
              </ElButton>

              <!-- Nút Duyệt đơn khi đang processing -->
              <ElButton
                v-if="row.status === 'processing'"
                type="success"
                size="small"
                plain
                :loading="row._loading"
                @click="handleApproveInvoice(row)"
              >
                ✓ Duyệt đơn
              </ElButton>

              <!-- Nút Đổi trạng thái dropdown -->
              <ElDropdown trigger="click" @command="(cmd: string) => handleQuickChangeStatus(row, cmd)">
                <ElButton size="small" type="info" plain>
                  Đổi TT <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
                </ElButton>
                <template #dropdown>
                  <ElDropdownMenu>
                    <ElDropdownItem command="pending" :disabled="row.status === 'pending'">
                      📝 Chờ xử lý
                    </ElDropdownItem>
                    <ElDropdownItem command="processing" :disabled="row.status === 'processing'">
                      ⏳ Gửi Admin duyệt
                    </ElDropdownItem>
                    <ElDropdownItem command="completed" :disabled="row.status === 'completed'">
                      ✅ Duyệt / Hoàn tất
                    </ElDropdownItem>
                    <ElDropdownItem command="cancelled" divided :disabled="row.status === 'cancelled'">
                      ❌ Hủy hóa đơn
                    </ElDropdownItem>
                  </ElDropdownMenu>
                </template>
              </ElDropdown>

              <ElButton link type="primary" size="small" @click="handleView(row)">
                Chi tiết
              </ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- Pagination -->
    <div class="flex justify-between items-center mt-2 px-1">
      <span class="text-xs text-gray-500">
        Hiển thị {{ paginatedInvoices.length }} / {{ filteredInvoices.length }} hóa đơn
      </span>
      <ElPagination
        v-model:currentPage="pagination.current"
        v-model:pageSize="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredInvoices.length"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- Invoice Detail Dialog -->
    <ElDialog
      v-model="dialog.visible"
      width="820px"
      :close-on-click-modal="false"
      destroy-on-close
      class="premium-invoice-modal"
      :show-close="true"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ArtSvgIcon icon="ri:file-list-3-line" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 m-0 leading-tight">
              Chi tiết Hóa Đơn Bán Xe
            </h3>
            <p class="text-sm text-primary font-mono font-bold m-0 mt-1">
              {{ dialog.invoice?.invoiceNumber }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="dialog.invoice" class="premium-invoice-body">
        <div
          class="flex justify-between items-center bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl mb-5 border border-gray-100 dark:border-gray-700"
        >
          <div>
            <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng thái Hóa đơn</div>
            <ElTag
              :type="getStatusTagType(dialog.invoice.status)"
              effect="dark"
              size="large"
              class="font-bold px-4"
            >
              {{ getStatusLabel(dialog.invoice.status) }}
            </ElTag>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng thanh toán</div>
            <div class="text-2xl font-black text-red-600 dark:text-red-400">
              {{ formatCurrency(dialog.invoice.totalAmount) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="info-card">
            <div
              class="card-header flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold mb-3 pb-2 border-b"
            >
              <ArtSvgIcon icon="ri:user-smile-line" class="text-blue-500" />
              <span>Thông tin Khách hàng</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Họ tên:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ dialog.invoice.customerName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Điện thoại:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ dialog.invoice.customerPhone }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số CCCD:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{
                  dialog.invoice.customerIdCard || '-'
                }}</span>
              </div>
              <div class="flex flex-col gap-0.5 mt-1">
                <span class="text-gray-500">Địa chỉ:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200 text-xs leading-snug">{{
                  dialog.invoice.customerAddress
                }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div
              class="card-header flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold mb-3 pb-2 border-b"
            >
              <ArtSvgIcon icon="ri:motorbike-fill" class="text-orange-500" />
              <span>Thông tin Xe máy</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Dòng xe:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ dialog.invoice.vehicleModel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Màu sơn:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ dialog.invoice.vehicleColor }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số khung:</span>
                <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{{
                  dialog.invoice.chassisNo
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số máy:</span>
                <span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">{{
                  dialog.invoice.engineNo
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/40">
          <div class="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold mb-3">
            <ArtSvgIcon icon="ri:bill-line" />
            <span>Chi tiết Thanh toán & Bàn giao</span>
          </div>

          <div class="space-y-2 mb-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Giá trị xe (đã gồm VAT):</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                formatCurrency(dialog.invoice.vehiclePrice)
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Phí đăng ký (Biển số / trước bạ):</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                formatCurrency(dialog.invoice.registrationFee)
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Phí bảo hiểm:</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                formatCurrency(dialog.invoice.insuranceFee)
              }}</span>
            </div>
          </div>

          <div class="border-t border-blue-200 dark:border-blue-800/60 pt-3 flex justify-between items-center text-sm">
            <div>
              <span class="text-gray-500 block text-xs mb-1">Phương thức TT</span>
              <ElTag size="small" type="info">
                {{ getPaymentLabel(dialog.invoice.paymentMethod) }}
              </ElTag>
            </div>
            <div class="text-center">
              <span class="text-gray-500 block text-xs mb-1">Nhân viên bán hàng</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{ dialog.invoice.salesPerson || '---' }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-500 block text-xs mb-1">Ngày lập HĐ</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                formatDate(dialog.invoice.issueDate)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center gap-3 px-2 pb-2">
          <div class="flex items-center gap-2">
            <!-- Nút gửi duyệt từ Modal -->
            <ElButton
              v-if="dialog.invoice?.status === 'pending'"
              type="warning"
              :loading="actionLoading"
              @click="handleSendForApproval(dialog.invoice)"
            >
              📤 Gửi Admin duyệt
            </ElButton>
            <!-- Nút duyệt đơn từ Modal -->
            <ElButton
              v-if="dialog.invoice?.status === 'processing' || dialog.invoice?.status === 'pending'"
              type="success"
              :loading="actionLoading"
              @click="handleApproveInvoice(dialog.invoice)"
            >
              ✓ Duyệt hóa đơn
            </ElButton>
            <!-- Nút hủy hóa đơn -->
            <ElButton
              v-if="dialog.invoice?.status !== 'cancelled'"
              type="danger"
              plain
              :loading="actionLoading"
              @click="handleCancelInvoice(dialog.invoice)"
            >
              Hủy HĐ
            </ElButton>
          </div>

          <div class="flex items-center gap-2">
            <ElButton type="primary" plain @click="handlePrintInvoice(dialog.invoice)">
              <ArtSvgIcon icon="ri:printer-line" class="mr-1" />
              In Hóa Đơn
            </ElButton>
            <ElButton @click="dialog.visible = false" plain>Đóng lại</ElButton>
          </div>
        </div>
      </template>
    </ElDialog>

    <!-- Create Invoice Dialog -->
    <ElDialog
      v-model="createDialog.visible"
      title="Tạo hóa đơn bán xe mới"
      width="65%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm
        v-if="createDialog.visible"
        :model="createDialog.form"
        label-width="160px"
        label-position="right"
      >
        <ElDivider content-position="left">📋 Thông tin khách hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Họ tên" required>
            <ElInput v-model="createDialog.form.customerName" />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" required>
            <ElInput v-model="createDialog.form.customerPhone" />
          </ElFormItem>
          <ElFormItem label="Số CCCD">
            <ElInput v-model="createDialog.form.customerIdCard" />
          </ElFormItem>
          <ElFormItem label="Địa chỉ">
            <ElInput v-model="createDialog.form.customerAddress" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">🏍️ Thông tin xe</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Dòng xe" required>
            <ElSelect
              v-model="createDialog.selectedVehicleId"
              filterable
              remote
              reserve-keyword
              :remote-method="searchVehicles"
              :loading="vehicleLoading"
              placeholder="Tìm và chọn dòng xe"
              class="w-full"
              @change="handleVehicleChange"
              @focus="() => searchVehicles('')"
            >
              <ElOption
                v-for="v in vehicleOptions"
                :key="v.id"
                :label="v.displayName"
                :value="v.id"
              >
                <div class="flex justify-between items-center w-full">
                  <span>{{ v.displayName }}</span>
                  <span class="text-xs text-gray-400 ml-4">{{ v.price ? v.price.toLocaleString('vi-VN') + ' đ' : '' }}</span>
                </div>
              </ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Màu sơn">
            <ElInput v-model="createDialog.form.vehicleColor" placeholder="VD: Đen nhám" />
          </ElFormItem>
          <ElFormItem label="Số khung" required>
            <ElInput v-model="createDialog.form.chassisNo" placeholder="VD: RLH12345678" />
          </ElFormItem>
          <ElFormItem label="Số máy" required>
            <ElInput v-model="createDialog.form.engineNo" placeholder="VD: E1234567" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💰 Chi tiết tài chính</ElDivider>
        <div class="grid grid-cols-3 gap-4">
          <ElFormItem label="Giá xe" required>
            <ElInputNumber
              v-model="createDialog.form.vehiclePrice"
              :min="0"
              :step="1000000"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí đăng ký">
            <ElInputNumber
              v-model="createDialog.form.registrationFee"
              :min="0"
              :step="100000"
              class="w-full"
            />
          </ElFormItem>
          <ElFormItem label="Phí bảo hiểm">
            <ElInputNumber
              v-model="createDialog.form.insuranceFee"
              :min="0"
              :step="100000"
              class="w-full"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💳 Thanh toán & Giao nhận</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Phương thức" required>
            <ElSelect v-model="createDialog.form.paymentMethod" class="w-full">
              <ElOption label="Chuyển khoản" value="transfer" />
              <ElOption label="Tiền mặt" value="cash" />
              <ElOption label="Trả góp" value="installment" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngân hàng">
            <ElInput
              v-model="createDialog.form.bankName"
              placeholder="VD: Vietcombank, MBBank..."
            />
          </ElFormItem>
          <ElFormItem label="NV bán hàng">
            <ElInput v-model="createDialog.form.salesPerson" placeholder="Tên nhân viên phụ trách" />
          </ElFormItem>
          <ElFormItem label="Ngày giao dự kiến">
            <ElDatePicker
              v-model="createDialog.form.deliveryDate"
              type="date"
              placeholder="Chọn ngày giao xe"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <ElButton @click="createDialog.visible = false">Hủy</ElButton>
        <ElButton type="primary" :loading="actionLoading" @click="handleSave">
          Tạo hóa đơn
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue';
import {
  invoiceApi,
  type AdminInvoiceDetailResponse,
} from '@/api/sales/invoice.api';
import { ProductApi } from '@/api/product/product.api';
import type { ProductVariantLiteForInput } from '@/domain/product/product.types';

defineOptions({ name: 'OrderProductInvoice' });

interface InvoiceRow {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  status: string;
  salesPerson?: string;
  deliveryDate?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  _loading?: boolean;
}

const invoices = ref<InvoiceRow[]>([]);
const loadingList = ref(false);
const actionLoading = ref(false);
const searchQuery = ref('');
const filterStatus = ref<string>('');
const totalCount = ref(0);
const pagination = reactive({ current: 1, size: 10 });

const dialog = reactive({
  visible: false,
  readonly: true,
  title: '',
  invoice: null as any,
});

const createDialog = reactive({
  visible: false,
  selectedVehicleId: undefined as number | undefined,
  form: {
    customerName: '',
    customerPhone: '',
    customerIdCard: '',
    customerAddress: '',
    vehicleModel: '',
    vehicleColor: '',
    chassisNo: '',
    engineNo: '',
    vehiclePrice: 0,
    registrationFee: 0,
    insuranceFee: 0,
    paymentMethod: 'transfer',
    bankName: '',
    salesPerson: '',
    deliveryDate: '',
  } as any,
});

const statusCounts = computed(() => {
  const all = invoices.value;
  return {
    pending: all.filter((i) => i.status === 'pending').length,
    processing: all.filter((i) => i.status === 'processing').length,
    completed: all.filter((i) => i.status === 'completed').length,
    cancelled: all.filter((i) => i.status === 'cancelled').length,
  };
});

const filteredInvoices = computed(() => {
  let result = invoices.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.toLowerCase().includes(q) ||
        inv.chassisNo.toLowerCase().includes(q) ||
        inv.engineNo.toLowerCase().includes(q) ||
        inv.vehicleModel.toLowerCase().includes(q)
    );
  }
  if (filterStatus.value) {
    result = result.filter((inv) => inv.status === filterStatus.value);
  }
  return result;
});

const paginatedInvoices = computed(() => {
  const start = (pagination.current - 1) * pagination.size;
  const end = start + pagination.size;
  return filteredInvoices.value.slice(start, end);
});

const vehicleOptions = ref<ProductVariantLiteForInput[]>([]);
const vehicleLoading = ref(false);

async function searchVehicles(keyword: string = '') {
  vehicleLoading.value = true;
  try {
    // Chỉ lọc các sản phẩm thuộc danh mục "Xe máy" (CategoryId = 8)
    const filters = [`Product.CategoryId==8`];
    if (keyword) {
      filters.push(`search@=${keyword}`);
    }
    const res = await ProductApi.getVariantsForOutput({
      current: 1,
      size: 50,
      Filters: filters.join(','),
    });
    vehicleOptions.value = res.items || [];
  } catch (error) {
    console.error('Lỗi tải danh sách xe:', error);
  } finally {
    vehicleLoading.value = false;
  }
}

function handleVehicleChange(variantId: number) {
  const variant = vehicleOptions.value.find(v => v.id === variantId);
  if (variant) {
    createDialog.form.vehicleModel = variant.displayName;
    createDialog.form.vehiclePrice = variant.price || 0;
    if (variant.colors && variant.colors.length > 0) {
      createDialog.form.vehicleColor = variant.colors[0].colorName || '';
    } else {
      createDialog.form.vehicleColor = '';
    }
  } else {
    createDialog.form.vehicleModel = '';
    createDialog.form.vehicleColor = '';
    createDialog.form.vehiclePrice = 0;
  }
}

async function fetchInvoices() {
  loadingList.value = true;
  try {
    const res = await invoiceApi.getAdminList({
      Page: 1,
      PageSize: 200,
    });
    invoices.value = (res.items ?? []).map((i) => ({ ...i, _loading: false }));
    totalCount.value = res.totalCount ?? res.items?.length ?? 0;
  } catch (e) {
    ElMessage.error('Không thể tải danh sách hóa đơn');
  } finally {
    loadingList.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.current = page;
}

function handleSizeChange(size: number) {
  pagination.size = size;
  pagination.current = 1;
}

function handleSearch() {
  pagination.current = 1;
}

function handleResetFilters() {
  searchQuery.value = '';
  filterStatus.value = '';
  pagination.current = 1;
  fetchInvoices();
}

function handleView(row: any) {
  dialog.visible = true;
  dialog.readonly = true;
  dialog.title = `Chi tiết hóa đơn ${row.invoiceNumber}`;
  dialog.invoice = { ...row };
}

// Action: Gửi Admin duyệt (pending -> processing)
async function handleSendForApproval(invoice: any) {
  try {
    await ElMessageBox.confirm(
      `Gửi yêu cầu phê duyệt cho hóa đơn ${invoice.invoiceNumber} tới Admin?`,
      'Xác nhận gửi duyệt',
      {
        confirmButtonText: 'Gửi duyệt ngay',
        cancelButtonText: 'Hủy',
        type: 'info',
      }
    );

    invoice._loading = true;
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: 'processing',
      processedBy: 'NV Quản lý đơn',
    });

    ElMessage.success(`Hóa đơn ${invoice.invoiceNumber} đã được gửi Admin duyệt thành công!`);
    invoice.status = 'processing';
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = 'processing';
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Không thể gửi duyệt hóa đơn');
    }
  } finally {
    invoice._loading = false;
    actionLoading.value = false;
  }
}

// Action: Duyệt hóa đơn (processing/pending -> completed)
async function handleApproveInvoice(invoice: any) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận phê duyệt và hoàn tất hóa đơn ${invoice.invoiceNumber}?`,
      'Phê duyệt hóa đơn',
      {
        confirmButtonText: 'Duyệt hoàn tất',
        cancelButtonText: 'Đóng',
        type: 'success',
      }
    );

    invoice._loading = true;
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: 'completed',
      processedBy: 'Admin Tổng',
    });

    ElMessage.success(`Hóa đơn ${invoice.invoiceNumber} đã được duyệt và hoàn tất thành công!`);
    invoice.status = 'completed';
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = 'completed';
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Không thể phê duyệt hóa đơn');
    }
  } finally {
    invoice._loading = false;
    actionLoading.value = false;
  }
}

// Action: Hủy hóa đơn (-> cancelled)
async function handleCancelInvoice(invoice: any) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn hủy hóa đơn ${invoice.invoiceNumber}?`,
      'Cảnh báo hủy hóa đơn',
      {
        confirmButtonText: 'Đồng ý hủy',
        cancelButtonText: 'Bỏ qua',
        type: 'warning',
      }
    );

    invoice._loading = true;
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: 'cancelled',
      processedBy: 'NV Quản lý đơn',
    });

    ElMessage.info(`Hóa đơn ${invoice.invoiceNumber} đã chuyển sang trạng thái đã hủy.`);
    invoice.status = 'cancelled';
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = 'cancelled';
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Không thể hủy hóa đơn');
    }
  } finally {
    invoice._loading = false;
    actionLoading.value = false;
  }
}

// Action: Đổi nhanh trạng thái từ Dropdown
async function handleQuickChangeStatus(invoice: any, newStatus: string) {
  try {
    invoice._loading = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: newStatus,
      processedBy: 'NV Quản lý đơn',
    });

    ElMessage.success(`Hóa đơn ${invoice.invoiceNumber} đã đổi sang "${getStatusLabel(newStatus)}"`);
    invoice.status = newStatus;
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = newStatus;
    }
  } catch (e) {
    ElMessage.error('Không thể thay đổi trạng thái');
  } finally {
    invoice._loading = false;
  }
}

const handlePrintInvoice = (invoice: any) => {
  window.print();
};

const handleCreate = () => {
  createDialog.form = {
    customerName: '',
    customerPhone: '',
    customerIdCard: '',
    customerAddress: '',
    vehicleModel: '',
    vehicleColor: '',
    chassisNo: '',
    engineNo: '',
    vehiclePrice: 0,
    registrationFee: 0,
    insuranceFee: 0,
    paymentMethod: 'transfer',
    bankName: '',
    salesPerson: '',
    deliveryDate: '',
  };
  createDialog.selectedVehicleId = undefined;
    
  // Load initial vehicle list
  searchVehicles('');
    
  createDialog.visible = true;
};

async function handleSave() {
  if (!createDialog.form.customerName) {
    ElMessage.warning('Vui lòng nhập tên khách hàng');
    return;
  }
  if (!createDialog.form.customerPhone) {
    ElMessage.warning('Vui lòng nhập số điện thoại');
    return;
  }
  if (!createDialog.form.vehicleModel) {
    ElMessage.warning('Vui lòng nhập dòng xe');
    return;
  }
  actionLoading.value = true;
  try {
    await invoiceApi.createAdmin({
      ...createDialog.form,
    });
    ElMessage.success('Tạo hóa đơn thành công');
    createDialog.visible = false;
    fetchInvoices();
  } catch (e) {
    ElMessage.error('Không thể tạo hóa đơn');
  } finally {
    actionLoading.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '📝 Chờ xử lý',
    processing: '⏳ Chờ Admin duyệt',
    completed: '✅ Đã hoàn tất',
    cancelled: '❌ Đã hủy',
  };
  return map[status] || status;
}

function getStatusTagType(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    cancelled: 'danger',
  };
  return map[status] || 'info';
}

function getPaymentLabel(method: string) {
  const map: Record<string, string> = {
    transfer: 'Chuyển khoản',
    cash: 'Tiền mặt',
    installment: 'Trả góp',
  };
  return map[method] || method;
}

function getPaymentTagType(method: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    transfer: 'primary',
    cash: 'success',
    installment: 'warning',
  };
  return map[method] || 'info';
}

onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped lang="scss">
.premium-invoice-modal {
  :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
  }
}

.premium-invoice-body {
  .info-card {
    @apply bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm;
  }
}

.invoices-page {
  padding: 16px;
}

.invoice-list-card {
  border-radius: 8px;
}

@media print {
  @page {
    margin: 5mm !important;
  }

  body * {
    visibility: hidden;
  }

  .premium-invoice-modal,
  .premium-invoice-modal * {
    visibility: visible;
  }

  .premium-invoice-modal {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .premium-invoice-modal :deep(.el-dialog__headerbtn),
  .premium-invoice-modal :deep(.el-dialog__footer) {
    display: none !important;
  }
}
</style>
