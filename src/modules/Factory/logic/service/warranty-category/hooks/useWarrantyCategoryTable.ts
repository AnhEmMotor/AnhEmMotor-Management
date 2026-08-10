import { ref, onMounted, type Ref } from 'vue';
import { useTable } from '@/common/composables/useTable';
import { WarrantyTermApi } from '@/api/warranty';
import type { WarrantyTerm, WarrantyTermStatus } from '@/domain/warranty/warranty-category.types';
import { ElMessage, ElMessageBox } from 'element-plus';

const MOCK_WARRANTY_TERMS: WarrantyTerm[] = [
  {
    id: 1,
    brandId: 1,
    brandName: 'Honda',
    termName: 'Bảo hành tiêu chuẩn (Xăng & Nhỏ)',
    termNameJson: '{"vi":"Bảo hành tiêu chuẩn (Xăng & Nhỏ)"}',
    vehicleType: 'Xe máy xăng & phân khối nhỏ',
    errorCategory: 'Tổng hợp',
    description:
      'Bảo hành xe máy xăng và xe phân khối nhỏ. Các lỗi thường gặp: Cụm ly hợp (nồi) rung đầu giật cục, Hệ thống PGM-FI (chết bơm xăng, bướm ga, cảm biến CKP), Động cơ (kêu cam cò).',
    descriptionJson: '',
    durationMonths: 36,
    durationKm: 30000,
    coverage: 'Toàn bộ chi phí phụ tùng + nhân công (tùy điều kiện nào đến trước)',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 2,
    brandId: 1,
    brandName: 'Honda',
    termName: 'Bảo hành xe HEV (Hybrid)',
    termNameJson: '{"vi":"Bảo hành xe HEV (Hybrid)"}',
    vehicleType: 'Xe công nghệ HEV',
    errorCategory: 'Hệ thống Hybrid',
    description: 'Bảo hành bình điện hệ thống Hybrid.',
    durationMonths: 36,
    durationKm: 30000,
    coverage: 'Bình điện hệ thống Hybrid',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 3,
    brandId: 1,
    brandName: 'Honda',
    termName: 'Bảo hành Bình ắc quy 12V',
    termNameJson: '{"vi":"Bảo hành Bình ắc quy 12V"}',
    vehicleType: 'Tất cả xe Honda',
    errorCategory: 'Hệ thống điện',
    description: 'Bảo hành bình ắc quy 12V chính hãng.',
    durationMonths: 12,
    durationKm: 10000,
    coverage: 'Bình ắc quy 12V',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 4,
    brandId: 1,
    brandName: 'Honda',
    termName: 'Bảo hành Khung sườn & Điện tử',
    termNameJson: '{"vi":"Bảo hành Khung sườn & Điện tử"}',
    vehicleType: 'Tất cả xe Honda',
    errorCategory: 'Khung sườn, Điện tử, Phuộc',
    description:
      'Lỗi Hệ thống Khóa Smartkey (SCU không nhận diện FOB), Khung sườn eSAF (rỉ sét, bong tróc sơn, nứt gãy), Phuộc (xì dầu, kêu).',
    durationMonths: 36,
    durationKm: 30000,
    coverage: 'Sửa chữa hoặc thay thế bộ phận lỗi',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 5,
    brandId: 2,
    brandName: 'Yamaha',
    termName: 'Bảo hành tiêu chuẩn (Xe máy xăng)',
    termNameJson: '{"vi":"Bảo hành tiêu chuẩn (Xe máy xăng)"}',
    vehicleType: 'Xe máy xăng dưới 400cc (Exciter, NVX, Grande...)',
    errorCategory: 'Động cơ, Điện tử',
    description:
      'Bảo hành xe máy xăng. Lỗi thường gặp: Cụm van biến thiên VVA (trục trặc, kêu gõ), Hệ thống Y-Connect (lỗi Bluetooth CCU), Động cơ & Làm mát (rò rỉ nước mát, lỗi chén cổ).',
    durationMonths: 36,
    durationKm: 30000,
    coverage: 'Toàn bộ chi phí sửa chữa do lỗi NSX',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 6,
    brandId: 2,
    brandName: 'Yamaha',
    termName: "Bảo hành Xe máy điện (Neo's)",
    termNameJson: '{"vi":"Bảo hành Xe máy điện (Neo\'s)"}',
    vehicleType: "Xe máy điện (Yamaha Neo's)",
    errorCategory: 'Động cơ điện, Pin',
    description:
      'Bảo hành cả xe, bộ sạc và pin Lithium. Lỗi thường gặp: Động cơ điện YIPU (kẹt bó, rít), Pin Lithium-ion (lỗi mạch BMS sạc không vào, báo ảo).',
    durationMonths: 24,
    coverage: 'Toàn bộ xe, sạc, pin (Không giới hạn số km)',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 7,
    brandId: 2,
    brandName: 'Yamaha',
    termName: 'Bảo hành Bình ắc quy',
    termNameJson: '{"vi":"Bảo hành Bình ắc quy"}',
    vehicleType: 'Xe máy xăng',
    errorCategory: 'Hệ thống điện',
    description: 'Bảo hành bình ắc quy xe máy xăng.',
    durationMonths: 12,
    durationKm: 10000,
    coverage: 'Bình ắc quy',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 8,
    brandId: 3,
    brandName: 'Suzuki',
    termName: 'Bảo hành tiêu chuẩn (Xe máy)',
    termNameJson: '{"vi":"Bảo hành tiêu chuẩn (Xe máy)"}',
    vehicleType: 'Raider, Satria, Burgman...',
    errorCategory: 'Động cơ, Điện',
    description:
      'Bảo hành xe máy Suzuki. Lỗi thường gặp: Hệ thống cam/cò (kêu sên cam, kẹt xú páp), Hệ thống làm mát, Côn tay (sượng, kẹt số), ECM & Cảm biến (lỗi FI, đồng hồ vô nước).',
    durationMonths: 24,
    durationKm: 20000,
    coverage: 'Toàn bộ chi phí sửa chữa',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 9,
    brandId: 3,
    brandName: 'Suzuki',
    termName: 'Bảo hành Bình ắc quy',
    termNameJson: '{"vi":"Bảo hành Bình ắc quy"}',
    vehicleType: 'Tất cả',
    errorCategory: 'Hệ thống điện',
    description:
      'Bảo hành bình ắc quy (không áp dụng nếu lỗi do sử dụng sai: quá sạc, phóng điện quá mức).',
    durationMonths: 12,
    durationKm: 10000,
    coverage: 'Bình ắc quy',
    status: 'Active',
    effectiveDate: '2024-01-01',
    mediaUrl: '',
  },
  {
    id: 10,
    brandId: 6,
    brandName: 'VinFast',
    termName: 'Bảo hành tiêu chuẩn xe & pin LFP (Mới)',
    termNameJson: '{"vi":"Bảo hành tiêu chuẩn xe & pin LFP (Mới)"}',
    vehicleType: 'Xe máy điện (bán từ 15/08/2025)',
    errorCategory: 'Pin, Động cơ, Điện',
    description:
      'Chính sách mới: Bảo hành xe 6 năm, bảo hành pin LFP 8 năm (không giới hạn km). Lỗi thường gặp: Pin LFP (không nhận sạc, tụt áp), Bộ sạc, VCU, Động cơ điện, Tay ga điện, DC-DC.',
    durationMonths: 96,
    coverage: 'Xe 6 năm, Pin 8 năm (Không giới hạn km)',
    status: 'Active',
    effectiveDate: '2025-08-15',
    mediaUrl: '',
  },
  {
    id: 11,
    brandId: 6,
    brandName: 'VinFast',
    termName: 'Bảo hành tiêu chuẩn (Cũ)',
    termNameJson: '{"vi":"Bảo hành tiêu chuẩn (Cũ)"}',
    vehicleType: 'Xe máy điện thế hệ trước',
    errorCategory: 'Toàn bộ xe và pin',
    description: 'Thời gian bảo hành cho cả xe và pin thường là 5 năm, không giới hạn km.',
    durationMonths: 60,
    coverage: 'Xe và Pin (Không giới hạn km)',
    status: 'Active',
    effectiveDate: '2023-01-01',
    mediaUrl: '',
  },
  {
    id: 12,
    brandId: 6,
    brandName: 'VinFast',
    termName: 'Chính sách thuê pin',
    termNameJson: '{"vi":"Chính sách thuê pin"}',
    vehicleType: 'Xe máy điện (dịch vụ thuê pin)',
    errorCategory: 'Pin LFP / Lithium',
    description:
      'Thay thế và sửa chữa miễn phí khi pin gặp lỗi từ nhà sản xuất hoặc dung lượng tối đa (chai pin) tụt xuống dưới 70%.',
    coverage: 'Đổi pin miễn phí',
    status: 'Active',
    effectiveDate: '2023-01-01',
    mediaUrl: '',
  },
];

const BRANDS_FOR_SELECT: { id: number; name: string }[] = [
  { id: 1, name: 'Honda' },
  { id: 2, name: 'Yamaha' },
  { id: 3, name: 'Suzuki' },
  { id: 4, name: 'Piaggio (Vespa)' },
  { id: 5, name: 'SYM' },
  { id: 6, name: 'VinFast' },
];

export function useWarrantyCategoryTable() {
  const dialogVisible = ref(false);
  const dialogTitle = ref('');
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
    coveredBrandIds: [] as number[],
  });

  const updateSearchBrandOptions = () => {
    const brandSearchItem = searchItems.value.find(
      (item) => item.key === "brandId",
    );
    if (brandSearchItem) {
      const coveredIds = statistics.value.coveredBrandIds || [];
      // Only show brands that are currently covered by warranty terms
      const opts = brandOptions.value.filter((b) => coveredIds.includes(b.id));
      brandSearchItem.props.options = opts.map((b: any) => ({
        label: b.name,
        value: b.id,
      }));
    }
  };

  const handleSelectionChange = (selection: WarrantyTerm[]) => {
    selectedRows.value = selection;
  };

  const fetchStatistics = async () => {
    try {
      const rawRes = await WarrantyTermApi.getStatistics();
      const res: any = (rawRes as any)?.value ?? (rawRes as any)?.data ?? rawRes ?? {};
      statistics.value = {
        totalTerms: res.totalCount ?? res.totalTerms ?? 0,
        activeTerms: res.activeCount ?? res.activeTerms ?? 0,
        inactiveTerms: res.expiredCount ?? res.inactiveTerms ?? 0,
        brandsCovered: res.brandsCovered ?? 0,
        coveredBrandIds: res.coveredBrandIds ?? [],
      };
      updateSearchBrandOptions();
    } catch (_err) {
      statistics.value = {
        totalTerms: MOCK_WARRANTY_TERMS.length,
        activeTerms: MOCK_WARRANTY_TERMS.filter((t) => t.status === 'Active').length,
        inactiveTerms: MOCK_WARRANTY_TERMS.filter((t) => t.status !== 'Active').length,
        brandsCovered: new Set(MOCK_WARRANTY_TERMS.map((t) => t.brandId)).size,
        coveredBrandIds: Array.from(
          new Set(MOCK_WARRANTY_TERMS.map((t) => t.brandId)),
        ),
      };
      updateSearchBrandOptions();
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
      immediate: false,
      apiParams: {
        current: 1,
        size: 10,
      },
      columnsFactory: () =>
        [
          { type: 'selection', width: 50, align: 'center' },
          {
            prop: 'brandName',
            label: 'Hãng xe',
            minWidth: 140,
            useSlot: true,
          },
          {
            prop: 'termName',
            label: 'Tên điều khoản',
            minWidth: 200,
            useSlot: true,
          },
          {
            prop: 'vehicleType',
            label: 'Loại xe',
            minWidth: 150,
          },
          {
            prop: 'errorCategory',
            label: 'Loại lỗi',
            minWidth: 180,
            showOverflowTooltip: true,
          },
          {
            prop: 'duration',
            label: 'Thời hạn BH',
            minWidth: 160,
            align: 'center',
            useSlot: true,
          },
          {
            prop: 'coverage',
            label: 'Phạm vi BH',
            minWidth: 200,
            showOverflowTooltip: true,
          },
          {
            prop: 'status',
            label: 'Trạng thái',
            width: 120,
            align: 'center',
            useSlot: true,
          },
          {
            prop: 'operation',
            label: 'Thao tác',
            width: 160,
            useSlot: true,
            align: 'center',
          },
        ] as any,
    },
  });

  onMounted(async () => {
    await refreshData();
    if (data.value.length === 0) {
      (data as unknown as Ref<WarrantyTerm[]>).value = [...MOCK_WARRANTY_TERMS];
      (pagination as any).total = MOCK_WARRANTY_TERMS.length;
    }
    fetchStatistics();
    loadBrands();
  });

  const getStatusType = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'info';
      case 'Expired':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Active: 'Đang áp dụng',
      Inactive: 'Ngưng áp dụng',
      Expired: 'Đã hết hạn',
    };
    return map[status] || status;
  };

  const formatDuration = (row: any) => {
    const parts: string[] = [];
    if (row.durationMonths) parts.push(`${row.durationMonths} tháng`);
    if (row.durationKm) parts.push(`${row.durationKm.toLocaleString('vi-VN')} km`);
    return parts.length ? parts.join(' / ') : '-';
  };

  const loadBrands = async () => {
    brandsLoading.value = true;
    try {
      const res: any = await BrandApi.getList({ current: 1, size: 500 });
      const items = res?.items || res?.data?.items || [];
      const opts = items.map((b: any) => ({ id: b.id, name: b.name }));
      brandOptions.value = opts;

      updateSearchBrandOptions();
    } catch {
      brandOptions.value = [];
    } finally {
      brandsLoading.value = false;
    }
  };

  const handleAdd = async () => {
    dialogTitle.value = 'Thêm điều khoản bảo hành';
    formData.value = {
      termName: '',
      brandId: undefined,
      vehicleType: '',
      errorCategory: '',
      description: '',
      durationMonths: undefined,
      durationKm: undefined,
      coverage: '',
      status: 'Active' as WarrantyTermStatus,
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      mediaUrl: '',
      termNameJson: '{"vi":""}',
      descriptionJson: '',
    } as any;
    brandOptions.value = [];
    dialogVisible.value = true;
    await loadBrands();
  };

  const handleEdit = async (row: WarrantyTerm) => {
    dialogTitle.value = 'Cập nhật điều khoản bảo hành';
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
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning',
        }
      );
      await WarrantyTermApi.delete(row.id);
      ElMessage.success('Xóa điều khoản bảo hành thành công');
      fetchStatistics();
      getData();
    } catch (err: any) {
      if (err !== 'cancel') {
        ElMessage.error(err.message || 'Xóa thất bại');
      }
    }
  };

  const handleDeleteMany = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('Vui lòng chọn ít nhất một điều khoản');
      return;
    }
    try {
      await ElMessageBox.confirm(
        `Xác nhận xóa ${selectedRows.value.length} điều khoản bảo hành?`,
        'Xác nhận',
        {
          type: 'warning',
        }
      );
      const ids = selectedRows.value.map((r) => r.id);
      await Promise.all(ids.map((id) => WarrantyTermApi.delete(id)));
      ElMessage.success(`Đã xóa ${ids.length} điều khoản`);
      fetchStatistics();
      getData();
      selectedRows.value = [];
    } catch (err: any) {
      if (err !== 'cancel') ElMessage.error(err.message || 'Xóa thất bại');
    }
  };

  const searchForm = ref({
    searchTerm: '',
    brandId: undefined as number | undefined,
    status: [] as string[],
  });

  const searchItems = ref([
    {
      key: 'searchTerm',
      label: 'Tìm kiếm',
      type: 'input',
      props: {
        placeholder: 'Tên điều khoản...',
        clearable: true,
      },
    },
    {
      key: 'brandId',
      label: 'Hãng xe',
      type: 'select',
      props: {
        options: [], // populated asynchronously
        clearable: true,
        filterable: true,
        placeholder: 'Tất cả hãng',
      },
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      props: {
        options: [
          { label: 'Đang áp dụng', value: 'Active' },
          { label: 'Ngưng áp dụng', value: 'Inactive' },
          { label: 'Đã hết hạn', value: 'Expired' },
        ],
        multiple: true,
        collapseTags: true,
        placeholder: 'Chọn trạng thái...',
      },
    },
  ]);

  const handleSearch = () => {
    const filters: string[] = [];
    if (searchForm.value.searchTerm) filters.push(`TermName@=${searchForm.value.searchTerm}`);
    if (searchForm.value.brandId) filters.push(`BrandId==${searchForm.value.brandId}`);
    if (searchForm.value.status.length > 0)
      filters.push(`Status==${searchForm.value.status.join('|')}`);
    replaceSearchParams({
      Filters: filters.join(',') || undefined,
    });
    getData();
  };

  const handleReset = () => {
    searchForm.value = {
      searchTerm: '',
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
      delete payload.brandName;
      if (formData.value.id) {
        await WarrantyTermApi.update(formData.value.id, payload);
        ElMessage.success('Cập nhật điều khoản bảo hành thành công');
      } else {
        await WarrantyTermApi.create(payload);
        ElMessage.success('Thêm điều khoản bảo hành thành công');
      }
      dialogVisible.value = false;
      fetchStatistics();
      getData();
    } catch (err: any) {
      ElMessage.error(err.message || 'Thao tác thất bại');
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
