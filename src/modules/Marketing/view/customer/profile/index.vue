<template>
  <div class="customer-profile-management flex flex-col gap-6 pb-10">
    <div class="page-header flex items-center justify-between px-4">
      <h2
        class="m-0 text-2xl font-black text-gray-800 dark:text-slate-100 tracking-tight flex items-center gap-2"
      >
        <ArtSvgIcon icon="ri:user-search-line" class="text-blue-600" />
        Hồ sơ & Danh bạ khách hàng
      </h2>
      <button
        class="h-10 px-6 bg-white text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 rounded-full font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center gap-2"
        @click="handleAdd"
      >
        <ArtSvgIcon icon="ri:user-add-line" class="text-blue-500" /> Thêm khách
        hàng mới
      </button>
    </div>

    <div
      class="search-bar-wrapper bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-2 mx-4"
    >
      <ArtSearchBar
        v-model="searchModel"
        :items="searchItems"
        :label-width="120"
        :span="8"
        :show-expand="true"
        @search="handleSearch"
        @reset="handleReset"
      />
    </div>

    <div class="content-section px-4" v-loading="loading">
      <div v-if="data.length > 0" class="flex flex-col gap-4">
        <div
          v-for="customer in data"
          :key="customer.id"
          class="customer-row-container flex flex-col"
        >
          <div
            class="customer-row-card group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all duration-300 flex items-center hover:border-blue-200 dark:hover:border-blue-500 cursor-pointer overflow-hidden"
            :class="{
              'is-expanded': expandedId === customer.id,
            }"
            @click="handleToggleExpand(customer.id)"
          >
            <div class="flex flex-1 items-center p-5 gap-6">
              <div class="priority-column shrink-0 w-24 flex flex-cc">
                <div
                  class="priority-label flex flex-col items-center justify-center p-2 rounded-xl text-white w-20 h-14"
                  :style="{ backgroundColor: getPriority(customer).color }"
                >
                  <ArtSvgIcon
                    :icon="getPriority(customer).icon"
                    class="text-xl"
                  />
                  <span
                    class="text-[9px] font-black tracking-tighter uppercase"
                    >{{ getPriority(customer).label }}</span
                  >
                </div>
              </div>

              <div
                class="identity-column shrink-0 w-64 border-l border-gray-50 dark:border-slate-800 pl-4"
              >
                <div class="flex items-center gap-3">
                  <div class="flex flex-col">
                    <h4
                      class="m-0 text-gray-900 dark:text-slate-100 font-extrabold text-base group-hover:text-blue-600 transition-colors"
                    >
                      {{ customer.fullName }}
                    </h4>
                    <div class="flex items-center gap-2 mt-1">
                      <ElTooltip :content="'Nguồn: ' + customer.source">
                        <div
                          class="size-5 rounded-md flex-cc"
                          :class="getSourceClass(customer.source)"
                        >
                          <ArtSvgIcon
                            :icon="getSourceIcon(customer.source)"
                            class="text-[10px]"
                          />
                        </div>
                      </ElTooltip>
                      <span
                        class="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider"
                        >Mega Sale 2024</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="pipeline-column w-40 px-4 border-l border-gray-50 dark:border-slate-800 flex flex-col items-center justify-center"
              >
                <ElTag
                  :type="getPipelineType(customer.status)"
                  effect="dark"
                  round
                  size="small"
                  class="font-bold border-none w-full text-center py-1 h-auto"
                >
                  {{ getPipelineLabel(customer.status) }}
                </ElTag>
                <span class="text-[10px] text-gray-400 mt-1 font-bold"
                  >ID: {{ customer.id }}</span
                >
              </div>

              <div
                class="note-column flex-1 px-4 border-l border-gray-50 dark:border-slate-800"
              >
                <div class="flex flex-col gap-1">
                  <span
                    class="text-[10px] font-bold text-gray-300 dark:text-slate-500 uppercase tracking-widest"
                    >Ghi chú gần nhất</span
                  >
                  <p
                    class="m-0 text-xs text-gray-600 dark:text-slate-400 italic line-clamp-1"
                  >
                    "{{ getLastNote(customer) }}"
                  </p>
                </div>
              </div>

              <div
                class="assignee-column w-48 px-4 border-l border-gray-50 dark:border-slate-800"
              >
                <div class="flex flex-col gap-1.5" @click.stop>
                  <span
                    class="text-[10px] text-gray-400 font-bold uppercase tracking-tighter"
                    >Người phụ trách</span
                  >
                  <ElSelect
                    :model-value="customer.saleId || null"
                    size="small"
                    class="sale-select-premium"
                    :placeholder="
                      !customer.saleId ? 'CHƯA BÀN GIAO' : 'Giao Sale...'
                    "
                  >
                    <ElOption
                      v-for="sale in salesList"
                      :key="sale.id"
                      :label="sale.name"
                      :value="sale.id"
                    />
                  </ElSelect>
                </div>
              </div>

              <div
                class="flex items-center gap-2 border-l border-gray-50 dark:border-slate-800 pl-6 pr-2"
              >
                <div class="flex gap-1" @click.stop>
                  <ElTooltip content="Chỉnh sửa hồ sơ">
                    <div
                      class="size-8 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg flex-cc hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                      @click="handleEdit(customer)"
                    >
                      <ArtSvgIcon icon="ri:edit-line" class="text-sm" />
                    </div>
                  </ElTooltip>
                  <ElTooltip content="Xóa khách hàng">
                    <div
                      class="size-8 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-lg flex-cc hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                      @click="handleDelete(customer)"
                    >
                      <ArtSvgIcon icon="ri:delete-bin-7-line" class="text-sm" />
                    </div>
                  </ElTooltip>
                </div>
                <div class="h-6 w-px bg-gray-100 dark:bg-slate-800 mx-2"></div>
                <ArtSvgIcon
                  :icon="
                    expandedId === customer.id
                      ? 'ri:arrow-up-s-line'
                      : 'ri:arrow-down-s-line'
                  "
                  class="text-xl text-gray-300"
                />
              </div>
            </div>
          </div>

          <div v-if="expandedId === customer.id" class="expansion-container">
            <CustomerDetailExpansion :lead="customer" />
          </div>
        </div>
      </div>

      <div
        v-else-if="!loading"
        class="empty-state p-20 flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 mx-4"
      >
        <ArtSvgIcon
          icon="ri:user-search-line"
          class="text-6xl text-gray-200 dark:text-slate-700 mb-4"
        />
        <p class="text-gray-400 dark:text-slate-500 font-bold">
          Không tìm thấy khách hàng nào phù hợp
        </p>
      </div>
    </div>

    <CustomerFormDialog
      v-model="addDialogVisible"
      :initial-data="editData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLeadTable } from "@/modules/Marketing/logic/useLeadTable";
import CustomerDetailExpansion from "./CustomerDetailExpansion.vue";
import CustomerFormDialog from "./CustomerFormDialog.vue";
import { ElMessageBox, ElMessage } from "element-plus";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

defineOptions({ name: "CustomerProfileManagement" });

const {
  data,
  loading,
  refreshData,
  handleSearch,
  handleReset,
  salesList,
  getPriority,
} = useLeadTable();

const searchModel = ref({});
const expandedId = ref<number | null>(null);
const addDialogVisible = ref(false);
const editData = ref<any>(null);

const handleToggleExpand = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const handleAdd = () => {
  editData.value = null;
  addDialogVisible.value = true;
};

const handleEdit = (customer: any) => {
  editData.value = { ...customer };
  addDialogVisible.value = true;
};

const handleDelete = (customer: any) => {
  ElMessageBox.confirm(
    `Bạn có chắc chắn muốn xóa hồ sơ khách hàng ${customer.fullName}? Dữ liệu này không thể khôi phục.`,
    "Cảnh báo xóa dữ liệu",
    {
      confirmButtonText: "XÓA NGAY",
      cancelButtonText: "HỦY",
      type: "warning",
      confirmButtonClass: "el-button--danger",
    },
  ).then(() => {
    ElMessage.success("Đã xóa hồ sơ khách hàng thành công");
    refreshData();
  });
};

const searchItems = [
  {
    key: "fullName",
    label: "Tên khách hàng",
    type: "input",
    props: { placeholder: "Nhập tên hoặc SĐT...", clearable: true },
  },
  {
    key: "status",
    label: "Loại khách",
    type: "select",
    props: {
      placeholder: "Tất cả trạng thái",
      clearable: true,
      options: [
        { label: "Chính thức", value: "Official" },
        { label: "Đang mua", value: "Purchasing" },
        { label: "Tiềm năng", value: "Potential" },
      ],
    },
  },
];

const getSourceIcon = (source: string) => {
  if (source === "Facebook") return "ri:facebook-fill";
  if (source === "Website") return "ri:global-line";
  return "ri:store-2-line";
};

const getSourceClass = (source: string) => {
  if (source === "Facebook") return "bg-blue-600 text-white";
  if (source === "Website") return "bg-emerald-500 text-white";
  return "bg-orange-500 text-white";
};

const getPipelineLabel = (status: string) => {
  const map: any = {
    New: "Mới đăng ký",
    TestDrive: "Đã lái thử",
    Negotiating: "Thương lượng",
    Consulting: "Đang tư vấn",
    Won: "Đã chốt đơn",
    Official: "Khách chính thức",
  };
  return map[status] || "Đang tư vấn";
};

const getPipelineType = (status: string) => {
  if (status === "New") return "info";
  if (status === "TestDrive" || status === "Negotiating") return "warning";
  if (status === "Won" || status === "Official") return "success";
  return "primary";
};

const getLastNote = (customer: any) => {
  const notes = [
    "Khách thích màu đỏ đen nhám",
    "Đang chờ duyệt hồ sơ trả góp",
    "Đã gửi báo giá lăn bánh chi tiết",
    "Hẹn xem xe vào sáng Thứ 7",
    "Quan tâm đến chính sách bảo hành 3 năm",
  ];
  return notes[customer.id % notes.length];
};
</script>

<style lang="scss" scoped>
.customer-profile-management {
  --customer-card-border: #f3f4f6;
  --customer-card-hover-bg: #f8faff;
  --customer-card-expanded-bg: #fff;
  --customer-card-active-border: #3b82f6;
  --customer-card-shadow: 0 12px 24px rgb(0 0 0 / 5%);
  --customer-card-expanded-shadow: 0 10px 30px rgb(0 0 0 / 5%);
  --customer-select-bg: #f3f4f6;
  --customer-select-hover-bg: #e5e7eb;
  --customer-expansion-bg: #fafafa;
  --customer-expansion-border: #3b82f6;

  .customer-row-card {
    border: 1px solid var(--customer-card-border);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background-color: var(--customer-card-hover-bg);
      border-color: var(--customer-card-active-border);
      box-shadow: var(--customer-card-shadow);
      transform: translateY(-2px);
    }

    &.is-expanded {
      background-color: var(--customer-card-expanded-bg);
      border-color: var(--customer-card-active-border);
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      box-shadow: var(--customer-card-expanded-shadow);
    }

    .priority-label {
      box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }

    .sale-select-premium {
      :deep(.el-input__wrapper) {
        background-color: var(--customer-select-bg);
        border: none;
        border-radius: 8px;
        box-shadow: none;

        &:hover {
          background-color: var(--customer-select-hover-bg);
        }
      }
    }
  }

  .expansion-container {
    overflow: hidden;
    background-color: var(--customer-expansion-bg);
    border: 1px solid var(--customer-expansion-border);
    border-top: none;
    border-bottom-right-radius: 1.5rem;
    border-bottom-left-radius: 1.5rem;
  }

  .search-bar-wrapper {
    :deep(.el-form-item__label) {
      font-weight: 600;
      color: #4b5563;
      white-space: nowrap !important;
    }
  }

  :global(html.dark) & {
    --customer-card-border: #1f2937;
    --customer-card-hover-bg: #374151;
    --customer-card-expanded-bg: #1f2937;
    --customer-card-active-border: #334155;
    --customer-card-shadow: 0 12px 24px rgb(0 0 0 / 25%);
    --customer-card-expanded-shadow: 0 10px 30px rgb(0 0 0 / 25%);
    --customer-select-bg: #1f2937;
    --customer-select-hover-bg: #374151;
    --customer-expansion-bg: #0f172a;
    --customer-expansion-border: #334155;
  }
}

.custom-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
  }
}
</style>
