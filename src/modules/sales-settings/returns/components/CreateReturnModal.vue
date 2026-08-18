<template>
  <el-dialog v-model="visible" title="Tiếp nhận Yêu cầu Trả hàng" width="600px">
    <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
      <el-form-item label="Mã Đơn Hàng" prop="orderId">
        <el-input v-model="form.orderId" placeholder="Nhập ID đơn hàng online đã giao" />
      </el-form-item>

      <el-form-item label="Tên khách hàng" prop="customerName">
        <el-input v-model="form.customerName" placeholder="Tên khách hàng" />
      </el-form-item>

      <el-form-item label="Lý do lỗi" prop="reason">
        <el-input
          type="textarea"
          v-model="form.reason"
          placeholder="Nhập chi tiết lỗi / lý do khách trả hàng"
        />
      </el-form-item>

      <el-form-item label="ID Sản phẩm" prop="productId">
        <el-input-number v-model="form.productId" :min="1" placeholder="Nhập ID sản phẩm" />
      </el-form-item>

      <el-form-item label="Số lượng" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" />
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
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { createReturnRequest } from '@/api/sales/returns.api';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({
  orderId: '',
  customerName: '',
  reason: '',
  productId: 1,
  quantity: 1,
});

const rules = {
  orderId: [{ required: true, message: 'Vui lòng nhập ID đơn hàng', trigger: 'blur' }],
  reason: [{ required: true, message: 'Vui lòng nhập lý do', trigger: 'blur' }],
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const payload = {
          orderId: parseInt(form.orderId),
          customerName: form.customerName,
          reason: form.reason,
          type: 'return',
          returnAction: 'restock',
          items: [
            {
              productId: form.productId,
              productName: 'Sản phẩm đổi trả',
              quantity: form.quantity,
              returnQuantity: form.quantity,
              unitPrice: 0,
            },
          ],
        };

        await createReturnRequest(payload as any);
        ElMessage.success(
          'Tiếp nhận thành công! Đơn ở trạng thái Đang xử lý, vui lòng Gửi Admin duyệt.'
        );
        visible.value = false;
        emit('success');
      } catch (error) {
        ElMessage.error(
          'Có lỗi xảy ra, có thể đơn hàng không hợp lệ (không phải online hoặc chưa giao)'
        );
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>
