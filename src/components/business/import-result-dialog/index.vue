<template>
  <ElDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="title"
    width="600px"
    append-to-body
  >
    <div v-if="resultData" class="space-y-4">
      <div class="flex items-center gap-2 text-lg">
        <ElIcon class="text-success text-2xl"><SuccessFilled /></ElIcon>
        <span
          >Đã nhập thành công
          <strong>{{ resultData.successCount }}</strong> dòng.</span
        >
      </div>

      <div
        v-if="resultData.failedCount > 0"
        class="flex items-center gap-2 text-lg text-danger"
      >
        <ElIcon class="text-2xl"><WarningFilled /></ElIcon>
        <span
          >Thất bại <strong>{{ resultData.failedCount }}</strong> dòng.</span
        >
      </div>

      <div
        v-if="resultData.failedCount > 0"
        class="mt-4 p-4 bg-gray-50 rounded-lg"
      >
        <p class="mb-3 text-gray-600">
          Bạn có thể tải xuống danh sách các dòng bị lỗi để kiểm tra và sửa lại:
        </p>
        <div class="flex gap-3">
          <ElButton
            v-if="resultData.errorFileUrl"
            type="primary"
            plain
            tag="a"
            :href="apiUrl + resultData.errorFileUrl"
            download
          >
            <ElIcon class="mr-1"><Download /></ElIcon> Tải danh sách lỗi
          </ElButton>
          <ElButton
            v-if="resultData.errorFileWithReasonUrl"
            type="danger"
            plain
            tag="a"
            :href="apiUrl + resultData.errorFileWithReasonUrl"
            download
          >
            <ElIcon class="mr-1"><Download /></ElIcon> Tải danh sách lỗi (kèm lý
            do)
          </ElButton>
        </div>
      </div>
    </div>
    <template #footer>
      <ElButton @click="$emit('update:modelValue', false)">Đóng</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import {
  SuccessFilled,
  WarningFilled,
  Download,
} from "@element-plus/icons-vue";

defineProps<{
  modelValue: boolean;
  resultData: any;
  title?: string;
  downloadTemplateText?: string;
}>();

defineEmits(["update:modelValue", "download-template"]);

const apiUrl = import.meta.env.VITE_APP_BASE_API || "";
</script>
