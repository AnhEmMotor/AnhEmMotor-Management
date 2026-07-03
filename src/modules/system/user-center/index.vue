<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img
            class="absolute top-0 left-0 w-full h-50 object-cover"
            src="@imgs/user/bg.webp"
          />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            src="@imgs/user/avatar.webp"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.userName }}</h2>
          <p class="mt-5 text-sm">Hệ thống quản lý Anh Em Motor</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">admin@anhemmotor.com</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">Quản trị viên</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:map-pin-line" class="text-g-700" />
              <span class="ml-2 text-sm">TP. Hồ Chí Minh, Việt Nam</span>
            </div>
          </div>

          <div class="mt-8 mb-2 flex justify-center">
            <ElButton type="primary" @click="showPwdDialog = true">
              <ArtSvgIcon icon="ri:key-2-line" class="mr-2" /> Đổi mật khẩu
            </ElButton>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">
            Cài đặt cơ bản
          </h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="Họ tên" prop="realName">
                <ElInput v-model="form.realName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="Giới tính" prop="sex" class="ml-5">
                <ElSelect
                  v-model="form.sex"
                  placeholder="Select"
                  :disabled="!isEdit"
                >
                  <ElOption
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </ElSelect>
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="Biệt danh" prop="nikeName">
                <ElInput v-model="form.nikeName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="Email" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem label="Số điện thoại" prop="mobile">
                <ElInput v-model="form.mobile" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem label="Địa chỉ" prop="address" class="ml-5">
                <ElInput v-model="form.address" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem label="Giới thiệu cá nhân" prop="des" class="h-32">
              <ElInput
                type="textarea"
                :rows="4"
                v-model="form.des"
                :disabled="!isEdit"
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="edit">
                {{ isEdit ? "Lưu lại" : "Chỉnh sửa" }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="showPwdDialog"
      title="Đổi mật khẩu"
      width="400px"
      destroy-on-close
    >
      <ElForm :model="pwdForm" class="box-border" label-position="top">
        <ElFormItem label="Mật khẩu hiện tại" prop="password">
          <ElInput v-model="pwdForm.password" type="password" show-password />
        </ElFormItem>
        <ElFormItem label="Mật khẩu mới" prop="newPassword">
          <ElInput
            v-model="pwdForm.newPassword"
            type="password"
            show-password
          />
        </ElFormItem>
        <ElFormItem label="Xác nhận mật khẩu" prop="confirmPassword">
          <ElInput
            v-model="pwdForm.confirmPassword"
            type="password"
            show-password
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="showPwdDialog = false">Hủy bỏ</ElButton>
          <ElButton type="primary" @click="editPwd">Lưu lại</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/application/store/user";
import type { FormInstance, FormRules } from "element-plus";

defineOptions({ name: "UserCenter" });

const userStore = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);

const isEdit = ref(false);
const isEditPwd = ref(false);
const showPwdDialog = ref(false);
const date = ref("");
const ruleFormRef = ref<FormInstance>();

const form = reactive({
  realName: "Nguyễn Văn A",
  nikeName: "Anh Em Motor",
  email: "admin@anhemmotor.com",
  mobile: "0987654321",
  address: "Quận 1, TP. Hồ Chí Minh",
  sex: "1",
  des: "Hệ thống quản lý bán hàng Anh Em Motor - Nền tảng quản lý toàn diện.",
});

const pwdForm = reactive({
  password: "123456",
  newPassword: "123456",
  confirmPassword: "123456",
});

const rules = reactive<FormRules>({
  realName: [
    { required: true, message: "Vui lòng nhập họ tên", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Độ dài từ 2 đến 50 ký tự",
      trigger: "blur",
    },
  ],
  nikeName: [
    { required: true, message: "Vui lòng nhập biệt danh", trigger: "blur" },
    {
      min: 2,
      max: 50,
      message: "Độ dài từ 2 đến 50 ký tự",
      trigger: "blur",
    },
  ],
  email: [{ required: true, message: "Vui lòng nhập email", trigger: "blur" }],
  mobile: [
    {
      required: true,
      message: "Vui lòng nhập số điện thoại",
      trigger: "blur",
    },
  ],
  address: [
    { required: true, message: "Vui lòng nhập địa chỉ", trigger: "blur" },
  ],
  sex: [
    { required: true, message: "Vui lòng chọn giới tính", trigger: "blur" },
  ],
});

const options = [
  { value: "1", label: "Nam" },
  { value: "2", label: "Nữ" },
];

const lableList: Array<string> = [
  "Nhiệt huyết",
  "Thân thiện",
  "Chuyên nghiệp",
  "Đam mê xe",
  "Du lịch",
  "Năng động",
];

onMounted(() => {
  getDate();
});

const getDate = () => {
  const h = new Date().getHours();

  if (h >= 6 && h < 9) date.value = "Chào buổi sáng";
  else if (h >= 9 && h < 11) date.value = "Chào buổi trưa";
  else if (h >= 11 && h < 13) date.value = "Chào buổi trưa";
  else if (h >= 13 && h < 18) date.value = "Chào buổi chiều";
  else if (h >= 18 && h < 24) date.value = "Chào buổi tối";
  else date.value = "Khuya rồi, đi ngủ thôi";
};

const edit = () => {
  isEdit.value = !isEdit.value;
};

const editPwd = () => {
  showPwdDialog.value = false;
};
</script>
