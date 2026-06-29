<template>
  <div class="customer-asset-page">
    <header class="page-header">
      <div>
        <h2>
          <ArtSvgIcon icon="ri:motorbike-line" />
          Tài sản khách hàng
        </h2>
        <p>Danh sách xe thật được gắn với Lead trong hệ thống</p>
      </div>
      <ElButton type="primary" @click="loadAssets">
        <ArtSvgIcon icon="ri:refresh-line" />
        Tai lai
      </ElButton>
    </header>

    <section class="filter-row">
      <ElInput
        v-model="filters.keyword"
        clearable
        placeholder="Tìm biển số, số khung, số máy"
        @keyup.enter="handleSearch"
      />
      <ElInputNumber
        v-model="filters.leadId"
        :min="1"
        :controls="false"
        placeholder="Lead ID"
      />
      <ElButton type="primary" @click="handleSearch">
        <ArtSvgIcon icon="ri:search-line" />
        Tìm kiếm
      </ElButton>
      <ElButton @click="handleReset">Đặt lại</ElButton>
    </section>

    <section class="asset-layout">
      <ElTable
        v-loading="loading"
        :data="filteredAssets"
        border
        class="asset-table"
        highlight-current-row
        @row-click="selectAsset"
      >
        <ElTableColumn prop="licensePlate" label="Biển số" min-width="120">
          <template #default="{ row }">
            {{ row.licensePlate || "Chưa cấp" }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="fullName" label="Khách hàng" min-width="160" />
        <ElTableColumn prop="phoneNumber" label="Điện thoại" min-width="130" />
        <ElTableColumn prop="vinNumber" label="Số khung" min-width="170" />
        <ElTableColumn prop="engineNumber" label="Số máy" min-width="170" />
        <ElTableColumn prop="purchaseDate" label="Ngày mua" min-width="130">
          <template #default="{ row }">{{
            formatDate(row.purchaseDate)
          }}</template>
        </ElTableColumn>
        <ElTableColumn prop="isActive" label="Trạng thái" min-width="110">
          <template #default="{ row }">
            <ElTag :type="row.isActive ? 'success' : 'info'" effect="plain">
              {{ row.isActive ? "Đang hoạt động" : "Ngưng" }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Hồ sơ" width="110" fixed="right">
          <template #default="{ row }">
            <ElButton
              v-if="row.leadId"
              type="primary"
              link
              @click.stop="openProfile(row.leadId)"
            >
              360
            </ElButton>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
      </ElTable>

      <aside class="asset-detail">
        <ElEmpty
          v-if="!selectedAsset"
          description="Chọn một xe để xem chi tiết"
        />
        <template v-else>
          <h3>{{ selectedAsset.licensePlate || "Chưa cấp biển số" }}</h3>
          <dl>
            <div>
              <dt>Khách hàng</dt>
              <dd>{{ selectedAsset.fullName || "-" }}</dd>
            </div>
            <div>
              <dt>Điện thoại</dt>
              <dd>{{ selectedAsset.phoneNumber || "-" }}</dd>
            </div>
            <div>
              <dt>Lead ID</dt>
              <dd>{{ selectedAsset.leadId || "-" }}</dd>
            </div>
            <div>
              <dt>Số khung</dt>
              <dd>{{ selectedAsset.vinNumber || "-" }}</dd>
            </div>
            <div>
              <dt>Số máy</dt>
              <dd>{{ selectedAsset.engineNumber || "-" }}</dd>
            </div>
            <div>
              <dt>Ngày mua</dt>
              <dd>{{ formatDate(selectedAsset.purchaseDate) }}</dd>
            </div>
          </dl>
          <ElButton
            v-if="selectedAsset.leadId"
            type="primary"
            class="w-full"
            @click="openProfile(selectedAsset.leadId)"
          >
            Mở hồ sơ khách hàng
          </ElButton>
        </template>
      </aside>
    </section>

    <footer class="pagination-row">
      <ElPagination
        background
        layout="sizes, prev, pager, next, total"
        :current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { VehicleApi, type Vehicle } from "@/api/vehicle";

defineOptions({ name: "CustomerAsset" });

const router = useRouter();
const loading = ref(false);
const assets = ref<Vehicle[]>([]);
const selectedAsset = ref<Vehicle | null>(null);
const filters = reactive<{ keyword: string; leadId?: number }>({
  keyword: "",
  leadId: undefined,
});
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

const filteredAssets = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  if (!keyword) return assets.value;
  return assets.value.filter((asset) =>
    [asset.licensePlate, asset.vinNumber, asset.engineNumber]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword)),
  );
});

const loadAssets = async () => {
  loading.value = true;
  try {
    const res = await VehicleApi.getList({
      current: pagination.current,
      size: pagination.size,
      Filters: filters.leadId ? `LeadId==${filters.leadId}` : undefined,
    });
    assets.value = res.items ?? [];
    pagination.total = res.totalCount ?? assets.value.length;
    selectedAsset.value = assets.value[0] ?? null;
  } catch (error: any) {
    ElMessage.error(error?.message || "Không thể tải danh sách tài sản");
  } finally {
    loading.value = false;
  }
};

const selectAsset = (asset: Vehicle) => {
  selectedAsset.value = asset;
};

const handleSearch = () => {
  pagination.current = 1;
  loadAssets();
};

const handleReset = () => {
  filters.keyword = "";
  filters.leadId = undefined;
  pagination.current = 1;
  loadAssets();
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  loadAssets();
};

const handleCurrentChange = (current: number) => {
  pagination.current = current;
  loadAssets();
};

const openProfile = (leadId: number) => {
  router.push(`/Marketing/customer/profile/${leadId}`);
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return dayjs(value).format("DD/MM/YYYY");
};

onMounted(loadAssets);
</script>

<style scoped lang="scss">
.customer-asset-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.page-header,
.filter-row,
.asset-detail {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
}

.page-header h2 {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.page-header p {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
}

.filter-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) 160px auto auto;
  gap: 10px;
  padding: 12px;
}

.asset-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;
  align-items: start;
}

.asset-detail {
  position: sticky;
  top: 12px;
  padding: 16px;
}

.asset-detail h3 {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 800;
}

.asset-detail dl {
  display: grid;
  gap: 10px;
  margin: 0 0 16px;
}

.asset-detail dt {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.asset-detail dd {
  margin: 2px 0 0;
  font-weight: 700;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
}

@media (width <= 900px) {
  .filter-row,
  .asset-layout {
    grid-template-columns: 1fr;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .asset-detail {
    position: static;
  }
}
</style>
