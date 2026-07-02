<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div
      class="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <el-icon class="text-primary"><ChatDotRound /></el-icon>
          {{ $t("menus.service.warrantyAndComplaints.complaints") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý danh sách khiếu nại và phản hồi của khách hàng.
        </p>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <el-form
        :inline="true"
        :model="filters"
        class="flex flex-wrap gap-4 items-center"
      >
        <el-form-item label="Tìm kiếm" class="mb-0">
          <el-input
            v-model="filters.search"
            placeholder="Tên khách hàng, biển số, nội dung..."
            clearable
            :prefix-icon="Search"
            class="w-72"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="Trạng thái" class="mb-0">
          <el-select
            v-model="filters.status"
            placeholder="Tất cả trạng thái"
            clearable
            class="w-56"
            @change="handleSearch"
          >
            <el-option label="Mới tiếp nhận" :value="1" />
            <el-option label="Đang xử lý" :value="2" />
            <el-option label="Đã giải quyết" :value="3" />
            <el-option label="Đã đóng" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item class="mb-0">
          <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
          <el-button @click="resetFilters">Làm mới</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table List -->
    <div
      class="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        header-cell-class-name="bg-slate-50 text-slate-700 font-semibold"
      >
        <el-table-column
          prop="complaintNumber"
          label="Mã Khiếu Nại"
          min-width="150"
        >
          <template #default="{ row }">
            <span
              class="font-mono font-semibold text-primary cursor-pointer hover:underline"
            >
              {{ row.complaintNumber }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="Khách Hàng" min-width="160">
          <template #default="{ row }">
            <div class="font-medium text-slate-800">
              {{ row.customerName || "N/A" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="customerPhone"
          label="Số Điện Thoại"
          min-width="130"
        />
        <el-table-column prop="vehiclePlate" label="Biển Số Xe" min-width="130">
          <template #default="{ row }">
            <el-tag
              effect="plain"
              class="font-bold border-slate-300 text-slate-700"
            >
              {{ row.vehiclePlate || "N/A" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="complaintType"
          label="Loại Khiếu Nại"
          min-width="150"
        />
        <el-table-column prop="createdAt" label="Ngày Tạo" min-width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="statusText" label="Trạng Thái" min-width="150">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.statusText)"
              effect="dark"
              class="capitalize"
            >
              {{ getStatusLabel(row.statusText) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Hành động"
          min-width="120"
          fixed="right"
          align="center"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              plain
              @click="openDetail(row.id)"
              v-auth="Permissions.Factory.CustomerManagement.View"
            >
              Xem chi tiết
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="flex justify-end p-4 border-t border-slate-100">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Permissions } from "@/domain/constants/permissions";
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { Search, View, ChatDotRound } from "@element-plus/icons-vue";
import { ComplaintApi } from "@/api/service/complaint.api";
import dayjs from "dayjs";

const router = useRouter();

// Filters & State
const loading = ref(false);
const filters = reactive({
  search: "",
  status: "" as any,
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

type ComplaintRow = {
  id: number;
  complaintNumber: string;
  customerName?: string;
  customerPhone?: string;
  vehiclePlate?: string;
  complaintType?: string;
  statusText: string;
  createdAt: string;
};

const tableData = ref<ComplaintRow[]>([]);

const formatDate = (val: string) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY HH:mm");
};

const getStatusTagType = (status: string) => {
  const s = status ? status.toLowerCase() : "";
  if (s.includes("đã giải quyết") || s.includes("resolved")) return "success";
  if (s.includes("đang xử lý") || s.includes("processing")) return "warning";
  if (s.includes("đã đóng") || s.includes("closed")) return "info";
  return "danger";
};

const getStatusLabel = (status: string) => {
  return status || "N/A";
};

async function loadData() {
  loading.value = true;
  try {
    const sieveFilters: string[] = [];
    if (filters.search) {
      sieveFilters.push(`search==${filters.search}`);
    }
    if (filters.status) {
      sieveFilters.push(`status==${filters.status}`);
    }

    const res = await ComplaintApi.getList({
      current: pagination.current,
      size: pagination.size,
      filters: sieveFilters.join(","),
    });

    if (res && res.items) {
      tableData.value = res.items;
      pagination.total = res.totalCount;
    } else {
      tableData.value = [];
      pagination.total = 0;
    }
  } catch (error: any) {
    console.error("Lỗi khi tải danh sách khiếu nại:", error);
    ElMessage.error("Không thể tải danh sách khiếu nại.");
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pagination.current = 1;
  void loadData();
}

function resetFilters() {
  filters.search = "";
  filters.status = "";
  handleSearch();
}

function handleSizeChange(size: number) {
  pagination.size = size;
  handleSearch();
}

function handleCurrentChange(page: number) {
  pagination.current = page;
  void loadData();
}

function openDetail(id: number) {
  router
    .push({ name: "ServiceComplaintDetail", params: { id } })
    .catch(() => null);
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped></style>
