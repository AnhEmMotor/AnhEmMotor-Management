<template>
  <div class="flex flex-col gap-4 pb-5">
    <!-- Header Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ArtStatsCard
        title="Tổng số nhân sự"
        :count="employees.length"
        description="Nhân viên đang làm việc"
        icon="ri:group-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        title="Kinh doanh"
        :count="salesCount"
        description="Đội ngũ bán hàng"
        icon="ri:user-star-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        title="Kỹ thuật"
        :count="techCount"
        description="Đội ngũ kỹ thuật viên"
        icon="ri:tools-line"
        iconStyle="bg-warning"
      />
    </div>

    <!-- Search Bar -->
    <ArtSearchBar
      :items="searchItems"
      :label-width="110"
      :span="7"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Main Table -->
    <ElCard class="art-table-card">
      <template #header>
        <div class="flex-cb">
          <div class="flex items-center gap-2">
            <h4 class="m-0">Danh sách nhân sự</h4>
          </div>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm nhân viên
          </ElButton>
        </div>
      </template>

      <ArtTable
        :loading="loading"
        :data="employees"
        :columns="columns"
      >
        <!-- Employee Info -->
        <template #fullName="{ row }">
          <div class="flex items-center gap-3">
            <ElAvatar :size="40" :src="row.avatarUrl">{{ row.fullName.charAt(0) }}</ElAvatar>
            <div class="flex flex-col">
              <span class="font-bold text-gray-800">{{ row.fullName }}</span>
              <span class="text-[11px] text-gray-400">{{ row.employeeCode }}</span>
            </div>
          </div>
        </template>

        <!-- Role/Group -->
        <template #group="{ row }">
          <ElTag :type="row.employeeGroupId === 1 ? 'primary' : 'warning'" size="small">
            {{ row.employeeGroupId === 1 ? 'Kinh doanh' : 'Kỹ thuật' }}
          </ElTag>
        </template>

        <!-- Salary -->
        <template #salary="{ row }">
          <span class="font-medium">{{ formatCurrency(row.baseSalary) }}</span>
        </template>

        <!-- Status -->
        <template #status="{ row }">
          <ElTag :type="row.isActive ? 'success' : 'info'" size="small" round effect="dot">
            {{ row.isActive ? 'Đang làm việc' : 'Đã nghỉ việc' }}
          </ElTag>
        </template>

        <!-- Operation -->
        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <!-- Dialog Form -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4">
        <div class="grid grid-cols-2 gap-x-6">
          <ElFormItem label="Họ và tên" required class="col-span-2">
            <ElInput v-model="formData.fullName" placeholder="Nhập họ và tên đầy đủ" />
          </ElFormItem>

          <ElFormItem label="Mã nhân viên" required>
            <ElInput v-model="formData.employeeCode" placeholder="Ví dụ: NV001" />
          </ElFormItem>

          <ElFormItem label="Nhóm nhân sự" required>
            <ElSelect v-model="formData.employeeGroupId" class="w-full">
              <ElOption label="Kinh doanh" :value="1" />
              <ElOption label="Kỹ thuật" :value="2" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Lương cơ bản" required>
            <ElInputNumber v-model="formData.baseSalary" :min="0" :step="500000" class="!w-full" />
          </ElFormItem>

          <ElFormItem label="Số điện thoại">
            <ElInput v-model="formData.phoneNumber" />
          </ElFormItem>

          <ElFormItem label="Email">
            <ElInput v-model="formData.email" />
          </ElFormItem>

          <ElFormItem label="Trạng thái">
            <ElSwitch v-model="formData.isActive" active-text="Đang làm việc" inactive-text="Nghỉ việc" />
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="loading" @click="handleSave">Lưu thông tin</ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useHRStore } from '@/store/modules/hr'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'HREmployees' })

const hrStore = useHRStore()
const loading = computed(() => hrStore.loading)
const employees = computed(() => hrStore.employees)

const salesCount = computed(() => employees.value.filter((e: any) => e.employeeGroupId === 1).length)
const techCount = computed(() => employees.value.filter((e: any) => e.employeeGroupId === 2).length)

const dialogVisible = ref(false)
const dialogTitle = ref('Thêm nhân viên mới')
const formData = ref({
  id: null as number | null,
  fullName: '',
  employeeCode: '',
  employeeGroupId: 1,
  baseSalary: 0,
  phoneNumber: '',
  email: '',
  isActive: true
})

const columns = [
  { label: 'Họ tên', prop: 'fullName', slot: 'fullName', useSlot: true, minWidth: 200 },
  { label: 'Nhóm', slot: 'group', width: 140, useSlot: true },
  { label: 'Lương cơ bản', slot: 'salary', width: 140, useSlot: true },
  { label: 'Trạng thái', slot: 'status', width: 130, useSlot: true },
  { label: 'Thao tác', slot: 'operation', width: 120, align: 'center', useSlot: true }
]

const searchItems = [
  { key: 'name', label: 'Tên nhân viên', type: 'input' },
  { key: 'code', label: 'Mã nhân viên', type: 'input' }
]

const fetchData = () => hrStore.fetchEmployees()

const handleAdd = () => {
  dialogTitle.value = 'Thêm nhân viên mới'
  formData.value = {
    id: null,
    fullName: '',
    employeeCode: '',
    employeeGroupId: 1,
    baseSalary: 0,
    phoneNumber: '',
    email: '',
    isActive: true
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = 'Chỉnh sửa nhân viên'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    await hrStore.saveEmployee(formData.value.id, formData.value)
    ElMessage.success('Lưu thông tin nhân viên thành công')
    dialogVisible.value = false
  } catch (err: any) {
    ElMessage.error('Lỗi khi lưu thông tin')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('Xóa nhân viên này khỏi danh sách?', 'Cảnh báo').then(async () => {
    // await hrStore.deleteEmployee(row.id)
    ElMessage.success('Đã xóa nhân viên')
  })
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

const handleSearch = (q: any) => console.log(q)
const handleReset = () => console.log('reset')

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.art-table-card {
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
</style>
