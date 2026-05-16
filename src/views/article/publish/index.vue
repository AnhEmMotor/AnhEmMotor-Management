<template>
  <div class="article-publish-page min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A] pb-10">
    <!-- 1. TOP ACTION BAR -->
    <div
      class="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-[100] shadow-sm flex justify-between items-center"
    >
      <div class="flex items-center gap-4">
        <div class="size-10 rounded-xl bg-[#001529] flex-cc text-white shadow-lg">
          <ArtSvgIcon icon="ri:edit-box-line" class="text-xl" />
        </div>
        <div>
          <h1 class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none"
            >Chuyên gia tư vấn ảo</h1
          >
          <p
            class="m-0 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2"
          >
            <span class="size-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Soạn thảo nội dung tiếp thị tối ưu
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="handlePreview"
          class="h-10 px-6 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
          >Xem trước (Preview)</button
        >
        <button
          @click="handleSaveDraft"
          class="h-10 px-6 border-2 border-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-slate-800 transition-all"
          >Lưu nháp</button
        >
        <button
          @click="submit"
          class="h-10 px-8 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          {{ pageMode === PageModeEnum.Edit ? 'Cập nhật bài viết' : 'Xuất bản ngay' }}
        </button>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto p-8 flex gap-8 items-start">
      <!-- 2. LEFT COLUMN: CONTENT EDITOR (70%) -->
      <div class="flex-1 flex flex-col gap-6">
        <!-- Title & Category Card -->
        <div class="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-9">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Tiêu đề bài viết (Virtual Expert Title)</label
              >
              <input
                v-model="articleName"
                type="text"
                placeholder="Ví dụ: So sánh SH 160i và SH Mode: Lựa chọn nào cho phái đẹp?"
                class="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 text-lg font-black text-slate-800 focus:border-blue-500 focus:bg-white transition-all outline-none"
              />
            </div>
            <div class="col-span-3">
              <label
                class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
                >Danh mục</label
              >
              <ElSelect
                v-model="articleType"
                placeholder="Chọn loại bài..."
                class="w-full premium-select-large"
                size="large"
              >
                <ElOption
                  v-for="item in articleTypes"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </ElSelect>
            </div>
          </div>
        </div>

        <!-- Rich Text Editor -->
        <div
          class="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[600px] flex flex-col"
        >
          <div
            class="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center"
          >
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest"
              >Nội dung bài viết & Tư vấn</span
            >
            <div class="flex gap-2">
              <button
                @click="insertCTA('test-drive')"
                class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                >Nhúng CTA Lái thử</button
              >
              <button
                @click="insertCTA('lead-form')"
                class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                >Nhúng Lead Form</button
              >
            </div>
          </div>
          <ArtWangEditor v-model="editorHtml" class="flex-1" />
        </div>
      </div>

      <!-- 3. RIGHT COLUMN: MARKETING PANEL (30%) -->
      <div class="w-96 flex flex-col gap-6 sticky top-28 shrink-0">
        <!-- Workflow & Scheduling Card -->
        <div class="bg-[#001529] rounded-[32px] p-6 text-white shadow-2xl relative overflow-hidden">
          <ArtSvgIcon icon="ri:time-line" class="absolute -right-4 -top-4 text-8xl opacity-10" />
          <h3
            class="m-0 text-xs font-black uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:settings-3-line" /> Workflow & Lập lịch
          </h3>
          <div class="space-y-4">
            <div
              class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <span class="text-[11px] font-bold opacity-60">Trạng thái hiện tại:</span>
              <span class="px-2 py-0.5 bg-blue-500 rounded text-[9px] font-black uppercase">{{
                isPublished ? 'Đã xuất bản' : 'Bản nháp'
              }}</span>
            </div>
            <div>
              <label class="text-[10px] font-black opacity-40 uppercase tracking-widest mb-2 block"
                >Hẹn giờ xuất bản / Ẩn bài</label
              >
              <ElDatePicker
                v-model="scheduleDate"
                type="datetime"
                placeholder="Chọn thời điểm..."
                class="combat-dark-picker w-full"
                popper-class="combat-dark-popper"
              />
            </div>
          </div>
        </div>

        <!-- Related Products Card (Virtual Expert Logic) -->
        <div class="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h3 class="m-0 text-xs font-black uppercase tracking-widest text-slate-800"
              >Sản phẩm liên kết</h3
            >
            <button
              @click="openProductSelector"
              class="size-7 rounded-lg bg-blue-50 text-blue-600 flex-cc hover:bg-blue-600 hover:text-white transition-all"
            >
              <ArtSvgIcon icon="ri:add-line" />
            </button>
          </div>
          <div class="space-y-3 mb-4">
            <div
              v-for="p in selectedProducts"
              :key="p.id"
              class="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 group"
            >
              <img :src="p.img" class="size-10 rounded-lg object-cover shadow-sm" />
              <div class="flex-1 overflow-hidden">
                <h4 class="m-0 text-[11px] font-black text-slate-800 truncate">{{ p.name }}</h4>
                <span class="text-[9px] font-bold text-slate-400">{{ p.price }}</span>
              </div>
              <button
                @click="removeProduct(p.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600"
              >
                <ArtSvgIcon icon="ri:close-circle-line" />
              </button>
            </div>
            <div
              v-if="selectedProducts.length === 0"
              class="py-8 border-2 border-dashed border-slate-100 rounded-2xl flex-cc flex-col gap-2 opacity-30"
            >
              <ArtSvgIcon icon="ri:car-line" class="text-3xl" />
              <span class="text-[9px] font-black uppercase tracking-tighter text-center"
                >Chưa chọn xe tư vấn</span
              >
            </div>
          </div>
          <p class="m-0 text-[9px] font-bold text-slate-400 italic"
            >Khách hàng sẽ thấy nút "Xem giá xe này" và "Lái thử" ngay dưới bài viết cho các xe
            trên.</p
          >
        </div>

        <!-- Social Metadata (OpenGraph) -->
        <div class="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm">
          <h3
            class="m-0 text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:share-forward-line" class="text-blue-500" /> Facebook/Zalo Preview
          </h3>
          <div class="space-y-4">
            <div
              class="aspect-video bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative group cursor-pointer"
              @click="triggerImageUpload"
            >
              <img
                v-if="ogImage"
                :src="ogImage"
                class="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div v-else class="w-full h-full flex-cc flex-col gap-2 text-slate-400">
                <ArtSvgIcon icon="ri:image-add-line" class="text-3xl" />
                <span class="text-[9px] font-black uppercase">Tải ảnh bìa Social</span>
              </div>
              <div
                class="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-lg"
              >
                <p class="m-0 text-[10px] font-black text-white truncate">{{
                  articleName || 'Tiêu đề bài viết...'
                }}</p>
                <p class="m-0 text-[8px] font-bold text-white/60 truncate"
                  >AnhEmMotor - Showroom xe máy uy tín tại Biên Hòa</p
                >
              </div>
            </div>
            <p class="m-0 text-[9px] font-bold text-slate-400 leading-relaxed italic"
              >Ảnh bìa Social (OG Image) giúp link chia sẻ bắt mắt hơn, kích thích lượt Click từ
              khách tiềm năng.</p
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Product Selector Dialog -->
    <ElDialog
      v-model="productDialogVisible"
      title="Chọn sản phẩm tư vấn"
      width="450px"
      custom-class="combat-dialog"
    >
      <div class="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <div
          v-for="p in mockProducts"
          :key="p.id"
          @click="toggleProduct(p)"
          class="p-3 rounded-xl border border-slate-100 flex items-center gap-3 cursor-pointer transition-all"
          :class="
            isProductSelected(p.id)
              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100'
              : 'hover:bg-slate-50'
          "
        >
          <img :src="p.img" class="size-12 rounded-lg object-cover" />
          <div class="flex-1">
            <h4 class="m-0 text-sm font-black text-slate-800">{{ p.name }}</h4>
            <span class="text-[10px] font-bold text-slate-400">{{ p.price }}</span>
          </div>
          <ArtSvgIcon
            v-if="isProductSelected(p.id)"
            icon="ri:checkbox-circle-fill"
            class="text-blue-500 text-xl"
          />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { PageModeEnum } from '@/enums/formEnum'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'ArticlePublishWorkflow' })

  const articleName = ref('')
  const articleType = ref<number>()
  const editorHtml = ref('')
  const scheduleDate = ref('')
  const ogImage = ref('')
  const isPublished = ref(false)
  const pageMode = ref(PageModeEnum.Add)

  const selectedProducts = ref<any[]>([])
  const productDialogVisible = ref(false)

  const articleTypes = ref([
    { id: 1, name: 'Tư vấn mua xe' },
    { id: 2, name: 'Kinh nghiệm bảo dưỡng' },
    { id: 3, name: 'Tin tức showroom' },
    { id: 4, name: 'So sánh xe' }
  ])

  const mockProducts = [
    {
      id: 101,
      name: 'Honda Winner X 2024',
      price: '46.000.000đ',
      img: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 102,
      name: 'Honda SH 160i Sporty',
      price: '102.000.000đ',
      img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 103,
      name: 'Yamaha Exciter 155 VVA',
      price: '48.500.000đ',
      img: 'https://yamaha-motor.com.vn/wp-content/uploads/2023/09/Exciter-155-VVA-GP.jpg'
    }
  ]

  const insertCTA = (type: string) => {
    const ctaHtml =
      type === 'test-drive'
        ? '<div style="margin: 20px 0; padding: 20px; border: 2px solid #ef4444; border-radius: 16px; background: #fef2f2; text-align: center;"><h4 style="margin-bottom: 10px; color: #b91c1c;">Bạn muốn cảm nhận dòng xe này?</h4><button style="padding: 10px 30px; background: #ef4444; color: white; border-radius: 8px; border: none; font-weight: 900; cursor: pointer;">ĐĂNG KÝ LÁI THỬ NGAY</button></div>'
        : '<div style="margin: 20px 0; padding: 20px; border: 2px solid #3b82f6; border-radius: 16px; background: #eff6ff; text-align: center;"><h4 style="margin-bottom: 10px; color: #1d4ed8;">Bạn cần báo giá chính xác kèm khuyến mãi?</h4><div style="display: flex; gap: 10px; justify-content: center;"><input type="text" placeholder="SĐT của bạn" style="padding: 10px; border-radius: 8px; border: 1px solid #bfdbfe;"><button style="padding: 10px 20px; background: #3b82f6; color: white; border-radius: 8px; border: none; font-weight: 900;">NHẬN BÁO GIÁ</button></div></div>'

    editorHtml.value += ctaHtml
    ElMessage.success('Đã nhúng CTA Marketing vào bài viết')
  }

  const openProductSelector = () => (productDialogVisible.value = true)
  const isProductSelected = (id: number) => selectedProducts.value.some((p) => p.id === id)
  const toggleProduct = (p: any) => {
    if (isProductSelected(p.id)) {
      selectedProducts.value = selectedProducts.value.filter((item) => item.id !== p.id)
    } else {
      selectedProducts.value.push(p)
    }
  }
  const removeProduct = (id: number) =>
    (selectedProducts.value = selectedProducts.value.filter((p) => p.id !== id))

  const triggerImageUpload = () => {
    // Logic upload thực tế sẽ ở đây
    ogImage.value = 'https://picsum.photos/1200/630'
    ElMessage.success('Đã tải lên ảnh bìa Social Metadata')
  }

  const handlePreview = () => ElMessage.info('Đang mở trang xem trước bài viết...')
  const handleSaveDraft = () => ElMessage.success('Đã lưu bản nháp')
  const submit = () => ElMessage.success('Bài viết đã được xuất bản thành công!')

  onMounted(() => {
    useCommon().scrollToTop()
  })
</script>

<style lang="scss" scoped>
  .article-publish-page {
    .premium-select-large {
      :deep(.el-input__wrapper) {
        height: 56px;
        background-color: #f8fafc;
        border: 2px solid #f1f5f9;
        border-radius: 16px;
        box-shadow: none;

        &:focus {
          border-color: #3b82f6;
        }
      }
    }

    .combat-dark-picker {
      :deep(.el-input__wrapper) {
        color: white;
        background-color: rgb(255 255 255 / 5%);
        border: 1px solid rgb(255 255 255 / 10%);
        border-radius: 12px;
        box-shadow: none;

        .el-input__inner {
          font-size: 11px;
          font-weight: bold;
          color: white;
        }
      }
    }
  }

  :deep(.combat-dialog) {
    border-radius: 32px;

    .el-dialog__header {
      padding: 24px;
      border-bottom: 1px solid #f1f5f9;
    }
  }
</style>
