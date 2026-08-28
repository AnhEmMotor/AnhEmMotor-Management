<template>
  <el-dialog v-model="visible" title="Tiếp nhận Yêu cầu Trả hàng" width="760px">
    <el-form :model="form" label-width="130px" :rules="rules" ref="formRef">
      <el-form-item label="Đơn hàng" prop="orderId">
        <el-select
          v-model="form.orderId"
          filterable
          remote
          clearable
          :remote-method="searchOrders"
          :loading="loadingOrders"
          placeholder="Tìm đơn hàng online đã giao"
          style="width: 100%"
          @change="handleOrderChange"
        >
          <el-option
            v-for="order in orderOptions"
            :key="order.id"
            :label="orderLabel(order)"
            :value="order.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Tên khách hàng">
        <el-input v-model="form.customerName" disabled placeholder="Tự điền từ đơn hàng" />
      </el-form-item>

      <el-form-item label="Lý do lỗi" prop="reason">
        <el-input
          type="textarea"
          v-model="form.reason"
          placeholder="Nhập chi tiết lỗi / lý do khách trả hàng"
        />
      </el-form-item>

      <el-form-item label="Mặt hàng hoàn">
        <ElTable
          v-if="products.length"
          ref="productTableRef"
          :data="products"
          size="small"
          border
          @selection-change="handleSelectionChange"
        >
          <ElTableColumn type="selection" width="45" />
          <ElTableColumn label="Sản phẩm" min-width="220">
            <template #default="{ row }">{{ getProductLabel(row as SelectableProduct) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="count" label="Đã mua" width="90" align="center" />
          <ElTableColumn width="90" align="right">
            <template #default="{ row }">{{
              formatMoney((row as SelectableProduct).price ?? 0)
            }}</template>
          </ElTableColumn>
          <ElTableColumn width="150" align="center">
            <template #header>Số lượng hoàn</template>
            <template #default="{ row }">
              <ElInputNumber
                v-model="row.returnQuantity"
                :min="1"
                :max="row.count"
                size="small"
                style="width: 120px"
              />
            </template>
          </ElTableColumn>
        </ElTable>
        <span v-else class="text-secondary">Chọn đơn hàng để hiển thị mặt hàng</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">Hủy</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">Tiếp nhận</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { createReturnRequest } from '@/api/sales/returns.api';
import { SalesOrderApi } from '@/api/sales/sales-order.api';
import type { CreateReturnRequestCommand } from '@/domain/sales/returns.types';
import type { SalesOrder } from '@/domain/order/order.types';

interface SelectableProduct {
  productId?: number;
  productVariantId: number;
  productName?: string;
  colorName?: string;
  count: number;
  price?: number;
  returnQuantity: number;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref<FormInstance>();
const productTableRef = ref();
const loading = ref(false);
const loadingOrders = ref(false);
const orderOptions = ref<SalesOrder[]>([]);
const products = ref<SelectableProduct[]>([]);
const selectedProducts = ref<SelectableProduct[]>([]);

const form = reactive({
  orderId: undefined as number | undefined,
  customerName: '',
  customerPhone: '',
  reason: '',
});

const rules = {
  orderId: [{ required: true, message: 'Vui lòng chọn đơn hàng', trigger: 'change' }],
  reason: [{ required: true, message: 'Vui lòng nhập lý do', trigger: 'blur' }],
};

watch(visible, (isOpen) => {
  if (isOpen && orderOptions.value.length === 0) {
    searchOrders('');
  }
});

const orderLabel = (order: SalesOrder) =>
  `#${order.id} · ${order.customerName || order.buyerName || 'Không tên'} · ${formatMoney(
    order.total ?? 0
  )}`;

const getProductLabel = (row: SelectableProduct) =>
  `${row.productName || `Sản phẩm #${row.productVariantId}`}${
    row.colorName ? ` - ${row.colorName}` : ''
  }`;

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value ?? 0);

const searchOrders = async (query: string) => {
  loadingOrders.value = true;
  try {
    const res = await SalesOrderApi.getConfirmedList({
      current: 1,
      size: 50,
      Filters: 'StatusId==completed',
      Sorts: '-Id',
      ...(query ? { search: query } : {}),
    });
    orderOptions.value = res?.items ?? [];
  } catch (e) {
    console.error('Lỗi khi tải danh sách đơn hàng:', e);
  } finally {
    loadingOrders.value = false;
  }
};

const handleOrderChange = async (orderId?: number) => {
  products.value = [];
  selectedProducts.value = [];
  form.customerName = '';
  form.customerPhone = '';
  if (!orderId) return;

  try {
    const order = await SalesOrderApi.getById(orderId);
    form.customerName = order.customerName || order.buyerName || '';
    form.customerPhone = order.customerPhone || order.buyerPhone || '';
    products.value = (order.products ?? []).map((p) => ({
      productId: p.productId,
      productVariantId: p.productVariantId,
      productName: p.productName,
      colorName: p.colorName,
      count: p.count,
      price: p.price,
      returnQuantity: p.count,
    }));
    await nextTick();
    products.value.forEach((row) => productTableRef.value?.toggleRowSelection(row, true));
  } catch (e) {
    console.error('Lỗi khi tải chi tiết đơn hàng:', e);
    ElMessage.error('Không tải được chi tiết đơn hàng.');
  }
};

const handleSelectionChange = (rows: SelectableProduct[]) => {
  selectedProducts.value = rows;
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    if (selectedProducts.value.length === 0) {
      ElMessage.warning('Vui lòng chọn ít nhất một mặt hàng cần hoàn.');
      return;
    }

    loading.value = true;
    try {
      const payload: CreateReturnRequestCommand = {
        orderId: form.orderId!,
        type: 'return',
        reason: form.reason.trim(),
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        carrier: '',
        originalTrackingNumber: '',
        items: selectedProducts.value.map((row) => ({
          productId: row.productId ? Number(row.productId) : 0,
          variantId: row.productVariantId,
          productName: getProductLabel(row),
          quantity: row.returnQuantity,
          unitPrice: row.price ?? 0,
        })),
      };

      await createReturnRequest(payload);
      ElMessage.success('Tiếp nhận thành công! Yêu cầu đã chuyển sang Order phân loại lỗi.');
      visible.value = false;
      emit('success');
    } catch (error) {
      ElMessage.error(
        'Có lỗi xảy ra, có thể đơn hàng không hợp lệ (không phải online hoặc chưa giao)'
      );
    } finally {
      loading.value = false;
    }
  });
};
</script>
