<template>
  <div class="p-4">
    <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <ElIcon class="text-primary"><StarFilled /></ElIcon>
          Đánh Giá & Khiếu Nại Dịch Vụ
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Quản lý đánh giá chất lượng và các khiếu nại chất lượng sửa chữa từ
          khách hàng.
        </p>
      </div>
    </div>

    <ElTabs v-model="activeMainTab" class="evaluation-complaints-tabs">
      <ElTabPane label="Đánh giá Dịch vụ" name="evaluation">
        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
          <div class="md:col-span-5">
            <div class="rounded-xl border border-slate-200 bg-white p-4">
              <div class="flex flex-wrap items-center gap-3">
                <div class="text-sm font-bold">Trạng thái:</div>
                <ElRadioGroup v-model="filters.status" size="small">
                  <ElRadioButton value="Unprocessed"
                    >⏳ Chưa xử lý</ElRadioButton
                  >
                  <ElRadioButton value="Processed">✓ Đã xử lý</ElRadioButton>
                </ElRadioGroup>

                <div class="w-full" />

                <div class="text-sm font-bold">Tiêu chí:</div>
                <ElRadioGroup v-model="filters.criteria" size="small">
                  <ElRadioButton value="QualityOfCar"
                    >Chất lượng xe</ElRadioButton
                  >
                  <ElRadioButton value="AttitudeOfService"
                    >Thái độ phục vụ</ElRadioButton
                  >
                </ElRadioGroup>

                <div class="ml-auto">
                  <ElInput
                    v-model="filters.search"
                    placeholder="Nhập SĐT/Tên..."
                    class="w-72"
                    clearable
                  />
                </div>
              </div>

              <div class="mt-4">
                <ElTable
                  :data="rows"
                  border
                  style="width: 100%"
                  v-loading="listLoading"
                  @row-click="handleSelect"
                  highlight-current-row
                >
                  <ElTableColumn
                    prop="customerName"
                    label="Khách hàng"
                    min-width="180"
                  />
                  <ElTableColumn label="Điểm" min-width="120">
                    <template #default="{ row }">
                      <div class="flex items-center gap-2">
                        <span>{{ row.rating }}</span>
                        <span class="text-xs text-slate-500">/5</span>
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn
                    prop="reviewMessage"
                    label="Nội dung"
                    min-width="220"
                  />
                  <ElTableColumn label="Thợ phụ trách" min-width="160">
                    <template #default="{ row }">
                      <div>{{ row.technician?.name || "—" }}</div>
                      <div
                        v-if="row.repairOrderCode"
                        class="text-xs text-slate-500"
                      >
                        {{ row.repairOrderCode }}
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="Trạng thái" min-width="120">
                    <template #default="{ row }">
                      <ElTag
                        :type="
                          row.processingStatus === 'Processed'
                            ? 'success'
                            : 'info'
                        "
                      >
                        {{
                          row.processingStatus === "Processed"
                            ? "Đã xử lý"
                            : "Chưa xử lý"
                        }}
                      </ElTag>
                    </template>
                  </ElTableColumn>
                </ElTable>

                <div
                  v-if="!listLoading && rows.length === 0"
                  class="mt-4 text-sm text-slate-500"
                >
                  Chưa có dữ liệu.
                </div>
              </div>
            </div>
          </div>

          <div class="md:col-span-7">
            <div
              v-if="selected"
              class="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div class="text-lg font-bold">
                    👤 {{ selected.customerName }}
                  </div>
                  <div class="text-sm text-slate-500">
                    SĐT: {{ selected.customerPhone }}
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-sm font-bold">
                    ⭐ {{ selected.rating }}/5
                  </div>
                  <div class="text-xs text-slate-500">
                    Tiêu chí: {{ criteriaText(selected.criteria) }}
                  </div>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-4">
                <div class="rounded-lg border border-slate-200 p-4">
                  <div class="font-bold text-sm mb-2">
                    💬 NỘI DUNG ĐÁNH GIÁ TỪ KHÁCH
                  </div>
                  <div class="text-sm text-slate-900">
                    "{{ selected.reviewMessage }}"
                  </div>

                  <div
                    class="mt-4 flex items-start justify-between gap-3 flex-wrap"
                  >
                    <div>
                      <div class="font-bold text-sm">🛠️ Thợ sửa phụ trách</div>
                      <div class="text-sm">
                        {{ selected.technician?.name || "—" }}
                      </div>
                      <div
                        v-if="selected.repairOrderCode"
                        class="text-xs text-slate-500"
                      >
                        Mã phiếu: #{{ selected.repairOrderCode }}
                      </div>
                    </div>

                    <div class="ml-auto">
                      <ElButton
                        type="success"
                        :loading="processedLoading"
                        :disabled="
                          processedLoading ||
                          selected.processingStatus === 'Processed'
                        "
                        @click="handleMarkProcessed"
                      >
                        ✓ Đánh dấu Đã xử lý
                      </ElButton>
                    </div>
                  </div>

                  <div class="mt-4">
                    <div class="font-bold text-sm mb-2">
                      📌 Biên niên sử tương tác
                    </div>
                    <div class="space-y-2 max-h-72 overflow-auto pr-2">
                      <div
                        v-for="m in selected.chatHistory"
                        :key="m.id"
                        :class="
                          m.sender === 'Customer'
                            ? 'bg-blue-50 border-blue-200'
                            : m.sender === 'Admin'
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-slate-50 border-slate-200'
                        "
                        class="rounded-lg border p-2"
                      >
                        <div class="text-xs text-slate-500">
                          {{ senderLabel(m.sender) }} •
                          {{ formatDate(m.createdAt) }}
                        </div>
                        <div class="text-sm">{{ m.content }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4">
                    <div class="font-bold text-sm mb-2">
                      ✏️ PHẢN HỒI TRỰC TIẾP ĐẾN KHÁCH HÀNG
                    </div>
                    <ElInput
                      v-model="replyText"
                      type="textarea"
                      :rows="3"
                      placeholder="Nhập nội dung phản hồi..."
                    />

                    <div class="mt-3">
                      <ElButton
                        type="primary"
                        :loading="replyLoading"
                        :disabled="replyLoading || !replyText.trim()"
                        @click="handleSendReply"
                      >
                        💾 Lưu & Gửi phản hồi (CreateContactReply)
                      </ElButton>
                    </div>
                  </div>
                </div>

                <div
                  v-if="showInternalNotes"
                  class="rounded-lg border border-slate-200 p-4 bg-slate-50"
                >
                  <div class="font-bold text-sm">🔒 GHI CHÚ NỘI BỘ</div>
                  <div class="text-xs text-slate-500 mt-1">
                    Chỉ hiển thị nội bộ hệ thống management.
                  </div>

                  <div class="mt-3">
                    <ElInput
                      v-model="internalNotesText"
                      type="textarea"
                      :rows="3"
                      placeholder="Nhập ghi chú nội bộ..."
                    />

                    <div class="mt-3">
                      <ElButton
                        type="warning"
                        :loading="notesLoading"
                        :disabled="notesLoading"
                        @click="handleSaveNotes"
                      >
                        Lưu ghi chú nội bộ
                      </ElButton>
                    </div>
                  </div>
                </div>

                <div v-else class="text-sm text-slate-500">
                  Internal Notes không hiển thị với role hiện tại.
                </div>
              </div>
            </div>

            <div
              v-else
              class="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500"
            >
              Chọn một bản ghi ở danh sách bên trái để xem chi tiết.
            </div>
          </div>
        </div>
      </ElTabPane>

      <ElTabPane label="Khiếu nại Dịch vụ" name="complaint">
        <div class="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-5 flex flex-col">
            <ElCard
              class="flex-1 flex flex-col hide-header-border"
              shadow="hover"
            >
              <template #header>
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <span
                      class="font-bold text-slate-800 flex items-center gap-2"
                    >
                      <ElTag type="danger" effect="dark">{{
                        complaintTotalCount
                      }}</ElTag>
                      Danh Sách Khiếu nại
                    </span>
                    <ElButton
                      :icon="Refresh"
                      type="primary"
                      size="small"
                      :loading="complaintLoading"
                      @click="loadComplaints"
                    >
                      Làm mới
                    </ElButton>
                  </div>
                  <div class="flex gap-2">
                    <ElInput
                      v-model="complaintSearchQuery"
                      placeholder="Tìm khách hàng/SĐT..."
                      clearable
                      class="flex-1"
                      @clear="handleComplaintSearch"
                      @keyup.enter="handleComplaintSearch"
                    />
                    <ElSelect
                      v-model="complaintStatusFilter"
                      placeholder="Trạng thái"
                      clearable
                      style="width: 140px"
                      @change="handleComplaintFilterChange"
                    >
                      <ElOption label="Chờ xử lý" value="Pending" />
                      <ElOption label="Đã đọc" value="Read" />
                      <ElOption label="Đã giải quyết" value="Resolved" />
                    </ElSelect>
                  </div>
                </div>
              </template>

              <div
                v-if="!complaintLoading && complaintList.length === 0"
                class="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2"
              >
                <ElIcon size="36"><CircleCheck /></ElIcon>
                <span>Không tìm thấy khiếu nại nào!</span>
              </div>

              <div
                v-else
                v-loading="complaintLoading"
                class="space-y-3 overflow-y-auto max-h-[600px] pr-1"
              >
                <div
                  v-for="item in complaintList"
                  :key="item.id"
                  class="complaint-card"
                  :class="{ 'is-active': complaintSelectedId === item.id }"
                  @click="selectComplaintItem(item)"
                >
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-xs font-bold text-slate-400"
                      >#{{ item.id }}</span
                    >
                    <ElTag
                      :type="getComplaintStatusTagType(item.status)"
                      size="small"
                    >
                      {{ getComplaintStatusText(item.status) }}
                    </ElTag>
                  </div>

                  <div class="mt-2 flex items-center justify-between">
                    <div class="text-sm font-bold text-slate-900">
                      {{ item.customerName }}
                    </div>
                    <div class="flex items-center gap-0.5">
                      <ElIcon
                        v-for="n in 5"
                        :key="n"
                        :class="
                          n <= item.rating ? 'text-amber-400' : 'text-slate-200'
                        "
                        size="12"
                      >
                        <StarFilled />
                      </ElIcon>
                    </div>
                  </div>

                  <div class="mt-1 text-xs text-slate-500 flex justify-between">
                    <span
                      >SĐT:
                      <span class="font-mono text-slate-700">{{
                        item.phoneNumber
                      }}</span></span
                    >
                    <span v-if="item.createdAt" class="text-slate-400">{{
                      formatComplaintDate(item.createdAt)
                    }}</span>
                  </div>

                  <div
                    class="mt-2 pt-2 border-t border-dashed border-slate-100"
                  >
                    <div class="text-xs text-slate-500 font-medium truncate">
                      {{ item.content }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <ElPagination
                  v-model:current-page="complaintPage"
                  v-model:page-size="complaintPageSize"
                  :total="complaintTotalCount"
                  layout="prev, pager, next"
                  small
                  @current-change="handleComplaintPageChange"
                />
              </div>
            </ElCard>
          </div>

          <div class="lg:col-span-7">
            <ElCard
              v-if="complaintActiveItem"
              class="hide-header-border"
              shadow="hover"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <span
                    class="font-bold text-slate-800 flex items-center gap-2"
                  >
                    <ElIcon><User /></ElIcon>
                    Chi Tiết Khiếu Nại
                  </span>
                  <div class="flex gap-2">
                    <ElButton
                      v-if="complaintActiveItem.status !== 'Resolved'"
                      type="success"
                      size="small"
                      @click="updateComplaintStatus('Resolved')"
                    >
                      Giải quyết
                    </ElButton>
                    <ElButton
                      v-if="complaintActiveItem.status === 'Pending'"
                      type="primary"
                      size="small"
                      @click="updateComplaintStatus('Read')"
                    >
                      Đánh dấu đã đọc
                    </ElButton>
                    <ElButton
                      v-if="complaintActiveItem.status !== 'Pending'"
                      type="info"
                      size="small"
                      @click="updateComplaintStatus('Pending')"
                    >
                      Chờ xử lý
                    </ElButton>
                  </div>
                </div>
              </template>

              <div class="space-y-6">
                <div
                  class="flex items-center justify-between gap-4 pb-4 border-b border-slate-100"
                >
                  <div class="flex items-center gap-3">
                    <ElAvatar
                      :size="48"
                      class="bg-danger-light text-danger font-bold text-lg"
                    >
                      {{ complaintActiveItem.customerName.charAt(0) }}
                    </ElAvatar>
                    <div>
                      <div
                        class="text-base font-bold text-slate-900 leading-tight"
                      >
                        {{ complaintActiveItem.customerName }}
                      </div>
                      <div class="text-xs text-slate-500 mt-1">
                        SĐT:
                        <span class="font-mono text-slate-700 font-semibold">{{
                          complaintActiveItem.phoneNumber
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="flex items-center gap-0.5 justify-end">
                      <ElIcon
                        v-for="n in 5"
                        :key="n"
                        :class="
                          n <= complaintActiveItem.rating
                            ? 'text-amber-400'
                            : 'text-slate-200'
                        "
                        size="16"
                      >
                        <StarFilled />
                      </ElIcon>
                    </div>
                    <div
                      class="text-xs text-slate-400 mt-1.5 uppercase font-bold tracking-wider"
                    >
                      {{ complaintActiveItem.feedbackArea || "Dịch vụ" }}
                    </div>
                  </div>
                </div>

                <div>
                  <h4
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Nội dung khiếu nại
                  </h4>
                  <div
                    class="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-4"
                  >
                    <p
                      class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed m-0 whitespace-pre-line"
                    >
                      {{ complaintActiveItem.content }}
                    </p>
                  </div>
                </div>

                <div>
                  <h4
                    class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
                  >
                    Phản hồi khách hàng
                  </h4>
                  <ElInput
                    v-model="complaintReplyText"
                    type="textarea"
                    :rows="4"
                    placeholder="Nhập nội dung phản hồi gửi đến khách hàng..."
                    resize="none"
                  />
                  <div class="mt-3 flex justify-end">
                    <ElButton
                      type="primary"
                      :disabled="!complaintReplyText.trim()"
                      :loading="complaintSubmitting"
                      @click="sendComplaintReply"
                    >
                      Gửi phản hồi
                    </ElButton>
                  </div>
                </div>

                <div
                  class="pt-4 border-t border-slate-100 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-xl"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h4
                      class="text-xs font-bold text-indigo-500 uppercase tracking-wider m-0"
                    >
                      Ghi chú nội bộ
                    </h4>
                    <span class="text-[10px] text-slate-400 italic"
                      >Chỉ lưu hành nội bộ xưởng</span
                    >
                  </div>
                  <div class="flex gap-3 items-start">
                    <ElInput
                      v-model="complaintInternalNote"
                      type="textarea"
                      :rows="2"
                      placeholder="Nhập ghi chú nội bộ..."
                      resize="none"
                      class="flex-1"
                    />
                    <ElButton
                      type="warning"
                      :loading="complaintSubmitting"
                      class="h-12"
                      @click="saveComplaintInternalNote"
                    >
                      Lưu
                    </ElButton>
                  </div>
                </div>
              </div>
            </ElCard>

            <div
              v-else
              class="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3"
              style="min-height: 300px"
            >
              <ElIcon size="48" class="text-slate-200"><Message /></ElIcon>
              <span
                >Vui lòng chọn một khiếu nại bên danh sách để xem chi tiết và xử
                lý.</span
              >
            </div>
          </div>
        </div>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Message,
  Refresh,
  CircleCheck,
  StarFilled,
  User,
} from "@element-plus/icons-vue";
import { createEvaluationUseCases } from "@/infrastructure/evaluation/usecasesFactory";
import { ContactApi } from "@/api/customer/contact.api";
import type { Contact } from "@/types/contact";
import type {
  EvaluationCriteria,
  EvaluationDetail,
  EvaluationProcessingStatus,
} from "@/domain/evaluation/types";

defineOptions({ name: "ServiceEvaluation" });

const activeMainTab = ref("evaluation");
const usecases = createEvaluationUseCases();

const filters = reactive<{
  status: EvaluationProcessingStatus;
  criteria: EvaluationCriteria;
  search: string;
}>({
  status: "Unprocessed",
  criteria: "QualityOfCar",
  search: "",
});

const listLoading = ref(false);
const rows = ref([] as any[]);
const selected = ref<EvaluationDetail | null>(null);

const replyText = ref("");
const internalNotesText = ref("");
const replyLoading = ref(false);
const processedLoading = ref(false);
const notesLoading = ref(false);
const showInternalNotes = ref(true);

const complaintLoading = ref(false);
const complaintSubmitting = ref(false);
const complaintList = ref<Contact.CustomerFeedback[]>([]);
const complaintTotalCount = ref(0);
const complaintPage = ref(1);
const complaintPageSize = ref(10);
const complaintSearchQuery = ref("");
const complaintStatusFilter = ref<string>("");
const complaintActiveItem = ref<Contact.CustomerFeedback | null>(null);
const complaintSelectedId = ref<number | null>(null);
const complaintReplyText = ref("");
const complaintInternalNote = ref("");

function criteriaText(c: EvaluationCriteria) {
  return c === "QualityOfCar" ? "Chất lượng xe" : "Thái độ phục vụ";
}

function senderLabel(s: EvaluationDetail["chatHistory"][number]["sender"]) {
  return s === "Customer" ? "Khách hàng" : s === "Admin" ? "Admin" : "System";
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

async function loadList() {
  listLoading.value = true;
  try {
    const res = await usecases.getEvaluations.execute({
      status: filters.status,
      criteria: filters.criteria,
      search: filters.search,
      page: 1,
      size: 50,
    });
    rows.value = res.items;

    if (!selected.value && rows.value.length > 0) {
      await handleSelect(rows.value[0]);
    }
  } finally {
    listLoading.value = false;
  }
}

async function handleSelect(row: any) {
  const id = Number(row.id);
  if (!id) return;

  selected.value = null;
  try {
    const detail = await usecases.getDetail.execute(id);
    selected.value = detail;

    replyText.value = detail.directReplyText || "";
    internalNotesText.value = detail.internalNotes || "";
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể tải chi tiết đánh giá");
  }
}

async function handleSendReply() {
  if (!selected.value) return;
  const text = replyText.value.trim();
  if (!text) return;

  replyLoading.value = true;
  try {
    await usecases.createReply.execute({
      evaluationId: selected.value.id,
      text,
    });
    ElMessage.success("Đã gửi phản hồi.");
    await handleSelect(selected.value);
  } catch (e: any) {
    ElMessage.error(e?.message || "Gửi phản hồi thất bại");
  } finally {
    replyLoading.value = false;
  }
}

async function handleMarkProcessed() {
  if (!selected.value) return;

  processedLoading.value = true;
  try {
    await usecases.markProcessed.execute({ evaluationId: selected.value.id });
    ElMessage.success("Đã đánh dấu Đã xử lý.");
    await handleSelect(selected.value);
    await loadList();
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể cập nhật trạng thái");
  } finally {
    processedLoading.value = false;
  }
}

async function handleSaveNotes() {
  if (!selected.value) return;

  notesLoading.value = true;
  try {
    await usecases.updateInternalNotes.execute({
      evaluationId: selected.value.id,
      notes: internalNotesText.value,
    });
    ElMessage.success("Đã lưu ghi chú nội bộ.");
  } catch (e: any) {
    ElMessage.error(e?.message || "Không thể lưu ghi chú");
  } finally {
    notesLoading.value = false;
  }
}

const loadComplaints = async () => {
  complaintLoading.value = true;
  try {
    const res = await ContactApi.getPaginated({
      contactType: "Feedback",
      status: complaintStatusFilter.value || undefined,
      page: complaintPage.value,
      pageSize: complaintPageSize.value,
    });

    const rawRecords = (res as any).items ?? res.records ?? [];

    const feedbackList = rawRecords.map((item: any) => ({
      id: item.id,
      contactId: item.contactId,
      rating: item.rating ?? 5,
      feedbackArea: item.feedbackArea ?? "",
      customerName: item.customerName ?? item.contact?.fullName ?? "Khách hàng",
      phoneNumber: item.phoneNumber ?? item.contact?.phoneNumber ?? "",
      content: item.content ?? item.subject ?? "",
      status: item.status ?? "Pending",
      createdAt: item.createdAt,
    }));

    complaintList.value = feedbackList.filter((item: any) => {
      if (complaintSearchQuery.value.trim()) {
        const q = complaintSearchQuery.value.toLowerCase();
        const matchesName = item.customerName.toLowerCase().includes(q);
        const matchesPhone = item.phoneNumber.includes(q);
        if (!matchesName && !matchesPhone) return false;
      }
      return (
        item.rating <= 3 ||
        item.feedbackArea === "QualityOfCar" ||
        item.feedbackArea === "Service"
      );
    });

    complaintTotalCount.value = complaintList.value.length;

    if (complaintList.value.length > 0) {
      const found = complaintList.value.find(
        (item) => item.id === complaintSelectedId.value,
      );
      if (found) {
        complaintActiveItem.value = found;
      } else {
        selectComplaintItem(complaintList.value[0]);
      }
    } else {
      complaintActiveItem.value = null;
      complaintSelectedId.value = null;
    }
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể tải danh sách khiếu nại");
  } finally {
    complaintLoading.value = false;
  }
};

const selectComplaintItem = (item: Contact.CustomerFeedback) => {
  complaintActiveItem.value = item;
  complaintSelectedId.value = item.id;
  complaintReplyText.value = "";
  complaintInternalNote.value = (item as any).internalNote ?? "";
};

const getComplaintStatusTagType = (status: string) => {
  switch (status) {
    case "Pending":
      return "danger";
    case "Read":
      return "warning";
    case "Resolved":
      return "success";
    default:
      return "info";
  }
};

const getComplaintStatusText = (status: string) => {
  switch (status) {
    case "Pending":
      return "Chờ xử lý";
    case "Read":
      return "Đã đọc";
    case "Resolved":
      return "Đã giải quyết";
    default:
      return status;
  }
};

const formatComplaintDate = (dateStr?: string) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
};

const handleComplaintSearch = () => {
  complaintPage.value = 1;
  loadComplaints();
};

const handleComplaintFilterChange = () => {
  complaintPage.value = 1;
  loadComplaints();
};

const handleComplaintPageChange = (p: number) => {
  complaintPage.value = p;
  loadComplaints();
};

const updateComplaintStatus = async (newStatus: string) => {
  if (!complaintActiveItem.value) return;
  try {
    await ContactApi.updateStatus(complaintActiveItem.value.id, "Feedback", {
      status: newStatus,
    });
    complaintActiveItem.value.status = newStatus;
    ElMessage.success("Cập nhật trạng thái thành công");
    await loadComplaints();
  } catch {
    ElMessage.error("Cập nhật trạng thái thất bại");
  }
};

const sendComplaintReply = async () => {
  if (!complaintActiveItem.value || !complaintReplyText.value.trim()) return;
  complaintSubmitting.value = true;
  try {
    await ContactApi.reply({
      contactId: complaintActiveItem.value.contactId,
      message: complaintReplyText.value.trim(),
      isInternal: false,
    });
    ElMessage.success("Đã gửi phản hồi thành công");
    complaintReplyText.value = "";
    await loadComplaints();
  } catch {
    ElMessage.error("Gửi phản hồi thất bại");
  } finally {
    complaintSubmitting.value = false;
  }
};

const saveComplaintInternalNote = async () => {
  if (!complaintActiveItem.value) return;
  complaintSubmitting.value = true;
  try {
    await ContactApi.updateInternalNote({
      contactId: complaintActiveItem.value.contactId,
      internalNote: complaintInternalNote.value.trim(),
    });
    ElMessage.success("Đã lưu ghi chú nội bộ");
    await loadComplaints();
  } catch {
    ElMessage.error("Lưu ghi chú thất bại");
  } finally {
    complaintSubmitting.value = false;
  }
};

watch(
  () => [filters.status, filters.criteria, filters.search],
  () => {
    void loadList();
  },
);

watch(activeMainTab, (newTab) => {
  if (newTab === "complaint") {
    loadComplaints();
  } else {
    loadList();
  }
});

onMounted(() => {
  void loadList();
});
</script>

<style scoped>
.complaint-card {
  padding: 14px;
  background-color: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color-light, #e2e8f0);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.complaint-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
  border-color: var(--el-color-danger, #f56c6c);
}

.complaint-card.is-active {
  border-color: var(--el-color-danger, #f56c6c);
  background-color: rgb(245 108 108 / 3%);
  box-shadow: 0 2px 8px rgb(245 108 108 / 8%);
}

.bg-danger-light {
  background-color: rgb(245 108 108 / 10%);
}

:global(html.dark) .complaint-card {
  background-color: #1a1a1e;
  border-color: #2e2e33;
}

:global(html.dark) .complaint-card:hover,
:global(html.dark) .complaint-card.is-active {
  background-color: #241d1d;
  border-color: var(--el-color-danger, #f56c6c);
}
</style>
