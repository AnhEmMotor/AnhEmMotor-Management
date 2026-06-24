import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDebounceFn } from "@vueuse/core";
import { PurchaseRequestApi } from "@/api/purchase-request.api";
import { ProductApi } from "@/api/product.api";
import { QuotationApi } from "@/api/quotation.api";
import type {
  PurchaseRequestListResponse,
  PurchaseRequestDetailResponse,
} from "@/domain/purchase-request/request.types";
import type { ProductVariantLiteForInput } from "@/domain/product/product.types";

export function usePurchaseRequestTable() {
  const loading = ref(false);
  const dialogVisible = ref(false);
  const dialogTitle = ref("Tạo yêu cầu mua hàng mới");
  const submitting = ref(false);
  const isEdit = ref(false);

  const detailDialogVisible = ref(false);
  const detailData = ref<PurchaseRequestDetailResponse | null>(null);

  const productCache = reactive(
    new Map<number, { displayName: string; colorName?: string }>(),
  );

  const getProductNameById = (id?: number) => {
    if (!id) return "";
    return productCache.get(Number(id))?.displayName || `Sản phẩm #${id}`;
  };

  const getProductColorName = (row: any) => {
    return (
      row.productVariantColorName ||
      productCache.get(Number(row.productVariantId))?.colorName ||
      ""
    );
  };

  const getVariantColorKey = (variant: ProductVariantLiteForInput) =>
    String(variant.id);

  const getSelectedVariantColor = (variant: ProductVariantLiteForInput) => {
    const selectedColorId = selectedVariantColors[getVariantColorKey(variant)];
    return variant.colors?.find((color) => color.id === selectedColorId);
  };

  const getVariantColorLabel = (
    color: NonNullable<ProductVariantLiteForInput["colors"]>[number],
  ) => {
    return color.colorName || `Màu #${color.id}`;
  };

  const getVariantDisplayNameWithColor = (
    variant: ProductVariantLiteForInput,
  ) => {
    const displayName = variant.displayName || `Sản phẩm #${variant.id}`;
    const selectedColor = getSelectedVariantColor(variant);
    if (!selectedColor) return displayName;
    return `${displayName} - ${getVariantColorLabel(selectedColor)}`;
  };

  const productSelectorVisible = ref(false);
  const productSelectorLoading = ref(false);
  const productSelectorQuery = ref("");
  const productSelectorPage = ref(1);
  const productSelectorPageSize = ref(10);
  const productSelectorTotal = ref(0);
  const productSelectorItems = ref<ProductVariantLiteForInput[]>([]);
  const selectedVariantColors = reactive<Record<string, number | undefined>>(
    {},
  );
  const productSelectorActiveRowIndex = ref<number | null>(null);

  const initializeVariantColorSelection = (
    variants: ProductVariantLiteForInput[],
  ) => {
    variants.forEach((variant) => {
      const key = getVariantColorKey(variant);
      if (selectedVariantColors[key] || !variant.colors?.length) return;
      selectedVariantColors[key] = variant.colors[0].id;
    });
  };

  const fetchSelectorProducts = async () => {
    productSelectorLoading.value = true;
    try {
      const filters = [];
      if (productSelectorQuery.value.trim()) {
        filters.push(`search@=${productSelectorQuery.value.trim()}`);
      }
      const res = await ProductApi.getVariantsForInput({
        current: productSelectorPage.value,
        size: productSelectorPageSize.value,
        Filters: filters.join(","),
      });
      productSelectorItems.value = res.items || [];
      initializeVariantColorSelection(productSelectorItems.value);
      productSelectorTotal.value = res.totalCount || 0;
    } catch (err) {
      console.error("Failed to fetch selector products:", err);
    } finally {
      productSelectorLoading.value = false;
    }
  };

  const openProductSelector = (rowIndex?: number) => {
    productSelectorActiveRowIndex.value =
      rowIndex !== undefined ? rowIndex : null;
    productSelectorQuery.value = "";
    productSelectorPage.value = 1;
    productSelectorVisible.value = true;
    fetchSelectorProducts();
  };

  const selectProductVariant = (variant: ProductVariantLiteForInput) => {
    if (!variant.id) return;
    const productVariantColorId =
      selectedVariantColors[getVariantColorKey(variant)];
    if (variant.colors?.length && !productVariantColorId) {
      ElMessage.warning("Vui lòng chọn màu cho biến thể sản phẩm này");
      return;
    }

    const displayName = getVariantDisplayNameWithColor(variant);
    const selectedColor = getSelectedVariantColor(variant);
    productCache.set(variant.id, {
      displayName,
      colorName: selectedColor?.colorName,
    });

    if (productSelectorActiveRowIndex.value !== null) {
      const idx = productSelectorActiveRowIndex.value;
      if (formData.value.items[idx]) {
        const row = formData.value.items[idx];

        const existsIdx = formData.value.items.findIndex(
          (item, i) =>
            i !== idx &&
            item.productVariantId === variant.id &&
            item.productVariantColorId === productVariantColorId,
        );

        if (existsIdx > -1) {
          formData.value.items[existsIdx].quantity =
            (formData.value.items[existsIdx].quantity || 0) +
            (row.quantity || 1);
          formData.value.items.splice(idx, 1);
          ElMessage.success(
            "Sản phẩm đã tồn tại trong yêu cầu. Đã gộp và cộng dồn số lượng.",
          );
        } else {
          row.productVariantId = variant.id;
          row.productVariantColorId = productVariantColorId;
          row.productVariantColorName = selectedColor?.colorName;
        }
      }
    } else {
      const items = formData.value.items;
      const lastRow = items[items.length - 1];

      const existsIdx = items.findIndex(
        (item) =>
          item.productVariantId === variant.id &&
          item.productVariantColorId === productVariantColorId,
      );

      if (existsIdx > -1) {
        items[existsIdx].quantity = (items[existsIdx].quantity || 0) + 1;
        if (lastRow && lastRow.productVariantId === undefined) {
          items.splice(items.length - 1, 1);
        }
      } else {
        if (lastRow && lastRow.productVariantId === undefined) {
          lastRow.productVariantId = variant.id;
          lastRow.productVariantColorId = productVariantColorId;
          lastRow.productVariantColorName = selectedColor?.colorName;
        } else {
          items.push({
            productVariantId: variant.id,
            productVariantColorId,
            productVariantColorName: selectedColor?.colorName,
            quantity: 1,
          });
        }
      }
    }
    productSelectorVisible.value = false;
  };

  const handleProductSelectorSearch = useDebounceFn(async (query: string) => {
    productSelectorQuery.value = query;
    productSelectorPage.value = 1;
    await fetchSelectorProducts();
  }, 300);

  const formData = ref<{
    id?: number;
    note: string;
    items: Array<{
      id?: number;
      productVariantId: number | undefined;
      productVariantColorId?: number;
      productVariantColorName?: string;
      quantity: number;
      productQuotationId?: number;
      unitPrice?: number;
      supplierId?: number;
      supplierName?: string;
    }>;
  }>({
    note: "",
    items: [],
  });

  const data = ref<PurchaseRequestListResponse[]>([]);
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  });

  const statusMap = ref<Record<string, string>>({});

  const fetchStatuses = async () => {
    try {
      const res = await PurchaseRequestApi.getStatuses();
      statusMap.value = res || {};
    } catch (e) {
      console.error("Failed to load purchase request statuses", e);
    }
  };

  const quoteDialogVisible = ref(false);
  const activeQuoteRowIndex = ref<number | null>(null);
  const quoteLoading = ref(false);
  const quotesList = ref<any[]>([]);
  const quotePage = ref(1);
  const quotePageSize = ref(5);
  const quoteTotal = computed(() => quotesList.value.length);

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const paginatedQuotes = computed(() => {
    const start = (quotePage.value - 1) * quotePageSize.value;
    const end = start + quotePageSize.value;
    return quotesList.value.slice(start, end);
  });

  const openQuoteDialog = async (row: any, index: number) => {
    if (!row.productVariantId) {
      ElMessage.warning("Vui lòng chọn sản phẩm trước khi chọn báo giá");
      return;
    }
    activeQuoteRowIndex.value = index;
    quoteDialogVisible.value = true;
    quotePage.value = 1;
    quoteLoading.value = true;
    try {
      const res = await QuotationApi.getApprovedPrices(
        row.productVariantId,
        row.productVariantColorId,
      );
      quotesList.value = res || [];
    } catch (e) {
      console.error(e);
      ElMessage.error("Không thể tải danh sách báo giá");
      quotesList.value = [];
    } finally {
      quoteLoading.value = false;
    }
  };

  const applyQuoteFromDialog = (quote: any) => {
    if (activeQuoteRowIndex.value !== null) {
      const row = formData.value.items[activeQuoteRowIndex.value];
      if (row) {
        row.productQuotationId = quote.productQuotationId;
        row.supplierId = quote.supplierId;
        row.supplierName = quote.supplierName;
        row.unitPrice = quote.quotePrice;
        ElMessage.success("Đã áp dụng báo giá");
      }
      quoteDialogVisible.value = false;
    }
  };

  const searchForm = ref({
    status: [] as string[],
  });

  const searchItems = computed(() => [
    {
      key: "status",
      label: "Trạng thái",
      type: "select",
      props: {
        placeholder: "Tất cả trạng thái",
        clearable: true,
        multiple: true,
        collapseTags: true,
        options: Object.entries(statusMap.value).map(([key, label]) => ({
          label,
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
    { label: "Ghi chú", prop: "note", minWidth: 200 },
    { label: "Người tạo", prop: "createdByName", minWidth: 150 },
    { label: "Số mặt hàng", prop: "totalItems", width: 120, align: "center" },
    {
      label: "Trạng thái",
      prop: "status",
      useSlot: true,
      width: 130,
      align: "center",
    },
    {
      label: "Đã nhập kho",
      prop: "isFullyImported",
      useSlot: true,
      width: 150,
      align: "center",
    },
    {
      label: "Thao tác",
      prop: "operation",
      useSlot: true,
      width: 170,
      fixed: "right" as const,
      align: "center",
    },
  ]);

  const columnChecks = ref(columns.value);

  const getStatusLabel = (status?: string) => {
    if (!status) return "-";
    return statusMap.value[status.toLowerCase()] || status;
  };

  const getStatusTagType = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "draft":
        return "info";
      case "sent":
        return "warning";
      case "approve":
      case "approved":
        return "success";
      case "reject":
      case "rejected":
        return "danger";
      default:
        return "info";
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const loadData = async () => {
    loading.value = true;
    try {
      const sieveFilters = [];
      if (searchForm.value.status && searchForm.value.status.length > 0) {
        sieveFilters.push(`Status==${searchForm.value.status.join("|")}`);
      }

      const res = await PurchaseRequestApi.getList({
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(",") || undefined,
        Sorts: "-createdAt",
      });

      data.value = res.items || [];
      pagination.total = res.totalCount || 0;
    } catch (error) {
      console.error(error);
      ElMessage.error("Không thể tải danh sách Yêu cầu mua hàng");
    } finally {
      loading.value = false;
    }
  };

  const refreshData = () => {
    loadData();
    selectedRows.value = [];
  };

  const handleSearch = () => {
    pagination.current = 1;
    loadData();
  };

  const handleReset = () => {
    searchForm.value.status = [];
    pagination.current = 1;
    loadData();
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

  const handleAdd = () => {
    isEdit.value = false;
    dialogTitle.value = "Tạo yêu cầu mua hàng mới";
    formData.value = {
      note: "",
      items: [],
    };
    dialogVisible.value = true;
  };

  const handleEdit = async (row: PurchaseRequestListResponse) => {
    try {
      loading.value = true;
      const detail = await PurchaseRequestApi.getById(row.id);
      isEdit.value = true;
      dialogTitle.value = `Chỉnh sửa Yêu cầu mua hàng #${detail.id}`;

      detail.items.forEach((item) => {
        productCache.set(item.productVariantId, {
          displayName: item.productName || `Biến thể #${item.productVariantId}`,
          colorName: item.productVariantColorName,
        });
      });

      formData.value = {
        id: detail.id,
        note: detail.note || "",
        items: detail.items.map((item) => ({
          id: item.id,
          productVariantId: item.productVariantId,
          productVariantColorId: item.productVariantColorId,
          productVariantColorName: item.productVariantColorName,
          quantity: item.quantity,
          productQuotationId: item.productQuotationId,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          unitPrice: item.unitPrice,
          maxUnimportedQuantity: item.unimportedQuantity,
        })),
      };
      dialogVisible.value = true;
    } catch (e) {
      console.error(e);
      ElMessage.error("Không thể tải chi tiết yêu cầu");
    } finally {
      loading.value = false;
    }
  };

  const handleDelete = async (row: PurchaseRequestListResponse) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc muốn xóa yêu cầu mua hàng #${row.id}?`,
        "Xác nhận xóa",
        {
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
          type: "warning",
        },
      );
      await PurchaseRequestApi.delete(row.id);
      ElMessage.success("Xóa yêu cầu thành công");
      refreshData();
    } catch (e) {
      if (e !== "cancel") {
        ElMessage.error("Xóa Có lỗi từ hệ thống");
      }
    }
  };

  const handleSendRequest = async (row: any) => {
    try {
      await ElMessageBox.confirm(
        `Gửi yêu cầu mua hàng #${row.id} lên cấp trên phê duyệt?`,
        "Gửi phê duyệt",
        {
          confirmButtonText: "Gửi",
          cancelButtonText: "Hủy",
          type: "info",
        },
      );
      await PurchaseRequestApi.send(row.id);
      ElMessage.success("Gửi phê duyệt thành công");
      refreshData();
      if (detailDialogVisible.value && detailData.value?.id === row.id) {
        detailDialogVisible.value = false;
      }
    } catch (e) {
      if (e !== "cancel") {
        ElMessage.error("Gửi duyệt thất bại");
      }
    }
  };

  const handleViewDetail = async (row: PurchaseRequestListResponse) => {
    try {
      loading.value = true;
      detailData.value = await PurchaseRequestApi.getById(row.id);
      detailDialogVisible.value = true;
    } catch (e) {
      console.error(e);
      ElMessage.error("Không thể lấy chi tiết yêu cầu");
    } finally {
      loading.value = false;
    }
  };

  const handleApproveRejectStatus = async (
    id: number,
    status: "approve" | "reject",
  ) => {
    try {
      const verb = status === "approve" ? "phê duyệt" : "từ chối";
      await ElMessageBox.confirm(
        `Bạn có chắc muốn ${verb} yêu cầu mua hàng #${id}?`,
        "Xác nhận hành động",
        {
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
          type: status === "approve" ? "success" : "warning",
        },
      );
      await PurchaseRequestApi.approveReject(id, status);
      ElMessage.success(`Đã ${verb} yêu cầu mua hàng`);
      if (detailDialogVisible.value && detailData.value?.id === id) {
        detailDialogVisible.value = false;
      }
      refreshData();
    } catch (e) {
      if (e !== "cancel") {
        ElMessage.error("Cập nhật trạng thái thất bại");
      }
    }
  };

  const handleAddProductRow = () => {
    openProductSelector();
  };

  const handleRemoveProductRow = (index: number) => {
    formData.value.items.splice(index, 1);
  };

  const submitForm = async () => {
    const validItems = formData.value.items.filter(
      (x) => x.productVariantId !== undefined && x.productVariantId !== null,
    );

    if (validItems.length === 0) {
      ElMessage.warning("Vui lòng thêm ít nhất một sản phẩm yêu cầu");
      return;
    }

    submitting.value = true;
    try {
      if (isEdit.value && formData.value.id) {
        const payload = {
          note: formData.value.note,
          items: validItems.map((i) => ({
            id: i.id,
            productVariantId: i.productVariantId,
            productVariantColorId: i.productVariantColorId,
            quantity: i.quantity,
            productQuotationId: i.productQuotationId,
            supplierId: i.supplierId,
            unitPrice: i.unitPrice,
          })),
        };
        await PurchaseRequestApi.update(formData.value.id, payload);
        ElMessage.success("Cập nhật yêu cầu mua hàng thành công");
      } else {
        const payload = {
          note: formData.value.note,
          items: validItems.map((i) => ({
            productVariantId: i.productVariantId,
            productVariantColorId: i.productVariantColorId,
            quantity: i.quantity,
            productQuotationId: i.productQuotationId,
            supplierId: i.supplierId,
            unitPrice: i.unitPrice,
          })),
        };
        await PurchaseRequestApi.create(payload);
        ElMessage.success("Tạo yêu cầu mua hàng thành công");
      }
      dialogVisible.value = false;
      refreshData();
    } catch (e: any) {
      console.error(e);
      ElMessage.error(e.message || "Lưu yêu cầu mua hàng thất bại");
    } finally {
      submitting.value = false;
    }
  };

  // --- MỚI: Chọn nhiều để Xoá, Nhân bản ---
  const selectedRows = ref<PurchaseRequestListResponse[]>([]);

  const handleSelectionChange = (rows: PurchaseRequestListResponse[]) => {
    selectedRows.value = rows;
  };

  const handleDeleteMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một yêu cầu mua hàng");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedRows.value.length} yêu cầu đã chọn?`,
      "Xác nhận xóa",
      {
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await PurchaseRequestApi.deleteMany(ids);
        ElMessage.success("Xóa hàng loạt thành công");
        refreshData();
      } catch (err: any) {
        ElMessage.error(err.message || "Xóa hàng loạt thất bại");
      }
    });
  };

  const handleCloneMany = () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning(
        "Vui lòng chọn ít nhất một yêu cầu mua hàng để nhân bản",
      );
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn nhân bản ${selectedRows.value.length} yêu cầu đã chọn?`,
      "Xác nhận nhân bản",
      {
        confirmButtonText: "Nhân bản",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedRows.value.map((item) => item.id);
        await PurchaseRequestApi.cloneMany(ids);
        ElMessage.success("Nhân bản hàng loạt thành công");
        refreshData();
      } catch (err: any) {
        ElMessage.error(err.message || "Nhân bản hàng loạt thất bại");
      }
    });
  };

  // --- MỚI: Khôi phục nhiều ---
  const restoreDialogVisible = ref(false);
  const deletedRequestsData = ref<PurchaseRequestListResponse[]>([]);
  const deletedRequestsLoading = ref(false);
  const selectedDeletedRequests = ref<PurchaseRequestListResponse[]>([]);

  const handleDeletedSelectionChange = (
    rows: PurchaseRequestListResponse[],
  ) => {
    selectedDeletedRequests.value = rows;
  };

  const openRestoreDialog = async () => {
    restoreDialogVisible.value = true;
    deletedRequestsLoading.value = true;
    selectedDeletedRequests.value = [];
    try {
      const res = await PurchaseRequestApi.getDeletedList({
        current: 1,
        size: 1000,
      });
      deletedRequestsData.value = res.items || [];
    } catch {
      ElMessage.error("Không thể tải danh sách PR đã xóa");
    } finally {
      deletedRequestsLoading.value = false;
    }
  };

  const handleRestoreMany = () => {
    if (selectedDeletedRequests.value.length === 0) {
      ElMessage.warning("Vui lòng chọn ít nhất một yêu cầu để khôi phục");
      return;
    }
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedDeletedRequests.value.length} yêu cầu đã chọn?`,
      "Xác nhận khôi phục",
      {
        confirmButtonText: "Khôi phục",
        cancelButtonText: "Hủy",
        type: "warning",
      },
    ).then(async () => {
      try {
        const ids = selectedDeletedRequests.value.map((item) => item.id);
        await PurchaseRequestApi.restoreMany(ids);
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
      const res = await PurchaseRequestApi.importExcel(file);
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

  const handleDownloadTemplate = async () => {
    try {
      const resBlob = await PurchaseRequestApi.downloadImportTemplate();
      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Mau_nhap_yeu_cau_mua_hang.xlsx");
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
      if (searchForm.value.status && searchForm.value.status.length > 0) {
        sieveFilters.push(`Status==${searchForm.value.status.join("|")}`);
      }

      const resBlob = await PurchaseRequestApi.exportExcel({
        Filters: sieveFilters.join(",") || undefined,
        Sorts: "-createdAt",
      });

      const url = window.URL.createObjectURL(new Blob([resBlob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Danh_sach_yeu_cau_mua_hang.xlsx");
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
    await fetchStatuses();
    await loadData();
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
    refreshData,
    searchForm,
    searchItems,

    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    isEdit,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,

    detailDialogVisible,
    detailData,
    handleViewDetail,
    handleApproveRejectStatus,
    handleSendRequest,

    productSelectorVisible,
    productSelectorLoading,
    productSelectorQuery,
    productSelectorPage,
    productSelectorPageSize,
    productSelectorTotal,
    productSelectorItems,
    selectedVariantColors,
    fetchSelectorProducts,
    productSelectorActiveRowIndex,
    openProductSelector,
    selectProductVariant,
    handleProductSelectorSearch,
    handleAddProductRow,
    handleRemoveProductRow,
    getProductNameById,
    getProductColorName,
    getVariantDisplayNameWithColor,
    getSelectedVariantColor,

    quoteDialogVisible,
    activeQuoteRowIndex,
    quoteLoading,
    quotesList,
    quotePage,
    quotePageSize,
    quoteTotal,
    paginatedQuotes,
    openQuoteDialog,
    applyQuoteFromDialog,
    formatCurrency,

    formatDateTime,
    getStatusLabel,
    getStatusTagType,

    selectedRows,
    handleSelectionChange,
    handleDeleteMany,
    handleCloneMany,

    restoreDialogVisible,
    deletedRequestsData,
    deletedRequestsLoading,
    selectedDeletedRequests,
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
