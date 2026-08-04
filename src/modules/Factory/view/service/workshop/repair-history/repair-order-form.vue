<template>
  <div
    class="resp-page repair-order-form-page flex flex-col min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A]"
  >
    <!-- Header -->
    <div
      class="bg-white border-b border-slate-200 px-8 py-5 shrink-0 shadow-sm relative z-20"
    >
      <div class="flex justify-between items-center max-w-[1200px] mx-auto">
        <div class="flex items-center gap-5">
          <button
            @click="goBack"
            class="size-9 rounded-xl border border-slate-200 text-slate-600 flex-cc hover:bg-slate-50 transition-all active:scale-95"
          >
            <ArtSvgIcon icon="ri:arrow-left-line" />
          </button>
          <div>
            <h1
              class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none"
            >
              Ti?p nh?n xe & Kh?i t?o phi?u d?ch v?
            </h1>
            <p
              class="m-0 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2"
            >
              Giai do?n 1: Ti?p nh?n th�ng tin & Kh?o s�t ban d?u
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Area -->
    <div class="flex-1 max-w-[1200px] mx-auto w-full p-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Search & Customer Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Step 1: Tra c?u kh�ch h�ng -->
          <div
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-5"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span
                class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs"
                >1</span
              >
              Tra c?u th�ng tin kh�ch h�ng
            </h3>

            <div class="flex gap-3">
              <ElInput
                v-model="searchPhone"
                placeholder="Nh?p s? di?n tho?i kh�ch h�ng..."
                clearable
                @keyup.enter="searchCustomer"
                class="combat-input flex-1"
              >
                <template #prefix>
                  <ArtSvgIcon
                    icon="ri:phone-line"
                    class="text-slate-400 text-sm"
                  />
                </template>
              </ElInput>
              <button
                @click="searchCustomer"
                :disabled="searching"
                class="h-10 px-6 bg-[#001529] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <ArtSvgIcon icon="ri:search-2-line" v-if="!searching" />
                <span
                  class="animate-spin size-3 border-2 border-white border-t-transparent rounded-full"
                  v-else
                ></span>
                T�m ki?m
              </button>
            </div>

            <!-- Vehicles Result List -->
            <div v-if="vehicles.length > 0" class="space-y-3 pt-2">
              <p
                class="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0"
              >
                Xe li�n k?t t�m th?y ({{ vehicles.length }}):
              </p>
              <div
                v-for="vehicle in vehicles"
                :key="vehicle.id"
                @click="selectVehicle(vehicle)"
                class="p-4 border rounded-[16px] cursor-pointer transition-all flex justify-between items-center"
                :class="
                  selectedVehicle?.id === vehicle.id
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50/50'
                "
              >
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-800 text-xs">{{
                      vehicle.fullName
                    }}</span>
                    <span
                      class="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-mono font-bold text-slate-500"
                      >{{ vehicle.licensePlate || "Chua c� bi?n" }}</span
                    >
                  </div>
                  <p class="text-[10px] text-slate-400 mt-1 m-0">
                    S�T: {{ vehicle.phoneNumber }} | S? khung:
                    {{ vehicle.vinNumber || "-" }}
                  </p>
                </div>
                <div
                  class="size-6 rounded-full border flex-cc"
                  :class="
                    selectedVehicle?.id === vehicle.id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300'
                  "
                >
                  <ArtSvgIcon
                    icon="ri:check-line"
                    class="text-xs"
                    v-if="selectedVehicle?.id === vehicle.id"
                  />
                </div>
              </div>
            </div>

            <div
              v-else-if="searched && vehicles.length === 0"
              class="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center gap-3"
            >
              <ArtSvgIcon
                icon="ri:information-line"
                class="text-amber-500 text-lg"
              />
              <div class="text-xs text-amber-800">
                Kh�ng t�m th?y xe n�o li�n k?t v?i s? di?n tho?i n�y. B?n c� th?
                nh?p th? c�ng ? ph?n b�n du?i.
              </div>
            </div>
          </div>

          <!-- Step 2: Th�ng tin chi ti?t kh�ch & xe -->
          <div
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-6"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span
                class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs"
                >2</span
              >
              Th�ng tin chi ti?t
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >H? v� t�n kh�ch h�ng *</label
                >
                <ElInput
                  v-model="form.customerName"
                  placeholder="Nh?p t�n kh�ch h�ng"
                  class="combat-input"
                />
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >S? di?n tho?i *</label
                >
                <ElInput
                  v-model="form.customerPhone"
                  placeholder="Nh?p s? di?n tho?i"
                  class="combat-input"
                />
              </div>
            </div>

            <div
              class="p-4 bg-slate-50 rounded-[16px] border border-slate-100 space-y-2 text-xs"
              v-if="selectedVehicle"
            >
              <p
                class="font-bold text-slate-700 m-0 uppercase text-[9px] tracking-wider"
              >
                Th�ng tin xe dang ch?n:
              </p>
              <div class="grid grid-cols-2 gap-y-2 text-slate-500">
                <div>
                  Bi?n s?:
                  <span class="font-bold text-slate-800 font-mono">{{
                    selectedVehicle.licensePlate || "Chua dang k�"
                  }}</span>
                </div>
                <div>
                  S? khung:
                  <span class="font-mono text-slate-800">{{
                    selectedVehicle.vinNumber || "-"
                  }}</span>
                </div>
                <div>
                  S? m�y:
                  <span class="font-mono text-slate-800">{{
                    selectedVehicle.engineNumber || "-"
                  }}</span>
                </div>
                <div>
                  Ng�y mua:
                  <span class="text-slate-800">{{
                    formatDate(selectedVehicle.purchaseDate)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Failure Details & Submit -->
        <div class="space-y-6">
          <div
            class="bg-white border border-slate-200 p-6 rounded-[24px] shadow-sm space-y-5"
          >
            <h3
              class="text-sm font-black uppercase text-slate-800 tracking-wider m-0 flex items-center gap-2"
            >
              <span
                class="size-5 rounded bg-blue-50 text-blue-600 flex-cc text-xs"
                >3</span
              >
              Nghi?m thu xe
            </h3>

            <div class="space-y-4">
              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >S? KM đồng h? hi?n t?i *</label
                >
                <ElInputNumber
                  v-model="form.mileage"
                  :min="0"
                  class="w-full combat-number-input"
                  placeholder="Nh?p s? km"
                />
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >M� t? t�nh tr?ng l?i/B?o du?ng *</label
                >
                <ElInput
                  v-model="form.description"
                  type="textarea"
                  :rows="4"
                  placeholder="Nh?p m� t? l?i (V� d?: Xe k�u c?ch c?ch ph?n l?c m�y, c?n thay nh?t d?nh k?...)"
                  class="combat-textarea"
                />
              </div>

              <div>
                <label
                  class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2"
                  >Ghi nh?n ngo?i quan (Xu?c, m�p...)</label
                >
                <ElInput
                  v-model="form.notes"
                  type="textarea"
                  :rows="2"
                  placeholder="V� d?: Xe tr?y xu?c nh? b?ng tr�i, m�m tru?c hoi tr?y..."
                  class="combat-textarea"
                />
              </div>
            </div>

            <ElDivider content-position="left" class="!my-4"
              >M� gi?m gi� (Voucher)</ElDivider
            >
            <ElInput
              v-model="voucherCode"
              placeholder="Nh?p m� voucher..."
              class="combat-input"
              @keyup.enter="applyVoucher"
              :disabled="submitting"
            >
              <template #append>
                <ElButton
                  :loading="voucherApplying"
                  type="primary"
                  @click="applyVoucher"
                >
                  �p đồng
                </ElButton>
              </template>
            </ElInput>
            <div
              v-if="appliedVoucher"
              class="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg mt-2"
            >
              <ArtSvgIcon icon="ri:coupon-3-fill" class="text-emerald-600" />
  <span class="text-sm font-bold text-emerald-700">{{ appliedVoucher.code }}</span>
  <span class="text-xs text-emerald-600">{{ (appliedVoucher.discountAmount || 0).toLocaleString("vi-VN") }} đồng</span>




              <ElButton
                link
                type="danger"
                size="small"
                :loading="voucherApplying"
                @click="removeVoucher"
              >
                <ArtSvgIcon icon="ri:close-circle-line" />
              </ElButton>
            </div>
            <p v-if="voucherError" class="text-xs text-red-500 mt-1">
              {{ voucherError }}
            </p>

            <div class="pt-4 border-t border-slate-100">
              <button
                @click="handleSubmit"
                :disabled="submitting"
                class="w-full h-11 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                v-auth="Permissions.Marketing.CustomerManagement.View"
              >
                <ArtSvgIcon
                  icon="ri:checkbox-circle-line"
                  class="text-sm"
                  v-if="!submitting"
                />
                <span
                  class="animate-spin size-3 border-2 border-white border-t-transparent rounded-full"
                  v-else
                ></span>
                T?o phi?u s?a ch?a
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useVoucher } from "@/common/composables/useVoucher";
import type { AppliedVoucherInfo } from "@/domain/voucher/voucher.types";
import { VehicleApi, Vehicle } from "@/api/vehicle";
import { RepairOrderApi } from "@/api/sales";
import { VoucherApi } from "@/api/voucher.api";

defineOptions({ name: "CustomerWorkshopCreate" });

const router = useRouter();
const searchPhone = ref("");
const searching = ref(false);
const searched = ref(false);
const vehicles = ref<Vehicle[]>([]);
const selectedVehicle = ref<Vehicle | null>(null);
const submitting = ref(false);

const form = reactive({
  customerName: "",
  customerPhone: "",
  mileage: 0,
  description: "",
  notes: "",
});

const voucherId = ref<number | null>(null);
const voucherDiscount = ref(0);
const voucherCode = ref("");
const voucherApplying = ref(false);
const appliedVoucher = ref<AppliedVoucherInfo | null>(null);
const voucherError = ref("");

function formatCurrency(value?: number): string {
  if (value == null) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

// Search customer vehicles by Phone Number
const searchCustomer = async () => {
  const phone = searchPhone.value.trim();
  if (!phone) {
    ElMessage.warning("Vui l�ng nh?p s? di?n tho?i");
    return;
  }

  searching.value = true;
  searched.value = true;
  vehicles.value = [];
  selectedVehicle.value = null;

  try {
    const res = await VehicleApi.getList({
      current: 1,
      size: 50,
      Filters: `PhoneNumber==${phone}`,
    });

    vehicles.value = res.items || [];

    if (vehicles.value.length === 1) {
      selectVehicle(vehicles.value[0]);
    }
  } catch (err: any) {
    ElMessage.error(err.message || "L?i khi tra c?u kh�ch h�ng");
  } finally {
    searching.value = false;
  }
};

// Select a vehicle to prefill fields
const selectVehicle = (vehicle: Vehicle) => {
  selectedVehicle.value = vehicle;
  form.customerName = vehicle.fullName;
  form.customerPhone = vehicle.phoneNumber;
};

// Create Repair Order
const handleSubmit = async () => {
  if (!form.customerName.trim()) {
    ElMessage.warning("Vui l�ng nh?p h? v� t�n kh�ch h�ng");
    return;
  }
  if (!form.customerPhone.trim()) {
    ElMessage.warning("Vui l�ng nh?p s? di?n tho?i");
    return;
  }
  if (!form.description.trim()) {
    ElMessage.warning("Vui l�ng nh?p m� t? l?i/y�u c?u s?a ch?a");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      vehicleId: selectedVehicle.value?.id || undefined,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      mileage: form.mileage,
      description: form.description.trim(),
      notes: form.notes.trim() || undefined,
    };

    const res = await RepairOrderApi.create(payload);
    ElMessage.success("T?o phi?u ti?p nh?n xe th�nh c�ng!");

    // Redirect to detail page
    const newId = res;
    router.push(`/factory/workshop/repair-history/repair/${newId}`);
  } catch (err: any) {
    ElMessage.error(err.message || "L?i khi kh?i t?o phi?u s?a ch?a");
  } finally {
    submitting.value = false;
  }
};

const goBack = () => {
  router.push("/factory/workshop/repair-history");
};

function formatCurrency(value: number) {
  if (!value) return '0 ?';
  return new Intl.NumberFormat('vi-VN').format(value) + ' ?';
}
const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const {
  voucherCode: vcCode,
  appliedVoucher: vcApplied,
  applying: vcApplying,
  errorMsg: vcError,
  discountAmount: vcDiscount,
  handleApply: vcApply,
  handleRemove: vcRemove,
} = useVoucher(
  () => 0,
  () => undefined,
  true,
);

watch(voucherCode, (val: string) => {
  vcCode.value = val;
});
watch(appliedVoucher, (val) => {
  vcApplied.value = val;
});
watch(voucherApplying, (val) => {
  vcApplying.value = val;
});
watch(voucherError, (val) => {
  vcError.value = val;
});
      if (appliedVoucher.value) {
        (payload as any).voucherId = appliedVoucher.value.voucherId;
        (payload as any).discountAmount = appliedVoucher.value.discountAmount;
      }
const applyVoucher = async () => {
  voucherError.value = "";
  const code = voucherCode.value.trim().toUpperCase();
  if (!code) {
    voucherError.value = "Vui l�ng nh?p m� voucher";
    return;
  }
  voucherApplying.value = true;
  try {
    await vcApply();
    voucherCode.value = vcCode.value;
    appliedVoucher.value = vcApplied.value;
    voucherDiscount.value = vcDiscount.value;
    ElMessage.success(
      "�� �p đồng voucher " + (appliedVoucher.value?.code || ""),
    );
  } catch (err: any) {
    voucherError.value = err?.message || "Kh�ng th? �p đồng voucher";
  } finally {
    voucherApplying.value = false;
  }
};

const removeVoucher = async () => {
  if (!appliedVoucher.value) return;
  voucherApplying.value = true;
  try {
    await vcRemove();
    appliedVoucher.value = null;
    voucherDiscount.value = 0;
    voucherCode.value = "";
    voucherError.value = "";
  } catch (err: any) {
    voucherError.value = err?.message || "Kh�ng th? b? voucher";
  } finally {
    voucherApplying.value = false;
  }
};
</script>

<style lang="scss" scoped>
.repair-order-form-page {
  .combat-input {
    :deep(.el-input__wrapper) {
      height: 40px;
      padding: 6px 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }
  }

  .combat-number-input {
    width: 100%;

    :deep(.el-input__wrapper) {
      height: 40px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: none;
    }

    :deep(.el-input-number__decrease),
    :deep(.el-input-number__increase) {
      width: 32px;
      height: 32px;
      margin: 4px;
      background-color: #f1f5f9;
      border: none;
      border-radius: 8px;
    }
  }

  .combat-textarea {
    :deep(.el-textarea__inner) {
      padding: 12px;
      font-size: 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }
  }
}
</style>

