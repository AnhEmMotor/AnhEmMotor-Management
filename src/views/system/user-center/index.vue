<!-- Trung tâm cá nhântrangmặt -->
<template>
  <div class="w-full h-full p-0 bg-transparent border-none shadow-none">
    <div class="relative flex-b mt-2.5 max-md:block max-md:mt-1">
      <div class="w-112 mr-5 max-md:w-full max-md:mr-0">
        <div class="art-card-sm relative p-9 pb-6 overflow-hidden text-center">
          <img class="absolute top-0 left-0 w-full h-50 object-cover" src="@imgs/user/bg.webp" />
          <img
            class="relative z-10 w-20 h-20 mt-30 mx-auto object-cover border-2 border-white rounded-full"
            src="@imgs/user/avatar.webp"
          />
          <h2 class="mt-5 text-xl font-normal">{{ userInfo.userName }}</h2>
          <p class="mt-5 text-sm">{{ $t('admin.t155') }}</p>

          <div class="w-75 mx-auto mt-7.5 text-left">
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:mail-line" class="text-g-700" />
              <span class="ml-2 text-sm">jdkjjfnndf@mall.com</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:user-3-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ $t('admin.t156') }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:map-pin-line" class="text-g-700" />
              <span class="ml-2 text-sm">{{ $t('admin.t157') }}</span>
            </div>
            <div class="mt-2.5">
              <ArtSvgIcon icon="ri:dribbble-fill" class="text-g-700" />
              <span class="ml-2 text-sm">{{ $t('admin.t158') }}</span>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-sm font-medium">{{ $t('admin.t159') }}</h3>
            <div class="flex flex-wrap justify-center mt-3.5">
              <div
                v-for="item in lableList"
                :key="item"
                class="py-1 px-1.5 mr-2.5 mb-2.5 text-xs border border-g-300 rounded"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-hidden max-md:w-full max-md:mt-3.5">
        <div class="art-card-sm">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">{{ $t('admin.t160') }}</h1>

          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full [&>.el-row_.el-select]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem :label="$t('admin.t162')" prop="realName">
                <ElInput v-model="form.realName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem :label="$t('admin.t163')" prop="sex" class="ml-5">
                <ElSelect v-model="form.sex" placeholder="Select" :disabled="!isEdit">
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
              <ElFormItem :label="$t('admin.t164')" prop="nikeName">
                <ElInput v-model="form.nikeName" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem :label="$t('admin.t165')" prop="email" class="ml-5">
                <ElInput v-model="form.email" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElRow>
              <ElFormItem :label="$t('admin.t166')" prop="mobile">
                <ElInput v-model="form.mobile" :disabled="!isEdit" />
              </ElFormItem>
              <ElFormItem :label="$t('admin.t167')" prop="address" class="ml-5">
                <ElInput v-model="form.address" :disabled="!isEdit" />
              </ElFormItem>
            </ElRow>

            <ElFormItem :label="$t('admin.t168')" prop="des" class="h-32">
              <ElInput type="textarea" :rows="4" v-model="form.des" :disabled="!isEdit" />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="edit">
                {{ isEdit ? 'Lưutồn' : 'Chỉnh sửa' }}
              </ElButton>
            </div>
          </ElForm>
        </div>

        <div class="art-card-sm my-5">
          <h1 class="p-4 text-xl font-normal border-b border-g-300">{{ $t('admin.t161') }}</h1>

          <ElForm :model="pwdForm" class="box-border p-5" label-width="86px" label-position="top">
            <ElFormItem :label="$t('admin.t169')" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem :label="$t('admin.t170')" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <ElFormItem :label="$t('admin.t171')" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                :disabled="!isEditPwd"
                show-password
              />
            </ElFormItem>

            <div class="flex-c justify-end [&_.el-button]:!w-27.5">
              <ElButton type="primary" class="w-22.5" v-ripple @click="editPwd">
                {{ isEditPwd ? 'Lưutồn' : 'Chỉnh sửa' }}
              </ElButton>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)
  const date = ref('')
  const ruleFormRef = ref<FormInstance>()

  /**
   * NguoiDungThongTinForm
   */
  const form = reactive({
    realName: 'John Snow',
    nikeName: 'dathẻđồi',
    email: '59301283@mall.com',
    mobile: '18888888888',
    address: 'Thành phố Thâm Quyến, Quảng Đôngbảoanđồngtâyquêphốđạo101tòa201',
    sex: '2',
    des: 'Art Design Pro làmộtkhoảnkiêmdụng cụthiếtkếmỹhọcvớicaohiệumởphátcủasauchiếcHeThong.'
  })

  /**
   * Mật khẩusửasửaForm
   */
  const pwdForm = reactive({
    password: '123456',
    newPassword: '123456',
    confirmPassword: '123456'
  })

  /**
   * Formnghiệmtínhquy
   */
  const rules = reactive<FormRules>({
    realName: [
      { required: true, message: 'Vui lòng nhậpHọ tên', trigger: 'blur' },
      { min: 2, max: 50, message: 'trườngđộtại 2 đến 50 chiếcchữký', trigger: 'blur' }
    ],
    nikeName: [
      { required: true, message: 'Vui lòng nhậpBiệt danh', trigger: 'blur' },
      { min: 2, max: 50, message: 'trườngđộtại 2 đến 50 chiếcchữký', trigger: 'blur' }
    ],
    email: [{ required: true, message: 'Vui lòng nhậpEmail', trigger: 'blur' }],
    mobile: [{ required: true, message: 'Vui lòng nhậpSố điện thoạimã', trigger: 'blur' }],
    address: [{ required: true, message: 'Vui lòng nhậpDiaChi', trigger: 'blur' }],
    sex: [{ required: true, message: 'Vui lòng chọnGioiTinh', trigger: 'blur' }]
  })

  /**
   * GioiTinhvịmục
   */
  const options = [
    { value: '1', label: 'Nam' },
    { value: '2', label: 'Nữ' }
  ]

  /**
   * NguoiDungTagDanh sách
   */
  const lableList: Array<string> = ['Tập trungthiếtkế', 'rấtcómuốnpháp', 'cay~', 'đạitrườngchân', 'xuyênemtử', 'biểnnạpxuyên']

  onMounted(() => {
    getDate()
  })

  /**
   * liệukhitrướcThoiGianLấyhỏiđợingôn
   */
  const getDate = () => {
    const h = new Date().getHours()

    if (h >= 6 && h < 9) date.value = 'sángtrênhảo'
    else if (h >= 9 && h < 11) date.value = 'trêntrưahảo'
    else if (h >= 11 && h < 13) date.value = 'trongtrưahảo'
    else if (h >= 13 && h < 18) date.value = 'dướitrưahảo'
    else if (h >= 18 && h < 24) date.value = 'tốitrênhảo'
    else date.value = 'rấttốirồi，sángđiểmngủ'
  }

  /**
   * Chuyển đổiNguoiDungThongTinChỉnh sửaTrạng thái
   */
  const edit = () => {
    isEdit.value = !isEdit.value
  }

  /**
   * Chuyển đổiMật khẩuChỉnh sửaTrạng thái
   */
  const editPwd = () => {
    isEditPwd.value = !isEditPwd.value
  }
</script>
