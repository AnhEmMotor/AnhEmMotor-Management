<script setup>
import { watch } from 'vue'
import { showConfirmation } from '@/composables/confirmation'

const props = defineProps({
  isOpen: Boolean,
  supplier: Object,
})
const emit = defineEmits(['close', 'confirm'])

// When parent sets isOpen -> true, use the global confirmation modal and re-emit
watch(
  () => props.isOpen,
  async (val) => {
    if (!val) return
    const title = 'Xác nhận xóa'
    const message = props.supplier
      ? `Bạn có chắc chắn muốn xóa nhà cung cấp "${props.supplier.name}"? Hành động này không thể hoàn tác.`
      : 'Bạn có chắc chắn muốn xóa mục này?'
    const confirmed = await showConfirmation(title, message)
    if (confirmed) emit('confirm')
    // always notify parent to close the local modal state
    emit('close')
  },
)
</script>

<!-- This component is a programmatic wrapper around the global confirmation modal; it does not render local UI. -->
