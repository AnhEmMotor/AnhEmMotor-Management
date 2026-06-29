<template>
  <div class="contact-page min-h-full font-inter pb-6">
    <div class="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg shrink-0"
          >
            <ArtSvgIcon icon="ri:message-2-line" class="text-2xl" />
          </div>
          <div>
            <h1
              class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none"
            >
              {{ $t("contact.title") }}
            </h1>
            <p
              class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5"
            >
              {{ $t("contact.subtitle") }}
            </p>
          </div>
        </div>
        <div
          v-if="contactStore.unreadBadge > 0"
          class="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
        >
          <span
            class="text-[9px] font-black text-red-400 uppercase tracking-tighter"
            >{{ $t("contact.unreadBadge") }}:</span
          >
          <span class="text-sm font-black text-red-600 leading-none">{{
            contactStore.unreadBadge
          }}</span>
        </div>
      </div>
    </div>

    <div class="p-4">
      <ElTabs
        v-model="activeTab"
        @tab-change="onTabChange"
        class="contact-tabs"
      >
        <!-- TAB 1: YÊU CẦU HỖ TRỢ -->
        <ElTabPane :label="$t('contact.tabSupport')" name="support">
          <div class="split-layout">
            <div class="list-panel">
              <div class="list-header">
                <ElInput
                  v-model="searchQuery"
                  :placeholder="$t('contact.searchPlaceholder')"
                  class="flex-1"
                  clearable
                  @input="onSearch"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-2-line" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="statusFilter"
                  :placeholder="$t('contact.allStatus')"
                  clearable
                  style="width: 160px"
                  @change="onFilterChange"
                >
                  <ElOption
                    v-for="s in SupportStatuses"
                    :key="s"
                    :label="$t('contact.supportStatus.' + s)"
                    :value="s"
                  />
                </ElSelect>
              </div>

              <ElTable
                :data="tableData"
                :loading="contactStore.loading"
                class="contact-table"
                :header-cell-style="tableHeaderStyle"
                @row-click="selectItem"
              >
                <ElTableColumn
                  :label="$t('contact.columnIdCustomer')"
                  min-width="160"
                >
                  <template #default="{ row }">
                    <div class="flex flex-col py-0.5">
                      <span class="text-xs font-extrabold text-slate-800"
                        >#{{ row.id }}</span
                      >
                      <span
                        class="text-[11px] text-slate-400 font-semibold truncate"
                        >{{ row.contact?.fullName || row.email }}</span
                      >
                    </div>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  prop="subject"
                  :label="$t('contact.columnSubject')"
                  min-width="170"
                  show-overflow-tooltip
                />
                <ElTableColumn
                  :label="$t('contact.columnCategory')"
                  width="130"
                >
                  <template #default="{ row }">
                    <span class="badge" :class="categoryStyle(row.category)">{{
                      $t("contact.category." + row.category)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn :label="$t('contact.columnStatus')" width="120">
                  <template #default="{ row }">
                    <span class="badge" :class="statusStyle(row.status)">{{
                      $t("contact.supportStatus." + row.status)
                    }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  prop="createdAt"
                  :label="$t('contact.columnCreatedAt')"
                  width="120"
                />
              </ElTable>

              <div class="pagination-bar">
                <span class="text-[11px] text-slate-400 font-bold">{{
                  $t("contact.totalCount", { count: contactStore.totalCount })
                }}</span>
                <ElPagination
                  :current-page="contactStore.page"
                  :page-sizes="[10, 20, 50]"
                  :page-size="contactStore.pageSize"
                  :total="contactStore.totalCount"
                  layout="total, sizes, prev, pager, next"
                  small
                  @current-change="contactStore.changePage"
                  @size-change="contactStore.changePageSize"
                />
              </div>
            </div>

            <div class="detail-panel">
              <div v-if="!contactStore.hasActive" class="empty-state">
                <ArtSvgIcon
                  icon="ri:file-list-3-line"
                  class="text-5xl text-slate-200 mb-3"
                />
                <p class="text-sm text-slate-400 font-bold">
                  {{ $t("contact.noDetail") }}
                </p>
              </div>
              <div v-else class="detail-content flex flex-col h-full">
                <!-- Header -->
                <div
                  class="detail-header p-5 border-b border-slate-100 bg-[#FAFCFF]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span
                        class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
                        >#{{ activeItem?.id }}</span
                      >
                      <span
                        class="badge"
                        :class="statusStyle(activeItem!.status)"
                        >{{
                          $t("contact.supportStatus." + activeItem!.status)
                        }}</span
                      >
                    </div>
                    <ElButton
                      size="small"
                      type="danger"
                      text
                      @click="closeDetail"
                      >Đóng</ElButton
                    >
                  </div>
                  <h2 class="text-base font-black text-slate-800 mt-2">
                    {{ activeItemSubject }}
                  </h2>
                  <div
                    class="flex items-center gap-3 mt-1 text-xs text-slate-500"
                  >
                    <span class="text-blue-600 font-bold">{{
                      activeItemEmail
                    }}</span>
                    <span class="text-slate-300">|</span>
                    <span>{{ activeItemPhone }}</span>
                    <span class="text-slate-300" v-if="activeItemOrderCode"
                      >|</span
                    >
                    <span
                      v-if="activeItemOrderCode"
                      class="font-semibold text-slate-700"
                      >Đơn hàng: {{ activeItemOrderCode }}</span
                    >
                  </div>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-1 overflow-y-auto p-5 space-y-5">
                  <!-- Content Body -->
                  <div>
                    <h4
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >
                      Nội dung yêu cầu
                    </h4>
                    <div
                      class="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm"
                    >
                      <p
                        class="text-xs text-slate-600 leading-relaxed m-0 whitespace-pre-line font-medium"
                      >
                        {{ activeItemContent }}
                      </p>
                    </div>
                  </div>

                  <!-- Reply -->
                  <div class="pt-2">
                    <h4
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >
                      Soạn thảo phản hồi
                    </h4>
                    <ElInput
                      v-model="replyDraft"
                      type="textarea"
                      :rows="3"
                      :placeholder="
                        $t('contact.replyDialog.contentPlaceholder')
                      "
                      class="reply-input text-xs"
                      resize="none"
                    />
                    <div class="flex justify-between items-center mt-3">
                      <div class="flex gap-2">
                        <ElButton
                          v-if="activeItem && activeItem.status !== 'Closed'"
                          size="small"
                          type="success"
                          plain
                          class="font-bold text-[10px]"
                          @click="handleStatus('Closed')"
                        >
                          <ArtSvgIcon
                            icon="ri:checkbox-circle-line"
                            class="mr-1"
                          />Đóng yêu cầu
                        </ElButton>
                        <ElButton
                          v-if="
                            activeItem && activeItem.status !== 'InProgress'
                          "
                          size="small"
                          type="primary"
                          plain
                          class="font-bold text-[10px]"
                          @click="handleStatus('InProgress')"
                        >
                          <ArtSvgIcon
                            icon="ri:loader-4-line"
                            class="mr-1"
                          />Đang xử lý
                        </ElButton>
                        <ElButton
                          v-if="activeItem && activeItem.status !== 'New'"
                          size="small"
                          type="info"
                          plain
                          class="font-bold text-[10px]"
                          @click="handleStatus('New')"
                        >
                          <ArtSvgIcon
                            icon="ri:arrow-go-back-line"
                            class="mr-1"
                          />Mở lại (Mới)
                        </ElButton>
                        <ElButton
                          size="small"
                          plain
                          class="font-bold text-[10px]"
                          @click="openAssignDialog"
                        >
                          <ArtSvgIcon
                            icon="ri:user-settings-line"
                            class="mr-1"
                          />Phân công
                        </ElButton>
                      </div>
                      <ElButton
                        type="primary"
                        class="font-bold text-xs uppercase"
                        style="background: #001529; border-color: #001529"
                        @click="handleReply"
                      >
                        <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1" />{{
                          $t("contact.replyDialog.sendBtn")
                        }}
                      </ElButton>
                    </div>
                  </div>
                </div>

                <!-- Footer (Sticky Internal Notes) -->
                <div class="border-t border-slate-100 p-5 bg-slate-50">
                  <div class="flex items-center justify-between mb-2">
                    <h4
                      class="text-xs font-bold text-indigo-500 uppercase tracking-wider m-0"
                    >
                      Ghi chú nội bộ
                    </h4>
                    <span class="text-[10px] text-slate-400 italic"
                      >Chỉ hiển thị với nhân viên điều hành</span
                    >
                  </div>
                  <div class="flex gap-2 items-start">
                    <ElInput
                      v-model="noteDraft"
                      type="textarea"
                      :rows="2"
                      placeholder="Nhập đánh giá nội bộ..."
                      class="flex-1 text-xs"
                      resize="none"
                    />
                    <ElButton
                      type="primary"
                      class="font-bold text-xs"
                      style="
                        height: 50px;
                        background: #4f46e5;
                        border-color: #4f46e5;
                      "
                      @click="saveNote"
                      >Lưu</ElButton
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>

        <!-- TAB 2: ĐÓNG GÓP Ý KIẾN -->
        <ElTabPane :label="$t('contact.tabFeedback')" name="feedback">
          <div class="split-layout">
            <div class="list-panel">
              <div class="list-header">
                <ElInput
                  v-model="searchQuery"
                  :placeholder="$t('contact.searchPlaceholder')"
                  class="flex-1"
                  clearable
                  @input="onSearch"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:search-2-line" />
                  </template>
                </ElInput>
                <ElSelect
                  v-model="statusFilter"
                  :placeholder="$t('contact.allStatus')"
                  clearable
                  style="width: 160px"
                  @change="onFilterChange"
                >
                  <ElOption
                    v-for="s in FeedbackStatuses"
                    :key="s"
                    :label="$t('contact.feedbackStatus.' + s)"
                    :value="s"
                  />
                </ElSelect>
              </div>

              <ElTable
                :data="tableData"
                :loading="contactStore.loading"
                class="contact-table"
                :header-cell-style="tableHeaderStyle"
                @row-click="selectItem"
              >
                <ElTableColumn :label="$t('contact.columnRating')" width="100">
                  <template #default="{ row }">
                    <span class="flex items-center gap-0.5">
                      <ArtSvgIcon
                        v-for="n in (row as Contact.CustomerFeedback).rating"
                        :key="n"
                        icon="ri:star-fill"
                        class="text-amber-400 text-xs"
                      />
                    </span>
                  </template>
                </ElTableColumn>
                <ElTableColumn
                  prop="customerName"
                  :label="$t('contact.columnCustomer')"
                  min-width="140"
                  show-overflow-tooltip
                />
                <ElTableColumn
                  prop="feedbackArea"
                  :label="$t('contact.columnCategory')"
                  width="140"
                  show-overflow-tooltip
                />
                <ElTableColumn :label="$t('contact.columnStatus')" width="120">
                  <template #default="{ row }">
                    <span class="badge" :class="statusStyle(row.status)">{{
                      $t("contact.feedbackStatus." + row.status)
                    }}</span>
                  </template>
                </ElTableColumn>
              </ElTable>

              <div class="pagination-bar">
                <span class="text-[11px] text-slate-400 font-bold">{{
                  $t("contact.totalCount", { count: contactStore.totalCount })
                }}</span>
                <ElPagination
                  :current-page="contactStore.page"
                  :page-sizes="[10, 20, 50]"
                  :page-size="contactStore.pageSize"
                  :total="contactStore.totalCount"
                  layout="total, sizes, prev, pager, next"
                  small
                  @current-change="contactStore.changePage"
                  @size-change="contactStore.changePageSize"
                />
              </div>
            </div>

            <div class="detail-panel">
              <div v-if="!contactStore.hasActive" class="empty-state">
                <ArtSvgIcon
                  icon="ri:file-list-3-line"
                  class="text-5xl text-slate-200 mb-3"
                />
                <p class="text-sm text-slate-400 font-bold">
                  {{ $t("contact.noDetail") }}
                </p>
              </div>
              <div v-else class="detail-content flex flex-col h-full">
                <!-- Header -->
                <div
                  class="detail-header p-5 border-b border-slate-100 bg-[#FAFCFF]"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span
                        class="text-[10px] font-black text-slate-300 uppercase tracking-widest"
                        >#{{ activeItem?.id }}</span
                      >
                      <span
                        class="badge"
                        :class="statusStyle(activeItem!.status)"
                        >{{
                          $t("contact.feedbackStatus." + activeItem!.status)
                        }}</span
                      >
                    </div>
                    <ElButton
                      size="small"
                      type="danger"
                      text
                      @click="closeDetail"
                      >Đóng</ElButton
                    >
                  </div>
                  <h2 class="text-base font-black text-slate-800 mt-2">
                    {{ activeItemCustomerName }}
                  </h2>
                  <div
                    class="flex items-center gap-3 mt-1 text-xs text-slate-500"
                  >
                    <span class="text-blue-600 font-bold">{{
                      activeItemEmail
                    }}</span>
                    <span class="text-slate-300">|</span>
                    <span>{{ activeItemPhone }}</span>
                    <span class="text-slate-300" v-if="activeItemFeedbackArea"
                      >|</span
                    >
                    <span
                      v-if="activeItemFeedbackArea"
                      class="font-semibold text-slate-700"
                      >Lĩnh vực: {{ activeItemFeedbackArea }}</span
                    >
                    <span
                      class="text-slate-300"
                      v-if="(activeItem as any)?.rating"
                      >|</span
                    >
                    <span
                      v-if="(activeItem as any)?.rating"
                      class="flex items-center gap-0.5"
                    >
                      <ArtSvgIcon
                        v-for="n in (activeItem as any).rating"
                        :key="n"
                        icon="ri:star-fill"
                        class="text-amber-400 text-xs"
                      />
                    </span>
                  </div>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-1 overflow-y-auto p-5 space-y-5">
                  <!-- Content Body -->
                  <div>
                    <h4
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >
                      Nội dung đóng góp
                    </h4>
                    <div
                      class="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm"
                    >
                      <p
                        class="text-xs text-slate-600 leading-relaxed m-0 whitespace-pre-line font-medium"
                      >
                        {{ activeItemContent }}
                      </p>
                    </div>
                  </div>

                  <!-- Reply -->
                  <div class="pt-2">
                    <h4
                      class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                    >
                      Soạn thảo phản hồi
                    </h4>
                    <ElInput
                      v-model="replyDraft"
                      type="textarea"
                      :rows="3"
                      :placeholder="
                        $t('contact.replyDialog.contentPlaceholder')
                      "
                      class="reply-input text-xs"
                      resize="none"
                    />
                    <div class="flex justify-between items-center mt-3">
                      <div class="flex gap-2">
                        <ElButton
                          v-if="activeItem && activeItem.status !== 'Resolved'"
                          size="small"
                          type="success"
                          plain
                          class="font-bold text-[10px]"
                          @click="handleStatus('Resolved')"
                        >
                          <ArtSvgIcon
                            icon="ri:checkbox-circle-line"
                            class="mr-1"
                          />Giải quyết
                        </ElButton>
                        <ElButton
                          v-if="activeItem && activeItem.status !== 'Read'"
                          size="small"
                          type="primary"
                          plain
                          class="font-bold text-[10px]"
                          @click="handleStatus('Read')"
                        >
                          <ArtSvgIcon icon="ri:eye-line" class="mr-1" />Đã đọc
                        </ElButton>
                        <ElButton
                          v-if="activeItem && activeItem.status !== 'Pending'"
                          size="small"
                          type="info"
                          plain
                          class="font-bold text-[10px]"
                          @click="handleStatus('Pending')"
                        >
                          <ArtSvgIcon
                            icon="ri:arrow-go-back-line"
                            class="mr-1"
                          />Chờ xử lý
                        </ElButton>
                      </div>
                      <ElButton
                        type="primary"
                        class="font-bold text-xs uppercase"
                        style="background: #001529; border-color: #001529"
                        @click="handleReply"
                      >
                        <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1" />{{
                          $t("contact.replyDialog.sendBtn")
                        }}
                      </ElButton>
                    </div>
                  </div>
                </div>

                <!-- Footer (Sticky Internal Notes) -->
                <div class="border-t border-slate-100 p-5 bg-slate-50">
                  <div class="flex items-center justify-between mb-2">
                    <h4
                      class="text-xs font-bold text-indigo-500 uppercase tracking-wider m-0"
                    >
                      Ghi chú nội bộ
                    </h4>
                    <span class="text-[10px] text-slate-400 italic"
                      >Chỉ hiển thị với nhân viên điều hành</span
                    >
                  </div>
                  <div class="flex gap-2 items-start">
                    <ElInput
                      v-model="noteDraft"
                      type="textarea"
                      :rows="2"
                      placeholder="Nhập đánh giá nội bộ..."
                      class="flex-1 text-xs"
                      resize="none"
                    />
                    <ElButton
                      type="primary"
                      class="font-bold text-xs"
                      style="
                        height: 50px;
                        background: #4f46e5;
                        border-color: #4f46e5;
                      "
                      @click="saveNote"
                      >Lưu</ElButton
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- ASSIGN DIALOG -->
    <ElDialog
      v-model="assignDialogVisible"
      :title="$t('contact.assignDialog.title')"
      width="400px"
    >
      <ElSelect
        v-model="assignedUser"
        :placeholder="$t('contact.assignDialog.selectUser')"
        class="w-full"
        filterable
        clearable
      >
        <ElOption
          v-for="u in userOptions"
          :key="u.id"
          :label="u.name"
          :value="u.id"
        />
      </ElSelect>
      <template #footer>
        <ElButton @click="assignDialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" @click="handleAssign">Xác nhận</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { useContactStore } from "@/application/store/contact";
import { useSettingStore } from "@/application/store/setting";
import {
  SupportStatuses,
  FeedbackStatuses,
  CandidateStatuses,
} from "@/infrastructure/api/contact.api";
import type { Contact } from "@/types";

defineOptions({ name: "ContactManagement" });
const contactStore = useContactStore();
const { isDark } = storeToRefs(useSettingStore());

const activeTab = ref("support");
const searchQuery = ref("");
const statusFilter = ref("");
const replyDraft = ref("");
const noteDraft = ref("");
const assignDialogVisible = ref(false);
const assignedUser = ref("");

const userOptions = ref<{ id: string; name: string }[]>([
  { id: "1", name: "Nguyễn Văn A" },
  { id: "2", name: "Trần Thị B" },
  { id: "3", name: "Lê Văn C" },
]);

const tableHeaderStyle = computed(() => ({
  background: isDark.value ? "#111827" : "#f8fafc",
  color: isDark.value ? "#cbd5e1" : "#64748b",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderColor: isDark.value ? "rgb(255 255 255 / 10%)" : "#f1f5f9",
}));

onMounted(() => {
  contactStore.setFilter(activeTab.value, statusFilter.value);
  contactStore.fetchList();
});

watch(activeTab, () => {
  searchQuery.value = "";
  statusFilter.value = "";
  contactStore.setFilter(activeTab.value, statusFilter.value);
  contactStore.fetchList();
});

const activeItem = computed(() => contactStore.activeItem as any);

watch(
  activeItem,
  (newVal) => {
    if (newVal) {
      noteDraft.value = (newVal as any).internalNote || "";
    } else {
      noteDraft.value = "";
    }
  },
  { immediate: true },
);

const onTabChange = () => {
  contactStore.clearActive();
  replyDraft.value = "";
};
const onSearch = () => {
  contactStore.fetchList();
};
const onFilterChange = () => {
  contactStore.setFilter(activeTab.value, statusFilter.value);
  contactStore.fetchList();
};
const selectItem = (row: Contact.ContactItem) => {
  contactStore.selectItem(row);
  replyDraft.value = "";
};
const closeDetail = () => {
  contactStore.clearActive();
  replyDraft.value = "";
};

const categoryStyle = (cat: string) => {
  const m: Record<string, string> = {
    Quality: "bg-red-600 text-white",
    Service: "bg-orange-500 text-white",
    Rating: "bg-blue-600 text-white",
    General: "bg-slate-500 text-white",
    Sales: "bg-emerald-600 text-white",
    AfterSales: "bg-amber-500 text-white",
    Other: "bg-gray-400 text-white",
  };
  return m[cat] || "bg-slate-400 text-white";
};

const statusStyle = (status: string) => {
  const m: Record<string, string> = {
    New: "bg-red-50 text-red-600 border-red-100",
    Pending: "bg-red-50 text-red-600 border-red-100",
    InProgress: "bg-blue-50 text-blue-600 border-blue-200",
    Interview: "bg-blue-50 text-blue-600 border-blue-200",
    Read: "bg-amber-50 text-amber-600 border-amber-100",
    Closed: "bg-slate-100 text-slate-600 border-slate-200",
    Resolved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Offer: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Rejected: "bg-red-50 text-red-600 border-red-100",
  };
  return m[status] || "bg-slate-100 text-slate-600 border-slate-200";
};
const cvFileUrl = computed(
  () => (activeItem.value as Contact.JobApplication)?.cvFileUrl ?? "",
);
const isLegacyCv = computed(() => {
  if (!cvFileUrl.value) return false;
  return (
    !cvFileUrl.value.startsWith("cv/") &&
    !cvFileUrl.value.startsWith("http://") &&
    !cvFileUrl.value.startsWith("https://")
  );
});
const cvExtension = computed(
  () => cvFileUrl.value.split(".").pop()?.toLowerCase() ?? "",
);

const isCvImage = computed(() => {
  return ["png", "jpg", "jpeg", "webp", "gif"].includes(cvExtension.value);
});

const isCvPdf = computed(() => {
  return cvExtension.value === "pdf";
});

const isCvWord = computed(() => {
  return ["doc", "docx"].includes(cvExtension.value);
});

const cvFileName = computed(() => {
  if (!cvFileUrl.value) return "";
  return cvFileUrl.value.split("/").pop() ?? cvFileUrl.value;
});

const getFullCvUrl = (url: string | undefined) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const baseUrl =
    import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT ||
    "http://localhost:5000";
  return `${baseUrl}/api/v1/MediaFile/view-image/${url}`;
};

const handleReply = async () => {
  if (!replyDraft.value.trim() || !contactStore.activeItem) return;
  try {
    await contactStore.sendReply(contactStore.activeItem.id, replyDraft.value);
    replyDraft.value = "";
  } catch {
    /* handled */
  }
};

const tableData = computed(() => contactStore.records);
const activeItemSubject = computed(
  () => (activeItem.value as Contact.SupportRequest)?.subject ?? "",
);
const activeItemEmail = computed(
  () =>
    activeItem.value?.contact?.email ?? (activeItem.value as any)?.email ?? "",
);
const activeItemPhone = computed(
  () =>
    activeItem.value?.contact?.phoneNumber ??
    (activeItem.value as any)?.phoneNumber ??
    "",
);
const activeItemContent = computed(
  () =>
    activeItem.value?.contact?.content ??
    (activeItem.value as any)?.content ??
    "",
);
const activeItemOrderCode = computed(
  () => (activeItem.value as Contact.SupportRequest)?.orderCode ?? "",
);
const activeItemCustomerName = computed(
  () => (activeItem.value as Contact.CustomerFeedback)?.customerName ?? "",
);
const activeItemFeedbackArea = computed(
  () => (activeItem.value as Contact.CustomerFeedback)?.feedbackArea ?? "",
);
const activeItemFullName = computed(
  () => (activeItem.value as Contact.JobApplication)?.fullName ?? "",
);
const activeItemAppliedPosition = computed(
  () => (activeItem.value as Contact.JobApplication)?.appliedPosition ?? "",
);
const activeItemCoverLetter = computed(
  () => (activeItem.value as Contact.JobApplication)?.coverLetter ?? "",
);

const handleStatus = async (newStatus: string) => {
  if (!contactStore.activeItem) return;
  await contactStore.updateStatus(
    contactStore.activeItem.id,
    activeTab.value,
    newStatus,
  );
};

const saveNote = async () => {
  if (!contactStore.activeItem) return;
  await contactStore.saveInternalNote(
    contactStore.activeItem.id,
    noteDraft.value,
  );
};

const downloadCvUrl = (url: string) => {
  if (url) window.open(url, "_blank");
};
const openAssignDialog = () => {
  assignDialogVisible.value = true;
};
const handleAssign = async () => {
  if (!assignedUser.value) {
    ElMessage.warning("Vui lòng chọn nhân viên");
    return;
  }
  assignDialogVisible.value = false;
  ElMessage.success("Đã phân công xử lý");
};
</script>

<style lang="scss" scoped>
.contact-page {
  --contact-page-bg: #f8fafc;
  --contact-surface: #fff;
  --contact-surface-soft: #fafbfc;
  --contact-muted-surface: #f8fafc;
  --contact-border: #e2e8f0;
  --contact-border-soft: #f1f5f9;
  --contact-text: #0f172a;
  --contact-text-strong: #1e293b;
  --contact-text-muted: #64748b;
  --contact-text-soft: #94a3b8;
  --contact-row-hover: #f8fafc;
  --contact-shadow: 0 1px 2px rgb(15 23 42 / 6%);

  color: var(--contact-text);
  background: var(--contact-page-bg);

  .compact-textarea :deep(.el-textarea__inner) {
    padding: 12px;
    font-size: 13px;
    color: var(--contact-text);
    background: var(--contact-muted-surface);
    border: 1px solid var(--contact-border);
    border-radius: 12px;

    &:focus {
      background: var(--contact-surface);
      border-color: #3b82f6;
    }
  }

  .contact-tabs :deep(.el-tabs__header) {
    margin-bottom: 16px;

    .el-tabs__nav-wrap::after {
      display: none;
    }

    .el-tabs__item {
      height: 40px;
      font-size: 13px;
      font-weight: 700;
      line-height: 40px;
      color: var(--contact-text-muted);

      &.is-active {
        color: var(--contact-text);
      }
    }

    .el-tabs__active-bar {
      height: 3px;
      background: var(--contact-text);
      border-radius: 2px;
    }
  }

  .split-layout {
    display: flex;
    gap: 16px;
    min-height: calc(100vh - 220px);
  }

  .list-panel {
    display: flex;
    flex-direction: column;
    width: 40%;
    overflow: hidden;
    background: var(--contact-surface);
    border: 1px solid var(--contact-border);
    border-radius: 16px;
    box-shadow: var(--contact-shadow);
  }

  .list-header {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    background: var(--contact-surface-soft);
    border-bottom: 1px solid var(--contact-border-soft);
  }

  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid var(--contact-border-soft);

    :deep(.el-pagination) {
      justify-content: flex-end;
      padding: 0;
    }
  }

  .detail-panel {
    flex: 1;
    overflow: hidden;
    background: var(--contact-surface);
    border: 1px solid var(--contact-border);
    border-radius: 16px;
    box-shadow: var(--contact-shadow);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
  }

  .detail-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .detail-header {
    padding: 20px 24px;
    background: var(--contact-surface-soft);
    border-bottom: 1px solid var(--contact-border-soft);
  }

  .reply-input :deep(.el-textarea__inner) {
    font-size: 13px;
    color: var(--contact-text);
    background: var(--contact-muted-surface);
    border-color: var(--contact-border);
    border-radius: 12px;

    &:focus {
      background: white;
      border-color: #3b82f6;
    }
  }
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid;
  border-radius: 6px;
}

:deep(.el-table__header th) {
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table__header th .cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap !important;
}

:deep(.el-table__cell .cell) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap !important;
}

:deep(.el-table__body tr) {
  cursor: pointer;
}

.contact-table :deep(.el-table__cell) {
  color: var(--contact-text);
  background: var(--contact-surface);
  border-bottom-color: var(--contact-border-soft);
}

.contact-table :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: var(--contact-row-hover);
}

.contact-table :deep(.el-table__inner-wrapper::before) {
  background: var(--contact-border-soft);
}

.contact-page :deep(.el-input__wrapper),
.contact-page :deep(.el-select__wrapper),
.contact-page :deep(.el-textarea__inner) {
  background: var(--contact-muted-surface);
  border-color: var(--contact-border);
  box-shadow: 0 0 0 1px var(--contact-border) inset;
}

.contact-page :deep(.el-input__inner),
.contact-page :deep(.el-select__placeholder),
.contact-page :deep(.el-textarea__inner) {
  color: var(--contact-text);
}

:global(html.dark .contact-page) {
  --contact-page-bg: #05070b;
  --contact-surface: #10141c;
  --contact-surface-soft: #111827;
  --contact-muted-surface: #0b1120;
  --contact-border: rgb(255 255 255 / 12%);
  --contact-border-soft: rgb(255 255 255 / 8%);
  --contact-text: #f8fafc;
  --contact-text-strong: #e5e7eb;
  --contact-text-muted: #cbd5e1;
  --contact-text-soft: #94a3b8;
  --contact-row-hover: rgb(255 255 255 / 5%);
  --contact-shadow: 0 18px 45px rgb(0 0 0 / 28%);
}

:global(html.dark .contact-page > .bg-white),
:global(html.dark .contact-page .list-panel),
:global(html.dark .contact-page .detail-panel) {
  background: var(--contact-surface) !important;
  border-color: var(--contact-border) !important;
}

:global(html.dark .contact-page .list-header),
:global(html.dark .contact-page .detail-header),
:global(html.dark .contact-page .cv-file-header),
:global(html.dark .contact-page .bg-slate-50),
:global(html.dark .contact-page .bg-\[\#FAFCFF\]) {
  background: var(--contact-surface-soft) !important;
  border-color: var(--contact-border-soft) !important;
}

:global(html.dark .contact-page .text-slate-900),
:global(html.dark .contact-page .text-slate-800),
:global(html.dark .contact-page .text-slate-700),
:global(html.dark .contact-page .text-slate-600) {
  color: var(--contact-text-strong) !important;
}

:global(html.dark .contact-page .text-slate-500),
:global(html.dark .contact-page .text-slate-400),
:global(html.dark .contact-page .text-slate-300) {
  color: var(--contact-text-soft) !important;
}

:global(html.dark .contact-page .border-slate-100),
:global(html.dark .contact-page .border-slate-200),
:global(html.dark .contact-page .border-slate-200\/60) {
  border-color: var(--contact-border-soft) !important;
}

:global(html.dark .contact-page .empty-state .text-slate-200) {
  color: rgb(148 163 184 / 45%) !important;
}

:global(html.dark .contact-page .badge.bg-slate-100) {
  color: #000 !important;
}
</style>
