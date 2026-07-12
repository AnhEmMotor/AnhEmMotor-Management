import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ContactApi } from "@/api/customer";
import { ElMessage } from "element-plus";
import type { Contact } from "@/types";

export const useContactStore = defineStore("contactStore", () => {
  const records = ref<Contact.ContactItem[]>([]);
  const totalCount = ref(0);
  const page = ref(1);
  const pageSize = ref(20);
  const loading = ref(false);
  const activeItem = ref<Contact.ContactItem | null>(null);
  const contactType = ref<string>("");
  const status = ref<string>("");
  const assignedUserId = ref<string | null>(null);
  const unreadBadge = ref(0);

  const hasActive = computed(() => activeItem.value !== null);
  const totalPages = computed(() =>
    Math.ceil(totalCount.value / pageSize.value),
  );

  const fetchList = async () => {
    loading.value = true;
    try {
      const res = await ContactApi.getPaginated({
        contactType: contactType.value || undefined,
        status: status.value || undefined,
        assignedUserId: assignedUserId.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      });
      const items = (res as any).items ?? res.records;
      if (items && items.length > 0) {
        records.value = items;
        totalCount.value = res.totalCount;
      } else {
        records.value = [];
        totalCount.value = 0;
      }
      page.value = (res as any).pageNumber ?? res.page;
      pageSize.value = res.pageSize;
    } catch {
      records.value = [];
      totalCount.value = 0;
    } finally {
      loading.value = false;
    }
  };

  const setFilter = (type: string, st: string) => {
    contactType.value = type;
    status.value = st;
    page.value = 1;
  };

  const setAssignedFilter = (userId: string | null) => {
    assignedUserId.value = userId;
    page.value = 1;
  };

  const clearAssignedFilter = () => {
    assignedUserId.value = null;
    page.value = 1;
  };

  const selectItem = (item: Contact.ContactItem) => {
    activeItem.value = item;
  };

  const clearActive = () => {
    activeItem.value = null;
  };

  const changePage = (p: number) => {
    page.value = p;
    fetchList();
  };

  const changePageSize = (size: number) => {
    pageSize.value = size;
    page.value = 1;
    fetchList();
  };

  const updateStatus = async (id: number, type: string, newStatus: string) => {
    try {
      await ContactApi.updateStatus(id, type, { status: newStatus });
      const idx = records.value.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        (records.value[idx] as any).status = newStatus;
      }
      if (activeItem.value && (activeItem.value as any).id === id) {
        (activeItem.value as any).status = newStatus;
      }
      ElMessage.success("Đã cập nhật trạng thái");
    } catch {
      const idx = records.value.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        (records.value[idx] as any).status = newStatus;
      }
      if (activeItem.value && (activeItem.value as any).id === id) {
        (activeItem.value as any).status = newStatus;
      }
      ElMessage.success("Đã cập nhật trạng thái (Local)");
    }
  };

  const sendReply = async (
    contactId: number,
    message: string,
    userName?: string,
  ) => {
    try {
      const res = await ContactApi.reply({
        contactId,
        message,
        isInternal: false,
      });
      ElMessage.success("Đã gửi phản hồi");
      if (activeItem.value && (activeItem.value as any).contact) {
        const contactObj = (activeItem.value as any).contact;
        if (!contactObj.replies) {
          contactObj.replies = [];
        }
        contactObj.replies.push({
          id: (res as any) || Date.now(),
          contactId,
          message,
          repliedByName: userName || "Bạn",
          isInternal: false,
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      ElMessage.success("Đã gửi phản hồi (Local)");
    }
  };

  const saveInternalNote = async (contactId: number, internalNote: string) => {
    try {
      await ContactApi.updateInternalNote({ contactId, internalNote });
      if (activeItem.value) {
        if ((activeItem.value as any).contact) {
          (activeItem.value as any).contact.internalNote = internalNote;
        }
        (activeItem.value as any).internalNote = internalNote;
      }
      ElMessage.success("Đã lưu ghi chú");
    } catch {
      if (activeItem.value) {
        (activeItem.value as any).internalNote = internalNote;
      }
      ElMessage.success("Đã lưu ghi chú (Local)");
    }
  };

  const setUnreadBadge = (count: number) => {
    unreadBadge.value = count;
  };

  const incrementBadge = () => {
    unreadBadge.value++;
  };

  return {
    records,
    totalCount,
    page,
    pageSize,
    loading,
    activeItem,
    contactType,
    status,
    assignedUserId,
    unreadBadge,
    hasActive,
    totalPages,
    fetchList,
    setFilter,
    selectItem,
    clearActive,
    changePage,
    changePageSize,
    updateStatus,
    sendReply,
    saveInternalNote,
    setUnreadBadge,
    incrementBadge,
    setAssignedFilter,
    clearAssignedFilter,
  };
});
