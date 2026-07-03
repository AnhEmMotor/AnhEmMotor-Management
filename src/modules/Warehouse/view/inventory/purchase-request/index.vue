<template>
  <div class="flex flex-col gap-4 pb-5">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :label-width="120"
      :span="8"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard class="flex-1 art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        layout="search,refresh,size,fullscreen,columns,settings,guide"
        @refresh="refreshData"
        @guide="startTour"
      >
        <template #left>
          <div class="flex items-center gap-3">
            <ElButton
              type="primary"
              class="btn-add"
              v-auth="'Permissions.Warehouse.PurchaseRequestManagement.Create'"
              v-ripple
              @click="handleAdd"
              style="margin-left: 0"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Tạo yêu cầu mua hàng
            </ElButton>

            <ElButton
              v-auth="'Permissions.Warehouse.PurchaseRequestManagement.View'"
              :loading="exporting"
              :disabled="importing"
              class="btn-import"
              v-ripple
              @click="handleExport"
              style="margin-left: 0"
            >
              <ElIcon class="mr-1"><Download /></ElIcon> Xuất Excel
            </ElButton>

            <ElDropdown
              v-auth="'Permissions.Warehouse.PurchaseRequestManagement.Create'"
              trigger="click"
              class="btn-import"
              style="margin-left: 0"
              :disabled="importing"
            >
              <ElButton v-ripple :loading="importing" :disabled="importing">
                <ElIcon class="mr-1"><Upload /></ElIcon>
                {{ importing ? "Đang nhập..." : "Nhập Excel" }}
                <ElIcon class="el-icon--right"><ArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem @click="handleDownloadTemplate">
                    <div class="flex items-center gap-2">
                      <ElIcon><Download /></ElIcon> Tải mẫu Excel
                    </div>
                  </ElDropdownItem>
                  <ElDropdownItem>
                    <ElUpload
                      action="#"
                      :show-file-list="false"
                      :auto-upload="false"
                      :on-change="(file) => file.raw && handleImport(file.raw)"
                      accept=".xlsx, .xls"
                    >
                      <div class="flex items-center gap-2 w-full">
                        <ElIcon><Upload /></ElIcon> Nhập dữ liệu vào
                      </div>
                    </ElUpload>
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>

            <ElButton
              v-if="selectedRows.length === 1"
              type="warning"
              class="btn-bulk"
              v-ripple
              :disabled="importing"
              @click="handleCloneMany"
              style="margin-left: 0"
            >
              <ElIcon class="mr-1"><DocumentCopy /></ElIcon> Nhân bản
            </ElButton>

            <ElButton
              v-if="
                selectedRows.length > 0 &&
                selectedRows.every(
                  (row) => row.status?.toLowerCase() === 'draft',
                )
              "
              type="danger"
              class="btn-bulk"
              v-auth="'Permissions.Warehouse.PurchaseRequestManagement.Delete'"
              v-ripple
              :disabled="importing"
              @click="handleDeleteMany"
              style="margin-left: 0"
            >
              <ElIcon class="mr-1"><Delete /></ElIcon> Xóa ({{
                selectedRows.length
              }})
            </ElButton>

            <ElButton
              type="info"
              class="btn-restore"
              v-ripple
              :disabled="importing"
              @click="openRestoreDialog"
              style="margin-left: 0"
            >
              <ElIcon class="mr-1"><RefreshLeft /></ElIcon> Khôi phục
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>

        <template #status="{ row }">
          <ElTag :type="getStatusTagType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </ElTag>
        </template>

        <template #isFullyImported="{ row }">
          <template v-if="row.status?.toLowerCase() === 'approve'">
            <ElTag v-if="row.isFullyImported" type="success" size="small">
              Đã nhập đủ
            </ElTag>
            <ElTag v-else type="danger" size="small"> Chưa nhập đủ </ElTag>
          </template>
          <span v-else>-</span>
        </template>

        <template #operation="{ row }">
          <div class="flex gap-2 justify-center">
            <ElTooltip content="Xem chi tiết" placement="top">
              <ElButton
                circle
                size="small"
                type="info"
                @click="handleViewDetail(row)"
              >
                <ElIcon><View /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Chỉnh sửa"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="primary"
                v-auth="'Permissions.Warehouse.PurchaseRequestManagement.Edit'"
                @click="handleEdit(row)"
              >
                <ElIcon><Edit /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Xóa"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="danger"
                v-auth="
                  'Permissions.Warehouse.PurchaseRequestManagement.Delete'
                "
                @click="handleDelete(row)"
              >
                <ElIcon><Delete /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'draft'"
              content="Gửi phê duyệt"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                v-auth="'Permissions.Warehouse.PurchaseRequestManagement.Send'"
                @click="handleSendRequest(row)"
              >
                <ElIcon><Promotion /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'sent'"
              content="Duyệt yêu cầu"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="success"
                v-auth="
                  'Permissions.Warehouse.PurchaseRequestManagement.ApproveReject'
                "
                @click="handleApproveRejectStatus(row.id, 'approve')"
              >
                <ElIcon><Check /></ElIcon>
              </ElButton>
            </ElTooltip>
            <ElTooltip
              v-if="row.status?.toLowerCase() === 'sent'"
              content="Từ chối duyệt"
              placement="top"
            >
              <ElButton
                circle
                size="small"
                type="danger"
                v-auth="
                  'Permissions.Warehouse.PurchaseRequestManagement.ApproveReject'
                "
                @click="handleApproveRejectStatus(row.id, 'reject')"
              >
                <ElIcon><Close /></ElIcon>
              </ElButton>
            </ElTooltip>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <ElForm :model="formData" label-width="120px" class="mt-4" ref="formRef">
        <ElFormItem label="Ghi chú">
          <ElInput
            v-model="formData.note"
            type="textarea"
            :rows="2"
            placeholder="Nhập lý do mua hàng, mục đích sử dụng..."
          />
        </ElFormItem>

        <div class="border-t border-gray-100 pt-4 mt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-semibold text-gray-700"
              >Danh sách biến thể yêu cầu</span
            >
            <ElButton
              type="success"
              size="small"
              plain
              @click="handleAddProductRow"
            >
              <ElIcon class="mr-1"><Plus /></ElIcon> Thêm sản phẩm
            </ElButton>
          </div>

          <ElTable :data="formData.items" border size="small" class="w-full">
            <ElTableColumn label="Sản phẩm" required>
              <template #default="{ row, $index }">
                <div
                  class="w-full border border-gray-300 rounded px-2 py-1 bg-white flex items-center justify-between cursor-pointer hover:border-primary transition duration-200 min-h-[32px]"
                  @click="openProductSelector($index)"
                >
                  <span
                    v-if="row.productVariantId"
                    class="text-gray-800 text-xs font-medium"
                  >
                    {{ getProductNameById(row.productVariantId) }}
                  </span>
                  <span v-else class="text-gray-400 text-xs"
                    >Chọn biến thể sản phẩm...</span
                  >
                  <ElIcon class="text-gray-400 text-xs"><ArrowDown /></ElIcon>
                </div>
                <ElTag
                  v-if="getProductColorName(row)"
                  size="small"
                  type="info"
                  class="mt-1 w-fit"
                >
                  Màu: {{ getProductColorName(row) }}
                </ElTag>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Số lượng yêu cầu" width="180" align="center">
              <template #default="{ row }">
                <ElInputNumber
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  class="w-full"
                  controls-position="right"
                />
              </template>
            </ElTableColumn>

            <ElTableColumn
              label="Nhà cung cấp & Đơn giá"
              width="220"
              align="center"
            >
              <template #default="{ row, $index }">
                <div v-if="row.supplierId" class="text-left mb-1">
                  <div class="font-medium text-gray-800 text-xs text-center">
                    {{ row.supplierName }}
                  </div>
                  <div class="text-primary font-bold text-center">
                    {{ formatCurrency(row.unitPrice) }}
                  </div>
                </div>
                <div v-else class="text-gray-400 text-xs italic mb-1">
                  Chưa chọn báo giá
                </div>
                <ElButton
                  type="primary"
                  size="small"
                  plain
                  @click="openQuoteDialog(row, $index)"
                >
                  Chọn báo giá
                </ElButton>
              </template>
            </ElTableColumn>

            <ElTableColumn label="Thao tác" width="120" align="center">
              <template #default="{ $index }">
                <ElButton
                  circle
                  type="danger"
                  size="small"
                  plain
                  @click="handleRemoveProductRow($index)"
                >
                  <ElIcon><Delete /></ElIcon>
                </ElButton>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </ElForm>

      <template #footer>
        <div class="flex justify-end gap-2 border-t border-gray-50 pt-3">
          <ElButton @click="dialogVisible = false">Hủy</ElButton>
          <ElButton type="primary" :loading="submitting" @click="submitForm">
            Lưu yêu cầu
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <ElDialog
      v-model="quoteDialogVisible"
      title="Chọn báo giá"
      width="600px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElTable
          :data="paginatedQuotes"
          border
          size="small"
          class="w-full"
          v-loading="quoteLoading"
        >
          <ElTableColumn
            label="Nhà cung cấp"
            prop="supplierName"
            min-width="200"
          />
          <ElTableColumn label="Đơn giá" width="150" align="right">
            <template #default="{ row }">
              {{ formatCurrency(row.quotePrice) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Ghi chú" prop="note" min-width="150">
            <template #default="{ row }">
              {{ row.note || "--" }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="Thao tác" width="100" align="center">
            <template #default="{ row }">
              <ElButton
                type="primary"
                size="small"
                plain
                @click="applyQuoteFromDialog(row)"
              >
                Chọn
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="quotePage"
            v-model:page-size="quotePageSize"
            :total="quoteTotal"
            layout="prev, pager, next, total"
            background
            size="small"
          />
        </div>
      </div>
    </ElDialog>

    <ElDialog
      v-model="detailDialogVisible"
      title="Chi tiết Yêu cầu mua hàng"
      width="850px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div v-if="detailData" class="flex flex-col gap-4">
        <div class="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <span class="text-gray-500">Trạng thái:</span>
            <span class="ml-2">
              <ElTag :type="getStatusTagType(detailData.status)" size="small">
                {{ getStatusLabel(detailData.status) }}
              </ElTag>
            </span>
          </div>
          <div>
            <span class="text-gray-500">Thời gian tạo:</span>
            <span class="ml-2 text-gray-700">{{
              formatDateTime(detailData.createdAt)
            }}</span>
          </div>
          <div>
            <span class="text-gray-500">Người tạo:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.createdByName || "N/A"
            }}</span>
          </div>
          <div v-if="detailData.sentByName">
            <span class="text-gray-500">Người gửi:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.sentByName
            }}</span>
          </div>
          <div
            v-if="
              (detailData.status?.toLowerCase() === 'approve' ||
                detailData.status?.toLowerCase() === 'approved') &&
              detailData.approvedByName
            "
          >
            <span class="text-gray-500">Người duyệt:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.approvedByName
            }}</span>
          </div>
          <div
            v-if="
              (detailData.status?.toLowerCase() === 'reject' ||
                detailData.status?.toLowerCase() === 'rejected') &&
              detailData.rejectedByName
            "
          >
            <span class="text-gray-500">Người từ chối:</span>
            <span class="ml-2 text-gray-800 font-medium">{{
              detailData.rejectedByName
            }}</span>
          </div>
          <div class="col-span-2 border-t border-gray-200 pt-2 mt-1">
            <span class="text-gray-500 font-medium">Ghi chú:</span>
            <div
              class="mt-1 bg-white p-2.5 rounded border border-gray-100 text-gray-700"
            >
              {{ detailData.note || "Không có ghi chú" }}
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2">
            Danh sách mặt hàng
          </h4>
          <ElTable :data="detailData.items" border size="small" class="w-full">
            <ElTableColumn type="index" label="STT" width="55" align="center" />
            <ElTableColumn label="Tên sản phẩm" minWidth="200">
              <template #default="{ row }">
                <span class="font-medium text-gray-800">{{
                  row.productName
                }}</span>
                <div v-if="row.productVariantColorName" class="mt-1">
                  <ElTag size="small" type="info"
                    >Màu: {{ row.productVariantColorName }}</ElTag
                  >
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="quantity"
              label="S/L yêu cầu"
              width="95"
              align="center"
            />
            <ElTableColumn label="Nhà cung cấp & Đơn giá" minWidth="150">
              <template #default="{ row }">
                <div v-if="row.supplierName" class="text-left">
                  <div class="text-gray-800 font-medium">
                    {{ row.supplierName }}
                  </div>
                  <div class="text-primary font-bold">
                    {{ formatCurrency(row.unitPrice) }}
                  </div>
                </div>
                <span v-else class="text-gray-400 italic"
                  >Chưa chọn báo giá</span
                >
              </template>
            </ElTableColumn>

            <ElTableColumn
              v-if="
                detailData?.status?.toLowerCase() === 'approve' ||
                detailData?.status?.toLowerCase() === 'approved'
              "
              prop="importedQuantity"
              label="Đã nhập kho"
              width="105"
              align="center"
            >
              <template #default="{ row }">
                <span
                  :class="
                    row.importedQuantity > 0
                      ? 'text-success font-bold'
                      : 'text-gray-400'
                  "
                >
                  {{ row.importedQuantity }}
                </span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="
                detailData?.status?.toLowerCase() === 'approve' ||
                detailData?.status?.toLowerCase() === 'approved'
              "
              prop="pendingQuantity"
              label="Đang chờ"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-warning font-medium">{{
                  row.pendingQuantity
                }}</span>
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="
                detailData?.status?.toLowerCase() === 'approve' ||
                detailData?.status?.toLowerCase() === 'approved'
              "
              prop="unimportedQuantity"
              label="Còn lại chưa nhập"
              width="135"
              align="center"
            >
              <template #default="{ row }">
                <span class="text-danger font-medium">{{
                  row.unimportedQuantity
                }}</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <template #footer>
        <div
          class="flex justify-between items-center border-t border-gray-50 pt-3"
        >
          <div>
            <ElButton
              v-if="detailData?.id"
              type="primary"
              plain
              @click="auditTrailVisible = true"
            >
              <ElIcon class="mr-1"><Clock /></ElIcon> Lịch sử chỉnh sửa
            </ElButton>
          </div>
          <div class="flex gap-2">
            <ElButton @click="detailDialogVisible = false">Đóng</ElButton>

            <template v-if="detailData">
              <template v-if="detailData.status?.toLowerCase() === 'sent'">
                <ElButton
                  type="danger"
                  @click="handleApproveRejectStatus(detailData.id, 'reject')"
                >
                  Từ chối duyệt
                </ElButton>
                <ElButton
                  type="success"
                  @click="handleApproveRejectStatus(detailData.id, 'approve')"
                >
                  Duyệt yêu cầu
                </ElButton>
              </template>

              <template v-if="detailData.status?.toLowerCase() === 'draft'">
                <ElButton type="success" @click="handleSendRequest(detailData)">
                  Gửi phê duyệt
                </ElButton>
              </template>
            </template>
          </div>
        </div>
      </template>
    </ElDialog>

    <AuditTrailModal
      v-model:visible="auditTrailVisible"
      :record-id="detailData?.id"
      type="purchase-request"
    />

    <ElDialog
      v-model="productSelectorVisible"
      title="Chọn sản phẩm & màu sắc"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="space-y-4">
        <ElInput
          v-model="productSelectorQuery"
          placeholder="Tìm sản phẩm theo tên..."
          clearable
          prefix-icon="Search"
          @input="handleProductSelectorSearch"
        />

        <div
          v-loading="productSelectorLoading"
          class="space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto pr-1"
        >
          <div
            v-for="variant in productSelectorItems"
            :key="variant.id"
            class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-all duration-200"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <ElImage
                  :src="variant.coverImageUrl || ''"
                  class="w-12 h-12 rounded object-cover border border-gray-100 flex-shrink-0"
                  fit="cover"
                >
                  <template #error>
                    <div
                      class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"
                    >
                      <ElIcon><InfoFilled /></ElIcon>
                    </div>
                  </template>
                </ElImage>

                <div class="flex flex-col min-w-0">
                  <span class="text-sm font-semibold text-gray-800 truncate">
                    {{ variant.displayName }}
                  </span>
                  <span class="text-[11px] text-gray-400 mt-0.5 font-mono">
                    Variant ID: #{{ variant.id }}
                  </span>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end">
                <ElSelect
                  v-if="variant.colors?.length"
                  v-model="selectedVariantColors[String(variant.id)]"
                  placeholder="Chọn màu"
                  size="small"
                  style="width: 150px"
                  @click.stop
                >
                  <template #prefix>
                    <span
                      v-if="getSelectedVariantColor(variant)"
                      class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                      :style="{
                        backgroundColor:
                          getSelectedVariantColor(variant)?.colorCode ||
                          '#ffffff',
                      }"
                    ></span>
                  </template>
                  <ElOption
                    v-for="color in variant.colors"
                    :key="color.id"
                    :label="color.colorName || `Màu #${color.id}`"
                    :value="color.id"
                  >
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-block w-4 h-4 rounded border border-gray-200 flex-shrink-0"
                        :style="{
                          backgroundColor: color.colorCode || '#ffffff',
                        }"
                      ></span>
                      <span>{{ color.colorName || `Màu #${color.id}` }}</span>
                    </div>
                  </ElOption>
                </ElSelect>
                <ElButton
                  type="primary"
                  size="small"
                  plain
                  @click="selectProductVariant(variant)"
                >
                  Chọn
                </ElButton>
              </div>
            </div>
          </div>

          <div
            v-if="!productSelectorLoading && productSelectorItems.length === 0"
            class="flex flex-col items-center justify-center py-10 text-gray-400"
          >
            <ElIcon size="32"><InfoFilled /></ElIcon>
            <span class="mt-2 text-sm">Không tìm thấy sản phẩm nào</span>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <ElPagination
            v-model:current-page="productSelectorPage"
            v-model:page-size="productSelectorPageSize"
            :total="productSelectorTotal"
            layout="prev, pager, next, total"
            background
            size="small"
            @current-change="fetchSelectorProducts"
          />
        </div>
      </div>
    </ElDialog>
    <ElDialog
      v-model="restoreDialogVisible"
      title="Khôi phục yêu cầu mua hàng đã xóa"
      width="900px"
      append-to-body
      destroy-on-close
      class="rounded-xl overflow-hidden"
    >
      <div class="mb-4 flex justify-between items-center">
        <span class="text-sm text-gray-500"
          >Chọn các yêu cầu mua hàng để khôi phục</span
        >
        <ElButton
          type="primary"
          :disabled="selectedDeletedRequests.length === 0"
          @click="handleRestoreMany"
        >
          Khôi phục ({{ selectedDeletedRequests.length }})
        </ElButton>
      </div>
      <ElTable
        :data="deletedRequestsData"
        v-loading="deletedRequestsLoading"
        border
        size="small"
        @selection-change="handleDeletedSelectionChange"
      >
        <ElTableColumn type="selection" width="50" align="center" />
        <ElTableColumn prop="note" label="Ghi chú" min-width="200" />
        <ElTableColumn prop="createdByName" label="Người tạo" min-width="150" />
        <ElTableColumn
          prop="deleted_at"
          label="Thời gian xóa"
          width="160"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.deleted_at) }}
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDialog>

    <ImportResultDialog
      v-model="importResultDialogVisible"
      :result-data="importResultData"
      title="Kết quả nhập Excel yêu cầu mua hàng"
      download-template-text="Tải file mẫu yêu cầu mua hàng"
      @download-template="handleDownloadTemplate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Plus,
  Edit,
  Delete,
  View,
  ArrowDown,
  InfoFilled,
  Promotion,
  Check,
  Close,
  Clock,
  DocumentCopy,
  RefreshLeft,
  Upload,
  Download,
} from "@element-plus/icons-vue";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import AuditTrailModal from "@/components/business/audit-trail-modal/index.vue";
import { usePurchaseRequestTable } from "@/views/inventory/purchase-request/hooks/usePurchaseRequestTable";
import ImportResultDialog from "@/components/business/import-result-dialog/index.vue";

defineOptions({ name: "PurchaseRequest" });

const auditTrailVisible = ref(false);

const {
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
  searchForm,
  searchItems,
  dialogVisible,
  dialogTitle,
  formData,
  submitting,
  handleAdd,
  handleEdit,
  handleDelete,
  submitForm,
  detailDialogVisible,
  detailData,
  handleViewDetail,
  handleApproveRejectStatus,
  handleSendRequest,
  productSelectorVisible,
  productSelectorLoading,
  productSelectorQuery,
  productSelectorPage,
  productSelectorPageSize,
  productSelectorTotal,
  productSelectorItems,
  selectedVariantColors,
  fetchSelectorProducts,
  openProductSelector,
  selectProductVariant,
  handleProductSelectorSearch,
  handleAddProductRow,
  handleRemoveProductRow,
  getProductNameById,
  getProductColorName,
  getSelectedVariantColor,
  quoteDialogVisible,
  quoteLoading,
  quotePage,
  quotePageSize,
  quoteTotal,
  paginatedQuotes,
  openQuoteDialog,
  applyQuoteFromDialog,
  formatCurrency,
  formatDateTime,
  getStatusLabel,
  getStatusTagType,
  selectedRows,
  handleSelectionChange,
  handleDeleteMany,
  handleCloneMany,
  restoreDialogVisible,
  deletedRequestsData,
  deletedRequestsLoading,
  selectedDeletedRequests,
  handleDeletedSelectionChange,
  openRestoreDialog,
  handleRestoreMany,
  importing,
  importResultData,
  importResultDialogVisible,
  handleImport,
  handleDownloadTemplate,
  exporting,
  handleExport,
} = usePurchaseRequestTable();

const startTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    nextBtnText: "Tiếp theo",
    prevBtnText: "Quay lại",
    doneBtnText: "Hoàn thành",
    steps: [
      {
        element: ".art-table-card",
        popover: {
          title: "Bảng dữ liệu",
          description: "Hiển thị danh sách yêu cầu mua hàng.",
          side: "top",
          align: "start",
        },
      },
      {
        element: ".btn-add",
        popover: {
          title: "Thêm yêu cầu",
          description: "Click vào đây để tạo mới một yêu cầu mua hàng.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: ".btn-import",
        popover: {
          title: "Nhập/Xuất Excel",
          description: "Bạn có thể nhập hoặc xuất danh sách bằng Excel.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: ".btn-bulk",
        popover: {
          title: "Thao tác hàng loạt",
          description:
            "Chọn các hàng trong bảng để xóa hoặc nhân bản hàng loạt.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: ".btn-restore",
        popover: {
          title: "Khôi phục dữ liệu",
          description: "Xem và khôi phục các yêu cầu mua hàng đã bị xóa.",
          side: "bottom",
          align: "start",
        },
      },
    ],
  });
  driverObj.drive();
};
</script>

<style scoped>
:deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}
</style>
