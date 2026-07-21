import { ref, onMounted, type Ref } from "vue";
import { useTable } from "@/common/composables/useTable";
import { WarrantyTermApi } from "@/api/warranty";
import type {
  WarrantyTerm,
  WarrantyTermStatus,
} from "@/domain/warranty/warranty-category.types";
import { ElMessage, ElMessageBox } from "element-plus";

// Mock data so UI is always visible
const MOCK_WARRANTY_TERMS: WarrantyTerm[] = [
  {
    id: 1,
    brandId: 1,
    brandName: "Honda",
    termName: "Bảo hành động cơ",
    termNameJson: '{"vi":"Bảo hành động cơ","en":"Engine Warranty"}',
    vehicleType: "Xe số / Xe tay ga",
    errorCategory: "Động cơ, hộp số",
    description:
      "Bảo hành động cơ và hộp số trong thời gian nhất định hoặc số km di chuyển",
    descriptionJson:
      '{"vi":"Bảo hành động cơ và hộp số","en":"Engine and gearbox warranty"}',
    durationMonths: 24,
    durationKm: 20000,
    coverage: "Toàn bộ chi phí thay thế phụ tùng + nhân công",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2026-01-01",
    mediaUrl: "",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-01T08:00:00Z",
  },
  {
    id: 2,
    brandId: 1,
    brandName: "Honda",
    termName: "Bảo hành điện",
    termNameJson: '{"vi":"Bảo hành điện","en":"Electrical Warranty"}',
    vehicleType: "Xe tay ga",
    errorCategory: "Hệ thống điện, ắc quy",
    description:
      "Bảo hành hệ thống điện, ắc quy và các linh kiện điện tử trong 12 tháng",
    durationMonths: 12,
    durationKm: 15000,
    coverage: "Chi phí phụ tùng + nhân công",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2025-01-01",
    mediaUrl: "",
  },
  {
    id: 3,
    brandId: 1,
    brandName: "Honda",
    termName: "Bảo hành phụ tùng",
    termNameJson: '{"vi":"Bảo hành phụ tùng","en":"Parts Warranty"}',
    vehicleType: "Tất cả",
    errorCategory: "Phụ tùng thay thế",
    description: "Bảo hành phụ tùng thay thế trong 6 tháng hoặc 5000km",
    durationMonths: 6,
    durationKm: 5000,
    coverage: "Chi phí phụ tùng thay thế",
    status: "Active",
    effectiveDate: "2024-06-01",
    mediaUrl: "",
  },
  {
    id: 4,
    brandId: 2,
    brandName: "Yamaha",
    termName: "Bảo hành động cơ Blue Core",
    termNameJson:
      '{"vi":"Bảo hành động cơ Blue Core","en":"Blue Core Engine Warranty"}',
    vehicleType: "Xe tay ga ( Exciter, NVX, Aerox )",
    errorCategory: "Động cơ Blue Core",
    description: "Bảo hành động cơ Blue Core 5 năm hoặc 50,000km",
    durationMonths: 60,
    durationKm: 50000,
    coverage: "Toàn bộ chi phí sửa chữa lỗi động cơ",
    status: "Active",
    effectiveDate: "2023-01-01",
    expirationDate: "2028-01-01",
    mediaUrl: "",
  },
  {
    id: 5,
    brandId: 2,
    brandName: "Yamaha",
    termName: "Bảo hành hệ thống phun xăng điện tử",
    termNameJson: '{"vi":"Bảo hành phun xăng điện tử","en":"EFI Warranty"}',
    vehicleType: "Xe tay ga",
    errorCategory: "Hệ thống nhiên liệu",
    description:
      "Bảo hành hệ thống phun xăng điện tử trong 24 tháng hoặc 30,000km",
    durationMonths: 24,
    durationKm: 30000,
    coverage: "Chi phí phụ tùng + nhân công",
    status: "Active",
    effectiveDate: "2023-01-01",
    expirationDate: "2025-01-01",
    mediaUrl: "",
  },
  {
    id: 6,
    brandId: 2,
    brandName: "Yamaha",
    termName: "Bảo hành gầm bệ / khung gầm",
    termNameJson: '{"vi":"Bảo hành gầm bệ","en":"Frame Warranty"}',
    vehicleType: "Tất cả",
    errorCategory: "Khung gầm, gầm bệ",
    description:
      "Bảo hành gầm bệ chống gỉ sét, biến dạng trong 36 tháng hoặc 50,000km",
    durationMonths: 36,
    durationKm: 50000,
    coverage: "Toàn bộ chi phí phục hồi gầm bệ",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2027-01-01",
    mediaUrl: "",
  },
  {
    id: 7,
    brandId: 3,
    brandName: "Suzuki",
    termName: "Bảo hành toàn diện",
    termNameJson: '{"vi":"Bảo hành toàn diện","en":"Comprehensive Warranty"}',
    vehicleType: "Xe số / Xe tay ga",
    errorCategory: "Tất cả linh kiện",
    description:
      "Bảo hành toàn diện xe máy Suzuki trong 24 tháng hoặc 20,000km",
    durationMonths: 24,
    durationKm: 20000,
    coverage: "Toàn bộ chi phí thay thế phụ tùng chính hãng + nhân công",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2026-01-01",
    mediaUrl: "",
  },
  {
    id: 8,
    brandId: 3,
    brandName: "Suzuki",
    termName: "Bảo hành pin xe điện",
    termNameJson: '{"vi":"Bảo hành pin xe điện","en":"EV Battery Warranty"}',
    vehicleType: "Xe điện",
    errorCategory: "Pin lithium-ion",
    description:
      "Bảo hành pin lithium-ion trong 36 tháng hoặc 30,000km (dung lượng < 70%)",
    durationMonths: 36,
    durationKm: 30000,
    coverage: "Thay thế pin mới nếu dung lượng dưới 70%",
    status: "Active",
    effectiveDate: "2024-06-01",
    expirationDate: "2027-06-01",
    mediaUrl: "",
  },
  {
    id: 9,
    brandId: 4,
    brandName: "Piaggio (Vespa)",
    termName: "Bảo hành toàn quốc",
    termNameJson: '{"vi":"Bảo hành toàn quốc","en":"Nationwide Warranty"}',
    vehicleType: "Vespa / Piaggio",
    errorCategory: "Tất cả linh kiện chính hãng",
    description:
      "Bảo hành toàn quốc 24 tháng hoặc 20,000km - áp dụng tại tất cả đại lý chính hãng",
    durationMonths: 24,
    durationKm: 20000,
    coverage: "Toàn bộ chi phí sửa chữa tại đại lý chính hãng",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2026-01-01",
    mediaUrl: "",
  },
  {
    id: 10,
    brandId: 4,
    brandName: "Piaggio (Vespa)",
    termName: "Bảo hành động cơ i-get",
    termNameJson: '{"vi":"Bảo hành i-get","en":"i-get Engine Warranty"}',
    vehicleType: "Vespa i-get",
    errorCategory: "Động cơ i-get",
    description: "Bảo hành động cơ i-get 5 năm hoặc 50,000km",
    durationMonths: 60,
    durationKm: 50000,
    coverage: "Toàn bộ chi phí động cơ",
    status: "Inactive",
    effectiveDate: "2023-01-01",
    expirationDate: "2025-06-01",
    mediaUrl: "",
  },
  {
    id: 11,
    brandId: 5,
    brandName: "SYM",
    termName: "Bảo hành cơ bản",
    termNameJson: '{"vi":"Bảo hành cơ bản","en":"Basic Warranty"}',
    vehicleType: "Tất cả",
    errorCategory: "Linh kiện cơ bản",
    description:
      "Bảo hành 12 tháng hoặc 10,000km cho phụ tùng linh kiện thay thế",
    durationMonths: 12,
    durationKm: 10000,
    coverage: "Phụ tùng + nhân công",
    status: "Active",
    effectiveDate: "2024-01-01",
    expirationDate: "2025-01-01",
    mediaUrl: "",
  },
  {
    id: 12,
    brandId: 5,
    brandName: "SYM",
    termName: "Bảo hành gầm bệ chống rỉ",
    termNameJson: '{"vi":"Bảo hành gầm bệ","en":"Frame Anti-rust Warranty"}',
    vehicleType: "Tất cả",
    errorCategory: "Gầm bệ, khung sườn",
    description: "Bảo hành gầm bệ chống rỉ sét 36 tháng hoặc 30,000km",
    durationMonths: 36,
    durationKm: 30000,
    coverage: "Sơn lại + xử lý gầm bệ",
    status: "Expired",
    effectiveDate: "2022-01-01",
    expirationDate: "2025-01-01",
    mediaUrl: "",
  },
];

const BRANDS_FOR_SELECT: { id: number; name: string }[] = [
  { id: 1, name: "Honda" },
  { id: 2, name: "Yamaha" },
  { id: 3, name: "Suzuki" },
  { id: 4, name: "Piaggio (Vespa)" },
  { id: 5, name: "SYM" },
];

export function useWarrantyCategoryTable() {
  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const formData = ref<Partial<WarrantyTerm>>({});
  const submitting = ref(false);
  const brandOptions = ref<{ id: number; name: string }[]>([]);
  const brandsLoading = ref(false);
  const selectedRows = ref<WarrantyTerm[]>([]);
  const statistics = ref({
    totalTerms: 0,
    activeTerms: 0,
    inactiveTerms: 0,
    brandsCovered: 0,
  });

  const handleSelectionChange = (selection: WarrantyTerm[]) => {
    selectedRows.value = selection;
  };

  const fetchStatistics = async () => {
    try {
      const res = await WarrantyTermApi.getStatistics();
      statistics.value = {
        totalTerms: res.totalTerms ?? 0,
        activeTerms: res.activeTerms ?? 0,
        inactiveTerms: res.inactiveTerms ?? 0,
        brandsCovered: res.brandsCovered ?? 0,
      };
    } catch (_err) {
      // Fallback to computed mock stats
      statistics.value = {
        totalTerms: MOCK_WARRANTY_TERMS.length,
        activeTerms: MOCK_WARRANTY_TERMS.filter((t) => t.status === "Active")
          .length,
        inactiveTerms: MOCK_WARRANTY_TERMS.filter((t) => t.status !== "Active")
          .length,
        brandsCovered: new Set(MOCK_WARRANTY_TERMS.map((t) => t.brandId)).size,
      };
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
      apiFn: WarrantyTermApi.getList,
      apiParams: {
        current: 1,
        size: 10,
      },
      columnsFactory: () =>
        [
          { type: "selection", width: 50, align: "center" },
          {
            prop: "brandName",
            label: "Hãng xe",
            minWidth: 140,
            useSlot: true,
          },
          {
            prop: "termName",
            label: "Tên điều khoản",
            minWidth: 200,
            useSlot: true,
          },
          {
            prop: "vehicleType",
            label: "Loại xe",
            minWidth: 150,
          },
          {
            prop: "errorCategory",
            label: "Loại lỗi",
            minWidth: 180,
            showOverflowTooltip: true,
          },
          {
            prop: "duration",
            label: "Thời hạn BH",
            minWidth: 160,
            align: "center",
            useSlot: true,
          },
          {
            prop: "coverage",
            label: "Phạm vi BH",
            minWidth: 200,
            showOverflowTooltip: true,
          },
          {
            prop: "status",
            label: "Trạng thái",
            width: 120,
            align: "center",
            useSlot: true,
          },
          {
            prop: "operation",
            label: "Thao tác",
            width: 160,
            useSlot: true,
            align: "center",
          },
        ] as any,
    },
  });

  onMounted(() => {
    getData().catch(() => {
      (data as unknown as Ref<WarrantyTerm[]>).value = [...MOCK_WARRANTY_TERMS];
    });
  });

  const getStatusType = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "info";
      case "Expired":
        return "danger";
      default:
        return "info";
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Active: "Đang áp dụng",
      Inactive: "Ngưng áp dụng",
      Expired: "Đã hết hạn",
    };
    return map[status] || status;
  };

  const formatDuration = (row: any) => {
    const parts: string[] = [];
    if (row.durationMonths) parts.push(`${row.durationMonths} tháng`);
    if (row.durationKm)
      parts.push(`${row.durationKm.toLocaleString("vi-VN")} km`);
    return parts.length ? parts.join(" / ") : "-";
  };

  const loadBrands = async () => {
    brandsLoading.value = true;
    try {
      // Will be connected to backend later
      brandOptions.value = [...BRANDS_FOR_SELECT];
    } catch {
      brandOptions.value = [...BRANDS_FOR_SELECT];
    } finally {
      brandsLoading.value = false;
    }
  };

  const handleAdd = async () => {
    dialogTitle.value = "Thêm điều khoản bảo hành";
    formData.value = {
      termName: "",
      brandId: undefined,
      vehicleType: "",
      errorCategory: "",
      description: "",
      durationMonths: undefined,
      durationKm: undefined,
      coverage: "",
      status: "Active" as WarrantyTermStatus,
      effectiveDate: new Date().toISOString().split("T")[0],
      expirationDate: "",
      mediaUrl: "",
      termNameJson: '{"vi":""}',
      descriptionJson: "",
    } as any;
    brandOptions.value = [];
    dialogVisible.value = true;
    await loadBrands();
  };

  const handleEdit = async (row: WarrantyTerm) => {
    dialogTitle.value = "Cập nhật điều khoản bảo hành";
    formData.value = { ...row };
    dialogVisible.value = true;
    await loadBrands();
  };

  const handleView = async (row: WarrantyTerm) => {
    try {
      const detail = await WarrantyTermApi.getById(row.id);
      dialogTitle.value = `Chi tiết: ${detail.termName}`;
      formData.value = { ...detail } as any;
      dialogVisible.value = true;
    } catch {
      formData.value = { ...row } as any;
      dialogTitle.value = `Chi tiết: ${row.termName}`;
      dialogVisible.value = true;
    }
  };

  const handleDelete = async (row: WarrantyTerm) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa điều khoản "${row.termName}" (${row.brandName}) không?`,
        "Xác nhận xóa",
        {
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
          type: "warning",
        },
      );
      await WarrantyTermApi.delete(row.id);
      ElMessage.success("Xóa điều khoản bảo hành thành công");
      fetchStatistics();
      getData();
    } catch (err: any) {
      if (err !== "cancel") {
        ElMessage.error(err.message || "Xóa thất bại");
      }
    }
  };

  const handleDeleteMany = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một điều khoản");
      return;
    }
    try {
      await ElMessageBox.confirm(
        `Xác nhận xóa ${selectedRows.value.length} điều khoản bảo hành?`,
        "Xác nhận",
        {
          type: "warning",
        },
      );
      const ids = selectedRows.value.map((r) => r.id);
      await Promise.all(ids.map((id) => WarrantyTermApi.delete(id)));
      ElMessage.success(`Đã xóa ${ids.length} điều khoản`);
      fetchStatistics();
      getData();
      selectedRows.value = [];
    } catch (err: any) {
      if (err !== "cancel") ElMessage.error(err.message || "Xóa thất bại");
    }
  };

  const searchForm = ref({
    searchTerm: "",
    brandId: undefined as number | undefined,
    status: [] as string[],
  });

  const searchItems = ref([
    {
      key: "searchTerm",
      label: "Tìm kiếm",
      type: "input",
      props: {
        placeholder: "Tên điều khoản...",
        clearable: true,
      },
    },
    {
      key: "brandId",
      label: "Hãng xe",
      type: "select",
      props: {
        options: BRANDS_FOR_SELECT.map((b) => ({
          label: b.name,
          value: b.id,
        })),
        clearable: true,
        filterable: true,
        placeholder: "Tất cả hãng",
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      props: {
        options: [
          { label: "Đang áp dụng", value: "Active" },
          { label: "Ngưng áp dụng", value: "Inactive" },
          { label: "Đã hết hạn", value: "Expired" },
        ],
        multiple: true,
        collapseTags: true,
        placeholder: "Chọn trạng thái...",
      },
    },
  ]);

  const handleSearch = () => {
    const filters: string[] = [];
    if (searchForm.value.searchTerm)
      filters.push(`TermName@=${searchForm.value.searchTerm}`);
    if (searchForm.value.brandId)
      filters.push(`BrandId==${searchForm.value.brandId}`);
    if (searchForm.value.status.length > 0)
      filters.push(`Status==${searchForm.value.status.join("|")}`);
    replaceSearchParams({
      Filters: filters.join(",") || undefined,
    });
    getData();
  };

  const handleReset = () => {
    searchForm.value = {
      searchTerm: "",
      brandId: undefined,
      status: [],
    };
    replaceSearchParams({ Filters: undefined });
    getData();
  };

  const submitForm = async () => {
    submitting.value = true;
    try {
      const payload: any = { ...formData.value };
      // Remove UI-only fields
      delete payload.brandName;
      if (formData.value.id) {
        await WarrantyTermApi.update(formData.value.id, payload);
        ElMessage.success("Cập nhật điều khoản bảo hành thành công");
      } else {
        await WarrantyTermApi.create(payload);
        ElMessage.success("Thêm điều khoản bảo hành thành công");
      }
      dialogVisible.value = false;
      fetchStatistics();
      getData();
    } catch (err: any) {
      ElMessage.error(err.message || "Thao tác thất bại");
    } finally {
      submitting.value = false;
    }
  };

  const refreshAll = () => {
    refreshData();
    fetchStatistics();
    selectedRows.value = [];
  };

  fetchStatistics();

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
    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    submitForm,
    searchForm,
    searchItems,
    getStatusType,
    getStatusLabel,
    formatDuration,
    brandOptions,
    brandsLoading,
  };
}
