<template>
  <div class="resp-page invoices-page flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-blue-500"
        :class="{ 'ring-2 ring-blue-400': filterStatus === '' }"
        @click="
          filterStatus = '';
          handleSearch();
        "
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Tất cả hóa đơn</div>
            <div class="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
              {{ totalCount }}
            </div>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:file-list-3-line" />
          </div>
        </div>
      </ElCard>

      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-amber-500"
        :class="{ 'ring-2 ring-amber-400': filterStatus === 'pending' }"
        @click="
          filterStatus = 'pending';
          handleSearch();
        "
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Chờ xử lý</div>
            <div class="text-2xl font-bold text-amber-600 mt-1">{{ statusCounts.pending }}</div>
          </div>
          <div class="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:time-line" />
          </div>
        </div>
      </ElCard>

      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-indigo-500"
        :class="{ 'ring-2 ring-indigo-400': filterStatus === 'processing' }"
        @click="
          filterStatus = 'processing';
          handleSearch();
        "
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Chờ Admin duyệt</div>
            <div class="text-2xl font-bold text-indigo-600 mt-1">{{ statusCounts.processing }}</div>
          </div>
          <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:user-shared-line" />
          </div>
        </div>
      </ElCard>

      <ElCard
        shadow="hover"
        class="cursor-pointer transition-all border-l-4 !border-l-emerald-500"
        :class="{ 'ring-2 ring-emerald-400': filterStatus === 'completed' }"
        @click="
          filterStatus = 'completed';
          handleSearch();
        "
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-gray-500 font-semibold uppercase">Đã duyệt / Hoàn tất</div>
            <div class="text-2xl font-bold text-emerald-600 mt-1">{{ statusCounts.completed }}</div>
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl text-xl">
            <ArtSvgIcon icon="ri:checkbox-circle-line" />
          </div>
        </div>
      </ElCard>
    </div>

    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3 flex-wrap">
        <ElInput
          v-model="searchQuery"
          placeholder="Tìm theo mã HĐ, tên KH, SĐT, Số khung, Số máy..."
          clearable
          size="default"
          style="width: 360px"
          @input="handleSearch"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>
        <ElSelect
          v-model="filterStatus"
          placeholder="Trạng thái hóa đơn"
          size="default"
          clearable
          style="width: 200px"
          @change="handleSearch"
        >
          <ElOption label="📋 Tất cả trạng thái" value="" />
          <ElOption label="📝 Chờ xử lý" value="pending" />
          <ElOption label="⏳ Chờ Admin duyệt" value="processing" />
          <ElOption label="✅ Đã duyệt / Hoàn tất" value="completed" />
          <ElOption label="⚠️ Từ chối" value="rejected" />
          <ElOption label="❌ Đã hủy" value="cancelled" />
        </ElSelect>
        <ElButton plain @click="handleResetFilters">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-1" />
          Tải lại
        </ElButton>
      </div>
      <ElButton type="primary" @click="handleCreate">
        <ElIcon class="mr-1"><Plus /></ElIcon>
        Tạo hóa đơn mới
      </ElButton>
    </div>

    <ElCard shadow="never" class="invoice-list-card">
      <ElTable
        :data="paginatedInvoices"
        style="width: 100%"
        stripe
        border
        v-loading="loadingList"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)',
          fontWeight: '600',
        }"
        @row-click="(row) => handleView(row)"
      >
        <ElTableColumn label="Mã HĐ" width="140" align="center">
          <template #default="{ row }">
            <ElTag size="small" type="primary" effect="plain" class="font-mono font-bold">
              {{ row.invoiceNumber }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Ngày lập" width="110" align="center">
          <template #default="{ row }">
            <span class="text-xs">{{ formatDate(row.issueDate) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Khách hàng" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-[var(--el-text-color-primary)]">{{
                row.customerName
              }}</span>
              <span class="text-xs text-gray-500 flex items-center gap-1">
                <ArtSvgIcon icon="ri:phone-line" class="text-[11px]" />
                {{ row.customerPhone }}
              </span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Xe bán" min-width="190">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-[var(--el-text-color-primary)]">{{
                row.vehicleModel
              }}</span>
              <span class="text-xs text-gray-500">{{ row.vehicleColor }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Số khung / Máy" width="150" align="center">
          <template #default="{ row }">
            <div class="flex flex-col text-xs font-mono">
              <span class="text-gray-700 dark:text-gray-300">K: {{ row.chassisNo }}</span>
              <span class="text-gray-400">M: {{ row.engineNo }}</span>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Tổng tiền" width="140" align="right">
          <template #default="{ row }">
            <span class="font-bold text-[var(--el-text-color-primary)]">
              {{ formatCurrency(row.totalAmount) }}
            </span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thanh toán" width="120" align="center">
          <template #default="{ row }">
            <ElTag :type="getPaymentTagType(row.paymentMethod)" size="small">
              {{ getPaymentLabel(row.paymentMethod) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Trạng thái" width="140" align="center">
          <template #default="{ row }">
            <ElTag
              :type="getStatusTagType(row.status)"
              size="small"
              effect="light"
              class="font-medium"
            >
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Thao tác" width="240" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1.5 whitespace-nowrap" @click.stop>
              <ElButton plain type="primary" size="small" @click="handleEdit(row)">
                <ArtSvgIcon icon="ri:edit-2-line" class="mr-1" />
                Chỉnh sửa
              </ElButton>

              <ElButton link type="primary" size="small" @click="handleView(row)">
                Chi tiết
              </ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <div class="flex justify-between items-center mt-2 px-1">
      <span class="text-xs text-gray-500">
        Hiển thị {{ paginatedInvoices.length }} / {{ filteredInvoices.length }} hóa đơn
      </span>
      <ElPagination
        v-model:currentPage="pagination.current"
        v-model:pageSize="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="filteredInvoices.length"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <ElDialog
      v-model="dialog.visible"
      width="820px"
      :close-on-click-modal="false"
      destroy-on-close
      class="premium-invoice-modal"
      :show-close="true"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <ArtSvgIcon icon="ri:file-list-3-line" class="text-2xl" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 m-0 leading-tight">
              Chi tiết Hóa Đơn Bán Xe
            </h3>
            <p class="text-sm text-primary font-mono font-bold m-0 mt-1">
              {{ dialog.invoice?.invoiceNumber }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="dialog.invoice" class="premium-invoice-body">
        <div
          class="flex justify-between items-center bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl mb-5 border border-gray-100 dark:border-gray-700"
        >
          <div>
            <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Trạng thái Hóa đơn</div>
            <ElTag
              :type="getStatusTagType(dialog.invoice.status)"
              effect="dark"
              size="large"
              class="font-bold px-4"
            >
              {{ getStatusLabel(dialog.invoice.status) }}
            </ElTag>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Tổng thanh toán</div>
            <div class="text-2xl font-black text-red-600 dark:text-red-400">
              {{ formatCurrency(dialog.invoice.totalAmount) }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-5">
          <div class="info-card">
            <div
              class="card-header flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold mb-3 pb-2 border-b"
            >
              <ArtSvgIcon icon="ri:user-smile-line" class="text-blue-500" />
              <span>Thông tin Khách hàng</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Họ tên:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{
                  dialog.invoice.customerName
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Điện thoại:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{
                  dialog.invoice.customerPhone
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số CCCD:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{
                  dialog.invoice.customerIdCard || '-'
                }}</span>
              </div>
              <div class="flex flex-col gap-0.5 mt-1">
                <span class="text-gray-500">Địa chỉ:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200 text-xs leading-snug">{{
                  dialog.invoice.customerAddress
                }}</span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <div
              class="card-header flex items-center gap-2 text-gray-700 dark:text-gray-200 font-semibold mb-3 pb-2 border-b"
            >
              <ArtSvgIcon icon="ri:motorbike-fill" class="text-orange-500" />
              <span>Thông tin Xe máy</span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Dòng xe:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{
                  dialog.invoice.vehicleModel
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Màu sơn:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">{{
                  dialog.invoice.vehicleColor
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số khung:</span>
                <span
                  class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300"
                  >{{ dialog.invoice.chassisNo }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Số máy:</span>
                <span
                  class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300"
                  >{{ dialog.invoice.engineNo }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/40"
        >
          <div class="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-semibold mb-3">
            <ArtSvgIcon icon="ri:bill-line" />
            <span>Chi tiết Tài chính & Bàn giao</span>
          </div>

          <div class="space-y-2 mb-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Giá xe niêm yết:</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">
                {{ formatCurrency(dialog.invoice.vehiclePrice || dialog.invoice.totalAmount) }}
              </span>
            </div>

            <div class="flex justify-between text-red-500" v-if="dialog.invoice.voucherCode">
              <span>Mã giảm giá ({{ dialog.invoice.voucherCode }}):</span>
              <span class="font-medium">
                -{{
                  formatCurrency(
                    Math.max(0, (dialog.invoice.vehiclePrice || 0) - dialog.invoice.totalAmount)
                  )
                }}
              </span>
            </div>

            <div
              class="flex justify-between items-center py-1 border-t border-dashed border-gray-200 dark:border-gray-700"
            >
              <span class="font-semibold text-gray-700 dark:text-gray-300">Tổng thanh toán:</span>
              <span class="font-bold text-base text-blue-600 dark:text-blue-400">
                {{ formatCurrency(dialog.invoice.totalAmount) }}
              </span>
            </div>

            <div class="flex justify-between items-center text-orange-600 dark:text-orange-400">
              <span class="font-medium"
                >Tiền đặt cọc ({{ dialog.invoice.depositPercentage ?? 100 }}%):</span
              >
              <span class="font-bold">
                {{
                  formatCurrency(
                    ((dialog.invoice.totalAmount || 0) *
                      (dialog.invoice.depositPercentage ?? 100)) /
                      100
                  )
                }}
              </span>
            </div>

            <div
              class="flex justify-between items-center text-green-600 dark:text-green-400 pt-1"
              v-if="(dialog.invoice.depositPercentage ?? 100) < 100"
            >
              <span class="font-medium">Số tiền còn lại (khi nhận xe):</span>
              <span class="font-bold">
                {{
                  formatCurrency(
                    Math.max(
                      0,
                      dialog.invoice.totalAmount -
                        (dialog.invoice.totalAmount * (dialog.invoice.depositPercentage || 0)) / 100
                    )
                  )
                }}
              </span>
            </div>
          </div>

          <div
            class="border-t border-blue-200 dark:border-blue-800/60 pt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"
          >
            <div>
              <span class="text-gray-500 block text-xs mb-1">Phương thức TT</span>
              <ElTag size="small" type="info">
                {{ getPaymentLabel(dialog.invoice.paymentMethod) }}
              </ElTag>
              <span v-if="dialog.invoice.bankName" class="block text-xs text-gray-500 mt-0.5">
                {{ dialog.invoice.bankName }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs mb-1">Nhân viên bán hàng</span>
              <span class="font-medium text-gray-800 dark:text-gray-200 text-xs">{{
                dialog.invoice.salesPerson || '---'
              }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs mb-1">Ngày lập HĐ</span>
              <span class="font-medium text-gray-800 dark:text-gray-200 text-xs">{{
                formatDate(dialog.invoice.issueDate)
              }}</span>
            </div>
            <div>
              <span class="text-gray-500 block text-xs mb-1">Ngày giao dự kiến</span>
              <span class="font-medium text-gray-800 dark:text-gray-200 text-xs">
                {{
                  dialog.invoice.deliveryDate ? formatDate(dialog.invoice.deliveryDate) : 'Chưa xếp'
                }}
              </span>
            </div>
          </div>

          <div
            v-if="dialog.invoice.processedBy"
            class="mt-3 pt-2 border-t border-blue-100 dark:border-blue-800/30 flex justify-between items-center text-xs text-gray-500"
          >
            <span
              >Người xử lý / duyệt:
              <b class="text-gray-700 dark:text-gray-300">{{ dialog.invoice.processedBy }}</b></span
            >
            <span v-if="dialog.invoice.processedAt"
              >Lúc: {{ formatDate(dialog.invoice.processedAt) }}</span
            >
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between items-center gap-3 px-2 pb-2">
          <div class="flex items-center gap-2">
            <ElButton
              v-if="dialog.invoice?.status === 'pending'"
              type="warning"
              :loading="actionLoading"
              @click="handleSendForApproval(dialog.invoice)"
            >
              📤 Gửi Admin duyệt
            </ElButton>
          </div>

          <div class="flex items-center gap-2">
            <ElButton type="primary" plain @click="handlePrintInvoice(dialog.invoice)">
              <ArtSvgIcon icon="ri:printer-line" class="mr-1" />
              In Hóa Đơn
            </ElButton>
            <ElButton @click="dialog.visible = false" plain>Đóng lại</ElButton>
          </div>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="createDialog.visible"
      :title="createDialog.isEdit ? 'Chỉnh sửa hóa đơn' : 'Tạo hóa đơn bán xe mới'"
      width="65%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <ElForm
        v-if="createDialog.visible"
        :model="createDialog.form"
        label-width="160px"
        label-position="right"
        :disabled="
          createDialog.isEdit &&
          ['processing', 'completed', 'cancelled'].includes(createDialog.form.status)
        "
      >
        <ElDivider content-position="left">📋 Thông tin khách hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Họ tên" required>
            <ElInput v-model="createDialog.form.customerName" />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" required>
            <ElInput v-model="createDialog.form.customerPhone" />
          </ElFormItem>
          <ElFormItem label="Số CCCD">
            <ElInput v-model="createDialog.form.customerIdCard" />
          </ElFormItem>
          <ElFormItem label="Địa chỉ">
            <ElInput v-model="createDialog.form.customerAddress" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">🏍️ Thông tin xe</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Dòng xe" required>
            <ElSelect
              v-model="createDialog.selectedVehicleId"
              filterable
              remote
              reserve-keyword
              :remote-method="searchVehicles"
              :loading="vehicleLoading"
              placeholder="Tìm và chọn dòng xe"
              class="w-full"
              @change="handleVehicleChange"
              @focus="() => searchVehicles('')"
            >
              <ElOption
                v-for="v in vehicleOptions"
                :key="v.id"
                :label="(v.productName || v.variantName || '') + ' (' + v.vinNumber + ')'"
                :value="v.id"
              >
                <div class="flex justify-between items-center w-full">
                  <span
                    >{{ v.productName || v.variantName }} ({{ v.colorName }}) - VIN:
                    {{ v.vinNumber }}</span
                  >
                </div>
              </ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Màu sơn">
            <ElInput v-model="createDialog.form.vehicleColor" placeholder="VD: Đen nhám" />
          </ElFormItem>
          <ElFormItem label="Số khung" required>
            <ElInput v-model="createDialog.form.chassisNo" placeholder="VD: RLH12345678" />
          </ElFormItem>
          <ElFormItem label="Số máy" required>
            <ElInput v-model="createDialog.form.engineNo" placeholder="VD: E1234567" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💰 Chi tiết tài chính</ElDivider>
        <div class="grid grid-cols-12 gap-3 financial-grid">
          <ElFormItem label="Giá xe" required label-width="auto" class="col-span-3">
            <ElInputNumber
              v-model="createDialog.form.vehiclePrice"
              :min="0"
              :step="1000000"
              controls-position="right"
              class="!w-full"
              style="width: 100%"
            />
          </ElFormItem>
          <ElFormItem label="Mã voucher" label-width="auto" class="col-span-5">
            <ElSelect
              v-model="createDialog.form.voucherCode"
              clearable
              placeholder="Chọn mã voucher"
              class="!w-full"
              style="width: 100%"
            >
              <ElOption
                v-for="v in voucherOptions"
                :key="v.id"
                :label="
                  v.code +
                  ' - ' +
                  (v.discountType === 'PERCENT'
                    ? `Giảm ${v.discountValue}%`
                    : `Giảm ${formatCurrency(v.discountValue)}`)
                "
                :value="v.code"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Tỷ lệ cọc" required label-width="auto" class="col-span-4">
            <ElSelect
              v-model="createDialog.form.depositPercentage"
              class="!w-full"
              style="width: 100%"
            >
              <ElOption label="Thanh toán đủ (100%)" :value="100" />
              <ElOption label="50%" :value="50" />
              <ElOption label="30%" :value="30" />
              <ElOption label="20%" :value="20" />
              <ElOption label="10%" :value="10" />
              <ElOption label="Không cọc (0%)" :value="0" />
            </ElSelect>
          </ElFormItem>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md mt-4 border border-gray-100 dark:border-gray-700"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600 dark:text-gray-400">Giá xe:</span>
            <span class="font-medium text-gray-800 dark:text-gray-200">{{
              formatCurrency(createDialog.form.vehiclePrice || 0)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center mb-2 text-red-500"
            v-if="calculatedDiscount > 0"
          >
            <span>Giảm giá (Voucher):</span>
            <span class="font-medium">-{{ formatCurrency(calculatedDiscount) }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-600 dark:text-gray-400">Tổng thanh toán:</span>
            <span class="font-bold text-lg text-blue-600 dark:text-blue-400">{{
              formatCurrency(calculatedTotalAmount)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700"
          >
            <span class="text-gray-600 dark:text-gray-400 font-medium"
              >Số tiền cần cọc ({{ createDialog.form.depositPercentage }}%):</span
            >
            <span class="font-bold text-lg text-orange-600 dark:text-orange-400">{{
              formatCurrency(calculatedDeposit)
            }}</span>
          </div>
          <div
            class="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 border-dashed"
            v-if="calculatedRemaining > 0"
          >
            <span class="text-gray-600 dark:text-gray-400 font-medium"
              >Số tiền còn lại (khi nhận xe):</span
            >
            <span class="font-bold text-lg text-green-600 dark:text-green-400">{{
              formatCurrency(calculatedRemaining)
            }}</span>
          </div>
        </div>

        <ElDivider content-position="left">💳 Thanh toán & Giao nhận</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Phương thức" required>
            <ElSelect v-model="createDialog.form.paymentMethod" class="w-full">
              <ElOption label="Chuyển khoản" value="transfer" />
              <ElOption label="Tiền mặt" value="cash" />
              <ElOption label="Trả góp" value="installment" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngân hàng">
            <ElInput
              v-model="createDialog.form.bankName"
              placeholder="VD: Vietcombank, MBBank..."
            />
          </ElFormItem>
          <ElFormItem label="NV bán hàng">
            <ElSelect
              v-model="createDialog.form.salesPerson"
              placeholder="Chọn nhân viên kinh doanh"
              class="w-full"
              clearable
            >
              <ElOption
                v-for="staff in salesStaffOptions"
                :key="staff.id"
                :label="staff.fullName"
                :value="staff.fullName"
              />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngày giao dự kiến">
            <ElDatePicker
              v-model="createDialog.form.deliveryDate"
              type="date"
              placeholder="Chọn ngày giao xe"
              format="DD/MM/YYYY"
              value-format="YYYY-MM-DD"
              class="w-full"
            />
          </ElFormItem>
        </div>

        <ElDivider content-position="left" v-if="createDialog.isEdit"
          >Trạng thái & Hành động</ElDivider
        >
        <div class="grid grid-cols-2 gap-4" v-if="createDialog.isEdit">
          <ElFormItem label="Trạng thái hóa đơn">
            <ElSelect :model-value="createDialog.form.status" class="w-full" disabled>
              <ElOption label="Chờ xử lý" value="pending" />
              <ElOption label="Gửi Admin duyệt" value="processing" />
              <ElOption label="Duyệt / Hoàn tất" value="completed" />
              <ElOption label="Từ chối" value="rejected" />
              <ElOption label="Hủy hóa đơn" value="cancelled" />
            </ElSelect>
          </ElFormItem>

          <ElFormItem label="Hành động">
            <ElSelect v-model="createDialog.form.status" class="w-full">
              <ElOption label="Chờ xử lý" value="pending" />
              <ElOption label="Gửi Admin duyệt" value="processing" />
            </ElSelect>
          </ElFormItem>
        </div>
      </ElForm>

      <template #footer>
        <ElButton @click="createDialog.visible = false">Đóng</ElButton>
        <ElButton
          v-if="
            !(
              createDialog.isEdit &&
              ['processing', 'completed', 'cancelled'].includes(createDialog.originalStatus)
            )
          "
          type="primary"
          :loading="actionLoading"
          @click="handleSave"
        >
          {{ createDialog.isEdit ? 'Lưu thay đổi' : 'Tạo hóa đơn' }}
        </ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue';
import { invoiceApi, type AdminInvoiceDetailResponse } from '@/api/sales/invoice.api';
import { ProductApi } from '@/api/product/product.api';
import { VehicleApi, type Vehicle } from '@/api/vehicle/vehicle.api';
import { VoucherApi } from '@/api/voucher.api';
import { EmployeeApi, type EmployeeResponse } from '@/api/operations/employee.api';

defineOptions({ name: 'OrderProductInvoice' });

interface InvoiceRow {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  customerAddress: string;
  vehicleModel: string;
  vehicleColor: string;
  chassisNo: string;
  engineNo: string;
  vehiclePrice: number;
  registrationFee: number;
  insuranceFee: number;
  voucherCode?: string;
  depositPercentage?: number;
  totalAmount: number;
  paymentMethod: string;
  bankName?: string;
  status: string;
  salesPerson?: string;
  deliveryDate?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  _loading?: boolean;
}

const invoices = ref<InvoiceRow[]>([]);
const loadingList = ref(false);
const actionLoading = ref(false);
const searchQuery = ref('');
const filterStatus = ref<string>('');
const totalCount = ref(0);
const pagination = reactive({ current: 1, size: 10 });

const dialog = reactive({
  visible: false,
  readonly: true,
  title: '',
  invoice: null as any,
});

const createDialog = reactive({
  visible: false,
  isEdit: false,
  editId: undefined as number | undefined,
  originalStatus: undefined as string | undefined,
  selectedVehicleId: undefined as number | undefined,
  form: {
    customerName: '',
    customerPhone: '',
    customerIdCard: '',
    customerAddress: '',
    vehicleModel: '',
    vehicleColor: '',
    chassisNo: '',
    engineNo: '',
    vehiclePrice: 0,
    registrationFee: 0,
    insuranceFee: 0,
    voucherCode: '',
    depositPercentage: 100,
    paymentMethod: 'transfer',
    bankName: '',
    salesPerson: '',
    deliveryDate: '',
  } as any,
});

const statusCounts = computed(() => {
  const all = invoices.value;
  return {
    pending: all.filter((i) => i.status === 'pending').length,
    processing: all.filter((i) => i.status === 'processing').length,
    completed: all.filter((i) => i.status === 'completed').length,
    rejected: all.filter((i) => i.status === 'rejected').length,
    cancelled: all.filter((i) => i.status === 'cancelled').length,
  };
});

const calculatedDiscount = computed(() => {
  if (!createDialog.form.voucherCode) return 0;
  const voucher = voucherOptions.value.find((v) => v.code === createDialog.form.voucherCode);
  if (!voucher) return 0;

  const vehiclePrice = createDialog.form.vehiclePrice || 0;

  if (voucher.discountType === 'PERCENT') {
    let discount = (vehiclePrice * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
      discount = voucher.maxDiscountAmount;
    }
    return discount;
  }

  return voucher.discountValue || 0;
});

const calculatedTotalAmount = computed(() => {
  return Math.max(0, (createDialog.form.vehiclePrice || 0) - calculatedDiscount.value);
});

const calculatedDeposit = computed(() => {
  const percentage = createDialog.form.depositPercentage || 0;
  return (calculatedTotalAmount.value * percentage) / 100;
});

const calculatedRemaining = computed(() => {
  return Math.max(0, calculatedTotalAmount.value - calculatedDeposit.value);
});

const filteredInvoices = computed(() => {
  let result = invoices.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.toLowerCase().includes(q) ||
        inv.chassisNo.toLowerCase().includes(q) ||
        inv.engineNo.toLowerCase().includes(q) ||
        inv.vehicleModel.toLowerCase().includes(q)
    );
  }
  if (filterStatus.value) {
    result = result.filter((inv) => inv.status === filterStatus.value);
  }
  return result;
});

const paginatedInvoices = computed(() => {
  const start = (pagination.current - 1) * pagination.size;
  const end = start + pagination.size;
  return filteredInvoices.value.slice(start, end);
});

const vehicleOptions = ref<Vehicle[]>([]);
const vehicleLoading = ref(false);

async function searchVehicles(keyword: string = '') {
  vehicleLoading.value = true;
  try {
    const filters = [`Status==Available`];
    if (keyword) {
      filters.push(`VinNumber@=${keyword}`);
    }
    const res = await VehicleApi.getList({
      current: 1,
      size: 50,
      Filters: filters.join(','),
    });
    vehicleOptions.value = res.items || [];
  } catch (error) {
    console.error('Lỗi tải danh sách xe:', error);
  } finally {
    vehicleLoading.value = false;
  }
}

async function handleVehicleChange(variantId: number) {
  const vehicle = vehicleOptions.value.find((v) => v.id === variantId);
  if (vehicle) {
    createDialog.form.vehicleModel = vehicle.variantName || vehicle.productName || '';
    createDialog.form.vehicleColor = vehicle.colorName || '';
    createDialog.form.chassisNo = vehicle.vinNumber || '';
    createDialog.form.engineNo = vehicle.engineNumber || '';
    createDialog.form.vehiclePrice = 0;

    if (vehicle.productVariantId) {
      try {
        const variantData = await ProductApi.getVariantsForOutput({
          current: 1,
          size: 1,
          Filters: `id==${vehicle.productVariantId}`,
        });
        if (variantData.items && variantData.items.length > 0) {
          createDialog.form.vehiclePrice = variantData.items[0].price || 0;
        }
      } catch (err) {
        console.error('Lỗi lấy giá xe:', err);
      }
    }
  } else {
    createDialog.form.vehicleModel = '';
    createDialog.form.vehicleColor = '';
    createDialog.form.chassisNo = '';
    createDialog.form.engineNo = '';
    createDialog.form.vehiclePrice = 0;
  }
}

async function fetchInvoices() {
  loadingList.value = true;
  try {
    const res = await invoiceApi.getAdminList({
      Page: 1,
      PageSize: 200,
    });
    invoices.value = (res.items ?? []).map((i) => ({ ...i, _loading: false }));
    totalCount.value = res.totalCount ?? res.items?.length ?? 0;
  } catch (e) {
    ElMessage.error('Không thể tải danh sách hóa đơn');
  } finally {
    loadingList.value = false;
  }
}

function handlePageChange(page: number) {
  pagination.current = page;
}

function handleSizeChange(size: number) {
  pagination.size = size;
  pagination.current = 1;
}

function handleSearch() {
  pagination.current = 1;
}

function handleResetFilters() {
  searchQuery.value = '';
  filterStatus.value = '';
  pagination.current = 1;
  fetchInvoices();
}

function handleView(row: any) {
  dialog.visible = true;
  dialog.readonly = true;
  dialog.title = `Chi tiết hóa đơn ${row.invoiceNumber}`;
  dialog.invoice = { ...row };
}

async function handleSendForApproval(invoice: any) {
  try {
    await ElMessageBox.confirm(
      `Gửi yêu cầu phê duyệt cho hóa đơn ${invoice.invoiceNumber} tới Admin?`,
      'Xác nhận gửi duyệt',
      {
        confirmButtonText: 'Gửi duyệt ngay',
        cancelButtonText: 'Hủy',
        type: 'info',
      }
    );

    invoice._loading = true;
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: 'processing',
      processedBy: 'NV Quản lý đơn',
    });

    ElMessage.success(`Hóa đơn ${invoice.invoiceNumber} đã được gửi Admin duyệt thành công!`);
    invoice.status = 'processing';
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = 'processing';
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Không thể gửi duyệt hóa đơn');
    }
  } finally {
    invoice._loading = false;
    actionLoading.value = false;
  }
}

async function handleApproveInvoice(invoice: any) {
  try {
    await ElMessageBox.confirm(
      `Xác nhận phê duyệt và hoàn tất hóa đơn ${invoice.invoiceNumber}?`,
      'Phê duyệt hóa đơn',
      {
        confirmButtonText: 'Duyệt hoàn tất',
        cancelButtonText: 'Đóng',
        type: 'success',
      }
    );

    invoice._loading = true;
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: 'completed',
      processedBy: 'Admin Tổng',
    });

    ElMessage.success(`Hóa đơn ${invoice.invoiceNumber} đã được duyệt và hoàn tất thành công!`);
    invoice.status = 'completed';
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = 'completed';
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Không thể phê duyệt hóa đơn');
    }
  } finally {
    invoice._loading = false;
    actionLoading.value = false;
  }
}

async function handleCancelInvoice(invoice: any) {
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn hủy hóa đơn ${invoice.invoiceNumber}?`,
      'Cảnh báo hủy hóa đơn',
      {
        confirmButtonText: 'Đồng ý hủy',
        cancelButtonText: 'Bỏ qua',
        type: 'warning',
      }
    );

    invoice._loading = true;
    actionLoading.value = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: 'cancelled',
      processedBy: 'NV Quản lý đơn',
    });

    ElMessage.info(`Hóa đơn ${invoice.invoiceNumber} đã chuyển sang trạng thái đã hủy.`);
    invoice.status = 'cancelled';
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = 'cancelled';
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Không thể hủy hóa đơn');
    }
  } finally {
    invoice._loading = false;
    actionLoading.value = false;
  }
}

async function handleQuickChangeStatus(invoice: any, newStatus: string) {
  try {
    invoice._loading = true;
    await invoiceApi.updateAdminStatus(invoice.id, {
      status: newStatus,
      processedBy: 'NV Quản lý đơn',
    });

    ElMessage.success(
      `Hóa đơn ${invoice.invoiceNumber} đã đổi sang "${getStatusLabel(newStatus)}"`
    );
    invoice.status = newStatus;
    if (dialog.invoice && dialog.invoice.id === invoice.id) {
      dialog.invoice.status = newStatus;
    }
  } catch (e) {
    ElMessage.error('Không thể thay đổi trạng thái');
  } finally {
    invoice._loading = false;
  }
}

const handlePrintInvoice = (invoice: any) => {
  window.print();
};

const handleCreate = () => {
  createDialog.isEdit = false;
  createDialog.editId = undefined;
  createDialog.originalStatus = undefined;
  createDialog.form = {
    customerName: '',
    customerPhone: '',
    customerIdCard: '',
    customerAddress: '',
    vehicleModel: '',
    vehicleColor: '',
    chassisNo: '',
    engineNo: '',
    vehiclePrice: 0,
    registrationFee: 0,
    insuranceFee: 0,
    voucherCode: '',
    depositPercentage: 100,
    paymentMethod: 'transfer',
    bankName: '',
    salesPerson: '',
    deliveryDate: '',
  };
  createDialog.selectedVehicleId = undefined;

  searchVehicles('');
  fetchVouchers();
  fetchSalesStaff();

  createDialog.visible = true;
};

const handleEdit = (row: any) => {
  createDialog.isEdit = true;
  createDialog.editId = row.id;
  createDialog.originalStatus = row.status || 'pending';

  let actionStatus = row.status || 'pending';
  if (['completed', 'rejected', 'cancelled'].includes(actionStatus)) {
    actionStatus = 'pending';
  }

  createDialog.form = {
    customerName: row.customerName || '',
    customerPhone: row.customerPhone || '',
    customerIdCard: row.customerIdCard || '',
    customerAddress: row.customerAddress || '',
    vehicleModel: row.vehicleModel || '',
    vehicleColor: row.vehicleColor || '',
    chassisNo: row.chassisNo || '',
    engineNo: row.engineNo || '',
    vehiclePrice: row.vehiclePrice || 0,
    registrationFee: row.registrationFee || 0,
    insuranceFee: row.insuranceFee || 0,
    voucherCode: row.voucherCode || '',
    depositPercentage: row.depositPercentage ?? 100,
    paymentMethod: row.paymentMethod || 'transfer',
    bankName: row.bankName || '',
    salesPerson: row.salesPerson || '',
    deliveryDate: row.deliveryDate ? row.deliveryDate.substring(0, 10) : '',
    status: actionStatus,
  };
  createDialog.selectedVehicleId = undefined;

  searchVehicles('');
  fetchVouchers();
  fetchSalesStaff();

  createDialog.visible = true;
};

const voucherOptions = ref<any[]>([]);
async function fetchVouchers() {
  try {
    const res = await VoucherApi.getList({ current: 1, size: 50 });
    voucherOptions.value = res.items || [];
  } catch (error) {
    console.error('Lỗi tải danh sách voucher:', error);
  }
}

const salesStaffOptions = ref<EmployeeResponse[]>([]);
async function fetchSalesStaff() {
  try {
    const data = await EmployeeApi.getList();
    salesStaffOptions.value = data.filter(
      (e) => e.jobTitle && e.jobTitle.toLowerCase().includes('kinh doanh')
    );
  } catch (error) {
    console.error('Lỗi tải danh sách nhân viên:', error);
  }
}

async function handleSave() {
  if (!createDialog.form.customerName) {
    ElMessage.warning('Vui lòng nhập tên khách hàng');
    return;
  }
  if (!createDialog.form.customerPhone) {
    ElMessage.warning('Vui lòng nhập số điện thoại');
    return;
  }
  if (!createDialog.form.vehicleModel) {
    ElMessage.warning('Vui lòng nhập dòng xe');
    return;
  }
  try {
    actionLoading.value = true;

    if (createDialog.isEdit && createDialog.editId) {
      await invoiceApi.updateAdmin(createDialog.editId, createDialog.form);
      ElMessage.success('Cập nhật hóa đơn thành công');
    } else {
      await invoiceApi.createAdmin(createDialog.form);
      ElMessage.success('Tạo hóa đơn thành công');
    }

    createDialog.visible = false;
    fetchInvoices();
  } catch (error: any) {
    ElMessage.error(
      error.message || (createDialog.isEdit ? 'Lỗi khi cập nhật hóa đơn' : 'Lỗi khi tạo hóa đơn')
    );
  } finally {
    actionLoading.value = false;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '📝 Chờ xử lý',
    processing: '⏳ Chờ Admin duyệt',
    completed: '✅ Đã hoàn tất',
    rejected: '⚠️ Từ chối',
    cancelled: '❌ Đã hủy',
  };
  return map[status] || status;
}

function getStatusTagType(status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'danger',
  };
  return map[status] || 'info';
}

function getPaymentLabel(method: string) {
  const map: Record<string, string> = {
    transfer: 'Chuyển khoản',
    cash: 'Tiền mặt',
    installment: 'Trả góp',
  };
  return map[method] || method;
}

function getPaymentTagType(method: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    transfer: 'primary',
    cash: 'success',
    installment: 'warning',
  };
  return map[method] || 'info';
}

onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped lang="scss">
.premium-invoice-modal {
  :deep(.el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 16px;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
  }
}

.premium-invoice-body {
  .info-card {
    @apply bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm;
  }
}

.invoices-page {
  padding: 16px;
}

.invoice-list-card {
  border-radius: 8px;
}

.financial-grid :deep(.el-form-item__label) {
  white-space: nowrap !important;
  word-break: keep-all !important;
}

@media print {
  @page {
    margin: 5mm !important;
  }

  body * {
    visibility: hidden;
  }

  .premium-invoice-modal,
  .premium-invoice-modal * {
    visibility: visible;
  }

  .premium-invoice-modal {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }

  .premium-invoice-modal :deep(.el-dialog__headerbtn),
  .premium-invoice-modal :deep(.el-dialog__footer) {
    display: none !important;
  }
}
</style>
