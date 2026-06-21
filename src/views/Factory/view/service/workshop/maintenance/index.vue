<template>
  <div class="maintenance-page p-4">
    <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <h1 class="m-0 text-lg font-black tracking-tight text-slate-900">
        ⚙️ PHIẾU BẢO DƯỠNG &amp; CHĂM SÓC XE:
        <span class="ml-2 text-primary-600">{{ ticket.ticketCode }}</span>
      </h1>
      <div class="mt-1 text-xs text-slate-500">
        {{ ticket.licensePlate ? `BKS: ${ticket.licensePlate}` : 'Chưa có BKS' }}
        <span v-if="ticket.customerName"> • {{ ticket.customerName }}</span>
        <span v-if="ticket.vehicleModelName"> • {{ ticket.vehicleModelName }}</span>
      </div>
    </div>

    <!-- Progress (state machine) -->
    <div class="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2">
      <div class="flex items-center gap-3 flex-wrap">
        <div
          class="text-xs"
          :class="
            ticket.workflowStatus === 'Received' ? 'font-bold text-emerald-600' : 'text-slate-500'
          "
          >✓ Tiếp nhận</div
        >
        <div
          class="text-xs"
          :class="
            ticket.workflowStatus === 'InProgress' ? 'font-bold text-emerald-600' : 'text-slate-500'
          "
          >● ĐANG LÀM VIỆC</div
        >
        <div
          class="text-xs"
          :class="
            ticket.workflowStatus === 'QcPending' ? 'font-bold text-emerald-600' : 'text-slate-500'
          "
          >○ Chờ kiểm tra QC</div
        >
        <div
          class="text-xs"
          :class="
            ticket.workflowStatus === 'PaymentPending'
              ? 'font-bold text-emerald-600'
              : 'text-slate-500'
          "
          >○ Chờ thanh toán</div
        >
        <div
          class="text-xs"
          :class="
            ticket.workflowStatus === 'Completed' ? 'font-bold text-emerald-600' : 'text-slate-500'
          "
          >○ Hoàn tất</div
        >

        <div class="ml-auto flex items-center gap-2">
          <ElButton type="primary" :loading="isSaving" :disabled="isSaving" @click="handleSave"
            >Lưu phiếu</ElButton
          >
        </div>
      </div>
    </div>

    <!-- 70/30 layout -->
    <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-12">
      <div class="md:col-span-8">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <!-- 1) Vehicle & ODO -->
          <section>
            <h2 class="text-sm font-bold text-slate-900">1) Thông tin xe &amp; chỉ số ODO</h2>

            <div class="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
              <div class="md:col-span-4">
                <ElInput v-model="form.licensePlate" placeholder="Số BKS (VD: 60A-123.45)" />
              </div>
              <div class="md:col-span-4">
                <ElInput v-model="form.customerName" placeholder="Tên khách" />
              </div>
              <div class="md:col-span-4">
                <ElSelect v-model="selectedPackageId" placeholder="Gói bảo dưỡng" class="w-full">
                  <ElOption
                    v-for="opt in packageOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </ElSelect>
              </div>

              <div class="md:col-span-6">
                <ElInputNumber
                  v-model="form.currentOdo"
                  :min="0"
                  style="width: 100%"
                  @change="handleOdoChange"
                />
                <div v-if="odoError" class="mt-1 text-xs text-red-600">{{ odoError }}</div>
              </div>
              <div class="md:col-span-6">
                <div class="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div class="text-xs font-semibold text-slate-700">Biên niên sử xe</div>
                  <div class="mt-2 text-xs text-slate-600">
                    <div v-if="ticket.lastOdoBefore != null"
                      >ODO lần trước:
                      <span class="font-semibold">{{ ticket.lastOdoBefore }}</span> km</div
                    >
                    <div v-if="ticket.odoHistory?.[0]?.lastServiceDate" class="mt-1">
                      Ngày bảo dưỡng gần nhất:
                      <span class="font-semibold">{{
                        formatDate(ticket.odoHistory[0].lastServiceDate)
                      }}</span>
                    </div>
                    <div v-else class="text-slate-400">Chưa có dữ liệu lịch sử.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 2) Warnings -->
          <section class="mt-4">
            <h2 class="text-sm font-bold text-slate-900">2) Cảnh báo hao mòn tự động</h2>
            <div class="mt-3 space-y-3">
              <div
                v-for="w in ticket.warnings"
                :key="w.id"
                class="rounded-lg border p-3 flex items-start gap-3"
                :class="
                  w.level === 'danger' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                "
              >
                <div class="mt-0.5 text-lg">
                  <span v-if="w.level === 'warning'">🟨</span>
                  <span v-else>🟥</span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-slate-900">{{ w.message }}</div>
                  <div class="text-xs text-slate-600 mt-1">Mốc: {{ w.targetKm }} km</div>
                </div>
              </div>
              <div v-if="ticket.warnings.length === 0" class="text-sm text-slate-500"
                >Không có cảnh báo.</div
              >
            </div>
          </section>

          <!-- 3) Checklist -->
          <section class="mt-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <h2 class="text-sm font-bold text-slate-900"
                >3) Danh mục kiểm tra (Checklist quy chuẩn)</h2
              >
              <ElTag v-if="ticket.selectedPackage" type="info" effect="dark">{{
                ticket.selectedPackage.name
              }}</ElTag>
            </div>

            <div v-if="ticket.selectedPackage" class="mt-3 space-y-2">
              <div
                v-for="c in ticket.checklist"
                :key="c.id"
                class="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                <input
                  :checked="c.done"
                  type="checkbox"
                  class="mt-1 h-4 w-4 accent-primary-500"
                  @change="(e) => toggleChecklist(c.id, (e.target as HTMLInputElement).checked)"
                />
                <div class="flex-1">
                  <div class="text-sm font-semibold text-slate-900">{{ c.name }}</div>
                  <div v-if="c.notes" class="text-xs text-emerald-700 mt-1">{{ c.notes }}</div>
                </div>
              </div>
            </div>

            <div v-else class="mt-3 text-sm text-slate-500"
              >Chọn một gói để hiển thị checklist.</div
            >
          </section>

          <!-- 4) Parts & Labor cost -->
          <section class="mt-4">
            <h2 class="text-sm font-bold text-slate-900">4) Phụ tùng thay thế &amp; công thợ</h2>

            <div class="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div class="lg:col-span-7">
                <div class="rounded-lg border border-slate-200 p-3">
                  <div class="text-xs font-semibold text-slate-700">Tìm phụ tùng (tạm demo)</div>
                  <div class="mt-2 flex items-center gap-2 flex-wrap">
                    <ElInput
                      v-model="partsSearch"
                      class="w-64"
                      placeholder="Tìm theo tên phụ tùng"
                    />
                    <ElButton
                      type="primary"
                      :loading="isPartsAdding"
                      :disabled="isPartsAdding"
                      @click="handleAddMockPart"
                      >+ Thêm phụ tùng</ElButton
                    >
                  </div>

                  <ElTable :data="ticket.parts" border style="width: 100%" class="mt-3">
                    <ElTableColumn prop="partName" label="Tên Phụ Tùng" />
                    <ElTableColumn prop="requiredQuantity" label="Số Lượng" width="110" />
                    <ElTableColumn prop="unitPrice" label="Đơn Giá" width="140">
                      <template #default="{ row }">{{ formatVnd(row.unitPrice) }}</template>
                    </ElTableColumn>
                    <ElTableColumn label="Thành Tiền" width="160">
                      <template #default="{ row }">{{ formatVnd(row.total) }}</template>
                    </ElTableColumn>
                    <ElTableColumn label="Thao tác" width="110">
                      <template #default="{ row }">
                        <ElButton
                          type="danger"
                          text
                          :disabled="isSaving"
                          @click="removePart(row.id)"
                          >Xóa</ElButton
                        >
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>
              </div>

              <div class="lg:col-span-5">
                <div class="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <div class="text-xs font-semibold text-slate-700">Chi phí tạm tính</div>
                  <div class="mt-3 space-y-2 text-sm">
                    <div class="flex items-center justify-between"
                      ><span>Tiền phụ tùng</span
                      ><span class="font-semibold">{{ formatVnd(totalPartsCost) }}</span></div
                    >
                    <div class="flex items-center justify-between"
                      ><span>Tiền công thợ</span
                      ><span class="font-semibold">{{ formatVnd(ticket.laborCost) }}</span></div
                    >
                    <div class="flex items-center justify-between"
                      ><span>Giảm giá</span
                      ><span class="font-semibold text-emerald-700"
                        >-{{ formatVnd(ticket.discount) }}</span
                      ></div
                    >
                    <div class="border-t border-slate-200 pt-3 flex items-center justify-between">
                      <span class="font-bold">➔ TỔNG CUỐI:</span>
                      <span class="font-black text-primary-600">{{
                        formatVnd(totalFinalCost)
                      }}</span>
                    </div>
                  </div>

                  <div class="mt-4 flex gap-2 flex-wrap">
                    <ElButton
                      type="warning"
                      :disabled="!ticket.id"
                      :loading="isSaving"
                      @click="handleApplyPackage"
                      >📋 Sửa phiếu</ElButton
                    >
                    <ElButton
                      type="success"
                      :disabled="!ticket.id"
                      :loading="isQc"
                      @click="handleQcPass"
                      >🔔 Báo QC đạt chất lượng</ElButton
                    >
                  </div>

                  <div class="mt-3 text-xs text-slate-500">
                    Lưu ý: Tổng tiền không nhập tay; Total được computed theo
                    <b>Tiền phụ tùng + Tiền công - Giảm giá</b>.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="md:col-span-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <h2 class="text-sm font-bold text-slate-900">🪪 KHÁCH HÀNG &amp; XE</h2>

          <div class="mt-3 space-y-3">
            <div class="rounded-lg border border-slate-200 p-3">
              <div class="text-xs text-slate-500">Khách hàng</div>
              <div class="text-sm font-semibold text-slate-900">{{
                ticket.customerName || '—'
              }}</div>
            </div>

            <div class="rounded-lg border border-slate-200 p-3">
              <div class="text-xs text-slate-500">Xe</div>
              <div class="text-sm font-semibold text-slate-900">{{
                ticket.vehicleModelName || '—'
              }}</div>
              <div v-if="ticket.licensePlate" class="text-xs text-slate-600 mt-1"
                >BKS: {{ ticket.licensePlate }}</div
              >
            </div>

            <div class="rounded-lg border border-slate-200 p-3">
              <div class="text-xs text-slate-500">ODO vào xưởng</div>
              <div class="text-sm font-semibold text-slate-900"
                >{{ ticket.currentOdo ?? '—' }} km</div
              >
            </div>

            <div class="rounded-lg border border-slate-200 p-3">
              <div class="text-xs text-slate-500">Thợ phụ trách (tạm)</div>
              <div class="text-sm font-semibold text-slate-900">Nguyễn Văn B</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { ElInput, ElMessage } from 'element-plus'

  import { createMaintenanceUseCases } from '@/infrastructure/maintenance/usecasesFactory'
  import type { MaintenancePartsLine, MaintenanceTicket } from '@/domain/maintenance/types'

  const usecases = createMaintenanceUseCases()

  const ticket = reactive<MaintenanceTicket>({
    id: undefined,
    ticketCode: 'RO-XXXX-0000',
    licensePlate: '',
    customerName: '',
    vehicleModelName: '',
    odoHistory: [],
    currentOdo: undefined,
    lastOdoBefore: undefined,
    warnings: [],
    selectedPackage: undefined,
    checklist: [],
    parts: [],
    laborCost: 0,
    discount: 0,
    workflowStatus: 'Received',
  })

  const isSaving = ref(false)
  const isQc = ref(false)
  const isPartsAdding = ref(false)

  const form = reactive({
    licensePlate: '60A-123.45',
    customerName: 'Hoàng Đình Binh',
    currentOdo: 12050,
  })

  const odoError = ref<string | null>(null)

  const selectedPackageId = ref('pkg_10000')

  const packageOptions = computed(() => {
    return [
      { label: 'Gói 1.000km', value: 'pkg_1000' },
      { label: 'Gói 5.000km', value: 'pkg_5000' },
      { label: 'Gói 10.000km', value: 'pkg_10000' },
      { label: 'Gói 15.000km', value: 'pkg_15000' },
    ]
  })

  const partsSearch = ref('')

  const totalPartsCost = computed(() => {
    return ticket.parts.reduce((sum, p) => sum + (p.total || 0), 0)
  })

  const totalFinalCost = computed(() => {
    // Guard theo Backup.md: Total = Parts + Labor - Discount
    const labor = ticket.laborCost || 0
    const discount = ticket.discount || 0
    return totalPartsCost.value + labor - discount
  })

  function formatVnd(value: number): string {
    try {
      return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value) + 'đ'
    } catch {
      return `${Math.round(value)}đ`
    }
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('vi-VN')
    } catch {
      return iso
    }
  }

  async function refreshTicket() {
    // Tạm gọi GetMaintenanceTicketUseCase bằng ticketId giả định.
    const t = await usecases.getTicket.execute({ ticketId: 8829 })

    Object.assign(ticket, t)
    selectedPackageId.value = t.selectedPackage?.id || selectedPackageId.value

    // Sync form
    form.licensePlate = t.licensePlate || ''
    form.customerName = t.customerName || ''
    form.currentOdo = t.currentOdo ?? form.currentOdo
  }

  function validateOdoNonDecreasing(currentOdo: number): boolean {
    const last = ticket.lastOdoBefore ?? 0
    if (currentOdo < last) {
      odoError.value = 'ODO không được nhỏ hơn ODO của lần bảo dưỡng liền trước.'
      return false
    }
    odoError.value = null
    return true
  }

  async function handleOdoChange(next: number | undefined) {
    if (typeof next !== 'number') return
    if (!validateOdoNonDecreasing(next)) return

    if (!ticket.id) return

    const updated = await usecases.updateOdoAndWarnings.execute({
      ticketId: Number(ticket.id),
      currentOdo: next,
    })
    Object.assign(ticket, updated)
  }

  function toggleChecklist(id: string, checked: boolean) {
    const item = ticket.checklist.find((x) => x.id === id)
    if (!item) return

    item.done = checked
    item.notes = checked ? 'Đạt' : undefined
  }

  async function handleSave() {
    // UI demo: map “save” => đổi package/checklist không có endpoint.
    isSaving.value = true
    try {
      if (!ticket.id) return

      // Update package if selected changed
      await handleApplyPackage()

      ElMessage.success('Đã lưu phiếu (tạm demo).')
    } catch (err: any) {
      ElMessage.error(err?.message || 'Lỗi khi lưu phiếu')
    } finally {
      isSaving.value = false
    }
  }

  async function handleApplyPackage() {
    if (!ticket.id) {
      // create ticket first
      await createFirstIfNeeded()
    }

    // Apply package template
    const updated = await usecases.applyPackage.execute({
      ticketId: Number(ticket.id),
      packageId: selectedPackageId.value,
    })

    Object.assign(ticket, updated)
    ElMessage.success('Đã áp gói bảo dưỡng.')
  }

  async function createFirstIfNeeded() {
    if (ticket.id) return

    const created = await usecases.createTicket.execute({
      licensePlate: form.licensePlate,
      customerName: form.customerName,
      currentOdo: form.currentOdo,
      packageId: selectedPackageId.value,
    })

    Object.assign(ticket, created)
  }

  async function handleQcPass() {
    isQc.value = true
    try {
      if (!ticket.id) {
        await createFirstIfNeeded()
      }

      // TODO: Map QC pass to workflow endpoint.
      await usecases.changeWorkflowStatus.execute({
        ticketId: Number(ticket.id),
        status: 'QcPending',
        qcNote: 'QC đạt chất lượng',
      })

      ticket.workflowStatus = 'Completed'
      ElMessage.success('Đã báo QC đạt chất lượng (tạm demo).')
    } catch (err: any) {
      ElMessage.error(err?.message || 'Lỗi QC')
    } finally {
      isQc.value = false
    }
  }

  function removePart(id: string) {
    ticket.parts = ticket.parts.filter((p) => p.id !== id)
  }

  async function handleAddMockPart() {
    isPartsAdding.value = true
    try {
      const part: MaintenancePartsLine = {
        id: `part_${Date.now()}`,
        partName: partsSearch.value ? `SP: ${partsSearch.value}` : 'Lọc gió (mock)',
        productVariantId: 0,
        availableQuantity: 999,
        requiredQuantity: 1,
        unitPrice: 150000,
        total: 150000,
      }

      ticket.parts.push(part)

      // Re-issue parts via usecase (computed total)
      if (ticket.id) {
        const updated = await usecases.issueParts.execute({
          ticketId: Number(ticket.id),
          parts: ticket.parts,
        })
        Object.assign(ticket, updated)
      }
    } finally {
      isPartsAdding.value = false
    }
  }

  onMounted(() => {
    refreshTicket().catch(() => {
      // keep mock UI
    })
  })
</script>

<style scoped>
  .maintenance-page {
    color: #0f172a;
  }
</style>
