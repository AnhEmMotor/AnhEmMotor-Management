import { ref } from "vue";
import { useTable } from "@/common/composables/useTable";
import { BrandApi } from "@/api/product";
import type { Brand } from "@/domain/product/brand.types";
import { ElMessage, ElMessageBox } from "element-plus";

export function useBrandTable() {
  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const formData = ref<Partial<Brand>>({});
  const submitting = ref(false);
  const selectedRows = ref<Brand[]>([]);

  const handleSelectionChange = (selection: Brand[]) => {
    selectedRows.value = selection;
  };

  const restoreDialogVisible = ref(false);
  const deletedBrandsData = ref<Brand[]>([]);
  const deletedBrandsLoading = ref(false);
  const selectedDeletedBrands = ref<Brand[]>([]);

  const handleDeletedSelectionChange = (selection: Brand[]) => {
    selectedDeletedBrands.value = selection;
  };

  const openRestoreDialog = async () => {
    restoreDialogVisible.value = true;
    deletedBrandsLoading.value = true;
    try {
      const res = await BrandApi.getDeletedList({ current: 1, size: 1000 });
      deletedBrandsData.value = res.items || [];
    } catch (err) {
      console.error(err);
      ElMessage.error("Không thể tải danh sách thương hiệu đã xóa");
    } finally {
      deletedBrandsLoading.value = false;
    }
  };

  const statistics = ref({
    totalBrands: 0,
    popularOrigin: "",
    popularOriginCount: 0,
    latestUpdatedBrandName: "",
    latestUpdatedAt: null as string | null,
    deletedBrandsCount: 0,
  });

  const fetchStatistics = async () => {
    try {
      const res = await BrandApi.getStatistics();
      statistics.value = {
        totalBrands: res.totalBrands ?? 0,
        popularOrigin: res.popularOrigin ?? "",
        popularOriginCount: res.popularOriginCount ?? 0,
        latestUpdatedBrandName: res.latestUpdatedBrandName ?? "",
        latestUpdatedAt: res.latestUpdatedAt ?? null,
        deletedBrandsCount: res.deletedBrandsCount ?? 0,
      };
    } catch (err) {
      console.error("Failed to fetch brand statistics:", err);
    }
  };

  fetchStatistics();

  const {
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    getData,
    refreshData,
    replaceSearchParams,
    searchParams,
  } = useTable({
    core: {
      apiFn: BrandApi.getList,
      apiParams: {
        current: 1,
        size: 10,
      },
      columnsFactory: () => [
        { type: "selection", width: 50, align: "center" },
        {
          prop: "logoUrl",
          label: "Logo",
          width: 100,
          useSlot: true,
          align: "center",
        },
        { prop: "name", label: "Thương hiệu", width: 220, useSlot: true },
        { prop: "origin", label: "Xuất xứ", width: 140, useSlot: true },
        {
          prop: "description",
          label: "Mô tả chi tiết",
          minWidth: 250,
          showOverflowTooltip: true,
        },
        {
          prop: "operation",
          label: "Thao tác",
          width: 150,
          useSlot: true,
          align: "center",
          fixed: "right",
        },
      ],
    },
  });

  const handleAdd = () => {
    dialogTitle.value = "Thêm thương hiệu mới";
    formData.value = {
      name: "",
      origin: "",
      logoUrl: "",
      description: "",
    };
    dialogVisible.value = true;
  };

  const handleEdit = (row: Brand) => {
    dialogTitle.value = "Cập nhật thương hiệu";
    formData.value = { ...row };
    dialogVisible.value = true;
  };

  const handleDelete = (row: Brand) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa thương hiệu "${row.name}" không?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
        buttonSize: "default",
      },
    ).then(async () => {
      try {
        await BrandApi.delete(row.id);
        ElMessage.success("Xóa thương hiệu thành công");
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || "Xóa thất bại");
      }
    });
  };

  const handleDeleteMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một thương hiệu");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} thương hiệu đã chọn?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
        buttonSize: "default",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await BrandApi.deleteMany(ids);
        ElMessage.success("Xóa hàng loạt thành công");
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || "Xóa hàng loạt thất bại");
      }
    });
  };

  const handleRestoreMany = () => {
    if (selectedDeletedBrands.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một thương hiệu để khôi phục");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedDeletedBrands.value.length} thương hiệu đã chọn?`,
      "Xác nhận khôi phục",
      {
        confirmButtonText: "Khôi phục",
        cancelButtonText: "Hủy",
        type: "warning",
        buttonSize: "default",
      },
    ).then(async () => {
      try {
        const ids = selectedDeletedBrands.value.map((item) => item.id);
        await BrandApi.restoreMany(ids);
        ElMessage.success("Khôi phục hàng loạt thành công");
        restoreDialogVisible.value = false;
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || "Khôi phục hàng loạt thất bại");
      }
    });
  };

  const handleCloneMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một thương hiệu để clone");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn nhân bản (clone) ${selectedRows.value.length} thương hiệu đã chọn?`,
      "Xác nhận nhân bản",
      {
        confirmButtonText: "Nhân bản",
        cancelButtonText: "Hủy",
        type: "warning",
        buttonSize: "default",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await BrandApi.cloneMany(ids);
        ElMessage.success("Nhân bản hàng loạt thành công");
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || "Nhân bản hàng loạt thất bại");
      }
    });
  };

  const importResultData = ref<any | null>(null);
  const importResultDialogVisible = ref(false);
  const importing = ref(false);

  const handleImport = async (file: File) => {
    importing.value = true;
    importResultData.value = null;
    try {
      const res = await BrandApi.importExcel(file);

      // Mở dialog kết quả nếu có dòng lỗi, hoặc hiển thị toast nếu thành công 100%
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

  const submitForm = async () => {
    submitting.value = true;
    try {
      if (formData.value.id) {
        await BrandApi.update(formData.value.id, formData.value);
        ElMessage.success("Cập nhật thương hiệu thành công");
      } else {
        await BrandApi.create(formData.value);
        ElMessage.success("Thêm thương hiệu thành công");
      }
      dialogVisible.value = false;
      refreshAll();
    } catch (err: any) {
      ElMessage.error(err.message || "Thao tác thất bại");
    } finally {
      submitting.value = false;
    }
  };

  const handleSearch = (params: any) => {
    const filters = [];
    if (params.name) filters.push(`Name@=${params.name}`);
    if (params.origin) filters.push(`Origin@=${params.origin}`);

    replaceSearchParams({
      Filters: filters.join(","),
    });
    getData();
  };

  const handleReset = () => {
    replaceSearchParams({
      Filters: "",
    });
    getData();
  };

  const refreshAll = () => {
    refreshData();
    fetchStatistics();
    selectedRows.value = [];
  };

  const exporting = ref(false);

  const handleExport = async () => {
    exporting.value = true;
    try {
      const filters = (searchParams as any).Filters;
      const resBlob = await BrandApi.export({ Filters: filters });

      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Danh_sach_thuong_hieu.xlsx");
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

  const handleDownloadTemplate = async () => {
    try {
      const resBlob = await BrandApi.getImportTemplate();
      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Mau_nhap_thuong_hieu.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      ElMessage.error(err.message || "Tải file mẫu thất bại");
    }
  };

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
    statistics,
    fetchStatistics,

    selectedRows,
    handleSelectionChange,
    handleDeleteMany,
    handleCloneMany,

    restoreDialogVisible,
    deletedBrandsData,
    deletedBrandsLoading,
    selectedDeletedBrands,
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
