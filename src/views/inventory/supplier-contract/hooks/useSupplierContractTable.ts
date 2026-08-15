import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { SupplierContractApi } from '@/api/supplier/supplier-contract.api';
import type { 
  SupplierContractDto, 
  SupplierContractStatisticsResponse, 
  SupplierContractMutation, 
  SupplierContractStatus 
} from '@/domain/supplier/contract.types';

export function useSupplierContractTable() {
  const loading = ref(false);
  const dialogVisible = ref(false);
  const dialogTitle = ref('Thêm hợp đồng');
  const submitting = ref(false);
  const suppliers = ref<{ id: number; name: string }[]>([]);
  
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

  const data = ref<SupplierContractDto[]>([]);

  const formData = ref<Partial<SupplierContractMutation> & { id?: string }>({
    supplierId: undefined,
    contractNumber: '',
    effectiveDate: '',
    expirationDate: '',
    contractValue: 0,
    status: 'Draft',
    terms: '',
    note: '',
  });

  const searchForm = ref({
    contractNumber: '',
    supplierId: '',
    status: [] as string[],
  });

  const loadSuppliers = async () => {
    try {
      suppliers.value = await SupplierContractApi.getSuppliersForSelect();
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadStats = async () => {
    try {
      stats.value = await SupplierContractApi.getStatistics();
    } catch (error) {
      console.error('Failed to load supplier contract statistics:', error);
    }
  };

  const loadDataWithFilters = async (filters?: any) => {
    loading.value = true;
    try {
      const sieveFilters = [];
      const keyword = filters?.contractNumber?.trim() || searchForm.value.contractNumber?.trim();
      if (keyword) {
        sieveFilters.push(`ContractNumber@=${keyword}`);
      }

      const supplierId = filters?.supplierId || searchForm.value.supplierId;
      if (supplierId) {
        sieveFilters.push(`SupplierId==${supplierId}`);
      }

      const statusFiltersValue = filters?.status || searchForm.value.status;
      if (statusFiltersValue && statusFiltersValue.length > 0) {
        if (Array.isArray(statusFiltersValue)) {
          const statusFilters = `Status==${statusFiltersValue.join('|')}`;
          sieveFilters.push(statusFilters);
        } else {
          sieveFilters.push(`Status==${statusFiltersValue}`);
        }
      }

      const params: any = {
        current: pagination.current,
        size: pagination.size,
        Filters: sieveFilters.join(',') || undefined,
        Sorts: '-CreatedAt',
      };

      const res = await SupplierContractApi.getList(params);
      console.log('API Response items:', res.items);
      data.value = res.items || [];
      pagination.total = res.totalCount || 0;
    } catch (error) {
      console.error('Failed to load supplier contracts:', error);
      ElMessage.error('Không thể tải danh sách hợp đồng');
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
    searchForm.value.contractNumber = '';
    searchForm.value.supplierId = '';
    searchForm.value.status = [];
    pagination.current = 1;
    refreshAll();
  };

  const handleSearch = (filters: any) => {
    searchForm.value = { ...filters };
    pagination.current = 1;
    loadDataWithFilters(filters);
  };

  const handleAdd = () => {
    dialogTitle.value = 'Thêm hợp đồng mới';
    formData.value = {
      supplierId: undefined,
      contractNumber: '',
      effectiveDate: new Date().toISOString(),
      expirationDate: '',
      contractValue: 0,
      status: 'Draft',
      terms: '',
      note: '',
    };
    dialogVisible.value = true;
  };

  const handleEdit = (row: SupplierContractDto) => {
    dialogTitle.value = 'Cập nhật hợp đồng';
    formData.value = { 
      id: row.id,
      supplierId: row.supplierId,
      contractNumber: row.contractNumber,
      effectiveDate: row.effectiveDate,
      expirationDate: row.expirationDate,
      contractValue: row.contractValue,
      status: row.status,
      terms: row.terms,
      note: row.note,
    };
    dialogVisible.value = true;
  };

  const handleDelete = async (row: SupplierContractDto) => {
    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn xóa hợp đồng "${row.contractNumber}"?`,
        'Xác nhận xóa',
        {
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy',
          type: 'warning',
        }
      );
      await SupplierContractApi.delete(row.id);
      ElMessage.success('Xóa thành công');
      refreshAll();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete contract:', error);
        ElMessage.error('Không thể xóa hợp đồng');
      }
    }
  };

  const submitForm = async () => {
    if (!formData.value.contractNumber || !formData.value.supplierId || !formData.value.effectiveDate) {
      ElMessage.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    submitting.value = true;
    try {
      const dataToSave = { ...formData.value } as SupplierContractMutation;
      if (formData.value.id) {
        await SupplierContractApi.update(formData.value.id, dataToSave);
        ElMessage.success('Cập nhật thành công');
      } else {
        await SupplierContractApi.create(dataToSave);
        ElMessage.success('Tạo mới thành công');
      }
      dialogVisible.value = false;
      refreshAll();
    } catch (error) {
      console.error('Failed to save contract:', error);
      ElMessage.error('Không thể lưu hợp đồng');
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

  const selectedRows = ref<SupplierContractDto[]>([]);

  const handleSelectionChange = (rows: SupplierContractDto[]) => {
    selectedRows.value = rows;
  };

  const restoreDialogVisible = ref(false);
  const deletedContractsData = ref<SupplierContractDto[]>([]);
  const deletedContractsLoading = ref(false);
  const selectedDeletedContracts = ref<SupplierContractDto[]>([]);

  const handleDeletedSelectionChange = (rows: SupplierContractDto[]) => {
    selectedDeletedContracts.value = rows;
  };

  const openRestoreDialog = async () => {
    restoreDialogVisible.value = true;
    deletedContractsLoading.value = true;
    selectedDeletedContracts.value = [];
    try {
      const res = await SupplierContractApi.getDeletedList({ current: 1, size: 1000 });
      deletedContractsData.value = res.items || [];
    } catch {
      ElMessage.error('Không thể tải danh sách hợp đồng đã xóa');
    } finally {
      deletedContractsLoading.value = false;
    }
  };

  const handleRestoreMany = async () => {
    if (selectedDeletedContracts.value.length === 0) {
      ElMessage.warning('Vui lòng chọn ít nhất một hợp đồng để khôi phục');
      return;
    }
    
    // There is no restoreMany in the API, so we have to loop through them or just restore one by one.
    // Let's implement it for multiple using Promise.all
    ElMessageBox.confirm(
      `Bạn có chắc chắn muốn khôi phục ${selectedDeletedContracts.value.length} hợp đồng đã chọn?`,
      'Xác nhận khôi phục',
      {
        confirmButtonText: 'Khôi phục',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    ).then(async () => {
      try {
        const ids = selectedDeletedContracts.value.map((item) => item.id);
        await Promise.all(ids.map(id => SupplierContractApi.restore(id)));
        ElMessage.success('Khôi phục thành công');
        restoreDialogVisible.value = false;
        refreshAll();
      } catch (err: any) {
        ElMessage.error(err.message || 'Khôi phục thất bại');
      }
    });
  };

  onMounted(() => {
    loadSuppliers();
    loadData();
    loadStats();
  });

  return {
    data,
    loading,
    pagination,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    refreshData: refreshAll,
    searchForm,
    stats,
    suppliers,
    selectedRows,
    handleSelectionChange,
    restoreDialogVisible,
    deletedContractsData,
    deletedContractsLoading,
    selectedDeletedContracts,
    handleDeletedSelectionChange,
    openRestoreDialog,
    handleRestoreMany,
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
