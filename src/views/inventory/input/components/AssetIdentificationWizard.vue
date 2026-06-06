<template>
  <div class="asset-wizard pb-4">
    <ElSteps :active="activeStep" finish-status="success" align-center class="mb-8">
      <ElStep title="Tiếp nhận" description="Chọn NCC & Dòng xe" />
      <ElStep title="Định danh" description="Số khung & Số máy" />
      <ElStep title="Lưu kho" description="Phân bổ vị trí" />
      <ElStep title="Hoàn tất" description="Chốt sổ nhật ký" />
    </ElSteps>

    <div class="wizard-content min-h-[400px] px-4">
      <div v-if="activeStep === 0" class="space-y-6">
        <div class="grid grid-cols-2 gap-8">
          <div class="space-y-4">
            <label class="block text-sm font-bold text-gray-700">1. Nhà cung cấp</label>
            <ElSelect
              v-model="form.supplierId"
              placeholder="Tìm nhà cung cấp..."
              class="w-full"
              filterable
            >
              <ElOption label="Honda Việt Nam" :value="1" />
              <ElOption label="Yamaha Motor Việt Nam" :value="2" />
            </ElSelect>
          </div>
          <div class="space-y-4">
            <label class="block text-sm font-bold text-gray-700">2. Dòng xe nhập về</label>
            <ElSelect
              v-model="form.productId"
              placeholder="Chọn mẫu xe..."
              class="w-full"
              filterable
            >
              <ElOption label="Honda Vision 2024" :value="101" />
              <ElOption label="Honda SH 125i" :value="102" />
              <ElOption label="Yamaha Exciter 155" :value="103" />
            </ElSelect>
          </div>
        </div>
        <div class="max-w-xs space-y-4">
          <label class="block text-sm font-bold text-gray-700">3. Đơn giá nhập (Giá vốn)</label>
          <ElInputNumber
            v-model="form.costPrice"
            :min="0"
            class="!w-full"
            :controls="false"
            placeholder="VNĐ"
          />
        </div>
      </div>

      <div v-if="activeStep === 1" class="space-y-4">
        <div class="flex-cb mb-4">
          <h4 class="m-0">Quét QR hoặc nhập tay định danh tài sản</h4>
          <ElButton type="primary" plain @click="addUnit">
            <ElIcon class="mr-1"><Plus /></ElIcon> Thêm xe mới
          </ElButton>
        </div>

        <ElTable :data="form.units" border stripe>
          <ElTableColumn label="STT" width="60" align="center">
            <template #default="{ $index }">{{ $index + 1 }}</template>
          </ElTableColumn>
          <ElTableColumn label="Số Khung (Frame No)" min-width="180">
            <template #default="{ row, $index }">
              <ElInput
                v-model="row.frameNo"
                placeholder="Quét mã QR..."
                :class="{ 'is-error': checkDuplicate(row.frameNo, 'frameNo', $index) }"
              />
              <span
                v-if="checkDuplicate(row.frameNo, 'frameNo', $index)"
                class="text-[10px] text-red-500 font-bold italic"
              >
                ⚠️ Số khung bị trùng lặp!
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Số Máy (Engine No)" min-width="180">
            <template #default="{ row, $index }">
              <ElInput
                v-model="row.engineNo"
                placeholder="Quét mã QR..."
                :class="{ 'is-error': checkDuplicate(row.engineNo, 'engineNo', $index) }"
              />
              <span
                v-if="checkDuplicate(row.engineNo, 'engineNo', $index)"
                class="text-[10px] text-red-500 font-bold italic"
              >
                ⚠️ Số máy bị trùng lặp!
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Chất lượng" width="160">
            <template #default="{ row }">
              <ElSelect v-model="row.quality">
                <ElOption label="Mới 100%" value="new" />
                <ElOption label="Trầy xước nhẹ" value="scratched" />
              </ElSelect>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Chìa khóa" width="100">
            <template #default="{ row }">
              <ElInputNumber
                v-model="row.keyCount"
                :min="1"
                :max="4"
                controls-position="right"
                class="!w-full"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn width="50" align="center">
            <template #default="{ $index }">
              <ElButton link type="danger" @click="form.units.splice($index, 1)">
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <div v-if="activeStep === 2" class="space-y-4">
        <h4 class="mb-4">Phân bổ vị trí lưu kho</h4>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="(unit, index) in form.units"
            :key="index"
            class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100"
          >
            <div class="flex-1">
              <div class="font-bold text-sm text-gray-800">{{
                unit.frameNo || 'Chưa nhập số khung'
              }}</div>
              <div class="text-[11px] text-gray-400">Số máy: {{ unit.engineNo || '-' }}</div>
            </div>
            <div class="w-64">
              <ElSelect v-model="unit.location" placeholder="Chọn vị trí..." class="w-full">
                <ElOption label="Khu trưng bày (Showroom)" value="showroom" />
                <ElOption label="Kho dự phòng (Back-up)" value="backup" />
              </ElSelect>
            </div>
            <ElTag type="success" effect="dark" round size="small">AVAILABLE</ElTag>
          </div>
        </div>
      </div>

      <div v-if="activeStep === 3" class="space-y-6">
        <div class="flex items-center gap-2 text-warning font-bold">
          <ElIcon><WarningFilled /></ElIcon>
          <span>Xác nhận thông tin lần cuối trước khi chốt sổ nhập kho</span>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="p-6 bg-primary/5 rounded-xl border border-primary/10">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wider"
              >Tổng số lượng nhập</div
            >
            <div class="text-3xl font-bold text-primary"
              >{{ form.units.length }} <small class="text-sm font-normal">xe</small></div
            >
          </div>
          <div class="p-6 bg-success/5 rounded-xl border border-success/10">
            <div class="text-xs text-gray-500 mb-1 uppercase tracking-wider"
              >Tổng giá trị đơn nhập</div
            >
            <div class="text-3xl font-bold text-success"
              >{{ (form.costPrice * form.units.length).toLocaleString() }}
              <small class="text-sm font-normal text-gray-400">VNĐ</small></div
            >
          </div>
        </div>

        <ElDescriptions title="Thông tin chung" :column="2" border>
          <ElDescriptionsItem label="Nhà cung cấp">Honda Việt Nam</ElDescriptionsItem>
          <ElDescriptionsItem label="Dòng xe">Honda Vision 2024</ElDescriptionsItem>
          <ElDescriptionsItem label="Thời gian khởi tạo">04/05/2026 08:30</ElDescriptionsItem>
          <ElDescriptionsItem label="Người thực hiện">Admin - Hệ thống</ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </div>

    <div class="flex justify-between mt-8 border-t pt-6 px-4">
      <ElButton @click="$emit('cancel')">Đóng</ElButton>
      <div class="flex gap-2">
        <ElButton v-if="activeStep > 0" @click="activeStep--">Quay lại</ElButton>
        <ElButton v-if="activeStep < 3" type="primary" @click="activeStep++">Tiếp theo</ElButton>
        <ElButton v-else type="danger" @click="handleComplete"
          >Xác nhận & Hoàn tất nhập kho</ElButton
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { Plus, Delete, WarningFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'

  const emit = defineEmits(['cancel', 'complete'])
  const activeStep = ref(0)

  const form = reactive({
    supplierId: null,
    productId: null,
    costPrice: 0,
    units: [{ frameNo: '', engineNo: '', quality: 'new', keyCount: 2, location: 'showroom' }],
  })

  const addUnit = () => {
    form.units.push({
      frameNo: '',
      engineNo: '',
      quality: 'new',
      keyCount: 2,
      location: 'showroom',
    })
  }

  const checkDuplicate = (val: string, field: string, index: number) => {
    if (!val) return false
    return form.units.some((u, i) => i !== index && u[field as keyof typeof u] === val)
  }

  const handleComplete = () => {
    ElMessage.success('Hoàn tất nhập kho và sinh nhật ký định danh!')
    emit('complete')
  }
</script>

<style scoped>
  .asset-wizard :deep(.el-step__title) {
    font-weight: bold;
  }

  .asset-wizard :deep(.is-error .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }
</style>
