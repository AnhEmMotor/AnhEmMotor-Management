import { ref, reactive, onMounted, watch } from 'vue';
import type { ComputedRef } from 'vue';
import type { ColumnOption } from '@/types';
import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue';
import { getReturnRequests } from '@/api/sales/returns.api';
import type { ReturnRequestDetail } from '@/domain/sales/returns.types';

type ReturnWorkflowStatus = ReturnRequestDetail['status'];

export function useReturnsTable(allowedStatuses: ComputedRef<ReturnWorkflowStatus[]>) {
  const loading = ref(false);
  const data = ref<ReturnRequestDetail[]>([]);

  const searchForm = reactive({
    orderCode: '',
  });

  const searchItems: SearchFormItem[] = [
    {
      key: 'orderCode',
      type: 'input',
      label: 'Mã đơn hàng',
      placeholder: 'Nhập mã đơn hàng',
    },
  ];

  const columns: ColumnOption[] = [
    { prop: 'id', label: 'Mã Yêu Cầu', width: 120 },
    { prop: 'orderCode', label: 'Mã Đơn Hàng', width: 150 },
    { prop: 'customerName', label: 'Khách hàng', minWidth: 150 },
    { prop: 'reason', label: 'Lý do báo lỗi', minWidth: 200 },
    { prop: 'status', label: 'Trạng thái', width: 150, useSlot: true },
    {
      prop: 'operation',
      label: 'Thao tác',
      fixed: 'right',
      width: 220,
      align: 'center',
      useSlot: true,
    },
  ];

  const columnChecks = ref<ColumnOption[]>([...columns]);

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0,
  });

  const refreshData = async () => {
    loading.value = true;
    try {
      const filters = [];
      if (searchForm.orderCode) filters.push(`OrderCode@=*${searchForm.orderCode}`);
      if (allowedStatuses.value.length > 0) {
        filters.push(`Status==${allowedStatuses.value.join('|')}`);
      }

      const res = await getReturnRequests({
        Page: pagination.current,
        PageSize: pagination.size,
        Filters: filters.join(','),
      });

      if (res && res.items) {
        data.value = res.items;
        pagination.total = res.totalCount || 0;
      } else {
        data.value = [];
        pagination.total = 0;
      }
    } catch (e) {
      console.error('Lỗi khi fetch data đổi trả:', e);
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    refreshData();
  };

  const handleReset = () => {
    searchForm.orderCode = '';
    handleSearch();
  };

  const handleSizeChange = (val: number) => {
    pagination.size = val;
    refreshData();
  };

  const handleCurrentChange = (val: number) => {
    pagination.current = val;
    refreshData();
  };

  onMounted(() => {
    refreshData();
  });

  watch(
    () => allowedStatuses.value.join('|'),
    () => {
      pagination.current = 1;
      refreshData();
    }
  );

  return {
    loading,
    data,
    searchForm,
    searchItems,
    columns,
    columnChecks,
    pagination,
    refreshData,
    handleSearch,
    handleReset,
    handleSizeChange,
    handleCurrentChange,
  };
}
