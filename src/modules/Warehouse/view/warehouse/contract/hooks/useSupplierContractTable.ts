import { reactive, ref, onMounted } from 'vue';
import { SupplierContractApi } from '@/api/supplier/supplier-contract.api';
import type {
  SupplierContractDto,
  SupplierContractListParams,
  SupplierContractStatisticsResponse,
} from '@/api/supplier/supplier-contract.api';
import { ElMessage, ElMessageBox } from 'element-plus';

export const useSupplierContractTable = () => {
  const data = ref<SupplierContractDto[]>([]);
  const loading = ref(false);
  const exporting = ref(false);

  const stats = ref<SupplierContractStatisticsResponse>({
    totalContracts: 0,
    activeContracts: 0,
    pendingApproval: 0,
    expiredContracts: 0,
    expiringContracts: 0,
  });

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  });

  const searchForm = reactive({
    contractNumber: '',
    status: [] as string[],
    supplierId: '',
  });

  const columns: any[] = [
    { type: 'selection', width: 50, fixed: 'left' },
    { label: 'Mã Hợp Đồng', prop: 'contractNumber', width: 150, fixed: 'left' },
    { label: 'Nhà cung cấp', prop: 'supplierName', minWidth: 200 },
    {
      label: 'Ngày hiệu lực',
      prop: 'effectiveDate',
      width: 120,
      formatter: (row: any) =>
        row.effectiveDate ? new Date(row.effectiveDate).toLocaleDateString('vi-VN') : '',
    },
    {
      label: 'Ngày hết hạn',
      prop: 'expirationDate',
      width: 120,
      formatter: (row: any) =>
        row.expirationDate ? new Date(row.expirationDate).toLocaleDateString('vi-VN') : '',
    },
    {
      label: 'Giá trị (VNĐ)',
      prop: 'contractValue',
      width: 150,
      align: 'right',
      formatter: (row: any) => row.contractValue?.toLocaleString(),
    },
    {
      label: 'Hạn mức (VNĐ)',
      prop: 'creditLimit',
      width: 150,
      align: 'right',
      formatter: (row: any) => row.creditLimit?.toLocaleString(),
    },
  ];

  const columnChecks = ref(
    columns.map((col) => ({
      ...col,
      checked: true,
      visible: true,
    }))
  );

  const searchItems = [
    {
      key: 'contractNumber',
      label: 'Mã hợp đồng',
      prop: 'contractNumber',
      type: 'input',
      placeholder: 'Nhập mã HĐ...',
    },
    {
      key: 'status',
      label: 'Trạng thái',
      prop: 'status',
      type: 'select',
      placeholder: 'Chọn trạng thái...',
      multiple: true,
      options: [
        { label: 'Bản nháp', value: 'Draft' },
        { label: 'Chờ duyệt', value: 'PendingApproval' },
        { label: 'Đang hiệu lực', value: 'Active' },
        { label: 'Hết hạn', value: 'Expired' },
        { label: 'Đã chấm dứt', value: 'Terminated' },
        { label: 'Hoàn thành', value: 'Completed' },
      ],
    },
  ];

  const selectedRows = ref<SupplierContractDto[]>([]);
  const handleSelectionChange = (rows: SupplierContractDto[]) => {
    selectedRows.value = rows;
  };

  const getStats = async () => {
    try {
      const res = await SupplierContractApi.getStatistics();
      if (res) {
        stats.value = res;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const params: SupplierContractListParams = {
        current: pagination.current,
        size: pagination.size,
        ...searchForm,
      };

      const res = await SupplierContractApi.getList(params);
      if (res && res.items) {
        data.value = res.items;
        pagination.total = res.totalCount;
      }
    } catch (err) {
      ElMessage.error('Không thể lấy danh sách hợp đồng');
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  const handleReset = () => {
    searchForm.contractNumber = '';
    searchForm.status = [];
    searchForm.supplierId = '';
    handleSearch();
  };

  const handleSizeChange = (val: number) => {
    pagination.size = val;
    pagination.current = 1;
    fetchData();
  };

  const handleCurrentChange = (val: number) => {
    pagination.current = val;
    fetchData();
  };

  const refreshData = () => {
    fetchData();
    getStats();
  };

  const dialogVisible = ref(false);
  const dialogTitle = ref('Thêm mới hợp đồng');
  const submitting = ref(false);
  const formData = reactive<Partial<SupplierContractDto>>({
    id: undefined,
    supplierId: undefined,
    contractNumber: '',
    effectiveDate: '',
    expirationDate: '',
    contractValue: 0,
    status: 'Draft',
    creditLimit: 0,
    paymentWindowDays: 0,
    note: '',
  });

  const handleAdd = () => {
    dialogTitle.value = 'Thêm mới hợp đồng';
    Object.assign(formData, {
      id: undefined,
      supplierId: undefined,
      contractNumber: '',
      effectiveDate: '',
      expirationDate: '',
      contractValue: 0,
      status: 'Draft',
      creditLimit: 0,
      paymentWindowDays: 0,
      note: '',
    });
    dialogVisible.value = true;
  };

  const handleEdit = async (row: SupplierContractDto) => {
    dialogTitle.value = 'Cập nhật hợp đồng';
    loading.value = true;
    try {
      const res = await SupplierContractApi.getById(row.id);
      Object.assign(formData, res);
      dialogVisible.value = true;
    } catch (err) {
      ElMessage.error('Không thể lấy thông tin hợp đồng');
    } finally {
      loading.value = false;
    }
  };

  const submitForm = async () => {
    submitting.value = true;
    try {
      if (formData.id) {
        await SupplierContractApi.update(formData.id, formData);
        ElMessage.success('Cập nhật hợp đồng thành công');
      } else {
        await SupplierContractApi.create(formData);
        ElMessage.success('Thêm mới hợp đồng thành công');
      }
      dialogVisible.value = false;
      refreshData();
    } catch (err) {
      ElMessage.error('Lưu hợp đồng thất bại');
    } finally {
      submitting.value = false;
    }
  };

  const handleDelete = async (row: SupplierContractDto) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc muốn xóa hợp đồng ${row.contractNumber}?`,
        'Xác nhận xóa',
        { type: 'warning' }
      );
      await SupplierContractApi.delete(row.id);
      ElMessage.success('Xóa hợp đồng thành công');
      refreshData();
    } catch (err: any) {
      if (err !== 'cancel') {
        ElMessage.error('Xóa hợp đồng thất bại');
      }
    }
  };

  const updateStatus = async (row: SupplierContractDto, status: any) => {
    try {
      await SupplierContractApi.updateStatus(row.id, { status });
      ElMessage.success('Đổi trạng thái thành công');
      refreshData();
    } catch (err) {
      ElMessage.error('Đổi trạng thái thất bại');
    }
  };

  onMounted(() => {
    fetchData();
    getStats();
  });

  return {
    data,
    loading,
    exporting,
    stats,
    pagination,
    searchForm,
    searchItems,
    columns,
    columnChecks,
    selectedRows,
    handleSelectionChange,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleEdit,
    handleDelete,
    submitForm,
    updateStatus,
  };
};
