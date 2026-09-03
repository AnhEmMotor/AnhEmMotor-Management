<template>
  <main class="resp-page customer-care-page min-h-full p-4 sm:p-6 lg:p-8">
    <header class="page-heading">
      <div>
        <div class="eyebrow">
          <span class="eyebrow__dot"></span>
          Trung tâm chăm sóc khách hàng
        </div>
        <h1>Khách hàng & hỗ trợ</h1>
        <p>
          Phân loại khách hàng, ghi nhận tương tác và xử lý các phiên hỗ trợ trên cùng một trang.
        </p>
      </div>

      <div class="page-heading__actions">
        <ElButton :loading="refreshing" @click="refreshAll">
          <ArtSvgIcon icon="ri:refresh-line" class="mr-1.5" />
          Làm mới
        </ElButton>
        <ElButton type="primary" @click="openAddCustomerDialog">
          <ArtSvgIcon icon="ri:user-add-line" class="mr-1.5" />
          Thêm khách hàng
        </ElButton>
      </div>
    </header>

    <section class="metric-grid" aria-label="Tổng quan chăm sóc khách hàng">
      <article class="metric-card metric-card--accent">
        <span class="metric-card__label">Tổng khách hàng</span>
        <strong>{{ leads.length }}</strong>
        <small>Dữ liệu hồ sơ Lead hiện có</small>
      </article>
      <article class="metric-card">
        <span class="metric-card__label">Khách VIP</span>
        <strong>{{ classificationCounts.VIP }}</strong>
        <small>Đang được ưu tiên chăm sóc</small>
      </article>
      <article class="metric-card">
        <span class="metric-card__label">Phiên đang mở</span>
        <strong>{{ openSessionCount }}</strong>
        <small>Chờ hoặc đang được xử lý</small>
      </article>
      <article class="metric-card">
        <span class="metric-card__label">Cần chăm sóc</span>
        <strong>{{ classificationCounts.NeedsAttention }}</strong>
        <small>Đã được nhân viên đánh dấu</small>
      </article>
    </section>

    <nav class="workspace-tabs" aria-label="Khu vực chăm sóc khách hàng">
      <button
        type="button"
        :class="{ 'is-active': activeWorkspace === 'customers' }"
        @click="activeWorkspace = 'customers'"
      >
        <ArtSvgIcon icon="ri:group-line" />
        Khách hàng
        <span>{{ filteredLeads.length }}</span>
      </button>
      <button
        type="button"
        :class="{ 'is-active': activeWorkspace === 'support' }"
        @click="activeWorkspace = 'support'"
      >
        <ArtSvgIcon icon="ri:chat-3-line" />
        Phiên chat hỗ trợ
        <span>{{ filteredSessions.length }}</span>
      </button>
    </nav>

    <section v-show="activeWorkspace === 'customers'" class="workspace-panel">
      <div class="filter-bar">
        <ElInput
          v-model="customerSearch"
          clearable
          placeholder="Tìm theo tên, số điện thoại, email hoặc CCCD"
          class="filter-bar__search"
        >
          <template #prefix>
            <ArtSvgIcon icon="ri:search-line" />
          </template>
        </ElInput>
        <ElSelect
          v-model="classificationFilter"
          class="filter-bar__select"
          aria-label="Lọc phân loại khách hàng"
        >
          <ElOption label="Tất cả phân loại" value="all" />
          <ElOption
            v-for="option in classificationOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </div>

      <ElAlert
        v-if="leadError"
        :title="leadError"
        type="error"
        show-icon
        :closable="false"
        class="m-4"
      />

      <ElTable
        v-loading="leadLoading"
        :data="filteredLeads"
        row-key="id"
        class="customer-table"
        @row-dblclick="(row) => openProfile(asLead(row))"
      >
        <ElTableColumn label="Khách hàng" min-width="200">
          <template #default="{ row }">
            <div class="customer-cell">
              <div class="customer-avatar">{{ getInitials(row.fullName) }}</div>
              <div class="customer-cell__copy">
                <strong>{{ row.fullName || 'Chưa cập nhật' }}</strong>
                <span class="text-xs text-slate-400">
                  {{
                    row.gender === 'Male'
                      ? 'Nam'
                      : row.gender === 'Female'
                        ? 'Nữ'
                        : row.gender === 'Other'
                          ? 'Khác'
                          : 'Giới tính chưa rõ'
                  }}
                </span>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Thông tin liên hệ" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-col gap-0.5">
              <span class="table-primary font-semibold">{{
                row.phoneNumber || 'Chưa có SĐT'
              }}</span>
              <span class="table-secondary text-xs">{{ row.email || 'Chưa có email' }}</span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Phân loại" min-width="190">
          <template #default="{ row }">
            <ElSelect
              :model-value="getClassification(asLead(row))"
              size="small"
              :loading="classificationUpdatingId === row.id"
              class="classification-select"
              @change="(value: CustomerClassification) => updateClassification(asLead(row), value)"
            >
              <ElOption
                v-for="option in classificationOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </ElSelect>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Nhu cầu hiện tại" min-width="190">
          <template #default="{ row }">
            <span class="table-primary">
              {{ row.interestedVehicle || 'Chưa ghi nhận nhu cầu' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Tương tác gần nhất" min-width="180">
          <template #default="{ row }">
            <span class="table-secondary">{{ getLastInteraction(asLead(row)) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Ngày tạo" min-width="135">
          <template #default="{ row }">
            <span class="table-secondary">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="Thao tác" width="210" fixed="right" align="right">
          <template #default="{ row }">
            <div class="row-actions">
              <ElTooltip content="Gọi điện">
                <button
                  type="button"
                  class="icon-action"
                  :class="{ 'is-disabled': !row.phoneNumber }"
                  aria-label="Gọi điện cho khách hàng"
                  @click.stop="callPhone(row.phoneNumber)"
                >
                  <ArtSvgIcon icon="ri:phone-line" />
                </button>
              </ElTooltip>
              <ElTooltip content="Mở Zalo">
                <button
                  type="button"
                  class="icon-action"
                  :class="{ 'is-disabled': !row.phoneNumber }"
                  aria-label="Mở Zalo của khách hàng"
                  @click.stop="openZalo(row.phoneNumber)"
                >
                  <ArtSvgIcon icon="ri:chat-smile-2-line" />
                </button>
              </ElTooltip>
              <ElTooltip content="Ghi nhận chăm sóc">
                <button
                  type="button"
                  class="icon-action"
                  aria-label="Ghi nhận chăm sóc khách hàng"
                  @click.stop="openCareDialog(asLead(row))"
                >
                  <ArtSvgIcon icon="ri:heart-add-2-line" />
                </button>
              </ElTooltip>
              <ElTooltip content="Tạo phiên chat hỗ trợ">
                <button
                  type="button"
                  class="icon-action"
                  aria-label="Tạo phiên chat hỗ trợ khách hàng"
                  @click.stop="openSupportDialog(asLead(row))"
                >
                  <ArtSvgIcon icon="ri:message-3-line" />
                </button>
              </ElTooltip>
              <ElTooltip content="Xem hồ sơ">
                <button
                  type="button"
                  class="icon-action icon-action--primary"
                  aria-label="Mở hồ sơ khách hàng 360"
                  @click.stop="openProfile(asLead(row))"
                >
                  <ArtSvgIcon icon="ri:arrow-right-up-line" />
                </button>
              </ElTooltip>
            </div>
          </template>
        </ElTableColumn>

        <template #empty>
          <div class="empty-state">
            <ArtSvgIcon icon="ri:user-search-line" />
            <strong>Chưa có khách hàng phù hợp</strong>
            <span>Thử đổi từ khóa hoặc tạo hồ sơ khách hàng mới.</span>
          </div>
        </template>
      </ElTable>
    </section>

    <section
      v-show="activeWorkspace === 'support'"
      class="support-workspace"
      aria-label="Phiên chat hỗ trợ khách hàng"
    >
      <aside class="session-sidebar">
        <div class="session-sidebar__header">
          <div>
            <span>Hộp thư hỗ trợ</span>
            <strong>{{ filteredSessions.length }} phiên</strong>
          </div>
          <ElButton
            circle
            type="primary"
            aria-label="Tạo phiên chat hỗ trợ"
            @click="openSupportDialog()"
          >
            <ArtSvgIcon icon="ri:add-line" />
          </ElButton>
        </div>

        <div class="session-sidebar__filters">
          <ElInput v-model="sessionSearch" clearable placeholder="Tìm phiên hỗ trợ">
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" />
            </template>
          </ElInput>
          <ElSelect v-model="sessionStatusFilter" aria-label="Lọc trạng thái phiên">
            <ElOption label="Tất cả trạng thái" value="all" />
            <ElOption label="Mới" value="New" />
            <ElOption label="Đã phân công" value="Assigned" />
            <ElOption label="Đang xử lý" value="InProgress" />
            <ElOption label="Đã đóng" value="Closed" />
          </ElSelect>
        </div>

        <ElAlert
          v-if="sessionError"
          :title="sessionError"
          type="error"
          show-icon
          :closable="false"
          class="mx-3 mb-3"
        />

        <div v-loading="sessionLoading" class="session-list">
          <button
            v-for="session in filteredSessions"
            :key="session.id"
            type="button"
            class="session-item"
            :class="{ 'is-active': activeSession?.id === session.id }"
            @click="selectSession(session)"
          >
            <span class="session-item__avatar">
              {{ getInitials(getSessionCustomerName(session)) }}
            </span>
            <span class="session-item__body">
              <span class="session-item__topline">
                <strong>{{ getSessionCustomerName(session) }}</strong>
                <small>{{ formatRelativeDate(session.createdAt) }}</small>
              </span>
              <span class="session-item__subject">{{ session.subject }}</span>
              <span class="session-item__preview">{{ getSessionPreview(session) }}</span>
            </span>
            <span class="status-dot" :class="`status-dot--${session.status.toLowerCase()}`"></span>
          </button>

          <div
            v-if="!sessionLoading && filteredSessions.length === 0"
            class="empty-state empty-state--compact"
          >
            <ArtSvgIcon icon="ri:chat-off-line" />
            <strong>Chưa có phiên hỗ trợ</strong>
            <span>Tạo phiên mới để ghi nhận yêu cầu qua điện thoại hoặc Zalo.</span>
          </div>
        </div>
      </aside>

      <article v-if="activeSession" class="chat-panel">
        <header class="chat-panel__header">
          <div class="customer-cell">
            <div class="customer-avatar customer-avatar--online">
              {{ getInitials(getSessionCustomerName(activeSession)) }}
            </div>
            <div class="customer-cell__copy">
              <strong>{{ getSessionCustomerName(activeSession) }}</strong>
              <span>
                {{
                  activeSession.contact?.phoneNumber ||
                  activeSession.email ||
                  'Chưa có thông tin liên hệ'
                }}
              </span>
            </div>
          </div>

          <div class="chat-panel__actions">
            <ElSelect
              :model-value="activeSession.status"
              size="small"
              :loading="sessionStatusUpdating"
              aria-label="Cập nhật trạng thái phiên hỗ trợ"
              @change="updateSessionStatus"
            >
              <ElOption label="Mới" value="New" disabled />
              <ElOption label="Đã phân công" value="Assigned" disabled />
              <ElOption
                label="Đang xử lý"
                value="InProgress"
                :disabled="!['Assigned', 'InProgress'].includes(activeSession.status)"
              />
              <ElOption
                label="Đã đóng"
                value="Closed"
                :disabled="!['InProgress', 'Closed'].includes(activeSession.status)"
              />
            </ElSelect>
            <ElButton v-if="matchedLead" size="small" @click="openProfile(matchedLead)">
              Xem hồ sơ
            </ElButton>
          </div>
        </header>

        <div class="conversation-context">
          <span>{{ activeSession.category || 'Hỗ trợ chung' }}</span>
          <strong>{{ activeSession.subject }}</strong>
          <small>Mã phiên #{{ activeSession.id }}</small>
        </div>

        <div ref="messageListRef" class="message-list">
          <div
            v-for="message in activeMessages"
            :key="message.id"
            class="message-row"
            :class="{
              'message-row--outgoing': message.direction === 'outgoing',
            }"
          >
            <div class="message-bubble">
              <span class="message-bubble__sender">{{ message.sender }}</span>
              <p>{{ message.message }}</p>
              <time>{{ formatDateTime(message.createdAt) }}</time>
            </div>
          </div>
        </div>

        <footer class="composer">
          <ElInput
            v-model="replyDraft"
            type="textarea"
            :rows="2"
            maxlength="2000"
            show-word-limit
            resize="none"
            :disabled="activeSession.status !== 'InProgress'"
            :placeholder="
              activeSession.status !== 'InProgress'
                ? 'Bắt đầu hỗ trợ trước khi phản hồi'
                : 'Nhập phản hồi cho khách hàng...'
            "
            @keydown.enter.exact.prevent="sendChatReply"
          />
          <div class="composer__footer">
            <span>Enter để gửi · Shift + Enter để xuống dòng</span>
            <ElButton
              type="primary"
              :loading="replySending"
              :disabled="activeSession.status !== 'InProgress' || !replyDraft.trim()"
              @click="sendChatReply"
            >
              <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1.5" />
              Gửi phản hồi
            </ElButton>
          </div>
        </footer>
      </article>

      <div v-else class="chat-placeholder">
        <div class="chat-placeholder__icon">
          <ArtSvgIcon icon="ri:chat-3-line" />
        </div>
        <strong>Chọn một phiên hỗ trợ</strong>
        <span>Nội dung trao đổi và công cụ xử lý sẽ hiển thị tại đây.</span>
      </div>
    </section>

    <ElDialog
      v-model="addCustomerDialogVisible"
      class="customer-care-dialog"
      title="Thêm khách hàng"
      width="min(620px, calc(100vw - 32px))"
      destroy-on-close
    >
      <ElForm label-position="top" class="dialog-form-grid">
        <ElFormItem label="Họ và tên" class="dialog-form-grid__wide" required>
          <ElInput v-model="customerForm.fullName" placeholder="Nhập họ và tên" />
        </ElFormItem>
        <ElFormItem label="Số điện thoại" required>
          <ElInput v-model="customerForm.phoneNumber" placeholder="0901234567" />
        </ElFormItem>
        <ElFormItem label="Email">
          <ElInput v-model="customerForm.email" placeholder="khachhang@email.com" />
        </ElFormItem>
        <ElFormItem label="CCCD / CMND">
          <ElInput v-model="customerForm.identificationNumber" placeholder="Nhập số định danh" />
        </ElFormItem>
        <ElFormItem label="Phân loại">
          <ElSelect v-model="customerForm.classification" class="w-full">
            <ElOption
              v-for="option in classificationOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Ngày sinh">
          <ElDatePicker
            v-model="customerForm.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            format="DD/MM/YYYY"
            class="w-full"
            placeholder="Chọn ngày sinh"
          />
        </ElFormItem>
        <ElFormItem label="Giới tính">
          <ElSelect v-model="customerForm.gender" class="w-full" clearable>
            <ElOption label="Nam" value="Male" />
            <ElOption label="Nữ" value="Female" />
            <ElOption label="Khác" value="Other" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="addCustomerDialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" :loading="customerCreating" @click="createCustomer">
          Lưu khách hàng
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="careDialogVisible"
      class="customer-care-dialog"
      title="Ghi nhận chăm sóc"
      width="min(520px, calc(100vw - 32px))"
      destroy-on-close
    >
      <div v-if="careCustomer" class="dialog-customer-summary">
        <div class="customer-avatar">
          {{ getInitials(careCustomer.fullName) }}
        </div>
        <div>
          <strong>{{ careCustomer.fullName }}</strong>
          <span>{{ careCustomer.phoneNumber }}</span>
        </div>
      </div>
      <ElForm label-position="top">
        <ElFormItem label="Hình thức" required>
          <ElSelect v-model="careForm.category" class="w-full">
            <ElOption
              v-for="option in supportCategoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Nội dung" required>
          <ElInput
            v-model="careForm.description"
            type="textarea"
            :rows="4"
            maxlength="1000"
            show-word-limit
            placeholder="Ghi rõ nội dung đã trao đổi với khách hàng"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="careDialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" :loading="careSaving" @click="saveCareActivity">
          Chuyển sang yêu cầu hỗ trợ
        </ElButton>
      </template>
    </ElDialog>

    <ElDialog
      v-model="supportDialogVisible"
      class="customer-care-dialog"
      title="Tạo phiên chat hỗ trợ"
      width="min(560px, calc(100vw - 32px))"
      destroy-on-close
    >
      <ElForm label-position="top">
        <ElFormItem label="Khách hàng" required>
          <ElSelect
            v-model="supportForm.leadId"
            filterable
            class="w-full"
            placeholder="Chọn khách hàng"
          >
            <ElOption
              v-for="lead in leads"
              :key="lead.id"
              :label="`${lead.fullName} · ${lead.phoneNumber || 'Chưa có SĐT'}`"
              :value="lead.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Phân công nhân viên hỗ trợ" required>
          <ElSelect
            v-model="supportForm.assignedUserId"
            filterable
            class="w-full"
            :loading="assignableUsersLoading"
            placeholder="Chọn nhân viên hỗ trợ"
            no-data-text="Không có nhân viên đủ quyền hỗ trợ"
          >
            <ElOption
              v-for="user in assignableUsers"
              :key="user.id"
              :label="user.fullName || user.email || user.phoneNumber || user.id"
              :value="user.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Chủ đề" required>
          <ElInput v-model="supportForm.subject" placeholder="Ví dụ: Hỗ trợ lịch bảo dưỡng" />
        </ElFormItem>
        <ElFormItem label="Nhóm yêu cầu" required>
          <ElSelect v-model="supportForm.category" class="w-full">
            <ElOption
              v-for="option in supportCategoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="Nội dung yêu cầu ban đầu" required>
          <ElInput
            v-model="supportForm.content"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
            placeholder="Ghi lại yêu cầu khách đã gửi qua điện thoại, website hoặc Zalo"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="supportDialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" :loading="sessionCreating" @click="createSupportSession">
          Tạo phiên chat
        </ElButton>
      </template>
    </ElDialog>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { useUserStore } from '@/application/store/user';
import {
  fetchAddLeadActivity,
  fetchCreateLead,
  fetchGetLeadList,
  type Lead,
  type LeadActivity,
  type LeadPaginatedResponse,
} from '@/api/customer/lead.api';
import { ContactApi, type AssignableContactUser } from '@/api/customer/contact.api';
import type { Contact } from '@/types';

defineOptions({ name: 'CustomerCare' });

type CustomerClassification = 'New' | 'Returning' | 'VIP' | 'NeedsAttention';
type Workspace = 'customers' | 'support';
type ChatDirection = 'incoming' | 'outgoing';
type SupportCategory =
  | 'Technical'
  | 'Billing'
  | 'Quality'
  | 'Service'
  | 'Speed'
  | 'Rating'
  | 'General'
  | 'Sales'
  | 'AfterSales'
  | 'Other';

interface ChatMessage {
  id: string;
  message: string;
  sender: string;
  createdAt?: string;
  direction: ChatDirection;
}

const CLASSIFICATION_ACTIVITY = 'CustomerClassification';
const router = useRouter();
const userStore = useUserStore();

const classificationOptions: Array<{
  value: CustomerClassification;
  label: string;
}> = [
  { value: 'New', label: 'Khách mới' },
  { value: 'Returning', label: 'Khách quay lại' },
  { value: 'VIP', label: 'Khách VIP' },
  { value: 'NeedsAttention', label: 'Cần chăm sóc' },
];

const supportCategoryOptions: Array<{ value: SupportCategory; label: string }> = [
  { value: 'Technical', label: 'Hỗ trợ kỹ thuật' },
  { value: 'Billing', label: 'Thanh toán & Hóa đơn' },
  { value: 'Quality', label: 'Chất lượng xe' },
  { value: 'Service', label: 'Thái độ phục vụ' },
  { value: 'Speed', label: 'Tốc độ phục vụ' },
  { value: 'Rating', label: 'Đánh giá & Rating' },
  { value: 'General', label: 'Chung' },
  { value: 'Sales', label: 'Tư vấn bán hàng' },
  { value: 'AfterSales', label: 'Hậu mãi' },
  { value: 'Other', label: 'Khác' },
];

const activeWorkspace = ref<Workspace>('customers');
const leads = ref<Lead[]>([]);
const supportSessions = ref<Contact.SupportRequest[]>([]);
const leadLoading = ref(false);
const sessionLoading = ref(false);
const refreshing = ref(false);
const leadError = ref('');
const sessionError = ref('');

const customerSearch = ref('');
const classificationFilter = ref<CustomerClassification | 'all'>('all');
const sessionSearch = ref('');
const sessionStatusFilter = ref('all');
const activeSession = ref<Contact.SupportRequest | null>(null);
const replyDraft = ref('');
const replySending = ref(false);
const messageListRef = ref<HTMLElement | null>(null);
const assignableUsers = ref<AssignableContactUser[]>([]);
const assignableUsersLoading = ref(false);

const addCustomerDialogVisible = ref(false);
const customerCreating = ref(false);
const customerForm = ref(createEmptyCustomerForm());

const careDialogVisible = ref(false);
const careCustomer = ref<Lead | null>(null);
const careSaving = ref(false);
const careForm = ref({ category: 'General' as SupportCategory, description: '' });

const supportDialogVisible = ref(false);
const sessionCreating = ref(false);
const supportForm = ref(createEmptySupportForm());
const classificationUpdatingId = ref<number | null>(null);

function createEmptyCustomerForm() {
  return {
    fullName: '',
    phoneNumber: '',
    email: '',
    identificationNumber: '',
    birthday: '',
    gender: '',
    classification: 'New' as CustomerClassification,
  };
}

function createEmptySupportForm() {
  return {
    leadId: null as number | null,
    subject: '',
    category: 'Other' as SupportCategory,
    content: '',
    assignedUserId: '',
  };
}

function asLead(value: unknown): Lead {
  return value as Lead;
}

function isSupportRequest(item: Contact.ContactItem): item is Contact.SupportRequest {
  return 'subject' in item && 'category' in item && 'contactId' in item;
}

function getLatestClassificationActivity(activities?: LeadActivity[]): LeadActivity | undefined {
  return [...(activities ?? [])]
    .filter((activity) => activity.activityType === CLASSIFICATION_ACTIVITY)
    .sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    )[0];
}

function getClassification(lead: Lead): CustomerClassification {
  const stored = getLatestClassificationActivity(lead.activities)?.description;
  if (classificationOptions.some((option) => option.value === stored)) {
    return stored as CustomerClassification;
  }

  const legacyTier = lead.tier?.toLowerCase() ?? '';
  if (legacyTier.includes('vip') || legacyTier.includes('platinum')) return 'VIP';
  if (
    legacyTier.includes('thân thiết') ||
    legacyTier.includes('gold') ||
    legacyTier.includes('silver')
  ) {
    return 'Returning';
  }
  return 'New';
}

function getClassificationLabel(value: CustomerClassification) {
  return classificationOptions.find((option) => option.value === value)?.label ?? 'Khách mới';
}

const filteredLeads = computed(() => {
  const query = customerSearch.value.trim().toLowerCase();
  return leads.value.filter((lead) => {
    const searchable = [
      lead.fullName,
      lead.phoneNumber,
      lead.email,
      lead.identificationNumber,
      lead.interestedVehicle,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesClassification =
      classificationFilter.value === 'all' ||
      getClassification(lead) === classificationFilter.value;
    return matchesQuery && matchesClassification;
  });
});

const classificationCounts = computed(() => {
  const counts: Record<CustomerClassification, number> = {
    New: 0,
    Returning: 0,
    VIP: 0,
    NeedsAttention: 0,
  };
  leads.value.forEach((lead) => {
    counts[getClassification(lead)] += 1;
  });
  return counts;
});

const filteredSessions = computed(() => {
  const query = sessionSearch.value.trim().toLowerCase();
  return supportSessions.value.filter((session) => {
    const searchable = [
      getSessionCustomerName(session),
      session.contact?.phoneNumber,
      session.email,
      session.subject,
      session.content,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesStatus =
      sessionStatusFilter.value === 'all' || session.status === sessionStatusFilter.value;
    return matchesQuery && matchesStatus;
  });
});

const openSessionCount = computed(
  () => supportSessions.value.filter((session) => session.status !== 'Closed').length
);

const matchedLead = computed(() => {
  if (!activeSession.value) return null;
  const contact = activeSession.value.contact;
  const phone = normalizePhone(contact?.phoneNumber ?? '');
  const email = (contact?.email ?? activeSession.value.email ?? '').toLowerCase();
  return (
    leads.value.find((lead) => {
      const samePhone = phone.length > 0 && normalizePhone(lead.phoneNumber) === phone;
      const sameEmail = email.length > 0 && (lead.email ?? '').toLowerCase() === email;
      return samePhone || sameEmail;
    }) ?? null
  );
});

const activeMessages = computed<ChatMessage[]>(() => {
  if (!activeSession.value) return [];
  const initialMessage: ChatMessage = {
    id: `request-${activeSession.value.id}`,
    message: activeSession.value.content,
    sender: getSessionCustomerName(activeSession.value),
    createdAt: activeSession.value.createdAt,
    direction: 'incoming',
  };
  const replies = (activeSession.value.contact?.replies ?? [])
    .filter((reply) => !reply.isInternal)
    .map<ChatMessage>((reply) => ({
      id: `reply-${reply.id}`,
      message: reply.message,
      sender: reply.repliedByName || 'Nhân viên hỗ trợ',
      createdAt: reply.createdAt,
      direction: 'outgoing',
    }))
    .sort(
      (first, second) =>
        new Date(first.createdAt ?? 0).getTime() - new Date(second.createdAt ?? 0).getTime()
    );
  return [initialMessage, ...replies];
});

async function loadLeads() {
  leadLoading.value = true;
  leadError.value = '';
  try {
    const response = await fetchGetLeadList({ Page: 1, PageSize: 500 });
    const paginated = response as LeadPaginatedResponse<Lead>;
    leads.value = Array.isArray(response) ? response : (paginated.items ?? paginated.records ?? []);
  } catch {
    leads.value = [];
    leadError.value = 'Không thể tải danh sách khách hàng. Vui lòng thử lại.';
  } finally {
    leadLoading.value = false;
  }
}

async function loadSupportSessions(preferredSessionId?: number) {
  sessionLoading.value = true;
  sessionError.value = '';
  const currentId = preferredSessionId ?? activeSession.value?.id;
  const assignedUserId = userStore.getUserInfo.userId;
  if (!assignedUserId) {
    supportSessions.value = [];
    activeSession.value = null;
    sessionError.value = 'Không xác định được tài khoản nhân viên đang đăng nhập.';
    sessionLoading.value = false;
    return;
  }
  try {
    const response = await ContactApi.getPaginated({
      contactType: 'support',
      assignedUserId,
      page: 1,
      pageSize: 200,
    });
    supportSessions.value = response.items
      .filter(isSupportRequest)
      .sort(
        (first, second) =>
          new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime()
      );
    activeSession.value =
      supportSessions.value.find((session) => session.id === currentId) ??
      supportSessions.value[0] ??
      null;
  } catch {
    supportSessions.value = [];
    activeSession.value = null;
    sessionError.value = 'Không thể tải các phiên hỗ trợ. Vui lòng thử lại.';
  } finally {
    sessionLoading.value = false;
  }
}

async function loadAssignableUsers() {
  assignableUsersLoading.value = true;
  try {
    assignableUsers.value = await ContactApi.getAssignableUsers();
  } catch {
    assignableUsers.value = [];
  } finally {
    assignableUsersLoading.value = false;
  }
}

async function refreshAll() {
  refreshing.value = true;
  try {
    await Promise.all([loadLeads(), loadSupportSessions(), loadAssignableUsers()]);
  } finally {
    refreshing.value = false;
  }
}

function openAddCustomerDialog() {
  customerForm.value = createEmptyCustomerForm();
  addCustomerDialogVisible.value = true;
}

async function createCustomer() {
  const form = customerForm.value;
  if (!form.fullName.trim() || !normalizePhone(form.phoneNumber)) {
    ElMessage.warning('Vui lòng nhập họ tên và số điện thoại');
    return;
  }

  customerCreating.value = true;
  try {
    const createdId = await fetchCreateLead({
      fullName: form.fullName.trim(),
      phoneNumber: normalizePhone(form.phoneNumber),
      email: form.email.trim(),
      identificationNumber: form.identificationNumber.trim(),
      birthday: form.birthday || undefined,
      gender: form.gender,
    });
    if (createdId) {
      await fetchAddLeadActivity(createdId, {
        activityType: CLASSIFICATION_ACTIVITY,
        description: form.classification,
      });
    }
    ElMessage.success('Đã tạo hồ sơ khách hàng');
    addCustomerDialogVisible.value = false;
    await loadLeads();
  } catch {
    ElMessage.error('Không thể tạo khách hàng. Kiểm tra dữ liệu và thử lại.');
  } finally {
    customerCreating.value = false;
  }
}

async function updateClassification(lead: Lead, classification: CustomerClassification) {
  if (classification === getClassification(lead)) return;
  classificationUpdatingId.value = lead.id;
  try {
    await fetchAddLeadActivity(lead.id, {
      activityType: CLASSIFICATION_ACTIVITY,
      description: classification,
    });
    ElMessage.success(`Đã phân loại ${lead.fullName} là ${getClassificationLabel(classification)}`);
    await loadLeads();
  } catch {
    ElMessage.error('Không thể cập nhật phân loại khách hàng');
  } finally {
    classificationUpdatingId.value = null;
  }
}

function openCareDialog(lead: Lead) {
  careCustomer.value = lead;
  careForm.value = { category: 'General', description: '' };
  careDialogVisible.value = true;
}

async function saveCareActivity() {
  if (!careCustomer.value || !careForm.value.description.trim()) {
    ElMessage.warning('Vui lòng nhập nội dung tương tác');
    return;
  }
  const customer = careCustomer.value;
  if (!customer.email?.trim()) {
    ElMessage.warning('Khách hàng cần có email trước khi chuyển sang yêu cầu hỗ trợ');
    return;
  }
  careSaving.value = true;
  try {
    const categoryLabel =
      supportCategoryOptions.find((option) => option.value === careForm.value.category)?.label ??
      'Chung';
    await ContactApi.createSupportRequest({
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      email: customer.email.trim(),
      subject: `Yêu cầu chăm sóc - ${categoryLabel}`,
      category: careForm.value.category,
      content: careForm.value.description.trim(),
    });
    ElMessage.success('Đã chuyển khách hàng sang Yêu cầu hỗ trợ');
    careDialogVisible.value = false;
  } catch {
    ElMessage.error('Không thể chuyển khách hàng sang Yêu cầu hỗ trợ');
  } finally {
    careSaving.value = false;
  }
}

function openSupportDialog(lead?: Lead) {
  supportForm.value = {
    ...createEmptySupportForm(),
    leadId: lead?.id ?? null,
  };
  if (assignableUsers.value.length === 0 && !assignableUsersLoading.value) {
    void loadAssignableUsers();
  }
  supportDialogVisible.value = true;
}

async function createSupportSession() {
  const form = supportForm.value;
  const lead = leads.value.find((item) => item.id === form.leadId);
  if (!lead || !form.assignedUserId || !form.subject.trim() || !form.content.trim()) {
    ElMessage.warning('Vui lòng chọn khách hàng, nhân viên và nhập đầy đủ nội dung phiên');
    return;
  }
  if (!lead.email?.trim()) {
    ElMessage.warning('Khách hàng cần có email trước khi tạo phiên chat hỗ trợ');
    return;
  }

  sessionCreating.value = true;
  try {
    const createdResponse = await ContactApi.createSupportRequest({
      fullName: lead.fullName,
      phoneNumber: lead.phoneNumber,
      email: lead.email || '',
      subject: form.subject.trim(),
      category: form.category,
      content: form.content.trim(),
    });
    try {
      await ContactApi.assign(createdResponse.id, form.assignedUserId);
    } catch {
      supportDialogVisible.value = false;
      ElMessage.warning(
        'Phiên chat đã được tạo nhưng chưa phân công. Vui lòng phân công tại Quản lý Liên hệ.'
      );
      return;
    }
    supportDialogVisible.value = false;
    const isAssignedToCurrentUser =
      form.assignedUserId.toLowerCase() === userStore.getUserInfo.userId?.toLowerCase();
    if (isAssignedToCurrentUser) {
      activeWorkspace.value = 'support';
    }
    await loadSupportSessions(isAssignedToCurrentUser ? createdResponse.id : undefined);
    ElMessage.success('Đã tạo và phân công phiên chat hỗ trợ');
  } catch {
    ElMessage.error('Không thể tạo phiên chat hỗ trợ');
  } finally {
    sessionCreating.value = false;
  }
}

function selectSession(session: Contact.SupportRequest) {
  activeSession.value = session;
}

async function sendChatReply() {
  const message = replyDraft.value.trim();
  if (!activeSession.value || !message || activeSession.value.status === 'Closed') {
    return;
  }
  replySending.value = true;
  const sessionId = activeSession.value.id;
  try {
    await ContactApi.reply({
      contactId: activeSession.value.contactId,
      message,
      markAsProcessed: true,
    });
    replyDraft.value = '';
    await loadSupportSessions(sessionId);
    ElMessage.success('Đã gửi phản hồi');
  } catch {
    ElMessage.error('Không thể gửi phản hồi');
  } finally {
    replySending.value = false;
  }
}

function openProfile(lead: Lead) {
  router.push(`/Marketing/customer/profile/${lead.id}`);
}

function getLastInteraction(lead: Lead) {
  const activities = [...(lead.activities ?? [])]
    .filter((activity) => activity.activityType !== CLASSIFICATION_ACTIVITY)
    .sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  return activities[0]?.createdAt ? formatDateTime(activities[0].createdAt) : 'Chưa có tương tác';
}

function getSessionCustomerName(session: Contact.SupportRequest) {
  return session.contact?.fullName || session.email || 'Khách hàng';
}

function getSessionPreview(session: Contact.SupportRequest) {
  const replies = (session.contact?.replies ?? [])
    .filter((reply) => !reply.isInternal)
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime()
    );
  return replies[0]?.message || session.content;
}

function getInitials(name?: string) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'KH';
  return parts
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function normalizePhone(phone?: string) {
  return (phone ?? '').replace(/\D/g, '');
}

function getZaloUrl(phone?: string) {
  const normalized = normalizePhone(phone);
  return normalized ? `https://zalo.me/${normalized}` : undefined;
}

function callPhone(phone?: string) {
  const normalized = normalizePhone(phone);
  if (normalized) {
    window.location.href = `tel:${normalized}`;
  }
}

function openZalo(phone?: string) {
  const url = getZaloUrl(phone);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function formatDateTime(value?: string) {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'Chưa cập nhật';
}

function formatRelativeDate(value?: string) {
  if (!value) return '';
  const date = dayjs(value);
  const now = dayjs();
  if (date.isSame(now, 'day')) return date.format('HH:mm');
  if (date.isSame(now.subtract(1, 'day'), 'day')) return 'Hôm qua';
  return date.format('DD/MM');
}

async function scrollMessagesToBottom() {
  await nextTick();
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
  }
}

watch(() => [activeSession.value?.id, activeMessages.value.length], scrollMessagesToBottom);

onMounted(refreshAll);
</script>

<style scoped lang="scss">
.customer-care-page {
  --care-accent: #e84a4a;
  --care-accent-soft: color-mix(in srgb, var(--care-accent) 10%, transparent);
  --care-page-bg: #f8fafc;
  --care-border: #e2e8f0;
  --care-surface: #fff;
  --care-surface-soft: #f1f5f9;
  --care-text: #0f172a;
  --care-muted: #64748b;
  --care-shadow: 0 16px 44px rgb(15 23 42 / 4%);

  color: var(--care-text);
  background: var(--care-page-bg);

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper),
  :deep(.el-textarea__inner) {
    background: var(--care-surface-soft);
    box-shadow: 0 0 0 1px var(--care-border) inset;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item),
  :deep(.el-textarea__inner) {
    color: var(--care-text);
  }
}

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;

  h1 {
    margin: 8px 0 6px;
    font-size: clamp(1.55rem, 2.4vw, 2.25rem);
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  p {
    max-width: 680px;
    margin: 0;
    color: var(--care-muted);
    font-size: 0.875rem;
    line-height: 1.6;
  }
}

.page-heading__actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--care-accent);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.eyebrow__dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  background: var(--care-accent);
  box-shadow: 0 0 0 5px var(--care-accent-soft);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.metric-card {
  display: flex;
  min-height: 126px;
  flex-direction: column;
  justify-content: space-between;
  padding: 18px 20px;
  overflow: hidden;
  border: 1px solid var(--care-border);
  border-radius: 18px;
  background: var(--care-surface);

  strong {
    font-size: 1.75rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
  }

  small {
    color: var(--care-muted);
    font-size: 0.72rem;
  }
}

.metric-card--accent {
  position: relative;
  border-color: color-mix(in srgb, var(--care-accent) 30%, var(--care-border));
  background:
    radial-gradient(circle at 100% 0%, rgb(255 255 255 / 20%), transparent 45%), var(--care-accent);
  color: white;
  box-shadow: 0 14px 32px color-mix(in srgb, var(--care-accent) 22%, transparent);

  small,
  .metric-card__label {
    color: rgb(255 255 255 / 76%);
  }
}

.metric-card__label {
  color: var(--care-muted);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.workspace-tabs {
  display: flex;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 12px;
  padding: 5px;
  overflow-x: auto;
  border: 1px solid var(--care-border);
  border-radius: 14px;
  background: var(--care-surface);

  button {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 14px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--care-muted);
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
    transition:
      color 180ms ease,
      background-color 180ms ease,
      transform 180ms ease;

    &:active {
      transform: scale(0.98);
    }

    span {
      min-width: 24px;
      padding: 2px 6px;
      border-radius: 7px;
      background: var(--care-surface-soft);
      font-size: 0.68rem;
      font-variant-numeric: tabular-nums;
      text-align: center;
    }

    &.is-active {
      background: var(--care-text);
      color: var(--care-surface);

      span {
        background: rgb(255 255 255 / 14%);
      }
    }
  }
}

.workspace-panel,
.support-workspace {
  overflow: hidden;
  border: 1px solid var(--care-border);
  border-radius: 20px;
  background: var(--care-surface);
  box-shadow: var(--care-shadow);
}

.filter-bar {
  display: flex;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid var(--care-border);
}

.filter-bar__search {
  max-width: 520px;
}

.filter-bar__select {
  width: 220px;
}

.customer-table {
  --el-table-bg-color: var(--care-surface);
  --el-table-border-color: var(--care-border);
  --el-table-header-bg-color: var(--care-surface-soft);
  --el-table-header-text-color: var(--care-muted);
  --el-table-row-hover-bg-color: color-mix(in srgb, var(--care-accent) 3%, var(--care-surface));
  --el-table-text-color: var(--care-text);
  --el-table-tr-bg-color: var(--care-surface);

  width: 100%;

  :deep(.el-table__header th) {
    height: 48px;
    background: var(--care-surface-soft);
    color: var(--care-muted);
    font-size: 0.67rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  :deep(.el-table__row td) {
    padding: 12px 0;
  }

  :deep(.el-table__body tr:hover > td.el-table__cell) {
    background: var(--el-table-row-hover-bg-color);
  }

  :deep(.el-table__inner-wrapper::before) {
    background: var(--care-border);
  }
}

.customer-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.customer-avatar {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 13px;
  background: var(--care-surface-soft);
  color: var(--care-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.customer-avatar--online {
  position: relative;
  background: var(--care-accent-soft);
  color: var(--care-accent);

  &::after {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 10px;
    height: 10px;
    border: 2px solid var(--care-surface);
    border-radius: 50%;
    background: #22c55e;
    content: '';
  }
}

.customer-cell__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;

  strong {
    overflow: hidden;
    color: var(--care-text);
    font-size: 0.84rem;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    overflow: hidden;
    color: var(--care-muted);
    font-size: 0.72rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.classification-select {
  width: 160px;
}

.table-primary,
.table-secondary {
  display: block;
  overflow: hidden;
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-primary {
  color: var(--care-text);
  font-weight: 650;
}

.table-secondary {
  color: var(--care-muted);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}

.icon-action {
  display: inline-grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid var(--care-border);
  border-radius: 9px;
  background: var(--care-surface);
  color: var(--care-muted);
  cursor: pointer;
  transition:
    border-color 180ms ease,
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;

  &:hover {
    border-color: color-mix(in srgb, var(--care-accent) 40%, var(--care-border));
    background: var(--care-accent-soft);
    color: var(--care-accent);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--care-accent);
    outline-offset: 2px;
  }

  &.is-disabled {
    pointer-events: none;
    opacity: 0.35;
  }
}

.icon-action--primary {
  border-color: var(--care-accent);
  background: var(--care-accent);
  color: white;

  &:hover {
    background: color-mix(in srgb, var(--care-accent) 88%, black);
    color: white;
  }
}

.empty-state {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 7px;
  color: var(--care-muted);
  text-align: center;

  > :first-child {
    margin-bottom: 4px;
    font-size: 2rem;
    opacity: 0.6;
  }

  strong {
    color: var(--care-text);
    font-size: 0.86rem;
  }

  span {
    max-width: 360px;
    font-size: 0.74rem;
  }
}

.empty-state--compact {
  min-height: 220px;
  padding: 20px;
}

.support-workspace {
  display: grid;
  min-height: 650px;
  grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
}

.session-sidebar {
  display: flex;
  min-width: 0;
  flex-direction: column;
  border-right: 1px solid var(--care-border);
}

.session-sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--care-border);

  > div {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  span {
    color: var(--care-muted);
    font-size: 0.66rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    font-size: 1rem;
  }
}

.session-sidebar__filters {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--care-border);
}

.session-list {
  min-height: 420px;
  flex: 1;
  overflow-y: auto;
}

.session-item {
  position: relative;
  display: flex;
  width: 100%;
  gap: 11px;
  padding: 14px 16px;
  border: 0;
  border-bottom: 1px solid var(--care-border);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 180ms ease;

  &:hover {
    background: var(--care-surface-soft);
  }

  &.is-active {
    background: var(--care-accent-soft);

    &::before {
      position: absolute;
      top: 12px;
      bottom: 12px;
      left: 0;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--care-accent);
      content: '';
    }
  }
}

.session-item__avatar {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 12px;
  background: var(--care-surface-soft);
  color: var(--care-muted);
  font-size: 0.68rem;
  font-weight: 800;
}

.session-item__body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;
}

.session-item__topline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;

  strong {
    overflow: hidden;
    font-size: 0.78rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    flex-shrink: 0;
    color: var(--care-muted);
    font-size: 0.62rem;
  }
}

.session-item__subject,
.session-item__preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-item__subject {
  color: var(--care-text);
  font-size: 0.7rem;
  font-weight: 650;
}

.session-item__preview {
  color: var(--care-muted);
  font-size: 0.67rem;
}

.status-dot {
  position: absolute;
  right: 10px;
  bottom: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--care-muted);
}

.status-dot--new {
  background: #f59e0b;
}

.status-dot--inprogress {
  background: #3b82f6;
}

.status-dot--closed {
  background: #22c55e;
}

.chat-panel {
  display: grid;
  min-width: 0;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
}

.chat-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 72px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--care-border);
}

.chat-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.el-select) {
    width: 135px;
  }
}

.conversation-context {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  border-bottom: 1px solid var(--care-border);
  background: var(--care-surface-soft);

  span {
    padding: 4px 7px;
    border-radius: 6px;
    background: var(--care-surface);
    color: var(--care-accent);
    font-size: 0.62rem;
    font-weight: 800;
  }

  strong {
    overflow: hidden;
    font-size: 0.72rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--care-muted);
    font-size: 0.62rem;
  }
}

.message-list {
  min-height: 360px;
  max-height: 470px;
  padding: 22px;
  overflow-y: auto;
  background:
    radial-gradient(circle at 8% 10%, var(--care-accent-soft), transparent 24%), var(--care-surface);
}

.message-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}

.message-row--outgoing {
  justify-content: flex-end;

  .message-bubble {
    border-color: transparent;
    background: var(--care-accent);
    color: white;

    time,
    .message-bubble__sender {
      color: rgb(255 255 255 / 72%);
    }
  }
}

.message-bubble {
  max-width: min(72%, 620px);
  padding: 11px 13px 9px;
  border: 1px solid var(--care-border);
  border-radius: 5px 16px 16px;
  background: var(--care-surface);
  box-shadow: 0 8px 20px rgb(15 23 42 / 5%);

  p {
    margin: 4px 0 6px;
    font-size: 0.79rem;
    line-height: 1.55;
    white-space: pre-wrap;
  }

  time,
  .message-bubble__sender {
    display: block;
    color: var(--care-muted);
    font-size: 0.6rem;
  }

  .message-bubble__sender {
    font-weight: 800;
  }

  time {
    text-align: right;
  }
}

.composer {
  padding: 14px 16px;
  border-top: 1px solid var(--care-border);
  background: var(--care-surface);
}

.composer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 9px;

  span {
    color: var(--care-muted);
    font-size: 0.65rem;
  }
}

.chat-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: var(--care-muted);
  text-align: center;
}

.chat-placeholder__icon {
  display: grid;
  width: 64px;
  height: 64px;
  margin-bottom: 4px;
  place-items: center;
  border-radius: 22px;
  background: var(--care-accent-soft);
  color: var(--care-accent);
  font-size: 1.6rem;
  transform: rotate(-4deg);
}

.chat-placeholder strong {
  color: var(--care-text);
  font-size: 0.9rem;
}

.chat-placeholder span {
  max-width: 340px;
  font-size: 0.75rem;
}

.dialog-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 14px;
}

.dialog-form-grid__wide {
  grid-column: 1 / -1;
}

.dialog-customer-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 14px;
  background: var(--care-surface-soft);

  > div:last-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  strong {
    font-size: 0.84rem;
  }

  span {
    color: var(--care-muted);
    font-size: 0.72rem;
  }
}

:global(.customer-care-dialog) {
  --care-border: #e2e8f0;
  --care-surface: #fff;
  --care-surface-soft: #f1f5f9;
  --care-text: #0f172a;
  --care-muted: #64748b;

  color: var(--care-text);
  background: var(--care-surface);
  border: 1px solid var(--care-border);
}

:global(html.dark .customer-care-page),
:global(html.dark .customer-care-dialog) {
  --care-page-bg: #05070b;
  --care-border: rgb(255 255 255 / 12%);
  --care-surface: #10141c;
  --care-surface-soft: #111827;
  --care-text: #f8fafc;
  --care-muted: #94a3b8;
  --care-shadow: 0 18px 45px rgb(0 0 0 / 28%);
}

@media (width <= 1023px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .support-workspace {
    min-height: auto;
    grid-template-columns: minmax(240px, 300px) minmax(0, 1fr);
  }
}

@media (width <= 767px) {
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .page-heading__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .metric-card {
    min-height: 110px;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar__search,
  .filter-bar__select {
    width: 100%;
    max-width: none;
  }

  .support-workspace {
    display: flex;
    flex-direction: column;
  }

  .session-sidebar {
    max-height: 410px;
    border-right: 0;
    border-bottom: 1px solid var(--care-border);
  }

  .chat-panel {
    min-height: 620px;
  }

  .chat-panel__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .chat-panel__actions {
    width: 100%;

    :deep(.el-select) {
      flex: 1;
      width: auto;
    }
  }

  .conversation-context {
    grid-template-columns: 1fr auto;

    span {
      display: none;
    }
  }

  .message-bubble {
    max-width: 88%;
  }

  .composer__footer {
    align-items: stretch;
    flex-direction: column;

    :deep(.el-button) {
      width: 100%;
    }
  }

  .dialog-form-grid {
    grid-template-columns: 1fr;
  }

  .dialog-form-grid__wide {
    grid-column: auto;
  }
}
</style>
