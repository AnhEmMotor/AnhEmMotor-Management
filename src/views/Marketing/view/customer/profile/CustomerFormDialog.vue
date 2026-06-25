<template>
  <ElDialog
    v-model="visible"
    :title="form.id ? 'CẬP NHẬT HỒ SƠ' : 'THÊM KHÁCH HÀNG MỚI'"
    width="650px"
    class="premium-dialog"
    destroy-on-close
    :show-close="false"
  >
    <template #header>
      <div class="flex items-center justify-between w-full pr-4">
        <div class="flex items-center gap-3">
          <div class="size-10 bg-blue-50 text-blue-600 rounded-xl flex-cc">
            <ArtSvgIcon
              :icon="form.id ? 'ri:edit-box-line' : 'ri:user-add-line'"
              class="text-xl"
            />
          </div>
          <div class="flex flex-col">
            <h3 class="m-0 text-base font-black text-gray-800 tracking-tight">
              {{ form.id ? "CẬP NHẬT HỒ SƠ" : "THÊM KHÁCH HÀNG" }}
            </h3>
            <span
              class="text-[10px] text-gray-400 font-bold uppercase tracking-widest"
            >
              {{
                form.id
                  ? "Thay đổi thông tin khách hàng #" + form.id
                  : "Khởi tạo hồ sơ khách hàng mới"
              }}
            </span>
          </div>
        </div>
        <ElButton circle @click="visible = false">
          <ArtSvgIcon icon="ri:close-line" />
        </ElButton>
      </div>
    </template>

    <div class="form-body p-2">
      <ElForm
        :model="form"
        label-position="top"
        class="grid grid-cols-2 gap-x-6 gap-y-4"
      >
        <ElFormItem label="Họ và tên khách hàng" class="col-span-2 is-required">
          <ElInput
            v-model="form.fullName"
            placeholder="Nhập đầy đủ họ tên..."
            class="premium-input"
          />
        </ElFormItem>

        <ElFormItem label="Số điện thoại" class="is-required">
          <ElInput
            v-model="form.phoneNumber"
            placeholder="09xx.xxx.xxx"
            class="premium-input"
          />
        </ElFormItem>

        <ElFormItem label="Email (Nếu có)">
          <ElInput
            v-model="form.email"
            placeholder="example@gmail.com"
            class="premium-input"
          />
        </ElFormItem>

        <div class="col-span-2 h-px bg-gray-100 my-2"></div>

        <ElFormItem label="Nguồn khách hàng">
          <ElSelect v-model="form.source" class="w-full premium-select">
            <ElOption label="Facebook" value="Facebook" />
            <ElOption label="Website" value="Website" />
            <ElOption label="Tại cửa hàng" value="Store" />
            <ElOption label="Hotline" value="Hotline" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Mức độ ưu tiên">
          <ElSelect v-model="form.priority" class="w-full premium-select">
            <ElOption label="🔥 Cấp bách" value="Urgent" />
            <ElOption label="⭐️ Tiềm năng" value="High" />
            <ElOption label="📁 Theo dõi" value="Low" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Giai đoạn phễu">
          <ElSelect v-model="form.status" class="w-full premium-select">
            <ElOption label="Mới đăng ký" value="New" />
            <ElOption label="Đang tư vấn" value="Consulting" />
            <ElOption label="Đang lái thử" value="TestDrive" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="Dòng xe quan tâm">
          <ElInput
            v-model="form.interestedVehicle"
            placeholder="VD: Winner X, SH 125i..."
            class="premium-input"
          />
        </ElFormItem>

        <ElFormItem label="Ghi chú ban đầu" class="col-span-2">
          <ElInput
            v-model="form.note"
            type="textarea"
            :rows="3"
            placeholder="Ghi chú nhanh về nhu cầu khách hàng..."
            class="premium-input"
          />
        </ElFormItem>
      </ElForm>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end p-2">
        <ElButton
          @click="visible = false"
          class="rounded-xl border-none bg-gray-100 text-gray-500 font-bold px-6"
          >HỦY BỎ</ElButton
        >
        <ElButton
          type="primary"
          @click="handleSubmit"
          class="rounded-xl px-8 font-black shadow-lg shadow-blue-100"
          >LƯU HỒ SƠ</ElButton
        >
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  modelValue: boolean;
  initialData?: any;
}>();

const emit = defineEmits(["update:modelValue", "success"]);

const visible = ref(props.modelValue);
watch(
  () => props.modelValue,
  (val) => (visible.value = val),
);
watch(visible, (val) => emit("update:modelValue", val));

const form = ref({
  id: null as number | null,
  fullName: "",
  phoneNumber: "",
  email: "",
  source: "Store",
  priority: "High",
  status: "New",
  interestedVehicle: "",
  note: "",
});

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = { ...newData };
    } else {
      form.value = {
        id: null,
        fullName: "",
        phoneNumber: "",
        email: "",
        source: "Store",
        priority: "High",
        status: "New",
        interestedVehicle: "",
        note: "",
      };
    }
  },
  { immediate: true },
);

const handleSubmit = () => {
  if (!form.value.fullName || !form.value.phoneNumber) {
    ElMessage.warning("Vui lòng nhập Tên và Số điện thoại");
    return;
  }

  const message = form.value.id
    ? "Đã cập nhật thông tin khách hàng!"
    : "Đã thêm khách hàng mới vào hệ thống!";
  ElMessage.success(message);
  emit("success", { ...form.value });
  visible.value = false;
};
</script>

<style lang="scss" scoped>
.premium-dialog {
  :deep(.el-dialog) {
    overflow: hidden;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 15%);
  }

  :deep(.el-dialog__header) {
    padding: 24px;
    margin-right: 0;
    border-bottom: 1px solid #f9fafb;
  }

  .premium-input {
    :deep(.el-input__wrapper),
    :deep(.el-textarea__wrapper) {
      padding: 4px 12px;
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 12px;
      box-shadow: none;

      &.is-focus {
        background-color: white;
        border-color: #3b82f6;
        box-shadow: 0 0 0 4px rgb(59 130 246 / 10%);
      }
    }
  }

  .premium-select {
    :deep(.el-input__wrapper) {
      background-color: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  :deep(.el-form-item__label) {
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}
</style>
