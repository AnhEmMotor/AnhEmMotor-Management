<template>
  <main class="repair-history-detail reporting-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="header-main">
          <button
            class="back-button"
            type="button"
            aria-label="Quay lại lịch sử sửa chữa"
            @click="goBack"
          >
            <ArtSvgIcon icon="ri:arrow-left-line" />
          </button>
          <div class="header-copy">
            <p class="eyebrow">Dịch vụ xưởng / Lịch sử sửa chữa</p>
            <h1>Chi tiết lịch sử sửa chữa</h1>
            <p>Theo dõi đầy đủ thông tin xe, nội dung tiếp nhận và chi phí đã ghi nhận.</p>
          </div>
        </div>

      </header>

      <section v-if="loading" class="loading-layout" aria-label="Đang tải hồ sơ sửa chữa">
        <div class="skeleton skeleton-hero"></div>
        <div class="kpi-grid">
          <div v-for="item in 4" :key="item" class="skeleton skeleton-kpi"></div>
        </div>
        <div class="content-grid">
          <div class="skeleton skeleton-panel"></div>
          <div class="skeleton skeleton-panel"></div>
        </div>
      </section>

      <section v-else-if="loadError" class="state-card error-state" role="alert">
        <span class="state-icon"><ArtSvgIcon icon="ri:error-warning-line" /></span>
        <div>
          <h2>Không thể tải hồ sơ sửa chữa</h2>
          <p>{{ loadError }}</p>
        </div>
        <button type="button" @click="loadOrderDetail">Thử lại</button>
      </section>

      <article v-else-if="order" id="repair-history-print-area" class="record-layout">
        <section class="record-hero">
          <div class="hero-icon" aria-hidden="true">
            <ArtSvgIcon icon="ri:tools-fill" />
          </div>
          <div class="hero-copy">
            <div class="hero-labels">
              <span class="record-label">Hồ sơ đã ghi nhận</span>
              <span v-if="order.serviceType" class="service-label">{{ serviceTypeText }}</span>
            </div>
            <h2>{{ recordNumber }}</h2>
            <p>
              {{ order.vehicleInfo || 'Chưa cập nhật thông tin nhận diện xe' }}
              <span aria-hidden="true">•</span>
              Tiếp nhận {{ formatDate(order.maintenanceDate || order.createdAt) }}
            </p>
          </div>
          <div class="hero-total">
            <span>Tổng chi phí</span>
            <strong>{{ formatCurrency(order.totalCost) }}</strong>
          </div>
        </section>

        <section class="kpi-grid" aria-label="Tổng quan hồ sơ sửa chữa">
          <div class="kpi-card">
            <span class="kpi-icon"><ArtSvgIcon icon="ri:calendar-check-line" /></span>
            <div>
              <p>Ngày sửa chữa</p>
              <strong>{{ formatDate(order.maintenanceDate, false) }}</strong>
              <small>{{ formatTime(order.maintenanceDate) }}</small>
            </div>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon"><ArtSvgIcon icon="ri:speed-up-line" /></span>
            <div>
              <p>Odo tiếp nhận</p>
              <strong>{{ formatDistance(order.mileage) }}</strong>
              <small>Số km lúc xe vào xưởng</small>
            </div>
          </div>
          <div class="kpi-card">
            <span class="kpi-icon"><ArtSvgIcon icon="ri:user-settings-line" /></span>
            <div>
              <p>Kỹ thuật viên</p>
              <strong :title="order.technicianName || 'Chưa phân công'">
                {{ order.technicianName || 'Chưa phân công' }}
              </strong>
              <small>Người phụ trách hồ sơ</small>
            </div>
          </div>
          <div class="kpi-card kpi-card-accent">
            <span class="kpi-icon"><ArtSvgIcon icon="ri:money-dollar-circle-line" /></span>
            <div>
              <p>Giá trị hồ sơ</p>
              <strong>{{ formatCurrency(order.totalCost) }}</strong>
              <small>Phụ tùng và tiền công</small>
            </div>
          </div>
        </section>

        <div class="content-grid">
          <div class="primary-column">
            <section class="record-card repair-summary-card">
              <div class="section-heading">
                <span class="section-icon"><ArtSvgIcon icon="ri:file-list-3-line" /></span>
                <div>
                  <p>Nội dung tiếp nhận</p>
                  <h3>Triệu chứng và yêu cầu sửa chữa</h3>
                </div>
              </div>

              <blockquote v-if="order.description" class="repair-description">
                {{ order.description }}
              </blockquote>
              <div v-else class="inline-empty">
                <ArtSvgIcon icon="ri:inbox-2-line" />
                <span>Hồ sơ chưa có mô tả triệu chứng hoặc yêu cầu sửa chữa.</span>
              </div>

              <div class="record-meta">
                <div>
                  <span>Loại dịch vụ</span>
                  <strong>{{ serviceTypeText }}</strong>
                </div>
                <div>
                  <span>Mã xe</span>
                  <strong>#{{ order.vehicleId }}</strong>
                </div>
                <div>
                  <span>Cập nhật gần nhất</span>
                  <strong>{{ formatDate(order.updatedAt || order.createdAt) }}</strong>
                </div>
              </div>
            </section>

            <section class="record-card cost-card">
              <div class="section-heading section-heading-between">
                <div class="section-heading-copy">
                  <span class="section-icon"><ArtSvgIcon icon="ri:receipt-line" /></span>
                  <div>
                    <p>Chi phí đã ghi nhận</p>
                    <h3>Tổng hợp giá trị sửa chữa</h3>
                  </div>
                </div>
                <span class="cost-status">Dữ liệu thực tế</span>
              </div>

              <div class="cost-breakdown">
                <div class="cost-row">
                  <div class="cost-name">
                    <span class="cost-dot parts-dot"></span>
                    <div>
                      <strong>Phụ tùng và vật tư</strong>
                      <small>Giá trị linh kiện thay thế đã ghi nhận</small>
                    </div>
                  </div>
                  <strong class="cost-value">{{ formatCurrency(order.partsCost) }}</strong>
                </div>
                <div class="cost-row">
                  <div class="cost-name">
                    <span class="cost-dot labor-dot"></span>
                    <div>
                      <strong>Tiền công kỹ thuật</strong>
                      <small>Chi phí thực hiện dịch vụ và sửa chữa</small>
                    </div>
                  </div>
                  <strong class="cost-value">{{ formatCurrency(order.laborCost) }}</strong>
                </div>
                <div class="cost-row cost-total-row">
                  <div class="cost-name">
                    <span class="cost-dot total-dot"></span>
                    <div>
                      <strong>Tổng cộng</strong>
                      <small>Tổng giá trị của hồ sơ sửa chữa</small>
                    </div>
                  </div>
                  <strong class="cost-value">{{ formatCurrency(order.totalCost) }}</strong>
                </div>
              </div>
            </section>
          </div>

          <aside class="secondary-column">
            <section class="record-card identity-card">
              <div class="section-heading">
                <span class="section-icon"><ArtSvgIcon icon="ri:motorbike-line" /></span>
                <div>
                  <p>Chủ xe và phương tiện</p>
                  <h3>Thông tin tiếp nhận</h3>
                </div>
              </div>

              <dl class="info-list">
                <div>
                  <dt>Khách hàng</dt>
                  <dd>{{ order.customerName || 'Chưa cập nhật' }}</dd>
                </div>
                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{{ order.customerPhone || 'Chưa cập nhật' }}</dd>
                </div>
                <div v-if="order.vehicle?.imageUrl || order.vehicle?.image">
                  <dt>Hình ảnh xe</dt>
                  <dd>
                    <el-image
                      style="width: 80px; height: 80px; border-radius: 6px"
                      :src="order.vehicle?.imageUrl || order.vehicle?.image"
                      :preview-src-list="[order.vehicle?.imageUrl || order.vehicle?.image]"
                      fit="cover"
                    >
                      <template #error>
                        <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                          <ArtSvgIcon icon="ri:image-line" />
                        </div>
                      </template>
                    </el-image>
                  </dd>
                </div>
                <div>
                  <dt>Thông tin xe</dt>
                  <dd class="mono-value">{{ order.vehicleInfo || 'Chưa cập nhật' }}</dd>
                </div>
                <div>
                  <dt>Phiên bản</dt>
                  <dd>{{ order.vehicle?.versionName || order.vehicle?.version || 'Chưa cập nhật' }}</dd>
                </div>
                <div>
                  <dt>Màu sắc</dt>
                  <dd>{{ order.vehicle?.colorName || order.vehicle?.color || 'Chưa cập nhật' }}</dd>
                </div>
                <div>
                  <dt>Loại xe</dt>
                  <dd>{{ order.vehicle?.categoryName || order.vehicle?.category || order.vehicle?.type || 'Chưa cập nhật' }}</dd>
                </div>
                <div>
                  <dt>Mã phương tiện</dt>
                  <dd class="mono-value">VEH-{{ String(order.vehicleId).padStart(5, '0') }}</dd>
                </div>
              </dl>
            </section>

            <section class="record-card follow-up-card">
              <div class="section-heading">
                <span class="section-icon"><ArtSvgIcon icon="ri:calendar-schedule-line" /></span>
                <div>
                  <p>Chăm sóc sau sửa chữa</p>
                  <h3>Lịch bảo dưỡng tiếp theo</h3>
                </div>
              </div>

              <div
                v-if="order.nextMaintenanceDate || order.nextMaintenanceOdo"
                class="follow-up-grid"
              >
                <div>
                  <span>Dự kiến theo ngày</span>
                  <strong>{{ formatDate(order.nextMaintenanceDate, false) }}</strong>
                </div>
                <div>
                  <span>Mốc odo kế tiếp</span>
                  <strong>{{ formatDistance(order.nextMaintenanceOdo) }}</strong>
                </div>
              </div>
              <div v-else class="inline-empty compact-empty">
                <ArtSvgIcon icon="ri:calendar-close-line" />
                <span>Chưa thiết lập lịch bảo dưỡng kế tiếp.</span>
              </div>
            </section>

            <section class="record-card audit-card">
              <div class="audit-row">
                <span>Tạo hồ sơ</span>
                <strong>{{ formatDate(order.createdAt) }}</strong>
              </div>
              <div class="audit-row">
                <span>Cập nhật</span>
                <strong>{{ formatDate(order.updatedAt) }}</strong>
              </div>
            </section>
          </aside>
        </div>
      </article>

      <section v-else class="state-card empty-state">
        <span class="state-icon"><ArtSvgIcon icon="ri:file-search-line" /></span>
        <div>
          <h2>Không tìm thấy hồ sơ</h2>
          <p>Hồ sơ sửa chữa này không tồn tại hoặc đã được gỡ khỏi hệ thống.</p>
        </div>
        <button type="button" @click="goBack">Quay lại danh sách</button>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RepairOrderApi, type RepairOrder } from '@/api/sales';

defineOptions({ name: 'WorkshopRepairHistoryDetail' });

const props = defineProps<{
  orderId: number;
  backPath: string;
}>();

const router = useRouter();
const loading = ref(true);
const loadError = ref('');
const order = ref<RepairOrder | null>(null);

const recordNumber = computed(() => {
  if (order.value?.maintenanceNumber) return order.value.maintenanceNumber;
  return `RO-${String(props.orderId).padStart(5, '0')}`;
});

const serviceTypeText = computed(() => {
  const labels: Record<string, string> = {
    Maintenance: 'Bảo dưỡng định kỳ',
    Repair: 'Sửa chữa',
    Warranty: 'Bảo hành',
    Inspection: 'Kiểm tra kỹ thuật',
  };
  const value = order.value?.serviceType;
  return value ? labels[value] || value : 'Chưa phân loại';
});

const resolveErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return 'Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.';
};

const loadOrderDetail = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    order.value = await RepairOrderApi.getDetail(props.orderId);
  } catch (error: unknown) {
    order.value = null;
    loadError.value = resolveErrorMessage(error);
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push(props.backPath);
};


const formatCurrency = (value?: number | null) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const formatDistance = (value?: number | null) => {
  if (value === undefined || value === null) return 'Chưa cập nhật';
  return `${new Intl.NumberFormat('vi-VN').format(value)} km`;
};

const formatDate = (value?: string | null, includeTime = true) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

const formatTime = (value?: string | null) => {
  if (!value) return 'Chưa cập nhật thời gian';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa cập nhật thời gian';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

onMounted(loadOrderDetail);
</script>

<style scoped lang="scss">
.repair-history-detail {
  --report-red: #e84a4a;
  --report-red-soft: color-mix(in srgb, var(--report-red) 10%, var(--el-bg-color));

  min-height: 100%;
  padding: 20px;

}

.page-shell {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.page-header,
.header-main,
.hero-labels,
.section-heading,
.section-heading-copy,
.cost-name,
.audit-row {
  display: flex;
  align-items: center;
}

.page-header {
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.header-main {
  min-width: 0;
  gap: 14px;
}

.back-button,
.print-button,
.state-card button {
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
}

.back-button {
  display: grid;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  padding: 0;
  place-items: center;
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
}

.back-button:hover,
.print-button:hover,
.state-card button:hover {
  border-color: color-mix(in srgb, var(--report-red) 45%, var(--el-border-color));
  background: var(--report-red-soft);
}

.back-button:active,
.print-button:active,
.state-card button:active {
  transform: translateY(1px) scale(0.98);
}

.back-button:focus-visible,
.print-button:focus-visible,
.state-card button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--report-red) 28%, transparent);
  outline-offset: 2px;
}

.header-copy {
  min-width: 0;
}

.eyebrow,
.section-heading p,
.kpi-card p,
.hero-total span,
.record-meta span,
.follow-up-grid span {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-copy h1 {
  margin: 3px 0 0;
  font-size: clamp(20px, 2vw, 28px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -0.035em;
}

.header-copy > p:last-child {
  margin: 5px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.print-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 15px;
  gap: 8px;
  border-radius: 11px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.record-layout,
.loading-layout,
.primary-column,
.secondary-column {
  display: grid;
  gap: 16px;
}

.record-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  min-height: 138px;
  padding: 22px 24px;
  gap: 18px;
  overflow: hidden;
  position: relative;
  border: 1px solid color-mix(in srgb, var(--report-red) 18%, var(--el-border-color-lighter));
  border-radius: 20px;
  background: linear-gradient(120deg, var(--report-red-soft), transparent 58%), var(--el-bg-color);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--el-text-color-primary) 7%, transparent);
}

.record-hero::after {
  width: 180px;
  height: 180px;
  position: absolute;
  right: -68px;
  bottom: -108px;
  border: 30px solid color-mix(in srgb, var(--report-red) 8%, transparent);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.hero-icon,
.section-icon,
.kpi-icon,
.state-icon {
  display: grid;
  place-items: center;
  color: var(--report-red);
  background: var(--report-red-soft);
}

.hero-icon {
  width: 54px;
  height: 54px;
  border: 1px solid color-mix(in srgb, var(--report-red) 18%, transparent);
  border-radius: 16px;
  font-size: 25px;
}

.hero-copy {
  min-width: 0;
}

.hero-labels {
  gap: 8px;
}

.record-label,
.service-label,
.cost-status {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.record-label {
  color: var(--report-red);
  background: var(--report-red-soft);
}

.service-label,
.cost-status {
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.hero-copy h2 {
  margin: 8px 0 0;
  overflow: hidden;
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.045em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-copy > p {
  display: flex;
  flex-wrap: wrap;
  margin: 9px 0 0;
  gap: 7px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.hero-total {
  min-width: 190px;
  padding-left: 22px;
  position: relative;
  z-index: 1;
  border-left: 1px solid var(--el-border-color-lighter);
  text-align: right;
}

.hero-total strong {
  display: block;
  margin-top: 7px;
  color: var(--report-red);
  font-size: clamp(20px, 2vw, 28px);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.kpi-card,
.record-card,
.state-card {
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--el-text-color-primary) 5%, transparent);
}

.kpi-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: 112px;
  padding: 17px;
  gap: 13px;
  border-radius: 15px;
}

.kpi-card-accent {
  border-color: color-mix(in srgb, var(--report-red) 20%, var(--el-border-color-lighter));
  background: linear-gradient(145deg, var(--report-red-soft), var(--el-bg-color) 74%);
}

.kpi-icon,
.section-icon {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 17px;
}

.kpi-card strong {
  display: block;
  margin-top: 8px;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 15px;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-card small {
  display: block;
  margin-top: 5px;
  overflow: hidden;
  color: var(--el-text-color-placeholder);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(310px, 0.85fr);
  align-items: start;
  gap: 16px;
}

.record-card {
  padding: 20px;
  border-radius: 17px;
}

.section-heading,
.section-heading-copy {
  min-width: 0;
  gap: 12px;
}

.section-heading-between {
  justify-content: space-between;
  gap: 16px;
}

.section-heading h3 {
  margin: 3px 0 0;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.02em;
}

.repair-description {
  margin: 18px 0 0;
  padding: 18px 20px;
  position: relative;
  border: 0;
  border-left: 3px solid var(--report-red);
  border-radius: 0 12px 12px 0;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  font-size: 14px;
  font-style: normal;
  line-height: 1.7;
  text-wrap: pretty;
}

.inline-empty {
  display: flex;
  align-items: center;
  min-height: 76px;
  margin-top: 18px;
  padding: 16px;
  gap: 10px;
  border: 1px dashed var(--el-border-color);
  border-radius: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  font-size: 12px;
}

.record-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.record-meta > div {
  min-width: 0;
  padding: 16px 14px 0 0;
}

.record-meta > div + div {
  padding-left: 14px;
  border-left: 1px solid var(--el-border-color-lighter);
}

.record-meta strong {
  display: block;
  margin-top: 6px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cost-breakdown {
  margin-top: 17px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.cost-row {
  justify-content: space-between;
  min-width: 0;
  padding: 14px 0;
  gap: 18px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-wrap: nowrap;
}

.cost-name {
  min-width: 0;
  gap: 11px;
}

.cost-name > div {
  min-width: 0;
}

.cost-name strong,
.cost-name small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cost-name strong {
  font-size: 12px;
}

.cost-name small {
  margin-top: 3px;
  color: var(--el-text-color-secondary);
  font-size: 10px;
}

.cost-dot {
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.parts-dot {
  background: var(--report-red);
}

.labor-dot {
  background: var(--el-color-warning);
}

.total-dot {
  background: var(--el-text-color-primary);
}

.cost-value {
  flex: 0 0 auto;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.cost-total-row {
  padding: 12px 0;
  border-bottom: 0;
}

.cost-total-row .cost-value {
  color: var(--report-red);
  font-size: 18px;
}

.info-list {
  margin: 17px 0 0;
}

.info-list > div {
  display: grid;
  grid-template-columns: minmax(92px, 0.75fr) minmax(0, 1.25fr);
  padding: 12px 0;
  gap: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-list > div:last-child {
  border-bottom: 0;
}

.info-list dt {
  color: var(--el-text-color-secondary);
  font-size: 11px;
}

.info-list dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 12px;
  font-weight: 700;
  text-align: right;
}

.mono-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-variant-numeric: tabular-nums;
}

.follow-up-card {
  border-color: color-mix(in srgb, var(--report-red) 17%, var(--el-border-color-lighter));
  background: linear-gradient(145deg, var(--report-red-soft), var(--el-bg-color) 78%);
}

.follow-up-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 17px;
  gap: 10px;
}

.follow-up-grid > div {
  min-width: 0;
  padding: 13px;
  border: 1px solid color-mix(in srgb, var(--report-red) 12%, var(--el-border-color-lighter));
  border-radius: 11px;
  background: color-mix(in srgb, var(--el-bg-color) 84%, transparent);
}

.follow-up-grid strong {
  display: block;
  margin-top: 7px;
  overflow: hidden;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compact-empty {
  min-height: 60px;
  margin-top: 14px;
}

.audit-card {
  padding-top: 10px;
  padding-bottom: 10px;
}

.audit-row {
  justify-content: space-between;
  padding: 10px 0;
  gap: 16px;
  color: var(--el-text-color-secondary);
  font-size: 10px;
}

.audit-row + .audit-row {
  border-top: 1px solid var(--el-border-color-lighter);
}

.audit-row strong {
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.state-card {
  display: flex;
  align-items: center;
  min-height: 180px;
  padding: 24px;
  gap: 16px;
  border-radius: 18px;
}

.state-icon {
  flex: 0 0 auto;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  font-size: 22px;
}

.state-card > div {
  min-width: 0;
  flex: 1;
}

.state-card h2 {
  margin: 0;
  font-size: 16px;
}

.state-card p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.state-card button {
  min-height: 38px;
  padding: 0 15px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.skeleton {
  overflow: hidden;
  position: relative;
  border-radius: 16px;
  background: var(--el-fill-color);
}

.skeleton::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, var(--el-fill-color-light), transparent);
  content: '';
  transform: translateX(-100%);
  animation: skeleton-sweep 1.4s infinite;
}

.skeleton-hero {
  height: 138px;
}

.skeleton-kpi {
  height: 112px;
}

.skeleton-panel {
  height: 320px;
}

@keyframes skeleton-sweep {
  to {
    transform: translateX(100%);
  }
}

@media (width <= 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .secondary-column {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .audit-card {
    grid-column: 1 / -1;
  }
}

@media (width <= 640px) {
  .repair-history-detail {
    padding: 12px;
  }

  .page-header {
    align-items: flex-end;
  }

  .header-copy > p:last-child {
    display: none;
  }

  .print-button {
    width: 40px;
    padding: 0;
  }

  .print-button span {
    display: none;
  }

  .record-hero {
    grid-template-columns: auto minmax(0, 1fr);
    min-height: 0;
    padding: 18px;
  }

  .hero-icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    font-size: 21px;
  }

  .hero-total {
    grid-column: 1 / -1;
    min-width: 0;
    padding: 14px 0 0;
    border-top: 1px solid var(--el-border-color-lighter);
    border-left: 0;
    text-align: left;
  }

  .kpi-grid,
  .secondary-column,
  .record-meta,
  .follow-up-grid {
    grid-template-columns: 1fr;
  }

  .kpi-card {
    min-height: 92px;
  }

  .record-card {
    padding: 16px;
  }

  .record-meta > div,
  .record-meta > div + div {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    border-left: 0;
  }

  .record-meta > div:last-child {
    border-bottom: 0;
  }

  .section-heading-between {
    align-items: flex-start;
  }

  .cost-status {
    display: none;
  }

  .cost-name small {
    max-width: 180px;
  }

  .state-card {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .back-button,
  .print-button,
  .state-card button,
  .skeleton::after {
    transition: none;
    animation: none;
  }
}

@media print {
  .repair-history-detail {
    padding: 0;
    background: white;
  }

  .page-header {
    display: none;
  }

  .record-layout {
    gap: 10px;
  }

  .record-hero,
  .kpi-card,
  .record-card {
    color: #111;
    border: 1px solid #ddd;
    background: white;
    box-shadow: none;
    break-inside: avoid;
  }

  .content-grid {
    grid-template-columns: 1.65fr 0.85fr;
  }
}
</style>
