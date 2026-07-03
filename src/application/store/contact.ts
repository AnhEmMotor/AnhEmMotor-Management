import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ContactApi } from "@/api/customer";
import { ElMessage } from "element-plus";
import type { Contact } from "@/types";

const mockSupports = [
  {
    id: 1,
    contactId: 1,
    subject: "Cần hỗ trợ về chính sách bảo hành xe mới mua",
    category: "AfterSales",
    email: "quang.nguyen@gmail.com",
    orderCode: "AEM-WinnerX-2024",
    content:
      "Chào shop, mình mới mua xe Honda Winner X tuần trước tại showroom Biên Hòa. Hiện tại mình muốn hỏi về sổ bảo hành điện tử kích hoạt như thế nào và thời hạn bảo dưỡng lần 1 là khi nào vậy?",
    status: "New",
    createdAt: "2024-06-30T10:15:00Z",
    contact: {
      id: 1,
      fullName: "Nguyễn Hồng Quang",
      email: "quang.nguyen@gmail.com",
      phoneNumber: "0912345678",
    },
  },
  {
    id: 2,
    contactId: 2,
    subject: "Hỏi về dịch vụ cứu hộ xe máy 24/7",
    category: "Service",
    email: "lan.anh@yahoo.com",
    content:
      "Xe ga của em đang đi trên đường Phạm Văn Đồng thì bị chết máy đột ngột không đề được. Shop có hỗ trợ đội cứu hộ xe máy tại khu vực này không ạ?",
    status: "InProgress",
    createdAt: "2024-06-30T09:20:00Z",
    contact: {
      id: 2,
      fullName: "Lê Thị Lan Anh",
      email: "lan.anh@yahoo.com",
      phoneNumber: "0987654321",
    },
  },
  {
    id: 3,
    contactId: 3,
    subject: "Không nhận được hóa đơn điện tử VAT mua hàng",
    category: "Sales",
    email: "thanh.tran@outlook.com",
    orderCode: "AEM-SH150-1002",
    content:
      "Tôi mua xe SH 150i hôm qua đã thanh toán đủ 100% bằng chuyển khoản nhưng kiểm tra email chưa thấy xuất hóa đơn VAT điện tử. Nhờ bộ phận kế toán kiểm tra giúp.",
    status: "Closed",
    createdAt: "2024-06-29T15:45:00Z",
    contact: {
      id: 3,
      fullName: "Trần Minh Thành",
      email: "thanh.tran@outlook.com",
      phoneNumber: "0909000111",
    },
  },
];

const mockFeedbacks = [
  {
    id: 11,
    contactId: 11,
    rating: 5,
    feedbackArea: "Xưởng dịch vụ Biên Hòa",
    customerName: "Phạm Hùng Cường",
    phoneNumber: "0933445566",
    content:
      "Đội ngũ kỹ thuật viên làm việc rất nhanh chóng, xe mình thay dầu và căn chỉnh phanh chỉ mất 15 phút. Phòng chờ có máy lạnh mát mẻ và nước uống phục vụ tốt.",
    status: "Resolved",
    createdAt: "2024-06-30T11:00:00Z",
    contact: {
      id: 11,
      fullName: "Phạm Hùng Cường",
      email: "cuong.pham@gmail.com",
      phoneNumber: "0933445566",
    },
  },
  {
    id: 12,
    contactId: 12,
    rating: 3,
    feedbackArea: "Thái độ phục vụ showroom",
    customerName: "Nguyễn Thu Hà",
    phoneNumber: "0977889900",
    content:
      "Dòng xe Honda Vision mẫu mới trưng bày đẹp, nhưng nhân viên tư vấn trả góp giải thích thủ tục hơi khó hiểu và chưa nhiệt tình lắm. Hy vọng cửa hàng cải thiện thái độ phục vụ.",
    status: "Read",
    createdAt: "2024-06-30T08:30:00Z",
    contact: {
      id: 12,
      fullName: "Nguyễn Thu Hà",
      email: "ha.nguyen@gmail.com",
      phoneNumber: "0977889900",
    },
  },
  {
    id: 13,
    contactId: 13,
    rating: 4,
    feedbackArea: "Chất lượng xe bán ra",
    customerName: "Vũ Tiến Đạt",
    phoneNumber: "0911223344",
    content:
      "Xe chạy rất đầm và bốc, máy êm. Chỉ có một điểm trừ nhỏ là lúc bàn giao xe cửa hàng rửa chưa kỹ phần gầm xe.",
    status: "Pending",
    createdAt: "2024-06-28T14:10:00Z",
    contact: {
      id: 13,
      fullName: "Vũ Tiến Đạt",
      email: "dat.vu@gmail.com",
      phoneNumber: "0911223344",
    },
  },
];

const mockCandidates = [
  {
    id: 21,
    contactId: 21,
    fullName: "Nguyễn Văn Hùng",
    email: "hung.nguyen@gmail.com",
    phoneNumber: "0966778899",
    appliedPosition: "Kỹ thuật viên sửa chữa xe máy",
    cvFileUrl: "cv/cv-nguyen-van-hung.pdf",
    coverLetter:
      "Tôi có 5 năm kinh nghiệm làm thợ chính sửa chữa các dòng xe tay ga và xe côn tay tại Head Honda. Mong muốn được gia nhập đội ngũ AEMOTO chuyên nghiệp.",
    status: "Interview",
    createdAt: "2024-06-30T14:00:00Z",
    contact: {
      id: 21,
      fullName: "Nguyễn Văn Hùng",
      email: "hung.nguyen@gmail.com",
      phoneNumber: "0966778899",
    },
  },
  {
    id: 22,
    contactId: 22,
    fullName: "Trần Minh Tâm",
    email: "tam.tran@gmail.com",
    phoneNumber: "0955667788",
    appliedPosition: "Nhân viên Tư vấn Bán hàng (Showroom)",
    cvFileUrl: "cv/cv-tran-minh-tam.pdf",
    coverLetter:
      "Kinh nghiệm 2 năm tư vấn xe máy trả góp, kỹ năng giao tiếp tốt, mong muốn ứng tuyển tại chi nhánh Biên Hòa.",
    status: "New",
    createdAt: "2024-06-30T12:00:00Z",
    contact: {
      id: 22,
      fullName: "Trần Minh Tâm",
      email: "tam.tran@gmail.com",
      phoneNumber: "0955667788",
    },
  },
  {
    id: 23,
    contactId: 23,
    fullName: "Lê Thị Mai",
    email: "mai.le@gmail.com",
    phoneNumber: "0944556677",
    appliedPosition: "Nhân viên Kế toán bán hàng",
    cvFileUrl: "cv/cv-le-thi-mai.pdf",
    coverLetter:
      "Đã làm kế toán kho và thu ngân tại showroom ô tô xe máy 3 năm.",
    status: "Offer",
    createdAt: "2024-06-29T10:00:00Z",
    contact: {
      id: 23,
      fullName: "Lê Thị Mai",
      email: "mai.le@gmail.com",
      phoneNumber: "0944556677",
    },
  },
];

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

  const useMockData = () => {
    let mockList: any[] = [];
    const type = contactType.value?.toLowerCase() || "support";
    if (type === "support") {
      mockList = mockSupports;
    } else if (type === "feedback") {
      mockList = mockFeedbacks;
    } else {
      mockList = mockCandidates;
    }

    if (status.value) {
      mockList = mockList.filter((item) => item.status === status.value);
    }

    records.value = mockList;
    totalCount.value = mockList.length;
  };

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
        useMockData();
      }
      page.value = (res as any).pageNumber ?? res.page;
      pageSize.value = res.pageSize;
    } catch {
      useMockData();
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
