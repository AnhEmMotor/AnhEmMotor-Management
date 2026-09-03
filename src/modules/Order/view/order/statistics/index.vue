<template>
  <div class="resp-page order-statistics-page flex flex-col gap-4 pb-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2
          class="m-0 text-xl font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--el-text-color-primary)]"
        >
          <ArtSvgIcon icon="ri:bar-chart-box-line" class="text-primary text-2xl" />
          Trung Tâm Điều Phối & Thống Kê Đơn Hàng
        </h2>
        <p class="text-xs text-[var(--el-text-color-secondary)] mt-1 mb-0">
          Giám sát thời gian thực số lượng đơn, doanh thu, hàng đợi SLA và các đơn hàng ngoại lệ
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <div
          class="flex items-center bg-[var(--el-fill-color-light)] px-3 py-1.5 rounded-lg border border-[var(--el-border-color-light)] text-xs text-[var(--el-text-color-regular)] gap-2"
        >
          <span class="flex items-center gap-1 font-medium">
            <ArtSvgIcon icon="ri:time-line" />
            Tự động làm mới:
          </span>
          <ElSelect
            v-model="refreshIntervalSetting"
            size="small"
            class="!w-24"
            @change="handleRefreshIntervalChange"
          >
            <ElOption :value="15" label="15 giây" />
            <ElOption :value="30" label="30 giây" />
            <ElOption :value="60" label="60 giây" />
            <ElOption :value="0" label="Tắt" />
          </ElSelect>
          <span v-if="refreshIntervalSetting > 0" class="text-primary font-bold w-6 text-center">
            {{ countdownTimer }}s
          </span>
        </div>

        <ElButton type="primary" plain :loading="loadingStats" @click="handleManualRefresh">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
          Làm mới
        </ElButton>
      </div>
    </div>

    <ElCard class="art-table-card !border-[var(--el-border-color-lighter)] shadow-sm">
      <div class="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold text-[var(--el-text-color-secondary)] uppercase"
            >Khoảng thời gian:</span
          >
          <ElRadioGroup v-model="timePreset" size="small" @change="handleTimePresetChange">
            <ElRadioButton label="today">Hôm nay</ElRadioButton>
            <ElRadioButton label="last7days">7 ngày qua</ElRadioButton>
            <ElRadioButton label="last30days">30 ngày qua</ElRadioButton>
            <ElRadioButton label="thisMonth">Tháng này</ElRadioButton>
            <ElRadioButton label="custom">Tùy chọn</ElRadioButton>
          </ElRadioGroup>

          <ElDatePicker
            v-if="timePreset === 'custom'"
            v-model="customDateRange"
            type="daterange"
            size="small"
            range-separator="-"
            start-placeholder="Từ ngày"
            end-placeholder="Đến ngày"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            class="!w-64 ml-1"
            @change="handleCustomDateChange"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <ElSelect
            v-model="filters.channel"
            placeholder="Tất cả kênh bán"
            size="small"
            clearable
            class="!w-36"
            @change="loadStats"
          >
            <ElOption label="Tất cả kênh" value="" />
            <ElOption label="🌐 Online" value="online" />
            <ElOption label="🏢 Showroom" value="offline" />
          </ElSelect>

          <ElSelect
            v-model="filters.paymentMethod"
            placeholder="Phương thức TT"
            size="small"
            clearable
            class="!w-40"
            @change="loadStats"
          >
            <ElOption label="Tất cả PTTT" value="" />
            <ElOption label="💵 Tiền mặt" value="Tiền mặt" />
            <ElOption label="💳 Chuyển khoản" value="Chuyển khoản" />
            <ElOption label="📦 COD" value="COD" />
            <ElOption label="🌐 VNPay" value="VNPay" />
            <ElOption label="⚡ PayOS" value="PayOS" />
            <ElOption label="📑 Trả góp" value="Trả góp" />
          </ElSelect>

          <ElInput
            v-model="searchQuery"
            placeholder="Tìm theo Mã đơn, Khách hàng, SĐT..."
            prefix-icon="Search"
            size="small"
            clearable
            class="!w-64"
          />
        </div>
      </div>
    </ElCard>

    <div>
      <div class="flex items-center justify-between mb-2">
        <span
          class="font-bold text-base uppercase tracking-wide flex items-center gap-1.5 text-[var(--el-text-color-primary)]"
        >
          <ArtSvgIcon icon="ri:alarm-warning-line" class="text-danger" />
          Hàng Đợi Công Việc Cần Xử Lý Ngay
        </span>
        <span class="text-xs text-[var(--el-text-color-secondary)]">
          (Click vào thẻ để lọc nhanh danh sách đơn hàng có vấn đề bên dưới)
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ArtStatsCard
          title="ĐƠN MỚI CHỜ DUYỆT"
          :count="workload.pendingOrders"
          icon="ri:inbox-unarchive-line"
          iconStyle="bg-blue-500"
          textColor="#409eff"
          class="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          :class="{
            '!border-2 !border-primary ring-2 ring-blue-100 dark:ring-blue-900':
              activeFilter === 'pending',
          }"
          @click="handleFilter('pending')"
        />
        <ArtStatsCard
          title="TRỄ LỊCH SLA (>24H)"
          :count="workload.slaDelayed"
          icon="ri:alarm-warning-line"
          iconStyle="bg-red-500"
          textColor="#f56c6c"
          boxStyle="border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-900/20"
          class="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          :class="{
            '!border-2 !border-red-500 ring-2 ring-red-100 dark:ring-red-900':
              activeFilter === 'sla',
            'animate-pulse': workload.slaDelayed > 0,
          }"
          @click="handleFilter('sla')"
        />
        <ArtStatsCard
          title="ĐƠN LỖI TIỀN / HOÀN CỌC"
          :count="workload.paymentErrors"
          icon="ri:money-cny-circle-line"
          iconStyle="bg-amber-500"
          textColor="#e6a23c"
          class="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          :class="{
            '!border-2 !border-amber-500 ring-2 ring-amber-100 dark:ring-amber-900':
              activeFilter === 'payment',
          }"
          @click="handleFilter('payment')"
        />
        <ArtStatsCard
          title="YÊU CẦU ĐỔI TRẢ"
          :count="workload.returnRequests"
          icon="ri:arrow-go-back-line"
          iconStyle="bg-purple-500"
          textColor="#9c27b0"
          class="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          :class="{
            '!border-2 !border-purple-500 ring-2 ring-purple-100 dark:ring-purple-900':
              activeFilter === 'return',
          }"
          @click="handleFilter('return')"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ElCard class="art-table-card !border-l-4 !border-l-blue-500">
        <div class="flex flex-col">
          <span class="text-xs text-[var(--el-text-color-secondary)] uppercase font-semibold"
            >Tổng đơn trong kỳ</span
          >
          <span class="text-2xl font-bold text-[var(--el-text-color-primary)] mt-1">{{
            formatNumber(summaryStats.totalOrders)
          }}</span>
          <span class="text-xs text-blue-500 mt-1 flex items-center gap-1">
            <ArtSvgIcon icon="ri:file-list-3-line" /> Bao gồm tất cả các trạng thái
          </span>
        </div>
      </ElCard>

      <ElCard class="art-table-card !border-l-4 !border-l-green-500">
        <div class="flex flex-col">
          <span class="text-xs text-[var(--el-text-color-secondary)] uppercase font-semibold"
            >Tổng doanh thu</span
          >
          <span class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{
            formatCurrency(summaryStats.totalRevenue)
          }}</span>
          <span class="text-xs text-green-500 mt-1 flex items-center gap-1">
            <ArtSvgIcon icon="ri:funds-line" /> Đơn hợp lệ / hoàn tất
          </span>
        </div>
      </ElCard>

      <ElCard class="art-table-card !border-l-4 !border-l-indigo-500">
        <div class="flex flex-col">
          <span class="text-xs text-[var(--el-text-color-secondary)] uppercase font-semibold"
            >Giá trị TB / Đơn (AOV)</span
          >
          <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{{
            formatCurrency(summaryStats.averageOrderValue)
          }}</span>
          <span class="text-xs text-indigo-500 mt-1 flex items-center gap-1">
            <ArtSvgIcon icon="ri:shopping-cart-2-line" /> Trung bình trên mỗi đơn
          </span>
        </div>
      </ElCard>

      <ElCard class="art-table-card !border-l-4 !border-l-orange-500">
        <div class="flex flex-col">
          <span class="text-xs text-[var(--el-text-color-secondary)] uppercase font-semibold"
            >Tỷ lệ hủy đơn</span
          >
          <span
            class="text-2xl font-bold"
            :class="
              summaryStats.cancellationRate > 10
                ? 'text-red-500'
                : 'text-[var(--el-text-color-primary)]'
            "
          >
            {{ summaryStats.cancellationRate }}%
          </span>
          <span class="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <ArtSvgIcon icon="ri:close-circle-line" /> Tỷ lệ hủy trên tổng số đơn
          </span>
        </div>
      </ElCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ElCard class="art-table-card lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <span
              class="font-bold text-sm uppercase flex items-center gap-2 text-[var(--el-text-color-primary)]"
            >
              <ArtSvgIcon icon="ri:line-chart-line" class="text-primary text-lg" />
              {{
                timePreset === 'today'
                  ? '📈 Đồ Thị Lượng Đơn & Doanh Thu Theo Giờ (In-Day)'
                  : '📈 Xu Hướng Lượng Đơn & Doanh Thu Theo Thời Gian'
              }}
            </span>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1"
                ><span class="w-3 h-3 rounded bg-[#409eff] inline-block"></span> Số đơn hàng</span
              >
              <span class="flex items-center gap-1"
                ><span class="w-3 h-1.5 rounded bg-[#67c23a] inline-block"></span> Doanh thu
                (VNĐ)</span
              >
            </div>
          </div>
        </template>
        <div ref="trendChartRef" class="h-72 w-full"></div>
      </ElCard>

      <div class="flex flex-col gap-4">
        <ElCard class="art-table-card">
          <template #header>
            <div class="flex items-center justify-between">
              <span
                class="font-bold text-sm uppercase flex items-center gap-1.5 text-[var(--el-text-color-primary)]"
              >
                <ArtSvgIcon icon="ri:medal-line" class="text-amber-500 text-base" />
                Hiệu Suất Trực Đơn Hôm Nay
              </span>
              <ElTag size="small" :type="productivityProgress >= 100 ? 'success' : 'primary'">
                {{ productivityProgress >= 100 ? 'Đạt chỉ tiêu' : 'Đang thực hiện' }}
              </ElTag>
            </div>
          </template>
          <div class="flex flex-col gap-3 py-1">
            <div class="flex justify-between items-center text-sm">
              <span class="text-[var(--el-text-color-secondary)]">Mục tiêu ngày:</span>
              <span class="font-bold text-[var(--el-text-color-primary)]"
                >{{ productivity.target }} đơn</span
              >
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-[var(--el-text-color-secondary)]">Đã duyệt hoàn tất:</span>
              <span class="font-bold text-green-600 dark:text-green-400"
                >{{ productivity.completed }} đơn</span
              >
            </div>
            <div class="mt-1">
              <div class="flex justify-between items-center mb-1 text-xs">
                <span class="text-[var(--el-text-color-secondary)]">Tiến độ hoàn thành</span>
                <span class="font-bold text-green-600 dark:text-green-400"
                  >{{ productivityProgress }}%</span
                >
              </div>
              <ElProgress
                :percentage="Math.min(100, productivityProgress)"
                :stroke-width="12"
                :status="productivityProgress >= 100 ? 'success' : ''"
                :show-text="false"
              />
            </div>
          </div>
        </ElCard>

        <ElCard class="art-table-card flex-1">
          <template #header>
            <span
              class="font-bold text-sm uppercase flex items-center gap-1.5 text-[var(--el-text-color-primary)]"
            >
              <ArtSvgIcon icon="ri:truck-line" class="text-primary text-base" />
              Tỷ Lệ Phương Thức Nhận Hàng
            </span>
          </template>
          <div ref="methodChartRef" class="h-44 w-full"></div>
        </ElCard>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ElCard class="art-table-card">
        <template #header>
          <span
            class="font-bold text-sm uppercase flex items-center gap-1.5 text-[var(--el-text-color-primary)]"
          >
            <ArtSvgIcon icon="ri:pie-chart-line" class="text-indigo-500 text-base" />
            Cơ Cấu Trạng Thái Đơn Hàng
          </span>
        </template>
        <div ref="statusChartRef" class="h-56 w-full"></div>
      </ElCard>

      <ElCard class="art-table-card">
        <template #header>
          <span
            class="font-bold text-sm uppercase flex items-center gap-1.5 text-[var(--el-text-color-primary)]"
          >
            <ArtSvgIcon icon="ri:bank-card-line" class="text-emerald-500 text-base" />
            Cơ Cấu Phương Thức Thanh Toán
          </span>
        </template>
        <div ref="paymentChartRef" class="h-56 w-full"></div>
      </ElCard>
    </div>

    <ElCard class="art-table-card border-red-200 dark:border-red-900/60 shadow-sm">
      <template #header>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span
              class="font-bold text-red-600 dark:text-red-400 uppercase text-sm flex items-center gap-1.5"
            >
              <ArtSvgIcon
                icon="ri:alarm-warning-fill"
                class="text-red-500 text-lg animate-bounce"
              />
              Danh Sách Đơn Hàng Cần Chú Ý Đặc Biệt (CRITICAL ORDERS)
            </span>
            <ElTag type="danger" size="small" effect="dark" round>
              {{ filteredExceptions.length }} ca cần giải quyết
            </ElTag>
          </div>

          <div class="flex items-center gap-1">
            <ElRadioGroup v-model="activeFilter" size="small" @change="pagination.current = 1">
              <ElRadioButton label="" value="">Tất cả</ElRadioButton>
              <ElRadioButton label="pending" value="pending">Chờ duyệt</ElRadioButton>
              <ElRadioButton label="sla" value="sla">Trễ SLA</ElRadioButton>
              <ElRadioButton label="payment" value="payment">Lỗi tiền / Cọc</ElRadioButton>
              <ElRadioButton label="return" value="return">Đổi trả</ElRadioButton>
            </ElRadioGroup>
          </div>
        </div>
      </template>

      <ElAlert
        v-if="filteredExceptions.length === 0"
        type="success"
        show-icon
        :closable="false"
        class="my-3"
      >
        Tuyệt vời! Hiện tại không có đơn hàng ngoại lệ hoặc trễ hạn nào cần xử lý.
      </ElAlert>

      <div v-else class="overflow-x-auto">
        <ElTable
          :data="paginatedExceptions"
          stripe
          border
          style="width: 100%"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)',
            fontWeight: '600',
          }"
        >
          <ElTableColumn label="Mã đơn" min-width="130">
            <template #default="{ row }">
              <div class="flex items-center gap-1.5">
                <ElTag size="small" type="primary" effect="plain" class="font-mono font-semibold">
                  {{ row.orderCode || `ORD-${row.id}` }}
                </ElTag>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Khách hàng" min-width="200">
            <template #default="{ row }">
              <div class="flex flex-col">
                <span class="font-medium text-[var(--el-text-color-primary)]">{{
                  row.customerName || 'Khách vãng lai'
                }}</span>
                <span class="text-xs text-[var(--el-text-color-secondary)] flex items-center gap-1">
                  <ArtSvgIcon icon="ri:phone-line" class="text-[11px]" />
                  {{ row.customerPhone || '---' }}
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Tổng tiền" min-width="150" align="right">
            <template #default="{ row }">
              <div class="flex flex-col items-end">
                <span class="font-bold text-[var(--el-text-color-primary)]">{{
                  formatCurrency(row.totalAmount)
                }}</span>
                <span v-if="row.paidAmount > 0" class="text-xs text-green-600 dark:text-green-400">
                  Đã trả: {{ formatCurrency(row.paidAmount) }}
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Hình thức & PTTT" min-width="170">
            <template #default="{ row }">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-[var(--el-text-color-regular)]">
                  🚚 {{ row.deliveryType || 'Nhận tại showroom' }}
                </span>
                <span class="text-xs text-[var(--el-text-color-secondary)]">
                  💳 {{ row.paymentMethod || 'Chưa chọn' }}
                </span>
              </div>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Trạng thái đơn" min-width="140" align="center">
            <template #default="{ row }">
              <ElTag :type="getStatusTagType(row.statusId)" size="small">
                {{ row.statusName || row.statusId }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Vấn đề / Cảnh báo" min-width="220">
            <template #default="{ row }">
              <ElTag :type="getIssueTagType(row.type)" effect="light" class="font-medium">
                <ArtSvgIcon :icon="getIssueIcon(row.type)" class="mr-1" />
                {{ row.issue }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Thời gian chờ" min-width="140" align="center">
            <template #default="{ row }">
              <ElTooltip :content="formatDateTime(row.createdAt)" placement="top">
                <span
                  class="text-xs font-medium px-2 py-1 rounded bg-[var(--el-fill-color-light)] text-[var(--el-text-color-regular)]"
                >
                  ⏱️ {{ row.waitTime || '---' }}
                </span>
              </ElTooltip>
            </template>
          </ElTableColumn>

          <ElTableColumn label="Thao tác" width="200" min-width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-2 whitespace-nowrap">
                <ElButton size="small" type="primary" plain @click="handleProcessOrder(row as any)">
                  Xử lý ngay
                </ElButton>
                <ElButton size="small" type="info" plain @click="handleViewDetail(row as any)">
                  Chi tiết
                </ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="flex justify-between items-center mt-4 px-2">
          <span class="text-xs text-[var(--el-text-color-secondary)]">
            Hiển thị {{ paginatedExceptions.length }} / {{ filteredExceptions.length }} đơn hàng cần
            xử lý
          </span>
          <ElPagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredExceptions.length"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </ElCard>

    <ElDialog
      v-model="detailDialog.visible"
      :title="`Chi tiết cảnh báo đơn hàng #${detailDialog.order?.id}`"
      width="540px"
      destroy-on-close
    >
      <div v-if="detailDialog.order" class="flex flex-col gap-3 py-1">
        <div
          class="p-3 rounded-lg bg-[var(--el-fill-color-light)] flex justify-between items-center"
        >
          <div>
            <span class="text-xs text-gray-500 uppercase font-semibold">Mã đơn hàng</span>
            <div class="text-base font-bold font-mono text-primary">
              {{ detailDialog.order.orderCode || `ORD-${detailDialog.order.id}` }}
            </div>
          </div>
          <ElTag :type="getStatusTagType(detailDialog.order.statusId)">
            {{ detailDialog.order.statusName }}
          </ElTag>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-xs text-gray-500">Khách hàng:</span>
            <div class="font-medium text-[var(--el-text-color-primary)]">
              {{ detailDialog.order.customerName }}
            </div>
          </div>
          <div>
            <span class="text-xs text-gray-500">Số điện thoại:</span>
            <div class="font-medium text-[var(--el-text-color-primary)]">
              {{ detailDialog.order.customerPhone || '---' }}
            </div>
          </div>
          <div>
            <span class="text-xs text-gray-500">Tổng giá trị đơn:</span>
            <div class="font-bold text-green-600">
              {{ formatCurrency(detailDialog.order.totalAmount) }}
            </div>
          </div>
          <div>
            <span class="text-xs text-gray-500">Đã thanh toán / Cọc:</span>
            <div class="font-bold text-blue-600">
              {{ formatCurrency(detailDialog.order.paidAmount) }}
            </div>
          </div>
          <div>
            <span class="text-xs text-gray-500">Phương thức nhận:</span>
            <div>{{ detailDialog.order.deliveryType }}</div>
          </div>
          <div>
            <span class="text-xs text-gray-500">Phương thức thanh toán:</span>
            <div>{{ detailDialog.order.paymentMethod }}</div>
          </div>
        </div>

        <div
          class="mt-2 p-3 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-900/20"
        >
          <span class="text-xs font-bold text-red-500 uppercase flex items-center gap-1">
            <ArtSvgIcon icon="ri:error-warning-line" />
            Vấn đề cần giải quyết:
          </span>
          <div class="text-sm font-semibold text-red-600 dark:text-red-400 mt-1">
            {{ detailDialog.order.issue }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            Thời gian chờ: {{ detailDialog.order.waitTime }} (Tạo lúc:
            {{ formatDateTime(detailDialog.order.createdAt) }})
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="detailDialog.visible = false">Đóng</ElButton>
          <ElButton type="primary" @click="handleNavigateToOrder(detailDialog.order?.id)">
            Mở trang Quản lý đơn hàng
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  ElCard,
  ElButton,
  ElAlert,
  ElInput,
  ElSelect,
  ElOption,
  ElProgress,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDialog,
  ElRadioGroup,
  ElRadioButton,
  ElDatePicker,
  ElTag,
  ElTooltip,
} from 'element-plus';
import * as echarts from 'echarts';
import { useSettingStore } from '@/application/store/setting';
import {
  orderStatisticsApi,
  OrderStatisticsResponse,
  ExceptionOrder,
  HourlyOrderData,
  DailyOrderData,
  OrderStatusStatData,
  DeliveryMethodStatData,
  PaymentMethodStatData,
} from '@/api/operations/order-statistics.api';

defineOptions({ name: 'OrderStatisticsDashboard' });

const router = useRouter();
const settingStore = useSettingStore();
const isDark = computed(() => settingStore.systemThemeType === 'dark');

const searchQuery = ref('');
const timePreset = ref<'today' | 'last7days' | 'last30days' | 'thisMonth' | 'custom'>('today');
const customDateRange = ref<[string, string] | null>(null);
const filters = ref({
  channel: '',
  paymentMethod: '',
  statusId: '',
});
const activeFilter = ref<string>('');

const refreshIntervalSetting = ref<number>(30);
const countdownTimer = ref(30);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const loadingStats = ref(false);

const trendChartRef = ref<HTMLDivElement | null>(null);
const methodChartRef = ref<HTMLDivElement | null>(null);
const statusChartRef = ref<HTMLDivElement | null>(null);
const paymentChartRef = ref<HTMLDivElement | null>(null);

let trendChartInstance: echarts.ECharts | null = null;
let methodChartInstance: echarts.ECharts | null = null;
let statusChartInstance: echarts.ECharts | null = null;
let paymentChartInstance: echarts.ECharts | null = null;

const workload = ref({
  pendingOrders: 0,
  slaDelayed: 0,
  paymentErrors: 0,
  returnRequests: 0,
});

const summaryStats = ref({
  totalOrders: 0,
  totalRevenue: 0,
  averageOrderValue: 0,
  cancellationRate: 0,
});

const productivity = ref({ target: 60, completed: 0 });
const hourlyData = ref<HourlyOrderData[]>([]);
const dailyData = ref<DailyOrderData[]>([]);
const statusData = ref<OrderStatusStatData[]>([]);
const deliveryMethodData = ref<DeliveryMethodStatData[]>([]);
const paymentMethodData = ref<PaymentMethodStatData[]>([]);
const exceptionOrders = ref<ExceptionOrder[]>([]);

const pagination = ref({
  current: 1,
  size: 10,
});

const detailDialog = ref<{
  visible: boolean;
  order: ExceptionOrder | null;
}>({
  visible: false,
  order: null,
});

const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatNumber = (val: number | null | undefined): string => {
  if (val == null || isNaN(val)) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
};

const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '---';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const productivityProgress = computed(() => {
  const { target, completed } = productivity.value;
  if (!target || target <= 0) return 0;
  return Math.round((completed / target) * 100);
});

const getDateRangeParams = () => {
  const now = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  switch (timePreset.value) {
    case 'today':
      return {
        startDate: formatDate(now),
        endDate: formatDate(now),
      };
    case 'last7days': {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      return {
        startDate: formatDate(past),
        endDate: formatDate(now),
      };
    }
    case 'last30days': {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      return {
        startDate: formatDate(past),
        endDate: formatDate(now),
      };
    }
    case 'thisMonth': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(now),
      };
    }
    case 'custom':
      if (customDateRange.value && customDateRange.value.length === 2) {
        return {
          startDate: customDateRange.value[0],
          endDate: customDateRange.value[1],
        };
      }
      return {};
    default:
      return {};
  }
};

const handleTimePresetChange = () => {
  if (timePreset.value !== 'custom') {
    loadStats();
  }
};

const handleCustomDateChange = () => {
  if (customDateRange.value) {
    loadStats();
  }
};

const loadStats = async () => {
  loadingStats.value = true;
  try {
    const dateParams = getDateRangeParams();
    const res = await orderStatisticsApi.getStatistics({
      ...dateParams,
      channel: filters.value.channel || undefined,
      paymentMethod: filters.value.paymentMethod || undefined,
      statusId: filters.value.statusId || undefined,
    });

    const d: OrderStatisticsResponse = res;
    workload.value = {
      pendingOrders: d.pendingOrders || 0,
      slaDelayed: d.slaDelayed || 0,
      paymentErrors: d.paymentErrors || 0,
      returnRequests: d.returnRequests || 0,
    };

    summaryStats.value = {
      totalOrders: d.totalOrders || 0,
      totalRevenue: d.totalRevenue || 0,
      averageOrderValue: d.averageOrderValue || 0,
      cancellationRate: d.cancellationRate || 0,
    };

    productivity.value = {
      target: d.targetToday || 60,
      completed: d.completedToday || 0,
    };

    hourlyData.value = d.hourlyData || [];
    dailyData.value = d.dailyData || [];
    statusData.value = d.statusData || [];
    deliveryMethodData.value = d.deliveryMethodData || [];
    paymentMethodData.value = d.paymentMethodData || [];
    exceptionOrders.value = d.exceptionOrders || [];

    nextTick(() => {
      renderAllCharts();
    });
  } catch (error) {
    console.error('Failed to load order statistics:', error);
  } finally {
    loadingStats.value = false;
  }
};

const filteredExceptions = computed(() => {
  let list = exceptionOrders.value;

  if (activeFilter.value) {
    list = list.filter((item) => item.type === activeFilter.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (item) =>
        String(item.id).toLowerCase().includes(q) ||
        (item.orderCode && item.orderCode.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.customerPhone && item.customerPhone.toLowerCase().includes(q))
    );
  }

  return list;
});

const paginatedExceptions = computed(() => {
  const start = (pagination.value.current - 1) * pagination.value.size;
  return filteredExceptions.value.slice(start, start + pagination.value.size);
});

const handleFilter = (type: string) => {
  if (activeFilter.value === type) {
    activeFilter.value = '';
  } else {
    activeFilter.value = type;
  }
  pagination.value.current = 1;
};

const handleSizeChange = (val: number) => {
  pagination.value.size = val;
  pagination.value.current = 1;
};

const handleCurrentChange = (val: number) => {
  pagination.value.current = val;
};

const getStatusTagType = (statusId?: string) => {
  switch (statusId?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
    case 'waiting_deposit':
    case 'waiting_installment':
      return 'warning';
    case 'delivering':
    case 'confirmed_cod':
    case 'paid_processing':
      return 'primary';
    case 'cancelled':
    case 'refunding':
    case 'refunded':
      return 'danger';
    default:
      return 'info';
  }
};

const getIssueTagType = (type: string) => {
  switch (type) {
    case 'sla':
      return 'danger';
    case 'payment':
      return 'warning';
    case 'return':
      return 'info';
    case 'pending':
      return 'primary';
    default:
      return 'info';
  }
};

const getIssueIcon = (type: string) => {
  switch (type) {
    case 'sla':
      return 'ri:alarm-warning-line';
    case 'payment':
      return 'ri:money-cny-circle-line';
    case 'return':
      return 'ri:arrow-go-back-line';
    case 'pending':
      return 'ri:time-line';
    default:
      return 'ri:alert-line';
  }
};

const handleProcessOrder = (order: ExceptionOrder) => {
  if (order.type === 'return') {
    router.push({
      path: '/Order/management/returns',
      query: { search: order.orderCode || String(order.id) },
    });
  } else {
    router.push({
      path: '/Order/management/order',
      query: { search: order.orderCode || String(order.id) },
    });
  }
};

const handleViewDetail = (order: ExceptionOrder) => {
  detailDialog.value = {
    visible: true,
    order,
  };
};

const handleNavigateToOrder = (orderId?: number) => {
  const currentOrder = detailDialog.value.order;
  detailDialog.value.visible = false;
  if (currentOrder?.type === 'return') {
    router.push({
      path: '/Order/management/returns',
      query: { search: currentOrder.orderCode || String(orderId) },
    });
  } else if (orderId) {
    router.push({
      path: '/Order/management/order',
      query: { search: String(orderId) },
    });
  }
};

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval);
  if (refreshIntervalSetting.value <= 0) return;

  countdownTimer.value = refreshIntervalSetting.value;
  timerInterval = setInterval(() => {
    countdownTimer.value--;
    if (countdownTimer.value <= 0) {
      countdownTimer.value = refreshIntervalSetting.value;
      loadStats();
    }
  }, 1000);
};

const handleRefreshIntervalChange = () => {
  startTimer();
};

const handleManualRefresh = () => {
  loadStats();
  if (refreshIntervalSetting.value > 0) {
    countdownTimer.value = refreshIntervalSetting.value;
  }
};

const getThemeColors = () => {
  if (isDark.value) {
    return {
      text: '#e5e6eb',
      subText: '#86909c',
      line: '#333333',
      tooltipBg: '#1f1f1f',
      tooltipBorder: '#444444',
      barColor: '#409eff',
      lineColor: '#67c23a',
      pieColors: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9c27b0', '#00d2d3'],
    };
  }
  return {
    text: '#606266',
    subText: '#909399',
    line: '#e4e7ed',
    tooltipBg: '#ffffff',
    tooltipBorder: '#e4e7ed',
    barColor: '#409eff',
    lineColor: '#67c23a',
    pieColors: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9c27b0', '#00d2d3'],
  };
};

const renderTrendChart = () => {
  if (!trendChartRef.value) return;
  if (!trendChartInstance) trendChartInstance = echarts.init(trendChartRef.value);

  const colors = getThemeColors();
  const isHourly = timePreset.value === 'today';

  const xData = isHourly ? hourlyData.value.map((h) => h.hour) : dailyData.value.map((d) => d.date);

  const countData = isHourly
    ? hourlyData.value.map((h) => h.count)
    : dailyData.value.map((d) => d.count);

  const revenueData = isHourly
    ? hourlyData.value.map((h) => h.revenue)
    : dailyData.value.map((d) => d.revenue);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        let title = params[0]?.name || '';
        let html = `<div style="font-weight:bold;margin-bottom:4px;">${isHourly ? 'Khung giờ' : 'Ngày'}: ${title}</div>`;
        params.forEach((item: any) => {
          if (item.seriesName === 'Số đơn hàng') {
            html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};"></span>
              <span>${item.seriesName}: <b>${item.value} đơn</b></span>
            </div>`;
          } else {
            html += `<div style="display:flex;align-items:center;gap:6px;margin:2px 0;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};"></span>
              <span>${item.seriesName}: <b>${formatCurrency(item.value)}</b></span>
            </div>`;
          }
        });
        return html;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '5%',
      top: '12%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { color: colors.subText, fontSize: 11 },
      axisLine: { lineStyle: { color: colors.line } },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Số đơn',
        nameTextStyle: { color: colors.subText, fontSize: 11 },
        axisLabel: { color: colors.subText },
        axisLine: { lineStyle: { color: colors.line } },
        splitLine: { lineStyle: { color: colors.line, type: 'dashed' } },
      },
      {
        type: 'value',
        name: 'Doanh thu',
        nameTextStyle: { color: colors.subText, fontSize: 11 },
        axisLabel: {
          color: colors.subText,
          formatter: (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v}`),
        },
        axisLine: { lineStyle: { color: colors.line } },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Số đơn hàng',
        type: 'bar',
        data: countData,
        yAxisIndex: 0,
        itemStyle: {
          color: colors.barColor,
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: countData.length <= 24 && Math.max(...countData) > 0,
          position: 'top',
          color: colors.text,
          fontSize: 10,
        },
      },
      {
        name: 'Doanh thu (VNĐ)',
        type: 'line',
        data: revenueData,
        yAxisIndex: 1,
        smooth: true,
        itemStyle: { color: colors.lineColor },
        lineStyle: { width: 3, color: colors.lineColor },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.35)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.02)' },
          ]),
        },
      },
    ],
  };

  trendChartInstance.setOption(option, true);
};

const renderMethodChart = () => {
  if (!methodChartRef.value) return;
  if (!methodChartInstance) methodChartInstance = echarts.init(methodChartRef.value);

  const colors = getThemeColors();
  const pieData = deliveryMethodData.value.map((item) => ({
    value: item.count,
    name: item.method,
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
      formatter: '{b}: <b>{c} đơn</b> ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: colors.text, fontSize: 11 },
    },
    color: ['#409eff', '#67c23a'],
    series: [
      {
        name: 'Phương thức nhận',
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark.value ? '#161618' : '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            formatter: '{d}%',
          },
        },
        data:
          pieData.length > 0
            ? pieData
            : [
                { value: 0, name: 'Giao tận nhà' },
                { value: 0, name: 'Nhận tại showroom' },
              ],
      },
    ],
  };
  methodChartInstance.setOption(option, true);
};

const renderStatusChart = () => {
  if (!statusChartRef.value) return;
  if (!statusChartInstance) statusChartInstance = echarts.init(statusChartRef.value);

  const colors = getThemeColors();
  const pieData = statusData.value.map((s) => ({
    value: s.count,
    name: s.statusName,
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
      formatter: '{b}: <b>{c} đơn</b> ({d}%)',
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      right: '2%',
      top: 'middle',
      textStyle: { color: colors.text, fontSize: 11 },
    },
    color: colors.pieColors,
    series: [
      {
        name: 'Trạng thái đơn',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark.value ? '#161618' : '#fff',
          borderWidth: 2,
        },
        label: { show: false },
        data: pieData,
      },
    ],
  };
  statusChartInstance.setOption(option, true);
};

const renderPaymentChart = () => {
  if (!paymentChartRef.value) return;
  if (!paymentChartInstance) paymentChartInstance = echarts.init(paymentChartRef.value);

  const colors = getThemeColors();
  const data = paymentMethodData.value;

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: colors.tooltipBg,
      borderColor: colors.tooltipBorder,
      textStyle: { color: colors.text },
      formatter: (params: any) => {
        const item = params[0];
        const raw = data[item.dataIndex];
        return `<div style="font-weight:bold">${item.name}</div>
          <div>Số đơn: <b>${item.value}</b></div>
          ${raw?.totalAmount ? `<div>Doanh thu: <b>${formatCurrency(raw.totalAmount)}</b></div>` : ''}`;
      },
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '3%',
      top: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: colors.subText },
      splitLine: { lineStyle: { color: colors.line, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: data.map((p) => p.method),
      axisLabel: { color: colors.text, fontSize: 11 },
      axisLine: { lineStyle: { color: colors.line } },
    },
    series: [
      {
        type: 'bar',
        data: data.map((p) => p.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: '#059669' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          color: colors.text,
          fontSize: 10,
        },
      },
    ],
  };
  paymentChartInstance.setOption(option, true);
};

const renderAllCharts = () => {
  renderTrendChart();
  renderMethodChart();
  renderStatusChart();
  renderPaymentChart();
};

const resizeCharts = () => {
  trendChartInstance?.resize();
  methodChartInstance?.resize();
  statusChartInstance?.resize();
  paymentChartInstance?.resize();
};

watch(isDark, () => {
  nextTick(() => {
    renderAllCharts();
  });
});

onMounted(() => {
  startTimer();
  loadStats();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval);
  window.removeEventListener('resize', resizeCharts);
  trendChartInstance?.dispose();
  methodChartInstance?.dispose();
  statusChartInstance?.dispose();
  paymentChartInstance?.dispose();
});
</script>

<style scoped lang="scss">
.order-statistics-page {
  :deep(.el-card__header) {
    padding: 12px 16px;
  }
}
</style>
