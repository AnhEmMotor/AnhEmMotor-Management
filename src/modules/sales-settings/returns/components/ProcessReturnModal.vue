<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="620px" :close-on-click-modal="false">
    <div v-if="returnRequest" class="mb-4">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="Mã Yêu Cầu">#{{ returnRequest.id }}</el-descriptions-item>
        <el-descriptions-item label="Mã Đơn Hàng">{{
          returnRequest.orderCode
        }}</el-descriptions-item>
        <el-descriptions-item label="Khách hàng">{{
          returnRequest.customerName
        }}</el-descriptions-item>
        <el-descriptions-item label="Lý do trả hàng">{{
          returnRequest.reason
        }}</el-descriptions-item>
        <el-descriptions-item label="Trạng thái">
          <el-tag :type="getStatusType(returnRequest.status)" size="large">
            {{ getStatusLabel(returnRequest.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="returnRequest.rejectionReason" label="Lý do từ chối">
          <span class="text-red-500">{{ returnRequest.rejectionReason }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="returnRequest.note" label="Ghi chú">
          {{ returnRequest.note }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template v-if="isPending">
      <el-divider content-position="left">Quyết định của Admin</el-divider>
      <el-form :model="form" label-width="130px">
        <el-form-item label="Quyết định">
          <el-radio-group v-model="form.decision">
            <div class="flex flex-col gap-2">
              <el-radio label="approve">
                <span class="text-green-600 font-medium">✔ Duyệt — Nhận hàng về lưu kho</span>
              </el-radio>
              <el-radio label="reject">
                <span class="text-red-500 font-medium">✘ Từ chối — Buộc khách nhận lại hàng</span>
              </el-radio>
            </div>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="Lý do từ chối" v-if="form.decision === 'reject'">
          <el-input
            type="textarea"
            v-model="form.note"
            placeholder="Nhập lý do từ chối để thông báo cho nhân viên đơn hàng"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="Ghi chú" v-if="form.decision === 'approve'">
          <el-input
            type="textarea"
            v-model="form.note"
            placeholder="Ghi chú thêm (không bắt buộc)"
            :rows="2"
          />
        </el-form-item>
      </el-form>
    </template>

    <el-alert
      v-else-if="returnRequest?.status?.toLowerCase() === 'completed'"
      title="Yêu cầu này đã được duyệt và hàng đã lưu kho. Không thể thay đổi."
      type="success"
      :closable="false"
      show-icon
      class="mt-2"
    />
    <el-alert
      v-else-if="returnRequest?.status?.toLowerCase() === 'rejected'"
      title="Yêu cầu này đã bị từ chối. Khách hàng buộc phải nhận lại hàng. Không thể thay đổi."
      type="error"
      :closable="false"
      show-icon
      class="mt-2"
    />

    <template #footer>
      <div class="dialog-footer flex gap-2 justify-end">
        <el-button @click="visible = false">{{ isPending ? 'Hủy' : 'Đóng' }}</el-button>
        <template v-if="isPending">
          <el-button
            v-if="form.decision === 'reject'"
            type="danger"
            :loading="loading"
            @click="submitForm"
          >
            Xác nhận Từ chối
          </el-button>
          <el-button v-else type="success" :loading="loading" @click="submitForm">
            Xác nhận Duyệt & Lưu kho
          </el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { processReturnRequest } from '@/api/sales/returns.api';

const props = defineProps<{
  modelValue: boolean;
  returnRequest: any;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);

const form = reactive({
  decision: 'approve',
  note: '',
});

const isPending = computed(() => props.returnRequest?.status?.toLowerCase() === 'pending');

const dialogTitle = computed(() => {
  const status = props.returnRequest?.status?.toLowerCase();
  if (status === 'completed') return 'Chi tiết — Đã duyệt & Lưu kho';
  if (status === 'rejected') return 'Chi tiết — Đã từ chối';
  if (status === 'pending') return 'Duyệt / Từ chối Yêu cầu Trả hàng';
  return 'Chi tiết Yêu cầu Trả hàng';
});

watch(visible, (val) => {
  if (val) {
    form.decision = 'approve';
    form.note = '';
  }
});

const getStatusType = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
    case 'completed':
      return 'success';
    case 'rejected':
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'processing':
      return 'Đang xử lý (NV tiếp nhận)';
    case 'pending':
      return 'Chờ Admin duyệt';
    case 'completed':
      return 'Đã duyệt — Hàng đã lưu kho';
    case 'rejected':
      return 'Đã từ chối — Khách nhận lại hàng';
    default:
      return status;
  }
};

const submitForm = async () => {
  if (!props.returnRequest) return;
  loading.value = true;
  try {
    await processReturnRequest(props.returnRequest.id, {
      status: form.decision === 'approve' ? 'completed' : 'rejected',
      returnAction: form.decision === 'approve' ? 'restock' : undefined,
      rejectionReason: form.decision === 'reject' ? form.note : undefined,
      note: form.note || undefined,
    });

    ElMessage.success(
      form.decision === 'approve'
        ? 'Đã duyệt yêu cầu — Hàng được lưu kho thành công!'
        : 'Đã từ chối yêu cầu — Khách hàng sẽ phải nhận lại hàng.'
    );
    visible.value = false;
    emit('success');
  } catch (error) {
    ElMessage.error('Có lỗi xảy ra khi xử lý yêu cầu.');
  } finally {
    loading.value = false;
  }
};
</script>
