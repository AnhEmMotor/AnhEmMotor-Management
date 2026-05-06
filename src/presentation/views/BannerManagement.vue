<template>
  <div class="min-h-screen bg-[#F1F5F9] pb-20">
    <!-- Compact Header Section -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-[100]">
      <div class="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-[#e31837] flex items-center justify-center text-white shadow-lg shadow-red-100">
            <font-awesome-icon icon="images" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900 uppercase tracking-tight">Quản lý Banner</h1>
            <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Showroom số</span>
              <span class="w-1 h-1 rounded-full bg-gray-300"></span>
              <span class="text-[#e31837]">{{ bannerStore.banners.length }} chiến dịch</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <!-- Summary Stats -->
          <div class="hidden xl:flex items-center gap-8 border-r border-gray-100 pr-8">
            <div class="text-center">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Clicks</p>
              <p class="text-sm font-bold text-gray-900 leading-none">{{ totalClicks }}</p>
            </div>
            <div class="text-center">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">CTR</p>
              <p class="text-sm font-bold text-[#e31837] leading-none">{{ avgCtr }}%</p>
            </div>
          </div>
          
          <button
            @click="openAddModal"
            class="h-11 px-6 bg-[#e31837] text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-[#c4122d] transition-all flex items-center gap-2 shadow-lg shadow-red-100"
          >
            <font-awesome-icon icon="plus" />
            Tạo Banner
          </button>
        </div>
      </div>
    </header>

    <!-- Toolbar / Filters -->
    <div class="bg-white border-b border-gray-200 py-3 shadow-sm mb-8">
      <div class="max-w-[1600px] mx-auto px-8 flex items-center justify-between">
        <div class="flex items-center gap-1">
          <button 
            v-for="status in ['Tất cả', 'Đang chạy', 'Đã dừng']" 
            :key="status"
            class="px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all"
            :class="status === 'Tất cả' ? 'bg-red-50 text-red-700' : 'text-gray-500 hover:bg-gray-50'"
          >
            {{ status }}
          </button>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <select class="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500/10">
              <option>Tất cả vị trí</option>
              <option>Trang chủ</option>
              <option>Danh mục</option>
            </select>
            <font-awesome-icon icon="chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 pointer-events-none" />
          </div>
          <div class="relative">
            <select class="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-red-500/10">
              <option>Sắp xếp: Ưu tiên</option>
              <option>Mới nhất</option>
              <option>Lượt click</option>
            </select>
            <font-awesome-icon icon="sort" class="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

    <!-- Banner Grid List -->
    <div class="max-w-[1600px] mx-auto">
      <div
        v-if="bannerStore.isLoading && bannerStore.banners.length === 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-[2.5rem] h-[400px] animate-pulse border border-gray-50"
        ></div>
      </div>

      <div
        v-else-if="bannerStore.banners.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <div
          v-for="(banner, index) in bannerStore.banners"
          :key="banner.id"
          draggable="true"
          @dragstart="onDragStart(index)"
          @dragover.prevent
          @drop="onDrop(index)"
          class="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-grab active:cursor-grabbing"
        >
          <!-- 1. IMAGE BLOCK -->
          <div class="aspect-video bg-gray-100 relative overflow-hidden">
            <img
              :src="resolveImageUrl(banner.desktopImageUrl)"
              class="w-full h-full object-cover"
            />
            
            <!-- Metadata Overlays (Simplified) -->
            <div class="absolute top-4 left-4 flex gap-2">
              <span class="px-3 py-1 bg-white/90 backdrop-blur shadow-sm text-[9px] font-bold text-gray-900 uppercase tracking-widest rounded-lg border border-gray-100">
                {{ banner.placement || 'Home' }}
              </span>
            </div>

            <div class="absolute top-4 right-4">
              <div class="w-8 h-8 rounded-lg bg-[#e31837] text-white flex flex-col items-center justify-center shadow-lg">
                <span class="text-[6px] font-bold leading-none opacity-80">PRIO</span>
                <span class="text-[10px] font-bold leading-none">{{ banner.priority }}</span>
              </div>
            </div>
          </div>

          <!-- 2. INFO BODY -->
          <div class="p-5 flex-1 flex flex-col">
            <div class="mb-5">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-sm font-bold text-gray-900 uppercase tracking-tight line-clamp-2 leading-snug">
                  {{ banner.title }}
                </h3>
                <span 
                  class="shrink-0 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider rounded-md border"
                  :class="banner.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'"
                >
                  {{ banner.isActive ? 'Running' : 'Paused' }}
                </span>
              </div>
              
              <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                  <font-awesome-icon icon="calendar-alt" class="opacity-50" />
                  <span>{{ formatDate(banner.startDate) }} — {{ formatDate(banner.endDate) }}</span>
                </div>
                <div class="flex items-center gap-2 text-[9px] font-bold text-[#e31837] lowercase truncate">
                  <font-awesome-icon icon="link" class="opacity-50" />
                  <span>{{ banner.linkUrl || '/' }}</span>
                </div>
              </div>
            </div>

            <!-- 3. STATS BLOCK -->
            <div class="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-6">
              <div class="text-center">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Clicks</p>
                <p class="text-[11px] font-bold text-gray-900">{{ banner.clickCount || 0 }}</p>
              </div>
              <div class="text-center border-x border-gray-200">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Views</p>
                <p class="text-[11px] font-bold text-gray-900">{{ banner.viewCount || 0 }}</p>
              </div>
              <div class="text-center">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">CTR</p>
                <p class="text-[11px] font-bold text-[#e31837]">{{ banner.ctr || 0 }}%</p>
              </div>
            </div>

            <!-- 4. ACTION FOOTER -->
            <div class="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2">
              <button
                @click="openEditModal(banner)"
                class="flex-1 h-10 rounded-lg bg-[#e31837] text-white hover:bg-[#c4122d] transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider"
              >
                <font-awesome-icon icon="pen" />
                Edit
              </button>
              <button
                @click="toggleActive(banner)"
                class="flex-1 h-10 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider border"
                :class="
                  banner.isActive
                    ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                    : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                "
              >
                <font-awesome-icon :icon="banner.isActive ? 'pause' : 'play'" />
                {{ banner.isActive ? 'Pause' : 'Start' }}
              </button>
              <button
                @click="confirmDelete(banner)"
                class="w-10 h-10 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
              >
                <font-awesome-icon icon="trash-alt" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 shadow-sm"
      >
        <div class="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center mb-8">
          <font-awesome-icon icon="images" class="text-5xl text-gray-200" />
        </div>
        <p class="text-lg font-black text-gray-900 uppercase italic tracking-tighter mb-2">
          Không gian Banner trống
        </p>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
          Bắt đầu tạo chiến dịch Marketing đầu tiên của bạn
        </p>
        <button
          @click="openAddModal"
          class="px-10 py-4 bg-[#e31837] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-red-100 hover:scale-105 transition-transform"
        >
          Tạo Banner mới ngay
        </button>
      </div>
    </div>

    <!-- Full Screen Editor Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-[200] overflow-hidden flex items-center justify-center p-4 lg:p-10"
    >
      <div
        class="absolute inset-0 bg-gray-900/40 backdrop-blur-xl"
        @click="showModal = false"
      ></div>

      <div
        class="bg-white w-full h-full max-w-[1600px] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#e31837]"
            >
              <font-awesome-icon :icon="form.id ? 'edit' : 'plus-circle'" class="text-lg" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 uppercase tracking-tight">
                {{ form.id ? 'Hiệu chỉnh chiến dịch' : 'Thiết lập Banner mới' }}
              </h2>
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Cấu hình hiển thị đa nền tảng & lịch trình
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="showPreview = !showPreview"
              class="px-5 py-2.5 bg-gray-50 text-gray-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
            >
              <font-awesome-icon :icon="showPreview ? 'eye-slash' : 'eye'" class="mr-2" />
              {{ showPreview ? 'Xem trước' : 'Xem trên Web' }}
            </button>
            <button
              @click="showModal = false"
              class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all border border-gray-100"
            >
              <font-awesome-icon icon="xmark" />
            </button>
          </div>
        </div>

        <!-- Modal Body (70/30 Split) -->
        <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <!-- Left Column (70% - Image & Link) -->
          <div
            class="lg:w-[70%] h-full overflow-y-auto p-10 custom-scrollbar border-r border-gray-50 bg-white"
          >
            <div class="max-w-4xl mx-auto space-y-12 pb-10">
              <!-- Title Field -->
              <div class="space-y-4">
                <label class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2"
                  >Tên chiến dịch / Tiêu đề Banner</label>
                <input
                  type="text"
                  v-model="form.title"
                  placeholder="VD: Flash Sale - Phụ tùng chính hãng..."
                  class="w-full text-3xl font-black text-gray-900 outline-none border-none bg-transparent placeholder:text-gray-100"
                />
              </div>

              <!-- Configuration Tabs -->
              <div class="space-y-8">
                <div
                  class="flex items-center gap-2 p-1 bg-gray-50 w-fit rounded-2xl border border-gray-100"
                >
                  <button
                    @click="activeTab = 'content'"
                    class="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    :class="
                      activeTab === 'content'
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                  >
                    Nội dung & Hình ảnh
                  </button>
                  <button
                    @click="activeTab = 'audit'"
                    class="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    :class="
                      activeTab === 'audit'
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                  >
                    Lịch sử thay đổi
                  </button>
                </div>

                <div v-if="activeTab === 'content'" class="space-y-12">
                  <!-- Dual Upload Area -->
                  <div class="space-y-6">
                    <div class="flex items-center justify-between">
                      <label
                        class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2"
                        >Nội dung thị giác (Responsive)</label>
                      <span
                        class="text-[9px] font-black text-[#e31837] bg-red-50 px-3 py-1 rounded-lg uppercase tracking-widest italic"
                        >Tự động nén WebP & tối ưu hóa 2024</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
                      <!-- Desktop Upload -->
                      <div class="md:col-span-8 space-y-3">
                        <p
                          class="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4"
                        >
                          Giao diện Desktop (1920x600)
                        </p>
                        <div
                          @click="triggerUpload('desktop')"
                          class="aspect-[1920/600] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 overflow-hidden relative group cursor-pointer hover:border-red-200 hover:bg-gray-100/50 transition-all duration-500"
                        >
                          <img
                            v-if="form.desktopImageUrl"
                            :src="resolveImageUrl(form.desktopImageUrl)"
                            class="w-full h-full object-cover"
                          />
                          <div
                            v-else
                            class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 space-y-4"
                          >
                            <div
                              class="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                            >
                              <font-awesome-icon icon="desktop" class="text-2xl" />
                            </div>
                            <p class="text-[10px] font-black uppercase tracking-widest">
                              Kéo thả hoặc nhấn để tải lên
                            </p>
                          </div>
                          <div
                            v-if="form.desktopImageUrl"
                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                          >
                            <button
                              class="px-6 py-2 bg-white text-gray-900 text-[10px] font-black uppercase rounded-full shadow-lg"
                            >
                              Thay đổi ảnh Desktop
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Mobile Upload -->
                      <div class="md:col-span-4 space-y-3">
                        <p
                          class="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4"
                        >
                          Giao diện Mobile (750x1000)
                        </p>
                        <div
                          @click="triggerUpload('mobile')"
                          class="aspect-[750/1000] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 overflow-hidden relative group cursor-pointer hover:border-red-200 hover:bg-gray-100/50 transition-all duration-500"
                        >
                          <img
                            v-if="form.mobileImageUrl"
                            :src="resolveImageUrl(form.mobileImageUrl)"
                            class="w-full h-full object-cover"
                          />
                          <div
                            v-else
                            class="absolute inset-0 flex flex-col items-center justify-center text-gray-300 space-y-4"
                          >
                            <div
                              class="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                            >
                              <font-awesome-icon icon="mobile" class="text-xl" />
                            </div>
                            <p
                              class="text-[10px] font-black uppercase tracking-widest text-center px-4"
                            >
                              Ảnh Mobile
                            </p>
                          </div>
                          <div
                            v-if="form.mobileImageUrl"
                            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                          >
                            <button
                              class="px-4 py-2 bg-white text-gray-900 text-[10px] font-black uppercase rounded-full shadow-lg"
                            >
                              Thay đổi
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref="fileInput"
                      class="hidden"
                      accept="image/*"
                      @change="onFileSelected"
                    />
                  </div>

                  <!-- Destination & CTA -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="space-y-4 relative">
                      <label
                        class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2"
                        >Đường dẫn chuyển hướng (Link)</label>
                      <div class="relative">
                        <div class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <font-awesome-icon icon="link" />
                        </div>
                        <input
                          v-model="linkSearch"
                          @focus="showLinkSuggestions = true"
                          type="text"
                          class="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/10"
                          placeholder="Dán link hoặc gõ để tìm kiếm xe, bài viết..."
                        />
                        <!-- Search Suggestions -->
                        <div
                          v-if="showLinkSuggestions && filteredSuggestions.length > 0"
                          class="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 p-2 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          <div
                            v-for="item in filteredSuggestions"
                            :key="item.url"
                            @click="selectSuggestion(item)"
                            class="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl cursor-pointer group transition-all"
                          >
                            <div
                              class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#e31837] group-hover:text-white transition-all"
                            >
                              <font-awesome-icon
                                :icon="item.type === 'product' ? 'motorcycle' : 'newspaper'"
                                class="text-xs"
                              />
                            </div>
                            <div>
                              <p class="text-[10px] font-black text-gray-900 uppercase italic">
                                {{ item.title }}
                              </p>
                              <p class="text-[8px] font-bold text-gray-400 tracking-widest">
                                {{ item.url }}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <label
                        class="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2"
                        >Nút kêu gọi hành động (CTA Text)</label>
                      <div class="relative">
                        <div class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300">
                          <font-awesome-icon icon="mouse-pointer" />
                        </div>
                        <input
                          v-model="form.ctaText"
                          type="text"
                          class="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-6 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-red-500/10"
                          placeholder="VD: Mua ngay, Xem chi tiết, Nhận ưu đãi..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Audit Log Tab Content -->
                <div v-if="activeTab === 'audit'" class="space-y-6">
                  <div class="bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100">
                    <div v-if="auditLogs.length > 0" class="space-y-8">
                      <div v-for="(log, idx) in auditLogs" :key="idx" class="flex gap-6 relative">
                        <div
                          v-if="idx !== auditLogs.length - 1"
                          class="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200"
                        ></div>
                        <div
                          class="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center relative z-10"
                        >
                          <font-awesome-icon
                            :icon="getAuditIcon(log.action)"
                            :class="getAuditColor(log.action)"
                          />
                        </div>
                        <div class="flex-1 pb-8">
                          <div class="flex items-center justify-between mb-1">
                            <p
                              class="text-[10px] font-black text-gray-900 uppercase tracking-widest italic"
                            >
                              {{ log.action }}
                            </p>
                            <p
                              class="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                            >
                              {{ formatDateTime(log.createdAt) }}
                            </p>
                          </div>
                          <p class="text-sm font-bold text-gray-700 mb-2">{{ log.details }}</p>
                          <div class="flex items-center gap-2">
                            <div
                              class="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-[8px] font-black text-[#e31837]"
                            >
                              {{ log.changedBy?.charAt(0).toUpperCase() }}
                            </div>
                            <p
                              class="text-[9px] font-black text-gray-400 uppercase tracking-widest"
                            >
                              Thực hiện bởi: {{ log.changedBy }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="flex flex-col items-center justify-center py-20 text-gray-300"
                    >
                      <font-awesome-icon icon="history" class="text-4xl mb-4 opacity-20" />
                      <p class="text-[10px] font-black uppercase tracking-widest">
                        Chưa có lịch sử thay đổi cho banner này
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column (30% - Ops Config) -->
          <div class="lg:w-[30%] h-full bg-gray-50/50 p-10 overflow-y-auto custom-scrollbar">
            <div class="space-y-10">
              <!-- Scheduling -->
              <div class="space-y-6">
                <h3
                  class="text-sm font-black text-gray-900 uppercase tracking-tighter italic border-b border-gray-100 pb-4 flex items-center gap-2"
                >
                  <font-awesome-icon icon="clock" class="text-[#e31837]" />
                  Lịch trình vận hành
                </h3>
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2"
                      >Thời gian hiển thị (Date Range)</label>
                    <div class="w-full">
                      <input
                        type="text"
                        id="dateRangeInput"
                        class="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-bold outline-none shadow-sm"
                        placeholder="Chọn khoảng thời gian..."
                      />
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100"
                  >
                    <font-awesome-icon icon="info-circle" class="text-amber-500" />
                    <p class="text-[9px] font-bold text-amber-700 uppercase leading-relaxed">
                      Hệ thống tự động gỡ banner khi quá ngày kết thúc.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Priority & Placement -->
              <div class="space-y-6">
                <h3
                  class="text-sm font-black text-gray-900 uppercase tracking-tighter italic border-b border-gray-100 pb-4 flex items-center gap-2"
                >
                  <font-awesome-icon icon="sliders" class="text-[#e31837]" />
                  Ưu tiên & Vị trí
                </h3>
                <div class="space-y-6">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between px-2">
                      <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest"
                        >Trọng số ưu tiên: {{ form.priority }}</label>
                      <span class="text-[10px] font-black text-gray-900"
                        >{{ form.priority }}/10</span>
                    </div>
                    <input
                      type="range"
                      v-model="form.priority"
                      min="1"
                      max="10"
                      class="w-full accent-[#e31837]"
                    />
                  </div>

                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2"
                      >Phân vùng hiển thị</label>
                    <select
                      v-model="form.placement"
                      class="w-full bg-white border-none rounded-2xl px-6 py-4 text-xs font-black text-gray-900 uppercase tracking-widest outline-none shadow-sm appearance-none focus:ring-2 focus:ring-red-500/10"
                    >
                      <option value="Home">Trang chủ (Home Top)</option>
                      <option value="HomeMiddle">Trang chủ (Home Middle)</option>
                      <option value="Category">Trang danh mục xe</option>
                      <option value="News">Trang tin tức</option>
                      <option value="Product">Trang chi tiết sản phẩm</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="space-y-6 pt-4">
                <div
                  class="flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                  <div>
                    <p class="text-xs font-black text-gray-900 uppercase italic">
                      Trạng thái Kích hoạt
                    </p>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Bật/Tắt hiển thị ngay lập tức
                    </p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" v-model="form.isActive" class="sr-only peer" />
                    <div
                      class="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#e31837]"
                    ></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div
          class="px-10 py-8 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-[3rem]"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >Hệ thống đã sẵn sàng lưu trữ</span>
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="showModal = false"
              class="px-8 py-4 bg-gray-50 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all"
            >
              Đóng
            </button>
            <button
              @click="handleSave"
              class="px-12 py-4 bg-[#e31837] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-2xl shadow-red-200 hover:bg-[#c4122d] transition-all flex items-center gap-3"
            >
              <font-awesome-icon icon="save" />
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Professional Image Cropper (Beauty App Style) -->
    <ImageCropper
      v-if="showCropper"
      :image-src="cropperImgUrl"
      :initial-type="currentUploadType"
      @close="showCropper = false"
      @apply="handleCropApply"
    />

    <!-- Website Preview Overlay -->
    <div v-if="showPreview" class="fixed inset-0 z-[300] bg-gray-900 flex flex-col">
      <div class="p-6 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="px-4 py-2 bg-[#e31837] rounded-xl text-white text-xs font-black uppercase tracking-widest"
          >
            Website Simulator
          </div>
          <p class="text-xs font-bold text-white/40 uppercase tracking-[0.3em]">
            Mô phỏng trải nghiệm người dùng thực tế
          </p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center bg-white/5 rounded-2xl p-1">
            <button
              @click="previewMode = 'desktop'"
              class="px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
              :class="
                previewMode === 'desktop' ? 'bg-white text-gray-900 shadow-xl' : 'text-white/40'
              "
            >
              Desktop
            </button>
            <button
              @click="previewMode = 'mobile'"
              class="px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
              :class="
                previewMode === 'mobile' ? 'bg-white text-gray-900 shadow-xl' : 'text-white/40'
              "
            >
              Mobile
            </button>
          </div>
          <button
            @click="showPreview = false"
            class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <font-awesome-icon icon="times" />
          </button>
        </div>
      </div>
      <div class="flex-1 bg-[#f0f2f5] p-10 overflow-hidden flex items-center justify-center">
        <div
          class="bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden relative"
          :class="
            previewMode === 'desktop'
              ? 'w-full max-w-6xl aspect-[1920/1080] rounded-xl'
              : 'w-[375px] h-[812px] rounded-[3rem] border-[8px] border-gray-800'
          "
        >
          <div class="w-full h-full flex flex-col">
            <div
              class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-10"
            >
              <div class="w-24 h-6 bg-gray-100 rounded-lg"></div>
              <div class="flex gap-4">
                <div v-for="i in 4" :key="i" class="w-12 h-3 bg-gray-50 rounded"></div>
              </div>
            </div>
            <div class="relative">
              <img
                :src="
                  previewMode === 'desktop'
                    ? form.desktopImageUrl ||
                      'https://placehold.co/1920x600/f3f4f6/94a3b8?text=Desktop+Banner'
                    : form.mobileImageUrl ||
                      'https://placehold.co/750x1000/f3f4f6/94a3b8?text=Mobile+Banner'
                "
                class="w-full object-cover"
                :class="previewMode === 'desktop' ? 'aspect-[1920/600]' : 'aspect-[750/1000]'"
              />
              <div v-if="form.ctaText" class="absolute bottom-10 left-10 lg:left-20">
                <button
                  class="px-10 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-2xl"
                >
                  {{ form.ctaText }}
                </button>
              </div>
            </div>
            <div class="p-10 space-y-6 flex-1">
              <div class="w-1/3 h-8 bg-gray-900 rounded-xl italic"></div>
              <div class="grid grid-cols-4 gap-6">
                <div v-for="i in 4" :key="i" class="aspect-[4/5] bg-gray-50 rounded-[2rem]"></div>
              </div>
            </div>
          </div>
          <div
            v-if="previewMode === 'mobile'"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { useBannerStore } from '@stores/banner.store'
import { useProductStore } from '@stores/product.store'
import { useCategoryStore } from '@stores/category.store'
import { useToast } from 'vue-toastification'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import ImageCropper from '@components/banner/ImageCropper.vue'

const bannerStore = useBannerStore()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const toast = useToast()

const showModal = ref(false)
const showPreview = ref(false)
const previewMode = ref('desktop')
const currentUploadType = ref('desktop')
const fileInput = ref(null)
const activeTab = ref('content')

const linkSearch = ref('')
const showLinkSuggestions = ref(false)

const form = reactive({
  id: null,
  title: '',
  desktopImageUrl: '',
  mobileImageUrl: '',
  linkUrl: '',
  ctaText: 'Xem chi tiết',
  placement: 'Home',
  startDate: null,
  endDate: null,
  isActive: true,
  priority: 5,
})

const auditLogs = ref([])

const totalClicks = computed(() =>
  bannerStore.banners.reduce((sum, b) => sum + (b.clickCount || 0), 0),
)
const avgCtr = computed(() => {
  if (bannerStore.banners.length === 0) return 0
  const totalCtr = bannerStore.banners.reduce((sum, b) => sum + (b.ctr || 0), 0)
  return Math.round((totalCtr / bannerStore.banners.length) * 10) / 10
})

const suggestions = computed(() => {
  const items = []
  categoryStore.categories.forEach((c) => {
    items.push({ title: `Danh mục: ${c.name}`, url: `/category/${c.slug}`, type: 'category' })
  })
  productStore.productList.forEach((p) => {
    items.push({ title: `Xe máy: ${p.name}`, url: `/product/${p.slug}`, type: 'product' })
  })
  return items
})

const filteredSuggestions = computed(() => {
  if (!linkSearch.value || linkSearch.value.startsWith('/')) return []
  const query = linkSearch.value.toLowerCase()
  return suggestions.value
    .filter((s) => s.title.toLowerCase().includes(query) || s.url.toLowerCase().includes(query))
    .slice(0, 5)
})

const selectSuggestion = (item) => {
  form.linkUrl = item.url
  linkSearch.value = item.url
  showLinkSuggestions.value = false
}

let fp = null
watch(showModal, async (val) => {
  if (val) {
    await nextTick()
    fp = flatpickr('#dateRangeInput', {
      mode: 'range',
      dateFormat: 'Y-m-d',
      defaultDate: form.startDate && form.endDate ? [form.startDate, form.endDate] : [],
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          form.startDate = selectedDates[0].toISOString()
          form.endDate = selectedDates[1].toISOString()
        }
      },
    })
    if (form.id) {
      bannerStore.fetchAuditLogs(form.id).then((logs) => (auditLogs.value = logs))
    }
  } else if (fp) {
    fp.destroy()
    auditLogs.value = []
  }
})

onMounted(async () => {
  await Promise.all([
    bannerStore.fetchBanners(),
    productStore.fetchProducts(),
    categoryStore.fetchCategories(),
  ])
})

const openAddModal = () => {
  Object.assign(form, {
    id: null,
    title: '',
    desktopImageUrl: '',
    mobileImageUrl: '',
    linkUrl: '',
    ctaText: 'Xem chi tiết',
    placement: 'Home',
    startDate: null,
    endDate: null,
    isActive: true,
    priority: 5,
  })
  linkSearch.value = ''
  activeTab.value = 'content'
  showModal.value = true
}

const openEditModal = (banner) => {
  Object.assign(form, { ...banner })
  linkSearch.value = banner.linkUrl
  activeTab.value = 'content'
  showModal.value = true
}

const triggerUpload = (type) => {
  currentUploadType.value = type
  fileInput.value.click()
}

const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    cropperImgUrl.value = e.target.result
    showCropper.value = true
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const handleCropApply = async ({ blob, type }) => {
  showCropper.value = false
  try {
    const file = new File([blob], `banner_${type}.jpg`, { type: 'image/jpeg' })
    const response = await bannerStore.uploadBannerImage(file)
    if (type === 'desktop') {
      form.desktopImageUrl = response.publicUrl
    } else {
      form.mobileImageUrl = response.publicUrl
    }
    toast.success('Đã tải ảnh lên thành công')
  } catch (err) {
    toast.error('Lỗi khi tải ảnh: ' + (err.response?.data?.message || err.message))
  }
}

const handleSave = async () => {
  if (!form.title || !form.desktopImageUrl || !form.mobileImageUrl) {
    toast.warning('Vui lòng nhập đầy đủ tiêu đề và hình ảnh.')
    return
  }
  try {
    const payload = { ...form, priority: parseInt(form.priority) }
    if (form.id) {
      await bannerStore.updateBanner(form.id, payload)
      toast.success('Đã cập nhật banner')
    } else {
      await bannerStore.createBanner(payload)
      toast.success('Đã tạo banner mới')
    }
    showModal.value = false
    bannerStore.fetchBanners()
  } catch (err) {
    toast.error('Lỗi khi lưu: ' + (err.response?.data?.message || err.message))
  }
}

const confirmDelete = async (banner) => {
  if (confirm(`Bạn có chắc chắn muốn xóa banner "${banner.title}"?`)) {
    try {
      await bannerStore.deleteBanner(banner.id)
      toast.success('Đã xóa banner')
      bannerStore.fetchBanners()
    } catch (err) {
      toast.error('Lỗi khi xóa')
    }
  }
}

const toggleActive = async (banner) => {
  try {
    const payload = { ...banner, isActive: !banner.isActive }
    await bannerStore.updateBanner(banner.id, payload)
    toast.success(banner.isActive ? 'Đã tạm dừng' : 'Đã kích hoạt')
    bannerStore.fetchBanners()
  } catch (err) {
    toast.error('Lỗi thao tác')
  }
}

// Sorting logic
let draggedItemIndex = null
const onDragStart = (index) => {
  draggedItemIndex = index
}

const onDrop = async (targetIndex) => {
  if (draggedItemIndex === null || draggedItemIndex === targetIndex) return
  const banners = [...bannerStore.banners]
  const [movedItem] = banners.splice(draggedItemIndex, 1)
  banners.splice(targetIndex, 0, movedItem)

  try {
    // Re-assign priorities based on index
    // Higher index = higher priority for display logic
    for (let i = 0; i < banners.length; i++) {
      const newPriority = banners.length - i
      if (banners[i].priority !== newPriority) {
        await bannerStore.updateBanner(banners[i].id, { ...banners[i], priority: newPriority })
      }
    }
    toast.success('Đã cập nhật thứ tự banner')
    bannerStore.fetchBanners()
  } catch (err) {
    toast.error('Lỗi khi sắp xếp banner')
  } finally {
    draggedItemIndex = null
  }
}

const getExpiryStatusClass = (endDate) => {
  if (!endDate) return 'text-white/60'
  const now = new Date()
  const end = new Date(endDate)
  const diffDays = (end - now) / (1000 * 60 * 60 * 24)
  if (diffDays < 0) return 'text-red-400'
  if (diffDays < 7) return 'text-amber-400 font-bold animate-pulse'
  return 'text-white/60'
}

const resolveImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path
  const apiBase = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000'
  return `${apiBase.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

const formatDate = (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'Vĩnh viễn')
const formatDateTime = (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A')
const getStatusText = (banner) => {
  if (!banner.isActive) return 'Tạm dừng'
  const now = new Date()
  const start = banner.startDate ? new Date(banner.startDate) : null
  const end = banner.endDate ? new Date(banner.endDate) : null
  if (start && now < start) return 'Đang chờ'
  if (end && now > end) return 'Đã kết thúc'
  return 'Đang hiển thị'
}
const getStatusBadgeClass = (banner) => {
  const status = getStatusText(banner)
  if (status === 'Đang hiển thị') return 'bg-green-500/80'
  if (status === 'Đang chờ') return 'bg-amber-500/80'
  return 'bg-red-500/80'
}
const getAuditIcon = (action) => {
  if (action === 'Create') return 'plus-circle'
  if (action === 'Pause') return 'pause-circle'
  if (action === 'Resume') return 'play-circle'
  if (action === 'Expire') return 'clock'
  return 'edit'
}
const getAuditColor = (action) => {
  if (action === 'Create') return 'text-green-500'
  if (action === 'Pause') return 'text-red-500'
  if (action === 'Resume') return 'text-indigo-500'
  if (action === 'Expire') return 'text-amber-500'
  return 'text-blue-500'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
input[type='range'] {
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #4f46e5;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(79, 70, 229, 0.4);
  border: 2px solid white;
  transition: transform 0.2s;
}
input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}
</style>
