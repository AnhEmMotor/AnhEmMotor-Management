import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchUpdateLead,
  fetchAddLeadActivity,
  type Lead,
} from "@/api/customer/lead.api";

export function useCustomerProfile() {
  const isVerified = ref(false);
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

  const onVerifiedChange = ref<(() => void) | null>(null);

  const loadFromLead = (lead: Lead) => {
    isVerified.value = lead.isVerified ?? false;
    customerInfo.id = lead.id;
    customerInfo.fullName = lead.fullName;
    customerInfo.phone = lead.phoneNumber;
    customerInfo.status = lead.status;
    customerInfo.cccd = lead.identificationNumber || "";
    customerInfo.address.ward = lead.ward || "";
    customerInfo.address.province = lead.province || "Đồng Nai";
    customerInfo.address.city = "Biên Hòa";

    if (lead.activities && lead.activities.length > 0) {
      timelineEvents.value = lead.activities
        .slice()
        .reverse()
        .map((a) => ({
          id: a.id,
          type: a.activityType.toLowerCase() === "note" ? "sale" : "ai",
          content: a.description,
          time: a.createdAt,
          icon:
            a.activityType.toLowerCase() === "note"
              ? "ri:edit-line"
              : "ri:robot-line",
          color:
            a.activityType.toLowerCase() === "note" ? "#f59e0b" : "#6366f1",
        }));
    } else {
      timelineEvents.value = [];
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
  };
}
