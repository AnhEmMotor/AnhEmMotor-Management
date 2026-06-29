<template>
  <div class="p-4 assignment-container">
    <div class="flex items-start justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <ElIcon class="text-primary"><Compass /></ElIcon>
          Bảng Phân Công Sửa Chữa (Kanban & Timeline)
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Kéo thả phiếu sửa chữa để phân công công việc hoặc theo dõi tiến độ
          làm việc của kỹ thuật viên theo dòng thời gian.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <ElRadioGroup v-model="viewMode" size="default">
          <ElRadioButton value="kanban">
            <div class="flex items-center gap-1">
              <ElIcon><Grid /></ElIcon> Kanban
            </div>
          </ElRadioButton>
          <ElRadioButton value="timeline">
            <div class="flex items-center gap-1">
              <ElIcon><Calendar /></ElIcon> Dòng thời gian
            </div>
          </ElRadioButton>
        </ElRadioGroup>

        <ElButton
          :icon="Refresh"
          type="primary"
          :loading="loading"
          @click="initData"
        >
          Làm mới
        </ElButton>
      </div>
    </div>

    <div
      v-if="viewMode === 'kanban'"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div class="lg:col-span-1 flex flex-col">
        <ElCard class="flex-1 flex flex-col hide-header-border" shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 flex items-center gap-2">
                <ElTag type="danger" effect="dark">{{
                  unassignedTickets.length
                }}</ElTag>
                Phiếu Chờ Phân Công
              </span>
              <ElInput
                v-model="searchQuery"
                placeholder="Tìm khách/SĐT/biển số..."
                size="small"
                clearable
                class="w-48"
              />
            </div>
          </template>

          <div
            v-if="filteredUnassigned.length === 0"
            class="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2"
          >
            <ElIcon size="36"><CircleCheck /></ElIcon>
            <span>Đã phân công hết phiếu sửa chữa!</span>
          </div>

          <div v-else class="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            <div
              v-for="ticket in filteredUnassigned"
              :key="ticket.id"
              class="ticket-card"
              draggable="true"
              @dragstart="onDragStart($event, ticket)"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-bold text-primary"
                  >#{{ ticket.id }}</span
                >
                <ElTag
                  :type="ticket.status === 'Pending' ? 'warning' : 'primary'"
                  size="small"
                >
                  {{ ticket.status }}
                </ElTag>
              </div>

              <div class="mt-2 text-sm font-bold text-slate-900">
                {{ ticket.licensePlate || "Chưa có biển số" }}
              </div>

              <div class="mt-1 text-xs text-slate-500">
                Khách hàng:
                <span class="font-semibold text-slate-700">{{
                  ticket.customerName
                }}</span>
              </div>
              <div class="mt-0.5 text-xs text-slate-500">
                SĐT:
                <span class="font-mono text-slate-700">{{
                  ticket.customerPhone
                }}</span>
              </div>

              <div
                class="mt-2 pt-2 border-t border-dashed border-slate-100 flex items-center justify-between gap-2"
              >
                <span
                  class="text-xs text-amber-600 font-medium truncate max-w-[150px]"
                >
                  {{ ticket.description || "Không có mô tả" }}
                </span>

                <ElDropdown
                  trigger="click"
                  @command="
                    (techId: number) => handleQuickAssign(ticket.id, techId)
                  "
                >
                  <ElButton size="small" type="primary" link
                    >Phân công nhanh</ElButton
                  >
                  <template #dropdown>
                    <ElDropdownMenu>
                      <ElDropdownItem
                        v-for="tech in technicians"
                        :key="tech.id"
                        :command="tech.id"
                      >
                        {{ tech.fullName }} ({{ getTechWorkloadCount(tech.id) }}
                        việc)
                      </ElDropdownItem>
                    </ElDropdownMenu>
                  </template>
                </ElDropdown>
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <div class="lg:col-span-2">
        <ElCard class="hide-header-border" shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-800 flex items-center gap-2">
                <ElIcon><Tools /></ElIcon>
                Trạng Thái Tải Công Việc Kỹ Thuật Viên
              </span>
              <span class="text-xs text-slate-400"
                >Thả phiếu sửa chữa vào thẻ kỹ thuật viên để giao việc</span
              >
            </div>
          </template>

          <div
            v-if="technicians.length === 0"
            class="py-12 text-center text-slate-400"
          >
            Không tìm thấy thông tin kỹ thuật viên.
          </div>

          <div
            v-else
            class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-1"
          >
            <div
              v-for="tech in technicians"
              :key="tech.id"
              class="tech-column"
              :class="{ 'drag-over': activeDragOverTechId === tech.id }"
              @dragover.prevent="onDragOver(tech.id)"
              @dragleave="onDragLeave"
              @drop="onDrop($event, tech)"
            >
              <div
                class="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100"
              >
                <div class="flex items-center gap-2.5">
                  <ElAvatar
                    :size="36"
                    class="bg-primary-light text-primary font-bold"
                  >
                    {{ tech.fullName.charAt(0) }}
                  </ElAvatar>
                  <div>
                    <div class="text-sm font-bold text-slate-900 leading-tight">
                      {{ tech.fullName }}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">
                      {{ tech.jobTitle || "Kỹ thuật viên" }}
                    </div>
                  </div>
                </div>

                <div class="text-right">
                  <ElTag
                    :type="
                      getTechWorkloadCount(tech.id) > 0 ? 'warning' : 'success'
                    "
                    size="small"
                    effect="dark"
                  >
                    {{ getTechWorkloadCount(tech.id) > 0 ? "Bận" : "Rảnh" }}
                  </ElTag>
                  <div class="text-[10px] text-slate-400 mt-1">
                    {{ getTechWorkloadCount(tech.id) }} Phiếu đang làm
                  </div>
                </div>
              </div>

              <div class="space-y-2 min-h-[100px] flex flex-col">
                <div
                  v-if="getTechTickets(tech.id).length === 0"
                  class="flex-1 flex items-center justify-center text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50"
                >
                  Kéo thả phiếu vào đây để giao việc
                </div>

                <div
                  v-else
                  v-for="ticket in getTechTickets(tech.id)"
                  :key="ticket.id"
                  class="tech-assigned-card"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono text-slate-400"
                      >#{{ ticket.id }}</span
                    >
                    <span class="text-xs font-bold text-slate-900">{{
                      ticket.licensePlate || "N/A"
                    }}</span>
                  </div>
                  <div class="text-xs text-slate-600 mt-1 flex justify-between">
                    <span>Khách: {{ ticket.customerName }}</span>
                    <ElTag
                      size="small"
                      type="info"
                      class="scale-90 transform origin-right"
                    >
                      {{ ticket.status }}
                    </ElTag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ElCard>
      </div>
    </div>

    <div v-else class="timeline-view-wrapper">
      <ElCard shadow="hover">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 flex items-center gap-2">
              <ElIcon><Calendar /></ElIcon>
              Phân Bổ Công Việc Theo Giờ (Trong Ngày)
            </span>
            <span class="text-xs text-slate-400"
              >Xem sơ đồ phân phối công việc của đội ngũ thợ máy</span
            >
          </div>
        </template>

        <div class="timeline-container overflow-x-auto">
          <div class="timeline-grid min-w-[800px]">
            <div
              class="timeline-header-row flex border-b border-slate-100 pb-3 mb-3"
            >
              <div class="w-48 font-bold text-sm text-slate-500 shrink-0">
                Nhân viên
              </div>
              <div
                class="flex-1 grid grid-cols-5 text-center text-xs font-bold text-slate-500"
              >
                <div>08:00 - 10:00</div>
                <div>10:00 - 12:00</div>
                <div>13:00 - 15:00</div>
                <div>15:00 - 17:00</div>
                <div>17:00 - 19:00</div>
              </div>
            </div>

            <div
              v-if="technicians.length === 0"
              class="py-12 text-center text-slate-400"
            >
              Không có dữ liệu kỹ thuật viên.
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="tech in technicians"
                :key="tech.id"
                class="timeline-row flex items-center py-2 border-b border-slate-50 last:border-0"
              >
                <div class="w-48 flex items-center gap-2 shrink-0 pr-4">
                  <ElAvatar
                    :size="28"
                    class="bg-primary-light text-primary font-bold text-xs"
                  >
                    {{ tech.fullName.charAt(0) }}
                  </ElAvatar>
                  <div class="min-w-0">
                    <div class="text-xs font-bold text-slate-800 truncate">
                      {{ tech.fullName }}
                    </div>
                    <div class="text-[9px] text-slate-400">
                      {{ tech.jobTitle || "Thợ máy" }}
                    </div>
                  </div>
                </div>

                <div
                  class="flex-1 grid grid-cols-5 gap-3 h-14 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl relative p-1"
                >
                  <div
                    v-for="ticket in getTechTickets(tech.id)"
                    :key="ticket.id"
                    class="absolute rounded-lg p-2 text-[10px] font-bold text-white shadow-sm flex flex-col justify-center cursor-pointer transition-all hover:scale-[1.02]"
                    :style="getTicketTimelineStyle(ticket)"
                  >
                    <div class="truncate">
                      {{ ticket.licensePlate || "N/A" }}
                    </div>
                    <div
                      class="truncate font-normal scale-90 origin-left mt-0.5"
                    >
                      {{ ticket.customerName }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Compass,
  Refresh,
  CircleCheck,
  Tools,
  Grid,
  Calendar,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { RepairOrderApi, type RepairOrder } from "@/api/sales";
import {
  EmployeeApi,
  type EmployeeResponse,
} from "@/api/operations/employee.api";

defineOptions({ name: "WorkshopAssignment" });

const loading = ref(false);
const viewMode = ref<"kanban" | "timeline">("kanban");
const searchQuery = ref("");
const activeDragOverTechId = ref<number | null>(null);

const tickets = ref<RepairOrder[]>([]);
const technicians = ref<EmployeeResponse[]>([]);

const unassignedTickets = computed(() => {
  return tickets.value.filter(
    (t) =>
      !t.technicianId && t.status !== "Completed" && t.status !== "Cancelled",
  );
});

const filteredUnassigned = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return unassignedTickets.value;
  return unassignedTickets.value.filter(
    (t) =>
      t.id.toString().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerPhone.includes(q) ||
      (t.licensePlate && t.licensePlate.toLowerCase().includes(q)),
  );
});

const initData = async () => {
  loading.value = true;
  try {
    const [ordersRes, empRes] = await Promise.all([
      RepairOrderApi.getList({ Page: 1, PageSize: 100 }),
      EmployeeApi.getList(),
    ]);

    tickets.value = ordersRes.items || [];

    technicians.value = (empRes || []).filter(
      (e) =>
        e.jobTitle?.toLowerCase().includes("technician") ||
        e.jobTitle?.toLowerCase().includes("kỹ thuật") ||
        e.jobTitle?.toLowerCase().includes("thợ") ||
        e.jobTitle?.toLowerCase().includes("tech"),
    );

    if (technicians.value.length === 0) {
      technicians.value = empRes || [];
    }
  } catch (err: any) {
    ElMessage.error(err?.message || "Không thể tải dữ liệu phân công");
  } finally {
    loading.value = false;
  }
};

const getTechTickets = (techId: number) => {
  return tickets.value.filter(
    (t) =>
      t.technicianId === techId &&
      t.status !== "Completed" &&
      t.status !== "Cancelled",
  );
};

const getTechWorkloadCount = (techId: number) => {
  return getTechTickets(techId).length;
};

const onDragStart = (event: DragEvent, ticket: RepairOrder) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData("text/plain", ticket.id.toString());
    event.dataTransfer.effectAllowed = "move";
  }
};

const onDragOver = (techId: number) => {
  activeDragOverTechId.value = techId;
};

const onDragLeave = () => {
  activeDragOverTechId.value = null;
};

const onDrop = async (event: DragEvent, tech: EmployeeResponse) => {
  activeDragOverTechId.value = null;
  if (!event.dataTransfer) return;

  const ticketId = Number(event.dataTransfer.getData("text/plain"));
  if (!ticketId) return;

  await assignJob(ticketId, tech.id);
};

const handleQuickAssign = async (ticketId: number, techId: number) => {
  await assignJob(ticketId, techId);
};

const assignJob = async (ticketId: number, techId: number) => {
  loading.value = true;
  try {
    const success = await RepairOrderApi.assignTechnician({
      repairOrderId: ticketId,
      technicianId: techId,
    });
    if (success) {
      ElMessage.success("Phân công công việc thành công!");
      await initData();
    } else {
      throw new Error("Không phản hồi kết quả từ server");
    }
  } catch (err: any) {
    ElMessage.error(err?.message || "Phân công thất bại");
  } finally {
    loading.value = false;
  }
};

const getTicketTimelineStyle = (ticket: RepairOrder) => {
  let startHour = 8;
  let duration = 2;

  if (ticket.startTime) {
    const date = new Date(ticket.startTime);
    startHour = date.getHours();
  } else {
    startHour = 8 + (ticket.id % 4) * 2;
  }

  if (ticket.expectedCompletionTime && ticket.startTime) {
    const start = new Date(ticket.startTime).getTime();
    const end = new Date(ticket.expectedCompletionTime).getTime();
    duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
  } else {
    duration = 2;
  }

  const totalGridHours = 11;
  const startOffset = Math.max(0, startHour - 8);
  const leftPercent = (startOffset / totalGridHours) * 100;
  const widthPercent = (duration / totalGridHours) * 100;

  const colors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"];
  const bgColor = colors[ticket.id % colors.length];

  return {
    left: `calc(${leftPercent}% + 4px)`,
    width: `calc(${widthPercent}% - 8px)`,
    backgroundColor: bgColor,
    zIndex: 10,
  };
};

onMounted(() => {
  initData();
});
</script>

<style scoped>
.assignment-container {
  min-height: 100%;
}

.ticket-card {
  padding: 14px;
  background-color: var(--el-bg-color-overlay, #fff);
  border: 1px solid var(--el-border-color-light, #e2e8f0);
  border-radius: 12px;
  cursor: grab;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgb(0 0 0 / 2%);
}

.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 5%);
  border-color: var(--el-color-primary, #409eff);
}

.ticket-card:active {
  cursor: grabbing;
}

.tech-column {
  padding: 16px;
  background-color: var(--el-bg-color-overlay, #fff);
  border: 1.5px solid var(--el-border-color-light, #e2e8f0);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.tech-column.drag-over {
  border-color: var(--el-color-primary, #409eff);
  background-color: rgb(64 158 255 / 4%);
  box-shadow: 0 4px 16px rgb(64 158 255 / 8%);
}

.tech-assigned-card {
  padding: 10px 12px;
  background-color: var(--el-bg-color, #f8fafc);
  border: 1px solid var(--el-border-color-light, #e2e8f0);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.tech-assigned-card:hover {
  border-color: var(--el-color-info-light-3, #a0cfff);
  background-color: #fff;
}

:global(html.dark) .tech-assigned-card {
  background-color: #1a1a1e;
  border-color: #2e2e33;
}

:global(html.dark) .tech-assigned-card:hover {
  background-color: #242428;
}

:global(html.dark) .ticket-card {
  background-color: #1a1a1e;
  border-color: #2e2e33;
}

:global(html.dark) .tech-column {
  background-color: #131316;
  border-color: #2e2e33;
}
</style>
