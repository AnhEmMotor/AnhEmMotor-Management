<template>
  <div class="customer-contact-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A] pb-10">
    <div class="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm relative z-10">
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
        <div class="flex items-center gap-4">
          <div class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg shrink-0">
            <ArtSvgIcon icon="ri:customer-service-2-line" class="text-2xl" />
          </div>
          <div>
            <h1 class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
              >Trung tâm Liên hệ & Khiếu nại</h1
            >
            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5 flex items-center gap-2"
            >
              <span class="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Tiếp nhận & Xử lý phản hồi khách hàng
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 self-end lg:self-auto">
          <div
            class="bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-2"
          >
            <span class="text-[9px] font-black text-red-400 uppercase tracking-tighter"
              >Chưa xử lý:</span
            >
            <span class="text-sm font-black text-red-600 leading-none">12</span>
          </div>
          <button
            class="h-9 px-5 bg-[#001529] text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >Xuất báo cáo</button
          >
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[250px]">
          <ArtSvgIcon
            icon="ri:search-2-line"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm tên khách, SĐT, tiêu đề..."
            class="w-full h-9 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all outline-none"
          />
        </div>
        <ElSelect
          v-model="filterCategory"
          placeholder="Loại liên hệ"
          class="w-44 compact-select"
          clearable
          size="default"
        >
          <ElOption label="Khiếu nại chất lượng xe" value="Quality" />
          <ElOption label="Thái độ phục vụ" value="Service" />
          <ElOption label="Đánh giá & Rating" value="Rating" />
        </ElSelect>
        <ElSelect
          v-model="filterStatus"
          placeholder="Trạng thái"
          class="w-40 compact-select"
          clearable
          size="default"
        >
          <ElOption label="Chưa xử lý" value="New" />
          <ElOption label="Đang xử lý" value="Processing" />
          <ElOption label="Đã hoàn thành" value="Resolved" />
        </ElSelect>
      </div>
    </div>

    <div class="p-6">
      <div class="max-w-6xl mx-auto flex flex-col gap-4">
        <div
          v-for="contact in filteredContacts"
          :key="contact.id"
          class="contact-card bg-white border border-slate-200 rounded-[24px] shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
        >
          <div
            class="absolute left-0 top-0 bottom-0 w-1"
            :class="getStatusLineBg(contact.status)"
          ></div>

          <div class="flex flex-col md:flex-row items-stretch">
            <div
              class="w-full md:w-44 p-5 flex flex-col justify-between bg-slate-50/30 border-b md:border-b-0 md:border-r border-slate-100 shrink-0"
            >
              <div>
                <span
                  class="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2"
                  >#{{ contact.id }}</span
                >
                <div
                  class="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest inline-block shadow-xs border border-white/20"
                  :class="getCategoryStyles(contact.category)"
                >
                  {{ contact.categoryLabel }}
                </div>
              </div>
              <div class="mt-4">
                <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5"
                  >Tiếp nhận</div
                >
                <div class="text-[10px] font-black text-slate-600">{{ contact.createdAt }}</div>
              </div>
            </div>

            <div class="flex-1 p-5 flex flex-col">
              <div class="flex justify-between items-start mb-3">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <h3 class="m-0 text-base font-black text-slate-800 leading-tight">{{
                      contact.subject
                    }}</h3>
                    <div
                      v-if="contact.rating"
                      class="flex items-center gap-1 bg-amber-400 text-white px-1.5 py-0.5 rounded shadow-sm"
                    >
                      <ArtSvgIcon icon="ri:star-fill" class="text-[9px]" />
                      <span class="text-[9px] font-black">{{ contact.rating }}/5</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span class="text-blue-600 font-black hover:underline cursor-pointer">{{
                      contact.customerName
                    }}</span>
                    <span class="opacity-20">|</span>
                    <span class="text-slate-400 text-[11px]">{{ contact.phone }}</span>
                  </div>
                </div>
                <div
                  class="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border"
                  :class="getStatusStyles(contact.status)"
                >
                  {{ contact.statusLabel }}
                </div>
              </div>

              <div
                class="bg-slate-50/60 p-3.5 rounded-xl border border-slate-100 mb-4 italic text-slate-600 leading-relaxed text-[13px]"
              >
                "{{ contact.content }}"
              </div>

              <div
                class="flex items-center gap-3 p-2.5 bg-indigo-50/40 rounded-xl border border-indigo-100/50 group/note transition-all hover:bg-indigo-50"
              >
                <div
                  class="size-8 rounded-lg bg-indigo-100 text-indigo-600 flex-cc shrink-0 shadow-sm"
                >
                  <ArtSvgIcon icon="ri:sticky-note-line" class="text-base" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-[8px] font-black text-indigo-400 uppercase tracking-widest"
                      >Ghi chú nội bộ</span
                    >
                    <button
                      @click="editInternalNote(contact)"
                      class="text-indigo-500 hover:text-indigo-700 font-black text-[8px] uppercase tracking-widest"
                      >Chỉnh sửa</button
                    >
                  </div>
                  <p class="m-0 text-[12px] font-bold text-indigo-800/70 truncate">{{
                    contact.internalNote || 'Chưa có ghi chú...'
                  }}</p>
                </div>
              </div>
            </div>

            <div
              class="w-full md:w-44 p-5 flex flex-col gap-2 justify-center bg-slate-50/10 border-t md:border-t-0 md:border-l border-slate-100 shrink-0"
            >
              <button
                class="h-10 w-full bg-[#001529] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all flex-cc gap-2 active:scale-95"
                @click="openReplyDialog(contact)"
              >
                <ArtSvgIcon icon="ri:reply-fill" class="text-xs" /> Phản hồi
              </button>
              <button
                v-if="contact.status !== 'Resolved'"
                class="h-10 w-full border border-emerald-500 text-emerald-600 bg-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex-cc gap-2 shadow-sm"
                @click="markResolved(contact)"
              >
                <ArtSvgIcon icon="ri:check-double-line" class="text-xs" /> Đã xong
              </button>
              <button
                class="text-slate-400 hover:text-red-500 font-black text-[8px] uppercase tracking-widest mt-1 transition-all opacity-40 hover:opacity-100"
                >Hủy yêu cầu</button
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="replyDialogVisible"
      width="600px"
      custom-class="compact-reply-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-xl bg-[#001529] flex-cc text-white shadow-lg">
            <ArtSvgIcon icon="ri:chat-voice-line" class="text-xl" />
          </div>
          <div>
            <h3 class="m-0 font-black uppercase text-xs tracking-widest text-slate-800"
              >Xác nhận phản hồi</h3
            >
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4 py-2">
        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2"
            >Nội dung khách gửi:</span
          >
          <p class="m-0 text-[13px] text-slate-600 font-medium italic leading-relaxed"
            >"{{ activeContact?.content }}"</p
          >
        </div>

        <div class="space-y-2">
          <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-1"
            >Nội dung phản hồi</label
          >
          <ElInput
            v-model="replyContent"
            type="textarea"
            :rows="4"
            placeholder="Nhập nội dung phản hồi..."
            class="compact-textarea"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            @click="replyDialogVisible = false"
            class="h-10 px-6 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-700"
            >Hủy</button
          >
          <button
            @click="handleSendReply"
            class="h-10 px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
            >Gửi phản hồi</button
          >
        </div>
      </template>
    </ElDialog>

    <ElDialog v-model="noteDialogVisible" width="420px" title="Ghi chú nội bộ">
      <div class="py-2 space-y-4">
        <ElInput
          v-model="tempInternalNote"
          type="textarea"
          :rows="3"
          placeholder="Nhập ghi chú chiến thuật..."
          class="compact-textarea"
        />
      </div>
      <template #footer>
        <div class="flex gap-2">
          <ElButton @click="noteDialogVisible = false" size="small">Hủy</ElButton>
          <ElButton
            type="primary"
            @click="saveInternalNote"
            size="small"
            class="font-black uppercase"
            >Lưu ghi chú</ElButton
          >
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'CustomerContactCompact' })

  const searchQuery = ref('')
  const filterCategory = ref('')
  const filterStatus = ref('')
  const replyDialogVisible = ref(false)
  const noteDialogVisible = ref(false)
  const replyContent = ref('')
  const tempInternalNote = ref('')
  const activeContact = ref<any>(null)

  const contacts = ref([
    {
      id: '3492',
      customerName: 'Nguyễn Hoàng Long',
      phone: '0908 123 456',
      subject: 'Xe SH 160i kêu to ở nồi',
      category: 'Quality',
      categoryLabel: 'Chất lượng xe',
      status: 'New',
      statusLabel: 'Chưa xử lý',
      createdAt: '10:30 - Hôm nay',
      content:
        'Tôi mới lấy xe SH 160i được 3 ngày nhưng phần nồi sau kêu rất to khi lên ga. Yêu cầu kiểm tra gấp!',
      internalNote: 'Khách rất kỹ tính về âm thanh máy, thích được phục vụ tại chỗ.'
    },
    {
      id: '3488',
      customerName: 'Trần Minh Tâm',
      phone: '0912 888 999',
      subject: 'Đánh giá dịch vụ bảo dưỡng',
      category: 'Rating',
      categoryLabel: 'Đánh giá & Rating',
      rating: 5,
      status: 'Resolved',
      statusLabel: 'Đã xong',
      createdAt: 'Hôm qua',
      content: 'Nhân viên tư vấn nhiệt tình, showroom sạch sẽ. Xe chạy rất mướt sau khi thay nhớt.',
      internalNote: 'Khách quen, hay dùng xe SH Mode màu đỏ.'
    },
    {
      id: '3485',
      customerName: 'Lê Văn Tám',
      phone: '0944 555 666',
      subject: 'Thái độ nhân viên bảo vệ',
      category: 'Service',
      categoryLabel: 'Thái độ phục vụ',
      status: 'Processing',
      statusLabel: 'Đang xử lý',
      createdAt: '02/05/2024',
      content: 'Bảo vệ không dắt xe giúp khách, thái độ thờ ơ khi trời đang mưa to.',
      internalNote: 'Đã nhắc nhở đội bảo vệ ca sáng.'
    }
  ])

  const filteredContacts = computed(() => {
    return contacts.value.filter((c) => {
      const q = searchQuery.value.toLowerCase()
      const matchSearch =
        c.customerName.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q)
      const matchCat = !filterCategory.value || c.category === filterCategory.value
      const matchStatus = !filterStatus.value || c.status === filterStatus.value
      return matchSearch && matchCat && matchStatus
    })
  })

  const getCategoryStyles = (cat: string) => {
    if (cat === 'Quality') return 'bg-red-600 text-white'
    if (cat === 'Service') return 'bg-orange-500 text-white'
    return 'bg-blue-600 text-white'
  }

  const getStatusStyles = (status: string) => {
    if (status === 'New') return 'bg-red-50 text-red-600 border-red-100'
    if (status === 'Processing') return 'bg-blue-50 text-blue-600 border-blue-200'
    return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }

  const getStatusLineBg = (status: string) => {
    if (status === 'New') return 'bg-red-500'
    if (status === 'Processing') return 'bg-blue-500'
    return 'bg-emerald-500'
  }

  const openReplyDialog = (contact: any) => {
    activeContact.value = contact
    replyContent.value = ''
    replyDialogVisible.value = true
  }

  const handleSendReply = () => {
    if (!replyContent.value.trim()) {
      ElMessage.warning('Vui lòng nhập nội dung phản hồi')
      return
    }
    ElMessage.success('Đã gửi phản hồi')
    activeContact.value.status = 'Processing'
    activeContact.value.statusLabel = 'Đang xử lý'
    replyDialogVisible.value = false
  }

  const markResolved = (contact: any) => {
    contact.status = 'Resolved'
    contact.statusLabel = 'Đã xong'
    ElMessage.success('Xử lý hoàn tất')
  }

  const editInternalNote = (contact: any) => {
    activeContact.value = contact
    tempInternalNote.value = contact.internalNote || ''
    noteDialogVisible.value = true
  }

  const saveInternalNote = () => {
    activeContact.value.internalNote = tempInternalNote.value
    noteDialogVisible.value = false
    ElMessage.success('Đã lưu ghi chú')
  }
</script>

<style lang="scss" scoped>
  .customer-contact-page {
    .compact-select {
      :deep(.el-input__wrapper) {
        height: 36px;
        background-color: #f1f5f9;
        border: 1px solid transparent;
        border-radius: 12px;
        box-shadow: none;

        &:hover {
          border-color: #cbd5e1;
        }

        &.is-focus {
          background-color: white;
          border-color: #3b82f6;
        }
      }
    }

    .compact-textarea {
      :deep(.el-textarea__inner) {
        padding: 12px;
        font-size: 13px;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 16px;

        &:focus {
          background-color: white;
          border-color: #3b82f6;
        }
      }
    }
  }

  :deep(.compact-reply-dialog) {
    border-radius: 24px;

    .el-dialog__header {
      padding: 20px 24px;
      margin-right: 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .el-dialog__footer {
      padding: 20px 24px;
      border-top: 1px solid #f1f5f9;
    }
  }
</style>
