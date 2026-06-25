import { computed, ref, type ComputedRef, type Ref } from "vue";

import type { RepairOrder } from "@/api/sales";
import { VehicleApi, type Vehicle } from "@/api/vehicle";

export type QueryType = "auto" | "vin" | "licensePlate" | "phone";

type SearchInput = {
  query: string;
  queryType: QueryType;
  page: number;
  pageSize: number;
};

type AlertItem = {
  title: string;
  severity: string;
  type: "warning" | "danger" | "info" | "success";
  description: string;
};

type UseVehiclePortfolioHistoryResult = {
  loading: Ref<boolean>;
  error: Ref<string>;

  queryType: Ref<QueryType>;

  vehicle: Ref<Vehicle | null>;
  timeline: Ref<RepairOrder[]>;

  pagination: Ref<{ current: number; size: number; total: number }>;

  latestOrder: ComputedRef<RepairOrder | undefined>;
  alerts: ComputedRef<AlertItem[]>;

  handleReset: () => void;
  handleSearch: (payload: SearchInput) => Promise<void>;
};

export function useVehiclePortfolioHistory(): UseVehiclePortfolioHistoryResult {
  const loading = ref(false);
  const error = ref("");

  const queryType = ref<QueryType>("auto");

  const vehicle = ref<Vehicle | null>(null);
  const timeline = ref<RepairOrder[]>([]);

  const pagination = ref({ current: 1, size: 5, total: 0 });

  const latestOrder = computed(() => timeline.value?.[0]);

  const alerts = computed<AlertItem[]>(() => {
    const last = latestOrder.value;
    if (!last) return [];

    const mileage = Number(last.mileage || 0);
    const list: AlertItem[] = [];

    if (mileage >= 3000) {
      list.push({
        title: "Nhắc bảo dưỡng định kỳ (mốc ODO)",
        severity: "Cảnh báo",
        type: mileage >= 5000 ? "warning" : "info",
        description:
          "Hiện trạng ODO đang vượt mốc nhắc nhở theo chu kỳ gần nhất.",
      });
    }

    list.push({
      title: "Nhắc thay phụ tùng theo chu kỳ",
      severity: "Gợi ý",
      type: "warning",
      description:
        "Có thể cần kiểm tra/đề xuất thay thế phụ tùng theo tình trạng thực tế và ODO.",
    });

    return list.slice(0, 3);
  });

  const handleReset = () => {
    error.value = "";
    queryType.value = "auto";
    vehicle.value = null;
    timeline.value = [];
    pagination.value = { ...pagination.value, current: 1, total: 0 };
  };

  function normalizeQueryType(q: string, forced: QueryType): QueryType {
    if (forced !== "auto") return forced;
    const s = q.trim();
    if (!s) return "auto";
    if (/^\d{10,}$/.test(s.replace(/\s/g, ""))) return "phone";
    if (/^[A-HJ-NPR-Z0-9]{8,}$/i.test(s)) return "vin";
    if (/^[0-9]{2}[-A-Za-z]?[0-9A-Za-z.-]/.test(s)) return "licensePlate";
    return "vin";
  }

  async function handleSearch(payload: SearchInput) {
    const q = payload.query.trim();
    error.value = "";

    if (!q) {
      error.value = "Vui lòng nhập VIN / biển số / SĐT.";
      return;
    }

    loading.value = true;
    try {
      const resolvedQueryType = normalizeQueryType(q, payload.queryType);
      queryType.value = resolvedQueryType;
      pagination.value.current = payload.page;
      pagination.value.size = payload.pageSize;

      const res = await VehicleApi.getPortfolio({
        query: q,
        queryType: resolvedQueryType,
        page: payload.page,
        pageSize: payload.pageSize,
      });

      if (res) {
        vehicle.value = res.vehicle;
        timeline.value = res.history;
        pagination.value.total = res.totalHistoryCount;
        error.value = ""; // Clear error on success
      }
    } catch (e: any) {
      // Handle "Not Found" specifically as a state, not a critical error
      if (
        e?.response?.status === 400 &&
        e?.response?.data?.message?.includes("No vehicle found")
      ) {
        error.value = "Không tìm thấy hồ sơ xe phù hợp với thông tin đã nhập.";
        vehicle.value = null;
        timeline.value = [];
      } else {
        error.value = e?.message || "Đã xảy ra lỗi trong quá trình tra cứu.";
        vehicle.value = null;
        timeline.value = [];
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    queryType,
    vehicle,
    timeline,
    pagination,
    latestOrder,
    alerts,
    handleReset,
    handleSearch,
  };
}
