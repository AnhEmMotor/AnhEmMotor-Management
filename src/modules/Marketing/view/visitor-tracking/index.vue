<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getVisitorTrackingApi } from '@/api/marketing/visitorTracking';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';

interface VisitorRecord {
  customerUserId: string | null;
  visitorKey: string | null;
  productId: number;
  productName: string;
  dwellTimeMs: number;
  viewedAt: string;
  customerName?: string;
  productImageUrl?: string;
  variantId?: number;
  variantName?: string;
  variantColorId?: number;
  variantColorName?: string;
}

import { fetchGetUserById } from '@/api/auth/system-manage.api';
const loadingUser = ref<Record<string, boolean>>({});
const userInfo = ref<Record<string, any>>({});

const loadUserInfo = async (userId: string) => {
  if (userInfo.value[userId]) return;
  loadingUser.value[userId] = true;
  try {
    const res = await fetchGetUserById(userId);
    userInfo.value[userId] = res;
  } catch (error) {
    ElMessage.error('Không thể tải thông tin người dùng.');
  } finally {
    loadingUser.value[userId] = false;
  }
};

const loading = ref(false);
const visitorRecords = ref<VisitorRecord[]>([]);

const guestMap = new Map<string, number>();
let guestCounter = 1;

const getGuestName = (key: string) => {
  if (!guestMap.has(key)) {
    guestMap.set(key, guestCounter++);
  }
  return `Khách vãng lai số ${guestMap.get(key)}`;
};

const fetchRecords = async () => {
  loading.value = true;
  guestMap.clear();
  guestCounter = 1;
  try {
    const response = await getVisitorTrackingApi({ page: 1, pageSize: 100 });
    if (response && (response as any).items) {
      visitorRecords.value = (response as any).items;
    } else if (response) {
      visitorRecords.value = Array.isArray(response) ? response : (response as any).data || [];
    }
  } catch (error) {
    ElMessage.error('Không thể tải dữ liệu truy cập.');
  } finally {
    loading.value = false;
  }
};

const formatSeconds = (ms: number) => {
  return (ms / 1000).toFixed(1) + ' s';
};

onMounted(() => {
  fetchRecords();
});
</script>

<template>
  <div class="resp-page">
    <div class="page-header mb-4 flex justify-between items-center">
      <h2 class="text-lg font-semibold">Theo Dõi Khách Truy Cập</h2>
      <el-button type="primary" @click="fetchRecords">Làm mới</el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="visitorRecords" v-loading="loading" border style="width: 100%">
        <el-table-column label="Thời gian truy cập" width="200">
          <template #default="scope">
            {{ dayjs(scope.row.viewedAt).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
        </el-table-column>

        <el-table-column label="Sản phẩm / Trang">
          <template #default="scope">
            <div class="flex items-center gap-3">
              <el-image
                v-if="scope.row.productImageUrl"
                :src="scope.row.productImageUrl"
                class="w-12 h-12 rounded object-cover shrink-0 border border-gray-100 bg-gray-50"
              />
              <div
                v-else
                class="w-12 h-12 rounded shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400"
              >
                <ArtSvgIcon icon="ri:image-line" class="text-xl" />
              </div>
              <div class="flex flex-col">
                <span class="font-medium text-gray-800">{{ scope.row.productName }}</span>
                <span v-if="scope.row.variantName" class="text-xs text-gray-500 mt-0.5">
                  {{ scope.row.variantName
                  }}<template v-if="scope.row.variantColorName">
                    - {{ scope.row.variantColorName }}</template
                  >
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Người dùng (Guest / Tên)">
          <template #default="scope">
            <el-popover
              v-if="scope.row.customerUserId"
              placement="right"
              width="320"
              trigger="click"
              @show="loadUserInfo(scope.row.customerUserId)"
            >
              <template #reference>
                <span class="text-blue-600 cursor-pointer hover:underline font-medium">
                  {{ scope.row.customerName || 'User: ' + scope.row.customerUserId }}
                </span>
              </template>

              <div
                v-loading="loadingUser[scope.row.customerUserId]"
                class="flex flex-col gap-3 min-h-[80px]"
              >
                <template v-if="userInfo[scope.row.customerUserId]">
                  <div class="flex items-center gap-4 border-b border-gray-100 pb-3">
                    <el-avatar
                      :src="userInfo[scope.row.customerUserId].avatarUrl || ''"
                      :size="56"
                      class="shadow-sm shrink-0"
                    >
                      <span class="text-lg font-bold">{{
                        userInfo[scope.row.customerUserId].fullName?.charAt(0) || 'U'
                      }}</span>
                    </el-avatar>
                    <div class="flex flex-col overflow-hidden">
                      <div class="font-bold text-gray-800 text-base truncate">
                        {{ userInfo[scope.row.customerUserId].fullName }}
                      </div>
                      <div
                        class="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded mt-1 truncate max-w-full"
                      >
                        {{ userInfo[scope.row.customerUserId].email || 'Chưa cập nhật Email' }}
                      </div>
                    </div>
                  </div>
                  <div class="text-sm grid grid-cols-2 gap-y-2 mt-1">
                    <div class="text-gray-500">SĐT:</div>
                    <div class="font-medium text-right">
                      {{ userInfo[scope.row.customerUserId].phoneNumber || 'Chưa cập nhật' }}
                    </div>

                    <div class="text-gray-500">Giới tính:</div>
                    <div class="font-medium text-right">
                      {{
                        userInfo[scope.row.customerUserId].gender === 'Male'
                          ? 'Nam'
                          : userInfo[scope.row.customerUserId].gender === 'Female'
                            ? 'Nữ'
                            : 'Khác'
                      }}
                    </div>
                  </div>
                </template>
                <template v-else-if="!loadingUser[scope.row.customerUserId]">
                  <div class="text-gray-400 text-sm italic text-center py-4">
                    Không thể tải thông tin.
                  </div>
                </template>
              </div>
            </el-popover>

            <span v-else class="text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-medium">{{
              getGuestName(scope.row.visitorKey)
            }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Đã xem (giây)" width="150" align="right">
          <template #default="scope">
            {{ formatSeconds(scope.row.dwellTimeMs) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.resp-page {
  padding: 20px;
}
</style>
