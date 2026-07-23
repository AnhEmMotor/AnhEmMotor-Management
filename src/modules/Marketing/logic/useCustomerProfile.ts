import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchUpdateLead,
  fetchAddLeadActivity,
  fetchGetProfile360,
  type Lead,
} from "@/api/customer/lead.api";

export function useCustomerProfile() {
  const isVerified = ref(false);
  const error = ref("");
  const customerInfo = reactive({
    id: 0,
    fullName: "",
    phone: "",
    status: "",
    cccd: "",
    address: {
      province: "Đồng Nai",
      city: "Biên Hòa",
      ward: "",
    },
  });

  const wardsInBienHoa = [
    "Trảng Dài",
    "Long Bình",
    "Hố Nai",
    "Tân Hiệp",
    "Long Bình Tân",
    "Phước Tân",
    "Tam Phước",
    "Quang Vinh",
    "Thanh Bình",
    "Quyết Thắng",
  ];

  const timelineEvents = ref<
    {
      id: number;
      type: string;
      content: string;
      time: string;
      icon: string;
      color: string;
    }[]
  >([]);

  const vehicles = ref<any[]>([]);
  const maintenanceHistories = ref<any[]>([]);
  const onVerifiedChange = ref<(() => void) | null>(null);

  const loadFromLead = async (lead: Lead) => {
    isVerified.value = lead.isVerified ?? false;
    customerInfo.id = lead.id;
    customerInfo.fullName = lead.fullName;
    customerInfo.phone = lead.phoneNumber;
    customerInfo.status = lead.status;
    customerInfo.cccd = lead.identificationNumber || "";
    customerInfo.address.ward = lead.ward || "";
    customerInfo.address.province = lead.province || "Đồng Nai";
    customerInfo.address.city = "Biên Hòa";

    // Initialize with local activities notes
    if (lead.activities && lead.activities.length > 0) {
      timelineEvents.value = lead.activities
        .slice()
        .reverse()
        .filter((a) => a.activityType.toLowerCase() === "note")
        .map((a) => ({
          id: a.id,
          type: "sale",
          content: a.description,
          time: a.createdAt,
          icon: "ri:edit-line",
          color: "#f59e0b",
        }));
    } else {
      timelineEvents.value = [];
    }

    // Load full 360 profile to get actual vehicles and service history
    try {
      error.value = "";
      const profileData = await fetchGetProfile360(lead.id);
      vehicles.value = profileData.vehicles || [];
      maintenanceHistories.value = profileData.maintenanceHistories || [];

      if (profileData.timelineEvents && profileData.timelineEvents.length > 0) {
        timelineEvents.value = profileData.timelineEvents
          .filter((evt: any) => evt.type !== "ai")
          .map((evt: any) => ({
            id: evt.relatedId || Date.now(),
            type: evt.type === "activity" ? "sale" : evt.type,
            content: evt.description || evt.title,
            time: evt.date,
            icon:
              evt.type === "service"
                ? "ri:settings-line"
                : evt.type === "activity"
                  ? "ri:edit-line"
                  : "ri:shopping-cart-line",
            color:
              evt.type === "service"
                ? "#f59e0b"
                : evt.type === "activity"
                  ? "#10b981"
                  : "#3b82f6",
          }));
      }
    } catch (err: any) {
      error.value = err?.message || "Không thể tải hồ sơ 360 của khách hàng.";
      vehicles.value = [];
      maintenanceHistories.value = [];
    }
  };

  const handleVerify = async () => {
    if (!customerInfo.cccd || !customerInfo.address.ward) {
      ElMessage.warning(
        "Vui lòng hoàn thiện CCCD và Địa chỉ trước khi xác thực",
      );
      return;
    }

    try {
      const newVerified = !isVerified.value;
      await fetchUpdateLead(customerInfo.id, {
        identificationNumber: customerInfo.cccd,
        ward: customerInfo.address.ward,
        isVerified: newVerified,
      });
      isVerified.value = newVerified;
      if (newVerified) {
        ElMessage.success(
          "Đã xác thực hồ sơ. Dữ liệu hiện đã được khóa để đảm bảo an toàn.",
        );
      }
      onVerifiedChange.value?.();
    } catch {
      ElMessage.error(
        "Không thể cập nhật trạng thái xác thực. Vui lòng thử lại.",
      );
    }
  };

  const addNote = async (note: string) => {
    try {
      await fetchAddLeadActivity(customerInfo.id, {
        activityType: "Note",
        description: note,
      });
      timelineEvents.value.unshift({
        id: Date.now(),
        type: "sale",
        content: note,
        time: "Vừa xong",
        icon: "ri:edit-line",
        color: "#f59e0b",
      });
      onVerifiedChange.value?.();
    } catch {
      ElMessage.error("Không thể thêm ghi chú. Vui lòng thử lại.");
    }
  };

  return {
    isVerified,
    customerInfo,
    wardsInBienHoa,
    timelineEvents,
    handleVerify,
    addNote,
    loadFromLead,
    onVerifiedChange,
    vehicles,
    maintenanceHistories,
    error,
  };
}
