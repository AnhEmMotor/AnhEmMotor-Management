import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { InventoryReceiptApi } from "@/api/inventory/inventory-receipt.api";
import type { InventoryReceipt } from "@/domain/inventory/receipt.types";

export function useInventoryReceiptTable() {
  const loading = ref(false);
  const data = ref<InventoryReceipt[]>([]);
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  });

  const searchForm = ref({
    supplierName: "",
    statusId: [] as string[],
  });

  const statuses = ref<Record<string, string>>({});

  const stats = ref({
    totalVehicles: 0,
    processingReceipts: 0,
    totalValue: 0,
  });

  const loadStatuses = async () => {
    try {
      statuses.value = await InventoryReceiptApi.getStatuses();
    } catch (error) {
      console.error("Failed to load statuses:", error);
      statuses.value = {
        draft: "Phiếu tạm",
        sent: "Đã gửi",
        approve: "Đã duyệt",
        reject: "Đã từ chối",
      };
    }
  };

  const searchItems = computed(() => [
    {
      key: "statusId",
      label: "Trạng thái",
      type: "select",
      props: {
        placeholder: "Tất cả trạng thái",
        clearable: true,
        multiple: true,
        collapseTags: true,
        options: Object.entries(statuses.value).map(([key, value]) => ({
          label: value,
          value: key,
        })),
      },
    },
  ]);

  const columns = ref([
    {
      type: "selection" as const,
      width: 50,
      align: "center",
      fixed: "left" as const,
    },
    { label: "Thời gian tạo", prop: "createdAt", useSlot: true, width: 170 },
    {
      label: "Tóm tắt SP",
      prop: "productSummary",
      useSlot: true,
      minWidth: 320,
    },
    {
      label: "Trạng thái",
      prop: "statusId",
      useSlot: true,
      width: 150,
      align: "center",
    },
    {
      label: "Thao tác",
      prop: "operation",
      useSlot: true,
      width: 200,
      fixed: "right" as const,
      align: "center",
    },
  ]);

  const columnChecks = ref(columns.value);

  const loadStats = async () => {
    try {
      const res = await InventoryReceiptApi.getStats();
      stats.value = {
        totalVehicles: res.totalVehicles || 0,
        processingReceipts: res.processingReceipts || 0,
        totalValue: 0,
      };
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const loadDataWithFilters = async (filters?: any) => {
    loading.value = true;
    try {
      const sieveFilters = [];
      if (filters?.statusId && filters.statusId.length > 0) {
        if (Array.isArray(filters.statusId)) {
          sieveFilters.push(`StatusId==${filters.statusId.join("|")}`);
        } else {
          sieveFilters.push(`StatusId==${filters.statusId}`);
        }
      }

      const params = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(",") || undefined,
        Sorts: "-createdAt",
      };

      const res = await InventoryReceiptApi.getList(params);
      data.value = res.items || [];
      pagination.total = res.totalCount || 0;
      await loadStats();
    } catch (error) {
      console.error("Failed to load inventory receipts:", error);
      ElMessage.error("Không thể tải danh sách phiếu nhập kho");
    } finally {
      loading.value = false;
    }
  };

  const loadData = async () => {
    await loadDataWithFilters(searchForm.value);
  };

  const handleSearch = (filters: any) => {
    pagination.current = 1;
    loadDataWithFilters(filters);
  };

  const handleReset = () => {
    pagination.current = 1;
    loadDataWithFilters();
  };

  const refreshData = () => {
    loadData();
    selectedRows.value = [];
  };

  const handleSizeChange = (size: number) => {
    pagination.size = size;
    pagination.current = 1;
    loadData();
  };

  const handleCurrentChange = (page: number) => {
    pagination.current = page;
    loadData();
  };

  // --- MỚI: Chọn nhiều để Xoá, Nhân bản ---
  const selectedRows = ref<InventoryReceipt[]>([]);

  const handleSelectionChange = (rows: InventoryReceipt[]) => {
    selectedRows.value = rows;
  };

  const handleDeleteMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một phiếu nhập");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} phiếu nhập đã chọn?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await InventoryReceiptApi.deleteMany(ids);
        ElMessage.success("Xóa hàng loạt thành công");
        refreshData();
      } catch (err: any) {
        ElMessage.error(err.message || "Xóa hàng loạt thất bại");
      }
    });
  };

  // --- MỚI: Khôi phục nhiều ---
  const restoreDialogVisible = ref(false);
  const deletedReceiptsData = ref<InventoryReceipt[]>([]);
  const deletedReceiptsLoading = ref(false);
  const selectedDeletedReceipts = ref<InventoryReceipt[]>([]);

  const handleDeletedSelectionChange = (rows: InventoryReceipt[]) => {
    selectedDeletedReceipts.value = rows;
  };

  const openRestoreDialog = async () => {
    restoreDialogVisible.value = true;
    deletedReceiptsLoading.value = true;
    selectedDeletedReceipts.value = [];
    try {
      const res = await InventoryReceiptApi.getDeletedList({
        current: 1,
        size: 1000,
      });
      deletedReceiptsData.value = res.items || [];
    } catch {
      ElMessage.error("Không thể tải danh sách phiếu nhập đã xóa");
    } finally {
      deletedReceiptsLoading.value = false;
    }
  };

  const handleRestoreMany = () => {
    if (selectedDeletedReceipts.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một phiếu nhập để khôi phục");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedDeletedReceipts.value.length} phiếu nhập đã chọn?`,
      "Xác nhận khôi phục",
      {
        confirmButtonText: "Khôi phục",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedDeletedReceipts.value.map((item) => item.id);
        await InventoryReceiptApi.restoreMany(ids);
        ElMessage.success("Khôi phục thành công");
        restoreDialogVisible.value = false;
        refreshData();
      } catch (err: any) {
        ElMessage.error(err.message || "Khôi phục thất bại");
      }
    });
  };

  // --- MỚI: Nhập/Xuất Excel ---
  const importing = ref(false);
  const importResultData = ref<any | null>(null);
  const importResultDialogVisible = ref(false);

  const handleImport = async (file: File) => {
    importing.value = true;
    importResultData.value = null;
    try {
      const res = await InventoryReceiptApi.importExcel(file);
      if (
        res &&
        typeof res === "object" &&
        "failedCount" in res &&
        (res as any).failedCount > 0
      ) {
        importResultData.value = res;
        importResultDialogVisible.value = true;
      } else {
        ElMessage.success(`Nhập dữ liệu thành công`);
      }
      refreshData();
    } catch (err: any) {
      ElMessage.error(err.message || "Nhập dữ liệu thất bại");
    } finally {
      importing.value = false;
    }
  };

  const handleDownloadTemplate = async (purchaseRequestId: number) => {
    try {
      const resBlob =
        await InventoryReceiptApi.downloadImportTemplate(purchaseRequestId);
      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Mau_nhap_phieu_nhap_kho.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      ElMessage.error(err.message || "Tải file mẫu thất bại");
    }
  };

  const exporting = ref(false);

  const handleExport = async () => {
    exporting.value = true;
    try {
      const sieveFilters = [];
      if (searchForm.value.statusId && searchForm.value.statusId.length > 0) {
        if (Array.isArray(searchForm.value.statusId)) {
          sieveFilters.push(`StatusId==${searchForm.value.statusId.join("|")}`);
        } else {
          sieveFilters.push(`StatusId==${searchForm.value.statusId}`);
        }
      }

      const resBlob = await InventoryReceiptApi.exportExcel({
        Filters: sieveFilters.join(",") || undefined,
        Sorts: "-createdAt",
      });

      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Danh_sach_phieu_nhap_kho.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      ElMessage.success("Xuất file Excel thành công");
    } catch (err: any) {
      console.error(err);
      ElMessage.error(err.message || "Xuất file Excel thất bại");
    } finally {
      exporting.value = false;
    }
  };

  onMounted(async () => {
    await loadStatuses();
    await loadData();
  });

  return {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    searchForm,
    searchItems,
    statuses,
    stats,
    loadData,
    refreshData,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,

    selectedRows,
    handleSelectionChange,
    handleDeleteMany,

    restoreDialogVisible,
    deletedReceiptsData,
    deletedReceiptsLoading,
    selectedDeletedReceipts,
    handleDeletedSelectionChange,
    openRestoreDialog,
    handleRestoreMany,

    importing,
    importResultData,
    importResultDialogVisible,
    handleImport,
    handleDownloadTemplate,

    exporting,
    handleExport,
  };
}
