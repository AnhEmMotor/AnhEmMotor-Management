import { ref } from "vue";
import { ServiceApi } from "@/api/service.api";
import { ServiceCategoryApi } from "@/api/service-category.api";
import { useTable } from "@/common/composables/useTable";
import type { ServiceResponse } from "@/api/service.api";
import type { ServiceCategoryResponse } from "@/api/service-category.api";
import { ElMessage, ElMessageBox } from "element-plus";

export function useServiceTable() {
  // Service categories
  const categories = ref<ServiceCategoryResponse[]>([]);
  const loadingCategories = ref(false);

  const fetchCategories = async () => {
    loadingCategories.value = true;
    try {
      const res = await ServiceCategoryApi.getList({
        current: 1,
        size: 1000,
      });
      categories.value = res.items || [];
    } catch (_err) {
      console.error("Failed to fetch service categories:", _err);
      categories.value = [];
    } finally {
      loadingCategories.value = false;
    }
  };

  // Table state via useTable hook
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
  } = useTable({
    core: {
      apiFn: async (params: any) => {
        const res = await ServiceApi.getList(params);
        if (res && res.items) {
          res.items = res.items.map((item: any) => ({
            ...item,
            categoryName: getCategoryName(item.categoryId),
          }));
        }
        return res;
      },
      apiParams: {
        current: 1,
        size: 10,
        Filters: "",
      },
      immediate: true,
      columnsFactory: () => [
        { prop: "id", label: "ID", width: 80, align: "center" },
        { prop: "name", label: "Tên dịch vụ", minWidth: 200 },
        { prop: "categoryName", label: "Danh mục", width: 180 },
        { prop: "basePrice", label: "Giá (VNĐ)", width: 140, align: "right" },
        {
          prop: "estimatedDurationMinutes",
          label: "Thời gian (phút)",
          width: 130,
          align: "center",
        },
        {
          prop: "isActive",
          label: "Trạng thái",
          width: 120,
          align: "center",
          useSlot: true,
        },
        {
          prop: "operation",
          label: "Hành động",
          width: 180,
          align: "center",
          fixed: "right",
          useSlot: true,
        },
      ],
    },
  });

  // Add categoryName to data for display
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "-";
    const cat = categories.value.find((c) => c.id === categoryId);
    return cat?.name || `Danh mục #${categoryId}`;
  };

  // Form state
  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const formData = ref<Partial<ServiceResponse>>({
    isActive: true,
  });
  const submitting = ref(false);

  const handleAdd = () => {
    dialogTitle.value = "Thêm dịch vụ mới";
    formData.value = {
      name: "",
      description: "",
      basePrice: 0,
      estimatedDurationMinutes: undefined,
      categoryId: undefined,
      isActive: true,
    };
    dialogVisible.value = true;
  };

  const handleEdit = async (row: any) => {
    dialogTitle.value = "Cập nhật dịch vụ";
    try {
      // Since there's no get-by-id endpoint, we might have full data in row
      formData.value = { ...row };
      dialogVisible.value = true;
    } catch (_err) {
      ElMessage.error("Không thể lấy chi tiết dịch vụ");
    }
  };

  const handleDelete = (row: any) => {
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa dịch vụ "${row.name}" không?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        // No delete endpoint? Use update to deactivate
        await ServiceApi.update(row.id, { ...row, isActive: false });
        ElMessage.success("Đã vô hiệu hóa dịch vụ");
        refreshData();
      } catch (_err: any) {
        ElMessage.error(_err.message || "Xóa thất bại");
      }
    });
  };

  const handleSearch = (params: any) => {
    const filters = [];
    if (params.name) filters.push(`Name@=${params.name}`);
    if (params.categoryId) filters.push(`CategoryId==${params.categoryId}`);
    if (params.isActive !== undefined && params.isActive !== "")
      filters.push(`IsActive==${params.isActive}`);

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

  const submitForm = async () => {
    submitting.value = true;
    try {
      if (formData.value.id) {
        await ServiceApi.update(formData.value.id, formData.value);
        ElMessage.success("Cập nhật dịch vụ thành công");
      } else {
        await ServiceApi.create(formData.value as any);
        ElMessage.success("Thêm dịch vụ thành công");
      }
      dialogVisible.value = false;
      refreshData();
    } catch (_err: any) {
      ElMessage.error(_err.message || "Thao tác thất bại");
    } finally {
      submitting.value = false;
    }
  };

  fetchCategories();

  return {
    categories,
    loadingCategories,
    data,
    loading,
    pagination,
    columns,
    columnChecks,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData,
    getCategoryName,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
  };
}
