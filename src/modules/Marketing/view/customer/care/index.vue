<template>
  <div class="resp-page customer-care-page p-8 min-h-full">
    <div v-if="!isDetailView">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1
            class="m-0 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase"
          >
            Chăm sóc Khách hàng
          </h1>
          <p
            class="m-0 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1"
          >
            Quản lý vòng đời & Trải nghiệm khách hàng Anh Em Motor
          </p>
        </div>
        <div class="flex gap-3">
          <button
            @click="handleAddCustomer"
            class="h-11 px-8 bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:user-add-line" class="text-blue-500" /> Thêm
            khách hàng mới
          </button>
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 mb-8 shadow-sm"
      >
        <div class="resp-stats-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="col-span-2">
            <ElInput
              v-model="searchQuery"
              placeholder="Tìm tên, SĐT hoặc Biển số khách hàng..."
              class="combat-input-large"
            >
              <template #prefix
                ><ArtSvgIcon icon="ri:search-2-line"
              /></template>
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
              <span class="text-[9px] font-bold uppercase tracking-tighter"
                >Đang quản lý:</span
              >
              <span class="text-sm font-bold">{{
                filteredCustomers.length
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden"
      >
        <ElTable
          v-loading="loadingCustomers"
          :data="filteredCustomers"
          style="width: 100%"
          class="combat-table"
        >
          <ElTableColumn label="Khách hàng" min-width="240">
            <template #default="{ row }">
              <div class="flex items-center gap-4 py-2">
                <div
                  class="size-10 rounded-xl bg-slate-100 flex-cc text-slate-500 font-bold"
                >
                  {{ row.name.charAt(0) }}
                </div>
                <div>
                  <p
                    class="m-0 text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mb-1"
                  >
                    {{ row.name }}
                  </p>
                  <p
                    class="m-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter"
                  >
                    {{ row.phone }}
                  </p>
                </div>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Phân loại" width="150">
            <template #default="{ row }">
              <span
                class="px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border"
                :class="getTypeClasses(row.type)"
              >
                {{ row.typeLabel }}
              </span>
            </template>
          </ElTableColumn>
          <ElTableColumn label="Lần cuối bảo dưỡng" width="180">
            <template #default="{ row }">
              <span
                class="text-xs font-bold text-slate-500 dark:text-slate-400"
                >{{ row.lastContact }}</span
              >
            </template>
          </ElTableColumn>
          <ElTableColumn label="Trạng thái Loyalty" width="160">
            <template #default="{ row }">
              <span class="text-[10px] font-bold text-amber-500"
                >{{ row.points }} pts</span
              >
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thao tác" width="120" align="right">
            <template #default="{ row }">
              <button
                @click="viewDetails(row)"
                class="h-9 px-4 bg-blue-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-md hover:bg-blue-700 transition-all"
              >
                Chi tiết
              </button>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>

    <div v-else v-loading="loadingDetails" class="animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-6">
          <button
            @click="isDetailView = false"
            class="size-12 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-300 flex-cc hover:bg-slate-900 hover:text-white transition-all shadow-sm"
          >
            <ArtSvgIcon icon="ri:arrow-left-line" />
          </button>
          <div>
            <h1
              class="m-0 text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
            >
              {{ activeCustomer?.name }}
            </h1>
            <p
              class="m-0 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:shield-user-line" class="text-amber-500" />
              Hồ sơ Customer 360 -
              {{ activeCustomer?.typeLabel }}
            </p>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            @click="handleCallZalo(activeCustomer)"
            class="h-11 px-6 bg-emerald-500 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 transition-all flex items-center gap-2"
          >
            <ArtSvgIcon icon="ri:phone-line" /> Gọi Zalo
          </button>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-8">
        <div class="col-span-12 lg:col-span-4 space-y-6">
          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-8 text-slate-800 dark:text-slate-100 shadow-sm relative overflow-hidden"
          >
            <ArtSvgIcon
              icon="ri:fingerprint-line"
              class="absolute -right-4 -top-4 text-9xl opacity-5 dark:opacity-10 text-slate-300 dark:text-white"
            />
            <h3
              class="m-0 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-2"
            >
              Dữ liệu cốt lõi
            </h3>
            <div class="space-y-6 relative z-10">
              <div
                class="flex justify-between border-b border-slate-100 dark:border-white/10 pb-4"
              >
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >Số điện thoại</span
                >
                <span
                  class="text-sm font-bold text-slate-800 dark:text-slate-100"
                  >{{ activeCustomer?.phone }}</span
                >
              </div>
              <div
                class="flex justify-between border-b border-slate-100 dark:border-white/10 pb-4"
              >
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >CCCD / CMND</span
                >
                <span
                  class="text-sm font-bold text-slate-800 dark:text-slate-100"
                  >{{ activeCustomer?.identity }}</span
                >
              </div>
              <div
                class="flex justify-between border-b border-slate-100 dark:border-white/10 pb-4"
              >
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase"
                  >Hạng Loyalty</span
                >
                <span class="text-sm font-bold text-amber-500">{{
                  activeCustomer?.tier
                }}</span>
              </div>
              <div>
                <span
                  class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 block"
                  >Địa chỉ thường trú</span
                >
                <p
                  class="m-0 text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed"
                >
                  {{ activeCustomer?.address }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-8 shadow-sm"
          >
            <h3
              class="m-0 text-xs font-bold uppercase tracking-widest text-slate-800 mb-6"
            >
              Nhu cầu & Sở thích
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in activeCustomer?.needs"
                :key="tag"
                class="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase border border-blue-100"
                >{{ tag }}</span
              >
            </div>
            <div
              v-if="
                activeCustomer?.reminders && activeCustomer.reminders.length > 0
              "
              class="mt-8 space-y-3"
            >
              <div
                v-for="reminder in activeCustomer.reminders"
                :key="reminder.title"
                class="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-center gap-4"
              >
                <div
                  class="size-10 rounded-xl bg-red-500 text-white flex-cc shrink-0 animate-pulse"
                >
                  <ArtSvgIcon icon="ri:alarm-warning-line" />
                </div>
                <p
                  class="m-0 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase leading-relaxed"
                >
                  {{ reminder.title }}: {{ reminder.description }}
                </p>
              </div>
            </div>
            <div
              v-else
              class="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-4"
            >
              <div
                class="size-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-cc shrink-0"
              >
                <ArtSvgIcon icon="ri:check-double-line" />
              </div>
              <p
                class="m-0 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-relaxed"
              >
                Không có nhắc nhở chăm sóc nào quá hạn
              </p>
            </div>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-8 space-y-8">
          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-sm overflow-hidden"
          >
            <ElTabs v-model="activeTab" class="combat-tabs-large">
              <ElTabPane label="DÒNG THỜI GIAN TƯƠNG TÁC" name="timeline">
                <div class="p-10 space-y-8 relative">
                  <div
                    class="absolute left-[59px] top-12 bottom-12 w-0.5 bg-slate-100 dark:bg-slate-800"
                  ></div>
                  <div
                    v-for="log in timeline"
                    :key="log.id"
                    class="flex gap-8 relative"
                  >
                    <div
                      class="size-14 rounded-2xl flex-cc z-10 shadow-xl"
                      :class="
                        log.type === 'call'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-white'
                      "
                    >
                      <ArtSvgIcon
                        :icon="
                          log.type === 'call'
                            ? 'ri:phone-line'
                            : 'ri:message-3-line'
                        "
                        class="text-xl"
                      />
                    </div>
                    <div
                      class="flex-1 bg-slate-50/50 dark:bg-slate-950/20 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800"
                    >
                      <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-3">
                          <span
                            class="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                            >{{ log.date }}</span
                          >
                          <span class="size-1 rounded-full bg-slate-300"></span>
                          <span
                            class="text-[11px] font-bold text-blue-500 uppercase tracking-widest"
                            >{{ log.staff }}</span
                          >
                        </div>
                        <span
                          class="px-3 py-1 bg-white text-[9px] font-bold uppercase rounded-lg border border-slate-200 shadow-sm"
                          >{{ log.category }}</span
                        >
                      </div>
                      <p
                        class="m-0 text-base font-bold text-slate-700 leading-relaxed"
                      >
                        {{ log.content }}
                      </p>
                    </div>
                  </div>
                </div>
              </ElTabPane>
              <ElTabPane label="LỊCH SỬ MUA XE & DỊCH VỤ" name="purchase">
                <div class="p-10 space-y-10">
                  <h3
                    class="m-0 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-6"
                  >
                    Phương tiện sở hữu
                  </h3>
                  <div
                    v-if="
                      activeCustomer?.bikes && activeCustomer.bikes.length > 0
                    "
                    class="grid grid-cols-2 gap-6"
                  >
                    <div
                      v-for="bike in activeCustomer?.bikes"
                      :key="bike.id"
                      class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                    >
                      <div class="flex gap-5 mb-4">
                        <img
                          :src="bike.img"
                          class="size-20 rounded-2xl object-cover shadow-lg"
                        />
                        <div>
                          <h4
                            class="m-0 text-lg font-bold text-slate-800 dark:text-slate-100"
                          >
                            {{ bike.model }}
                          </h4>
                          <p
                            class="m-0 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest"
                          >
                            {{ bike.deliveryDate }}
                          </p>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-3">
                        <div
                          class="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl"
                        >
                          <p
                            class="m-0 text-[9px] font-bold text-slate-400 uppercase mb-1"
                          >
                            Trạng thái
                          </p>
                          <p
                            class="m-0 text-xs font-bold text-slate-700 dark:text-slate-300"
                          >
                            {{ bike.payment }}
                          </p>
                        </div>
                        <div
                          class="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl"
                        >
                          <p
                            class="m-0 text-[9px] font-bold text-slate-400 uppercase mb-1"
                          >
                            Hóa đơn
                          </p>
                          <p
                            class="m-0 text-xs font-bold text-blue-600 dark:text-blue-400"
                          >
                            {{ bike.price }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    v-else
                    class="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
                  >
                    <ArtSvgIcon
                      icon="ri:car-line"
                      class="text-3xl mb-2 opacity-50 block mx-auto text-slate-400 dark:text-slate-500"
                    />
                    <span class="text-xs font-bold uppercase tracking-wider"
                      >Chưa sở hữu phương tiện nào</span
                    >
                  </div>

                  <div
                    class="pt-8 border-t border-slate-100 dark:border-slate-800"
                  >
                    <h3
                      class="m-0 text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-6"
                    >
                      Nhật ký bảo dưỡng & Sửa chữa
                    </h3>
                    <div
                      v-if="
                        activeCustomer?.maintenanceHistories &&
                        activeCustomer.maintenanceHistories.length > 0
                      "
                      class="space-y-4"
                    >
                      <div
                        v-for="maint in activeCustomer.maintenanceHistories"
                        :key="maint.id"
                        class="p-5 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl flex justify-between items-center border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                      >
                        <div class="flex items-center gap-4">
                          <div
                            class="size-10 rounded-xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-700 flex-cc text-slate-400 dark:text-slate-300"
                          >
                            <ArtSvgIcon icon="ri:tools-line" />
                          </div>
                          <div>
                            <p
                              class="m-0 text-sm font-bold text-slate-800 dark:text-slate-200"
                            >
                              {{ maint.title }} - {{ maint.description }}
                            </p>
                            <p
                              class="m-0 text-[10px] font-bold text-slate-400 uppercase"
                            >
                              Ngày {{ maint.date }}
                            </p>
                          </div>
                        </div>
                        <span
                          class="text-sm font-bold text-slate-700 dark:text-slate-200"
                          >{{ maint.cost }}</span
                        >
                      </div>
                    </div>
                    <div
                      v-else
                      class="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800"
                    >
                      <ArtSvgIcon
                        icon="ri:tools-line"
                        class="text-3xl mb-2 opacity-50 block mx-auto text-slate-400 dark:text-slate-500"
                      />
                      <span class="text-xs font-bold uppercase tracking-wider"
                        >Chưa có lịch sử bảo dưỡng & sửa chữa</span
                      >
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { fetchGetLoyaltyMembers } from "@/api/customer/loyalty.api";
import { fetchGetProfile360 } from "@/api/customer/lead.api";
import dayjs from "dayjs";

defineOptions({ name: "CustomerCareFocusMode" });

const searchQuery = ref("");
const filterType = ref("all");
const isDetailView = ref(false);
const activeTab = ref("timeline");
const activeCustomer = ref<any>(null);

const filteredCustomers = computed(() => {
  return customers.value.filter((c) => {
    const q = searchQuery.value.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.identity.includes(q) ||
      (c.bikes && c.bikes.some((b: any) => b.model.toLowerCase().includes(q)));

    const matchesFilter =
      filterType.value === "all" || c.type === filterType.value;

    return matchesSearch && matchesFilter;
  });
});

const loadingCustomers = ref(false);
const loadingDetails = ref(false);
const customers = ref<any[]>([]);
const timeline = ref<any[]>([]);

const getTypeClasses = (type: string) => {
  if (type === "VIP") return "bg-amber-50 text-amber-600 border-amber-100";
  if (type === "Old") return "bg-blue-50 text-blue-600 border-blue-100";
  return "bg-slate-50 text-slate-500 border-slate-200";
};

const router = useRouter();

const handleAddCustomer = () => {
  router.push("/Marketing/customer/profile");
};

const loadLoyaltyMembers = async () => {
  loadingCustomers.value = true;
  try {
    const res = await fetchGetLoyaltyMembers();
    let items: any[] = [];
    if (Array.isArray(res)) {
      items = res;
    } else if (res && Array.isArray(res.items)) {
      items = res.items;
    } else if (res && Array.isArray(res.records)) {
      items = res.records;
    }

    customers.value = items.map((m) => {
      const typeMap: Record<string, { type: string; label: string }> = {
        standard: { type: "New", label: "Khách mới" },
        silver: { type: "Old", label: "Hội viên Bạc" },
        gold: { type: "VIP", label: "Hội viên Vàng" },
        platinum: { type: "VIP", label: "Hội viên Bạch Kim" },
      };
      const tierKey = (m.tier || "").toLowerCase();
      const mappedType = typeMap[tierKey] || {
        type: "New",
        label: m.tier || "Standard",
      };

      return {
        id: m.id,
        name: m.fullName,
        phone: m.phoneNumber,
        type: mappedType.type,
        typeLabel: mappedType.label,
        lastContact: "Chưa cập nhật",
        points: m.points || 0,
        tier: m.tier || "Standard Member",
        address: "",
        email: "",
        identity: "",
        needs: [],
        bikes: [],
      };
    });
  } catch (err: any) {
    ElMessage.error(err.message || "Không thể tải danh sách hội viên.");
  } finally {
    loadingCustomers.value = false;
  }
};

const viewDetails = async (row: any) => {
  loadingDetails.value = true;
  isDetailView.value = true;
  try {
    const profileData = await fetchGetProfile360(row.id);
    activeCustomer.value = {
      id: row.id,
      name: row.name,
      phone: row.phone,
      identity: profileData.identificationNumber || "Chưa cập nhật",
      tier: row.tier,
      typeLabel: row.typeLabel,
      address: profileData.address || "Chưa cập nhật",
      needs: profileData.interestedVehicle
        ? [profileData.interestedVehicle]
        : ["Chưa cập nhật sở thích"],
      bikes: (profileData.vehicles || []).map((v: any) => ({
        id: v.id,
        model: `${v.variantName} (${v.colorName})`,
        price: "Xem chi tiết HĐ",
        deliveryDate: v.purchaseDate
          ? dayjs(v.purchaseDate).format("DD/MM/YYYY")
          : "Chưa rõ",
        img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=200",
        payment: v.status || "Đã bàn giao",
      })),
      maintenanceHistories: (profileData.maintenanceHistories || []).map(
        (m: any) => ({
          id: m.id,
          title: `Bảo dưỡng #${m.maintenanceNumber}`,
          date: m.maintenanceDate
            ? dayjs(m.maintenanceDate).format("DD/MM/YYYY")
            : "Chưa rõ",
          cost: m.totalCost ? `${m.totalCost.toLocaleString()}đ` : "0đ",
          description: m.description || "Bảo dưỡng định kỳ",
        }),
      ),
      reminders: profileData.careReminders || [],
    };

    timeline.value = (profileData.timelineEvents || []).map((evt: any) => ({
      id: evt.relatedId || Date.now(),
      type: evt.type === "service" ? "call" : "note",
      date: evt.date ? dayjs(evt.date).format("DD/MM/YYYY HH:mm") : "Chưa rõ",
      staff: evt.type === "service" ? "Kỹ thuật viên" : "Nhân viên chăm sóc",
      category:
        evt.type === "service"
          ? "Bảo dưỡng"
          : evt.type === "activity"
            ? "Ghi chú"
            : "Giao dịch",
      content: evt.description || evt.title,
    }));
  } catch (err: any) {
    ElMessage.error(err.message || "Lỗi khi tải hồ sơ khách hàng.");
    isDetailView.value = false;
  } finally {
    loadingDetails.value = false;
  }
};

const handleCallZalo = (customer: any) => {
  if (!customer?.phone) {
    ElMessage.warning("Không có số điện thoại khách hàng");
    return;
  }
  const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
  window.open(`https://zalo.me/${cleanPhone}`, "_blank");
};

onMounted(loadLoyaltyMembers);
</script>

<style lang="scss" scoped>
.customer-care-page {
  .combat-input-large :deep(.el-input__wrapper) {
    height: 52px;
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 20px;
    box-shadow: none;

    &:focus {
      border-color: #3b82f6;
    }
  }

  .premium-select :deep(.el-input__wrapper) {
    height: 52px;
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
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
      background-color: var(--el-fill-color-light);
    }

    :deep(.el-table__row) {
      transition: all 0.3s;

      &:hover {
        cursor: pointer;
        background-color: var(--el-fill-color-hover);
      }
    }
  }

  .combat-tabs-large {
    :deep(.el-tabs__header) {
      padding: 0 40px;
      margin: 0;
      background: transparent;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__item) {
      height: 80px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.1em;
      color: var(--el-text-color-regular);

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
