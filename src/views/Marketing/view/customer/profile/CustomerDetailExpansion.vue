<template>
  <div class="lead-detail-expansion bg-gray-50/50 p-6 border-t border-gray-100 shadow-inner">
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <div
          class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center"
        >
          <div
            class="qr-wrapper bg-gray-50 p-4 rounded-2xl mb-4 border border-dashed border-gray-200"
          >
            <img
              :src="'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + lead.id"
              alt="QR"
              class="w-24 h-24 opacity-80"
            />
          </div>
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
            >Mã định danh</span
          >
          <h3 class="m-0 text-base font-black text-gray-700 tracking-tighter">{{ lead.id }}</h3>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-6">
            <div class="size-8 bg-blue-50 text-blue-500 rounded-lg flex-cc">
              <ArtSvgIcon icon="ri:government-line" />
            </div>
            <h4 class="m-0 font-black text-gray-700 uppercase text-[10px] tracking-wider"
              >Hồ sơ hành chính</h4
            >
          </div>

          <div class="flex flex-col gap-5">
            <div>
              <label class="text-[10px] font-bold text-gray-400 uppercase mb-2 block"
                >Số CCCD (12 số)</label
              >
              <ElInput
                v-model="customerInfo.cccd"
                placeholder="075xxxxxxxxx"
                :disabled="isVerified"
                size="small"
                class="premium-input"
              >
                <template #suffix>
                  <ArtSvgIcon icon="ri:qr-scan-2-line" class="cursor-pointer hover:text-blue-500" />
                </template>
              </ElInput>
            </div>

            <div>
              <label class="text-[10px] font-bold text-gray-400 uppercase mb-2 block"
                >Địa chỉ thường trú</label
              >
              <div class="flex flex-col gap-3">
                <ElSelect
                  v-model="customerInfo.address.ward"
                  placeholder="Chọn Phường/Xã"
                  :disabled="isVerified"
                  size="small"
                  class="w-full"
                >
                  <ElOption
                    v-for="ward in wardsInBienHoa"
                    :key="ward"
                    :label="ward"
                    :value="ward"
                  />
                </ElSelect>
              </div>
            </div>

            <div class="mt-2">
              <ElButton
                :type="isVerified ? 'success' : 'info'"
                class="w-full h-10 rounded-xl font-bold text-xs"
                @click="handleVerify"
              >
                <ArtSvgIcon
                  :icon="isVerified ? 'ri:shield-check-line' : 'ri:shield-keyhole-line'"
                  class="mr-2"
                />
                {{ isVerified ? 'ĐÃ XÁC THỰC' : 'XÁC THỰC HỒ SƠ' }}
              </ElButton>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-6 flex flex-col gap-6">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-2">
              <div class="size-8 bg-purple-50 text-purple-500 rounded-lg flex-cc">
                <ArtSvgIcon icon="ri:history-line" />
              </div>
              <h4 class="m-0 font-black text-gray-700 uppercase text-[10px] tracking-wider"
                >Dòng thời gian</h4
              >
            </div>
            <div class="flex gap-1">
              <ElTag size="small" type="info" effect="plain" class="cursor-pointer">AI Chat</ElTag>
              <ElTag size="small" type="warning" effect="plain" class="cursor-pointer"
                >Ghi chú</ElTag
              >
            </div>
          </div>

          <div class="flex-1 overflow-y-auto pr-2 max-h-[450px] timeline-wrapper">
            <ElTimeline>
              <ElTimelineItem
                v-for="event in timelineEvents"
                :key="event.id"
                :timestamp="event.time"
                placement="top"
                :color="event.color"
              >
                <div
                  class="p-3 rounded-xl border border-gray-50 shadow-sm"
                  :class="event.type === 'ai' ? 'bg-indigo-50/30' : 'bg-white'"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <ArtSvgIcon
                      :icon="event.icon"
                      :style="{ color: event.color }"
                      class="text-sm"
                    />
                    <span class="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                      {{ event.type === 'ai' ? 'AI Assistant' : 'Sale Note' }}
                    </span>
                  </div>
                  <p class="m-0 text-xs text-gray-700 leading-relaxed">{{ event.content }}</p>
                </div>
              </ElTimelineItem>
            </ElTimeline>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-50 flex gap-2">
            <ElInput
              v-model="newNote"
              placeholder="Nhập ghi chú nhanh..."
              size="default"
              class="flex-1 premium-input"
              @keyup.enter="handleNoteSubmit"
            />
            <ElButton
              type="primary"
              size="default"
              class="rounded-xl px-4"
              @click="handleNoteSubmit"
              >Gửi</ElButton
            >
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3 flex flex-col gap-6">
        <div
          class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-lg text-white"
        >
          <div class="flex items-center gap-2 mb-6">
            <div class="size-8 bg-white/20 rounded-lg flex-cc">
              <ArtSvgIcon icon="ri:sparkling-2-line" />
            </div>
            <h4 class="m-0 font-bold uppercase text-[10px] tracking-wider opacity-80"
              >AI Insight</h4
            >
          </div>

          <div class="flex flex-col gap-3">
            <div class="bg-white/10 p-3 rounded-xl border border-white/10">
              <span class="text-[9px] font-bold uppercase opacity-60 block mb-1"
                >Màu sắc ưu tiên</span
              >
              <p class="m-0 text-xs font-bold">Đỏ Đen / Đen Nhám</p>
            </div>
            <div class="bg-white/10 p-3 rounded-xl border border-white/10">
              <span class="text-[9px] font-bold uppercase opacity-60 block mb-1">Hành vi</span>
              <p class="m-0 text-xs font-bold">Đã xem SH 125i (5 lần)</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 mb-6">
            <div class="size-8 bg-red-50 text-red-500 rounded-lg flex-cc">
              <ArtSvgIcon icon="ri:motorbike-line" />
            </div>
            <h4 class="m-0 font-black text-gray-700 uppercase text-[10px] tracking-wider"
              >Thông tin xe</h4
            >
          </div>

          <div class="p-3 rounded-xl border border-gray-50 bg-gray-50/30">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[10px] font-bold text-gray-500">Winner X 2024</span>
              <ElTag size="small" type="success" effect="plain" class="text-[9px]"
                >Đã có biển</ElTag
              >
            </div>
            <span class="text-[10px] font-bold text-blue-600 block">60-B1 123.45</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useCustomerProfile } from '@/views/Marketing/logic/useCustomerProfile'

  defineProps<{
    lead: any
  }>()

  const { isVerified, customerInfo, wardsInBienHoa, timelineEvents, handleVerify, addNote } =
    useCustomerProfile()

  const newNote = ref('')

  const handleNoteSubmit = () => {
    if (!newNote.value.trim()) return
    addNote(newNote.value)
    newNote.value = ''
  }
</script>

<style lang="scss" scoped>
  .lead-detail-expansion {
    animation: slide-down 0.3s ease-out;

    .premium-input {
      :deep(.el-input__wrapper) {
        background-color: #fafafa;
        border: 1px solid #f3f4f6;
        border-radius: 10px;
        box-shadow: none;
      }
    }
  }

  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
