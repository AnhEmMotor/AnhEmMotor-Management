import { ref, reactive, onMounted } from 'vue';
import type { ColumnOption } from '@/types';
import type { SearchFormItem } from '@/components/core/forms/art-search-bar/index.vue';
import { getReturnRequests } from '@/api/sales/returns.api';

export function useReturnsTable() {
  const loading = ref(false);
  const data = ref<any[]>([]);

  const searchForm = reactive({
    orderCode: '',
    status: '',
  });

  const searchItems: SearchFormItem[] = [
    {
      key: 'orderCode',
      type: 'input',
      label: 'Mã đơn hàng',
      placeholder: 'Nhập mã đơn hàng',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Trạng thái',
      placeholder: 'Chọn trạng thái',
      options: [
        { label: 'Đang xử lý', value: 'Processing' },
        { label: 'Chờ duyệt', value: 'Pending' },
        { label: 'Đã lưu kho', value: 'Completed' },
        { label: 'Từ chối (Khách nhận)', value: 'Rejected' },
      ],
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
      if (searchForm.status) filters.push(`Status==${searchForm.status}`);

      const res = await getReturnRequests({
        Page: pagination.current,
        PageSize: pagination.size,
        Filters: filters.join(','),
      } as any);

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
    searchForm.status = '';
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
