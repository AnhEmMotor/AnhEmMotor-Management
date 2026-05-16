<template>
  <div class="customer-asset-page flex flex-col h-screen bg-[#F8F9FA] overflow-hidden">
    <div
      class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-10"
    >
      <div class="flex items-center gap-4">
        <div class="size-10 bg-navy text-white rounded-xl flex-cc shadow-lg">
          <ArtSvgIcon icon="ri:car-fill" class="text-xl" />
        </div>
        <div>
          <h2 class="m-0 text-base font-black text-gray-800 tracking-tight uppercase"
            >Quản lý Tài sản Khách hàng</h2
          >
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none"
            >Hồ sơ Pháp lý & Lịch sử Xe sạch</span
          >
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="search-box relative">
          <ArtSvgIcon
            icon="ri:search-line"
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Tìm theo Biển số hoặc 5 số cuối Số khung..."
            class="w-80 h-10 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <ElButton
          type="primary"
          class="bg-navy border-none h-10 rounded-xl font-black text-[10px] uppercase shadow-md shadow-blue-900/10"
        >
          <ArtSvgIcon icon="ri:file-add-line" class="mr-2" /> Thêm tài sản mới
        </ElButton>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <div class="w-[380px] bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div class="p-4 border-b border-gray-50 flex items-center justify-between">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest"
            >Danh sách tài sản ({{ assets.length }})</span
          >
          <ArtSvgIcon icon="ri:sort-desc" class="text-gray-300" />
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
          <div
            v-for="asset in assets"
            :key="asset.id"
            class="asset-item group p-4 rounded-2xl cursor-pointer transition-all border border-transparent"
            :class="
              selectedAssetId === asset.id
                ? 'bg-blue-50 border-blue-100 shadow-sm'
                : 'hover:bg-gray-50'
            "
            @click="selectedAssetId = asset.id"
          >
            <div class="flex gap-4">
              <div
                class="size-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100 group-hover:scale-105 transition-transform"
              >
                <img :src="asset.image" class="size-full object-cover" />
              </div>
              <div class="flex-1 flex flex-col justify-center">
                <div class="flex justify-between items-start">
                  <span class="text-sm font-black text-gray-800 leading-tight">{{
                    asset.model
                  }}</span>

                  <div v-if="asset.needsService" class="maintenance-bell">
                    <ElTooltip content="Đến hạn bảo trì (Thay nhớt)">
                      <ArtSvgIcon
                        icon="ri:notification-3-fill"
                        class="text-red-500 animate-swing text-sm"
                      />
                    </ElTooltip>
                  </div>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <div
                    class="bg-gray-800 text-white px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest shadow-sm"
                  >
                    {{ asset.plate }}
                  </div>
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{{
                    asset.owner
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedAsset" class="flex-1 overflow-y-auto bg-[#F8F9FA] p-8 custom-scrollbar">
        <div class="flex justify-between items-start mb-8">
          <div class="flex flex-col gap-2">
            <h1 class="m-0 text-3xl font-black text-gray-800 tracking-tight">{{
              selectedAsset.model
            }}</h1>
            <div class="flex gap-3">
              <ElTag
                effect="dark"
                class="bg-emerald-500 border-none font-black text-[10px] rounded-lg"
                >ĐÃ CÓ BIỂN</ElTag
              >
              <ElTag
                effect="plain"
                class="border-blue-200 text-blue-600 font-black text-[10px] rounded-lg"
                >HỒ SƠ CHUẨN</ElTag
              >
            </div>
          </div>
          <div class="flex gap-2">
            <ElButton
              class="rounded-xl font-black text-[10px] uppercase h-10 border-gray-200 shadow-sm"
            >
              <ArtSvgIcon icon="ri:edit-line" class="mr-2" /> Chỉnh sửa
            </ElButton>
            <ElButton
              type="primary"
              class="bg-navy border-none rounded-xl font-black text-[10px] uppercase h-10 shadow-lg shadow-blue-900/10"
            >
              <ArtSvgIcon icon="ri:file-pdf-line" class="mr-2" /> Xuất báo cáo PDF
            </ElButton>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-4 mb-10">
          <div
            v-for="spec in assetSpecs"
            :key="spec.label"
            class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all hover:border-blue-200"
          >
            <div class="flex items-center gap-2.5 mb-2">
              <div class="size-7 rounded-lg bg-gray-50 flex-cc text-gray-400">
                <ArtSvgIcon :icon="spec.icon" class="text-xs" />
              </div>
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest">{{
                spec.label
              }}</span>
            </div>
            <span class="text-xs font-black text-gray-800 tracking-tight">{{ spec.value }}</span>
          </div>
        </div>

        <div class="mb-12">
          <div class="flex items-center gap-2 mb-6">
            <div class="w-1 h-4 bg-navy rounded-full"></div>
            <h3 class="m-0 text-xs font-black text-gray-800 uppercase tracking-widest"
              >Kho dữ liệu Pháp lý (Digital Vault)</h3
            >
          </div>
          <div class="grid grid-cols-3 gap-6">
            <div
              v-for="folder in vaultFolders"
              :key="folder.title"
              class="vault-folder relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <img
                :src="folder.preview"
                class="absolute right-[-20px] top-[-20px] size-24 object-cover opacity-10 blur-[2px] group-hover:scale-125 transition-transform"
              />

              <div class="relative z-10">
                <div class="flex justify-between items-start mb-4">
                  <div class="size-12 rounded-2xl bg-blue-50 text-blue-600 flex-cc shadow-inner">
                    <ArtSvgIcon :icon="folder.icon" class="text-xl" />
                  </div>
                  <div
                    class="size-8 bg-white/80 backdrop-blur-md rounded-full flex-cc opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <ArtSvgIcon icon="ri:zoom-in-line" class="text-gray-400" />
                  </div>
                </div>
                <h4 class="m-0 text-sm font-black text-gray-800 mb-1">{{ folder.title }}</h4>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter"
                  >{{ folder.count }} tệp tin • Bảo mật</span
                >
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-2">
              <div class="w-1 h-4 bg-emerald-500 rounded-full"></div>
              <h3 class="m-0 text-xs font-black text-gray-800 uppercase tracking-widest"
                >Lịch sử "Xe sạch" (Verified Timeline)</h3
              >
            </div>
            <div
              class="next-service-banner bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-3"
            >
              <ArtSvgIcon
                icon="ri:notification-badge-line"
                class="text-emerald-600 animate-pulse"
              />
              <div class="flex flex-col">
                <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest"
                  >Bảo trì kế tiếp (Dự kiến)</span
                >
                <span class="text-[11px] font-black text-gray-700 uppercase"
                  >10,000 KM • Sau 45 ngày nữa</span
                >
              </div>
            </div>
          </div>

          <div
            class="timeline-container relative pl-8 border-l-2 border-gray-100 ml-4 flex flex-col gap-10"
          >
            <div v-for="event in maintenanceHistory" :key="event.id" class="timeline-item relative">
              <div
                class="absolute -left-[41px] top-0 size-5 rounded-full border-4 border-[#F8F9FA] bg-emerald-500 shadow-sm shadow-emerald-200"
              ></div>

              <div
                class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center gap-4">
                    <span class="text-[11px] font-black text-gray-800">{{ event.date }}</span>
                    <div class="h-3 w-px bg-gray-200"></div>
                    <div class="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ArtSvgIcon
                        icon="ri:check-double-line"
                        class="text-[10px] text-emerald-600"
                      />
                      <span
                        class="text-[9px] font-black text-emerald-600 uppercase tracking-tighter"
                        >Verified by AEM</span
                      >
                    </div>
                  </div>
                  <span class="text-[11px] font-black text-gray-400">{{ event.km }} KM</span>
                </div>
                <h5 class="m-0 text-sm font-black text-gray-800 mb-2">{{ event.title }}</h5>
                <p class="m-0 text-xs text-gray-500 leading-relaxed">{{ event.note }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-cc flex-col gap-4 text-gray-300">
        <ArtSvgIcon icon="ri:car-washing-line" class="text-6xl opacity-20" />
        <span class="text-sm font-bold uppercase tracking-widest"
          >Vui lòng chọn một tài sản để xem chi tiết</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  defineOptions({ name: 'CustomerAsset' })

  const selectedAssetId = ref(1)

  const assets = ref([
    {
      id: 1,
      model: 'Honda Winner X 2024',
      plate: '60-B1 123.45',
      owner: 'Nguyễn Hoàng Long',
      image:
        'https://images.unsplash.com/photo-1611311025708-659a84495574?auto=format&fit=crop&q=80&w=200',
      needsService: true
    },
    {
      id: 2,
      model: 'Honda SH 125i',
      plate: '60-A1 555.55',
      owner: 'Trần Minh Tâm',
      image:
        'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=200',
      needsService: false
    },
    {
      id: 3,
      model: 'Yamaha Exciter 155',
      plate: '60-F1 888.88',
      owner: 'Lê Văn Tám',
      image:
        'https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=200',
      needsService: false
    }
  ])

  const selectedAsset = computed(() => assets.value.find((a) => a.id === selectedAssetId.value))

  const assetSpecs = [
    { label: 'Số khung', value: 'RLCH12345XXXXX', icon: 'ri:barcode-line' },
    { label: 'Số máy', value: 'JF63E-1234567', icon: 'ri:settings-line' },
    { label: 'Ngày mua', value: '15/02/2024', icon: 'ri:calendar-line' },
    { label: 'Đăng kiểm/Phí', value: '15/02/2025', icon: 'ri:shield-line' },
    { label: 'Bảo hành đến', value: '15/02/2027', icon: 'ri:verified-badge-line' }
  ]

  const vaultFolders = [
    {
      title: 'Đăng ký xe',
      icon: 'ri:file-list-line',
      count: '2',
      preview:
        'https://images.unsplash.com/photo-1589330694653-9ecf794ff8a3?auto=format&fit=crop&q=80&w=200'
    },
    {
      title: 'Bảo hiểm dân sự',
      icon: 'ri:shield-user-line',
      count: '1',
      preview:
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=200'
    },
    {
      title: 'Hóa đơn mua hàng',
      icon: 'ri:bill-line',
      count: '3',
      preview:
        'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=200'
    }
  ]

  const maintenanceHistory = [
    {
      id: 1,
      date: '10/04/2024',
      km: '5,200',
      title: 'Bảo trì định kỳ cấp 2',
      note: 'Thay nhớt máy, vệ sinh nồi, kiểm tra hệ thống phanh và thay lọc gió.'
    },
    {
      id: 2,
      date: '15/02/2024',
      km: '0',
      title: 'Bàn giao xe mới',
      note: 'Kiểm tra PDI trước khi giao, hoàn thiện hồ sơ đăng ký biển số Biên Hòa.'
    }
  ]
</script>

<style lang="scss" scoped>
  .customer-asset-page {
    .bg-navy {
      background-color: #001529;
    }

    .text-navy {
      color: #001529;
    }

    .custom-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }
    }

    .animate-swing {
      transform-origin: top center;
      animation: swing 2s infinite ease-in-out;
    }

    @keyframes swing {
      0% {
        transform: rotate(0deg);
      }

      10% {
        transform: rotate(15deg);
      }

      20% {
        transform: rotate(-10deg);
      }

      30% {
        transform: rotate(5deg);
      }

      40% {
        transform: rotate(-5deg);
      }

      50% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(0deg);
      }
    }

    .timeline-container {
      &::before {
        position: absolute;
        bottom: 0;
        left: -1px;
        width: 2px;
        height: 40px;
        content: '';
        background: linear-gradient(to bottom, #f1f5f9, transparent);
      }
    }
  }
</style>
