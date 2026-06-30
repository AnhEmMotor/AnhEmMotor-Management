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
          🛡️ Chi Tiết Hồ Sơ Bảo Hành
        </h1>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Nút từ chối bảo hành -->
        <el-button
          v-if="canReject"
          type="danger"
          :loading="submitting"
          plain
          @click="handleUpdateStatus(6)"
        >
          Từ Chối Bảo Hành
        </el-button>

        <!-- Các nút chuyển đổi trạng thái workflow -->
        <el-button
          v-if="currentStatusValue === 1"
          type="primary"
          :loading="submitting"
          @click="handleUpdateStatus(2)"
        >
          Gửi Hãng Thẩm Định
        </el-button>

        <el-button
          v-if="currentStatusValue === 2"
          type="success"
          :loading="submitting"
          @click="handleApproveClaim"
        >
          Duyệt Bồi Hoàn
        </el-button>

        <el-button
          v-if="currentStatusValue === 3"
          type="primary"
          :loading="submitting"
          @click="handleUpdateStatus(4)"
        >
          Xác Nhận Thay Thế Linh Kiện
        </el-button>

        <el-button
          v-if="currentStatusValue === 4"
          type="success"
          :loading="submitting"
          @click="handleUpdateStatus(5)"
        >
          💾 Hoàn tất & Đóng hồ sơ
        </el-button>

        <span
          v-if="currentStatusValue === 5"
          class="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm"
        >
          <el-icon><Check /></el-icon> Đã hoàn tất bảo hành
        </span>

        <span
          v-if="currentStatusValue === 6"
          class="text-rose-600 font-bold flex items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 text-sm"
        >
          <el-icon><Close /></el-icon> Hồ sơ đã bị từ chối
        </span>
      </div>
    </div>

    <!-- Pipeline progress -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <div class="flex items-center justify-between mb-4">
        <span class="font-semibold text-slate-800 text-sm"
          >TIẾN TRÌNH XỬ LÝ HỒ SƠ</span
        >
        <el-tag
          :type="statusTagType"
          effect="dark"
          class="font-semibold px-3 py-1.5"
        >
          {{ getStatusLabel(claim?.status || "") }}
        </el-tag>
      </div>
      <el-steps
        :active="activeStepIndex"
        align-center
        finish-status="success"
        class="custom-steps"
      >
        <el-step title="Tiếp nhận" description="Mới tiếp nhận phiếu" />
        <el-step title="Chờ thẩm định" description="Gửi hãng kiểm tra" />
        <el-step title="Đã duyệt" description="Hãng duyệt bồi hoàn" />
        <el-step title="Đang thay thế" description="Lắp linh kiện mới" />
        <el-step title="Hoàn tất" description="Đóng hồ sơ bảo hành" />
      </el-steps>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <!-- Cột trái (70%) - Chi tiết nghiệp vụ -->
      <div class="lg:col-span-7 space-y-6">
        <!-- Mô tả sự cố -->
        <el-card
          class="shadow-sm border-slate-100"
          header-class="font-bold text-slate-800"
        >
          <template #header>
            <div class="flex items-center gap-2">
              <el-icon class="text-primary"><Warning /></el-icon>
              <span>1. MINH CHỨNG & MÔ TẢ SỰ CỐ KỸ THUẬT</span>
            </div>
          </template>
          <div class="space-y-4">
            <div>
              <div
                class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1"
              >
                Mô tả chi tiết từ kỹ thuật viên
              </div>
              <p
                class="text-slate-800 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-line leading-relaxed"
              >
                {{ claim?.issueDescription || "Chưa có mô tả chi tiết lỗi." }}
              </p>
            </div>

            <div>
              <div
                class="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2"
              >
                Hình ảnh & Video minh chứng sự cố
              </div>
              <div
                v-if="mediaUrls.length === 0"
                class="text-sm text-slate-400 italic bg-slate-50 p-4 rounded-lg text-center border border-dashed"
              >
                Chưa đính kèm hình ảnh hoặc video minh chứng lỗi.
              </div>
              <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  v-for="(u, idx) in mediaUrls"
                  :key="idx"
                  class="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-black aspect-video flex items-center justify-center"
                >
                  <video
                    v-if="isVideo(u)"
                    controls
                    class="w-full h-full object-contain"
                  >
                    <source :src="u" />
                  </video>
                  <el-image
                    v-else
                    :src="u"
                    fit="cover"
                    class="w-full h-full cursor-pointer hover:scale-105 transition-all"
                    :preview-src-list="mediaUrls"
                    :initial-index="idx"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- Danh sách phụ tùng bồi hoàn -->
        <el-card class="shadow-sm border-slate-100">
          <template #header>
            <div class="flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2 font-bold text-slate-800">
                <el-icon class="text-primary"><Setting /></el-icon>
                <span>2. DANH SÁCH LINH KIỆN / PHỤ TÙNG BỒI HOÀN</span>
              </div>
              <el-tag type="info" class="font-bold"
                >Chính sách miễn phí 100% công sửa chữa</el-tag
              >
            </div>
          </template>

          <el-table
            :data="claim?.parts ?? []"
            border
            style="width: 100%"
            header-cell-class-name="bg-slate-50 font-semibold text-slate-700"
          >
            <el-table-column
              prop="partName"
              label="Tên Linh Kiện"
              min-width="180"
            />
            <el-table-column
              prop="partCode"
              label="Mã Linh Kiện"
              min-width="140"
            />
            <el-table-column
              label="Đơn Giá Phát Sinh"
              min-width="130"
              align="right"
            >
              <template #default="{ row }">
                <span
                  :class="{
                    'text-slate-400 line-through font-normal':
                      row.unitPrice === 0,
                    'text-amber-600 font-bold': row.unitPrice > 0,
                  }"
                >
                  {{ formatPrice(row.unitPrice) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              label="Diện Bảo Hành"
              min-width="140"
              align="center"
            >
              <template #default="{ row }">
                <el-tag
                  :type="row.unitPrice === 0 ? 'success' : 'warning'"
                  effect="plain"
                >
                  {{
                    row.unitPrice === 0
                      ? "Trong diện bảo hành (Miễn phí)"
                      : "Ngoài diện bảo hành"
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="statusText"
              label="Thẩm Định Hãng"
              min-width="150"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getPartStatusTagType(row.statusText || '')">
                  {{ getPartStatusLabel(row.statusText || "") }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- Thu hồi xe lỗi (Recall) -->
        <el-card class="shadow-sm border-slate-100">
          <template #header>
            <div class="flex items-center gap-2 font-bold text-slate-800">
              <el-icon class="text-primary"><Refresh /></el-icon>
              <span>3. XỬ LÝ ĐỔI TRẢ ĐẶC BIỆT (THU HỒI PHƯƠNG TIỆN LỖI)</span>
            </div>
          </template>
          <div class="space-y-4">
            <p class="text-xs text-slate-500 leading-relaxed">
              * Lưu ý: Tính năng này chỉ dùng cho trường hợp lỗi hệ thống nghiêm
              trọng thuộc diện triệu hồi (Recall) từ nhà máy sản xuất. Việc kích
              hoạt sẽ tự động cập nhật số khung xe trong kho tổng thành trạng
              thái thu hồi và tiến hành thủ tục cấp đổi xe mới cho khách hàng.
            </p>

            <div
              v-if="claim?.isRecall"
              class="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3"
            >
              <el-icon class="text-amber-600 text-xl mt-0.5"
                ><Warning
              /></el-icon>
              <div>
                <div class="text-sm font-bold text-amber-800">
                  ĐÃ KÍCH HOẠT QUY TRÌNH THU HỒI XE LỖI
                </div>
                <div class="text-xs text-amber-600 mt-1">
                  Đã kích hoạt đổi xe mới cho khách hàng. Trạng thái quyết định
                  của hãng:
                  {{
                    claim?.manufacturerDecision || "Đang chờ xử lý đổi xe mới"
                  }}
                </div>
              </div>
            </div>

            <div
              v-else-if="currentStatusValue < 5"
              class="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between flex-wrap gap-4"
            >
              <div>
                <span class="text-sm font-bold text-slate-700"
                  >Xe thuộc diện lỗi triệu hồi cần thu hồi?</span
                >
                <p class="text-xs text-slate-500 mt-0.5">
                  Tiến hành thu hồi xe và đổi trả xe mới cho khách hàng.
                </p>
              </div>
              <el-button
                type="warning"
                :loading="submitting"
                @click="handleRecall"
              >
                Kích hoạt Thu hồi & Đổi xe
              </el-button>
            </div>

            <div v-else class="text-sm text-slate-400 italic">
              Không thuộc diện thu hồi lỗi từ hãng.
            </div>
          </div>
        </el-card>
      </div>

      <!-- Cột phải (30%) - Định danh & Đối soát -->
      <div class="lg:col-span-3 space-y-6">
        <!-- Thông tin xe & khách hàng -->
        <el-card class="shadow-sm border-slate-100">
          <template #header>
            <div class="font-bold text-slate-800 flex items-center gap-2">
              <el-icon class="text-primary"><User /></el-icon>
              <span>THÔNG TIN KHÁCH HÀNG</span>
            </div>
          </template>
          <div class="space-y-3 text-sm text-slate-600">
            <div>
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Chủ sở hữu</span
              >
              <span class="text-slate-800 font-bold text-base">{{
                claim?.customerName || "N/A"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Số điện thoại</span
              >
              <span class="text-slate-800 font-medium">{{
                claim?.customerPhone || "N/A"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Địa chỉ liên lạc</span
              >
              <span class="text-slate-800 text-xs">{{
                claim?.customerAddress || "N/A"
              }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="shadow-sm border-slate-100">
          <template #header>
            <div class="font-bold text-slate-800 flex items-center gap-2">
              <el-icon class="text-primary"><Setting /></el-icon>
              <span>THÔNG TIN PHƯƠNG TIỆN</span>
            </div>
          </template>
          <div class="space-y-3 text-sm text-slate-600">
            <div>
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Biển số xe</span
              >
              <el-tag
                effect="plain"
                class="font-bold text-slate-700 border-slate-300 mt-0.5"
              >
                {{ claim?.vehiclePlate || "N/A" }}
              </el-tag>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Số khung (VIN)</span
              >
              <span class="text-slate-800 font-mono font-medium">{{
                claim?.vehicleVin || "N/A"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Màu sắc xe</span
              >
              <span class="text-slate-800 font-medium">{{
                claim?.vehicleColor || "N/A"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Dòng xe / Đời xe</span
              >
              <span class="text-slate-800 font-medium">{{
                claim?.vehicleYear || "N/A"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Tình trạng bảo hành xe</span
              >
              <span
                class="font-bold"
                :class="
                  claim?.warrantyRemaining === 'Hết hạn'
                    ? 'text-rose-600'
                    : 'text-emerald-600'
                "
              >
                {{ claim?.warrantyRemaining || "N/A" }}
              </span>
            </div>
          </div>
        </el-card>

        <!-- Đối soát hãng -->
        <el-card class="shadow-sm border-slate-100">
          <template #header>
            <div class="font-bold text-slate-800 flex items-center gap-2">
              <el-icon class="text-primary"><OfficeBuilding /></el-icon>
              <span>ĐỐI SOÁT HÃNG</span>
            </div>
          </template>
          <div class="space-y-3 text-sm text-slate-600">
            <div>
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Trung tâm tiếp nhận</span
              >
              <span class="text-slate-800 font-medium">{{
                claim?.serviceCenterName || "N/A"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Mã số hồ sơ hãng</span
              >
              <span class="text-slate-800 font-mono font-medium">{{
                claim?.manufacturerClaimNumber || "Chưa liên kết hãng"
              }}</span>
            </div>
            <div class="border-t border-slate-100 pt-2">
              <span
                class="text-slate-400 block text-xs uppercase tracking-wider font-semibold"
                >Quyết định của Hãng</span
              >
              <span class="text-slate-800 font-medium">{{
                claim?.manufacturerDecision || "Đang chờ hãng xem xét"
              }}</span>
            </div>
          </div>
        </el-card>

        <!-- Chi phí tổng hợp -->
        <el-card class="shadow-sm border-slate-100 bg-slate-900 text-white">
          <template #header>
            <div class="font-bold text-white flex items-center gap-2">
              <el-icon class="text-primary"><Money /></el-icon>
              <span>CHI PHÍ ĐỐI VỚI KHÁCH</span>
            </div>
          </template>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-400">Tiền công thợ:</span>
              <span class="line-through text-slate-500">0 đ</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Tiền linh kiện phát sinh:</span>
              <span class="text-amber-400 font-bold">{{
                formatPrice(totalPartsCost)
              }}</span>
            </div>
            <div
              class="border-t border-slate-800 pt-3 flex justify-between items-baseline"
            >
              <span class="text-slate-300 font-bold">TỔNG THU KHÁCH:</span>
              <span class="text-xl font-extrabold text-primary">{{
                formatPrice(totalPartsCost)
              }}</span>
            </div>
            <div class="text-[10px] text-slate-400 italic text-center mt-2">
              (Áp dụng chính sách miễn phí 100% công sửa chữa bảo hành)
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Document,
  Check,
  Close,
  Warning,
  Setting,
  Refresh,
  User,
  OfficeBuilding,
  Money,
} from "@element-plus/icons-vue";
import {
  WarrantyClaimApi,
  WarrantyClaimDetail,
} from "@/api/service/warranty-claim.api";

const router = useRouter();
const route = useRoute();
const claimId = Number(route.params.id);

const loading = ref(false);
const submitting = ref(false);
const claim = ref<WarrantyClaimDetail | null>(null);

const mediaUrls = computed(() => claim.value?.mediaUrls ?? []);

// Trạng thái hiện tại dạng số để dễ so sánh và điều khiển workflow
const currentStatusValue = computed(() => {
  const s = (claim.value?.status ?? "").toLowerCase();
  if (s === "received") return 1;
  if (s === "pendingmanufacturer") return 2;
  if (s === "approved") return 3;
  if (s === "replaced") return 4;
  if (s === "completed") return 5;
  if (s === "rejected") return 6;
  return 1;
});

const activeStepIndex = computed(() => {
  const val = currentStatusValue.value;
  if (val === 6) return 0; // Từ chối
  return val - 1; // 1 -> 0, 5 -> 4
});

const canReject = computed(() => {
  const val = currentStatusValue.value;
  return val !== 5 && val !== 6;
});

const statusTagType = computed(() => {
  const val = currentStatusValue.value;
  if (val === 5) return "success";
  if (val === 3) return "warning";
  if (val === 4) return "primary";
  if (val === 6) return "danger";
  return "info";
});

const totalPartsCost = computed(() => {
  if (!claim.value || !claim.value.parts) return 0;
  return claim.value.parts.reduce((sum, part) => {
    // Nếu trạng thái thẩm định không được miễn phí hoặc là linh kiện phát sinh thêm ngoài diện bảo hành
    return sum + (part.unitPrice || 0);
  }, 0);
});

// Methods
const formatDateOnly = (val: any) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY");
};

const formatPrice = (val: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val);
};

const isVideo = (url: string) => {
  return /(mp4|webm|ogg)$/i.test(url);
};

const getStatusLabel = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s === "received") return "Tiếp nhận";
  if (s === "pendingmanufacturer") return "Chờ hãng thẩm định";
  if (s === "approved") return "Đã duyệt bồi hoàn";
  if (s === "replaced") return "Thợ thay thế";
  if (s === "completed") return "Hoàn tất - Đóng hồ sơ";
  if (s === "rejected") return "Từ chối";
  return status;
};

const getPartStatusTagType = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s === "approved") return "success";
  if (s === "rejected") return "danger";
  return "info";
};

const getPartStatusLabel = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s === "approved") return "Đã duyệt";
  if (s === "rejected") return "Từ chối";
  return "Chờ hãng";
};

function goBack() {
  router.push({ name: "ServiceWarrantyRequests" }).catch(() => null);
}

// APIs
async function load() {
  loading.value = true;
  try {
    const res = await WarrantyClaimApi.getDetail(claimId);
    if (res) {
      claim.value = res;
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bảo hành:", error);
    ElMessage.error("Không thể tải chi tiết phiếu bảo hành.");
  } finally {
    loading.value = false;
  }
}

// Cập nhật trạng thái
async function handleUpdateStatus(statusNum: number) {
  const labels: Record<number, string> = {
    2: "gửi hãng thẩm định",
    4: "xác nhận thợ đã thay thế xong linh kiện",
    5: "hoàn tất và đóng hồ sơ bảo hành này",
    6: "từ chối bảo hành hồ sơ này",
  };

  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn ${labels[statusNum]}? Hành động này không thể hoàn tác.`,
      "Xác nhận thay đổi trạng thái",
      {
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy bỏ",
        type: statusNum === 6 ? "error" : "warning",
      },
    );

    submitting.value = true;
    await WarrantyClaimApi.updateStatus(claimId, { status: statusNum });
    ElMessage.success("Cập nhật trạng thái thành công!");
    void load();
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Cập nhật trạng thái thất bại.");
    }
  } finally {
    submitting.value = false;
  }
}

// Thẩm định duyệt bồi hoàn từ hãng (đặc thù chuyển status 3 và ghi nhận quyết định hãng)
async function handleApproveClaim() {
  try {
    const { value: decisionText } = await ElMessageBox.prompt(
      "Nhập ý kiến thẩm định / quyết định bồi hoàn từ hãng:",
      "Duyệt bồi hoàn bảo hành từ hãng",
      {
        confirmButtonText: "Xác nhận duyệt",
        cancelButtonText: "Hủy bỏ",
        inputPlaceholder:
          "VD: Hãng Honda Việt Nam đồng ý bồi hoàn 100% linh kiện cụm bơm xăng.",
        inputValidator: (value) => {
          if (!value || value.trim().length === 0) {
            return "Vui lòng nhập quyết định từ hãng.";
          }
          return true;
        },
      },
    );

    submitting.value = true;
    await WarrantyClaimApi.updateStatus(claimId, {
      status: 3, // Approved
      manufacturerDecision: decisionText,
    });
    ElMessage.success("Đã duyệt bồi hoàn bảo hành thành công!");
    void load();
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Duyệt bảo hành thất bại.");
    }
  } finally {
    submitting.value = false;
  }
}

// Kích hoạt thu hồi đặc biệt
async function handleRecall() {
  try {
    await ElMessageBox.confirm(
      "Cảnh báo: Bạn đang kích hoạt quy trình THU HỒI PHƯƠNG TIỆN LỖI (RECALL) và cấp xe mới. Bạn có chắc chắn muốn tiếp tục?",
      "KÍCH HOẠT THU HỒI XE",
      {
        confirmButtonText: "Đồng ý kích hoạt",
        cancelButtonText: "Hủy bỏ",
        type: "error",
      },
    );

    submitting.value = true;
    await WarrantyClaimApi.updateStatus(claimId, {
      status: 5, // Đóng hồ sơ bồi hoàn
      isRecall: true,
      manufacturerDecision: "Hãng phê duyệt triệu hồi xe lỗi và cấp xe mới.",
    });
    ElMessage.success("Đã kích hoạt thu hồi xe lỗi thành công!");
    void load();
  } catch (err) {
    if (err !== "cancel") {
      console.error(err);
      ElMessage.error("Kích hoạt thu hồi xe thất bại.");
    }
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

<style scoped>
.custom-steps :deep(.el-step__title) {
  font-size: 13px;
  font-weight: 600;
}

.custom-steps :deep(.el-step__description) {
  font-size: 11px;
}
</style>
