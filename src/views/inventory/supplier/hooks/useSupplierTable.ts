import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { SupplierApi } from "@/api/supplier";
import type {
  Supplier,
  PartnerType,
  SupplierStatistics,
} from "@/domain/supplier/supplier.types";

export function useSupplierTable() {
  const loading = ref(false);
  const dialogVisible = ref(false);
  const dialogTitle = ref("Thêm đối tác");
  const submitting = ref(false);
  const partnerTypes = ref<PartnerType[]>([]);
  const stats = ref<SupplierStatistics>({
    totalSuppliers: 0,
    financialSuppliers: 0,
    creditSuppliers: 0,
  });

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  });

  const data = ref<Supplier[]>([]);

  const formData = ref<Partial<Supplier>>({
    name: "",
    partnerTypeId: "",
    phone: "",
    email: "",
    taxIdentificationNumber: "",
    address: "",
    notes: "",
    status: true,
  });

  const columns = ref([
    { label: "Tên đối tác", prop: "name", minWidth: 220 },
    {
      label: "Phân loại",
      prop: "partnerTypeId",
      useSlot: true,
      width: 200,
      align: "center",
    },
    { label: "Liên hệ", prop: "contact", useSlot: true, width: 350 },
    {
      label: "Mã số thuế",
      prop: "taxIdentificationNumber",
      width: 140,
      align: "center",
    },
    {
      label: "Thao tác",
      prop: "operation",
      useSlot: true,
      width: 120,
      fixed: "right" as const,
      align: "center",
    },
  ]);

  const columnChecks = columns;

  const searchForm = ref({
    name: "",
    type: [] as string[],
  });

  const loadPartnerTypes = async () => {
    try {
      partnerTypes.value = await SupplierApi.getPartnerTypes();
    } catch (error) {
      console.error("Failed to load partner types:", error);
    }
  };

  const loadStats = async () => {
    try {
      stats.value = await SupplierApi.getStatistics();
    } catch (error) {
      console.error("Failed to load supplier statistics:", error);
    }
  };

  const loadDataWithFilters = async (filters?: any) => {
    loading.value = true;
    try {
      const sieveFilters = [];
      const keyword = filters?.name?.trim() || searchForm.value.name?.trim();
      if (keyword) {
        sieveFilters.push(
          `Name@=${keyword}|Phone@=${keyword}|TaxIdentificationNumber@=${keyword}|Address@=${keyword}`,
        );
      }

      const typeFiltersValue = filters?.type || searchForm.value.type;
      if (typeFiltersValue && typeFiltersValue.length > 0) {
        if (Array.isArray(typeFiltersValue)) {
          const typeFilters = `PartnerTypeId==${typeFiltersValue.join("|")}`;
          sieveFilters.push(typeFilters);
        } else {
          sieveFilters.push(`PartnerTypeId==${typeFiltersValue}`);
        }
      }

      const params: any = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(",") || undefined,
      };

      const res = await SupplierApi.getList(params);
      data.value = res.items || [];
      pagination.total = res.totalCount || 0;
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      ElMessage.error("Không thể tải danh sách nhà cung cấp");
    } finally {
      loading.value = false;
    }
  };

  const loadData = async () => {
    await loadDataWithFilters();
  };

  const refreshAll = () => {
    loadData();
    loadStats();
    selectedRows.value = [];
  };

  const handleReset = () => {
    searchForm.value.name = "";
    searchForm.value.type = [];
    pagination.current = 1;
    refreshAll();
  };

  const handleSearch = (filters: any) => {
    searchForm.value = { ...filters };
    pagination.current = 1;
    loadDataWithFilters(filters);
  };

  const handleAdd = () => {
    dialogTitle.value = "Thêm đối tác mới";
    formData.value = {
      name: "",
      partnerTypeId: "",
      phone: "",
      email: "",
      taxIdentificationNumber: "",
      address: "",
      notes: "",
      status: true,
    };
    dialogVisible.value = true;
  };

  const handleEdit = (row: Supplier) => {
    dialogTitle.value = "Cập nhật đối tác";
    formData.value = { ...row };
    dialogVisible.value = true;
  };

  const handleDelete = async (row: Supplier) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa đối tác "${row.name}"?`,
        "Xác nhận xóa",
        {
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
          type: "warning",
        },
      );
      await SupplierApi.delete(row.id);
      ElMessage.success("Xóa thành công");
      refreshAll();
    } catch (error) {
      if (error !== "cancel") {
        console.error("Failed to delete supplier:", error);
        ElMessage.error("Không thể xóa nhà cung cấp");
      }
    }
  };

  const submitForm = async () => {
    if (!formData.value.name || !formData.value.partnerTypeId) {
      ElMessage.warning("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    submitting.value = true;
    try {
      if (formData.value.id) {
        await SupplierApi.update(formData.value.id, formData.value);
        ElMessage.success("Cập nhật thành công");
      } else {
        await SupplierApi.create(formData.value);
        ElMessage.success("Tạo mới thành công");
      }
      dialogVisible.value = false;
      refreshAll();
    } catch (error) {
      console.error("Failed to save supplier:", error);
      ElMessage.error("Không thể lưu nhà cung cấp");
    } finally {
      submitting.value = false;
    }
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
  const selectedRows = ref<Supplier[]>([]);

  const handleSelectionChange = (rows: Supplier[]) => {
    selectedRows.value = rows;
  };

  const handleDeleteMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một đối tác");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} đối tác đã chọn?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await SupplierApi.deleteMany(ids);
        ElMessage.success("Xóa hàng loạt thành công");
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || "Xóa hàng loạt thất bại");
      }
    });
  };

  const handleCloneMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một đối tác để nhân bản");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn nhân bản ${selectedRows.value.length} đối tác đã chọn?`,
      "Xác nhận nhân bản",
      {
        confirmButtonText: "Nhân bản",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await SupplierApi.cloneMany(ids);
        ElMessage.success("Nhân bản hàng loạt thành công");
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || "Nhân bản hàng loạt thất bại");
      }
    });
  };

  // --- MỚI: Khôi phục nhiều ---
  const restoreDialogVisible = ref(false);
  const deletedSuppliersData = ref<Supplier[]>([]);
  const deletedSuppliersLoading = ref(false);
  const selectedDeletedSuppliers = ref<Supplier[]>([]);

  const handleDeletedSelectionChange = (rows: Supplier[]) => {
    selectedDeletedSuppliers.value = rows;
  };

  const openRestoreDialog = async () => {
    restoreDialogVisible.value = true;
    deletedSuppliersLoading.value = true;
    selectedDeletedSuppliers.value = [];
    try {
      const res = await SupplierApi.getDeletedList({ current: 1, size: 1000 }); // fetch all deleted
      deletedSuppliersData.value = res.items || [];
    } catch {
      ElMessage.error("Không thể tải danh sách đối tác đã xóa");
    } finally {
      deletedSuppliersLoading.value = false;
    }
  };

  const handleRestoreMany = () => {
    if (selectedDeletedSuppliers.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một đối tác để khôi phục");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedDeletedSuppliers.value.length} đối tác đã chọn?`,
      "Xác nhận khôi phục",
      {
        confirmButtonText: "Khôi phục",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedDeletedSuppliers.value.map((item) => item.id);
        await SupplierApi.restoreMany(ids);
        ElMessage.success("Khôi phục thành công");
        restoreDialogVisible.value = false;
        refreshAll();
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
      const res = await SupplierApi.importExcel(file);
      if (res.failedCount > 0) {
        importResultData.value = res;
        importResultDialogVisible.value = true;
      } else {
        ElMessage.success(`Nhập dữ liệu thành công ${res.successCount} dòng`);
      }
      refreshAll();
    } catch (err: any) {
      ElMessage.error(err.message || "Nhập dữ liệu thất bại");
    } finally {
      importing.value = false;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const resBlob = await SupplierApi.getImportTemplate();
      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Mau_nhap_doi_tac.xlsx");
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
      const keyword = searchForm.value.name?.trim();
      if (keyword) {
        sieveFilters.push(
          `Name@=${keyword}|Phone@=${keyword}|TaxIdentificationNumber@=${keyword}|Address@=${keyword}`,
        );
      }
      if (searchForm.value.type && searchForm.value.type.length > 0) {
        if (Array.isArray(searchForm.value.type)) {
          const typeFilters = `PartnerTypeId==${searchForm.value.type.join("|")}`;
          sieveFilters.push(typeFilters);
        } else {
          sieveFilters.push(`PartnerTypeId==${searchForm.value.type}`);
        }
      }

      const resBlob = await SupplierApi.exportExcel({
        Filters: sieveFilters.join(",") || undefined,
        Sorts: "Id desc",
      });

      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Danh_sach_nha_cung_cap.xlsx");
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

  onMounted(() => {
    loadPartnerTypes();
    loadData();
    loadStats();
  });

  return {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData: refreshAll,
    stats,
    partnerTypes,

    selectedRows,
    handleSelectionChange,
    handleDeleteMany,
    handleCloneMany,

    restoreDialogVisible,
    deletedSuppliersData,
    deletedSuppliersLoading,
    selectedDeletedSuppliers,
    handleDeletedSelectionChange,
    openRestoreDialog,
    handleRestoreMany,

    importing,
    importResultData,
    importResultDialogVisible,
    handleImport,
    handleDownloadTemplate,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,

    exporting,
    handleExport,
  };
}
