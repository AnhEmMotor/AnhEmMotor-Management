<template>
  <div class="flex flex-col gap-4 pb-5">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <ArtStatsCard
        :title="$t('menus.product.list.stats.total')"
        :count="pagination.total"
        description="Tổng số sản phẩm trong hệ thống"
        icon="ri:box-3-line"
        iconStyle="bg-primary"
      />
      <ArtStatsCard
        :title="$t('menus.product.list.stats.stock')"
        :count="1250"
        description="Tổng số lượng hàng trong kho"
        icon="ri:database-2-line"
        iconStyle="bg-success"
      />
      <ArtStatsCard
        :title="$t('menus.product.list.stats.active')"
        :count="pagination.total - 2"
        description="Sản phẩm đang hiển thị trên web"
        icon="ri:eye-line"
        iconStyle="bg-info"
      />
      <ArtStatsCard
        :title="$t('menus.product.list.stats.outOfStock')"
        :count="2"
        description="Sản phẩm hiện đang hết hàng"
        icon="ri:error-warning-line"
        iconStyle="bg-warning"
      />
    </div>

    <ArtSearchBar
      :items="searchItems"
      :label-width="120"
      :span="6"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" v-ripple @click="handleAdd">
            <ElIcon><Plus /></ElIcon> Thêm mới
          </ElButton>
          <ElButton v-ripple @click="exportToExcel">
            <ElIcon><Download /></ElIcon> Xuất Excel
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #cover_image_url="{ row }">
          <div
            class="inline-flex items-center justify-center h-12 w-12 bg-gray-50 rounded shadow-inner border border-gray-100 overflow-hidden align-middle"
          >
            <ElImage
              v-if="row.cover_image_url"
              :src="row.cover_image_url"
              class="w-full h-full"
              fit="cover"
              :preview-src-list="[row.cover_image_url]"
              preview-teleported
            />
            <ElIcon v-else class="text-gray-300"><Picture /></ElIcon>
          </div>
        </template>

        <template #name="{ row }">
          <div class="flex flex-col">
            <span
              class="font-bold text-gray-800 leading-tight text-left"
              :class="{ 'text-xs text-gray-600 font-normal': row.isVariant }"
              >{{ row.name }}</span
            >
            <span class="text-[11px] text-gray-400 mt-1 text-left">
              <span v-if="row.isVariant">SKU: {{ row.sku }}</span>
            </span>
          </div>
        </template>

        <template #inventory_status="{ row }">
          <ElTag :type="getStatusType(row.inventory_status)" size="small" effect="light" round>
            {{ getStatusLabel(row.inventory_status) }}
          </ElTag>
        </template>

        <template #operation="{ row }">
          <div v-if="!row.isVariant" class="flex gap-2 justify-center">
            <ArtButtonTable type="edit" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" @click="handleDelete(row)" />
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="1350px"
      class="premium-dialog"
      align-center
      append-to-body
      destroy-on-close
    >
      <ElForm :model="formData" label-width="120px" class="space-y-0">
        <ElTabs v-model="activeTab" type="border-card" class="form-tabs">
          <ElTabPane name="common" label="Thông tin chung">
            <div class="tab-scroll-container">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5 py-2">
                <div
                  class="bg-gray-50/50 p-4 border border-gray-150 rounded-xl space-y-4 shadow-sm flex flex-col justify-start"
                >
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2"
                    >Thông tin cơ bản</div
                  >
                  <div>
                    <label
                      class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Danh Mục <span class="text-red-500">*</span>
                    </label>
                    <ElTreeSelect
                      v-model="formData.category_id"
                      :data="categoryTree"
                      node-key="id"
                      :props="{
                        label: 'name',
                        children: 'children'
                      }"
                      placeholder="Chọn thể loại"
                      clearable
                      check-strictly
                      default-expand-all
                      class="w-full"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Thương Hiệu <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <div
                        class="flex-1 flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm hover:border-primary/30 transition-all cursor-pointer min-h-[38px]"
                        @click="openBrandSelector((brand) => (formData.brand_id = brand.id))"
                      >
                        <div class="flex items-center gap-2">
                          <ElIcon class="text-gray-400"><InfoFilled /></ElIcon>
                          <span
                            v-if="formData.brand_id"
                            class="text-sm font-semibold text-gray-800"
                          >
                            {{ getBrandNameById(formData.brand_id) }}
                          </span>
                          <span v-else class="text-sm text-gray-400">Chọn thương hiệu...</span>
                        </div>
                        <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Tên sản phẩm
                      <span class="text-red-500">*</span>
                    </label>
                    <ElInput v-model="formData.name" placeholder="Nhập tên sản phẩm..." />
                  </div>
                </div>

                <div
                  class="bg-gray-50/50 p-4 border border-gray-150 rounded-xl space-y-4 shadow-sm flex flex-col justify-start"
                >
                  <div class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2"
                    >Tối ưu hóa tìm kiếm (SEO)</div
                  >
                  <div>
                    <label
                      class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Tiêu đề SEO (Meta Title)
                    </label>
                    <ElInput v-model="formData.meta_title" placeholder="Tối ưu cho SEO..." />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Mô tả SEO (Meta Description)
                    </label>
                    <ElInput
                      v-model="formData.meta_description"
                      type="textarea"
                      :rows="2"
                      placeholder="Nhập mô tả SEO..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-xs !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Mô tả ngắn (Short Description)
                    </label>
                    <ElInput
                      v-model="formData.short_description"
                      type="textarea"
                      :rows="2"
                      placeholder="Nhập mô tả ngắn..."
                    />
                  </div>
                </div>

                <div
                  class="md:col-span-2 mt-2 bg-gray-50/50 p-4 border border-gray-150 rounded-xl shadow-sm"
                >
                  <label
                    class="el-form-item__label !text-xs !font-bold !text-gray-700 !h-auto !leading-none !pb-2 block"
                  >
                    Mô Tả Chi Tiết Sản Phẩm
                  </label>
                  <ElInput
                    v-model="formData.description"
                    type="textarea"
                    :rows="4"
                    placeholder="Nhập mô tả chi tiết..."
                  />
                </div>
              </div>
            </div>
          </ElTabPane>

          <ElTabPane name="specs" label="Thông số & Đặc tính">
            <div class="tab-scroll-container space-y-4">
              <div
                class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
              >
                <div
                  class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors"
                  @click="toggleSpecGroup('part_specs')"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span class="font-bold text-gray-800 text-sm"
                      >Đặc tính kỹ thuật & Kích thước, Trọng lượng</span
                    >
                  </div>
                  <ElIcon
                    class="text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': activeSpecGroup === 'part_specs' }"
                  >
                    <ArrowDown />
                  </ElIcon>
                </div>

                <div
                  v-show="activeSpecGroup === 'part_specs'"
                  class="p-4 border-t border-gray-100 bg-white grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Chất liệu</label
                    >
                    <ElInput
                      v-model="formData.material"
                      placeholder="Ví dụ: Nhôm CNC, Thép, Carbon..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Xuất xứ</label
                    >
                    <ElInput v-model="formData.origin" placeholder="Ví dụ: Nhật Bản, Thái Lan..." />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Thời gian bảo hành</label
                    >
                    <ElInput
                      v-model="formData.warranty_period"
                      placeholder="Ví dụ: 12 tháng, 2 năm..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Đơn vị tính</label
                    >
                    <ElSelect
                      v-model="formData.unit"
                      placeholder="Chọn đơn vị tính"
                      class="w-full"
                      allow-create
                      filterable
                    >
                      <ElOption label="Chiếc" value="Chiếc" />
                      <ElOption label="Cái" value="Cái" />
                      <ElOption label="Cặp" value="Cặp" />
                      <ElOption label="Bộ" value="Bộ" />
                      <ElOption label="Hộp" value="Hộp" />
                      <ElOption label="Thùng" value="Thùng" />
                    </ElSelect>
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Kích cỡ lốp (Vỏ)</label
                    >
                    <ElInput v-model="formData.tire_size" placeholder="Ví dụ: 90/80-17" />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Dung tích bình xăng (lít)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.fuel_capacity"
                      :min="0"
                      :precision="1"
                      :step="0.1"
                      class="w-full"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Trọng lượng (kg)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.weight"
                      :min="1"
                      class="w-full"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Khoảng cách trục bánh xe (mm)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.wheelbase"
                      :min="0"
                      class="w-full"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Độ cao yên xe (mm)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.seat_height"
                      :min="0"
                      class="w-full"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Khoảng sáng gầm xe (mm)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.ground_clearance"
                      :min="0"
                      class="w-full"
                      placeholder="0"
                    />
                  </div>
                  <div class="md:col-span-2 col-span-2">
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Kích thước (D x R x C)</label
                    >
                    <ElInput
                      v-model="formData.dimensions"
                      placeholder="Ví dụ: 1888 x 678 x 1111 mm hoặc 300 x 200 x 150 mm"
                    />
                  </div>
                </div>
              </div>

              <div
                class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
              >
                <div
                  class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors"
                  @click="toggleSpecGroup('engine_specs')"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span class="font-bold text-gray-800 text-sm"
                      >Thông số Xe - Động cơ & Truyền động</span
                    >
                  </div>
                  <ElIcon
                    class="text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': activeSpecGroup === 'engine_specs' }"
                  >
                    <ArrowDown />
                  </ElIcon>
                </div>

                <div
                  v-show="activeSpecGroup === 'engine_specs'"
                  class="p-4 border-t border-gray-100 bg-white grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Loại động cơ</label
                    >
                    <ElInput
                      v-model="formData.engine_type"
                      placeholder="Xăng, 4 kỳ, 1 xy-lanh..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Dung tích xy-lanh (cc)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.displacement"
                      :min="0"
                      :precision="1"
                      :step="0.1"
                      class="w-full"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Đường kính x Hành trình piston</label
                    >
                    <ElInput v-model="formData.bore_stroke" placeholder="Ví dụ: 52.4 x 57.9 mm" />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Tỷ số nén</label
                    >
                    <ElInput v-model="formData.compression_ratio" placeholder="Ví dụ: 11.0:1" />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Công suất tối đa</label
                    >
                    <ElInput
                      v-model="formData.max_power"
                      placeholder="Ví dụ: 8.2 kW tại 8500 vòng/phút"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Mô-men xoắn cực đại</label
                    >
                    <ElInput
                      v-model="formData.max_torque"
                      placeholder="Ví dụ: 10.3 Nm tại 5000 vòng/phút"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Hệ thống phun xăng / cấp nhiên liệu</label
                    >
                    <ElInput
                      v-model="formData.fuel_system"
                      placeholder="Phun xăng điện tử PGM-FI, Fi..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Loại truyền động (Hộp số)</label
                    >
                    <ElInput
                      v-model="formData.transmission_type"
                      placeholder="Vô cấp, đai truyền, Côn tay 6 số..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Hệ thống khởi động</label
                    >
                    <ElInput
                      v-model="formData.starter_system"
                      placeholder="Khởi động điện / Đạp chân"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Mức tiêu thụ nhiên liệu</label
                    >
                    <ElInput
                      v-model="formData.fuel_consumption"
                      placeholder="Ví dụ: 1.8 lít/100 km"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Dung tích nhớt máy (lít)</label
                    >
                    <br />
                    <ElInputNumber
                      v-model="formData.oil_capacity"
                      :min="0"
                      :precision="2"
                      :step="0.1"
                      class="w-full"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div
                class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
              >
                <div
                  class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors"
                  @click="toggleSpecGroup('chassis_specs')"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span class="font-bold text-gray-800 text-sm"
                      >Thông số Xe - Khung gầm, Hệ thống treo & Phanh</span
                    >
                  </div>
                  <ElIcon
                    class="text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': activeSpecGroup === 'chassis_specs' }"
                  >
                    <ArrowDown />
                  </ElIcon>
                </div>

                <div
                  v-show="activeSpecGroup === 'chassis_specs'"
                  class="p-4 border-t border-gray-100 bg-white grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Loại khung xe</label
                    >
                    <ElInput
                      v-model="formData.frame_type"
                      placeholder="Dạng sườn kim cương, Underbone..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Hệ thống treo (Phuộc) trước</label
                    >
                    <ElInput
                      v-model="formData.front_suspension"
                      placeholder="Ống lồng, giảm chấn thủy lực..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Hệ thống treo (Phuộc) sau</label
                    >
                    <ElInput
                      v-model="formData.rear_suspension"
                      placeholder="Lò xo trụ đơn, Phun lò xo đôi..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Kích cỡ lốp (Vỏ) trước</label
                    >
                    <ElInput
                      v-model="formData.front_tire_size"
                      placeholder="Ví dụ: 80/90-17M/C 44P"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Kích cỡ lốp (Vỏ) sau</label
                    >
                    <ElInput
                      v-model="formData.rear_tire_size"
                      placeholder="Ví dụ: 90/90-17M/C 50P"
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Phanh trước</label
                    >
                    <ElInput
                      v-model="formData.front_brake"
                      placeholder="Phanh đĩa thủy lực, ABS..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Phanh sau</label
                    >
                    <ElInput
                      v-model="formData.rear_brake"
                      placeholder="Phanh tang trống (Cơ), đĩa..."
                    />
                  </div>
                </div>
              </div>

              <div
                class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
              >
                <div
                  class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors"
                  @click="toggleSpecGroup('electric_specs')"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    <span class="font-bold text-gray-800 text-sm"
                      >Thông số Xe - Hệ thống điện & Hiển thị</span
                    >
                  </div>
                  <ElIcon
                    class="text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': activeSpecGroup === 'electric_specs' }"
                  >
                    <ArrowDown />
                  </ElIcon>
                </div>

                <div
                  v-show="activeSpecGroup === 'electric_specs'"
                  class="p-4 border-t border-gray-100 bg-white grid grid-cols-2 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Loại ắc quy</label
                    >
                    <ElInput
                      v-model="formData.battery_type"
                      placeholder="12V - 5Ah, Lead-Acid..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Hệ thống chiếu sáng (Đèn)</label
                    >
                    <ElInput
                      v-model="formData.lighting_system"
                      placeholder="Đèn pha LED, Halogen..."
                    />
                  </div>
                  <div>
                    <label
                      class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >Đồng hồ hiển thị (Màn hình)</label
                    >
                    <ElInput
                      v-model="formData.dashboard_type"
                      placeholder="Màn hình LCD âm bản, Analog..."
                    />
                  </div>
                </div>
              </div>

              <div
                class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
              >
                <div
                  class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors"
                  @click="toggleSpecGroup('tech_specs')"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                    <span class="font-bold text-gray-800 text-sm">Công nghệ & Tiện ích</span>
                  </div>
                  <ElIcon
                    class="text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': activeSpecGroup === 'tech_specs' }"
                  >
                    <ArrowDown />
                  </ElIcon>
                </div>

                <div
                  v-show="activeSpecGroup === 'tech_specs'"
                  class="p-4 border-t border-gray-100 bg-white space-y-6"
                >
                  <div>
                    <div class="flex items-center justify-between pb-3">
                      <label
                        class="el-form-item__label !text-sm !font-semibold !text-gray-700 !h-auto !leading-none !pb-0 !mb-0 block"
                      >
                        Chọn các công nghệ được trang bị trên sản phẩm
                      </label>
                      <ElButton
                        type="primary"
                        plain
                        size="small"
                        :icon="Plus"
                        @click="openNewTechDialog"
                      >
                        Tạo công nghệ mới
                      </ElButton>
                    </div>

                    <div v-if="loadingTechs" class="text-center py-6 text-gray-400">
                      Đang tải danh sách công nghệ...
                    </div>

                    <div
                      v-else-if="!availableTechnologies.length"
                      class="text-center py-6 text-gray-400 italic"
                    >
                      Không tìm thấy công nghệ nào phù hợp cho Thể loại / Thương hiệu này.
                    </div>

                    <div v-else class="space-y-4">
                      <div
                        v-for="(techs, catName) in groupedTechnologies"
                        :key="catName"
                        class="bg-white border border-gray-150 rounded-xl p-4 shadow-sm"
                      >
                        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          {{ catName }}
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div
                            v-for="tech in techs"
                            :key="tech.id"
                            class="group relative flex items-center justify-between p-3 border border-gray-150 rounded-lg hover:border-primary/20 hover:bg-gray-50/50 transition-all cursor-pointer select-none"
                            :class="{
                              'border-primary/30 bg-red-50/10': isTechnologySelected(tech.id)
                            }"
                            @click="toggleTechnology(tech)"
                          >
                            <div class="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                              <ElCheckbox
                                :model-value="isTechnologySelected(tech.id)"
                                @click.stop
                                @change="toggleTechnology(tech)"
                              />
                              <span class="text-sm font-medium text-gray-700 truncate">{{
                                tech.name
                              }}</span>
                            </div>

                            <div
                              class="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity"
                            >
                              <ElButton
                                type="primary"
                                link
                                size="small"
                                class="!p-1"
                                @click.stop="openEditTechDialog(tech)"
                              >
                                <ElIcon :size="14"><Edit /></ElIcon>
                              </ElButton>
                              <ElButton
                                type="danger"
                                link
                                size="small"
                                class="!p-1"
                                @click.stop="handleDeleteTech(tech)"
                              >
                                <ElIcon :size="14"><Delete /></ElIcon>
                              </ElButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    v-if="formData.highlights_list && formData.highlights_list.length > 0"
                    class="space-y-4 pt-4 border-t border-gray-100"
                  >
                    <label
                      class="el-form-item__label !text-sm !font-bold !text-gray-800 border-b border-gray-200 pb-2 mb-0 block"
                    >
                      Tùy chỉnh nội dung công nghệ cho sản phẩm này (Hiện trên Web)
                    </label>

                    <div
                      v-for="(hl, hlIdx) in formData.highlights_list"
                      :key="hlIdx"
                      class="p-4 border border-gray-200 rounded-xl bg-gray-50/30 relative flex flex-col md:flex-row gap-4"
                    >
                      <div class="flex-1 space-y-3">
                        <div class="flex items-center gap-2">
                          <span
                            class="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider"
                          >
                            {{ hl._categoryName }}
                          </span>
                          <span class="text-sm font-bold text-gray-800">
                            {{
                              availableTechnologies.find((t) => t.id === hl.technology_id)?.name ||
                              'Công nghệ'
                            }}
                          </span>
                        </div>

                        <div>
                          <label
                            class="el-form-item__label !text-xs !text-gray-500 !h-auto !leading-none !pb-1 !mb-0 block"
                          >
                            Tiêu đề tùy chỉnh
                          </label>
                          <ElInput
                            v-model="hl.custom_title"
                            :placeholder="hl._defaultTitle || 'Nhập tiêu đề...'"
                          />
                        </div>

                        <div>
                          <label
                            class="el-form-item__label !text-xs !text-gray-500 !h-auto !leading-none !pb-1 !mb-0 block"
                          >
                            Mô tả tùy chỉnh
                          </label>
                          <ElInput
                            v-model="hl.custom_description"
                            type="textarea"
                            :rows="2"
                            :placeholder="hl._defaultDescription || 'Nhập mô tả chi tiết...'"
                          />
                        </div>
                      </div>

                      <div
                        class="w-full md:w-36 flex flex-col items-center justify-center border-l border-gray-150 pl-4"
                      >
                        <span class="text-xs text-gray-500 mb-2">Ảnh tùy chỉnh</span>
                        <ElUpload
                          action="#"
                          :show-file-list="false"
                          :auto-upload="true"
                          :http-request="(opt) => handleHighlightImageUpload(opt, hl)"
                        >
                          <div v-if="hl.custom_image_url" class="relative group">
                            <img
                              :src="hl.custom_image_url"
                              class="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <div
                              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                            >
                              <ElIcon class="text-white text-lg"><Plus /></ElIcon>
                            </div>
                          </div>
                          <div v-else-if="hl._defaultImageUrl" class="relative group">
                            <img
                              :src="hl._defaultImageUrl"
                              class="w-24 h-24 object-cover rounded-lg border border-gray-200 opacity-60"
                            />
                            <div
                              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg"
                            >
                              <ElIcon class="text-white text-lg"><Plus /></ElIcon>
                            </div>
                          </div>
                          <div
                            v-else
                            class="w-24 h-24 rounded-lg border border-dashed border-gray-300 hover:border-primary/50 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                          >
                            <ElIcon><Plus /></ElIcon>
                            <span class="text-[9px] mt-1">Tải ảnh</span>
                          </div>
                        </ElUpload>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
              >
                <div
                  class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors"
                  @click="toggleSpecGroup('quality_specs')"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span class="font-bold text-gray-800 text-sm">Tiêu chuẩn chất lượng</span>
                  </div>
                  <ElIcon
                    class="text-gray-400 transition-transform duration-300"
                    :class="{ 'rotate-180': activeSpecGroup === 'quality_specs' }"
                  >
                    <ArrowDown />
                  </ElIcon>
                </div>

                <div
                  v-show="activeSpecGroup === 'quality_specs'"
                  class="p-4 border-t border-gray-100 bg-white space-y-6"
                >
                  <div>
                    <label
                      class="el-form-item__label !text-sm !font-semibold !text-gray-700 !h-auto !leading-none !pb-3 !mb-0 block"
                    >
                      Các tiêu chuẩn đạt được
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                      <div
                        class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary/20 hover:bg-gray-50/30 transition-all cursor-pointer"
                        @click="formData.std_dot = !formData.std_dot"
                      >
                        <ElCheckbox v-model="formData.std_dot" size="large" @click.stop />
                        <div class="flex flex-col">
                          <span class="font-bold text-gray-800 text-sm">Tiêu chuẩn DOT</span>
                          <span class="text-[11px] text-gray-400 mt-0.5"
                            >Tiêu chuẩn an toàn của Bộ GTVT Hoa Kỳ</span
                          >
                        </div>
                      </div>

                      <div
                        class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary/20 hover:bg-gray-50/30 transition-all cursor-pointer"
                        @click="formData.std_ece = !formData.std_ece"
                      >
                        <ElCheckbox v-model="formData.std_ece" size="large" @click.stop />
                        <div class="flex flex-col">
                          <span class="font-bold text-gray-800 text-sm">Tiêu chuẩn ECE</span>
                          <span class="text-[11px] text-gray-400 mt-0.5"
                            >Tiêu chuẩn an toàn của Ủy ban Kinh tế Châu Âu</span
                          >
                        </div>
                      </div>

                      <div
                        class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary/20 hover:bg-gray-50/30 transition-all cursor-pointer"
                        @click="formData.std_snell = !formData.std_snell"
                      >
                        <ElCheckbox v-model="formData.std_snell" size="large" @click.stop />
                        <div class="flex flex-col">
                          <span class="font-bold text-gray-800 text-sm">Tiêu chuẩn SNELL</span>
                          <span class="text-[11px] text-gray-400 mt-0.5"
                            >Tiêu chuẩn phi lợi nhuận khắt khe của Hoa Kỳ</span
                          >
                        </div>
                      </div>

                      <div
                        class="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-primary/20 hover:bg-gray-50/30 transition-all cursor-pointer"
                        @click="formData.std_jis = !formData.std_jis"
                      >
                        <ElCheckbox v-model="formData.std_jis" size="large" @click.stop />
                        <div class="flex flex-col">
                          <span class="font-bold text-gray-800 text-sm">Tiêu chuẩn JIS</span>
                          <span class="text-[11px] text-gray-400 mt-0.5"
                            >Tiêu chuẩn công nghiệp của Nhật Bản</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      class="el-form-item__label !text-sm !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Tiêu chuẩn khác
                    </label>
                    <ElInput
                      v-model="formData.other_standards"
                      type="textarea"
                      :rows="3"
                      placeholder="Nhập các tiêu chuẩn chất lượng khác nếu có..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </ElTabPane>

          <ElTabPane name="variants" label="Biến thể">
            <div class="tab-scroll-container">
              <div class="space-y-4 py-2">
                <div
                  v-for="(variant, index) in formData.variants"
                  :key="index"
                  class="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-300"
                >
                  <div
                    class="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 cursor-pointer select-none transition-colors border-b border-gray-100"
                    @click="toggleVariantAccordion(index)"
                  >
                    <div class="flex items-center gap-3">
                      <span
                        class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs"
                      >
                        {{ index + 1 }}
                      </span>
                      <span class="font-bold text-gray-800 text-sm">
                        Biến thể #{{ index + 1 }}
                        <span v-if="variant.variant_name" class="text-gray-500 font-normal"
                          >({{ variant.variant_name }})</span
                        >
                      </span>
                    </div>

                    <div class="flex items-center gap-3" @click.stop>
                      <ElButton
                        v-if="formData.variants && formData.variants.length > 1"
                        type="danger"
                        size="small"
                        plain
                        :icon="Delete"
                        @click="handleRemoveVariant(index)"
                      >
                        Xóa biến thể
                      </ElButton>
                      <ElIcon
                        class="text-gray-400 transition-transform duration-300"
                        :class="{ 'rotate-180': activeVariantIndex === index }"
                        @click="toggleVariantAccordion(index)"
                      >
                        <ArrowDown />
                      </ElIcon>
                    </div>
                  </div>

                  <div v-show="activeVariantIndex === index" class="p-5 space-y-4 bg-white">
                    <div class="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label
                          class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                        >
                          Kích thước / Loại
                          <span class="text-red-500">*</span>
                        </label>
                        <ElInput
                          v-model="variant.variant_name"
                          :placeholder="'Size L, Đen bóng...'"
                        />
                      </div>
                      <div>
                        <label
                          class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                        >
                          Mã SKU <span class="text-red-500">*</span>
                        </label>
                        <ElInput v-model="variant.sku" placeholder="Nhập mã SKU..." />
                      </div>
                      <div>
                        <label
                          class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                        >
                          Giá bán (VNĐ) <span class="text-red-500">*</span>
                        </label>
                        <br />
                        <ElInputNumber
                          v-model="variant.price"
                          :min="1"
                          class="w-full"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div
                      v-if="!variant.colors || variant.colors.length === 0"
                      class="mt-4 border-t border-gray-100 pt-4"
                    >
                      <label
                        class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >
                        Cover mặc định của biến thể
                      </label>
                      <ElUpload
                        class="variant-uploader"
                        action="#"
                        :show-file-list="false"
                        :auto-upload="true"
                        :http-request="(opt) => handleVariantCoverUpload(opt, variant)"
                      >
                        <div
                          class="w-28 h-28 rounded-lg border border-dashed border-gray-300 hover:border-primary/50 flex items-center justify-center text-gray-400 cursor-pointer overflow-hidden bg-gray-50"
                        >
                          <img
                            v-if="variant.cover_image_url"
                            :src="variant.cover_image_url"
                            class="w-full h-full object-cover"
                          />
                          <ElIcon v-else><Plus /></ElIcon>
                        </div>
                      </ElUpload>
                    </div>

                    <div class="mt-4 border-t border-gray-100 pt-4">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Thuộc tính tùy chọn
                        </span>
                        <ElButton
                          type="primary"
                          plain
                          size="small"
                          :icon="Plus"
                          @click="addVariantOptionValue(variant)"
                        >
                          Thêm thuộc tính
                        </ElButton>
                      </div>

                      <div v-if="variant.option_rows?.length" class="space-y-3">
                        <div
                          v-for="(optionRow, optionIdx) in variant.option_rows"
                          :key="optionIdx"
                          class="grid grid-cols-[1fr_1fr_auto] gap-3 items-center"
                        >
                          <ElSelect
                            v-model="optionRow.key"
                            filterable
                            placeholder="Chọn thuộc tính"
                          >
                            <ElOption
                              v-for="option in availablePredefinedOptions"
                              :key="option.key"
                              :label="option.label"
                              :value="option.key"
                            />
                          </ElSelect>
                          <ElInput v-model="optionRow.value" placeholder="Giá trị thuộc tính" />
                          <ElButton
                            type="danger"
                            plain
                            :icon="Delete"
                            @click="removeVariantOptionValue(variant, optionIdx)"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 border-t border-gray-100 pt-4">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Ghi đè thông số kỹ thuật (Spec Overriding)
                        </span>
                        <ElButton
                          type="primary"
                          link
                          @click="variant.showSpecs = !variant.showSpecs"
                        >
                          {{ variant.showSpecs ? 'Ẩn thiết lập' : 'Thiết lập ghi đè' }}
                          <ElIcon class="el-icon--right">
                            <component :is="variant.showSpecs ? ArrowUp : ArrowDown" />
                          </ElIcon>
                        </ElButton>
                      </div>

                      <div
                        v-show="variant.showSpecs"
                        class="bg-gray-50/50 border border-gray-200 rounded-xl p-4 space-y-4"
                      >
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Trọng lượng (kg)
                            </label>
                            <ElInputNumber
                              v-model="variant.weight"
                              :min="0"
                              class="w-full"
                              placeholder="Dùng gốc"
                            />
                          </div>
                          <div class="col-span-2">
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Kích thước (D x R x C)
                            </label>
                            <ElInput v-model="variant.dimensions" placeholder="Dùng gốc" />
                          </div>
                          <div>
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Trục bánh xe (mm)
                            </label>
                            <ElInputNumber
                              v-model="variant.wheelbase"
                              :min="0"
                              class="w-full"
                              placeholder="Dùng gốc"
                            />
                          </div>
                          <div>
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Độ cao yên (mm)
                            </label>
                            <ElInputNumber
                              v-model="variant.seat_height"
                              :min="0"
                              class="w-full"
                              placeholder="Dùng gốc"
                            />
                          </div>
                          <div>
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Khoảng sáng gầm (mm)
                            </label>
                            <ElInputNumber
                              v-model="variant.ground_clearance"
                              :min="0"
                              class="w-full"
                              placeholder="Dùng gốc"
                            />
                          </div>
                          <div>
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Dung tích bình xăng (lít)
                            </label>
                            <ElInputNumber
                              v-model="variant.fuel_capacity"
                              :min="0"
                              :precision="1"
                              :step="0.1"
                              class="w-full"
                              placeholder="Dùng gốc"
                            />
                          </div>
                          <div class="col-span-2">
                            <label
                              class="el-form-item__label !text-xs !text-gray-600 !h-auto !leading-none !pb-1 !mb-0 block"
                            >
                              Kích cỡ lốp
                            </label>
                            <ElInput v-model="variant.tire_size" placeholder="Dùng gốc" />
                          </div>
                        </div>
                        <p class="text-[10px] text-gray-400 italic mb-0">
                          * Các trường để trống hệ thống sẽ tự động lấy từ Thông số gốc (Root
                          Specs).
                        </p>
                      </div>
                    </div>

                    <div class="pt-2">
                      <span
                        class="text-[11px] block mb-3 uppercase tracking-wider text-gray-400 font-semibold"
                      >
                        Màu sắc & Hình ảnh của biến thể
                      </span>

                      <div class="space-y-4">
                        <div
                          v-for="(color, cIdx) in variant.colors"
                          :key="cIdx"
                          class="border border-gray-100 rounded-lg p-4 bg-white shadow-sm flex flex-col gap-4 relative mb-2"
                        >
                          <div class="flex items-start gap-4 w-full">
                            <div class="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <label
                                  class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                                >
                                  Tên màu <span class="text-red-500">*</span>
                                </label>
                                <ElInput v-model="color.name" placeholder="Đỏ nhám, Đen bóng..." />
                              </div>
                              <div>
                                <label
                                  class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                                >
                                  Mã màu <span class="text-red-500">*</span>
                                </label>
                                <div class="flex gap-2 items-center w-full">
                                  <ElColorPicker v-model="color.code" />
                                  <ElInput
                                    v-model="color.code"
                                    placeholder="#000000"
                                    class="flex-1"
                                  />
                                </div>
                              </div>
                            </div>

                            <div class="w-20 flex flex-col items-center shrink-0">
                              <span class="text-[10px] text-gray-400 mb-1"
                                >Ảnh <span class="text-red-500">*</span></span
                              >
                              <ElUpload
                                class="variant-uploader"
                                action="#"
                                :show-file-list="false"
                                :auto-upload="true"
                                :http-request="(opt) => handleColorImageUpload(opt, color)"
                              >
                                <img
                                  v-if="color.image"
                                  :src="color.image"
                                  class="w-12 h-12 object-cover rounded border border-gray-100"
                                />
                                <div
                                  v-else
                                  class="w-12 h-12 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-primary/50 cursor-pointer"
                                >
                                  <ElIcon><Plus /></ElIcon>
                                </div>
                              </ElUpload>
                            </div>
                          </div>

                          <ElButton
                            v-if="variant.colors && variant.colors.length > 1"
                            type="danger"
                            circle
                            size="small"
                            :icon="Delete"
                            class="absolute -top-2 -right-2 shadow"
                            @click="handleRemoveColor(variant, Number(cIdx))"
                          />
                        </div>
                      </div>

                      <ElButton
                        type="primary"
                        plain
                        size="small"
                        class="mt-3 w-full border-dashed"
                        :icon="Plus"
                        @click="addColor(variant)"
                      >
                        Thêm tùy chọn màu sắc mới
                      </ElButton>
                    </div>

                    <div class="mt-4 border-t border-gray-100 pt-4">
                      <label
                        class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >
                        Bộ sưu tập ảnh chi tiết (Gallery)
                      </label>

                      <div class="flex flex-wrap gap-3 mt-2">
                        <div
                          v-for="(img, imgIdx) in variant.photo_collection"
                          :key="imgIdx"
                          class="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group/gallery"
                        >
                          <img :src="img" class="w-full h-full object-cover" />
                          <div
                            class="absolute inset-0 bg-black/50 opacity-0 group-hover/gallery:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <ElButton
                              type="danger"
                              link
                              size="small"
                              :icon="Delete"
                              @click="removeVariantGalleryImage(variant, imgIdx)"
                            />
                          </div>
                        </div>

                        <ElUpload
                          action="#"
                          :show-file-list="false"
                          :auto-upload="true"
                          :http-request="(opt) => handleVariantGalleryUpload(opt, variant)"
                        >
                          <div
                            class="w-20 h-20 rounded-lg border border-dashed border-gray-300 hover:border-primary/50 flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors"
                          >
                            <ElIcon><Plus /></ElIcon>
                            <span class="text-[10px] mt-1">Thêm ảnh</span>
                          </div>
                        </ElUpload>
                      </div>
                    </div>

                    <div class="mt-4 border-t border-gray-100 pt-4">
                      <label
                        class="el-form-item__label !text-sm !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                      >
                        URL Slug (SEO) <span class="text-red-500">*</span>
                      </label>
                      <ElInput v-model="variant.url_slug" placeholder="Nhập URL Slug..." />
                    </div>
                  </div>
                </div>

                <ElButton type="success" class="w-full py-3" :icon="Plus" @click="handleAddVariant">
                  Thêm biến thể mới
                </ElButton>
              </div>
            </div>
          </ElTabPane>

          <ElTabPane name="pricing" label="Báo giá">
            <div class="tab-scroll-container py-2">
              <ElCollapse v-model="activePricingPanels" class="space-y-3">
                <ElCollapseItem
                  v-for="(variant, vIdx) in formData.variants || []"
                  :key="variant.id ?? vIdx"
                  :name="String(vIdx)"
                  class="border border-gray-150 rounded-xl bg-white shadow-sm overflow-hidden"
                >
                  <template #title>
                    <div class="flex items-center justify-between w-full p-4">
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-800 text-sm">
                          {{ variant.variant_name || `Biến thể ${vIdx + 1}` }}
                        </span>
                        <span class="text-[11px] text-gray-500">
                          {{
                            (variant.colors || []).length
                              ? 'Báo giá theo màu'
                              : 'Báo giá theo biến thể'
                          }}
                        </span>
                      </div>
                    </div>
                  </template>

                  <div class="p-4 space-y-4">
                    <div v-if="!(variant.colors || []).length" class="space-y-3">
                      <div
                        class="flex items-center justify-between cursor-pointer select-none"
                        @click="variant.showSupplierPrices = !variant.showSupplierPrices"
                      >
                        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Báo giá biến thể
                        </span>
                        <div class="flex items-center gap-2">
                          <ElButton
                            type="primary"
                            plain
                            size="small"
                            :icon="Plus"
                            @click.stop="addVariantSupplierPrice(variant)"
                          >
                            Thêm giá
                          </ElButton>
                          <ElIcon
                            class="transition-transform duration-300"
                            :class="{ 'rotate-180': variant.showSupplierPrices }"
                          >
                            <ArrowDown />
                          </ElIcon>
                        </div>
                      </div>

                      <ElCollapseTransition>
                        <div v-show="variant.showSupplierPrices">
                          <div v-if="variant.supplier_prices?.length" class="space-y-3 pt-3">
                            <div
                              v-for="(priceRow, pIdx) in variant.supplier_prices"
                              :key="pIdx"
                              class="grid grid-cols-[1.1fr_0.9fr_1.2fr_auto] gap-3 items-start"
                            >
                              <ElSelect
                                v-model="priceRow.supplier_id"
                                filterable
                                placeholder="Nhà cung cấp"
                              >
                                <ElOption
                                  v-for="sup in suppliersList"
                                  :key="sup.id"
                                  :label="sup.name"
                                  :value="sup.id"
                                  :disabled="
                                    isSupplierUsedInRows(
                                      variant.supplier_prices || [],
                                      sup.id,
                                      pIdx
                                    )
                                  "
                                />
                              </ElSelect>
                              <ElInputNumber
                                v-model="priceRow.quote_price"
                                :min="0"
                                :step="10000"
                                controls-position="right"
                                placeholder="Giá"
                              />
                              <ElInput v-model="priceRow.note" placeholder="Ghi chú" />
                              <ElButton
                                type="danger"
                                plain
                                :icon="Delete"
                                @click="removeVariantSupplierPrice(variant, pIdx)"
                              />
                            </div>
                          </div>
                          <div v-else class="text-xs text-gray-400 italic pt-3">
                            Chưa có báo giá nào cho biến thể này.
                          </div>
                        </div>
                      </ElCollapseTransition>
                    </div>

                    <div v-else class="space-y-3">
                      <div
                        v-for="(color, cIdx) in variant.colors"
                        :key="color.id ?? cIdx"
                        class="border border-gray-100 rounded-lg p-4"
                      >
                        <div
                          class="flex items-center justify-between cursor-pointer select-none"
                          :class="{ 'mb-3': color.showSupplierPrices }"
                          @click="color.showSupplierPrices = !color.showSupplierPrices"
                        >
                          <div class="flex flex-col">
                            <span class="font-semibold text-gray-800 text-sm">
                              {{ color.name || `Màu ${cIdx + 1}` }}
                            </span>
                            <span class="text-[11px] text-gray-500">{{ color.code || '' }}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <ElButton
                              type="primary"
                              plain
                              size="small"
                              :icon="Plus"
                              @click.stop="addColorSupplierPrice(color)"
                            >
                              Thêm giá
                            </ElButton>
                            <ElIcon
                              class="transition-transform duration-300"
                              :class="{ 'rotate-180': color.showSupplierPrices }"
                            >
                              <ArrowDown />
                            </ElIcon>
                          </div>
                        </div>

                        <ElCollapseTransition>
                          <div v-show="color.showSupplierPrices">
                            <div v-if="color.supplier_prices?.length" class="space-y-2">
                              <div
                                v-for="(priceRow, pIdx) in color.supplier_prices"
                                :key="pIdx"
                                class="grid grid-cols-[1.1fr_0.9fr_1.2fr_auto] gap-3 items-start"
                              >
                                <ElSelect
                                  v-model="priceRow.supplier_id"
                                  filterable
                                  placeholder="Nhà cung cấp"
                                >
                                  <ElOption
                                    v-for="sup in suppliersList"
                                    :key="sup.id"
                                    :label="sup.name"
                                    :value="sup.id"
                                    :disabled="
                                      isSupplierUsedInRows(
                                        color.supplier_prices || [],
                                        sup.id,
                                        pIdx
                                      )
                                    "
                                  />
                                </ElSelect>
                                <ElInputNumber
                                  v-model="priceRow.quote_price"
                                  :min="0"
                                  :step="10000"
                                  controls-position="right"
                                  placeholder="Giá"
                                />
                                <ElInput v-model="priceRow.note" placeholder="Ghi chú" />
                                <ElButton
                                  type="danger"
                                  plain
                                  :icon="Delete"
                                  @click="removeColorSupplierPrice(color, pIdx)"
                                />
                              </div>
                            </div>
                            <div v-else class="text-xs text-gray-400 italic">
                              Chưa có báo giá màu này.
                            </div>
                          </div>
                        </ElCollapseTransition>
                      </div>
                    </div>
                  </div>
                </ElCollapseItem>
              </ElCollapse>
            </div>
          </ElTabPane>

          <ElTabPane name="compatibility" label="Tương thích">
            <div class="tab-scroll-container">
              <div class="space-y-6 py-4">
                <div
                  class="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100/30"
                >
                  <ElIcon class="text-blue-500 text-lg"><InfoFilled /></ElIcon>
                  <p class="text-sm text-gray-600 italic leading-relaxed mb-0">
                    QUAN TRỌNG: Chọn các dòng xe mà món phụ tùng này có thể lắp vừa. Hệ thống sẽ
                    dùng dữ liệu này để gợi ý sản phẩm liên quan.
                  </p>
                </div>

                <div class="space-y-4">
                  <div class="relative">
                    <label
                      class="el-form-item__label !text-sm !font-semibold !text-gray-700 !h-auto !leading-none !pb-1.5 !mb-0 block"
                    >
                      Tìm kiếm xe tương thích
                    </label>
                    <ElInput
                      v-model="vehicleSearch"
                      placeholder="Nhập tên xe để tìm..."
                      :prefix-icon="Search"
                      clearable
                    />

                    <div
                      v-if="vehicleSearch && filteredVehicles.length > 0"
                      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar"
                    >
                      <div
                        v-for="v in filteredVehicles"
                        :key="v.id"
                        class="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 last:border-b-0"
                        @click="addCompatibleVehicle(v.id)"
                      >
                        <span class="text-gray-700 font-medium text-sm">{{ v.name }}</span>
                        <span
                          v-if="formData.compatible_vehicle_model_ids?.includes(v.id)"
                          class="text-xs text-blue-600 font-semibold"
                        >
                          Đã chọn
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      class="el-form-item__label !text-sm !font-semibold !text-gray-700 !h-auto !leading-none !pb-2 block"
                    >
                      Danh sách xe đã chọn ({{
                        formData.compatible_vehicle_model_ids?.length || 0
                      }})
                    </label>
                    <div
                      class="flex flex-wrap gap-2 min-h-[50px] p-3 bg-gray-50/50 border border-gray-200 rounded-xl"
                    >
                      <ElTag
                        v-for="id in formData.compatible_vehicle_model_ids"
                        :key="id"
                        class="!bg-blue-50 !text-blue-700 !border-blue-100 !px-3 !py-1 !h-auto !rounded-full !font-medium"
                        closable
                        @close="removeCompatibleVehicle(id)"
                      >
                        {{ getVehicleName(id) }}
                      </ElTag>
                      <div
                        v-if="!formData.compatible_vehicle_model_ids?.length"
                        class="text-gray-400 text-sm italic flex items-center"
                      >
                        Chưa có xe nào được chọn.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ElTabPane>
        </ElTabs>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <ElButton @click="dialogVisible = false">Đóng</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm" class="px-8">
            Lưu sản phẩm
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="newTechDialogVisible"
      title="Tạo Công Nghệ Mới"
      width="450px"
      append-to-body
      class="premium-dialog-nested"
    >
      <ElForm :model="newTechForm" label-position="top">
        <ElFormItem label="Tên công nghệ" required>
          <ElInput v-model="newTechForm.name" placeholder="Ví dụ: Phanh ABS, Động cơ eSP+..." />
        </ElFormItem>

        <ElFormItem label="Nhóm công nghệ">
          <div class="flex gap-2 w-full">
            <ElSelect
              v-model="newTechForm.categoryId"
              placeholder="Chọn nhóm công nghệ"
              class="flex-1"
              clearable
            >
              <ElOption
                v-for="cat in technologyCategories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </ElSelect>
            <ElButton type="primary" plain :icon="Plus" @click="openNewTechCatDialog">
              Nhóm mới
            </ElButton>
          </div>
        </ElFormItem>

        <ElFormItem label="Thương hiệu liên kết (Không bắt buộc)">
          <div class="flex items-center gap-2 w-full">
            <div
              class="flex-1 flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm hover:border-primary/30 transition-all cursor-pointer min-h-[38px]"
              @click="openBrandSelector((brand) => (newTechForm.brandId = brand.id))"
            >
              <div class="flex items-center gap-2">
                <ElIcon class="text-gray-400"><InfoFilled /></ElIcon>
                <span v-if="newTechForm.brandId" class="text-sm font-semibold text-gray-800">
                  {{ getBrandNameById(newTechForm.brandId) }}
                </span>
                <span v-else class="text-sm text-gray-400">Chọn thương hiệu liên kết...</span>
              </div>
              <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
            </div>
            <ElButton
              v-if="newTechForm.brandId"
              type="danger"
              plain
              size="default"
              class="!px-3"
              @click="newTechForm.brandId = undefined"
            >
              Xóa
            </ElButton>
          </div>
        </ElFormItem>

        <ElFormItem label="Tiêu đề hiển thị mặc định (Không bắt buộc)">
          <ElInput v-model="newTechForm.defaultTitle" placeholder="Tiêu đề hiển thị trên web..." />
        </ElFormItem>

        <ElFormItem label="Mô tả mặc định (Không bắt buộc)">
          <ElInput
            v-model="newTechForm.defaultDescription"
            type="textarea"
            :rows="3"
            placeholder="Mô tả chi tiết công nghệ..."
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="newTechDialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="creatingTech" @click="submitNewTech">Tạo mới</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="newTechCatDialogVisible"
      title="Tạo Nhóm Công Nghệ Mới"
      width="360px"
      append-to-body
    >
      <ElForm :model="newTechCatForm" label-position="top">
        <ElFormItem label="Tên nhóm công nghệ" required>
          <ElInput v-model="newTechCatForm.name" placeholder="Ví dụ: Động cơ, Phanh, Tiện ích..." />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="newTechCatDialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="creatingTechCat" @click="submitNewTechCat"
            >Tạo mới</ElButton
          >
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="editTechDialogVisible"
      title="Chỉnh Sửa Công Nghệ"
      width="450px"
      append-to-body
      class="premium-dialog-nested"
    >
      <ElForm :model="editTechForm" label-position="top">
        <ElFormItem label="Tên công nghệ" required>
          <ElInput v-model="editTechForm.name" placeholder="Ví dụ: Phanh ABS, Động cơ eSP+..." />
        </ElFormItem>

        <ElFormItem label="Nhóm công nghệ">
          <div class="flex gap-2 w-full">
            <ElSelect
              v-model="editTechForm.categoryId"
              placeholder="Chọn nhóm công nghệ"
              class="flex-1"
              clearable
            >
              <ElOption
                v-for="cat in technologyCategories"
                :key="cat.id"
                :label="cat.name"
                :value="cat.id"
              />
            </ElSelect>
            <ElButton type="primary" plain :icon="Plus" @click="openNewTechCatDialog">
              Nhóm mới
            </ElButton>
          </div>
        </ElFormItem>

        <ElFormItem label="Thương hiệu liên kết (Không bắt buộc)">
          <div class="flex items-center gap-2 w-full">
            <div
              class="flex-1 flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm hover:border-primary/30 transition-all cursor-pointer min-h-[38px]"
              @click="openBrandSelector((brand) => (editTechForm.brandId = brand.id))"
            >
              <div class="flex items-center gap-2">
                <ElIcon class="text-gray-400"><InfoFilled /></ElIcon>
                <span v-if="editTechForm.brandId" class="text-sm font-semibold text-gray-800">
                  {{ getBrandNameById(editTechForm.brandId) }}
                </span>
                <span v-else class="text-sm text-gray-400">Chọn thương hiệu liên kết...</span>
              </div>
              <ElIcon class="text-gray-400"><ArrowDown /></ElIcon>
            </div>
            <ElButton
              v-if="editTechForm.brandId"
              type="danger"
              plain
              size="default"
              class="!px-3"
              @click="editTechForm.brandId = undefined"
            >
              Xóa
            </ElButton>
          </div>
        </ElFormItem>

        <ElFormItem label="Tiêu đề hiển thị mặc định (Không bắt buộc)">
          <ElInput v-model="editTechForm.defaultTitle" placeholder="Tiêu đề hiển thị trên web..." />
        </ElFormItem>

        <ElFormItem label="Mô tả mặc định (Không bắt buộc)">
          <ElInput
            v-model="editTechForm.defaultDescription"
            type="textarea"
            :rows="3"
            placeholder="Mô tả chi tiết công nghệ..."
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="flex justify-end gap-2">
          <ElButton @click="editTechDialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="updatingTech" @click="submitEditTech">Lưu</ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="brandSelectorVisible"
      title="Chọn Thương Hiệu"
      width="680px"
      append-to-body
      align-center
    >
      <div class="space-y-4">
        <ElInput
          v-model="brandSelectorQuery"
          placeholder="Nhập tên thương hiệu để tìm kiếm..."
          clearable
          @input="handleSelectorSearch"
        >
          <template #prefix>
            <ElIcon><Search /></ElIcon>
          </template>
        </ElInput>

        <div v-loading="brandSelectorLoading" class="min-h-[300px] mt-4">
          <div
            v-if="brandSelectorItems.length === 0"
            class="flex flex-col items-center justify-center py-12 text-gray-400"
          >
            <ElIcon size="48"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy thương hiệu nào</span>
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div
              v-for="brand in brandSelectorItems"
              :key="brand.id"
              class="flex flex-col items-center p-3 border border-gray-150 rounded-xl hover:border-primary hover:bg-gray-50 cursor-pointer transition-all shadow-sm"
              @click="selectBrand(brand)"
            >
              <div
                class="h-14 w-14 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-inner"
              >
                <ElImage
                  v-if="brand.logoUrl"
                  :src="brand.logoUrl"
                  class="w-full h-full"
                  fit="contain"
                />
                <span v-else class="text-xs font-bold text-gray-400">{{
                  brand.name.substring(0, 2).toUpperCase()
                }}</span>
              </div>
              <span class="mt-2 text-sm font-semibold text-gray-800 text-center truncate w-full">{{
                brand.name
              }}</span>
              <span class="text-[11px] text-gray-400 text-center truncate w-full">{{
                brand.origin || 'Không rõ xuất xứ'
              }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-3 mt-4 border-t border-gray-100">
          <ElPagination
            v-model:current-page="brandSelectorPage"
            :page-size="brandSelectorPageSize"
            :total="brandSelectorTotal"
            layout="prev, pager, next"
            small
            background
            @current-change="fetchSelectorBrands"
          />
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import {
    Plus,
    Picture,
    Download,
    Delete,
    Search,
    InfoFilled,
    ArrowDown,
    ArrowUp,
    Edit
  } from '@element-plus/icons-vue'
  import { useProductTable } from './hooks/useProductTable'
  import { FileApi } from '@/api/file.api'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'ProductList' })

  const activeTab = ref('common')
  const activePricingPanels = ref<string[]>([])
  const activeSpecGroup = ref<string | null>('part_specs')
  const toggleSpecGroup = (groupName: string) => {
    if (activeSpecGroup.value === groupName) {
      activeSpecGroup.value = null
    } else {
      activeSpecGroup.value = groupName
    }
  }

  const activeVariantIndex = ref<number | null>(0)
  const toggleVariantAccordion = (index: number) => {
    if (activeVariantIndex.value === index) {
      activeVariantIndex.value = null
    } else {
      activeVariantIndex.value = index
    }
  }

  const handleAddVariant = () => {
    addVariant()
    setTimeout(() => {
      if (formData.value && formData.value.variants) {
        activeVariantIndex.value = formData.value.variants.length - 1
        activePricingPanels.value = [String(formData.value.variants.length - 1)]
      }
    }, 50)
  }

  const syncPricingPanels = () => {
    activePricingPanels.value = []
  }

  const {
    categoryTree,
    brandSelectorVisible,
    brandSelectorLoading,
    brandSelectorQuery,
    brandSelectorPage,
    brandSelectorPageSize,
    brandSelectorTotal,
    brandSelectorItems,
    openBrandSelector,
    selectBrand,
    handleSelectorSearch,
    ensureBrandLoaded,
    getBrandNameById,
    fetchSelectorBrands,
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    addVariant,
    removeVariant,
    addColor,
    removeColor,
    addVariantOptionValue,
    removeVariantOptionValue,
    addVariantSupplierPrice,
    removeVariantSupplierPrice,
    addColorSupplierPrice,
    removeColorSupplierPrice,
    isSupplierUsedInRows,

    vehicleSearch,
    filteredVehicles,
    getVehicleName,
    addCompatibleVehicle,
    removeCompatibleVehicle,
    toggleTechnology,
    isTechnologySelected,
    availableTechnologies,
    availablePredefinedOptions,
    suppliersList,
    loadingTechs,
    technologyCategories,
    createTechnology,
    createTechnologyCategory,
    updateTechnology,
    deleteTechnology,

    exportToExcel
  } = useProductTable()

  const handleRemoveVariant = (index: number) => {
    removeVariant(index)
    syncPricingPanels()
  }

  const handleRemoveColor = (variant: any, index: number) => {
    removeColor(variant, index)
    syncPricingPanels()
  }

  const groupedTechnologies = computed(() => {
    const groups: Record<string, any[]> = {}
    availableTechnologies.value.forEach((tech: any) => {
      const cat = tech.categoryName || 'CÔNG NGHỆ CHUNG'
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(tech)
    })
    return groups
  })

  const newTechDialogVisible = ref(false)
  const newTechForm = ref({
    name: '',
    categoryId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    defaultTitle: '',
    defaultDescription: '',
    defaultImageUrl: ''
  })
  const creatingTech = ref(false)

  const openNewTechDialog = () => {
    newTechForm.value = {
      name: '',
      categoryId: undefined,
      brandId: formData.value.brand_id ? Number(formData.value.brand_id) : undefined,
      defaultTitle: '',
      defaultDescription: '',
      defaultImageUrl: ''
    }
    newTechDialogVisible.value = true
  }

  const submitNewTech = async () => {
    if (!newTechForm.value.name.trim()) {
      ElMessage.warning('Vui lòng nhập tên công nghệ')
      return
    }
    creatingTech.value = true
    try {
      await createTechnology({
        name: newTechForm.value.name.trim(),
        categoryId: newTechForm.value.categoryId,
        brandId: newTechForm.value.brandId,
        defaultTitle: newTechForm.value.defaultTitle.trim() || undefined,
        defaultDescription: newTechForm.value.defaultDescription.trim() || undefined,
        defaultImageUrl: newTechForm.value.defaultImageUrl.trim() || undefined
      })
      newTechDialogVisible.value = false
    } catch (_err) {
      // Error message is already handled in createTechnology
    } finally {
      creatingTech.value = false
    }
  }

  const newTechCatDialogVisible = ref(false)
  const newTechCatForm = ref({
    name: ''
  })
  const creatingTechCat = ref(false)

  const openNewTechCatDialog = () => {
    newTechCatForm.value = {
      name: ''
    }
    newTechCatDialogVisible.value = true
  }

  const submitNewTechCat = async () => {
    if (!newTechCatForm.value.name.trim()) {
      ElMessage.warning('Vui lòng nhập tên nhóm công nghệ')
      return
    }
    creatingTechCat.value = true
    try {
      const newCat = await createTechnologyCategory(newTechCatForm.value.name.trim())
      newTechForm.value.categoryId = newCat.id
      newTechCatDialogVisible.value = false
    } catch (_err) {
      // Test
    } finally {
      creatingTechCat.value = false
    }
  }

  const editTechDialogVisible = ref(false)
  const editTechForm = ref({
    id: 0,
    name: '',
    categoryId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    defaultTitle: '',
    defaultDescription: '',
    defaultImageUrl: ''
  })
  const updatingTech = ref(false)

  const openEditTechDialog = (tech: any) => {
    editTechForm.value = {
      id: tech.id,
      name: tech.name,
      categoryId: tech.categoryId || undefined,
      brandId: tech.brandId || undefined,
      defaultTitle: tech.defaultTitle || '',
      defaultDescription: tech.defaultDescription || '',
      defaultImageUrl: tech.defaultImageUrl || ''
    }
    if (editTechForm.value.brandId) {
      ensureBrandLoaded(Number(editTechForm.value.brandId))
    }
    editTechDialogVisible.value = true
  }

  const submitEditTech = async () => {
    if (!editTechForm.value.name.trim()) {
      ElMessage.warning('Vui lòng nhập tên công nghệ')
      return
    }
    updatingTech.value = true
    try {
      await updateTechnology(editTechForm.value.id, {
        id: editTechForm.value.id,
        name: editTechForm.value.name.trim(),
        categoryId: editTechForm.value.categoryId,
        brandId: editTechForm.value.brandId,
        defaultTitle: editTechForm.value.defaultTitle.trim() || undefined,
        defaultDescription: editTechForm.value.defaultDescription.trim() || undefined,
        defaultImageUrl: editTechForm.value.defaultImageUrl.trim() || undefined
      })
      editTechDialogVisible.value = false
    } catch (_err) {
      // Error message is handled in updateTechnology
    } finally {
      updatingTech.value = false
    }
  }

  const handleDeleteTech = async (tech: any) => {
    await ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa công nghệ "${tech.name}"? Hành động này không thể hoàn tác và sẽ xóa khỏi tất cả sản phẩm đang dùng.`,
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning'
      }
    )
    await deleteTechnology(tech.id)
  }

  const handleColorImageUpload = async (options: any, colorObj: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      colorObj.image = res.publicUrl
      ElMessage.success('Tải ảnh biến thể lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const handleVariantCoverUpload = async (options: any, variantObj: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      variantObj.cover_image_url = res.publicUrl
      ElMessage.success('Tải cover biến thể lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const handleVariantGalleryUpload = async (options: any, variantObj: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      if (!variantObj.photo_collection) {
        variantObj.photo_collection = []
      }
      variantObj.photo_collection.push(res.publicUrl)
      ElMessage.success('Tải ảnh chi tiết lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const removeVariantGalleryImage = (variantObj: any, index: number) => {
    if (variantObj.photo_collection) {
      variantObj.photo_collection.splice(index, 1)
    }
  }

  const handleHighlightImageUpload = async (options: any, highlightObj: any) => {
    try {
      const res = await FileApi.uploadProductImage(options.file)
      highlightObj.custom_image_url = res.publicUrl
      ElMessage.success('Tải ảnh công nghệ tùy chỉnh lên thành công')
    } catch (err: any) {
      ElMessage.error(err.message || 'Tải ảnh thất bại')
    }
  }

  const searchItems = computed(() => [
    {
      key: 'name',
      label: 'Tên sản phẩm',
      type: 'input',
      props: { placeholder: 'Tìm kiếm tên...' }
    },
    {
      key: 'brand',
      label: 'Thương hiệu',
      type: 'input',
      props: { placeholder: 'Nhập tên hãng...' }
    },
    {
      key: 'category_id',
      label: 'Thể loại',
      type: 'treeselect',
      props: {
        data: categoryTree.value,
        props: {
          label: 'name',
          children: 'children'
        },
        'node-key': 'id',
        nodeKey: 'id',
        placeholder: 'Chọn thể loại...',
        clearable: true,
        multiple: true,
        'show-checkbox': true,
        'collapse-tags': true,
        'collapse-tags-tooltip': true,
        checkStrictly: true,
        'default-expand-all': true,
        class: 'w-full'
      }
    }
  ])

  const getStatusType = (status: string) => {
    switch (status) {
      case 'InStock':
        return 'success'
      case 'LowStock':
        return 'warning'
      case 'OutOfStock':
        return 'danger'
      default:
        return 'info'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'InStock':
        return 'Còn hàng'
      case 'LowStock':
        return 'Sắp hết'
      case 'OutOfStock':
        return 'Hết hàng'
      default:
        return status
    }
  }

  watch(
    () => formData.value.variants?.length,
    () => {
      syncPricingPanels()
    }
  )

  onMounted(() => {})
</script>

<style scoped>
  .art-table-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 3%);
  }

  .bg-primary {
    background-color: var(--main-color);
  }

  :deep(.product-tabs .el-tabs__item.is-active) {
    font-weight: bold;
    color: #ff4d4f !important;
  }

  :deep(.product-tabs .el-tabs__active-bar) {
    background-color: #ff4d4f !important;
  }

  .form-tabs {
    overflow: hidden;
    border: 1px solid #f0f0f0 !important;
    border-radius: 8px;
    box-shadow: none !important;
  }

  .product-uploader :deep(.el-upload) {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background-color: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 16px;
    transition: all 0.3s ease;
  }

  .product-uploader :deep(.el-upload:hover) {
    background-color: #fff;
    border-color: #ff4d4f;
  }

  .product-uploader-trigger {
    width: 200px;
    height: 200px;
  }

  .product-preview {
    display: block;
    width: 160px;
    height: 160px;
    object-fit: cover;
    border-radius: 16px;
  }

  :deep(.el-table__row--level-1) {
    background-color: #fafafa !important;
  }

  :deep(.el-table__expand-icon) {
    margin-right: 8px !important;
    font-weight: bold;
    color: var(--main-color) !important;
  }
</style>

<style>
  .premium-dialog {
    display: flex !important;
    flex-direction: column !important;
    height: 85vh !important;
    margin: auto !important;
    overflow: hidden !important;
    border-radius: 16px !important;
  }

  .premium-dialog .el-dialog__header {
    padding: 20px 24px !important;
    margin-right: 0 !important;
    background: #fff !important;
    border-bottom: 1px solid #f0f0f0 !important;
  }

  .premium-dialog .el-dialog__title {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #1f2937 !important;
  }

  .premium-dialog .el-dialog__body {
    flex: 1 !important;
    padding: 24px !important;
    overflow-y: auto !important;
    background: #f9fafb !important;
  }

  .premium-dialog .el-dialog__footer {
    display: flex !important;
    gap: 12px !important;
    justify-content: flex-end !important;
    padding: 16px 24px !important;
    background: #fff !important;
    border-top: 1px solid #e5e7eb !important;
  }

  .premium-dialog .el-tabs--border-card {
    overflow: hidden !important;
    background: #fff !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 12px !important;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 5%) !important;
  }

  .premium-dialog .el-tabs--border-card > .el-tabs__header {
    background-color: #f3f4f6 !important;
    border-bottom: 1px solid #e5e7eb !important;
    border-radius: 11px 11px 0 0 !important;
  }

  .premium-dialog .el-tabs--border-card > .el-tabs__content {
    padding: 20px !important;
  }
</style>
