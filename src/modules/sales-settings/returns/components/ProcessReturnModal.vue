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

    <template v-if="isActionable">
      <el-divider content-position="left">{{ decisionSectionTitle }}</el-divider>
      <el-form :model="form" label-width="130px">
        <el-form-item :label="decisionFieldLabel">
          <el-radio-group v-model="form.decision">
            <div v-if="mode === 'classification'" class="flex flex-col gap-2">
              <el-radio label="manufacturer">
                <span class="text-green-600 font-medium">Lỗi do nhà sản xuất</span>
              </el-radio>
              <el-radio label="customer">
                <span class="text-red-500 font-medium">Lỗi do khách hàng</span>
              </el-radio>
            </div>
            <div v-else class="flex flex-col gap-2">
              <el-radio label="approve">
                <span class="text-green-600 font-medium">Duyệt — Chuyển hàng vào kho</span>
              </el-radio>
              <el-radio label="reject">
                <span class="text-red-500 font-medium">Từ chối yêu cầu trả hàng</span>
              </el-radio>
            </div>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          :label="noteLabel"
          :required="mode === 'approval' && form.decision === 'reject'"
        >
          <el-input v-model="form.note" type="textarea" :placeholder="notePlaceholder" :rows="3" />
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
        <el-button @click="visible = false">{{ isActionable ? 'Hủy' : 'Đóng' }}</el-button>
        <template v-if="isActionable">
          <el-button
            :type="mode === 'approval' && form.decision === 'reject' ? 'danger' : 'success'"
            :loading="loading"
            @click="submitForm"
          >
            {{ submitButtonText }}
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
import type { ProcessReturnRequest } from '@/api/sales/returns.api';
import type { ReturnRequestDetail } from '@/domain/sales/returns.types';

type WorkflowMode = 'classification' | 'approval' | 'warehouse';

const props = defineProps<{
  modelValue: boolean;
  returnRequest: ReturnRequestDetail | null;
  mode: WorkflowMode;
}>();

const emit = defineEmits(['update:modelValue', 'success']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const loading = ref(false);

const form = reactive({
  decision: 'manufacturer',
  note: '',
});

const isActionable = computed(() => {
  const status = props.returnRequest?.status?.toLowerCase();
  if (props.mode === 'classification') return status === 'pending';
  if (props.mode === 'approval') return status === 'inspecting';
  return false;
});

const decisionSectionTitle = computed(() =>
  props.mode === 'classification' ? 'Phân loại lỗi trả hàng' : 'Quyết định duyệt trả hàng'
);

const decisionFieldLabel = computed(() =>
  props.mode === 'classification' ? 'Nguyên nhân lỗi' : 'Quyết định'
);

const noteLabel = computed(() => {
  if (props.mode === 'classification') return 'Mô tả lỗi';
  return form.decision === 'reject' ? 'Lý do từ chối' : 'Ghi chú duyệt';
});

const notePlaceholder = computed(() => {
  if (props.mode === 'classification') return 'Mô tả thêm về lỗi trả hàng (không bắt buộc)';
  if (form.decision === 'reject') return 'Nhập lý do từ chối để thông báo cho Order';
  return 'Ghi chú thêm khi duyệt (không bắt buộc)';
});

const submitButtonText = computed(() => {
  if (props.mode === 'approval' && form.decision === 'reject') return 'Xác nhận từ chối';
  return 'Xác nhận duyệt';
});

const dialogTitle = computed(() => {
  const status = props.returnRequest?.status?.toLowerCase();
  if (props.mode === 'classification' && status === 'pending') return 'Phân loại lỗi trả hàng';
  if (props.mode === 'approval' && status === 'inspecting') {
    return 'Duyệt / Từ chối Yêu cầu Trả hàng';
  }
  if (status === 'completed') return 'Chi tiết — Đã duyệt & Lưu kho';
  if (status === 'rejected') return 'Chi tiết — Đã từ chối';
  return 'Chi tiết Yêu cầu Trả hàng';
});

watch([visible, () => props.mode], ([isVisible]) => {
  if (isVisible) {
    form.decision = props.mode === 'classification' ? 'manufacturer' : 'approve';
    form.note = '';
  }
});

const getStatusType = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
    case 'inspecting':
      return 'primary';
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
      return 'Chờ Order phân loại';
    case 'inspecting':
      return 'Chờ Sales duyệt';
    case 'completed':
      return 'Đã duyệt — Chuyển vào kho';
    case 'rejected':
      return 'Đã từ chối — Khách nhận lại hàng';
    default:
      return status;
  }
};

const submitForm = async () => {
  if (!props.returnRequest) return;

  if (props.mode === 'approval' && form.decision === 'reject' && !form.note.trim()) {
    ElMessage.warning('Vui lòng nhập lý do từ chối.');
    return;
  }

  loading.value = true;
  try {
    const payload: ProcessReturnRequest =
      props.mode === 'classification'
        ? {
            status: 'inspecting',
            note: buildClassificationNote(),
          }
        : {
            status: form.decision === 'approve' ? 'completed' : 'rejected',
            returnAction: form.decision === 'approve' ? 'restock' : undefined,
            rejectionReason: form.decision === 'reject' ? form.note.trim() : undefined,
            note: props.returnRequest.note || undefined,
          };

    await processReturnRequest(props.returnRequest.id, payload);

    if (props.mode === 'classification') {
      ElMessage.success('Đã phân loại và chuyển yêu cầu sang Sales chờ duyệt.');
    } else if (form.decision === 'approve') {
      ElMessage.success('Đã duyệt yêu cầu và chuyển hàng vào kho.');
    } else {
      ElMessage.success('Đã từ chối yêu cầu trả hàng.');
    }
    visible.value = false;
    emit('success');
  } catch (error) {
    ElMessage.error('Có lỗi xảy ra khi xử lý yêu cầu.');
  } finally {
    loading.value = false;
  }
};

const buildClassificationNote = () => {
  const cause = form.decision === 'manufacturer' ? 'Lỗi do nhà sản xuất' : 'Lỗi do khách hàng';
  const description = form.note.trim();
  const classification = description
    ? `[Phân loại lỗi] ${cause}: ${description}`
    : `[Phân loại lỗi] ${cause}`;
  const existingNote = props.returnRequest?.note?.trim();
  return existingNote ? `${classification}\n${existingNote}` : classification;
};
</script>
