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
  const errorMessage = ref("");
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
    errorMessage.value = "";
    try {
      const res = await ContactApi.getPaginated({
        contactType: contactType.value || undefined,
        status: status.value || undefined,
        assignedUserId: assignedUserId.value || undefined,
        page: page.value,
        pageSize: pageSize.value,
      });
      records.value = res.items;
      totalCount.value = res.totalCount;
      page.value = res.pageNumber;
      pageSize.value = res.pageSize;
      return true;
    } catch {
      records.value = [];
      totalCount.value = 0;
      errorMessage.value = "Không thể tải dữ liệu liên hệ từ máy chủ";
      ElMessage.error(errorMessage.value);
      return false;
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
      const idx = records.value.findIndex((record) => record.id === id);
      if (idx !== -1) {
        records.value[idx].status = newStatus;
      }
      if (activeItem.value?.id === id) {
        activeItem.value.status = newStatus;
      }
      ElMessage.success("Đã cập nhật trạng thái");
      return true;
    } catch {
      ElMessage.error("Không thể cập nhật trạng thái trên máy chủ");
      return false;
    }
  };

  const sendReply = async (
    contactId: number,
    message: string,
    contactItemId: number,
    contactType: string,
  ) => {
    try {
      await ContactApi.reply({
        contactId,
        contactItemId,
        contactType,
        message,
        markAsProcessed: true,
      });
      const refreshed = await fetchList();
      if (refreshed) {
        activeItem.value =
          records.value.find((record) => record.contactId === contactId) ??
          null;
        ElMessage.success("Đã gửi phản hồi");
      }
      return refreshed;
    } catch {
      ElMessage.error("Không thể gửi phản hồi lên máy chủ");
      return false;
    }
  };

  const saveInternalNote = async (contactId: number, internalNote: string) => {
    try {
      await ContactApi.updateInternalNote({ contactId, internalNote });
      if (activeItem.value) {
        if (activeItem.value.contact) {
          activeItem.value.contact.internalNote = internalNote;
        }
      }
      ElMessage.success("Đã lưu ghi chú");
      return true;
    } catch {
      ElMessage.error("Không thể lưu ghi chú lên máy chủ");
      return false;
    }
  };

  const assignSupportRequest = async (
    supportRequestId: number,
    userId: string | null,
  ) => {
    try {
      await ContactApi.assign(supportRequestId, userId);
      const refreshed = await fetchList();
      if (refreshed) {
        activeItem.value =
          records.value.find((record) => record.id === supportRequestId) ??
          null;
        ElMessage.success(userId ? "Đã phân công xử lý" : "Đã bỏ phân công");
      }
      return refreshed;
    } catch {
      ElMessage.error("Không thể cập nhật phân công trên máy chủ");
      return false;
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
    errorMessage,
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
    assignSupportRequest,
    setUnreadBadge,
    incrementBadge,
    setAssignedFilter,
    clearAssignedFilter,
  };
});
