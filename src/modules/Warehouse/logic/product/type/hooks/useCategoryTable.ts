import { useTable } from "@/common/composables/useTable";
import { CategoryApi } from "@/api/product/category.api";
import { ref, computed, onMounted, watch } from "vue";
import type { ProductCategory } from "@/domain/product/category.types";
import { ElMessage, ElMessageBox } from "element-plus";
import { buildTree } from "@/common/utils";

export function useCategoryTable() {
  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const formData = ref<Partial<ProductCategory>>({});
  const managementTypes = ref<{ label: string; value: string }[]>([]);

  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  watch(
    () => formData.value.name,
    (newName) => {
      if (dialogTitle.value.includes("Thêm") && newName) {
        formData.value.slug = generateSlug(newName);
      }
    },
  );
  const submitting = ref(false);

  const stats = ref({
    totalCategories: 0,
    productCategoriesCount: 0,
    latestUpdatedCategoryName: "",
    latestUpdatedAt: "",
  });

  const fetchStats = async () => {
    try {
      const res = await CategoryApi.getStats();
      if (res) {
        stats.value = {
          totalCategories: res.totalCategories || 0,
          productCategoriesCount: res.productCategoriesCount || 0,
          latestUpdatedCategoryName: res.latestUpdatedCategoryName || "",
          latestUpdatedAt: res.latestUpdatedAt || "",
        };
      }
    } catch (err) {
      console.error("Failed to fetch category stats:", err);
    }
  };

  const fetchManagementTypes = async () => {
    try {
      const res = await CategoryApi.getManagementTypes();
      managementTypes.value = (res || []).map((item) => ({
        label: item.text,
        value: item.value,
      }));
    } catch (err) {
      console.error("Failed to fetch management types:", err);
    }
  };

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
      apiFn: (params: any) => {
        return CategoryApi.getList({
          ...params,
          size: 1000,
        }) as unknown as Promise<Api.Common.PaginatedResponse<ProductCategory>>;
      },
      apiParams: {
        current: 1,
        size: 10,
      },
      columnsFactory: () => [
        {
          prop: "imageUrl",
          label: "Hình ảnh",
          width: 120,
          useSlot: true,
          align: "left",
        },
        { prop: "name", label: "Tên thể loại", minWidth: 220, useSlot: true },
        { prop: "slug", label: "Slug", width: 300 },
        {
          prop: "managementType",
          label: "Loại quản lý",
          width: 180,
          useSlot: true,
        },
        {
          prop: "productCount",
          label: "Số sản phẩm",
          width: 120,
          align: "center",
        },
        {
          prop: "isActive",
          label: "Trạng thái",
          width: 120,
          useSlot: true,
          align: "center",
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

  const tableData = computed<any[]>(() => {
    return buildTree(data.value as ProductCategory[]);
  });

  const parentCategories = computed<ProductCategory[]>(() => {
    return (data.value as ProductCategory[]).filter(
      (c) => !c.parentId && c.id !== formData.value.id,
    );
  });

  const handleAdd = () => {
    dialogTitle.value = "Thêm danh mục mới";
    formData.value = {
      name: "",
      slug: "",
      imageUrl: "",
      description: "",
      managementType: managementTypes.value[0]?.value || "sku",
      maxPurchaseQuantity: null,
      isActive: true,
      parentId: null,
    };
    dialogVisible.value = true;
  };

  const handleEdit = (row: ProductCategory) => {
    dialogTitle.value = "Cập nhật danh mục";
    formData.value = { ...row };
    dialogVisible.value = true;
  };

  const handleDelete = (row: ProductCategory) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa "${row.name}" không?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        await CategoryApi.delete(row.id);
        ElMessage.success("Xóa thành công");
        await refreshData();
        await fetchStats();
      } catch (err: any) {
        ElMessage.error(err.message || "Xóa thất bại");
      }
    });
  };

  const submitForm = async () => {
    submitting.value = true;
    try {
      if (formData.value.id) {
        await CategoryApi.update(formData.value.id, formData.value);
        ElMessage.success("Cập nhật thành công");
      } else {
        await CategoryApi.create(formData.value);
        ElMessage.success("Thêm mới thành công");
      }
      dialogVisible.value = false;
      await refreshData();
      await fetchStats();
    } catch (err: any) {
      ElMessage.error(err.message || "Thao tác thất bại");
    } finally {
      submitting.value = false;
    }
  };

  const isSearching = ref(false);

  const handleSearch = (params: any) => {
    const filters: string[] = [];
    if (params.name) {
      filters.push(`Name@=${params.name}`);
    }
    if (params.managementType) {
      filters.push(`managementType==${params.managementType}`);
    }
    isSearching.value = filters.length > 0;
    replaceSearchParams({
      Filters: filters.join(","),
    });
    getData();
  };

  const handleReset = () => {
    isSearching.value = false;
    replaceSearchParams({});
    getData();
  };

  const handleRefresh = async () => {
    await refreshData();
    await fetchStats();
  };

  const exporting = ref(false);

  const handleExport = async () => {
    exporting.value = true;
    try {
      const filters = (searchParams as any).Filters;
      const resBlob = await CategoryApi.export({ Filters: filters });

      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Danh_sach_the_loai.xlsx");
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
    fetchStats();
    fetchManagementTypes();
  });

  return {
    data,
    tableData,
    stats,
    managementTypes,
    parentCategories,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData: handleRefresh,
    isSearching,

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
