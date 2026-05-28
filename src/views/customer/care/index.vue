<template>
  <div class="customer-care-page p-8 bg-[#F8FAFC] min-h-full font-inter">
    <div v-if="!isDetailView">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="m-0 text-2xl font-black tracking-tight text-slate-900 uppercase"
            >Chăm sóc Khách hàng</h1
          >
          <p class="m-0 text-xs font-bold text-slate-400 uppercase tracking-widest mt-1"
            >Quản lý vòng đời & Trải nghiệm khách hàng Anh Em Motor</p
          >
        </div>
        <div class="flex gap-3">
          <button
            @click="handleAddCustomer"
            class="h-11 px-8 bg-[#001529] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:user-add-line" /> Thêm khách hàng mới
          </button>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[32px] p-6 mb-8 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="col-span-2">
            <ElInput
              v-model="searchQuery"
              placeholder="Tìm tên, SĐT hoặc Biển số khách hàng..."
              class="combat-input-large"
            >
              <template #prefix><ArtSvgIcon icon="ri:search-2-line" /></template>
            </ElInput>
          </div>
          <div>
            <ElSelect
              v-model="filterType"
              placeholder="Tất cả phân loại"
              class="w-full premium-select"
            >
              <ElOption label="Tất cả khách hàng" value="all" />
              <ElOption label="Khách hàng VIP" value="VIP" />
              <ElOption label="Khách hàng cũ" value="Old" />
              <ElOption label="Khách mới" value="New" />
            </ElSelect>
          </div>
          <div class="flex items-center gap-2">
            <div
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 flex items-center gap-2 shrink-0"
            >
              <span class="text-[9px] font-black uppercase tracking-tighter">Đang quản lý:</span>
              <span class="text-sm font-black">{{ customers.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
        <ElTable :data="customers" style="width: 100%" class="combat-table">
          <ElTableColumn label="Khách hàng" min-width="240">
            <template #default="{ row }">
              <div class="flex items-center gap-4 py-2">
                <div class="size-10 rounded-xl bg-slate-100 flex-cc text-slate-500 font-black">{{
                  row.name.charAt(0)
                }}</div>
                <div>
                  <p class="m-0 text-sm font-black text-slate-800 leading-none mb-1">{{
                    row.name
                  }}</p>
                  <p class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{
                    row.phone
                  }}</p>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Phân loại" width="150">
            <template #default="{ row }">
              <span
                class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border"
                :class="getTypeClasses(row.type)"
              >
                {{ row.typeLabel }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Lần cuối bảo dưỡng" width="180">
            <template #default="{ row }">
              <span class="text-xs font-bold text-slate-500">{{ row.lastContact }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Trạng thái Loyalty" width="160">
            <template #default="{ row }">
              <span class="text-[10px] font-black text-amber-500">{{ row.points }} pts</span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thao tác" width="120" align="right">
            <template #default="{ row }">
              <button
                @click="viewDetails(row)"
                class="h-9 px-4 bg-blue-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all"
                >Chi tiết</button
              >
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>

    <div v-else class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-6">
          <button
            @click="isDetailView = false"
            class="size-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex-cc hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <ArtSvgIcon icon="ri:arrow-left-line" />
          </button>
          <div>
            <h1 class="m-0 text-3xl font-black text-slate-900 tracking-tight">{{
              activeCustomer?.name
            }}</h1>
            <p
              class="m-0 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:shield-user-line" class="text-amber-500" /> Hồ sơ Customer 360 -
              {{ activeCustomer?.typeLabel }}
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            class="h-11 px-6 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all"
            >Gọi Zalo</button
          >
          <button
            class="h-11 px-6 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
            >Gửi Ưu đãi</button
          >
        </div>
      </div>

      <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div
            class="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <ArtSvgIcon
              icon="ri:fingerprint-line"
              class="absolute -right-4 -top-4 text-9xl opacity-10"
            />
            <h3
              class="m-0 text-xs font-black uppercase tracking-widest text-blue-400 mb-8 flex items-center gap-2"
              >Dữ liệu cốt lõi</h3
            >
            <div class="space-y-6 relative z-10">
              <div class="flex justify-between border-b border-white/10 pb-4">
                <span class="text-[10px] font-bold opacity-40 uppercase">Số điện thoại</span>
                <span class="text-sm font-black">{{ activeCustomer?.phone }}</span>
              </div>
              <div class="flex justify-between border-b border-white/10 pb-4">
                <span class="text-[10px] font-bold opacity-40 uppercase">CCCD / CMND</span>
                <span class="text-sm font-black">{{ activeCustomer?.identity }}</span>
              </div>
              <div class="flex justify-between border-b border-white/10 pb-4">
                <span class="text-[10px] font-bold opacity-40 uppercase">Hạng Loyalty</span>
                <span class="text-sm font-black text-amber-500">{{ activeCustomer?.tier }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold opacity-40 uppercase mb-3 block"
                  >Địa chỉ thường trú</span
                >
                <p class="m-0 text-sm font-bold leading-relaxed">{{ activeCustomer?.address }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
            <h3 class="m-0 text-xs font-black uppercase tracking-widest text-slate-800 mb-6"
              >Nhu cầu & Sở thích</h3
            >
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in activeCustomer?.needs"
                :key="tag"
                class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase border border-blue-100"
                >{{ tag }}</span
              >
            </div>
            <div
              class="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4"
            >
              <div class="size-10 rounded-xl bg-red-500 text-white flex-cc shrink-0 animate-pulse">
                <ArtSvgIcon icon="ri:alarm-warning-line" />
              </div>
              <p class="m-0 text-[10px] font-black text-red-600 uppercase leading-relaxed"
                >Nhắc nhở: Quá hạn thay nhớt lần 3 (12 ngày)</p
              >
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-8 space-y-8">
          <div class="bg-white border border-slate-200 rounded-[40px] shadow-sm overflow-hidden">
            <ElTabs v-model="activeTab" class="combat-tabs-large">
              <ElTabPane label="DÒNG THỜI GIAN TƯƠNG TÁC" name="timeline">
                <div class="p-10 space-y-8 relative">
                  <div class="absolute left-[59px] top-12 bottom-12 w-0.5 bg-slate-100"></div>
                  <div v-for="log in timeline" :key="log.id" class="flex gap-8 relative">
                    <div
                      class="size-14 rounded-2xl flex-cc z-10 shadow-xl"
                      :class="
                        log.type === 'call' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                      "
                    >
                      <ArtSvgIcon
                        :icon="log.type === 'call' ? 'ri:phone-line' : 'ri:message-3-line'"
                        class="text-xl"
                      />
                    </div>
                    <div class="flex-1 bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
                      <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-3">
                          <span
                            class="text-[11px] font-black text-slate-400 uppercase tracking-widest"
                            >{{ log.date }}</span
                          >
                          <span class="size-1 rounded-full bg-slate-300"></span>
                          <span
                            class="text-[11px] font-black text-blue-500 uppercase tracking-widest"
                            >{{ log.staff }}</span
                          >
                        </div>
                        <span
                          class="px-3 py-1 bg-white text-[9px] font-black uppercase rounded-lg border border-slate-200 shadow-sm"
                          >{{ log.category }}</span
                        >
                      </div>
                      <p class="m-0 text-base font-bold text-slate-700 leading-relaxed">{{
                        log.content
                      }}</p>
                    </div>
                  </div>
                </div>
              </ElTabPane>
              <ElTabPane label="LỊCH SỬ MUA XE & DỊCH VỤ" name="purchase">
                <div class="p-10 space-y-10">
                  <div class="grid grid-cols-2 gap-6">
                    <div
                      v-for="bike in activeCustomer?.bikes"
                      :key="bike.id"
                      class="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:border-blue-300 transition-all"
                    >
                      <div class="flex gap-5 mb-4">
                        <img :src="bike.img" class="size-20 rounded-2xl object-cover shadow-lg" />
                        <div>
                          <h4 class="m-0 text-lg font-black text-slate-800">{{ bike.model }}</h4>
                          <p
                            class="m-0 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"
                            >{{ bike.deliveryDate }}</p
                          >
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div class="p-3 bg-slate-50 rounded-2xl">
                          <p class="m-0 text-[9px] font-black text-slate-300 uppercase mb-1"
                            >Thanh toán</p
                          >
                          <p class="m-0 text-xs font-black text-slate-700">{{ bike.payment }}</p>
                        </div>
                        <div class="p-3 bg-slate-50 rounded-2xl">
                          <p class="m-0 text-[9px] font-black text-slate-300 uppercase mb-1"
                            >Giá trị</p
                          >
                          <p class="m-0 text-xs font-black text-blue-600">{{ bike.price }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="pt-8 border-t border-slate-100">
                    <h3 class="m-0 text-xs font-black uppercase tracking-widest text-slate-800 mb-6"
                      >Nhật ký bảo dưỡng & Sửa chữa</h3
                    >
                    <div class="space-y-4">
                      <div
                        v-for="i in 2"
                        :key="i"
                        class="p-5 bg-slate-50/50 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 transition-all"
                      >
                        <div class="flex items-center gap-4">
                          <div
                            class="size-10 rounded-xl bg-white border border-slate-100 flex-cc text-slate-400"
                          >
                            <ArtSvgIcon icon="ri:tools-line" />
                          </div>
                          <div>
                            <p class="m-0 text-sm font-black text-slate-800"
                              >Bảo dưỡng định kỳ lần {{ i }}</p
                            >
                            <p class="m-0 text-[10px] font-bold text-slate-400 uppercase"
                              >Ngày 12/01/2024 - Thợ: Nguyễn Bình</p
                            >
                          </div>
                        </div>
                        <span class="text-sm font-black text-slate-700">350,000đ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ElTabPane>
            </ElTabs>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'CustomerCareFocusMode' })

  const searchQuery = ref('')
  const filterType = ref('all')
  const isDetailView = ref(false)
  const activeTab = ref('timeline')
  const activeCustomer = ref<any>(null)

  const customers = ref([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0901.234.567',
      type: 'VIP',
      typeLabel: 'Khách hàng VIP',
      lastContact: '02/05/2024',
      points: 4250,
      tier: 'Gold Member',
      address: '123 Đường 30/4, P. Trung Dũng, Biên Hòa, Đồng Nai',
      email: 'vana@gmail.com',
      source: 'Website',
      identity: '072095001234',
      needs: ['Tay ga cao cấp', 'Thích màu đen mờ', 'Đổi xe cũ', 'Quan tâm trả góp'],
      bikes: [
        {
          id: 1,
          model: 'Honda SH 160i Sporty',
          price: '102.500.000đ',
          deliveryDate: '12/12/2023',
          img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
          payment: 'Trả thẳng'
        },
        {
          id: 2,
          model: 'Honda Vision',
          price: '32.000.000đ',
          deliveryDate: '15/05/2022',
          img: 'https://images.unsplash.com/photo-1449495169669-7b118f960237?auto=format&fit=crop&q=80&w=400',
          payment: 'Trả góp 0%'
        }
      ]
    },
    {
      id: 2,
      name: 'Trần Thị B',
      phone: '0938.888.999',
      type: 'Old',
      typeLabel: 'Khách hàng cũ',
      lastContact: '28/04/2024',
      points: 1200,
      tier: 'Silver Member',
      address: 'Long Thành, Đồng Nai',
      source: 'Facebook Fanpage',
      identity: '072093005678',
      needs: ['Tiết kiệm xăng', 'Đi làm xa', 'Màu xanh'],
      bikes: [
        {
          id: 1,
          model: 'Honda Vision 2023',
          price: '34.500.000đ',
          deliveryDate: '10/10/2023',
          img: 'https://images.unsplash.com/photo-1449495169669-7b118f960237?auto=format&fit=crop&q=80&w=400',
          payment: 'Tiền mặt'
        }
      ]
    }
  ])

  const timeline = ref([
    {
      id: 1,
      type: 'call',
      date: '02/05/2024 10:15',
      staff: 'Sale: Minh Tuấn',
      category: 'Tư vấn đổi xe',
      content:
        'Khách hàng có nhu cầu đổi từ Vision lên SH 160i. Đã báo giá sơ bộ và hẹn lái thử vào cuối tuần này. Khách đang cân nhắc giữa màu Đen mờ và Đỏ đô.'
    },
    {
      id: 2,
      type: 'note',
      date: '28/04/2024 15:30',
      staff: 'Admin: Lan Anh',
      category: 'Hậu mãi',
      content:
        'Gửi tin nhắn Zalo chúc mừng sinh nhật khách hàng kèm Voucher giảm giá 20% thay nhớt tại showroom.'
    },
    {
      id: 3,
      type: 'call',
      date: '15/03/2024 09:00',
      staff: 'Kỹ thuật: Hoàng',
      category: 'Nhắc bảo dưỡng',
      content:
        'Nhắc khách bảo dưỡng lần 3 theo lịch hẹn. Khách báo đang đi công tác, sẽ ghé vào tuần sau.'
    }
  ])

  const getTypeClasses = (type: string) => {
    if (type === 'VIP') return 'bg-amber-50 text-amber-600 border-amber-100'
    if (type === 'Old') return 'bg-blue-50 text-blue-600 border-blue-100'
    return 'bg-slate-50 text-slate-500 border-slate-200'
  }

  const handleAddCustomer = () => ElMessage.success('Mở Form thêm khách hàng mới')

  const viewDetails = (row: any) => {
    activeCustomer.value = row
    isDetailView.value = true
  }
</script>

<style lang="scss" scoped>
  .customer-care-page {
    .combat-input-large :deep(.el-input__wrapper) {
      height: 52px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: none;

      &:focus {
        border-color: #3b82f6;
      }
    }

    .premium-select :deep(.el-input__wrapper) {
      height: 52px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      box-shadow: none;
    }

    .combat-table {
      :deep(.el-table__header-wrapper th) {
        padding: 20px 0;
        font-size: 10px;
        font-weight: 900;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        background-color: #f8fafc;
      }

      :deep(.el-table__row) {
        transition: all 0.3s;

        &:hover {
          cursor: pointer;
          background-color: #f1f5f9;
        }
      }
    }

    .combat-tabs-large {
      :deep(.el-tabs__header) {
        padding: 0 40px;
        margin: 0;
        background: #f8fafc;
        border-bottom: 1px solid #f1f5f9;
      }

      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }

      :deep(.el-tabs__item) {
        height: 80px;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.1em;

        &.is-active {
          color: #3b82f6;
        }
      }

      :deep(.el-tabs__active-bar) {
        height: 4px;
        background: #3b82f6;
        border-radius: 4px;
      }
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.98) translateY(10px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
