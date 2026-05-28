<template>
  <div class="banner-management-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A] pb-10">
    <div class="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-[50] shadow-sm">
      <div
        class="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="size-12 rounded-2xl bg-[#001529] flex-cc text-white shadow-xl">
            <ArtSvgIcon icon="ri:advertisement-line" class="text-2xl" />
          </div>
          <div>
            <h1 class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
              >Quản lý Banner & Chiến dịch</h1
            >
            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2"
            >
              <span class="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Biến Banner thành "Đường dẫn chốt sale" hiệu quả
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2"
          >
            <span class="text-[9px] font-black text-emerald-400 uppercase tracking-tighter"
              >Chiến dịch đang chạy:</span
            >
            <span class="text-base font-black text-emerald-600 leading-none">05</span>
          </div>
          <button
            @click="handleAddBanner"
            class="h-11 px-8 bg-[#001529] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:add-fill" /> Tạo banner chiến dịch
          </button>
        </div>
      </div>
    </div>

    <div class="p-8 max-w-[1400px] mx-auto">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="banner-card bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group relative"
          :class="{ 'opacity-60 grayscale-[0.5]': banner.status === 'Paused' }"
        >
          <div class="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <span
              class="px-3 py-1 bg-black/80 backdrop-blur-md text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg"
            >
              Ưu tiên: #{{ banner.priority }}
            </span>
            <span
              v-if="banner.status === 'Paused'"
              class="px-3 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg"
            >
              Đang tạm dừng
            </span>
          </div>

          <div class="aspect-[21/9] bg-slate-900 relative overflow-hidden group/img">
            <img
              :src="viewMode === 'Desktop' ? banner.desktopImg : banner.mobileImg"
              class="w-full h-full object-cover opacity-80 group-hover/img:scale-105 transition-transform duration-700"
            />

            <div
              class="absolute top-4 right-4 flex bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/20"
            >
              <button
                @click.stop="viewMode = 'Desktop'"
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all"
                :class="
                  viewMode === 'Desktop'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/60 hover:text-white'
                "
                >PC</button
              >
              <button
                @click.stop="viewMode = 'Mobile'"
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all"
                :class="
                  viewMode === 'Mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-white/60 hover:text-white'
                "
                >MB</button
              >
            </div>

            <div
              class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent"
            >
              <h2 class="m-0 text-lg font-black text-white leading-tight mb-2">{{
                banner.title
              }}</h2>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5 text-white/60 text-[10px] font-bold">
                  <ArtSvgIcon icon="ri:calendar-event-line" />
                  {{ banner.startDate }} → {{ banner.endDate }}
                </div>
                <div
                  class="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase tracking-widest"
                >
                  <ArtSvgIcon icon="ri:links-line" />
                  {{ banner.ctaLabel || 'Chưa gắn link' }}
                </div>
              </div>
            </div>
          </div>

          <div class="px-8 py-5 flex justify-between items-center bg-slate-50/50">
            <div class="flex gap-4">
              <div class="flex flex-col">
                <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest"
                  >Lượt click</span
                >
                <span class="text-sm font-black text-slate-700">{{ banner.clicks }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest"
                  >CTR</span
                >
                <span class="text-sm font-black text-blue-600">{{ banner.ctr }}%</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="toggleStatus(banner)"
                class="size-10 rounded-xl flex-cc border-2 transition-all"
                :class="
                  banner.status === 'Active'
                    ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                "
              >
                <ArtSvgIcon
                  :icon="banner.status === 'Active' ? 'ri:pause-fill' : 'ri:play-fill'"
                  class="text-xl"
                />
              </button>
              <button
                @click="handleEdit(banner)"
                class="h-10 px-6 bg-white border-2 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-slate-800 transition-all"
                >Sửa chiến dịch</button
              >
              <button
                @click="handleDelete(banner)"
                class="size-10 rounded-xl flex-cc bg-red-50 border-2 border-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <ArtSvgIcon icon="ri:delete-bin-line" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      custom-class="combat-banner-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="flex items-center gap-4">
          <div class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-xl">
            <ArtSvgIcon icon="ri:image-edit-line" class="text-2xl" />
          </div>
          <div>
            <h3 class="m-0 font-black uppercase text-xs tracking-[0.2em] text-slate-800">{{
              dialogTitle
            }}</h3>
            <p class="m-0 text-[9px] font-bold text-slate-400 uppercase mt-1"
              >Cấu hình Banner theo tiêu chuẩn Responsive & SEO</p
            >
          </div>
        </div>
      </template>

      <div class="py-4 grid grid-cols-2 gap-8">
        <div class="space-y-5">
          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >Tiêu đề chiến dịch</label
            >
            <ElInput
              v-model="bannerForm.title"
              placeholder="VD: Ưu đãi lễ 30/4 - Giảm giá xe cực sốc"
              class="combat-input"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Trọng số (Priority)</label
              >
              <ElInputNumber v-model="bannerForm.priority" :min="1" class="w-full combat-number" />
            </div>
            <div>
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Nút bấm (CTA Label)</label
              >
              <ElInput
                v-model="bannerForm.ctaLabel"
                placeholder="VD: Mua ngay"
                class="combat-input"
              />
            </div>
          </div>

          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >Đường dẫn đích (CTA Link)</label
            >
            <ElInput v-model="bannerForm.ctaLink" placeholder="https://..." class="combat-input">
              <template #prefix><ArtSvgIcon icon="ri:links-line" /></template>
            </ElInput>
          </div>

          <div>
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
              >Thời gian áp dụng (Bắt buộc)</label
            >
            <ElDatePicker
              v-model="bannerForm.dateRange"
              type="daterange"
              range-separator="→"
              start-placeholder="Ngày bắt đầu"
              end-placeholder="Ngày kết thúc"
              class="w-full combat-range"
            />
          </div>
        </div>

        <div class="space-y-6">
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 block"
              >Ảnh Desktop (Tỷ lệ 21:9)</label
            >
            <div
              class="aspect-[21/9] bg-white border-2 border-dashed border-slate-200 rounded-xl flex-cc flex-col gap-2 cursor-pointer hover:border-blue-400 transition-all overflow-hidden relative"
            >
              <img
                v-if="bannerForm.desktopImg"
                :src="bannerForm.desktopImg"
                class="w-full h-full object-cover"
              />
              <template v-else>
                <ArtSvgIcon icon="ri:computer-line" class="text-2xl text-slate-300" />
                <span class="text-[9px] font-black uppercase text-slate-400">Chọn ảnh Desktop</span>
              </template>
            </div>
          </div>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label
              class="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 block"
              >Ảnh Mobile (Tỷ lệ 4:5 hoặc 1:1)</label
            >
            <div
              class="aspect-[4/5] h-40 bg-white border-2 border-dashed border-slate-200 rounded-xl flex-cc flex-col gap-2 cursor-pointer hover:border-emerald-400 transition-all mx-auto overflow-hidden relative"
            >
              <img
                v-if="bannerForm.mobileImg"
                :src="bannerForm.mobileImg"
                class="w-full h-full object-cover"
              />
              <template v-else>
                <ArtSvgIcon icon="ri:smartphone-line" class="text-2xl text-slate-300" />
                <span class="text-[9px] font-black uppercase text-slate-400">Chọn ảnh Mobile</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <ElSwitch v-model="bannerForm.status" active-value="Active" inactive-value="Paused" />
            <span
              class="text-[10px] font-black uppercase tracking-widest"
              :class="bannerForm.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'"
            >
              {{ bannerForm.status === 'Active' ? 'Hiển thị ngay' : 'Đang tạm dừng' }}
            </span>
          </div>
          <div class="flex gap-3">
            <button
              @click="dialogVisible = false"
              class="h-11 px-6 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-700"
              >Đóng</button
            >
            <button
              @click="saveBanner"
              class="h-11 px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              {{ isEditing ? 'Lưu thay đổi' : 'Tạo chiến dịch' }}
            </button>
          </div>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'MarketingBannerManagement' })

  const viewMode = ref('Desktop')
  const dialogVisible = ref(false)
  const dialogTitle = ref('Tạo banner mới')
  const isEditing = ref(false)

  const banners = ref([
    {
      id: 1,
      title: 'Chào hè rực rỡ - Ưu đãi SH 160i lên đến 5 triệu đồng',
      priority: 1,
      clicks: 1240,
      ctr: 4.8,
      status: 'Active',
      startDate: '01/05/2024',
      endDate: '31/05/2024',
      ctaLabel: 'Xem chi tiết ưu đãi',
      desktopImg:
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
      mobileImg:
        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 2,
      title: 'Winner X mới - Trả góp 0% lãi suất tại Anh Em Motor',
      priority: 2,
      clicks: 856,
      ctr: 3.2,
      status: 'Active',
      startDate: '15/04/2024',
      endDate: '15/05/2024',
      ctaLabel: 'Đăng ký lái thử',
      desktopImg:
        'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
      mobileImg:
        'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=400'
    }
  ])

  const bannerForm = ref({
    title: '',
    priority: 1,
    ctaLabel: 'Xem ngay',
    ctaLink: '',
    dateRange: [],
    desktopImg: '',
    mobileImg: '',
    status: 'Active'
  })

  const handleAddBanner = () => {
    isEditing.value = false
    dialogTitle.value = 'Tạo banner chiến dịch mới'
    bannerForm.value = {
      title: '',
      priority: 1,
      ctaLabel: 'Xem ngay',
      ctaLink: '',
      dateRange: [],
      desktopImg: '',
      mobileImg: '',
      status: 'Active'
    }
    dialogVisible.value = true
  }

  const handleEdit = (banner: any) => {
    isEditing.value = true
    dialogTitle.value = 'Chỉnh sửa chiến dịch'
    bannerForm.value = { ...banner, dateRange: [banner.startDate, banner.endDate] }
    dialogVisible.value = true
  }

  const toggleStatus = (banner: any) => {
    banner.status = banner.status === 'Active' ? 'Paused' : 'Active'
    ElMessage.success(`Đã ${banner.status === 'Active' ? 'kích hoạt' : 'tạm dừng'} chiến dịch`)
  }

  const saveBanner = () => {
    if (!bannerForm.value.title) {
      ElMessage.warning('Vui lòng nhập tiêu đề chiến dịch')
      return
    }
    ElMessage.success('Đã lưu cấu hình chiến dịch banner thành công')
    dialogVisible.value = false
  }

  const handleDelete = (_banner: any) => {
    ElMessage.warning(
      'Chức năng xóa đã được bảo mật. Vui lòng tạm dừng chiến dịch nếu không muốn hiển thị.'
    )
  }
</script>

<style lang="scss" scoped>
  .banner-management-page {
    .combat-input {
      :deep(.el-input__wrapper) {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: none;
      }
    }

    .combat-number {
      :deep(.el-input-number__increase),
      :deep(.el-input-number__decrease) {
        background: #f1f5f9;
        border: none;
        border-radius: 8px;
      }
    }

    .combat-range {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  :deep(.combat-banner-dialog) {
    border-radius: 32px;

    .el-dialog__header {
      padding: 32px;
      margin-right: 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .el-dialog__footer {
      padding: 24px 32px;
      border-top: 1px solid #f1f5f9;
    }
  }
</style>
