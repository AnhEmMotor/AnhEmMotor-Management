import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { BookingApi, type Booking } from "@/api/booking.api";
import type { ColumnOption } from "@/types";

export function useBookingTable() {
  const data = ref<Booking[]>([]);
  const loading = ref(false);
  const columns = ref<ColumnOption[]>([
    { prop: "id", label: "ID", width: "80", sortable: true },
    { prop: "fullName", label: "Tên Khách Hàng", minWidth: "160" },
    { prop: "phoneNumber", label: "SĐT", minWidth: "120" },
    { prop: "preferredDate", label: "Giờ Hẹn", minWidth: "160", slot: "date" },
    {
      prop: "bookingType",
      label: "Loại Yêu Cầu",
      minWidth: "140",
      slot: "type",
    },
    { prop: "status", label: "Trạng Thái", width: "140", slot: "status" },
    {
      prop: "operation",
      label: "Thao tác",
      fixed: "right",
      width: "120",
      slot: "operation",
    },
  ]);
  const columnChecks = ref<ColumnOption[]>(columns.value);
  const pagination = reactive({ current: 1, size: 10, total: 0 });

  const dialogVisible = ref(false);
  const dialogTitle = ref("");
  const submitting = ref(false);
  const formData = ref<Partial<Booking>>({});

  const statistics = ref({
    total: 0,
    pending: 0,
    confirmed: 0,
  });

  const loadData = async () => {
    loading.value = true;
    try {
      const res = await BookingApi.getList();
      data.value = res || [];
      pagination.total = data.value.length;

      statistics.value.total = data.value.length;
      statistics.value.pending = data.value.filter(
        (x) => x.status === "Pending",
      ).length;
      statistics.value.confirmed = data.value.filter(
        (x) => x.status === "Confirmed",
      ).length;
    } catch (error: any) {
      ElMessage.error(error.message || "Lỗi khi tải dữ liệu lịch hẹn");
    } finally {
      loading.value = false;
    }
  };

  const handleConfirm = async (row: Booking) => {
    try {
      await ElMessageBox.confirm(
        "Xác nhận lịch hẹn cho khách hàng " + row.fullName + "?",
        "Xác nhận",
        {
          type: "warning",
          confirmButtonText: "Xác nhận",
          cancelButtonText: "Hủy",
        },
      );
      await BookingApi.confirm(row.id);
      ElMessage.success("Xác nhận thành công");
      loadData();
    } catch (e: any) {
      if (e !== "cancel") {
        ElMessage.error(e.message || "Xác nhận thất bại");
      }
    }
  };

  const handleAdd = () => {
    formData.value = {
      fullName: "",
      phoneNumber: "",
      bookingType: "Consult",
      status: "Pending",
      note: "",
    };
    dialogTitle.value = "Thêm Lịch Hẹn Mới";
    dialogVisible.value = true;
  };

  const submitForm = async () => {
    if (
      !formData.value.fullName ||
      !formData.value.phoneNumber ||
      !formData.value.preferredDate
    ) {
      ElMessage.warning("Vui lòng nhập đủ tên, sđt và ngày hẹn");
      return;
    }
    submitting.value = true;
    try {
      await BookingApi.create(formData.value as any);
      ElMessage.success("Thêm lịch hẹn thành công");
      dialogVisible.value = false;
      loadData();
    } catch (e: any) {
      ElMessage.error(e.message || "Thất bại");
    } finally {
      submitting.value = false;
    }
  };

  onMounted(() => {
    loadData();
  });

  return {
    data,
    loading,
    columns,
    columnChecks,
    pagination,
    statistics,
    dialogVisible,
    dialogTitle,
    formData,
    submitting,
    handleAdd,
    handleConfirm,
    submitForm,
    refreshData: loadData,
    handleSizeChange: (size: number) => {
      pagination.size = size;
      pagination.current = 1;
    },
    handleCurrentChange: (current: number) => {
      pagination.current = current;
    },
    handleSearch: () => {},
    handleReset: () => {},
  };
}
