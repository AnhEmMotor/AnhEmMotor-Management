import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { payrollApi, type PayrollSummaryResponse } from '@/api/operations/payroll.api';
import { exportReportWorkbook } from '@/utils/report-excel';
import { useUserStore } from '@/application/store/user';

type PayrollSummaryApiResult = PayrollSummaryResponse[] | { data?: PayrollSummaryResponse[] };

const unwrapPayrollSummary = (response: PayrollSummaryApiResult) =>
  Array.isArray(response) ? response : response.data || [];

const getKpiBonus = (item: PayrollSummaryResponse) => item.kpiBonus ?? item.volumeBonus ?? 0;

export function usePayroll() {
  const userStore = useUserStore();
  const isAdmin = computed(() => {
    const roles = userStore.info?.roles || [];
    return roles.includes('R_ADMIN') || roles.includes('R_SUPER');
  });

  const loading = ref(false);

  const stats = reactive({
    totalPayroll: 0,
    paid: 0,
    pending: 0,
    employeeCount: 0,
    totalKpiBonus: 0,
  });

  const pagination = reactive({ current: 1, size: 10, total: 0 });
  const data = ref<PayrollSummaryResponse[]>([]);
  const allPayrollData = ref<PayrollSummaryResponse[]>([]);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const searchForm = ref({
    month: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
    employeeName: '',
  });

  const selectedMonthYear = computed(() => {
    let month = currentMonth;
    let year = currentYear;
    if (searchForm.value.month) {
      if (searchForm.value.month.includes('-')) {
        const [y, m] = searchForm.value.month.split('-');
        year = parseInt(y) || year;
        month = parseInt(m) || month;
      } else {
        const parsedMonth = parseInt(searchForm.value.month);
        if (!isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12) {
          month = parsedMonth;
        }
      }
    }
    return { month, year };
  });

  const loadData = async () => {
    loading.value = true;
    try {
      const { month, year } = selectedMonthYear.value;

      const res = await payrollApi.getSummary(month, year);
      const summaryData = unwrapPayrollSummary(res as PayrollSummaryApiResult);

      allPayrollData.value = summaryData;

      let filteredData = [...summaryData];
      if (searchForm.value.employeeName) {
        const searchName = searchForm.value.employeeName.toLowerCase();
        filteredData = filteredData.filter((item) =>
          item.fullName.toLowerCase().includes(searchName)
        );
      }

      data.value = filteredData;
      pagination.total = filteredData.length;

      const totalKpiBonus = summaryData.reduce((sum, item) => sum + getKpiBonus(item), 0);
      const totalPayrollVal = summaryData.reduce(
        (sum, item) => sum + (item.totalNetPayable || 0),
        0
      );
      const pendingVal = summaryData.reduce(
        (sum, item) =>
          sum + (item.baseSalary || 0) + (item.confirmedCommission || 0) + getKpiBonus(item),
        0
      );
      const paidVal = summaryData.reduce((sum, item) => sum + (item.paidCommission || 0), 0);

      stats.totalPayroll = totalPayrollVal;
      stats.paid = paidVal;
      stats.pending = pendingVal;
      stats.employeeCount = summaryData.length;
      stats.totalKpiBonus = totalKpiBonus;
    } catch (error) {
      console.error('Failed to load payroll:', error);
      ElMessage.error('Không thể tải danh sách bảng lương');
    } finally {
      loading.value = false;
    }
  };

  const handleReset = () => {
    searchForm.value.month = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    searchForm.value.employeeName = '';
    pagination.current = 1;
    loadData();
  };

  const handleSearch = () => {
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

  const handleApprove = async (row: PayrollSummaryResponse) => {
    const { month, year } = selectedMonthYear.value;
    const actionText = isAdmin.value ? 'duyệt chi' : 'gửi yêu cầu duyệt chi';
    const titleText = isAdmin.value ? 'Xác nhận duyệt chi' : 'Xác nhận gửi duyệt';
    const successText = isAdmin.value
      ? 'Duyệt chi hoa hồng nhân viên thành công'
      : 'Đã gửi yêu cầu duyệt chi thành công';
    const errorText = isAdmin.value
      ? 'Không thể duyệt chi hoa hồng'
      : 'Không thể gửi yêu cầu duyệt chi';

    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn ${actionText} hoa hồng kỳ ${month}/${year} cho nhân viên ${row.fullName}?`,
        titleText,
        {
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Hủy',
          type: 'warning',
        }
      );
      loading.value = true;
      await payrollApi.approveCommissions(row.employeeId, month, year);
      ElMessage.success(successText);
      loadData();
    } catch (error) {
      if (error !== 'cancel') {
        console.error(`Failed to ${actionText}:`, error);
        ElMessage.error(errorText);
      }
    } finally {
      loading.value = false;
    }
  };

  const handleApproveAll = async () => {
    const { month, year } = selectedMonthYear.value;
    const actionText = isAdmin.value ? 'duyệt chi' : 'gửi yêu cầu duyệt chi';
    const titleText = isAdmin.value ? 'Xác nhận duyệt chi tất cả' : 'Xác nhận gửi duyệt tất cả';
    const successText = isAdmin.value
      ? 'Duyệt chi hoa hồng tất cả nhân viên thành công'
      : 'Đã gửi yêu cầu duyệt chi tất cả thành công';
    const errorText = isAdmin.value
      ? 'Không thể duyệt chi tất cả hoa hồng'
      : 'Không thể gửi yêu cầu duyệt chi tất cả';

    try {
      await ElMessageBox.confirm(
        `Bạn có chắc chắn muốn ${actionText} hoa hồng kỳ ${month}/${year} cho TẤT CẢ nhân viên?`,
        titleText,
        {
          confirmButtonText: 'Đồng ý',
          cancelButtonText: 'Hủy',
          type: 'warning',
        }
      );
      loading.value = true;
      await payrollApi.approveCommissions(null, month, year);
      ElMessage.success(successText);
      loadData();
    } catch (error) {
      if (error !== 'cancel') {
        console.error(`Failed to ${actionText} all:`, error);
        ElMessage.error(errorText);
      }
    } finally {
      loading.value = false;
    }
  };

  const exportPayrollExcel = () => {
    const { month, year } = selectedMonthYear.value;

    exportReportWorkbook({
      fileName: `Bang_luong_nhan_su_${month}_${year}`,
      sheets: [
        {
          name: 'Tổng hợp',
          rows: [
            {
              Tháng: month,
              Năm: year,
              'Số nhân viên': stats.employeeCount,
              'Tổng quỹ lương': stats.totalPayroll,
              'Hoa hồng đã chi': stats.paid,
              'Giá trị chờ chi': stats.pending,
            },
          ],
        },
        {
          name: 'Bảng lương',
          rows: data.value.map((item) => ({
            'Mã nhân viên': item.employeeId,
            'Nhân viên': item.fullName,
            'Chức vụ': item.jobTitle,
            'Lương cơ bản': item.baseSalary,
            'Hoa hồng chờ xác nhận': item.pendingCommission,
            'Hoa hồng chờ chi': item.confirmedCommission,
            'Hoa hồng đã chi': item.paidCommission,
            'Thực nhận': item.totalNetPayable,
          })),
        },
      ],
    });
  };

  return {
    loading,
    stats,
    pagination,
    data,
    allPayrollData,
    searchForm,
    selectedMonthYear,
    loadData,
    handleReset,
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    handleApprove,
    handleApproveAll,
    exportPayrollExcel,
    isAdmin,
  };
}
