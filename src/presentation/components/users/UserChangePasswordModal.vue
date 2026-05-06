<template>
  <DraggableModal width="400px" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-semibold text-gray-800">Đổi mật khẩu người dùng</h3>
    </template>
    <template #body>
      <LoadingOverlay :show="isSaving" />
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <input
          type="text"
          name="username"
          :value="userName"
          autocomplete="username"
          class="hidden"
          aria-hidden="true"
          tabindex="-1"
        />
        <Input
          v-model="form.newPassword"
          label="Mật khẩu mới"
          type="password"
          placeholder="Nhập mật khẩu mới"
          required
          autocomplete="new-password"
        />
        <Input
          v-model="form.confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          required
          autocomplete="new-password"
        />
      </form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3">
        <BaseButton text="Hủy" color="secondary" @click="$emit('close')" />
        <BaseButton text="Cập nhật" color="primary" :loading="isSaving" @click="handleSubmit" />
      </div>
    </template>
  </DraggableModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import DraggableModal from '@components/ui/DraggableModal.vue'
import BaseButton from '@components/ui/button/BaseButton.vue'
import Input from '@components/ui/input/BaseInput.vue'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import { useToast } from 'vue-toastification'

const props = defineProps({
  show: Boolean,
  userId: String,
  userName: String,
  isSaving: Boolean,
})

const emit = defineEmits(['close', 'save'])
const toast = useToast()

const form = ref({
  newPassword: '',
  confirmPassword: '',
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.value = {
        newPassword: '',
        confirmPassword: '',
      }
    }
  },
)

const handleSubmit = () => {
  if (!form.value.newPassword) {
    toast.error('Vui lòng nhập mật khẩu mới')
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    toast.error('Mật khẩu xác nhận không khớp')
    return
  }
  emit('save', { newPassword: form.value.newPassword })
}
</script>



