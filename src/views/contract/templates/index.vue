<template>
  <div class="contract-templates-page min-h-screen font-inter pb-10">
    <div
      class="template-list-header border-b px-8 py-5 sticky top-0 z-[100] flex justify-between items-center"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg"
        >
          <ArtSvgIcon icon="ri:layout-4-line" class="text-xl" />
        </div>
        <div>
          <h1
            class="m-0 text-lg font-black tracking-tight text-slate-900 leading-none"
          >
            {{ t("menus.contract.templates") }}
          </h1>
          <p
            class="m-0 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2"
          >
            <span
              class="size-1.5 rounded-full bg-emerald-500 animate-pulse"
            ></span>
            DANH SÁCH MẪU HỢP ĐỒNG
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-button
          type="primary"
          @click="handleCreate"
          class="!h-10 !px-6 !rounded-xl !font-black !text-[10px] !uppercase !tracking-widest !shadow-xl hover:!shadow-2xl active:!scale-95 transition-all"
        >
          <ArtSvgIcon icon="ri:add-line" class="mr-1" />
          {{ t("menus.contract.templateCreate") }}
        </el-button>
      </div>
    </div>

    <div class="max-w-[1600px] mx-auto p-8">
      <div class="template-filter-panel border rounded-[24px] p-6 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex-1 min-w-[240px]">
            <el-input
              v-model="searchQuery"
              :placeholder="t('menus.contract.templateSearchPlaceholder')"
              clearable
              class="!rounded-xl"
              @input="handleSearch"
            >
              <template #prefix>
                <ArtSvgIcon
                  icon="ri:search-line"
                  class="text-slate-400 text-sm"
                />
              </template>
            </el-input>
          </div>
          <el-select
            v-model="filterType"
            :placeholder="t('menus.contract.templateType')"
            clearable
            class="!w-44"
            popper-class="contract-template-select-popper"
            @change="handleFilterChange"
          >
            <el-option :label="t('menus.contract.filterAll')" value="" />
            <el-option :label="t('menus.contract.typeSales')" value="Sales" />
            <el-option
              :label="t('menus.contract.typeFinance')"
              value="Finance"
            />
            <el-option
              :label="t('menus.contract.typeSupplier')"
              value="Supplier"
            />
          </el-select>
          <el-select
            v-model="filterStatus"
            :placeholder="t('menus.contract.templateStatus')"
            clearable
            class="!w-44"
            popper-class="contract-template-select-popper"
            @change="handleFilterChange"
          >
            <el-option :label="t('menus.contract.filterAll')" value="" />
            <el-option :label="t('menus.contract.filterActive')" :value="1" />
            <el-option :label="t('menus.contract.filterArchived')" :value="2" />
          </el-select>
        </div>
      </div>

      <div
        class="mb-4 text-slate-500 text-[13px] italic font-medium flex items-center gap-2"
      >
        <ArtSvgIcon icon="ri:information-line" />
        Tìm thấy {{ totalCount }} mẫu hợp đồng phù hợp dựa trên bộ lọc
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div
          v-for="row in tableData"
          :key="row.id"
          class="template-card border rounded-[20px] transition-shadow flex flex-col"
        >
          <!-- Card Header -->
          <div class="p-5 flex items-start gap-4">
            <div
              class="size-12 rounded-xl flex-cc text-white shrink-0 shadow-inner"
              :class="getTypeColor(row.type)"
            >
              <ArtSvgIcon icon="ri:file-text-line" class="text-2xl" />
            </div>
            <div class="flex-1 min-w-0">
              <h3
                class="m-0 text-[15px] font-black text-slate-800 leading-tight mb-2 truncate"
                :title="row.name"
              >
                {{ row.name }}
              </h3>
              <el-tag
                :type="getTypeTagType(row.type)"
                size="small"
                effect="light"
                class="!rounded-lg !font-bold"
              >
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </div>
          </div>

          <!-- Card Body -->
          <div class="px-5 pb-5 flex-1">
            <div
              class="border-y border-slate-100 py-4 grid grid-cols-2 gap-y-3 gap-x-4"
            >
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:git-branch-line" class="text-slate-400" />
                Phiên bản:
                <span class="font-bold text-slate-700">v{{ row.version }}</span>
              </div>
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon
                  icon="ri:checkbox-circle-line"
                  class="text-slate-400"
                />
                Trạng thái:
                <span
                  class="font-bold"
                  :class="
                    row.status === 1 ? 'text-emerald-500' : 'text-slate-400'
                  "
                >
                  {{ row.status === 1 ? "Đang áp dụng" : "Đã lưu trữ" }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:brackets-line" class="text-slate-400" />
                Biến số:
                <span class="font-bold text-slate-700"
                  >{{ row.variableCount || 14 }} trường</span
                >
              </div>
              <div class="flex items-center gap-2 text-[12px] text-slate-500">
                <ArtSvgIcon icon="ri:calendar-line" class="text-slate-400" />
                Cập nhật:
                <span class="font-bold text-slate-700">{{
                  formatDate(row.createdAt)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div
            class="template-card-actions flex items-center border-t rounded-b-[20px]"
          >
            <button
              @click="handlePreview(row)"
              class="flex-1 py-3.5 text-[13px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-colors flex-cc gap-2 border-r border-slate-100 rounded-bl-[20px]"
            >
              <ArtSvgIcon icon="ri:eye-line" /> Xem trước
            </button>
            <button
              @click="handleEdit(row)"
              :disabled="row.isUsed"
              class="flex-1 py-3.5 text-[13px] font-bold transition-colors flex-cc gap-2 border-r border-slate-100"
              :class="
                row.isUsed
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/80'
              "
            >
              <ArtSvgIcon icon="ri:edit-2-line" /> Sửa
            </button>
            <button
              @click="handleVariables(row)"
              class="flex-1 py-3.5 text-[13px] font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50/80 transition-colors flex-cc gap-2 rounded-br-[20px]"
            >
              <ArtSvgIcon icon="ri:brackets-line" /> Gắn biến
            </button>
          </div>
        </div>
      </div>

      <div
        class="template-pagination-panel border rounded-[20px] px-6 py-4 flex justify-between items-center"
      >
        <span class="text-[11px] font-bold text-slate-400">
          Hiển thị {{ tableData.length }} / {{ totalCount }} mẫu
        </span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchTemplates"
          @size-change="fetchTemplates"
          class="!font-bold"
        />
      </div>
    </div>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      title="Xem trước mẫu hợp đồng"
      width="90vw"
      top="4vh"
      destroy-on-close
      class="variables-modal"
    >
      <div class="preview-dialog-toolbar">
        <div class="min-w-0">
          <div class="preview-dialog-title">
            {{ selectedTemplate?.name || "Mẫu hợp đồng" }}
          </div>
          <div class="preview-dialog-subtitle">
            Dữ liệu mẫu được dùng để kiểm tra bố cục và biến động
          </div>
        </div>
        <div v-if="previewUnresolvedTokens.length" class="preview-unresolved">
          <span class="preview-unresolved-label">Chưa nhận diện</span>
          <span
            v-for="token in previewUnresolvedTokens"
            :key="token"
            class="preview-unresolved-token"
          >
            {{ token }}
          </span>
        </div>
        <div v-else class="preview-ready">
          <ArtSvgIcon icon="ri:checkbox-circle-line" />
          Đã thay dữ liệu mẫu
        </div>
      </div>
      <div class="a4-preview">
        <div class="a4-page" v-html="previewHtml"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            @click="previewVisible = false"
            class="!h-10 !rounded-xl !font-bold"
            >Đóng</el-button
          >
          <el-button
            type="primary"
            @click="handlePrint"
            class="!h-10 !rounded-xl !font-bold"
          >
            <ArtSvgIcon icon="ri:printer-line" class="mr-1.5" />
            In hợp đồng mẫu
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Variables Modal -->
    <el-dialog
      v-model="variablesVisible"
      :title="
        selectedTemplate
          ? `Danh sách biến: ${selectedTemplate.name}`
          : 'Danh sách biến số'
      "
      width="920px"
      destroy-on-close
      class="variables-modal"
    >
      <div class="space-y-4">
        <div class="variable-attach-summary">
          <div class="variable-attach-summary-header">
            <div>
              <div class="variable-attach-title">Biến đang dùng trong mẫu</div>
              <div class="variable-attach-subtitle">
                Bấm vào biến để sao chép nhanh, hoặc mở trình gắn biến để chèn
                trực tiếp.
              </div>
            </div>
            <el-button
              type="primary"
              class="!h-9 !rounded-xl !font-bold"
              :disabled="selectedTemplate?.isUsed"
              @click="openVariableEditor"
            >
              <ArtSvgIcon icon="ri:edit-box-line" class="mr-1.5" />
              Mở trình gắn biến
            </el-button>
          </div>

          <div v-if="hasUsedVariables" class="variable-used-groups">
            <div
              v-for="group in usedVariableGroupsForDisplay"
              :key="group.key"
              class="variable-used-group"
              :class="`variable-used-group--${group.tone}`"
            >
              <div class="variable-used-heading">
                <ArtSvgIcon :icon="group.icon" />
                {{ group.shortTitle }}
              </div>
              <button
                v-for="token in group.tokens"
                :key="token.key"
                class="variable-token variable-token--clickable"
                :class="`variable-token--${group.tone}`"
                :title="token.label"
                @click="copyVariableKey(token.key)"
              >
                {{ token.key }}
              </button>
            </div>
            <div
              v-if="unknownVariableKeys.length"
              class="variable-used-group variable-used-group--danger"
            >
              <div class="variable-used-heading">
                <ArtSvgIcon icon="ri:error-warning-line" />
                Chưa nhận diện
              </div>
              <button
                v-for="token in unknownVariableKeys"
                :key="token"
                class="variable-token variable-token--danger variable-token--clickable"
                @click="copyVariableKey(token)"
              >
                {{ token }}
              </button>
            </div>
          </div>
          <div v-else class="variable-empty-note">
            Mẫu này chưa dùng biến nào trong nội dung. Mở trình gắn biến để chèn
            placeholder vào mẫu.
          </div>
        </div>
        <el-input
          v-model="variableSearch"
          placeholder="Tìm kiếm biến số..."
          clearable
          size="small"
          class="!mb-4"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" class="text-slate-400 text-xs" />
          </template>
        </el-input>

        <div v-if="hasVariables" class="variables-modal-content space-y-4">
          <!-- Customer Group -->
          <div
            v-if="filteredVariableGroups.customer.length"
            class="variable-group"
          >
            <div class="variable-group-header flex items-center gap-2 mb-2">
              <span
                class="size-5 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-400"
              >
                <ArtSvgIcon icon="ri:user-line" class="text-xs" />
              </span>
              <span
                class="text-[11px] font-black text-amber-400 uppercase tracking-wider"
                >Khách hàng</span
              >
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="token in filteredVariableGroups.customer"
                :key="token.key"
                class="variable-token variable-token--amber variable-token--clickable"
                :title="token.label"
                @click="copyVariableKey(token.key)"
              >
                {{ token.key }}
              </span>
            </div>
          </div>

          <!-- Vehicle Group -->
          <div
            v-if="filteredVariableGroups.vehicle.length"
            class="variable-group"
          >
            <div class="variable-group-header flex items-center gap-2 mb-2">
              <span
                class="size-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400"
              >
                <ArtSvgIcon icon="ri:motorbike-line" class="text-xs" />
              </span>
              <span
                class="text-[11px] font-black text-emerald-400 uppercase tracking-wider"
                >Xe máy / Giao dịch</span
              >
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="token in filteredVariableGroups.vehicle"
                :key="token.key"
                class="variable-token variable-token--emerald variable-token--clickable"
                :title="token.label"
                @click="copyVariableKey(token.key)"
              >
                {{ token.key }}
              </span>
            </div>
          </div>

          <!-- Finance Group -->
          <div
            v-if="filteredVariableGroups.finance.length"
            class="variable-group"
          >
            <div class="variable-group-header flex items-center gap-2 mb-2">
              <span
                class="size-5 rounded-md bg-violet-500/15 flex items-center justify-center text-violet-400"
              >
                <ArtSvgIcon
                  icon="ri:money-dollar-circle-line"
                  class="text-xs"
                />
              </span>
              <span
                class="text-[11px] font-black text-violet-400 uppercase tracking-wider"
                >Tài chính / Trả góp</span
              >
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="token in filteredVariableGroups.finance"
                :key="token.key"
                class="variable-token variable-token--violet variable-token--clickable"
                :title="token.label"
                @click="copyVariableKey(token.key)"
              >
                {{ token.key }}
              </span>
            </div>
          </div>

          <!-- Supplier Group -->
          <div
            v-if="filteredVariableGroups.supplier.length"
            class="variable-group"
          >
            <div class="variable-group-header flex items-center gap-2 mb-2">
              <span
                class="size-5 rounded-md bg-orange-500/15 flex items-center justify-center text-orange-400"
              >
                <ArtSvgIcon icon="ri:truck-line" class="text-xs" />
              </span>
              <span
                class="text-[11px] font-black text-orange-400 uppercase tracking-wider"
                >Nhà cung cấp</span
              >
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="token in filteredVariableGroups.supplier"
                :key="token.key"
                class="variable-token variable-token--orange variable-token--clickable"
                :title="token.label"
                @click="copyVariableKey(token.key)"
              >
                {{ token.key }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-slate-500">
          <p class="m-0">Mẫu hợp đồng này không chứa biến số nào.</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getContractTemplates,
  deleteContractTemplate,
  cloneContractTemplate,
} from "@/infrastructure/api/contract-template.api";
import { useCommon } from "@/hooks/core/useCommon";
import {
  extractUsedTokenGroups,
  getTokenGroupsForDisplay,
  getUnresolvedPreviewTokens,
  parseDynamicFields as parseContractDynamicFields,
  type TokenGroupMap,
} from "./contract-template.utils";

defineOptions({ name: "ContractTemplateList" });

const { t } = useI18n();
const router = useRouter();

const searchQuery = ref("");
const filterType = ref("");
const filterStatus = ref<number | "">("");
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);
const tableData = ref<any[]>([]);

// Preview and Variables states
const previewVisible = ref(false);
const previewHtml = ref("");
const previewUnresolvedTokens = ref<string[]>([]);
const variablesVisible = ref(false);
const variableSearch = ref("");
const selectedTemplate = ref<any>(null);
const variableGroups = ref<TokenGroupMap>({
  customer: [],
  vehicle: [],
  finance: [],
  supplier: [],
});
const usedVariableGroups = ref<TokenGroupMap>({
  customer: [],
  vehicle: [],
  finance: [],
  supplier: [],
});
const unknownVariableKeys = ref<string[]>([]);

const _headerCellStyle = () => ({
  background: "#f8fafc",
  color: "#64748b",
  fontWeight: 800,
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "2px solid #e2e8f0",
});

const _cellStyle = () => ({
  padding: "12px 16px",
  borderBottom: "1px solid #f1f5f9",
});

const _getTypeAbbr = (type: string) => {
  const map: Record<string, string> = {
    Sales: "MB",
    Finance: "TG",
    Supplier: "NC",
    Appendix: "PL",
  };
  return map[type] || type.slice(0, 2).toUpperCase();
};

const getTypeColor = (type: string) => {
  const map: Record<string, string> = {
    Sales: "bg-blue-500",
    Finance: "bg-violet-500",
    Supplier: "bg-emerald-500",
    Appendix: "bg-amber-500",
  };
  return map[type] || "bg-slate-400";
};

const getTypeTagType = (
  type: string,
): "primary" | "warning" | "success" | "info" => {
  const map: Record<string, "primary" | "warning" | "success" | "info"> = {
    Sales: "primary",
    Finance: "warning",
    Supplier: "success",
    Appendix: "info",
  };
  return map[type] || "info";
};

const getTypeLabel = (type: string) => {
  const key = `menus.contract.type${type.charAt(0).toUpperCase() + type.slice(1)}`;
  return t(key) || type;
};

const _getStatusTagType = (status: number) => {
  const map: Record<number, string> = { 1: "success", 2: "info", 3: "danger" };
  return map[status] || "info";
};

const _getStatusLabel = (status: number) => {
  const key = `menus.contract.status${status === 1 ? "Active" : status === 2 ? "Inactive" : "Deprecated"}`;
  return t(key) || String(status);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const fetchTemplates = async () => {
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      filter: filterType.value ? `type == ${filterType.value}` : undefined,
    };
    if (filterStatus.value) {
      params.filter = params.filter
        ? `${params.filter},status == ${filterStatus.value}`
        : `status == ${filterStatus.value}`;
    }
    const res = await getContractTemplates(params);
    tableData.value = res.items.map((item: any) => ({
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
    }));
    totalCount.value = res.totalCount;
  } catch (_err) {
    ElMessage.error("Không thể tải danh sách mẫu hợp đồng");
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchTemplates();
};

const handleFilterChange = () => {
  currentPage.value = 1;
  fetchTemplates();
};

const handleCreate = () => {
  router.push({ name: "EditContractTemplate" });
};

const handleEdit = (row: any) => {
  if (row.isUsed) {
    ElMessage.warning(t("menus.contract.cannotUpdateUsedTemplate"));
    return;
  }
  router.push({ name: "EditContractTemplate", params: { id: row.id } });
};

const getPreviewContent = (content: string) => {
  // Note: Preview uses actual data when available. For empty template preview,
  // only basic placeholders are shown without hardcoded sample data.
  return `<div style="position: relative;">
      <div style="position: absolute; top: 14px; right: 18px; z-index: 2; padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 999px; color: #64748b; background: #ffffff; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700;">
        Bản xem thử - Cần nhập dữ liệu
      </div>
      ${content}
    </div>`;
};

const parseDynamicFields = (dynamicFieldsStr?: string) => {
  return parseContractDynamicFields(dynamicFieldsStr);
};

const handlePreview = (row: any) => {
  selectedTemplate.value = row;
  previewHtml.value = getPreviewContent(row.content || "");
  previewUnresolvedTokens.value = getUnresolvedPreviewTokens(row.content || "");
  previewVisible.value = true;
};

const handleVariables = (row: any) => {
  selectedTemplate.value = row;
  const parsed = parseDynamicFields(row.dynamicFields);
  const usedTokens = extractUsedTokenGroups(row.content || "", parsed);
  variableGroups.value = parsed;
  usedVariableGroups.value = usedTokens.groups;
  unknownVariableKeys.value = usedTokens.unknownTokens;
  variablesVisible.value = true;
};

const hasVariables = computed(() => {
  const g = variableGroups.value;
  return !!(
    g.customer.length ||
    g.vehicle.length ||
    g.finance.length ||
    g.supplier.length
  );
});

const hasUsedVariables = computed(() => {
  const g = usedVariableGroups.value;
  return !!(
    g.customer.length ||
    g.vehicle.length ||
    g.finance.length ||
    g.supplier.length ||
    unknownVariableKeys.value.length
  );
});

const filteredVariableGroups = computed(() => {
  const search = variableSearch.value.toLowerCase().trim();
  const filterFn = (item: any) => {
    if (!search) return true;
    return (
      item.key.toLowerCase().includes(search) ||
      (item.label && item.label.toLowerCase().includes(search))
    );
  };

  return {
    customer: variableGroups.value.customer.filter(filterFn),
    vehicle: variableGroups.value.vehicle.filter(filterFn),
    finance: variableGroups.value.finance.filter(filterFn),
    supplier: variableGroups.value.supplier.filter(filterFn),
  };
});

const usedVariableGroupsForDisplay = computed(() =>
  getTokenGroupsForDisplay(usedVariableGroups.value).filter(
    (group) => group.tokens.length > 0,
  ),
);

const copyVariableKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key);
    ElMessage.success(`Đã sao chép ${key}`);
  } catch {
    ElMessage.warning("Không thể sao chép biến trên trình duyệt hiện tại");
  }
};

const openVariableEditor = () => {
  if (!selectedTemplate.value) return;
  if (selectedTemplate.value.isUsed) {
    ElMessage.warning(t("menus.contract.cannotUpdateUsedTemplate"));
    return;
  }
  variablesVisible.value = false;
  router.push({
    name: "EditContractTemplate",
    params: { id: selectedTemplate.value.id },
    query: { panel: "variables" },
  });
};

const handlePrint = () => {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(`
        <html>
          <head>
            <title>In mẫu hợp đồng</title>
            <style>
              body {
                padding: 20px;
                font-family: "Times New Roman", serif;
                font-size: 14px;
                line-height: 1.35;
                color: #111827;
                background: white;
              }
              h1 {
                margin: 10px 0 4px;
                font-size: 20px;
                font-weight: 700;
                line-height: 1.2;
                text-align: center;
                text-transform: uppercase;
              }
              h2 {
                margin: 10px 0 4px;
                font-size: 15px;
                font-weight: 700;
                line-height: 1.25;
                text-transform: uppercase;
              }
              p {
                margin: 2px 0;
              }
              ol, ul {
                padding-left: 18px;
                margin: 4px 0 8px;
              }
              li {
                margin: 2px 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 6px 0 10px;
              }
              td, th {
                border: 1px solid #111827;
                padding: 5px 6px;
                text-align: left;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${previewHtml.value}
          </body>
        </html>
      `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
};

const _handleArchive = async (_row: any) => {
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc muốn lưu trữ mẫu hợp đồng này?",
      "Lưu trữ mẫu",
      {
        confirmButtonText: "Lưu trữ",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
    // Call mock or real API here, e.g. await archiveContractTemplate(row.id)
    ElMessage.success("Lưu trữ mẫu hợp đồng thành công!");
    fetchTemplates();
  } catch (_e) {
    // User cancelled
  }
};

const _handleClone = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `Nhân bản mẫu "${row.name}" thành phiên bản mới? Mẫu mới sẽ có version v${parseFloat(String(row.version)) + 0.1} và được kích hoạt ngay.`,
      "Nhân bản Mẫu Hợp đồng",
      { confirmButtonText: "Nhân bản", cancelButtonText: "Hủy", type: "info" },
    );
    await cloneContractTemplate(row.id);
    ElMessage.success(t("menus.contract.cloneSuccess"));
    fetchTemplates();
  } catch (_e) {
    // User cancelled
  }
};

const _handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      t("menus.contract.confirmDeleteTemplate"),
      "Xóa Mẫu Hợp đồng",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    );
    await deleteContractTemplate(row.id);
    ElMessage.success(t("menus.contract.deleteSuccess"));
    fetchTemplates();
  } catch (_e) {
    // User cancelled
  }
};

onMounted(() => {
  useCommon().scrollToTop();
  fetchTemplates();
});
</script>

<style scoped lang="scss">
.contract-templates-page {
  min-height: 100vh;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-page);

  .template-list-header {
    background: var(--el-bg-color);
    border-color: var(--el-border-color-lighter);
  }

  .template-filter-panel,
  .template-card,
  .template-pagination-panel {
    background: var(--el-bg-color-overlay);
    border-color: var(--el-border-color-lighter);
    box-shadow: 0 14px 36px rgb(15 23 42 / 8%);
  }

  .template-card {
    overflow: hidden;

    &:hover {
      border-color: var(--el-border-color);
      box-shadow: 0 18px 42px rgb(15 23 42 / 12%);
    }
  }

  .template-card-actions {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color-lighter);

    button {
      color: var(--el-text-color-primary);
      border-color: var(--el-border-color-lighter);

      &:hover {
        color: #ff6b6b;
        background: rgb(232 74 74 / 12%);
      }
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 38px;
  }

  :deep(.el-pagination) {
    .el-pager li.is-active {
      color: #fff;
      background: #e84a4a;
      border-color: #e84a4a;
    }
  }

  :deep(.el-tag) {
    border-color: transparent;
  }
}

:global(html.dark .contract-templates-page) {
  color: #f8fafc;
  background: #050506;
}

:global(html.dark .contract-templates-page .template-list-header) {
  background: #050506;
  border-color: rgb(255 255 255 / 9%);
}

:global(html.dark .contract-templates-page .template-filter-panel),
:global(html.dark .contract-templates-page .template-card),
:global(html.dark .contract-templates-page .template-pagination-panel) {
  background: #161618;
  border-color: rgb(255 255 255 / 10%);
  box-shadow: 0 14px 36px rgb(0 0 0 / 24%);
}

:global(html.dark .contract-templates-page .template-card:hover) {
  border-color: rgb(255 255 255 / 18%);
  box-shadow: 0 18px 42px rgb(0 0 0 / 32%);
}

:global(html.dark .contract-templates-page .template-card-actions) {
  background: #111214;
  border-color: rgb(255 255 255 / 9%);
}

:global(html.dark .contract-templates-page .template-card-actions button) {
  color: #f8fafc;
  border-color: rgb(255 255 255 / 9%);
}

:global(html.dark .contract-templates-page h1),
:global(html.dark .contract-templates-page h2),
:global(html.dark .contract-templates-page h3),
:global(html.dark .contract-templates-page h4),
:global(html.dark .contract-templates-page h5),
:global(html.dark .contract-templates-page h6),
:global(html.dark .contract-templates-page p),
:global(html.dark .contract-templates-page li),
:global(html.dark .contract-templates-page td),
:global(html.dark .contract-templates-page th),
:global(html.dark .contract-templates-page .text-slate-100),
:global(html.dark .contract-templates-page .text-slate-200),
:global(html.dark .contract-templates-page .text-slate-300),
:global(html.dark .contract-templates-page .text-slate-700),
:global(html.dark .contract-templates-page .text-slate-800),
:global(html.dark .contract-templates-page .text-slate-900),
:global(html.dark .contract-templates-page [class*="text-slate-"]) {
  color: #f8fafc !important;
}

:global(html.dark .contract-templates-page .text-slate-400) {
  color: #9ca3af !important;
}

:global(html.dark .contract-templates-page .text-slate-500) {
  color: #cbd5e1 !important;
}

:global(html.dark .contract-templates-page .text-slate-600) {
  color: #e5e7eb !important;
}

:global(html.dark .contract-templates-page .text-red-500),
:global(html.dark .contract-templates-page .text-red-400),
:global(html.dark .contract-templates-page .text-red-300) {
  color: #f87171 !important;
}

:global(html.dark .contract-templates-page .text-green-600),
:global(html.dark .contract-templates-page .text-green-500),
:global(html.dark .contract-templates-page .text-green-400),
:global(html.dark .contract-templates-page .text-emerald-500),
:global(html.dark .contract-templates-page .text-emerald-400),
:global(html.dark .contract-templates-page .text-emerald-300) {
  color: #34d399 !important;
}

:global(html.dark .contract-templates-page .text-blue-500),
:global(html.dark .contract-templates-page .text-blue-400) {
  color: #60a5fa !important;
}

:global(html.dark .contract-templates-page .text-amber-500),
:global(html.dark .contract-templates-page .text-amber-400),
:global(html.dark .contract-templates-page .text-amber-300) {
  color: #fbbf24 !important;
}

:global(html.dark .contract-templates-page .text-violet-500),
:global(html.dark .contract-templates-page .text-violet-400) {
  color: #c4b5fd !important;
}

:global(html.dark .contract-templates-page .text-orange-500),
:global(html.dark .contract-templates-page .text-orange-400) {
  color: #fb923c !important;
}

:global(html.dark .contract-templates-page .bg-red-500\/10) {
  background: rgb(239 68 68 / 20%) !important;
}

:global(html.dark .contract-templates-page .bg-amber-500\/10) {
  background: rgb(245 158 11 / 20%) !important;
}

:global(html.dark .contract-templates-page .bg-emerald-500\/10) {
  background: rgb(16 185 129 / 20%) !important;
}

:global(html.dark .contract-templates-page [class*="border-slate-"]) {
  border-color: rgb(255 255 255 / 12%) !important;
}

:global(html.dark .contract-templates-page .border-red-500\/30) {
  border-color: rgb(239 68 68 / 40%) !important;
}

:global(html.dark .contract-templates-page .border-amber-500\/25) {
  border-color: rgb(245 158 11 / 35%) !important;
}

:global(html.dark .contract-templates-page .border-emerald-500\/25) {
  border-color: rgb(16 185 129 / 35%) !important;
}

:global(html.dark .contract-templates-page .el-input__wrapper),
:global(html.dark .contract-templates-page .el-select__wrapper) {
  color: #f8fafc;
  background: #101114 !important;
  border: 1px solid rgb(255 255 255 / 14%);
  box-shadow: none !important;
}

:global(html.dark .contract-templates-page .el-input__inner),
:global(html.dark .contract-templates-page .el-select__placeholder),
:global(html.dark .contract-templates-page .el-select__selected-item),
:global(html.dark .contract-templates-page .el-select__caret) {
  color: #f8fafc !important;
}

:global(html.dark .contract-templates-page .el-input__inner::placeholder) {
  color: #9ca3af !important;
  opacity: 1;
}

:global(html.dark .contract-templates-page .el-pagination),
:global(html.dark .contract-templates-page .el-pagination__total),
:global(html.dark .contract-templates-page .el-pagination__sizes),
:global(
  html.dark .contract-templates-page .el-pagination .el-select__selected-item
),
:global(html.dark .contract-templates-page .el-pagination button),
:global(html.dark .contract-templates-page .el-pagination li) {
  color: #f8fafc;
}

:global(html.dark .contract-templates-page .el-pagination button),
:global(html.dark .contract-templates-page .el-pagination .el-pager li) {
  background: #101114;
  border: 1px solid rgb(255 255 255 / 10%);
}

:global(html.dark .contract-templates-page .el-tag) {
  color: #fff;
}

.contract-templates-table {
  :deep(.el-table__row) {
    transition: all 0.2s;

    &:hover {
      background-color: #f8fafc !important;
    }
  }

  :deep(.el-table__cell) {
    padding: 8px 0;
  }
}

:deep(.el-pagination) {
  .el-pager li {
    margin: 0 2px;
    font-weight: 700;
    border-radius: 8px;
  }
}

// Variables modal styles
:deep(.variables-modal) {
  border-radius: 20px !important;

  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;

    .el-dialog__title {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
  }

  .el-dialog__body {
    max-height: 70vh;
    padding: 20px 24px;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #e2e8f0;
  }
}

.preview-dialog-toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 16px;
}

.preview-dialog-title {
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
  white-space: nowrap;
}

.preview-dialog-subtitle {
  margin-top: 3px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.preview-ready,
.preview-unresolved {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
  max-width: 48%;
  font-size: 11px;
  font-weight: 800;
}

.preview-ready {
  color: #059669;
}

.preview-unresolved-label,
.preview-unresolved-token {
  padding: 4px 8px;
  border-radius: 999px;
}

.preview-unresolved-label {
  color: #b45309;
  background: rgb(245 158 11 / 12%);
}

.preview-unresolved-token {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  color: #b91c1c;
  background: rgb(239 68 68 / 10%);
  border: 1px solid rgb(239 68 68 / 24%);
}

.variable-attach-summary {
  padding: 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  border: 1px solid #dbe4f0;
  border-radius: 16px;
}

.variable-attach-summary-header {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.variable-attach-title {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.variable-attach-subtitle,
.variable-empty-note {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.variable-used-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.variable-used-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 10px;
  background: var(--used-bg);
  border: 1px solid var(--used-border);
  border-radius: 12px;
}

.variable-used-heading {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  width: 100%;
  font-size: 10px;
  font-weight: 900;
  color: var(--used-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.variable-used-group--amber {
  --used-color: #d97706;
  --used-bg: rgb(245 158 11 / 8%);
  --used-border: rgb(245 158 11 / 22%);
}

.variable-used-group--emerald {
  --used-color: #059669;
  --used-bg: rgb(16 185 129 / 8%);
  --used-border: rgb(16 185 129 / 22%);
}

.variable-used-group--violet {
  --used-color: #7c3aed;
  --used-bg: rgb(139 92 246 / 8%);
  --used-border: rgb(139 92 246 / 22%);
}

.variable-used-group--orange {
  --used-color: #ea580c;
  --used-bg: rgb(249 115 22 / 8%);
  --used-border: rgb(249 115 22 / 22%);
}

.variable-used-group--danger {
  --used-color: #dc2626;
  --used-bg: rgb(239 68 68 / 8%);
  --used-border: rgb(239 68 68 / 22%);
}

.variable-token {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid;
  border-radius: 8px;
  transition: all 0.2s;
}

.variable-token--clickable {
  cursor: pointer;

  &:hover {
    color: #fff;
    background: #111827;
    border-color: #111827;
    transform: translateY(-1px);
  }
}

.variable-token--amber {
  color: #d97706;
  background: rgb(245 158 11 / 10%);
  border-color: rgb(245 158 11 / 26%);
}

.variable-token--emerald {
  color: #059669;
  background: rgb(16 185 129 / 8%);
  border-color: rgb(16 185 129 / 20%);
}

.variable-token--violet {
  color: #7c3aed;
  background: rgb(139 92 246 / 8%);
  border-color: rgb(139 92 246 / 20%);
}

.variable-token--orange {
  color: #ea580c;
  background: rgb(249 115 22 / 8%);
  border-color: rgb(249 115 22 / 20%);
}

.variable-token--danger {
  color: #dc2626;
  background: rgb(239 68 68 / 8%);
  border-color: rgb(239 68 68 / 24%);
}

.variables-modal-content {
  .variable-group {
    padding: 16px;
    margin-bottom: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .variable-group-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .variable-token {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .variable-token--clickable {
    cursor: pointer;

    &:hover {
      color: #fff;
      background: #111827;
      border-color: #111827;
      transform: translateY(-1px);
    }
  }

  .variable-token--amber {
    color: #d97706;
    background: rgb(245 158 11 / 10%);
    border-color: rgb(245 158 11 / 26%);
  }

  .variable-token--emerald {
    color: #059669;
    background: rgb(16 185 129 / 8%);
    border-color: rgb(16 185 129 / 20%);
  }

  .variable-token--violet {
    color: #7c3aed;
    background: rgb(139 92 246 / 8%);
    border-color: rgb(139 92 246 / 20%);
  }

  .variable-token--orange {
    color: #ea580c;
    background: rgb(249 115 22 / 8%);
    border-color: rgb(249 115 22 / 20%);
  }

  .variable-token--danger {
    color: #dc2626;
    background: rgb(239 68 68 / 8%);
    border-color: rgb(239 68 68 / 24%);
  }
}

.a4-preview {
  max-height: 70vh;
  padding: 20px;
  overflow-y: auto;
  background: #6b7280;
  border-radius: 12px;
}

.a4-page {
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  padding: 20mm;
  margin: 0 auto;
  font-family: "Times New Roman", serif;
  font-size: 14px;
  line-height: 1.4;
  color: #111827;
  background: white;
  border-radius: 2px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 25%);
}

.a4-page :deep(*) {
  font-family: "Times New Roman", serif !important;
  color: #111827 !important;
}

.a4-page :deep(h1) {
  margin: 14px 0 6px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
}

.a4-page :deep(h2) {
  margin: 12px 0 4px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  text-transform: uppercase;
}

.a4-page :deep(p) {
  margin: 3px 0;
}

.a4-page :deep(ol),
.a4-page :deep(ul) {
  padding-left: 18px;
  margin: 4px 0 8px;
}

.a4-page :deep(li) {
  margin: 2px 0;
}

.a4-page :deep(table) {
  width: 100%;
  margin: 8px 0 12px;
  border-collapse: collapse;
}

.a4-page :deep(td),
.a4-page :deep(th) {
  padding: 6px 8px;
  border: 1px solid #111827;
}

:global(html.dark .contract-template-select-popper) {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 14%) !important;

  .el-select-dropdown__item {
    color: #f8fafc;

    &.is-hovering,
    &:hover {
      color: #fff;
      background: rgb(232 74 74 / 14%);
    }

    &.is-selected {
      color: #ff6b6b;
    }
  }

  .el-popper__arrow::before {
    background: #161618 !important;
    border-color: rgb(255 255 255 / 14%) !important;
  }
}
</style>
