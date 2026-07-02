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
  const currentFilters = ref<LeadListParams>({});

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

  const refreshData = async () => {
    loading.value = true;
    try {
      const res = await fetchGetLeadList({
        Page: pagination.current,
        PageSize: pagination.size,
        Sorts: "-createdAt",
        ...currentFilters.value,
      });
      const leads = Array.isArray(res) ? res : (res.items ?? res.records ?? []);

      data.value = leads.sort((a: any, b: any) => {
        const pA = getPriority(a).level;
        const pB = getPriority(b).level;
        return pB - pA;
      });

      pagination.total = Array.isArray(res)
        ? data.value.length
        : (res.totalCount ?? res.total ?? data.value.length);
    } catch (_err: any) {
      ElMessage.error("Lỗi khi lấy dữ liệu");
    } finally {
      loading.value = false;
    }
  };

  const handleSizeChange = (size: number) => {
    pagination.size = size;
    refreshData();
  };

  const handleCurrentChange = (current: number) => {
    pagination.current = current;
    refreshData();
  };

  const handleSearch = (params: any = {}) => {
    const filters = [
      params.status ? `Status==${params.status}` : "",
      params.source ? `Source==${params.source}` : "",
      params.assignedToId ? `AssignedToId==${params.assignedToId}` : "",
      params.isVerified !== undefined && params.isVerified !== ""
        ? `IsVerified==${params.isVerified}`
        : "",
    ]
      .filter(Boolean)
      .join(",");
    currentFilters.value = {
      Filters: filters || undefined,
    };
    pagination.current = 1;
    refreshData();
  };

  const handleAssignSingle = async (leadId: number, saleId: string | null) => {
    try {
      await fetchAssignLead(leadId, saleId);
      ElMessage.success("Đã cập nhật nhân viên phụ trách");
      refreshData();
    } catch {
      ElMessage.error("Lỗi khi giao khách hàng. Vui lòng thử lại.");
    }
  };

  const handleReset = () => {
    currentFilters.value = {};
    pagination.current = 1;
    refreshData();
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
