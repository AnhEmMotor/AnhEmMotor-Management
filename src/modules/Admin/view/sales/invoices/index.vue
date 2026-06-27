<template>
  <div class="invoices-page flex flex-col gap-4 pb-5">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <ElInput
          v-model="searchQuery"
          placeholder="Tìm theo mã HĐ, tên KH, Số khung, Số máy..."
          clearable
          size="default"
          style="width: 380px"
          @input="handleSearch"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
        <ElSelect
          v-model="filterStatus"
          placeholder="Trạng thái"
          size="default"
          clearable
          @change="handleSearch"
        >
          <ElOption label="📝 Chờ thanh toán" value="pending" />
          <ElOption label="✅ Đã hoàn tất" value="completed" />
          <ElOption label="🔄 Đang xử lý" value="processing" />
          <ElOption label="❌ Đã hủy" value="cancelled" />
        </ElSelect>
      </div>
      <ElButton type="primary" @click="handleCreateNew">
        <ElIcon class="mr-1"><Plus /></ElIcon>
        Tạo hóa đơn mới
      </ElButton>
    </div>

    <!-- Invoice List -->
    <ElCard shadow="never" class="invoice-list-card">
      <ElTable
        :data="paginatedInvoices"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <ElTableColumn label="Mã HĐ" width="130" align="center">
          <template #default="{ row }">
            <ElText type="primary" tag="b">{{ row.invoiceCode }}</ElText>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Ngày lập" width="110" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="Khách hàng" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.customerName }}</span>
              <span class="text-xs text-gray-500">{{ row.customerPhone }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Xe bán" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium">{{ row.vehicleModel }}</span>
              <span class="text-xs text-gray-500">{{ row.vehicleColor }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số khung" width="140" align="center">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ row.chassisNo }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số máy" width="140" align="center">
          <template #default="{ row }">
            <span class="font-mono text-xs">{{ row.engineNo }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Tổng tiền" width="140" align="right">
          <template #default="{ row }">
            <span class="font-bold text-gray-800">{{
              formatCurrency(row.totalAmount)
            }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thanh toán" width="130" align="center">
          <template #default="{ row }">
            <ElTag :type="getPaymentTagType(row.paymentMethod)" size="small">
              {{ getPaymentLabel(row.paymentMethod) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Trạng thái" width="130" align="center">
          <template #default="{ row }">
            <ElTag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
      </ElTable>

      <!-- Pagination -->
      <div class="flex justify-end mt-4">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="filteredInvoices.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </ElCard>

    <!-- Invoice Detail Dialog -->
    <ElDialog
      v-model="drawer.visible"
      :title="drawer.invoice ? `Hóa đơn ${drawer.invoice.invoiceCode}` : ''"
      width="55%"
      :destroy-on-close="true"
    >
      <div v-if="drawer.invoice" class="invoice-detail">
        <!-- Invoice Document View -->
        <div class="invoice-document bg-white border rounded-lg p-6 shadow-sm">
          <!-- Invoice Header -->
          <div class="invoice-header text-center border-b pb-4 mb-4">
            <h2 class="text-xl font-bold text-gray-800 mb-1">
              HÓA ĐƠN BÁN HÀNG
            </h2>
            <p class="text-sm text-gray-500">
              Mã hóa đơn:
              <ElText type="primary" tag="b">{{
                drawer.invoice.invoiceCode
              }}</ElText>
            </p>
            <p class="text-sm text-gray-500">
              Ngày lập: {{ formatDateTime(drawer.invoice.createdAt) }}
            </p>
          </div>

          <!-- Customer Info Section -->
          <div class="section mb-4">
            <h4
              class="section-title font-bold text-gray-700 mb-2 pb-1 border-b"
            >
              📋 Thông tin khách hàng
            </h4>
            <div class="info-grid grid grid-cols-2 gap-3">
              <div class="info-item">
                <span class="label text-xs text-gray-500"
                  >Họ tên (theo CCCD)</span
                >
                <div class="value font-medium">
                  {{ drawer.invoice.customerName }}
                </div>
              </div>
              <div class="info-item">
                <span class="label text-xs text-gray-500">Số CCCD</span>
                <div class="value font-mono font-medium">
                  {{ drawer.invoice.customerIdCard || "---" }}
                </div>
              </div>
              <div class="info-item">
                <span class="label text-xs text-gray-500">Số điện thoại</span>
                <div class="value font-medium">
                  {{ drawer.invoice.customerPhone }}
                </div>
              </div>
              <div class="info-item col-span-2">
                <span class="label text-xs text-gray-500"
                  >Địa chỉ thường trú</span
                >
                <div class="value font-medium">
                  {{ drawer.invoice.customerAddress }}
                </div>
              </div>
            </div>
          </div>

          <!-- Vehicle Info Section -->
          <div class="section mb-4">
            <h4
              class="section-title font-bold text-gray-700 mb-2 pb-1 border-b"
            >
              🏍️ Thông tin xe
            </h4>
            <div class="info-grid grid grid-cols-2 gap-3">
              <div class="info-item">
                <span class="label text-xs text-gray-500">Dòng xe</span>
                <div class="value font-medium">
                  {{ drawer.invoice.vehicleModel }}
                </div>
              </div>
              <div class="info-item">
                <span class="label text-xs text-gray-500">Màu sơn</span>
                <div class="value font-medium">
                  {{ drawer.invoice.vehicleColor }}
                </div>
              </div>
              <div class="info-item">
                <span class="label text-xs text-gray-500"
                  >Số khung (Chassis No)</span
                >
                <div class="value font-mono font-bold text-primary">
                  {{ drawer.invoice.chassisNo }}
                </div>
              </div>
              <div class="info-item">
                <span class="label text-xs text-gray-500"
                  >Số máy (Engine No)</span
                >
                <div class="value font-mono font-bold text-primary">
                  {{ drawer.invoice.engineNo }}
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Details Section -->
          <div class="section mb-4">
            <h4
              class="section-title font-bold text-gray-700 mb-2 pb-1 border-b"
            >
              💰 Chi tiết tài chính
            </h4>
            <div class="financial-table">
              <div
                class="financial-row flex justify-between py-2 border-b border-dashed"
              >
                <span class="text-gray-600">Giá xe (đã gồm VAT)</span>
                <span class="font-medium">{{
                  formatCurrency(drawer.invoice.vehiclePrice)
                }}</span>
              </div>
              <div
                v-if="drawer.invoice.registrationFee"
                class="financial-row flex justify-between py-2 border-b border-dashed"
              >
                <span class="text-gray-600">Phí đăng ký biển số</span>
                <span class="font-medium">{{
                  formatCurrency(drawer.invoice.registrationFee)
                }}</span>
              </div>
              <div
                v-if="drawer.invoice.insuranceFee"
                class="financial-row flex justify-between py-2 border-b border-dashed"
              >
                <span class="text-gray-600">Phí bảo hiểm TNDS</span>
                <span class="font-medium">{{
                  formatCurrency(drawer.invoice.insuranceFee)
                }}</span>
              </div>
              <div
                class="financial-row flex justify-between py-3 border-t-2 text-base font-bold"
              >
                <span>Tổng giá trị hóa đơn</span>
                <span class="text-primary text-lg">{{
                  formatCurrency(drawer.invoice.totalAmount)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Method Section -->
          <div class="section mb-4">
            <h4
              class="section-title font-bold text-gray-700 mb-2 pb-1 border-b"
            >
              💳 Phương thức thanh toán
            </h4>
            <div class="payment-info bg-gray-50 p-3 rounded">
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600">Phương thức:</span>
                <ElTag
                  :type="getPaymentTagType(drawer.invoice.paymentMethod)"
                  size="default"
                >
                  {{ getPaymentLabel(drawer.invoice.paymentMethod) }}
                </ElTag>
              </div>
              <div
                v-if="drawer.invoice.bankName"
                class="flex justify-between mb-1"
              >
                <span class="text-sm text-gray-600">Ngân hàng tài trợ:</span>
                <span class="text-sm font-medium">{{
                  drawer.invoice.bankName
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600"
                  >Trạng thái thanh toán:</span
                >
                <ElTag
                  :type="getStatusTagType(drawer.invoice.status)"
                  size="small"
                >
                  {{ getStatusLabel(drawer.invoice.status) }}
                </ElTag>
              </div>
            </div>
          </div>

          <!-- Payment Breakdown (for split payments) -->
          <div
            v-if="
              drawer.invoice.paymentBreakdown &&
              drawer.invoice.paymentBreakdown.length > 1
            "
            class="section mb-4"
          >
            <h4
              class="section-title font-bold text-gray-700 mb-2 pb-1 border-b"
            >
              📊 Chi tiết thanh toán
            </h4>
            <ElTable
              :data="drawer.invoice.paymentBreakdown"
              border
              size="small"
              max-height="200"
            >
              <ElTableColumn label="Hình thức" width="150">
                <template #default="{ row }">
                  {{ row.method }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="Số tiền" width="150" align="right">
                <template #default="{ row }">
                  {{ formatCurrency(row.amount) }}
                </template>
              </ElTableColumn>
              <ElTableColumn label="Ghi chú" min-width="150">
                <template #default="{ row }">
                  {{ row.note || "---" }}
                </template>
              </ElTableColumn>
            </ElTable>
          </div>

          <!-- Sales Staff Info -->
          <div class="section">
            <h4
              class="section-title font-bold text-gray-700 mb-2 pb-1 border-b"
            >
              👤 Thông tin bán hàng
            </h4>
            <div class="info-grid grid grid-cols-2 gap-3">
              <div class="info-item">
                <span class="label text-xs text-gray-500"
                  >Nhân viên bán hàng</span
                >
                <div class="value font-medium">
                  {{ drawer.invoice.salesPerson || "---" }}
                </div>
              </div>
              <div class="info-item">
                <span class="label text-xs text-gray-500"
                  >Ngày bàn giao dự kiến</span
                >
                <div class="value font-medium">
                  {{
                    drawer.invoice.deliveryDate
                      ? formatDate(drawer.invoice.deliveryDate)
                      : "---"
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <ElCard
        v-else
        shadow="never"
        class="flex items-center justify-center"
        style="min-height: 400px"
      >
        <ElEmpty
          description="Chọn một hóa đơn từ danh sách để xem chi tiết"
          :image-size="80"
        />
      </ElCard>

      <!-- Footer Actions -->
      <template #footer>
        <div
          class="flex justify-end gap-2"
          v-if="drawer.invoice && drawer.invoice.status === 'pending'"
        >
          <ElButton @click="drawer.visible = false">Đóng</ElButton>
          <ElButton
            type="success"
            @click="handleMarkCompleted"
            :loading="actionLoading"
          >
            ✓ Xác nhận thanh toán
          </ElButton>
        </div>
        <div
          v-else-if="drawer.invoice && drawer.invoice.status === 'completed'"
          class="text-sm text-gray-500 text-right"
        >
          Đã hoàn tất bởi {{ drawer.invoice.processedBy || "---" }} lúc
          {{
            drawer.invoice.processedAt
              ? formatDateTime(drawer.invoice.processedAt)
              : "---"
          }}
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Plus } from "@element-plus/icons-vue";
import { invoiceApi } from "@/api/sales/invoice.api";

defineOptions({ name: "SalesInvoices" });

const USE_MOCK = true;

// ==================== TYPES ====================
interface PaymentBreakdownItem {
  method: string;
  amount: number;
  note?: string;
}

interface Invoice {
  id: number;
  invoiceCode: string;
  createdAt: string;
  customerName: string;
  customerIdCard: string;
  customerPhone: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  totalAmount: number;
  paymentMethod: "cash" | "transfer" | "installment" | "mixed";
  bankName?: string;
  paymentBreakdown?: PaymentBreakdownItem[];
  status: "pending" | "completed" | "processing" | "cancelled";
  salesPerson: string;
  deliveryDate?: string;
  processedBy?: string;
  processedAt?: string;
}

// ==================== MOCK DATA ====================
function getMockInvoices(): Invoice[] {
  const now = new Date();
  const day = (hours: number) => hours * 60 * 60 * 1000;
  return [
    {
      id: 1,
      invoiceCode: "HD-20250627-0001",
      createdAt: new Date(now.getTime() - day(2)).toISOString(),
      customerName: "Nguyễn Văn An",
      customerIdCard: "079123456789",
      customerPhone: "0901234567",
      customerAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      vehicleModel: "Honda Winner X",
      vehicleColor: "Đỏ đen",
      chassisNo: "VTVK50CL123456",
      engineNo: "KFPL789012",
      vehiclePrice: 49900000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 52750000,
      paymentMethod: "mixed",
      bankName: "Vietcombank",
      paymentBreakdown: [
        { method: "Tiền mặt", amount: 20000000, note: "Đặt cọc" },
        { method: "Chuyển khoản", amount: 15000000, note: "Vietcombank" },
        { method: "Trả góp", amount: 17750000, note: "VPBank - 12 tháng" },
      ],
      status: "pending",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() + 3 * day(24)).toISOString(),
    },
    {
      id: 2,
      invoiceCode: "HD-20250627-0002",
      createdAt: new Date(now.getTime() - day(5)).toISOString(),
      customerName: "Lê Văn Cường",
      customerIdCard: "079234567890",
      customerPhone: "0923456789",
      customerAddress: "456 Lê Duẩn, Quận 1, TP.HCM",
      vehicleModel: "Yamaha Exciter 155",
      vehicleColor: "Xanh đen",
      chassisNo: "VTYM155CM234567",
      engineNo: "YMDM890123",
      vehiclePrice: 45900000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 48750000,
      paymentMethod: "transfer",
      bankName: "Techcombank",
      status: "completed",
      salesPerson: "Trần Thị B",
      deliveryDate: new Date(now.getTime() - day(24)).toISOString(),
      processedBy: "Nguyễn Văn A",
      processedAt: new Date(now.getTime() - day(4)).toISOString(),
    },
    {
      id: 3,
      invoiceCode: "HD-20250627-0003",
      createdAt: new Date(now.getTime() - day(1)).toISOString(),
      customerName: "Hoàng Thị Dung",
      customerIdCard: "079345678901",
      customerPhone: "0934567890",
      customerAddress: "789 Cách Mạng Tháng 8, Quận 3, TP.HCM",
      vehicleModel: "Honda SH 150i",
      vehicleColor: "Trắng",
      chassisNo: "VTSH150CP345678",
      engineNo: "SHFP901234",
      vehiclePrice: 85000000,
      registrationFee: 3000000,
      insuranceFee: 450000,
      totalAmount: 87950000,
      paymentMethod: "installment",
      bankName: "Sacombank",
      status: "processing",
      salesPerson: "Phạm Thị D",
      deliveryDate: new Date(now.getTime() + 5 * day(24)).toISOString(),
    },
    {
      id: 4,
      invoiceCode: "HD-20250627-0004",
      createdAt: new Date(now.getTime() - day(8)).toISOString(),
      customerName: "Vũ Văn Em",
      customerIdCard: "079456789012",
      customerPhone: "0945678901",
      customerAddress: "321 Võ Văn Ngân, Bình Thạnh, TP.HCM",
      vehicleModel: "Suzuki Raider R150",
      vehicleColor: "Đỏ",
      chassisNo: "VTSR150CR456789",
      engineNo: "SRFR012345",
      vehiclePrice: 42000000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 44850000,
      paymentMethod: "cash",
      status: "completed",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() - day(2)).toISOString(),
      processedBy: "Trần Thị B",
      processedAt: new Date(now.getTime() - day(7)).toISOString(),
    },
    {
      id: 5,
      invoiceCode: "HD-20250627-0005",
      createdAt: new Date(now.getTime() - day(12)).toISOString(),
      customerName: "Đặng Thị Phương",
      customerIdCard: "079567890123",
      customerPhone: "0956789012",
      customerAddress: "654 Đặng Thùy Trâm, Bình Thạnh, TP.HCM",
      vehicleModel: "Honda Air Blade 125",
      vehicleColor: "Bạc",
      chassisNo: "VTAB125CS567890",
      engineNo: "ABFS123456",
      vehiclePrice: 38000000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 40850000,
      paymentMethod: "mixed",
      bankName: "MB Bank",
      paymentBreakdown: [
        { method: "Tiền mặt", amount: 40850000, note: "Thanh toán toàn bộ" },
      ],
      status: "cancelled",
      salesPerson: "Phạm Thị D",
      processedBy: "Nguyễn Văn A",
      processedAt: new Date(now.getTime() - day(10)).toISOString(),
    },
    {
      id: 6,
      invoiceCode: "HD-20250627-0006",
      createdAt: new Date(now.getTime() - day(0.5)).toISOString(),
      customerName: "Bùi Văn Giang",
      customerIdCard: "079678901234",
      customerPhone: "0967890123",
      customerAddress: "147 Trần Hưng Đạo, Quận 1, TP.HCM",
      vehicleModel: "Yamaha Sirius 125",
      vehicleColor: "Xanh",
      chassisNo: "VTSI125CT678901",
      engineNo: "YSFT234567",
      vehiclePrice: 19500000,
      registrationFee: 2000000,
      insuranceFee: 300000,
      totalAmount: 21800000,
      paymentMethod: "cash",
      status: "pending",
      salesPerson: "Trần Thị B",
      deliveryDate: new Date(now.getTime() + 2 * day(24)).toISOString(),
    },
    {
      id: 7,
      invoiceCode: "HD-20250626-0007",
      createdAt: new Date(now.getTime() - day(24)).toISOString(),
      customerName: "Ngô Thị Hoa",
      customerIdCard: "079789012345",
      customerPhone: "0978901234",
      customerAddress: "88 Nguyễn Trãi, Thanh Xuân, Hà Nội",
      vehicleModel: "Honda Vision 110",
      vehicleColor: "Đỏ",
      chassisNo: "VTVN110CU789012",
      engineNo: "HVFU345678",
      vehiclePrice: 32000000,
      registrationFee: 2200000,
      insuranceFee: 320000,
      totalAmount: 34520000,
      paymentMethod: "transfer",
      bankName: "BIDV",
      status: "completed",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() - day(20)).toISOString(),
      processedBy: "Trần Thị B",
      processedAt: new Date(now.getTime() - day(23)).toISOString(),
    },
    {
      id: 8,
      invoiceCode: "HD-20250625-0008",
      createdAt: new Date(now.getTime() - day(48)).toISOString(),
      customerName: "Phạm Văn Khoa",
      customerIdCard: "079890123456",
      customerPhone: "0989012345",
      customerAddress: "56 Lê Lợi, Hải Châu, Đà Nẵng",
      vehicleModel: "Honda SH Mode 125",
      vehicleColor: "Vàng",
      chassisNo: "VTSH125CV901234",
      engineNo: "SHFV456789",
      vehiclePrice: 55000000,
      registrationFee: 2800000,
      insuranceFee: 400000,
      totalAmount: 58200000,
      paymentMethod: "installment",
      bankName: "VPBank",
      status: "completed",
      salesPerson: "Phạm Thị D",
      deliveryDate: new Date(now.getTime() - day(42)).toISOString(),
      processedBy: "Nguyễn Văn A",
      processedAt: new Date(now.getTime() - day(46)).toISOString(),
    },
    {
      id: 9,
      invoiceCode: "HD-20250624-0009",
      createdAt: new Date(now.getTime() - day(72)).toISOString(),
      customerName: "Lê Thị Mai",
      customerIdCard: "079901234567",
      customerPhone: "0900123456",
      customerAddress: "200 Nguyễn Văn Linh, TP. Biên Hòa, Đồng Nai",
      vehicleModel: "Yamaha Exciter 155",
      vehicleColor: "Xám",
      chassisNo: "VTYM155CW012345",
      engineNo: "YMDW567890",
      vehiclePrice: 45900000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 48750000,
      paymentMethod: "cash",
      status: "completed",
      salesPerson: "Trần Thị B",
      deliveryDate: new Date(now.getTime() - day(68)).toISOString(),
      processedBy: "Phạm Thị D",
      processedAt: new Date(now.getTime() - day(70)).toISOString(),
    },
    {
      id: 10,
      invoiceCode: "HD-20250623-0010",
      createdAt: new Date(now.getTime() - day(96)).toISOString(),
      customerName: "Trần Văn Nam",
      customerIdCard: "079012345678",
      customerPhone: "0911234567",
      customerAddress: "15 Hùng Vương, TP. Pleiku, Gia Lai",
      vehicleModel: "Honda Air Blade 125",
      vehicleColor: "Đen",
      chassisNo: "VTAB125CX123456",
      engineNo: "ABFX678901",
      vehiclePrice: 38000000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 40850000,
      paymentMethod: "transfer",
      bankName: "VietinBank",
      status: "completed",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() - day(90)).toISOString(),
      processedBy: "Trần Thị B",
      processedAt: new Date(now.getTime() - day(94)).toISOString(),
    },
    {
      id: 11,
      invoiceCode: "HD-20250622-0011",
      createdAt: new Date(now.getTime() - day(36)).toISOString(),
      customerName: "Vũ Thị Lan",
      customerIdCard: "031234567890",
      customerPhone: "0922345678",
      customerAddress: "78 Trần Phú, Quận 5, TP.HCM",
      vehicleModel: "Honda Vision 110",
      vehicleColor: "Trắng",
      chassisNo: "VTVN110CY234567",
      engineNo: "HVFY789012",
      vehiclePrice: 32000000,
      registrationFee: 2200000,
      insuranceFee: 320000,
      totalAmount: 34520000,
      paymentMethod: "mixed",
      bankName: "ACB",
      paymentBreakdown: [
        { method: "Tiền mặt", amount: 17520000, note: "Đặt cọc" },
        { method: "Chuyển khoản", amount: 17000000, note: "ACB" },
      ],
      status: "pending",
      salesPerson: "Phạm Thị D",
      deliveryDate: new Date(now.getTime() + 1 * day(24)).toISOString(),
    },
    {
      id: 12,
      invoiceCode: "HD-20250621-0012",
      createdAt: new Date(now.getTime() - day(60)).toISOString(),
      customerName: "Đỗ Văn Hùng",
      customerIdCard: "031345678901",
      customerPhone: "0933456789",
      customerAddress: "33 Phan Đình Phùng, TP. Huế, Thừa Thiên Huế",
      vehicleModel: "Yamaha Sirius 125",
      vehicleColor: "Xanh dương",
      chassisNo: "VTSI125CZ345678",
      engineNo: "YSFZ890123",
      vehiclePrice: 19500000,
      registrationFee: 2000000,
      insuranceFee: 300000,
      totalAmount: 21800000,
      paymentMethod: "cash",
      status: "completed",
      salesPerson: "Trần Thị B",
      deliveryDate: new Date(now.getTime() - day(55)).toISOString(),
      processedBy: "Nguyễn Văn A",
      processedAt: new Date(now.getTime() - day(58)).toISOString(),
    },
    {
      id: 13,
      invoiceCode: "HD-20250620-0013",
      createdAt: new Date(now.getTime() - day(15)).toISOString(),
      customerName: "Bùi Thị Ngọc",
      customerIdCard: "031456789012",
      customerPhone: "0944567890",
      customerAddress: "99 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
      vehicleModel: "Honda SH 150i",
      vehicleColor: "Đen",
      chassisNo: "VTSH150CA456789",
      engineNo: "SHFA012345",
      vehiclePrice: 85000000,
      registrationFee: 3000000,
      insuranceFee: 450000,
      totalAmount: 87950000,
      paymentMethod: "transfer",
      bankName: "TPBank",
      status: "processing",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() + 4 * day(24)).toISOString(),
    },
    {
      id: 14,
      invoiceCode: "HD-20250619-0014",
      createdAt: new Date(now.getTime() - day(40)).toISOString(),
      customerName: "Nguyễn Văn Tú",
      customerIdCard: "031567890123",
      customerPhone: "0955678901",
      customerAddress: "12 Lý Thường Kiệt, Quận 10, TP.HCM",
      vehicleModel: "Suzuki Raider R150",
      vehicleColor: "Đỏ",
      chassisNo: "VTSR150CB567890",
      engineNo: "SRFB123456",
      vehiclePrice: 42000000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 44850000,
      paymentMethod: "installment",
      bankName: "Sacombank",
      status: "completed",
      salesPerson: "Phạm Thị D",
      deliveryDate: new Date(now.getTime() - day(35)).toISOString(),
      processedBy: "Trần Thị B",
      processedAt: new Date(now.getTime() - day(38)).toISOString(),
    },
    {
      id: 15,
      invoiceCode: "HD-20250618-0015",
      createdAt: new Date(now.getTime() - day(55)).toISOString(),
      customerName: "Lê Minh Quang",
      customerIdCard: "031678901234",
      customerPhone: "0966789012",
      customerAddress: "45 Nguyễn Văn Cừ, Quận 5, TP.HCM",
      vehicleModel: "Honda Winner X",
      vehicleColor: "Xanh",
      chassisNo: "VTVK50CC678901",
      engineNo: "KFPC234567",
      vehiclePrice: 49900000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 52750000,
      paymentMethod: "mixed",
      bankName: "Vietcombank",
      paymentBreakdown: [
        { method: "Tiền mặt", amount: 27750000, note: "Đặt cọc" },
        { method: "Trả góp", amount: 25000000, note: "Home Credit - 24 tháng" },
      ],
      status: "completed",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() - day(50)).toISOString(),
      processedBy: "Phạm Thị D",
      processedAt: new Date(now.getTime() - day(53)).toISOString(),
    },
    {
      id: 16,
      invoiceCode: "HD-20250617-0016",
      createdAt: new Date(now.getTime() - day(80)).toISOString(),
      customerName: "Phạm Thị Hồng",
      customerIdCard: "031789012345",
      customerPhone: "0977890123",
      customerAddress: "22 Hai Bà Trưng, Quận 1, TP.HCM",
      vehicleModel: "Yamaha Exciter 155",
      vehicleColor: "Vàng",
      chassisNo: "VTYM155CD789012",
      engineNo: "YMDD345678",
      vehiclePrice: 45900000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 48750000,
      paymentMethod: "transfer",
      status: "completed",
      salesPerson: "Trần Thị B",
      deliveryDate: new Date(now.getTime() - day(75)).toISOString(),
      processedBy: "Nguyễn Văn A",
      processedAt: new Date(now.getTime() - day(78)).toISOString(),
    },
    {
      id: 17,
      invoiceCode: "HD-20250616-0017",
      createdAt: new Date(now.getTime() - day(20)).toISOString(),
      customerName: "Hoàng Văn Đức",
      customerIdCard: "031890123456",
      customerPhone: "0988901234",
      customerAddress: "67 Lạc Long Quân, Quận 11, TP.HCM",
      vehicleModel: "Honda Air Blade 125",
      vehicleColor: "Trắng",
      chassisNo: "VTAB125CE890123",
      engineNo: "ABFE456789",
      vehiclePrice: 38000000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 40850000,
      paymentMethod: "cash",
      status: "pending",
      salesPerson: "Phạm Thị D",
      deliveryDate: new Date(now.getTime() + 6 * day(24)).toISOString(),
    },
    {
      id: 18,
      invoiceCode: "HD-20250615-0018",
      createdAt: new Date(now.getTime() - day(44)).toISOString(),
      customerName: "Đặng Văn Thành",
      customerIdCard: "031901234567",
      customerPhone: "0999012345",
      customerAddress: "140 Nguyễn Văn Cừ, Long Biên, Hà Nội",
      vehicleModel: "Honda SH Mode 125",
      vehicleColor: "Xanh dương",
      chassisNo: "VTSH125CF901234",
      engineNo: "SHFF567890",
      vehiclePrice: 55000000,
      registrationFee: 2800000,
      insuranceFee: 400000,
      totalAmount: 58200000,
      paymentMethod: "transfer",
      bankName: "Techcombank",
      status: "completed",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() - day(40)).toISOString(),
      processedBy: "Trần Thị B",
      processedAt: new Date(now.getTime() - day(43)).toISOString(),
    },
    {
      id: 19,
      invoiceCode: "HD-20250614-0019",
      createdAt: new Date(now.getTime() - day(65)).toISOString(),
      customerName: "Ngô Thị Yến",
      customerIdCard: "032123456789",
      customerPhone: "0902345678",
      customerAddress: "5 Nguyễn Khánh Toàn, Cầu Giấy, Hà Nội",
      vehicleModel: "Yamaha Sirius 125",
      vehicleColor: "Đỏ",
      chassisNo: "VTSI125CG012345",
      engineNo: "YSFG678901",
      vehiclePrice: 19500000,
      registrationFee: 2000000,
      insuranceFee: 300000,
      totalAmount: 21800000,
      paymentMethod: "cash",
      status: "cancelled",
      salesPerson: "Trần Thị B",
      processedBy: "Phạm Thị D",
      processedAt: new Date(now.getTime() - day(63)).toISOString(),
    },
    {
      id: 20,
      invoiceCode: "HD-20250613-0020",
      createdAt: new Date(now.getTime() - day(10)).toISOString(),
      customerName: "Trần Văn Bình",
      customerIdCard: "032234567890",
      customerPhone: "0913456789",
      customerAddress: "88 Nguyễn Thị Định, Cầu Giấy, Hà Nội",
      vehicleModel: "Honda Winner X",
      vehicleColor: "Đen",
      chassisNo: "VTVK50CH123456",
      engineNo: "KFPH789012",
      vehiclePrice: 49900000,
      registrationFee: 2500000,
      insuranceFee: 350000,
      totalAmount: 52750000,
      paymentMethod: "mixed",
      bankName: "VPBank",
      paymentBreakdown: [
        { method: "Chuyển khoản", amount: 32750000, note: "VPBank" },
        { method: "Trả góp", amount: 20000000, note: "Fe Credit - 12 tháng" },
      ],
      status: "processing",
      salesPerson: "Nguyễn Văn A",
      deliveryDate: new Date(now.getTime() + 3 * day(24)).toISOString(),
    },
  ];
}

// ==================== STATE ====================
const invoices = ref<Invoice[]>([]);
const drawer = reactive({
  visible: false,
  invoice: null as Invoice | null,
});
const searchQuery = ref("");
const filterStatus = ref<string>("");
const actionLoading = ref(false);
const pagination = reactive({
  current: 1,
  size: 10,
});

// ==================== COMPUTED ====================
const filteredInvoices = computed(() => {
  let result = invoices.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (inv) =>
        inv.invoiceCode.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.chassisNo.toLowerCase().includes(q) ||
        inv.engineNo.toLowerCase().includes(q) ||
        inv.vehicleModel.toLowerCase().includes(q),
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

// ==================== METHODS ====================
function formatCurrency(value?: number): string {
  if (value == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return "---";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentLabel(method: string): string {
  switch (method) {
    case "cash":
      return "Tiền mặt";
    case "transfer":
      return "Chuyển khoản";
    case "installment":
      return "Trả góp";
    case "mixed":
      return "Kết hợp";
    default:
      return "---";
  }
}

function getPaymentTagType(
  method: string,
): "success" | "warning" | "info" | "primary" {
  switch (method) {
    case "cash":
      return "success";
    case "transfer":
      return "info";
    case "installment":
      return "warning";
    case "mixed":
      return "primary";
    default:
      return "info";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Chờ thanh toán";
    case "completed":
      return "Đã hoàn tất";
    case "processing":
      return "Đang xử lý";
    case "cancelled":
      return "Đã hủy";
    default:
      return "---";
  }
}

function getStatusTagType(
  status: string,
): "warning" | "success" | "info" | "danger" {
  switch (status) {
    case "pending":
      return "warning";
    case "completed":
      return "success";
    case "processing":
      return "info";
    case "cancelled":
      return "danger";
    default:
      return "info";
  }
}

function handleSearch() {
  pagination.current = 1;
}

function handleSizeChange() {
  pagination.current = 1;
}

function handleCurrentChange() {
  // handled by v-model
}

function handleRowClick(row: Invoice) {
  drawer.invoice = row;
  drawer.visible = true;
}

function handleCreateNew() {
  ElMessage.info("Tính năng tạo hóa đơn mới đang được phát triển");
}

async function fetchData() {
  try {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      invoices.value = getMockInvoices();
      return;
    }
    const res = await invoiceApi.getList();
    invoices.value = res.map((r) => ({
      id: r.id,
      invoiceCode: r.invoiceNumber,
      createdAt: r.date,
      customerName: "",
      customerIdCard: "",
      customerPhone: "",
      customerAddress: "",
      vehicleModel: "",
      vehicleColor: "",
      chassisNo: "",
      engineNo: "",
      vehiclePrice: 0,
      registrationFee: 0,
      insuranceFee: 0,
      totalAmount: Number(r.totalAmount || 0),
      paymentMethod: "transfer" as const,
      status: "completed" as const,
      salesPerson: "",
    }));
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    ElMessage.error("Không thể tải danh sách hóa đơn");
  }
}

async function handleMarkCompleted() {
  if (!drawer.invoice) return;
  try {
    await ElMessageBox.confirm(
      `Xác nhận thanh toán hóa đơn ${drawer.invoice.invoiceCode}?\n\nTổng tiền: ${formatCurrency(drawer.invoice.totalAmount)}`,
      "Xác nhận",
      { type: "success", confirmButtonText: "Xác nhận thanh toán" },
    );
    actionLoading.value = true;
    drawer.invoice.status = "completed";
    drawer.invoice.processedBy = "Admin (mock)";
    drawer.invoice.processedAt = new Date().toISOString();
    ElMessage.success("Đã xác nhận thanh toán - Hóa đơn đã hoàn tất");
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Thao tác thất bại");
    }
  } finally {
    actionLoading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.invoices-page {
  padding: 16px;
}

.invoice-list-card {
  border-radius: 8px;
}

.invoice-detail {
  padding-right: 8px;
}

.invoice-document {
  font-family: "Times New Roman", serif;
  line-height: 1.6;
}

.invoice-header {
  background: linear-gradient(
    135deg,
    var(--el-fill-color-light) 0%,
    var(--el-fill-color) 100%
  );
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  letter-spacing: 0.5px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item .label {
  font-size: 12px;
  color: var(--el-text-color-secondary, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.info-item .value {
  font-size: 14px;
  color: var(--el-text-color-primary, #111827);
}

.financial-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed var(--el-border-color-light, #e5e7eb);
}

.financial-row:last-child {
  border-bottom: none;
  border-top: 2px solid var(--el-text-color-primary, #374151);
  margin-top: 8px;
  padding-top: 12px;
  font-weight: bold;
  font-size: 16px;
}

.payment-info {
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light, #e5e7eb);
}

:deep(.el-table) {
  font-family: inherit;
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light, #f9fafb) !important;
  font-weight: 600;
  color: var(--el-text-color-regular, #374151) !important;
}

:global(html.dark) {
  .text-gray-900,
  .text-gray-800,
  .text-gray-700 {
    color: var(--el-text-color-primary) !important;
  }

  .text-gray-600 {
    color: var(--el-text-color-regular) !important;
  }

  .text-gray-500 {
    color: var(--el-text-color-secondary) !important;
  }

  .text-gray-400,
  .text-gray-300 {
    color: var(--el-text-color-placeholder) !important;
  }

  .bg-gray-50 {
    background-color: var(--el-fill-color-light) !important;
  }

  .bg-white {
    background-color: var(--el-bg-color-overlay) !important;
  }
}
</style>
