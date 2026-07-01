import { ref, onMounted, reactive } from "vue";
import { fetchGetLeadList, Lead } from "@/api/customer";
import { ElMessage } from "element-plus";

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
  const salesList = ref([
    { id: 1, name: "Admin", color: "#ff4d4f" },
    { id: 2, name: "Sale Nguyễn Văn A", color: "#1890ff" },
    { id: 3, name: "Sale Trần Thị B", color: "#52c41a" },
  ]);

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

  const handleAssignBulk = (_saleId: number) => {
    ElMessage.success(
      `Đã giao ${selectedIds.value.length} khách hàng cho nhân viên mới`,
    );
    selectedIds.value = [];
  };

  const getPriority = (lead: Lead) => {
    if (lead.status === "TestDrive" || lead.status === "Negotiating") {
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

  const rawData = ref<Lead[]>([]);

  const filterData = (params: any = {}) => {
    let filtered = [...rawData.value];

    if (params.fullName?.trim()) {
      const q = params.fullName.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.fullName?.toLowerCase().includes(q) ||
          item.phoneNumber?.includes(q),
      );
    }

    if (params.source) {
      filtered = filtered.filter((item) => item.source === params.source);
    }

    data.value = filtered.sort((a: any, b: any) => {
      const pA = getPriority(a).level;
      const pB = getPriority(b).level;
      return pB - pA;
    });

    pagination.total = data.value.length;
  };

  const refreshData = async () => {
    loading.value = true;
    try {
      const res = await fetchGetLeadList();
      rawData.value = Array.isArray(res) ? res : (res as any).items || [];
      filterData();
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

  const handleSearch = (params: any) => {
    filterData(params);
  };

  const handleReset = () => {
    filterData({});
  };

  const handleAssignSale = (leadId: number, saleId: number | null) => {
    const lead = data.value.find((item) => item.id === leadId);
    if (lead) {
      lead.saleId = saleId;
      const rawLead = rawData.value.find((item) => item.id === leadId);
      if (rawLead) {
        rawLead.saleId = saleId;
      }
      ElMessage.success("Đã phân công nhân sự phụ trách");
    }
  };

  onMounted(() => {
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
    refreshData,
    getPriority,
  };
}
