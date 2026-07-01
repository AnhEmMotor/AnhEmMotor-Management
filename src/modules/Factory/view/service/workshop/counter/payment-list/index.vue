<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header -->
    <div
      class="flex items-start justify-between gap-4 flex-wrap bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div>
        <h1 class="text-2xl font-bold">
          {{ $t("factory.service.workshop.counter.title") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý thu tiền dịch vụ xưởng: Sửa chữa, Bảo trì, Bảo hành, Đặt dịch
          vụ. Xưởng in phiếu → Khách mang đến quầy → Thu ngân thu tiền.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <ElButton :icon="Refresh" :loading="loading" @click="refreshData">
          Làm mới
        </ElButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ElCard shadow="never" class="border-l-4 border-l-red-400">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Chưa thanh toán
        </div>
        <div class="text-2xl font-black text-red-600 mt-1">
          {{ stats.unpaid }}
        </div>
        <div class="text-xs text-slate-400 mt-1">
          {{ formatCurrency(stats.unpaidAmount) }} đ
        </div>
      </ElCard>
      <ElCard shadow="never" class="border-l-4 border-l-amber-400">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Thanh toán một phần
        </div>
        <div class="text-2xl font-black text-amber-600 mt-1">
          {{ stats.partial }}
        </div>
        <div class="text-xs text-slate-400 mt-1">
          {{ formatCurrency(stats.partialAmount) }} đ
        </div>
      </ElCard>
      <ElCard shadow="never" class="border-l-4 border-l-green-400">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Đã thanh toán hôm nay
        </div>
        <div class="text-2xl font-black text-green-600 mt-1">
          {{ stats.paidToday }}
        </div>
        <div class="text-xs text-slate-400 mt-1">
          {{ formatCurrency(stats.paidTodayAmount) }} đ
        </div>
      </ElCard>
      <ElCard shadow="never" class="border-l-4 border-l-blue-400">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Tổng doanh thu tháng
        </div>
        <div class="text-2xl font-black text-blue-600 mt-1">
          {{ formatCurrency(stats.monthRevenue) }} đ
        </div>
      </ElCard>
    </div>

    <!-- Filters -->
    <ElCard shadow="never">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Tìm kiếm
          </label>
          <ElInput
            v-model="query"
            placeholder="Mã phiếu, tên KH, SĐT, biển số..."
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Loại phiếu
          </label>
          <ElSelect
            v-model="sourceType"
            placeholder="Chọn loại"
            class="w-full"
            clearable
          >
            <ElOption
              v-for="s in sourceTypeOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </ElSelect>
        </div>
        <div>
          <label
            class="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2"
          >
            Trạng thái TT
          </label>
          <ElSelect
            v-model="paymentStatus"
            placeholder="Chọn trạng thái"
            class="w-full"
            clearable
          >
            <ElOption
              v-for="s in paymentStatusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </ElSelect>
        </div>
        <div class="flex flex-col justify-end">
          <div class="flex items-center gap-3">
            <ElButton type="primary" :loading="loading" @click="handleSearch">
              Tìm kiếm
            </ElButton>
            <ElButton :disabled="loading" @click="handleReset">
              Đặt lại
            </ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- Table -->
    <ElCard shadow="never">
      <ArtTable
        row-key="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #paymentNumber="{ row }">
          <ElText type="primary" tag="b">{{ row.paymentNumber }}</ElText>
        </template>
        <template #sourceType="{ row }">
          <ElTag :type="sourceTypeTagType(row.sourceType)" effect="dark">
            {{ getSourceTypeLabel(row.sourceType) }}
          </ElTag>
        </template>
        <template #paymentStatus="{ row }">
          <ElTag :type="paymentStatusTagType(row.paymentStatus)" effect="dark">
            {{ getPaymentStatusLabel(row.paymentStatus) }}
          </ElTag>
        </template>
        <template #totalAmount="{ row }">
          <b class="text-red-600">{{ formatCurrency(row.totalAmount) }} đ</b>
        </template>
        <template #paidAt="{ row }">
          {{ row.paidAt ? formatDateTime(row.paidAt) : "—" }}
        </template>
        <template #createdAt="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center flex-wrap">
            <ElButton
              v-if="row.paymentStatus === 'Unpaid'"
              type="success"
              size="small"
              :icon="Money"
              link
              @click="openPaymentDialog(row)"
            >
              Thu tiền
            </ElButton>
            <ElButton
              v-if="row.paymentStatus === 'Paid'"
              type="primary"
              size="small"
              :icon="Document"
              link
              @click="printReceipt(row)"
            >
              In phiếu
            </ElButton>
            <ElButton
              type="primary"
              size="small"
              :icon="View"
              link
              @click="openDetail(row.id)"
            >
              Chi tiết
            </ElButton>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Payment Dialog -->
    <ElDialog
      v-model="paymentDialogVisible"
      :title="paymentDialogTitle"
      width="620px"
      :destroy-on-close="true"
    >
      <ElForm
        ref="paymentFormRef"
        :model="paymentForm"
        :rules="paymentFormRules"
        label-position="top"
      >
        <div class="bg-blue-50/60 rounded-xl p-4 mb-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">Khách hàng:</span>
            <b>{{ paymentForm.customerName }}</b>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-500">SĐT:</span>
            <b>{{ paymentForm.customerPhone }}</b>
          </div>
          <div
            class="flex justify-between text-sm"
            v-if="paymentForm.vehicleInfo"
          >
            <span class="text-slate-500">Xe:</span>
            <b>{{ paymentForm.vehicleInfo }}</b>
          </div>
          <div
            class="flex justify-between text-sm"
            v-if="paymentForm.serviceDescription"
          >
            <span class="text-slate-500">Dịch vụ:</span>
            <b>{{ paymentForm.serviceDescription }}</b>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ElFormItem label="Tạm tính" prop="subTotal">
            <ElInputNumber
              v-model="paymentForm.subTotal"
              :min="0"
              :step="10000"
              class="w-full"
              :controls="false"
              @change="calcTotal"
            />
          </ElFormItem>
          <ElFormItem label="Giảm giá" prop="discountAmount">
            <ElInputNumber
              v-model="paymentForm.discountAmount"
              :min="0"
              :step="10000"
              class="w-full"
              :controls="false"
              @change="calcTotal"
            />
          </ElFormItem>
        </div>

        <ElFormItem label="Tổng thanh toán">
          <div class="text-2xl font-black text-red-600">
            {{ formatCurrency(calcTotalValue) }} đ
          </div>
        </ElFormItem>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ElFormItem label="Phương thức TT" prop="paymentMethod">
            <ElSelect v-model="paymentForm.paymentMethod" class="w-full">
              <ElOption
                v-for="m in paymentMethods"
                :key="m.value"
                :label="m.label"
                :value="m.value"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Trạng thái" prop="paymentStatus">
            <ElSelect v-model="paymentForm.paymentStatus" class="w-full">
              <ElOption
                v-for="s in paymentStatuses"
                :key="s.value"
                :label="s.label"
                :value="s.value"
              />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="paymentForm.notes"
            type="textarea"
            :rows="2"
            placeholder="Ghi chú thêm (VD: khách đưa thiếu 50k...)"
          />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="paymentDialogVisible = false">Hủy bỏ</ElButton>
          <ElButton
            type="success"
            :loading="submitting"
            @click="handlePaymentSubmit"
          >
            <ArtSvgIcon icon="ri:checkbox-circle-line" /> Xác nhận thu tiền
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- Receipt Preview Dialog -->
    <ElDialog
      v-model="receiptDialogVisible"
      title="Phiếu thu dịch vụ"
      width="480px"
      :destroy-on-close="true"
    >
      <div v-if="receiptData" class="space-y-3 text-sm">
        <div class="text-center border-b pb-3">
          <h2 class="text-lg font-black">ANH EM MOTOR</h2>
          <p class="text-xs text-slate-400">Xưởng dịch vụ sửa chữa xe máy</p>
          <p class="text-xs text-slate-400">
            Phiếu thu: {{ receiptData.paymentNumber }}
          </p>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-500">Ngày:</span>
            <b>{{ formatDate(receiptData.paidAt || receiptData.createdAt) }}</b>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Khách hàng:</span>
            <b>{{ receiptData.customerName }}</b>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">SĐT:</span>
            <b>{{ receiptData.customerPhone }}</b>
          </div>
          <div class="flex justify-between" v-if="receiptData.vehicleInfo">
            <span class="text-slate-500">Xe:</span>
            <b>{{ receiptData.vehicleInfo }}</b>
          </div>
          <div
            class="flex justify-between"
            v-if="receiptData.serviceDescription"
          >
            <span class="text-slate-500">Dịch vụ:</span>
            <b>{{ receiptData.serviceDescription }}</b>
          </div>
        </div>
        <div class="border-t pt-3 space-y-1">
          <div class="flex justify-between">
            <span>Tạm tính:</span>
            <b>{{ formatCurrency(receiptData.subTotal) }} đ</b>
          </div>
          <div class="flex justify-between text-red-600">
            <span>Giảm giá:</span>
            <b>- {{ formatCurrency(receiptData.discountAmount) }} đ</b>
          </div>
          <div class="flex justify-between text-lg font-black border-t pt-2">
            <span>Thành tiền:</span>
            <span class="text-red-600"
              >{{ formatCurrency(receiptData.totalAmount) }} đ</span
            >
          </div>
        </div>
        <div class="border-t pt-3 space-y-1">
          <div class="flex justify-between">
            <span class="text-slate-500">Hình thức:</span>
            <b>{{ getPaymentMethodLabel(receiptData.paymentMethod) }}</b>
          </div>
          <div class="flex justify-between" v-if="receiptData.notes">
            <span class="text-slate-500">Ghi chú:</span>
            <b>{{ receiptData.notes }}</b>
          </div>
        </div>
        <div class="text-center text-xs text-slate-300 pt-3 border-t">
          Cảm ơn quý khách đã sử dụng dịch vụ!
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="receiptDialogVisible = false">Đóng</ElButton>
          <ElButton type="primary" @click="doPrint">
            <ArtSvgIcon icon="ri:printer-line" /> In phiếu
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { Refresh, View, Money, Document } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import dayjs from "dayjs";

import ArtTable from "@/components/core/tables/art-table/index.vue";
import {
  WorkshopPaymentApi,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  SOURCE_TYPES,
} from "@/api/service/workshop-payment.api";
import { createPaymentUseCases } from "@/infrastructure/payment/usecasesFactory";

defineOptions({ name: "ServiceWorkshopCounterPaymentList" });

const useCases = createPaymentUseCases(WorkshopPaymentApi);
const loading = ref(false);
const submitting = ref(false);
const query = ref("");
const sourceType = ref<string | undefined>(undefined);
const paymentStatus = ref<string | undefined>(undefined);

const sourceTypeOptions = SOURCE_TYPES;
const paymentStatusOptions = PAYMENT_STATUSES;
const paymentMethods = PAYMENT_METHODS;
const paymentStatuses = PAYMENT_STATUSES;

const pagination = ref({ current: 1, size: 10, total: 0 });
const data = ref<any[]>([]);

const stats = reactive({
  unpaid: 0,
  unpaidAmount: 0,
  partial: 0,
  partialAmount: 0,
  paidToday: 0,
  paidTodayAmount: 0,
  monthRevenue: 0,
});

const columns = computed(() => [
  {
    prop: "paymentNumber",
    label: "Mã phiếu",
    minWidth: 150,
    useSlot: true,
    slot: "paymentNumber",
  },
  {
    prop: "sourceType",
    label: "Loại phiếu",
    width: 130,
    useSlot: true,
    slot: "sourceType",
  },
  { prop: "customerName", label: "Khách hàng", minWidth: 150 },
  { prop: "customerPhone", label: "SĐT", width: 120 },
  { prop: "vehicleInfo", label: "Xe / Biển số", minWidth: 140 },
  {
    prop: "totalAmount",
    label: "Thành tiền",
    width: 140,
    useSlot: true,
    slot: "totalAmount",
  },
  { prop: "paymentMethod", label: "HT thanh toán", width: 130 },
  {
    prop: "paymentStatus",
    label: "Trạng thái",
    width: 140,
    useSlot: true,
    slot: "paymentStatus",
  },
  {
    prop: "paidAt",
    label: "Ngày thu",
    width: 120,
    useSlot: true,
    slot: "paidAt",
  },
  {
    prop: "createdAt",
    label: "Ngày tạo",
    width: 120,
    useSlot: true,
    slot: "createdAt",
  },
  {
    prop: "operation",
    label: "Hành động",
    width: 200,
    align: "center" as const,
    fixed: "right" as const,
    useSlot: true,
    slot: "operation",
  },
]);

const getSourceTypeLabel = (val: string) => {
  const found = SOURCE_TYPES.find((s) => s.value === val);
  return found?.label || val;
};

const getPaymentStatusLabel = (val: string) => {
  const found = PAYMENT_STATUSES.find((s) => s.value === val);
  return found?.label || val;
};

const getPaymentMethodLabel = (val: string) => {
  const found = PAYMENT_METHODS.find((m) => m.value === val);
  return found?.label || val;
};

const sourceTypeTagType = (val: string) => {
  const map: Record<string, string> = {
    RepairOrder: "danger",
    Maintenance: "warning",
    Warranty: "info",
    ServiceBooking: "primary",
  };
  return map[val] || "primary";
};

const paymentStatusTagType = (val: string) => {
  const map: Record<string, string> = {
    Paid: "success",
    Unpaid: "danger",
    Partial: "warning",
    Refunded: "info",
  };
  return map[val] || "primary";
};

const formatCurrency = (val: number) => {
  if (!val) return "0";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    val,
  );
};

const formatDate = (d?: string) => {
  if (!d) return "—";
  return dayjs(d).format("DD/MM/YYYY");
};

const formatDateTime = (d?: string) => {
  if (!d) return "—";
  return dayjs(d).format("DD/MM/YYYY HH:mm");
};

// Payment Dialog
const paymentDialogVisible = ref(false);
const paymentFormRef = ref<FormInstance>();
const editingPaymentId = ref<number | null>(null);

const paymentForm = reactive({
  sourceType: "RepairOrder" as string,
  sourceId: 0,
  customerName: "",
  customerPhone: "",
  vehicleInfo: "",
  serviceDescription: "",
  subTotal: 0,
  discountAmount: 0,
  totalAmount: 0,
  paymentMethod: "Cash",
  paymentStatus: "Paid",
  notes: "",
});

const paymentFormRules: FormRules = {
  customerName: [
    { required: true, message: "Nhập tên khách hàng", trigger: "blur" },
  ],
  customerPhone: [{ required: true, message: "Nhập SĐT", trigger: "blur" }],
  subTotal: [{ required: true, message: "Nhập tạm tính", trigger: "blur" }],
  totalAmount: [
    { required: true, message: "Nhập tổng thanh toán", trigger: "blur" },
  ],
  paymentMethod: [
    { required: true, message: "Chọn phương thức", trigger: "change" },
  ],
};

const paymentDialogTitle = computed(() =>
  editingPaymentId.value ? "Cập nhật thanh toán" : "Thu tiền - Tạo phiếu thu",
);

const calcTotalValue = computed(() => {
  return Math.max(
    0,
    (paymentForm.subTotal || 0) - (paymentForm.discountAmount || 0),
  );
});

function calcTotal() {
  paymentForm.totalAmount = calcTotalValue.value;
}

function openPaymentDialog(row: any) {
  editingPaymentId.value = row.id;
  Object.assign(paymentForm, {
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    vehicleInfo: row.vehicleInfo || "",
    serviceDescription: row.serviceDescription || "",
    subTotal: row.totalAmount,
    discountAmount: 0,
    totalAmount: row.totalAmount,
    paymentMethod: "Cash",
    paymentStatus: "Paid",
    notes: "",
  });
  paymentDialogVisible.value = true;
}

async function handlePaymentSubmit() {
  if (!paymentFormRef.value) return;
  await paymentFormRef.value.validate(async (valid) => {
    if (!valid) return;
    submitting.value = true;
    try {
      const payload = {
        sourceType: paymentForm.sourceType,
        sourceId: paymentForm.sourceId,
        customerName: paymentForm.customerName,
        customerPhone: paymentForm.customerPhone,
        vehicleInfo: paymentForm.vehicleInfo || undefined,
        serviceDescription: paymentForm.serviceDescription || undefined,
        subTotal: paymentForm.subTotal,
        discountAmount: paymentForm.discountAmount,
        totalAmount: calcTotalValue.value,
        paymentMethod: paymentForm.paymentMethod,
        paymentStatus: paymentForm.paymentStatus,
        notes: paymentForm.notes || undefined,
      };
      const id = await useCases.create.call(payload);
      if (id) {
        ElMessage.success("Thu tiền thành công!");
        paymentDialogVisible.value = false;
        await refreshData();
      }
    } catch (e: any) {
      ElMessage.error(e?.message || "Thu tiền thất bại.");
    } finally {
      submitting.value = false;
    }
  });
}

// Receipt Dialog
const receiptDialogVisible = ref(false);
const receiptData = ref<any>(null);

async function printReceipt(row: any) {
  const detail = await useCases.getDetail.call(row.id);
  if (detail) {
    receiptData.value = detail;
    receiptDialogVisible.value = true;
  }
}

function doPrint() {
  if (!receiptData.value) return;
  const w = window.open("", "_blank", "width=400,height=600");
  if (!w) return;
  const r = receiptData.value;
  w.document.write(`
    <html>
    <head><title>Phiếu thu - ${r.paymentNumber}</title>
    <style>
      body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; }
      h2 { text-align: center; margin: 0; }
      .row { display: flex; justify-content: space-between; margin: 4px 0; }
      .total { font-size: 16px; font-weight: bold; border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
      .center { text-align: center; }
      @media print { body { padding: 10px; } }
    </style>
    </head>
    <body>
      <h2>ANH EM MOTOR</h2>
      <p class="center">Xưởng dịch vụ sửa chữa xe máy</p>
      <p class="center">--- PHIẾU THU ---</p>
      <div class="row"><span>Phiếu số:</span><b>${r.paymentNumber}</b></div>
      <div class="row"><span>Ngày:</span><b>${formatDate(r.paidAt || r.createdAt)}</b></div>
      <div class="row"><span>Khách:</span><b>${r.customerName}</b></div>
      <div class="row"><span>SĐT:</span><b>${r.customerPhone}</b></div>
      ${r.vehicleInfo ? `<div class="row"><span>Xe:</span><b>${r.vehicleInfo}</b></div>` : ""}
      ${r.serviceDescription ? `<div class="row"><span>Dịch vụ:</span><b>${r.serviceDescription}</b></div>` : ""}
      <div class="row"><span>Tạm tính:</span><b>${formatCurrency(r.subTotal)} đ</b></div>
      <div class="row"><span>Giảm giá:</span><b>-${formatCurrency(r.discountAmount)} đ</b></div>
      <div class="total row"><span>THÀNH TIỀN:</span><b>${formatCurrency(r.totalAmount)} đ</b></div>
      <div class="row"><span>HT thanh toán:</span><b>${getPaymentMethodLabel(r.paymentMethod)}</b></div>
      ${r.notes ? `<div class="row"><span>Ghi chú:</span><b>${r.notes}</b></div>` : ""}
      <p class="center" style="margin-top:30px">Cảm ơn quý khách!</p>
    </body>
    </html>
  `);
  w.document.close();
  w.focus();
  w.print();
}

// Detail
const router = useRouter();
function openDetail(id: number) {
  router.push({
    name: "ServiceWorkshopPaymentDetail",
    params: { id: String(id) },
  });
}

// Fetch
async function fetchData() {
  loading.value = true;
  try {
    const result = await useCases.getList.call({
      current: pagination.value.current,
      size: pagination.value.size,
      sourceType: sourceType.value,
      paymentStatus: paymentStatus.value,
      search: query.value.trim() || undefined,
    });
    if (result) {
      data.value = result.items.map((x: any) => ({
        id: x.id,
        paymentNumber: x.paymentNumber,
        sourceType: x.sourceType,
        sourceId: x.sourceId,
        customerName: x.customerName,
        customerPhone: x.customerPhone,
        vehicleInfo: x.vehicleInfo,
        serviceDescription: x.serviceDescription,
        subTotal: x.subTotal,
        discountAmount: x.discountAmount,
        totalAmount: x.totalAmount,
        paymentMethod: x.paymentMethod,
        paymentStatus: x.paymentStatus,
        paidAt: x.paidAt,
        createdAt: x.createdAt,
      }));
      pagination.value.total = result.totalCount;
    } else {
      data.value = [];
      pagination.value.total = 0;
    }
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể tải danh sách phiếu thanh toán");
    data.value = [];
    pagination.value.total = 0;
  } finally {
    loading.value = false;
  }
}

const refreshData = async () => {
  await fetchData();
};
const handleSearch = async () => {
  pagination.value.current = 1;
  await fetchData();
};
const handleReset = async () => {
  query.value = "";
  sourceType.value = undefined;
  paymentStatus.value = undefined;
  pagination.value.current = 1;
  await fetchData();
};
const handleSizeChange = async (size: number) => {
  pagination.value.size = size;
  pagination.value.current = 1;
  await fetchData();
};
const handleCurrentChange = async (current: number) => {
  pagination.value.current = current;
  await fetchData();
};

onMounted(() => {
  refreshData();
});
</script>
