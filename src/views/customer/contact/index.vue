<template>
  <div class="contact-page min-h-full bg-[#F8FAFC] font-inter text-[#0F172A] pb-6">
    <div class="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="size-11 rounded-xl bg-[#001529] flex-cc text-white shadow-lg shrink-0">
            <ArtSvgIcon icon="ri:message-2-line" class="text-2xl" />
          </div>
          <div>
            <h1 class="m-0 text-xl font-black tracking-tight text-slate-900 leading-none">{{ $t("contact.title") }}</h1>
            <p class="m-0 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5">{{ $t("contact.subtitle") }}</p>
          </div>
        </div>
        <div v-if="contactStore.unreadBadge > 0" class="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
          <span class="text-[9px] font-black text-red-400 uppercase tracking-tighter">{{ $t("contact.unreadBadge") }}:</span>
          <span class="text-sm font-black text-red-600 leading-none">{{ contactStore.unreadBadge }}</span>
        </div>
      </div>
    </div>

    <div class="p-4">
      <ElTabs v-model="activeTab" @tab-change="onTabChange" class="contact-tabs">
        <ElTabPane :label="$t('contact.tabSupport')" name="support">
          <div class="split-layout">
            <div class="list-panel">
              <div class="list-header">
                <div class="relative flex-1">
                  <ArtSvgIcon icon="ri:search-2-line" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <ElInput v-model="searchQuery" :placeholder="$t('contact.searchPlaceholder')" class="search-input" clearable size="small" @input="onSearch" />
                </div>
                <ElSelect v-model="statusFilter" :placeholder="$t('contact.allStatus')" class="status-select" clearable size="small" @change="onFilterChange">
                  <ElOption v-for="s in SupportStatuses" :key="s" :label="$t('contact.supportStatus.' + s)" :value="s" />
                </ElSelect>
                <ElButton type="primary" size="small" class="create-btn" @click="openCreateDialog">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />{{ $t("contact.createDialog.submit") }}
                </ElButton>
              </div>
              <ElTable :data="tableData" :loading="contactStore.loading" class="contact-table" :header-cell-style="tableHeaderStyle" @row-click="selectItem">
                <ElTableColumn prop="id" :label="$t('contact.columnId')" width="70" />
                <ElTableColumn prop="subject" :label="$t('contact.columnSubject')" min-width="150" show-overflow-tooltip />
                <ElTableColumn label="Danh mục" width="130">
                  <template #default="{ row }">
                    <span class="badge" :class="categoryStyle(row.category)">{{ $t('contact.category.' + row.category) }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn :label="$t('contact.columnStatus')" width="110">
                  <template #default="{ row }">
                    <span class="badge" :class="statusStyle(row.status)">{{ $t('contact.supportStatus.' + row.status) }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createdAt" :label="$t('contact.columnCreatedAt')" width="100" />
              </ElTable>
              <div class="pagination-bar">
                <span class="text-[11px] text-slate-400 font-bold">{{ $t("contact.totalCount", { count: contactStore.totalCount }) }}</span>
                <ElPagination :current-page="contactStore.page" :page-sizes="[10,20,50]" :page-size="contactStore.pageSize" :total="contactStore.totalCount" layout="total, sizes, prev, pager, next" small @current-change="contactStore.changePage" @size-change="contactStore.changePageSize" />
              </div>
            </div>
            <div class="detail-panel">
              <div v-if="!contactStore.hasActive" class="empty-state">
                <ArtSvgIcon icon="ri:file-list-3-line" class="text-5xl text-slate-200 mb-3" />
                <p class="text-sm text-slate-400 font-bold">{{ $t("contact.noDetail") }}</p>
              </div>
              <div v-else class="detail-content">
                <div class="detail-header">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{{ activeItem?.id }}</span>
                      <span class="badge" :class="statusStyle(activeItem!.status)">{{ $t('contact.supportStatus.' + activeItem!.status) }}</span>
                    </div>
                    <ElButton size="small" type="danger" text @click="closeDetail">Đóng</ElButton>
                  </div>
                  <h2 class="text-base font-black text-slate-800 mt-2">{{ activeItemSubject }}</h2>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span class="text-blue-600 font-black">{{ activeItemEmail }}</span>
                    <span class="text-slate-300">|</span>
                    <span>{{ activeItemPhone }}</span>
                    <span class="text-slate-300" v-if="activeItemOrderCode">|</span>
                    <span v-if="activeItemOrderCode">{{ activeItemOrderCode }}</span>
                  </div>
                </div>
                <div class="section">
                  <h3 class="section-title">Nội dung</h3>
                  <div class="content-box"><p class="content-text">{{ activeItemContent }}</p></div>
                </div>
                <div class="section">
                  <h3 class="section-title">{{ $t("contact.actionNote") }}</h3>
                  <div class="note-box">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{{ $t("contact.noteDialog.title") }}</span>
                      <button class="text-indigo-500 hover:text-indigo-700 font-black text-[8px] uppercase" @click="openNoteDialog">{{ $t("contact.actionNote") }}</button>
                    </div>
                    <p class="note-text">{{ activeItemInternalNote || "Chưa có ghi chú..." }}</p>
                  </div>
                </div>
                <div class="actions-section">
                  <h3 class="section-title">{{ $t("contact.actionReply") }}</h3>
                  <ElInput v-model="replyDraft" type="textarea" :rows="3" :placeholder="$t('contact.replyDialog.contentPlaceholder')" class="reply-input" />
                  <div class="action-btns">
                    <ElButton type="primary" class="action-btn primary" @click="handleReply">
                      <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1" />{{ $t("contact.replyDialog.sendBtn") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Closed'" class="action-btn success" @click="handleStatus('Closed')">
                      <ArtSvgIcon icon="ri:check-double-line" class="mr-1" />{{ $t("contact.statusClosed") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'InProgress'" class="action-btn info" @click="handleStatus('InProgress')">
                      <ArtSvgIcon icon="ri:loader-4-line" class="mr-1" />{{ $t("contact.statusInProgress") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'New'" class="action-btn" @click="handleStatus('New')">
                      <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />{{ $t("contact.statusNew") }}
                    </ElButton>
                    <ElButton class="action-btn" @click="openAssignDialog">
                      <ArtSvgIcon icon="ri:user-settings-line" class="mr-1" />{{ $t("contact.actionAssign") }}
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>

        <ElTabPane :label="$t('contact.tabFeedback')" name="feedback">
          <div class="split-layout">
            <div class="list-panel">
              <div class="list-header">
                <div class="relative flex-1">
                  <ArtSvgIcon icon="ri:search-2-line" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <ElInput v-model="searchQuery" :placeholder="$t('contact.searchPlaceholder')" class="search-input" clearable size="small" @input="onSearch" />
                </div>
                <ElSelect v-model="statusFilter" :placeholder="$t('contact.allStatus')" class="status-select" clearable size="small" @change="onFilterChange">
                  <ElOption v-for="s in FeedbackStatuses" :key="s" :label="$t('contact.feedbackStatus.' + s)" :value="s" />
                </ElSelect>
                <ElButton type="primary" size="small" class="create-btn" @click="openCreateDialog">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />{{ $t("contact.createDialog.submit") }}
                </ElButton>
              </div>
              <ElTable :data="tableData" :loading="contactStore.loading" class="contact-table" :header-cell-style="tableHeaderStyle" @row-click="selectItem">
                <ElTableColumn :label="$t('contact.columnRating')" width="90">
                  <template #default="{ row }">
                    <span class="flex items-center gap-0.5">
                      <ArtSvgIcon v-for="n in (row as Contact.CustomerFeedback).rating" :key="n" icon="ri:star-fill" class="text-amber-400 text-xs" />
                    </span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="customerName" :label="$t('contact.columnCustomer')" min-width="120" />
                <ElTableColumn prop="feedbackArea" label="Khu vực" width="130" />
                <ElTableColumn prop="content" :label="$t('contact.columnContent')" min-width="150" show-overflow-tooltip />
                <ElTableColumn :label="$t('contact.columnStatus')" width="110">
                  <template #default="{ row }">
                    <span class="badge" :class="statusStyle(row.status)">{{ $t('contact.feedbackStatus.' + row.status) }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createdAt" :label="$t('contact.columnCreatedAt')" width="100" />
              </ElTable>
              <div class="pagination-bar">
                <span class="text-[11px] text-slate-400 font-bold">{{ $t("contact.totalCount", { count: contactStore.totalCount }) }}</span>
                <ElPagination :current-page="contactStore.page" :page-sizes="[10,20,50]" :page-size="contactStore.pageSize" :total="contactStore.totalCount" layout="total, sizes, prev, pager, next" small @current-change="contactStore.changePage" @size-change="contactStore.changePageSize" />
              </div>
            </div>
            <div class="detail-panel">
              <div v-if="!contactStore.hasActive" class="empty-state">
                <ArtSvgIcon icon="ri:file-list-3-line" class="text-5xl text-slate-200 mb-3" />
                <p class="text-sm text-slate-400 font-bold">{{ $t("contact.noDetail") }}</p>
              </div>
              <div v-else class="detail-content">
                <div class="detail-header">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{{ activeItem?.id }}</span>
                      <span class="badge" :class="statusStyle(activeItem!.status)">{{ $t('contact.feedbackStatus.' + activeItem!.status) }}</span>
                    </div>
                    <ElButton size="small" type="danger" text @click="closeDetail">Đóng</ElButton>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <span class="text-sm font-black text-slate-800">{{ activeItemCustomerName }}</span>
                    <span class="text-slate-300">|</span>
                    <span class="text-xs text-slate-500">{{ activeItemFeedbackArea }}</span>
                  </div>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span class="text-blue-600 font-black">{{ activeItemEmail }}</span>
                    <span class="text-slate-300">|</span>
                    <span>{{ activeItemPhone }}</span>
                  </div>
                </div>
                <div class="section">
                  <h3 class="section-title">{{ $t("contact.columnContent") }}</h3>
                  <div class="content-box"><p class="content-text">{{ activeItemContent }}</p></div>
                </div>
                <div class="section">
                  <h3 class="section-title">{{ $t("contact.actionNote") }}</h3>
                  <div class="note-box">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{{ $t("contact.noteDialog.title") }}</span>
                      <button class="text-indigo-500 hover:text-indigo-700 font-black text-[8px] uppercase" @click="openNoteDialog">{{ $t("contact.actionNote") }}</button>
                    </div>
                    <p class="note-text">{{ activeItemInternalNote || "Chưa có ghi chú..." }}</p>
                  </div>
                </div>
                <div class="actions-section">
                  <h3 class="section-title">{{ $t("contact.actionReply") }}</h3>
                  <ElInput v-model="replyDraft" type="textarea" :rows="3" :placeholder="$t('contact.replyDialog.contentPlaceholder')" class="reply-input" />
                  <div class="action-btns">
                    <ElButton type="primary" class="action-btn primary" @click="handleReply">
                      <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1" />{{ $t("contact.replyDialog.sendBtn") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Resolved'" class="action-btn success" @click="handleStatus('Resolved')">
                      <ArtSvgIcon icon="ri:check-double-line" class="mr-1" />{{ $t("contact.statusResolved") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Read'" class="action-btn info" @click="handleStatus('Read')">
                      <ArtSvgIcon icon="ri:eye-line" class="mr-1" />{{ $t("contact.statusRead") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Pending'" class="action-btn" @click="handleStatus('Pending')">
                      <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />{{ $t("contact.statusPending") }}
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>

        <ElTabPane :label="$t('contact.tabCandidate')" name="candidate">
          <div class="split-layout">
            <div class="list-panel">
              <div class="list-header">
                <div class="relative flex-1">
                  <ArtSvgIcon icon="ri:search-2-line" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <ElInput v-model="searchQuery" :placeholder="$t('contact.searchPlaceholder')" class="search-input" clearable size="small" @input="onSearch" />
                </div>
                <ElSelect v-model="statusFilter" :placeholder="$t('contact.allStatus')" class="status-select" clearable size="small" @change="onFilterChange">
                  <ElOption v-for="s in CandidateStatuses" :key="s" :label="$t('contact.candidateStatus.' + s)" :value="s" />
                </ElSelect>
                <ElButton type="primary" size="small" class="create-btn" @click="openCreateDialog">
                  <ArtSvgIcon icon="ri:add-line" class="mr-1" />{{ $t("contact.createDialog.submit") }}
                </ElButton>
              </div>
              <ElTable :data="tableData" :loading="contactStore.loading" class="contact-table" :header-cell-style="tableHeaderStyle" @row-click="selectItem">
                <ElTableColumn prop="fullName" :label="$t('contact.columnCustomer')" min-width="120" />
                <ElTableColumn prop="appliedPosition" :label="$t('contact.columnPosition')" width="140" />
                <ElTableColumn label="CV" width="80">
                  <template #default="{ row }">
                    <ElButton v-if="(row as Contact.JobApplication).cvFileUrl" type="primary" link size="small" @click.stop="openCvViewer(row)">
                      <ArtSvgIcon icon="ri:file-pdf-2-fill" class="text-red-500 mr-1" />CV
                    </ElButton>
                    <span v-else class="text-[11px] text-slate-300">-</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn :label="$t('contact.columnStatus')" width="110">
                  <template #default="{ row }">
                    <span class="badge" :class="statusStyle(row.status)">{{ $t('contact.candidateStatus.' + row.status) }}</span>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="createdAt" :label="$t('contact.columnCreatedAt')" width="100" />
              </ElTable>
              <div class="pagination-bar">
                <span class="text-[11px] text-slate-400 font-bold">{{ $t("contact.totalCount", { count: contactStore.totalCount }) }}</span>
                <ElPagination :current-page="contactStore.page" :page-sizes="[10,20,50]" :page-size="contactStore.pageSize" :total="contactStore.totalCount" layout="total, sizes, prev, pager, next" small @current-change="contactStore.changePage" @size-change="contactStore.changePageSize" />
              </div>
            </div>
            <div class="detail-panel">
              <div v-if="!contactStore.hasActive" class="empty-state">
                <ArtSvgIcon icon="ri:file-list-3-line" class="text-5xl text-slate-200 mb-3" />
                <p class="text-sm text-slate-400 font-bold">{{ $t("contact.noDetail") }}</p>
              </div>
              <div v-else class="detail-content">
                <div class="detail-header">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{{ activeItem?.id }}</span>
                      <span class="badge" :class="statusStyle(activeItem!.status)">{{ $t('contact.candidateStatus.' + activeItem!.status) }}</span>
                    </div>
                    <ElButton size="small" type="danger" text @click="closeDetail">Đóng</ElButton>
                  </div>
                  <h2 class="text-base font-black text-slate-800 mt-2">{{ activeItemFullName }}</h2>
                  <div class="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span class="text-blue-600 font-black">{{ activeItemEmail }}</span>
                    <span class="text-slate-300">|</span>
                    <span>{{ activeItemAppliedPosition }}</span>
                  </div>
                </div>
                <div class="section">
                  <h3 class="section-title">Thư xin việc</h3>
                  <div class="content-box"><p class="content-text">{{ activeItemCoverLetter || "Không có thư xin việc." }}</p></div>
                </div>
                <div class="section">
                  <h3 class="section-title">{{ $t("contact.actionNote") }}</h3>
                  <div class="note-box">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{{ $t("contact.noteDialog.title") }}</span>
                      <button class="text-indigo-500 hover:text-indigo-700 font-black text-[8px] uppercase" @click="openNoteDialog">{{ $t("contact.actionNote") }}</button>
                    </div>
                    <p class="note-text">{{ activeItemInternalNote || "Chưa có ghi chú..." }}</p>
                  </div>
                </div>
                <div class="actions-section">
                  <h3 class="section-title">{{ $t("contact.actionReply") }}</h3>
                  <ElInput v-model="replyDraft" type="textarea" :rows="3" :placeholder="$t('contact.replyDialog.contentPlaceholder')" class="reply-input" />
                  <div class="action-btns">
                    <ElButton type="primary" class="action-btn primary" @click="handleReply">
                      <ArtSvgIcon icon="ri:send-plane-fill" class="mr-1" />{{ $t("contact.replyDialog.sendBtn") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Offer'" class="action-btn success" @click="handleStatus('Offer')">
                      <ArtSvgIcon icon="ri:mail-send-line" class="mr-1" />{{ $t("contact.statusOffer") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Interview'" class="action-btn info" @click="handleStatus('Interview')">
                      <ArtSvgIcon icon="ri:mic-line" class="mr-1" />{{ $t("contact.statusInterview") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'Rejected'" class="action-btn danger-text" @click="handleStatus('Rejected')">
                      <ArtSvgIcon icon="ri:close-circle-line" class="mr-1" />{{ $t("contact.statusRejected") }}
                    </ElButton>
                    <ElButton v-if="activeItem && activeItem.status !== 'New'" class="action-btn" @click="handleStatus('New')">
                      <ArtSvgIcon icon="ri:arrow-go-back-line" class="mr-1" />{{ $t("contact.statusNew") }}
                    </ElButton>
                    <ElButton v-if="hasCvUrl" class="action-btn" @click="openCvViewer(activeItem!)">
                      <ArtSvgIcon icon="ri:file-pdf-2-line" class="mr-1" />{{ $t("contact.actionViewCv") }}
                    </ElButton>
                    <ElButton class="action-btn" @click="openAssignDialog">
                      <ArtSvgIcon icon="ri:user-settings-line" class="mr-1" />{{ $t("contact.actionAssign") }}
                    </ElButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- NOTE DIALOG -->
    <ElDialog v-model="noteDialogVisible" :title="$t('contact.noteDialog.title')" width="420px">
      <ElInput v-model="noteDraft" type="textarea" :rows="4" :placeholder="$t('contact.noteDialog.placeholder')" class="compact-textarea" />
      <template #footer>
        <ElButton @click="saveNote">{{ $t("contact.noteDialog.saveBtn") }}</ElButton>
      </template>
    </ElDialog>

    <!-- CV VIEWER DIALOG -->
    <ElDialog v-model="cvDialogVisible" :title="$t('contact.cvViewer.title')" width="720px" top="5vh">
      <div v-if="currentCvUrl" class="cv-preview">
        <iframe :src="currentCvUrl" class="cv-iframe" frameborder="0" />
      </div>
      <div v-else class="flex flex-col items-center justify-center py-12 text-slate-400">
        <ArtSvgIcon icon="ri:file-pdf-2-line" class="text-5xl mb-2" />
        <p class="text-sm font-bold">{{ $t("contact.cvViewer.noFile") }}</p>
      </div>
      <template #footer>
        <ElButton v-if="currentCvUrl" type="primary" @click="downloadCv">
          <ArtSvgIcon icon="ri:download-2-line" class="mr-1" />{{ $t("contact.cvViewer.download") }}
        </ElButton>
      </template>
    </ElDialog>

    <!-- ASSIGN DIALOG -->
    <ElDialog v-model="assignDialogVisible" :title="$t('contact.assignDialog.title')" width="400px">
      <ElSelect v-model="assignedUser" :placeholder="$t('contact.assignDialog.selectUser')" class="w-full" filterable clearable>
        <ElOption v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
      </ElSelect>
      <template #footer>
        <ElButton @click="assignDialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" @click="handleAssign">Xác nhận</ElButton>
      </template>
    </ElDialog>

    <!-- CREATE DIALOG -->
    <ElDialog v-model="createDialogVisible" :title="createDialogTitle" width="580px">
      <ElForm :model="createForm" label-position="top">
        <template v-if="activeTab === 'support'">
          <ElFormItem :label="$t('contact.createDialog.subject')">
            <ElInput v-model="createForm.subject" class="compact-input" />
          </ElFormItem>
          <ElFormItem :label="$t('contact.createDialog.category')">
            <ElSelect v-model="createForm.category" class="w-full">
              <ElOption v-for="c in supportCategories" :key="c" :label="$t('contact.category.' + c)" :value="c" />
            </ElSelect>
          </ElFormItem>
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem :label="$t('contact.createDialog.email')">
                <ElInput v-model="createForm.email" class="compact-input" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem :label="$t('contact.createDialog.orderCode')">
                <ElInput v-model="createForm.orderCode" class="compact-input" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElFormItem :label="$t('contact.createDialog.content')">
            <ElInput v-model="createForm.content" type="textarea" :rows="4" class="compact-textarea" />
          </ElFormItem>
        </template>
        <template v-if="activeTab === 'feedback'">
          <ElFormItem :label="$t('contact.createDialog.customerName')">
            <ElInput v-model="createForm.customerName" class="compact-input" />
          </ElFormItem>
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem :label="$t('contact.createDialog.phoneNumber')">
                <ElInput v-model="createForm.phoneNumber" class="compact-input" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem :label="$t('contact.createDialog.rating')">
                <ElRate v-model="createForm.rating" :max="5" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElFormItem :label="$t('contact.createDialog.feedbackArea')">
            <ElInput v-model="createForm.feedbackArea" class="compact-input" />
          </ElFormItem>
          <ElFormItem :label="$t('contact.createDialog.content')">
            <ElInput v-model="createForm.content" type="textarea" :rows="4" class="compact-textarea" />
          </ElFormItem>
        </template>
        <template v-if="activeTab === 'candidate'">
          <ElFormItem :label="$t('contact.createDialog.fullName')">
            <ElInput v-model="createForm.fullName" class="compact-input" />
          </ElFormItem>
          <ElRow :gutter="16">
            <ElCol :span="12">
              <ElFormItem :label="$t('contact.createDialog.email')">
                <ElInput v-model="createForm.email" class="compact-input" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem :label="$t('contact.createDialog.phoneNumber')">
                <ElInput v-model="createForm.phoneNumber" class="compact-input" />
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElFormItem :label="$t('contact.createDialog.appliedPosition')">
            <ElInput v-model="createForm.appliedPosition" class="compact-input" />
          </ElFormItem>
          <ElFormItem :label="$t('contact.createDialog.cvFile')">
            <ElInput v-model="createForm.cvFileUrl" class="compact-input" placeholder="URL file CV" />
          </ElFormItem>
          <ElFormItem :label="$t('contact.createDialog.coverLetter')">
            <ElInput v-model="createForm.coverLetter" type="textarea" :rows="3" class="compact-textarea" />
          </ElFormItem>
        </template>
      </ElForm>
      <template #footer>
        <ElButton @click="createDialogVisible = false">Hủy</ElButton>
        <ElButton type="primary" @click="handleCreate">{{ $t("contact.createDialog.submit") }}</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useContactStore } from '@/application/store/contact'
import { ContactApi, SupportStatuses, FeedbackStatuses, CandidateStatuses } from '@/infrastructure/api/contact.api'
import type { Contact } from '@/types'

defineOptions({ name: 'CustomerContact' })
const { t } = useI18n()
const contactStore = useContactStore()

const activeTab = ref('support')
const searchQuery = ref('')
const statusFilter = ref('')
const replyDraft = ref('')
const noteDraft = ref('')
const noteDialogVisible = ref(false)
const cvDialogVisible = ref(false)
const currentCvUrl = ref('')
const assignDialogVisible = ref(false)
const assignedUser = ref('')
const createDialogVisible = ref(false)

const userOptions = ref<{ id: string; name: string }[]>([
  { id: '1', name: 'Nguyễn Văn A' },
  { id: '2', name: 'Trần Thị B' },
  { id: '3', name: 'Lê Văn C' },
])
const supportCategories = ['Quality', 'Service', 'Rating', 'General', 'Sales', 'AfterSales', 'Other'] as const

const createForm = ref({
  subject: '', category: 'General', email: '', orderCode: '', content: '',
  rating: 5, customerName: '', phoneNumber: '', feedbackArea: '',
  fullName: '', appliedPosition: '', cvFileUrl: '', coverLetter: '',
})

const tableHeaderStyle = { background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }

onMounted(() => { contactStore.fetchList() })

watch(activeTab, () => {
  searchQuery.value = ''
  statusFilter.value = ''
  contactStore.setFilter(activeTab.value, statusFilter.value)
  contactStore.fetchList()
})

const onTabChange = () => { contactStore.clearActive(); replyDraft.value = '' }
const onSearch = () => { contactStore.fetchList() }
const onFilterChange = () => { contactStore.setFilter(activeTab.value, statusFilter.value); contactStore.fetchList() }
const selectItem = (row: Contact.ContactItem) => { contactStore.selectItem(row); replyDraft.value = '' }
const closeDetail = () => { contactStore.clearActive(); replyDraft.value = '' }

const categoryStyle = (cat: string) => {
  const m: Record<string, string> = {
    Quality: 'bg-red-600 text-white', Service: 'bg-orange-500 text-white', Rating: 'bg-blue-600 text-white',
    General: 'bg-slate-500 text-white', Sales: 'bg-emerald-600 text-white', AfterSales: 'bg-amber-500 text-white', Other: 'bg-gray-400 text-white',
  }
  return m[cat] || 'bg-slate-400 text-white'
}
const statusStyle = (status: string) => {
  const m: Record<string, string> = {
    New: 'bg-red-50 text-red-600 border-red-100', Pending: 'bg-red-50 text-red-600 border-red-100',
    InProgress: 'bg-blue-50 text-blue-600 border-blue-200', Interview: 'bg-blue-50 text-blue-600 border-blue-200',
    Read: 'bg-amber-50 text-amber-600 border-amber-100',
    Closed: 'bg-slate-100 text-slate-600 border-slate-200', Resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Offer: 'bg-emerald-50 text-emerald-600 border-emerald-100', Rejected: 'bg-red-50 text-red-600 border-red-100',
  }
  return m[status] || 'bg-slate-100 text-slate-600 border-slate-200'
}

const tableData = computed(() => contactStore.records)
const activeItem = computed(() => contactStore.activeItem as any)
const activeItemSubject = computed(() => (activeItem.value as Contact.SupportRequest)?.subject ?? '')
const activeItemEmail = computed(() => activeItem.value?.contact?.email ?? (activeItem.value as any)?.email ?? '')
const activeItemPhone = computed(() => activeItem.value?.contact?.phoneNumber ?? (activeItem.value as any)?.phoneNumber ?? '')
const activeItemContent = computed(() => activeItem.value?.contact?.content ?? (activeItem.value as any)?.content ?? '')
const activeItemInternalNote = computed(() => (activeItem.value as any)?.internalNote ?? '')
const activeItemOrderCode = computed(() => (activeItem.value as Contact.SupportRequest)?.orderCode ?? '')
const activeItemCustomerName = computed(() => (activeItem.value as Contact.CustomerFeedback)?.customerName ?? '')
const activeItemFeedbackArea = computed(() => (activeItem.value as Contact.CustomerFeedback)?.feedbackArea ?? '')
const activeItemFullName = computed(() => (activeItem.value as Contact.JobApplication)?.fullName ?? '')
const activeItemAppliedPosition = computed(() => (activeItem.value as Contact.JobApplication)?.appliedPosition ?? '')
const activeItemCoverLetter = computed(() => (activeItem.value as Contact.JobApplication)?.coverLetter ?? '')
const hasCvUrl = computed(() => !!(activeItem.value as Contact.JobApplication)?.cvFileUrl)
const createDialogTitle = computed(() => {
  if (activeTab.value === 'support') return t('contact.createDialog.titleSupport')
  if (activeTab.value === 'feedback') return t('contact.createDialog.titleFeedback')
  return t('contact.createDialog.titleCandidate')
})

const handleReply = async () => {
  if (!replyDraft.value.trim() || !contactStore.activeItem) return
  try { await contactStore.sendReply(contactStore.activeItem.id, replyDraft.value); replyDraft.value = '' }
  catch { /* handled */ }
}
const handleStatus = async (newStatus: string) => {
  if (!contactStore.activeItem) return
  await contactStore.updateStatus(contactStore.activeItem.id, activeTab.value, newStatus)
}
const openNoteDialog = () => { noteDraft.value = activeItemInternalNote.value; noteDialogVisible.value = true }
const saveNote = async () => {
  if (!contactStore.activeItem) return
  await contactStore.saveInternalNote(contactStore.activeItem.id, noteDraft.value)
  noteDialogVisible.value = false
}
const openCvViewer = (row: Contact.ContactItem) => { currentCvUrl.value = (row as Contact.JobApplication).cvFileUrl || ''; cvDialogVisible.value = true }
const downloadCv = () => { if (currentCvUrl.value) window.open(currentCvUrl.value, '_blank') }
const openAssignDialog = () => { assignDialogVisible.value = true }
const handleAssign = async () => {
  if (!assignedUser.value) { ElMessage.warning('Vui lòng chọn nhân viên'); return }
  assignDialogVisible.value = false
  ElMessage.success('Đã phân công xử lý')
}
const openCreateDialog = () => { createDialogVisible.value = true }
const handleCreate = async () => {
  try {
    if (activeTab.value === 'support') await ContactApi.createSupportRequest({ ...createForm.value } as any)
    else if (activeTab.value === 'feedback') await ContactApi.createFeedback({ ...createForm.value } as any)
    else await ContactApi.createJobApplication({ ...createForm.value } as any)
    createDialogVisible.value = false
    ElMessage.success('Đã tạo mới')
    contactStore.fetchList()
  } catch { /* handled */ }
}
</script>

<style lang="scss" scoped>
.contact-page {
  .compact-textarea :deep(.el-textarea__inner) {
    padding: 12px; font-size: 13px; background: #f8fafc;
    border: 1px solid #e2e8f0; border-radius: 12px;
    &:focus { background: white; border-color: #3b82f6; }
  }
  .compact-input :deep(.el-input__wrapper) { background: #f8fafc; border-radius: 10px; }
}

.contact-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
  .el-tabs__nav-wrap::after { display: none; }
  .el-tabs__item { font-size: 13px; font-weight: 700; color: #64748b; height: 40px; line-height: 40px;
    &.is-active { color: #001529; }
  }
  .el-tabs__active-bar { background: #001529; height: 3px; border-radius: 2px; }
}

.split-layout { display: flex; gap: 16px; min-height: calc(100vh - 220px); }
.list-panel {
  width: 40%; display: flex; flex-direction: column;
  background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;
}
.list-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #fafbfc;
}
.pagination-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-top: 1px solid #f1f5f9;
  :deep(.el-pagination) { justify-content: flex-end; padding: 0; }
}
.detail-panel {
  flex: 1; background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;
}
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; min-height: 300px;
}
.detail-content { display: flex; flex-direction: column; height: 100%; }
.detail-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; background: #fafbfc; }
.section { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
.section-title {
  font-size: 10px; font-weight: 800; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px 0;
}
.content-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; }
.content-text { margin: 0; font-size: 13px; color: #334155; line-height: 1.7; font-style: italic; }
.note-box { background: #eef2ff; border: 1px solid #e0e7ff; border-radius: 12px; padding: 12px 14px; }
.note-text { margin: 4px 0 0; font-size: 12px; color: #4338ca; font-weight: 600; line-height: 1.5; }
.actions-section { padding: 20px 24px; flex: 1; }
.reply-input :deep(.el-textarea__inner) { border-radius: 12px; font-size: 13px; background: #f8fafc; }
.action-btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.action-btn {
  border-radius: 10px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;
  &.primary { background: #001529; border-color: #001529; }
  &.success { background: #10b981; border-color: #10b981; color: white; }
  &.info { background: #3b82f6; border-color: #3b82f6; color: white; }
  &.danger-text { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
}
.badge { display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid; }
.create-btn { font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 10px; }
.contact-table { flex: 1; overflow: auto; :deep(.el-table__body tr) { cursor: pointer; } }
.search-input :deep(.el-input__wrapper) {
  height: 36px; background: #f1f5f9; border: 1px solid transparent; border-radius: 10px; box-shadow: none;
  &:hover { border-color: #cbd5e1; }
}
.status-select :deep(.el-input__wrapper) { height: 36px; background: #f1f5f9; border-radius: 10px; box-shadow: none; }
.cv-dialog :deep(.el-dialog__body) { padding: 0; }
.cv-preview { height: 70vh; background: #f1f5f9; }
.cv-iframe { width: 100%; height: 100%; border: none; }
</style>
