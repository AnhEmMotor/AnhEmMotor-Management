<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div
      class="flex items-center justify-between mb-6 flex-wrap gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <el-icon class="text-primary"><Setting /></el-icon>
          {{ $t("menus.service.workshop.maintenance") }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý danh sách, chu kỳ bảo dưỡng xe máy định kỳ và tính phí dịch
          vụ/sửa chữa.
        </p>
      </div>
      <div>
        <el-button
          type="primary"
          :icon="Plus"
          size="large"
          class="shadow-md hover:shadow-lg transition-all"
          @click="openCreateDrawer"
        >
          Tạo Phiếu Bảo Trì
        </el-button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6">
      <el-form
        :inline="true"
        :model="filters"
        class="flex flex-wrap gap-4 items-center"
      >
        <el-form-item label="Tìm kiếm" class="mb-0">
          <el-input
            v-model="filters.search"
            placeholder="Biển số, tên khách hàng, mã phiếu..."
            clearable
            :prefix-icon="Search"
            class="w-72"
            @keyup.enter="handleSearch"
          />
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
          prop="maintenanceNumber"
          label="Mã Phiếu"
          min-width="150"
        >
          <template #default="{ row }">
            <span
              class="font-mono font-semibold text-primary cursor-pointer hover:underline"
              @click="openDetail(row.id)"
            >
              {{ row.maintenanceNumber }}
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
          prop="maintenanceDate"
          label="Ngày Bảo Trì"
          min-width="150"
        >
          <template #default="{ row }">
            {{ formatDate(row.maintenanceDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="mileage"
          label="ODO (km)"
          min-width="110"
          align="right"
        >
          <template #default="{ row }">
            {{ formatKm(row.mileage) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalCost"
          label="Tổng Chi Phí"
          min-width="140"
          align="right"
        >
          <template #default="{ row }">
            <span class="font-bold text-primary">{{
              formatPrice(row.totalCost)
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Thao tác"
          width="130"
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
            >
              Chi tiết
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

    <!-- Drawer Tạo Mới Phiếu Bảo Trì -->
    <el-drawer
      v-model="createDrawerVisible"
      title="TẠO MỚI PHIẾU BẢO TRÌ & CHĂM SÓC XE"
      size="50%"
      :destroy-on-close="true"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-position="top"
        class="space-y-6"
      >
        <!-- Nhóm 1: Thông tin khách hàng -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><User /></el-icon>
            Thông tin khách hàng
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item label="Số điện thoại" prop="customerPhone">
              <el-input
                v-model="form.customerPhone"
                placeholder="Nhập SĐT khách hàng (10 số)"
                clearable
                @input="handlePhoneInput"
              />
            </el-form-item>
            <el-form-item label="Họ tên khách hàng" prop="customerName">
              <el-input
                v-model="form.customerName"
                placeholder="Họ tên khách hàng"
                :disabled="isReadOnlyCustomer"
              />
            </el-form-item>
          </div>

          <div
            v-if="customerVehicles.length > 0"
            class="mt-4 p-3 bg-white rounded border border-slate-100"
          >
            <div class="text-xs font-semibold text-slate-500 mb-2">
              DANH SÁCH XE CỦA KHÁCH HÀNG:
            </div>
            <ul class="text-xs text-slate-600 list-disc pl-4 space-y-1">
              <li v-for="v in customerVehicles" :key="v.id">
                Biển số:
                <span
                  class="font-bold text-primary cursor-pointer hover:underline"
                  @click="selectVehicle(v)"
                  >{{ v.licensePlate }}</span
                >
                - Vin: {{ v.vinNumber }} - ODO gần nhất:
                {{ v.currentOdo || 0 }} km
              </li>
            </ul>
          </div>
        </div>

        <!-- Nhóm 2: Thông tin xe -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><Setting /></el-icon>
            Thông tin xe
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-form-item label="Biển số xe" prop="licensePlate">
              <el-input
                v-model="form.licensePlate"
                placeholder="VD: 29-A1 999.99"
                clearable
                @input="handlePlateInput"
              />
            </el-form-item>
            <el-form-item label="Màu sắc" prop="vehicleColor">
              <el-input
                v-model="form.vehicleColor"
                placeholder="Tự động điền"
                disabled
              />
            </el-form-item>
            <el-form-item label="Hãng xe" prop="vehicleBrand">
              <el-input
                v-model="form.vehicleBrand"
                placeholder="Tự động điền"
                disabled
              />
            </el-form-item>
          </div>

          <!-- Lịch sử sửa chữa/bảo hành xe -->
          <div
            v-if="vehicleHistory.length > 0"
            class="mt-4 p-3 bg-white rounded border border-slate-100"
          >
            <div class="text-xs font-semibold text-slate-500 mb-2">
              LỊCH SỬ BẢO DƯỠNG XE NÀY:
            </div>
            <el-timeline class="mt-2 max-h-40 overflow-y-auto pl-1">
              <el-timeline-item
                v-for="(h, idx) in vehicleHistory"
                :key="idx"
                :timestamp="formatDateOnly(h.createdAt)"
                type="primary"
              >
                <div class="text-xs font-medium text-slate-700">
                  Mã lệnh: {{ h.repairOrderNumber || "MNT-RO" }} - ODO:
                  {{ h.mileage }} km
                </div>
                <div class="text-xs text-slate-500 mt-0.5">
                  Nội dung: {{ h.description || "Bảo trì định kỳ" }}
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>

        <!-- Nhóm 3: Kiểm tra thông số kỹ thuật bảo trì -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><Warning /></el-icon>
            Kiểm tra thông số kỹ thuật bảo trì
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <el-form-item
              label="Lần bảo trì gần nhất (ODO km)"
              prop="lastMaintenanceOdo"
            >
              <el-input-number
                v-model="form.lastMaintenanceOdo"
                :min="0"
                style="width: 100%"
                disabled
              />
            </el-form-item>
            <el-form-item label="Số km hiện tại (ODO)" prop="currentOdo">
              <el-input-number
                v-model="form.currentOdo"
                :min="0"
                style="width: 100%"
                placeholder="Nhập ODO hiện tại"
              />
            </el-form-item>
            <el-form-item label="Chu kỳ bảo trì (km)" prop="cycleKm">
              <el-input-number
                v-model="form.cycleKm"
                :min="0"
                style="width: 100%"
                placeholder="Mặc định: 5000"
              />
            </el-form-item>
          </div>

          <!-- Trạng thái tính toán bảo trì -->
          <div v-if="vehicleSearched" class="mt-4">
            <!-- Quá hạn -->
            <div
              v-if="kmRemaining < 0"
              class="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3"
            >
              <el-icon class="text-rose-600 text-xl mt-0.5"
                ><Warning
              /></el-icon>
              <div>
                <div class="text-sm font-bold text-rose-800">
                  Xe đã quá kỳ bảo dưỡng định kỳ!
                </div>
                <div class="text-xs text-rose-600 mt-1">
                  Đã vượt chu kỳ
                  <span class="font-bold text-rose-800">{{
                    formatKm(Math.abs(kmRemaining))
                  }}</span
                  >. Hãy đề xuất kiểm tra toàn diện để đảm bảo an toàn vận hành.
                </div>
              </div>
            </div>
            <!-- Còn hạn -->
            <div
              v-else
              class="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3"
            >
              <el-icon class="text-emerald-600 text-xl mt-0.5"
                ><Check
              /></el-icon>
              <div>
                <div class="text-sm font-bold text-emerald-800">
                  Xe còn trong hạn bảo dưỡng an toàn
                </div>
                <div class="text-xs text-emerald-600 mt-1">
                  Còn lại
                  <span class="font-bold text-emerald-800">{{
                    formatKm(kmRemaining)
                  }}</span>
                  đến kỳ bảo dưỡng tiếp theo.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nhóm 4: Thông tin tiếp nhận -->
        <div class="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3
            class="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2"
          >
            <el-icon class="text-primary"><Edit /></el-icon>
            Tiếp nhận &amp; Chi phí bảo trì
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <el-form-item label="Kỹ thuật viên thực hiện" prop="technicianId">
                <el-select
                  v-model="form.technicianId"
                  placeholder="Chọn kỹ thuật viên thực hiện"
                  class="w-full"
                  filterable
                >
                  <el-option
                    v-for="emp in technicians"
                    :key="emp.id"
                    :label="`${emp.fullName} (${emp.jobTitle})`"
                    :value="emp.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                label="Chi phí sửa chữa (Nhân công)"
                prop="laborCost"
              >
                <el-input-number
                  v-model="form.laborCost"
                  :min="0"
                  style="width: 100%"
                  placeholder="Bắt buộc nhập phí sửa chữa"
                />
              </el-form-item>
            </div>

            <el-form-item
              label="Yêu cầu bảo trì / Mô tả tình trạng"
              prop="description"
            >
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="Nhập chi tiết các bộ phận cần bảo dưỡng hoặc yêu cầu đặc biệt của khách hàng..."
              />
            </el-form-item>

            <!-- Bảng phụ tùng thay thế -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span
                  class="text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >Danh sách phụ tùng thay thế (nếu có)</span
                >
                <el-button
                  type="primary"
                  size="small"
                  :icon="Plus"
                  plain
                  @click="addPart"
                  >Thêm phụ tùng</el-button
                >
              </div>

              <el-table :data="form.parts" border size="small">
                <el-table-column label="Tên Phụ Tùng" min-width="200">
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="'parts.' + $index + '.selectedVariantId'"
                      :rules="partRules.selectedVariantId"
                      class="mb-0"
                    >
                      <el-select
                        v-model="row.selectedVariantId"
                        placeholder="Chọn phụ tùng"
                        filterable
                        class="w-full"
                        @change="(val) => handlePartSelect(val, row)"
                      >
                        <el-option
                          v-for="p in availableParts"
                          :key="p.id"
                          :label="p.displayName"
                          :value="p.id"
                        />
                      </el-select>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="Đơn giá" width="130">
                  <template #default="{ row, $index }">
                    <el-form-item
                      :prop="'parts.' + $index + '.unitPrice'"
                      :rules="partRules.unitPrice"
                      class="mb-0"
                    >
                      <el-input-number
                        v-model="row.unitPrice"
                        :min="0"
                        style="width: 100%"
                        :controls="false"
                      />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="Số lượng" width="100">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.quantity"
                      :min="1"
                      size="small"
                      style="width: 100%"
                      :controls="true"
                      @change="row.total = row.unitPrice * row.quantity"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="Thành tiền" width="120" align="right">
                  <template #default="{ row }">
                    <span class="font-semibold text-slate-700">{{
                      formatPrice(row.total || row.unitPrice * row.quantity)
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Thao tác" width="70" align="center">
                  <template #default="{ $index }">
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      circle
                      @click="removePart($index)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- Tổng chi phí tính real-time -->
            <div
              class="mt-4 p-4 bg-slate-900 text-white rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm border border-slate-800"
            >
              <div>
                <div class="text-xs text-slate-400 font-medium">
                  Chi phí sửa chữa (Công thợ)
                </div>
                <div class="text-lg font-bold text-amber-400 mt-1">
                  {{ formatPrice(form.laborCost) }}
                </div>
              </div>
              <div>
                <div class="text-xs text-slate-400 font-medium">
                  Tổng tiền linh kiện phụ tùng
                </div>
                <div class="text-lg font-bold text-amber-400 mt-1">
                  {{ formatPrice(totalPartsCost) }}
                </div>
              </div>
              <div class="border-l border-slate-800 pl-4">
                <div class="text-xs text-slate-400 font-medium">
                  TỔNG THANH TOÁN (TẠM TÍNH)
                </div>
                <div class="text-xl font-black text-primary mt-1">
                  {{ formatPrice(totalFinalCost) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-3 p-4 border-t border-slate-100">
          <el-button @click="createDrawerVisible = false">Hủy bỏ</el-button>
          <el-button type="primary" :loading="submitting" @click="submitForm"
            >Tạo Phiếu Bảo Trì</el-button
          >
        </div>
      </template>
    </el-drawer>

    <!-- Drawer Xem Chi Tiết Bảo Trì -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="CHI TIẾT PHIẾU BẢO TRÌ & BẢO DƯỠNG"
      size="45%"
      :destroy-on-close="true"
    >
      <div v-if="detailLoading" class="p-6 text-center" v-loading="true">
        Đang tải thông tin chi tiết...
      </div>
      <div v-else-if="detailData" class="space-y-6 text-slate-700">
        <!-- Mã phiếu & Ngày tạo -->
        <div
          class="p-4 bg-slate-50 border rounded-lg flex items-center justify-between"
        >
          <div>
            <span
              class="text-xs text-slate-400 block uppercase tracking-wider font-semibold"
              >Mã phiếu bảo trì</span
            >
            <span class="text-lg font-mono font-bold text-primary">{{
              detailData.maintenanceNumber
            }}</span>
          </div>
          <div class="text-right">
            <span
              class="text-xs text-slate-400 block uppercase tracking-wider font-semibold"
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
                <span class="text-slate-400">Họ tên:</span>
                <span class="font-bold text-slate-800">{{
                  detailData.customerName || "N/A"
                }}</span>
              </div>
              <div>
                <span class="text-slate-400">Số điện thoại:</span>
                <span class="font-medium">{{
                  detailData.customerPhone || "N/A"
                }}</span>
              </div>
              <div>
                <span class="text-slate-400">Địa chỉ:</span>
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
                <span class="text-slate-400">Biển số:</span>
                <span class="font-bold text-slate-800">{{
                  detailData.vehiclePlate || "N/A"
                }}</span>
              </div>
              <div>
                <span class="text-slate-400">Số khung (VIN):</span>
                <span class="font-mono font-medium">{{
                  detailData.vehicleVin || "N/A"
                }}</span>
              </div>
              <div>
                <span class="text-slate-400">Dòng xe:</span>
                <span>{{ detailData.vehicleYear || "N/A" }}</span>
              </div>
              <div>
                <span class="text-slate-400">Màu sắc:</span>
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
              class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold"
            >
              Chỉ số ODO
            </div>
            <div class="text-sm font-bold text-slate-800 mt-1">
              {{ formatKm(detailData.mileage) }}
            </div>
          </div>
          <div>
            <div
              class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold"
            >
              Kỹ thuật viên
            </div>
            <div class="text-sm font-bold text-slate-800 mt-1">
              {{ detailData.technicianName || "Chưa chỉ định" }}
            </div>
          </div>
          <div>
            <div
              class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold"
            >
              Kỳ tiếp theo (ODO)
            </div>
            <div class="text-sm font-bold text-primary mt-1">
              {{ formatKm(detailData.nextMaintenanceOdo || 0) }}
            </div>
          </div>
          <div>
            <div
              class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold"
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
            class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1"
          >
            Mô tả tình trạng &amp; Yêu cầu bảo dưỡng
          </div>
          <p
            class="text-xs text-slate-800 bg-slate-50 p-3 rounded border whitespace-pre-line leading-relaxed"
          >
            {{ detailData.description || "Không có mô tả chi tiết." }}
          </p>
        </div>

        <!-- Danh sách phụ tùng thay thế -->
        <div>
          <div
            class="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2"
          >
            Phụ tùng thay thế trong đợt bảo dưỡng
          </div>
          <el-table
            :data="detailData.parts"
            border
            size="small"
            header-cell-class-name="bg-slate-50 font-semibold text-slate-700"
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
          class="p-4 bg-slate-900 text-white rounded-lg shadow-sm border border-slate-800 space-y-3"
        >
          <div
            class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2"
          >
            Chi tiết chi phí dịch vụ
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Tiền công thợ / Sửa chữa:</span>
            <span class="font-semibold">{{
              formatPrice(detailData.laborCost)
            }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Tiền linh kiện phụ tùng:</span>
            <span class="font-semibold">{{
              formatPrice(detailData.partsCost)
            }}</span>
          </div>
          <div
            class="border-t border-slate-800 pt-3 flex justify-between items-baseline"
          >
            <span class="text-slate-300 font-bold text-xs"
              >TỔNG CỘNG THANH TOÁN:</span
            >
            <span class="text-lg font-black text-primary">{{
              formatPrice(detailData.totalCost)
            }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end p-4 border-t border-slate-100">
          <el-button @click="detailDrawerVisible = false"
            >Đóng cửa sổ</el-button
          >
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  Setting,
  Plus,
  Search,
  View,
  User,
  Warning,
  Edit,
  Delete,
  Check,
} from "@element-plus/icons-vue";
import {
  MaintenanceApi,
  MaintenanceTicketDetail,
} from "@/api/service/maintenance.api";
import { VehicleApi } from "@/api/vehicle/vehicle.api";
import { EmployeeApi } from "@/api/operations/employee.api";
import { ProductApi } from "@/api/product/product.api";
import dayjs from "dayjs";

// Filters & State
const loading = ref(false);
const submitting = ref(false);
const createDrawerVisible = ref(false);
const detailDrawerVisible = ref(false);
const detailLoading = ref(false);
const formRef = ref<FormInstance>();

const filters = reactive({
  search: "",
});

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
});

type MaintenanceRow = {
  id: number;
  maintenanceNumber: string;
  vehiclePlate?: string;
  customerName?: string;
  customerPhone?: string;
  maintenanceDate: string;
  mileage: number;
  totalCost: number;
};

const tableData = ref<MaintenanceRow[]>([]);
const technicians = ref<any[]>([]);
const customerVehicles = ref<any[]>([]);
const vehicleHistory = ref<any[]>([]);
const vehicleSearched = ref(false);
const isReadOnlyCustomer = ref(false);
const detailData = ref<MaintenanceTicketDetail | null>(null);

// Form
const form = reactive({
  customerPhone: "",
  customerName: "",
  licensePlate: "",
  vehicleColor: "",
  vehicleBrand: "",
  lastMaintenanceOdo: 0,
  currentOdo: 0,
  cycleKm: 5000,
  cycleMonths: 6,
  technicianId: "" as any,
  laborCost: 0,
  description: "",
  parts: [] as Array<{
    selectedVariantId?: number;
    partName: string;
    partCode: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>,
});

// Part inline validation rules
const partRules = {
  selectedVariantId: [
    { required: true, message: "Chọn phụ tùng", trigger: "change" },
  ],
  unitPrice: [{ required: true, message: "Nhập đơn giá", trigger: "blur" }],
};

// Form main validation rules
const formRules = reactive<FormRules>({
  customerPhone: [
    { required: true, message: "Vui lòng nhập số điện thoại", trigger: "blur" },
    {
      pattern: /^(03|05|07|08|09)\d{8}$/,
      message:
        "Số điện thoại Việt Nam không hợp lệ (10 số, bắt đầu bằng 03/05/07/08/09)",
      trigger: "blur",
    },
  ],
  customerName: [
    {
      required: true,
      message: "Vui lòng nhập họ tên khách hàng",
      trigger: "blur",
    },
  ],
  licensePlate: [
    { required: true, message: "Vui lòng nhập biển số xe", trigger: "blur" },
  ],
  currentOdo: [
    {
      required: true,
      message: "Vui lòng nhập số km hiện tại",
      trigger: "blur",
    },
  ],
  laborCost: [
    {
      required: true,
      message: "Vui lòng nhập phí sửa chữa / nhân công",
      trigger: "blur",
    },
  ],
  technicianId: [
    {
      required: true,
      message: "Vui lòng chọn kỹ thuật viên",
      trigger: "change",
    },
  ],
  description: [
    {
      required: true,
      message: "Vui lòng nhập yêu cầu bảo trì",
      trigger: "blur",
    },
  ],
});

// Computed properties
const kmRemaining = computed(() => {
  if (!vehicleSearched.value) return 0;
  // Số km còn lại đến kỳ tiếp theo
  // = Chu kỳ - (ODO hiện tại - ODO gần nhất)
  return form.cycleKm - (form.currentOdo - form.lastMaintenanceOdo);
});

const totalPartsCost = computed(() => {
  return form.parts.reduce((sum, part) => {
    return sum + (part.unitPrice * part.quantity || 0);
  }, 0);
});

const totalFinalCost = computed(() => {
  return form.laborCost + totalPartsCost.value;
});

// Methods
const formatDate = (val: string) => {
  if (!val) return "N/A";
  return dayjs(val).format("DD/MM/YYYY HH:mm");
};

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

const formatKm = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val) + " km";
};

// APIs integration
async function loadData() {
  loading.value = true;
  try {
    const sieveFilters: string[] = [];
    if (filters.search) {
      sieveFilters.push(`search==${filters.search}`);
    }

    const res = await MaintenanceApi.getList({
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
    console.error("Lỗi khi tải danh sách bảo trì:", error);
    ElMessage.error("Không thể tải danh sách phiếu bảo trì.");
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

// Chi tiết bảo trì (Drawer)
async function openDetail(id: number) {
  detailDrawerVisible.value = true;
  detailLoading.value = true;
  detailData.value = null;
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

// Drawer Tạo Mới
async function openCreateDrawer() {
  // Reset form
  Object.assign(form, {
    customerPhone: "",
    customerName: "",
    licensePlate: "",
    vehicleColor: "",
    vehicleBrand: "",
    lastMaintenanceOdo: 0,
    currentOdo: 0,
    cycleKm: 5000,
    cycleMonths: 6,
    technicianId: "",
    laborCost: 0,
    description: "",
    parts: [],
  });

  customerVehicles.value = [];
  vehicleHistory.value = [];
  vehicleSearched.value = false;
  isReadOnlyCustomer.value = false;
  createDrawerVisible.value = true;
  void loadAvailableParts();

  // Load employees
  try {
    const res = await EmployeeApi.getList();
    technicians.value = res || [];
  } catch (error) {
    console.error("Lỗi lấy danh sách nhân viên:", error);
  }
}

// Tra cứu khách hàng theo SĐT
let phoneTimeout: any = null;
function handlePhoneInput() {
  if (phoneTimeout) clearTimeout(phoneTimeout);

  const phone = form.customerPhone.trim();
  if (/^\d{10}$/.test(phone)) {
    phoneTimeout = setTimeout(async () => {
      try {
        const res = await VehicleApi.getPortfolio({
          query: phone,
          queryType: "phone",
          page: 1,
          pageSize: 10,
        });

        if (res && res.vehicle) {
          form.customerName = res.vehicle.fullName;
          isReadOnlyCustomer.value = true;
          // Hiển thị danh sách xe
          customerVehicles.value = [res.vehicle];
        } else {
          isReadOnlyCustomer.value = false;
          customerVehicles.value = [];
        }
      } catch (err) {
        console.error("Lỗi tra cứu SĐT:", err);
      }
    }, 400);
  } else {
    isReadOnlyCustomer.value = false;
    customerVehicles.value = [];
  }
}

// Tra cứu xe theo Biển số xe
let plateTimeout: any = null;
function handlePlateInput() {
  if (plateTimeout) clearTimeout(plateTimeout);

  const plate = form.licensePlate.trim();
  if (plate.length >= 7) {
    plateTimeout = setTimeout(async () => {
      try {
        const res = await VehicleApi.getPortfolio({
          query: plate,
          queryType: "licensePlate",
          page: 1,
          pageSize: 10,
        });

        if (res && res.vehicle) {
          form.customerName = res.vehicle.fullName;
          form.customerPhone = res.vehicle.phoneNumber;
          form.vehicleColor = res.vehicle.colorName || "N/A";
          form.vehicleBrand =
            `${res.vehicle.brandName || ""} ${res.vehicle.variantName || ""}`.trim() ||
            "N/A";

          // ODO bảo trì gần nhất
          form.lastMaintenanceOdo = res.vehicle.currentOdo || 0;
          form.currentOdo = res.vehicle.currentOdo || 0;

          isReadOnlyCustomer.value = true;
          vehicleSearched.value = true;

          // Lịch sử bảo trì
          vehicleHistory.value = res.history || [];
        } else {
          vehicleSearched.value = false;
          vehicleHistory.value = [];
        }
      } catch (err) {
        console.error("Lỗi tra cứu biển số:", err);
        vehicleSearched.value = false;
        vehicleHistory.value = [];
      }
    }, 400);
  } else {
    vehicleSearched.value = false;
    vehicleHistory.value = [];
  }
}

// Chọn nhanh xe từ danh sách của khách
function selectVehicle(v: any) {
  form.licensePlate = v.licensePlate;
  form.vehicleColor = v.colorName || "N/A";
  form.vehicleBrand =
    `${v.brandName || ""} ${v.variantName || ""}`.trim() || "N/A";
  form.lastMaintenanceOdo = v.currentOdo || 0;
  form.currentOdo = v.currentOdo || 0;
  vehicleSearched.value = true;

  // Load thêm lịch sử xe
  handlePlateInput();
}

const availableParts = ref<any[]>([]);

async function loadAvailableParts() {
  try {
    const res = await ProductApi.getVariantsForOutput({
      current: 1,
      size: 500,
    });
    if (res && res.items) {
      availableParts.value = res.items;
    }
  } catch (error) {
    console.error("Lỗi lấy danh sách phụ tùng:", error);
  }
}

function handlePartSelect(variantId: number, row: any) {
  const variant = availableParts.value.find((p) => p.id === variantId);
  if (variant) {
    row.partName = variant.displayName;
    row.partCode = variant.sku || String(variant.id);
    row.unitPrice = variant.price || 0;
    row.total = row.unitPrice * row.quantity;
  }
}

// Quản lý phụ tùng
function addPart() {
  form.parts.push({
    selectedVariantId: undefined,
    partName: "",
    partCode: "",
    unitPrice: 0,
    quantity: 1,
    total: 0,
  });
}

function removePart(index: number) {
  form.parts.splice(index, 1);
}

// Submit Form tạo mới bảo trì
async function submitForm() {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.warning("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (form.currentOdo < form.lastMaintenanceOdo) {
      ElMessage.warning(
        "Số ODO hiện tại không được nhỏ hơn ODO lần bảo trì gần nhất.",
      );
      return;
    }

    submitting.value = true;
    try {
      const backendParts: any[] = [];
      for (const p of form.parts) {
        const qty = p.quantity || 1;
        for (let i = 0; i < qty; i++) {
          backendParts.push({
            partName: p.partName,
            partCode: p.partCode,
            unitPrice: p.unitPrice,
          });
        }
      }

      await MaintenanceApi.create({
        licensePlate: form.licensePlate,
        description: form.description,
        mileage: form.currentOdo,
        technicianId: form.technicianId,
        laborCost: form.laborCost,
        cycleKm: form.cycleKm,
        cycleMonths: form.cycleMonths,
        parts: backendParts,
      });

      ElMessage.success("Tạo phiếu bảo trì thành công!");
      createDrawerVisible.value = false;
      handleSearch();
    } catch (error: any) {
      console.error("Lỗi tạo phiếu bảo trì:", error);
      ElMessage.error(error.message || "Tạo phiếu bảo trì thất bại.");
    } finally {
      submitting.value = false;
    }
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.maintenance-page {
  color: #0f172a;
}
</style>
