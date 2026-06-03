<template>
  <div class="p-4">
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold">{{ $t('menus.service.workshop.evaluation') }}</h1>
        <p class="mt-1 text-sm text-slate-500">
          Duyệt danh sách đánh giá và phản hồi cho khách hàng.
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
      <!-- Left: List (40%) -->
      <div class="md:col-span-5">
        <div class="rounded-xl border border-slate-200 bg-white p-4">
          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="text-sm font-bold">Trạng thái:</div>
            <ElRadioGroup v-model="filters.status" size="small">
              <ElRadioButton value="Unprocessed">⏳ Chưa xử lý</ElRadioButton>
              <ElRadioButton value="Processed">✓ Đã xử lý</ElRadioButton>
            </ElRadioGroup>

            <div class="w-full" />

            <div class="text-sm font-bold">Tiêu chí:</div>
            <ElRadioGroup v-model="filters.criteria" size="small">
              <ElRadioButton value="QualityOfCar">Chất lượng xe</ElRadioButton>
              <ElRadioButton value="AttitudeOfService">Thái độ phục vụ</ElRadioButton>
            </ElRadioGroup>

            <div class="ml-auto">
              <ElInput
                v-model="filters.search"
                placeholder="Nhập SĐT/Tên..."
                class="w-72"
                clearable
              />
            </div>
          </div>

          <div class="mt-4">
            <ElTable
              :data="rows"
              border
              style="width: 100%"
              v-loading="listLoading"
              @row-click="handleSelect"
              highlight-current-row
            >
              <ElTableColumn prop="customerName" label="Khách hàng" min-width="180" />
              <ElTableColumn label="Điểm" min-width="120">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <span>{{ row.rating }}</span>
                    <span class="text-xs text-slate-500">/5</span>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="reviewMessage" label="Nội dung" min-width="220" />
              <ElTableColumn label="Thợ phụ trách" min-width="160">
                <template #default="{ row }">
                  <div>{{ row.technician?.name || '—' }}</div>
                  <div v-if="row.repairOrderCode" class="text-xs text-slate-500">{{
                    row.repairOrderCode
                  }}</div>
                </template>
              </ElTableColumn>
              <ElTableColumn label="Trạng thái" min-width="120">
                <template #default="{ row }">
                  <ElTag :type="row.processingStatus === 'Processed' ? 'success' : 'info'">
                    {{ row.processingStatus === 'Processed' ? 'Đã xử lý' : 'Chưa xử lý' }}
                  </ElTag>
                </template>
              </ElTableColumn>
            </ElTable>

            <div v-if="!listLoading && rows.length === 0" class="mt-4 text-sm text-slate-500">
              Chưa có dữ liệu.
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Detail / Workspace (60%) -->
      <div class="md:col-span-7">
        <div v-if="selected" class="rounded-xl border border-slate-200 bg-white p-4">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div class="text-lg font-bold">👤 {{ selected.customerName }}</div>
              <div class="text-sm text-slate-500">SĐT: {{ selected.customerPhone }}</div>
            </div>

            <div class="text-right">
              <div class="text-sm font-bold">⭐ {{ selected.rating }}/5</div>
              <div class="text-xs text-slate-500"
                >Tiêu chí: {{ criteriaText(selected.criteria) }}</div
              >
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-4">
            <!-- Action workspace -->
            <div class="rounded-lg border border-slate-200 p-4">
              <div class="font-bold text-sm mb-2">💬 NỘI DUNG ĐÁNH GIÁ TỪ KHÁCH</div>
              <div class="text-sm text-slate-900">"{{ selected.reviewMessage }}"</div>

              <div class="mt-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div class="font-bold text-sm">🛠️ Thợ sửa phụ trách</div>
                  <div class="text-sm">{{ selected.technician?.name || '—' }}</div>
                  <div v-if="selected.repairOrderCode" class="text-xs text-slate-500"
                    >Mã phiếu: #{{ selected.repairOrderCode }}</div
                  >
                </div>

                <div class="ml-auto">
                  <ElButton
                    type="success"
                    :loading="processedLoading"
                    :disabled="processedLoading || selected.processingStatus === 'Processed'"
                    @click="handleMarkProcessed"
                  >
                    ✓ Đánh dấu Đã xử lý
                  </ElButton>
                </div>
              </div>

              <div class="mt-4">
                <div class="font-bold text-sm mb-2">📌 Biên niên sử tương tác</div>
                <div class="space-y-2 max-h-72 overflow-auto pr-2">
                  <div
                    v-for="m in selected.chatHistory"
                    :key="m.id"
                    :class="
                      m.sender === 'Customer'
                        ? 'bg-blue-50 border-blue-200'
                        : m.sender === 'Admin'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                    "
                    class="rounded-lg border p-2"
                  >
                    <div class="text-xs text-slate-500"
                      >{{ senderLabel(m.sender) }} • {{ formatDate(m.createdAt) }}</div
                    >
                    <div class="text-sm">{{ m.content }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <div class="font-bold text-sm mb-2">✏️ PHẢN HỒI TRỰC TIẾP ĐẾN KHÁCH HÀNG</div>
                <ElInput
                  v-model="replyText"
                  type="textarea"
                  :rows="3"
                  placeholder="Nhập nội dung phản hồi..."
                />

                <div class="mt-3">
                  <ElButton
                    type="primary"
                    :loading="replyLoading"
                    :disabled="replyLoading || !replyText.trim()"
                    @click="handleSendReply"
                  >
                    💾 Lưu & Gửi phản hồi (CreateContactReply)
                  </ElButton>
                </div>
              </div>
            </div>

            <!-- Internal notes -->
            <div
              v-if="showInternalNotes"
              class="rounded-lg border border-slate-200 p-4 bg-slate-50"
            >
              <div class="font-bold text-sm">🔒 GHI CHÚ NỘI BỘ</div>
              <div class="text-xs text-slate-500 mt-1">
                Chỉ hiển thị nội bộ hệ thống management.
              </div>

              <div class="mt-3">
                <ElInput
                  v-model="internalNotesText"
                  type="textarea"
                  :rows="3"
                  placeholder="Nhập ghi chú nội bộ..."
                />

                <div class="mt-3">
                  <ElButton
                    type="warning"
                    :loading="notesLoading"
                    :disabled="notesLoading"
                    @click="handleSaveNotes"
                  >
                    Lưu ghi chú nội bộ
                  </ElButton>
                </div>
              </div>
            </div>

            <div v-else class="text-sm text-slate-500">
              Internal Notes không hiển thị với role hiện tại.
            </div>
          </div>
        </div>

        <div v-else class="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Chọn một bản ghi ở danh sách bên trái để xem chi tiết.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, watch } from 'vue'

  import { ElMessage } from 'element-plus'

  import { createEvaluationUseCases } from '@/infrastructure/evaluation/usecasesFactory'
  import type {
    EvaluationCriteria,
    EvaluationDetail,
    EvaluationProcessingStatus,
  } from '@/domain/evaluation/types'

  const usecases = createEvaluationUseCases()

  const filters = reactive<{
    status: EvaluationProcessingStatus
    criteria: EvaluationCriteria
    search: string
  }>({
    status: 'Unprocessed',
    criteria: 'QualityOfCar',
    search: '',
  })

  const listLoading = ref(false)
  const rows = ref([] as any[])

  const selected = ref<EvaluationDetail | null>(null)

  const replyText = ref('')
  const internalNotesText = ref('')

  const replyLoading = ref(false)
  const processedLoading = ref(false)
  const notesLoading = ref(false)

  // Simple role gate (pattern): nếu project có helper khác thì sẽ thay sau.
  const showInternalNotes = ref(true)

  function criteriaText(c: EvaluationCriteria) {
    return c === 'QualityOfCar' ? 'Chất lượng xe' : 'Thái độ phục vụ'
  }

  function senderLabel(s: EvaluationDetail['chatHistory'][number]['sender']) {
    return s === 'Customer' ? 'Khách hàng' : s === 'Admin' ? 'Admin' : 'System'
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('vi-VN')
    } catch {
      return iso
    }
  }

  async function loadList() {
    listLoading.value = true
    try {
      const res = await usecases.getEvaluations.execute({
        status: filters.status,
        criteria: filters.criteria,
        search: filters.search,
        page: 1,
        size: 50,
      })
      rows.value = res.items

      // Auto-select first item if none
      if (!selected.value && rows.value.length > 0) {
        await handleSelect(rows.value[0])
      }
    } finally {
      listLoading.value = false
    }
  }

  async function handleSelect(row: any) {
    const id = Number(row.id)
    if (!id) return

    selected.value = null
    try {
      const detail = await usecases.getDetail.execute(id)
      selected.value = detail

      replyText.value = detail.directReplyText || ''
      internalNotesText.value = detail.internalNotes || ''
    } catch (e: any) {
      ElMessage.error(e?.message || 'Không thể tải chi tiết đánh giá')
    }
  }

  async function handleSendReply() {
    if (!selected.value) return
    const text = replyText.value.trim()
    if (!text) return

    replyLoading.value = true
    try {
      await usecases.createReply.execute({
        evaluationId: selected.value.id,
        text,
      })
      ElMessage.success('Đã gửi phản hồi (tạm demo).')

      // Refresh detail to update state/history
      await handleSelect(selected.value)
    } catch (e: any) {
      ElMessage.error(e?.message || 'Gửi phản hồi thất bại')
    } finally {
      replyLoading.value = false
    }
  }

  async function handleMarkProcessed() {
    if (!selected.value) return

    processedLoading.value = true
    try {
      await usecases.markProcessed.execute({ evaluationId: selected.value.id })
      ElMessage.success('Đã đánh dấu Đã xử lý (tạm demo).')

      await handleSelect(selected.value)
      await loadList()
    } catch (e: any) {
      ElMessage.error(e?.message || 'Không thể cập nhật trạng thái')
    } finally {
      processedLoading.value = false
    }
  }

  async function handleSaveNotes() {
    if (!selected.value) return

    notesLoading.value = true
    try {
      await usecases.updateInternalNotes.execute({
        evaluationId: selected.value.id,
        notes: internalNotesText.value,
      })
      ElMessage.success('Đã lưu ghi chú nội bộ (tạm demo).')
    } catch (e: any) {
      ElMessage.error(e?.message || 'Không thể lưu ghi chú')
    } finally {
      notesLoading.value = false
    }
  }

  watch(
    () => [filters.status, filters.criteria, filters.search],
    () => {
      void loadList()
    },
  )

  onMounted(() => {
    void loadList()
  })
</script>
