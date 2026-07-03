<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div
      class="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div>
        <div
          class="flex items-center gap-2 text-slate-500 text-sm mb-1 cursor-pointer hover:text-primary transition-all"
          @click="goBack"
        >
          <el-icon><ArrowLeft /></el-icon>
          <span>Quay lại danh sách</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <el-icon class="text-primary"><Document /></el-icon>
          CHI TIẾT PHIẾU BẢO TRÌ & BẢO DƯỠNG
        </h1>
      </div>
    </div>

    <div v-if="detailLoading" class="p-6 text-center bg-white rounded-xl shadow-sm border border-slate-100" v-loading="true">
      Đang tải thông tin chi tiết...
    </div>
    <div v-else-if="detailData" class="space-y-6 text-slate-700 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <!-- Mã phiếu & Ngày tạo -->
      <div
        class="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
      >
        <div>
          <span
            class="text-xs text-slate-500 block uppercase tracking-wider font-semibold"
            >Mã phiếu bảo trì</span
          >
          <span class="text-lg font-mono font-bold text-primary">{{
            detailData.maintenanceNumber
          }}</span>
        </div>
        <div class="text-right">
          <span
            class="text-xs text-slate-500 block uppercase tracking-wider font-semibold"
            >Ngày thực hiện</span
          >
          <span class="text-sm font-medium">{{
            formatDate(detailData.maintenanceDate)
          }}</span>
        </div>
      </div>

      <!-- 2 Cột: Khách hàng & Xe -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <el-card shadow="never" class="border-slate-200">
          <template #header>
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <el-icon class="text-primary"><User /></el-icon>
              <span>Chủ sở hữu</span>
            </div>
          </template>
          <div class="space-y-2 text-xs">
            <div>
              <span class="text-slate-500">Họ tên:</span>
              <span class="font-bold text-slate-800">{{
                detailData.customerName || "N/A"
              }}</span>
            </div>
            <div>
              <span class="text-slate-500">Số điện thoại:</span>
              <span class="font-medium">{{
                detailData.customerPhone || "N/A"
              }}</span>
            </div>
            <div>
              <span class="text-slate-500">Địa chỉ:</span>
              <span>{{ detailData.customerAddress || "N/A" }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="border-slate-200">
          <template #header>
            <div class="font-bold text-slate-800 flex items-center gap-1.5">
              <el-icon class="text-primary"><Setting /></el-icon>
              <span>Phương tiện</span>
            </div>
          </template>
          <div class="space-y-2 text-xs">
            <div>
              <span class="text-slate-500">Biển số:</span>
              <span class="font-bold text-slate-800">{{
                detailData.vehiclePlate || "N/A"
              }}</span>
            </div>
            <div>
              <span class="text-slate-500">Số khung (VIN):</span>
              <span class="font-mono font-medium">{{
                detailData.vehicleVin || "N/A"
              }}</span>
            </div>
            <div>
              <span class="text-slate-500">Dòng xe:</span>
              <span>{{ detailData.vehicleYear || "N/A" }}</span>
            </div>
            <div>
              <span class="text-slate-500">Màu sắc:</span>
              <span>{{ detailData.vehicleColor || "N/A" }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- ODO & Kỹ thuật viên -->
      <div
        class="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
      >
        <div>
          <div
            class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
          >
            Chỉ số ODO
          </div>
          <div class="text-sm font-bold text-slate-800 mt-1">
            {{ formatKm(detailData.mileage) }}
          </div>
        </div>
        <div>
          <div
            class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
          >
            Kỹ thuật viên
          </div>
          <div class="text-sm font-bold text-slate-800 mt-1">
            {{ detailData.technicianName || "Chưa chỉ định" }}
          </div>
        </div>
        <div>
          <div
            class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
          >
            Kỳ tiếp theo (ODO)
          </div>
          <div class="text-sm font-bold text-primary mt-1">
            {{ formatKm(detailData.nextMaintenanceOdo || 0) }}
          </div>
        </div>
        <div>
          <div
            class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
          >
            Ngày hẹn tiếp theo
          </div>
          <div class="text-sm font-bold text-primary mt-1">
            {{ formatDateOnly(detailData.nextMaintenanceDate) }}
          </div>
        </div>
      </div>

      <!-- Mô tả yêu cầu -->
      <div>
        <div
          class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2"
        >
          Mô tả tình trạng &amp; Yêu cầu bảo dưỡng
        </div>
        <p
          class="text-xs text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed m-0"
        >
          {{ detailData.description || "Không có mô tả chi tiết." }}
        </p>
      </div>

      <!-- Danh sách phụ tùng thay thế -->
      <div>
        <div
          class="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2"
        >
          Phụ tùng thay thế trong đợt bảo dưỡng
        </div>
        <el-table
          :data="detailData.parts"
          border
          size="small"
          header-cell-class-name="bg-slate-50 font-semibold text-slate-700"
          class="border border-slate-200 rounded-lg overflow-hidden"
        >
          <el-table-column prop="partName" label="Tên Linh Kiện / Phụ Tùng" />
          <el-table-column prop="partCode" label="Mã Phụ Tùng" width="150" />
          <el-table-column label="Đơn Giá" width="130" align="right">
            <template #default="{ row }">
              <span class="font-semibold text-slate-700">{{
                formatPrice(row.unitPrice)
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Chi tiết hóa đơn -->
      <div
        class="p-4 bg-slate-50 text-slate-800 rounded-lg border border-slate-200 space-y-3"
      >
        <div
          class="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2"
        >
          Chi tiết chi phí dịch vụ
        </div>
        <div class="flex justify-between text-xs pt-1">
          <span class="text-slate-500 font-medium">Tiền công thợ / Sửa chữa:</span>
          <span class="font-semibold">{{
            formatPrice(detailData.laborCost)
          }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-slate-500 font-medium">Tiền linh kiện phụ tùng:</span>
          <span class="font-semibold">{{
            formatPrice(detailData.partsCost)
          }}</span>
        </div>
        <div
          class="border-t border-slate-200 pt-3 flex justify-between items-baseline"
        >
          <span class="text-slate-600 font-bold text-xs"
            >TỔNG CỘNG THANH TOÁN:</span
          >
          <span class="text-lg font-black text-primary">{{
            formatPrice(detailData.totalCost)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Setting,
  User,
  ArrowLeft,
  Document
} from "@element-plus/icons-vue";
import {
  MaintenanceApi,
  MaintenanceTicketDetail,
} from "@/api/service/maintenance.api";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();

const detailLoading = ref(false);
const detailData = ref<MaintenanceTicketDetail | null>(null);

const formatPrice = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val || 0);
};

const formatDate = (val: string) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY HH:mm");
};

const formatDateOnly = (val: any) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY");
};

const formatKm = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val || 0) + " km";
};

const goBack = () => {
  router.push("/factory/workshop/maintenance");
};

async function loadDetail() {
  const id = Number(route.params.id);
  if (!id) {
    ElMessage.error("Không tìm thấy mã phiếu.");
    goBack();
    return;
  }
  detailLoading.value = true;
  try {
    const res = await MaintenanceApi.getDetail(id);
    if (res) {
      detailData.value = res;
    }
  } catch (error) {
    console.error("Lỗi lấy chi tiết:", error);
    ElMessage.error("Không thể tải chi tiết phiếu bảo trì.");
  } finally {
    detailLoading.value = false;
  }
}

onMounted(() => {
  loadDetail();
});
</script>

<style scoped>
/* Optional styling */
</style>
