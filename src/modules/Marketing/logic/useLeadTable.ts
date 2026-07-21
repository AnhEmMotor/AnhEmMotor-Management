import { ref, onMounted, reactive } from "vue";
import {
  fetchGetLeadList,
  fetchAssignLead,
  type Lead,
  type LeadListParams,
} from "@/api/customer";
import { fetchGetUserList } from "@/api/auth/system-manage.api";
import { ElMessage } from "element-plus";
import { isHighIntentLeadStatus } from "@/modules/Marketing/constants/customerCrm";

export function useLeadTable() {
  const data = ref<Lead[]>([]);
  const loading = ref(false);

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  });

  const columns = [
    { title: "Họ tên", dataIndex: "fullName", slot: "fullName" },
    { title: "Số điện thoại", dataIndex: "phoneNumber" },
    { title: "Email", dataIndex: "email" },
    { title: "Xe quan tâm", dataIndex: "interestedVehicle" },
    { title: "Điểm số", dataIndex: "score", slot: "score" },
    { title: "Trạng thái", dataIndex: "status", slot: "status" },
    { title: "Ngày tạo", dataIndex: "createdAt", slot: "createdAt" },
    {
      title: "Thao tác",
      dataIndex: "operation",
      slot: "operation",
      width: 120,
    },
  ];

  const selectedIds = ref<number[]>([]);
  const salesList = ref<{ id: string; name: string }[]>([]);
  const currentFilters = ref<any>({});

  const fetchSalesList = async () => {
    try {
      const res = await fetchGetUserList({ Page: 1, PageSize: 100 });
      const users = ((res as any).items ?? (res as any).records ?? []) as any[];
      salesList.value = users.map((user: any) => ({
        id: String(user.id),
        name: user.fullName || user.username || user.email || String(user.id),
      }));
    } catch {
      salesList.value = [];
    }
  };

  const toggleSelect = (id: number) => {
    const index = selectedIds.value.indexOf(id);
    if (index > -1) {
      selectedIds.value.splice(index, 1);
    } else {
      selectedIds.value.push(id);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.value.length === data.value.length) {
      selectedIds.value = [];
    } else {
      selectedIds.value = data.value.map((item) => item.id);
    }
  };

  const handleAssignBulk = async (saleId: string) => {
    try {
      await Promise.all(
        selectedIds.value.map((id) => fetchAssignLead(id, saleId)),
      );
      ElMessage.success(
        `Đã giao ${selectedIds.value.length} khách hàng cho nhân viên mới`,
      );
      selectedIds.value = [];
      refreshData();
    } catch {
      ElMessage.error("Lỗi khi giao khách hàng. Vui lòng thử lại.");
    }
  };

  const getPriority = (lead: Lead) => {
    if (isHighIntentLeadStatus(lead.status)) {
      return {
        level: 3,
        label: "CẤP BÁCH",
        icon: "ri:fire-fill",
        color: "#ef4444",
      };
    }

    if (lead.interestedVehicle) {
      return {
        level: 2,
        label: "TIỀM NÁNG",
        icon: "ri:star-fill",
        color: "#f97316",
      };
    }

    return {
      level: 1,
      label: "THEO DÕI",
      icon: "ri:folder-user-fill",
      color: "#64748b",
    };
  };

  const rawLeads = ref<Lead[]>([]);

  const applyLocalFilterAndPagination = () => {
    let filtered = [...rawLeads.value];

    // Filter by quick search: fullName or phoneNumber
    const fullNameFilter = currentFilters.value.fullName;
    if (fullNameFilter && String(fullNameFilter).trim()) {
      const query = String(fullNameFilter).trim().toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          (lead.fullName && lead.fullName.toLowerCase().includes(query)) ||
          (lead.phoneNumber && lead.phoneNumber.includes(query)),
      );
    }

    // Filter by Source
    const sourceFilter = currentFilters.value.source;
    if (sourceFilter) {
      filtered = filtered.filter((lead) => lead.source === sourceFilter);
    }

    // Filter by Status (mapped to Lead category types)
    const statusFilter = currentFilters.value.status;
    if (statusFilter) {
      if (statusFilter === "Official" || statusFilter === "Won") {
        filtered = filtered.filter(
          (lead) =>
            lead.status === "Delivered" ||
            lead.status === "Closed" ||
            lead.status === "Won" ||
            lead.status === "Official",
        );
      } else if (statusFilter === "Purchasing") {
        filtered = filtered.filter(
          (lead) => lead.status === "Deposited" || lead.status === "Paperwork",
        );
      } else if (statusFilter === "Potential") {
        filtered = filtered.filter(
          (lead) =>
            lead.status === "New" ||
            lead.status === "Consulting" ||
            lead.status === "Contacted" ||
            lead.status === "Potential" ||
            lead.status === "TestDriving" ||
            lead.status === "TestDrive",
        );
      } else {
        filtered = filtered.filter((lead) => lead.status === statusFilter);
      }
    }

    // Sort by priority and then by createdAt descending
    filtered.sort((a, b) => {
      const pA = getPriority(a).level;
      const pB = getPriority(b).level;
      if (pB !== pA) return pB - pA;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    pagination.total = filtered.length;

    // Local pagination slice
    const startIndex = (pagination.current - 1) * pagination.size;
    const endIndex = startIndex + pagination.size;
    data.value = filtered.slice(startIndex, endIndex);
  };

  const refreshData = async () => {
    loading.value = true;
    try {
      const res = await fetchGetLeadList();
      const leads = Array.isArray(res) ? res : (res.items ?? res.records ?? []);
      rawLeads.value = leads;
      applyLocalFilterAndPagination();
    } catch (_err: any) {
      ElMessage.error("Lỗi khi lấy dữ liệu");
    } finally {
      loading.value = false;
    }
  };

  const handleSizeChange = (size: number) => {
    pagination.size = size;
    pagination.current = 1;
    applyLocalFilterAndPagination();
  };

  const handleCurrentChange = (current: number) => {
    pagination.current = current;
    applyLocalFilterAndPagination();
  };

  const handleSearch = (params: any = {}) => {
    currentFilters.value = { ...params };
    pagination.current = 1;
    applyLocalFilterAndPagination();
  };

  const handleAssignSingle = async (leadId: number, saleId: string | null) => {
    try {
      await fetchAssignLead(leadId, saleId);
      ElMessage.success("Đã cập nhật nhân viên phụ trách");
      await refreshData();
    } catch {
      ElMessage.error("Lỗi khi giao khách hàng. Vui lòng thử lại.");
    }
  };

  const handleReset = () => {
    currentFilters.value = {};
    pagination.current = 1;
    applyLocalFilterAndPagination();
  };

  const handleAssignSale = (leadId: number, saleId: any) => {
    handleAssignSingle(leadId, saleId ? String(saleId) : null);
  };

  onMounted(() => {
    fetchSalesList();
    refreshData();
  });

  return {
    data,
    loading,
    pagination,
    columns,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    handleAssignSale,
    selectedIds,
    salesList,
    toggleSelect,
    toggleSelectAll,
    handleAssignBulk,
    handleAssignSingle,
    refreshData,
    getPriority,
  };
}
