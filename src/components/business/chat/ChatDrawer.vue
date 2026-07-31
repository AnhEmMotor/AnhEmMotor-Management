<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { useQuery } from "@tanstack/vue-query";
import {
  ManagerChatApi as ChatApi,
  type ChatSession,
  type ChatMessage,
  type ChatMessageToolCall,
  type ChatReasoningStep,
  type ChatRunEventDto,
  type ChatPlanDto,
  type SteeringResultDto,
} from "@/api/chat/chat.api";
import PlanCard from "./PlanCard.vue";
import {
  Plus,
  Delete,
  Position,
  Loading,
  Edit,
  Menu,
  CircleCheck,
  ArrowRight,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { useUserStore } from "@/application/store/user";
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// Configure marked
const renderer = new marked.Renderer();
renderer.code = function (token: any) {
  let code = "";
  let lang = undefined;

  if (typeof token === "object" && token !== null) {
    code = token.text || "";
    lang = token.lang;
  } else {
    code = token || "";
  }

  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(code, { language }).value;

  // Escape code for data attribute to prevent XSS/breaking HTML
  const encodedCode = encodeURIComponent(code);

  return `
    <div class="code-block-wrapper relative group rounded-md overflow-hidden my-3 border border-gray-700 shadow-sm">
      <div class="flex justify-between items-center px-3 py-1.5 bg-[#282c34] text-xs text-gray-400 border-b border-gray-700">
        <span class="uppercase font-semibold tracking-wider">${language}</span>
        <button class="copy-btn hover:text-white transition-colors flex items-center gap-1 cursor-pointer" data-code="${encodedCode}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </button>
      </div>
      <pre class="!m-0 !p-3 bg-[#282c34] overflow-x-auto text-[13px] leading-relaxed text-gray-300"><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>
  `;
};
marked.use({ renderer });

const handleCopy = (e: Event) => {
  const target = e.target as HTMLElement;
  const btn = target.closest(".copy-btn") as HTMLElement;
  if (btn) {
    const code = decodeURIComponent(btn.getAttribute("data-code") || "");
    navigator.clipboard
      .writeText(code)
      .then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        btn.classList.add("text-green-400");
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove("text-green-400");
        }, 2000);
      })
      .catch(() => {
        ElMessage.error("Không thể copy đoạn code này");
      });
  }
};

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const drawerVisible = ref(props.modelValue);

const isRichTextMode = ref(false);
const editorRef = shallowRef();
const editorConfig = { placeholder: "Nhập câu hỏi của bạn..." };

const handleCreated = (editor: any) => {
  editorRef.value = editor;
};

watch(
  () => props.modelValue,
  (val) => {
    drawerVisible.value = val;
    if (val) {
      loadSessions();
      startConnection();
    } else {
      stopConnection();
    }
  },
);

watch(drawerVisible, (val) => {
  emit("update:modelValue", val);
});

const sessions = ref<ChatSession[]>([]);
const activeSessionId = ref<string | null>(null);

const messages = ref<ChatMessage[]>([]);
const newMessage = ref("");

const activeStreams = ref<Record<string, ChatMessage>>({});
const activeStreamSessions = ref<Set<string>>(new Set());
const activePlans = ref<Record<string, ChatMessage>>({});

interface RunWatcher {
  runId: string;
  lastSeq: number;
  watchdog: ReturnType<typeof setTimeout> | null;
  eventCount: number;
  steeringCount: number;
}
const RUN_WATCHDOG_MS = 45000;
const STEERING_MERGE_MS = 900;
const STEERING_STUCK_MS = 20000;
const MAX_STEERING_PER_RUN = 5;
const runWatchers = ref<Record<string, RunWatcher>>({});

interface SteeringBuffer {
  parts: string[];
  timer: ReturnType<typeof setTimeout> | null;
}
const steeringBuffers = ref<Record<string, SteeringBuffer>>({});
const steeringStuckWatchdogs = ref<
  Record<string, ReturnType<typeof setTimeout>>
>({});

type SteeringStatus = "received" | "applied" | "stuck";
const steeringStatus = ref<Record<string, SteeringStatus>>({});
const currentSteeringStatus = computed(() =>
  activeSessionId.value ? steeringStatus.value[activeSessionId.value] : null,
);

const { data: toolCatalog } = useQuery({
  queryKey: ["chat-tool-catalog"],
  queryFn: () => ChatApi.getToolCatalog(),
  staleTime: Infinity,
});
const toolLabelByName = computed(() => {
  const map: Record<string, string> = {};
  for (const tool of toolCatalog.value ?? []) map[tool.name] = tool.label;
  return map;
});
const toolCallText = (tool: ChatMessageToolCall) => {
  const lowered = tool.label.charAt(0).toLowerCase() + tool.label.slice(1);
  const prefix = `${tool.status === "done" ? "Đã" : "Đang"} ${lowered}`;
  let text = tool.summary ? `${prefix} — ${tool.summary}` : prefix;
  const period = tool.filtersApplied?.["Khoảng thời gian"];
  if (period) text += ` (${period})`;
  if (tool.truncated) text += ` — chỉ hiện một phần dữ liệu`;
  return text;
};

const parseToolStartPayload = (
  payload: string,
): Pick<ChatMessageToolCall, "name" | "summary" | "argsPreview"> => {
  try {
    const parsed = JSON.parse(payload);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.name === "string"
    ) {
      return {
        name: parsed.name,
        summary: parsed.summary || undefined,
        argsPreview: parsed.argsPreview || undefined,
      };
    }
  } catch {
    return { name: payload };
  }
  return { name: payload };
};

const parseToolEndPayload = (
  payload: string,
): Pick<
  ChatMessageToolCall,
  | "name"
  | "summary"
  | "durationMs"
  | "resultPreview"
  | "truncated"
  | "totalCount"
  | "asOf"
  | "warnings"
  | "filtersApplied"
> => {
  try {
    const parsed = JSON.parse(payload);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.name === "string"
    ) {
      return {
        name: parsed.name,
        summary: parsed.summary || undefined,
        durationMs: parsed.durationMs,
        resultPreview: parsed.resultPreview || undefined,
        truncated: parsed.truncated,
        totalCount: parsed.totalCount,
        asOf: parsed.asOf,
        warnings: parsed.warnings,
        filtersApplied: parsed.filtersApplied,
      };
    }
  } catch {
    return { name: payload };
  }
  return { name: payload };
};

const parseThinkingPayload = (payload: string): string => {
  try {
    const parsed = JSON.parse(payload);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.text === "string"
    ) {
      return parsed.text;
    }
  } catch {
    return payload;
  }
  return payload;
};

const runIdFromMessageId = (id?: string): string | undefined => {
  if (!id || !id.startsWith("run-")) return undefined;
  return id.slice("run-".length).split("-seg-")[0];
};

const submittingFeedback = ref<Record<string, boolean>>({});
const submitMessageFeedback = async (msg: ChatMessage) => {
  const runId = runIdFromMessageId(msg.id);
  if (!runId || submittingFeedback.value[msg.id!]) return;
  try {
    const { value: comment } = await ElMessageBox.prompt(
      "Mô tả ngắn gọn số liệu nào chưa đúng (không bắt buộc)",
      "Báo cáo số liệu chưa đúng",
      {
        confirmButtonText: "Gửi",
        cancelButtonText: "Huỷ",
        inputType: "textarea",
      },
    );
    submittingFeedback.value[msg.id!] = true;
    await ChatApi.submitFeedback(runId, comment);
    ElMessage.success("Đã ghi nhận phản hồi, cảm ơn bạn!");
  } catch {
    // người dùng bấm Huỷ hoặc API lỗi — không cần báo thêm
  } finally {
    submittingFeedback.value[msg.id!] = false;
  }
};

// Panel suy nghĩ thu gọn theo mặc định sau khi xong, mở khi đang chạy — trừ khi người dùng
// tự bấm mở/đóng thì giữ theo lựa chọn đó (override) cho tới khi tin nhắn bị gỡ khỏi state.
const reasoningPanelOverride = ref<Record<string, boolean>>({});
const isReasoningPanelOpen = (msg: ChatMessage) => {
  if (msg.id && msg.id in reasoningPanelOverride.value) {
    return reasoningPanelOverride.value[msg.id];
  }
  return msg.reasoningElapsedSeconds == null;
};
const toggleReasoningPanel = (msg: ChatMessage) => {
  if (!msg.id) return;
  reasoningPanelOverride.value[msg.id] = !isReasoningPanelOpen(msg);
};

const reasoningStartedAt = ref<Record<string, number>>({});
const markReasoningStarted = (msg: ChatMessage, startedAt?: string | null) => {
  if (msg.id && !(msg.id in reasoningStartedAt.value)) {
    reasoningStartedAt.value[msg.id] = startedAt
      ? new Date(startedAt).getTime()
      : Date.now();
  }
};
const finishReasoningTiming = (msg: ChatMessage | undefined) => {
  if (!msg?.id || !(msg.id in reasoningStartedAt.value)) return;
  msg.reasoningElapsedSeconds =
    (Date.now() - reasoningStartedAt.value[msg.id]) / 1000;
  delete reasoningStartedAt.value[msg.id];
};

const clearSteeringStuckWatchdog = (sessionId: string) => {
  const w = steeringStuckWatchdogs.value[sessionId];
  if (w) clearTimeout(w);
  delete steeringStuckWatchdogs.value[sessionId];
};

const armSteeringStuckWatchdog = (sessionId: string) => {
  clearSteeringStuckWatchdog(sessionId);
  steeringStuckWatchdogs.value[sessionId] = setTimeout(() => {
    steeringStatus.value[sessionId] = "stuck";
  }, STEERING_STUCK_MS);
};
const isCreatingSession = ref(false);
const isSending = computed(
  () =>
    isCreatingSession.value ||
    (activeSessionId.value
      ? activeStreamSessions.value.has(activeSessionId.value)
      : false),
);

const isLoadingSessions = ref(false);
const isLoadingHistory = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);
const editingSessionId = ref<string | null>(null);
const editingTitle = ref("");

const userStore = useUserStore();
const connection = ref<HubConnection | null>(null);

const startConnection = async () => {
  if (connection.value?.state === HubConnectionState.Connected) return;

  const token = userStore.accessToken;
  // using env API_URL or fallback
  const baseUrl =
    import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT ||
    "https://localhost:7147";
  connection.value = new HubConnectionBuilder()
    .withUrl(baseUrl + "/hubs/manager-chat", {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();

  connection.value.onreconnected(() => {
    Object.entries(runWatchers.value).forEach(([sessionId, watcher]) => {
      subscribeToRun(sessionId, watcher.runId, watcher.lastSeq);
    });
  });

  try {
    await connection.value.start();
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
  }
};

const stopConnection = async () => {
  if (connection.value?.state === HubConnectionState.Connected) {
    await connection.value.stop();
  }
};

const clearWatchdog = (sessionId: string) => {
  const watcher = runWatchers.value[sessionId];
  if (watcher?.watchdog) clearTimeout(watcher.watchdog);
};

const armWatchdog = (sessionId: string) => {
  clearWatchdog(sessionId);
  const watcher = runWatchers.value[sessionId];
  if (!watcher) return;
  watcher.watchdog = setTimeout(() => {
    const aiMsg = activeStreams.value[sessionId];
    if (aiMsg) {
      aiMsg.message += "\n\n_(Mất kết nối với AI. Vui lòng thử lại.)_";
    }
    ElMessage.warning("Phiên trả lời bị gián đoạn");
    cleanupRun(sessionId);
  }, RUN_WATCHDOG_MS);
};

const persistWatcher = (sessionId: string) => {
  const watcher = runWatchers.value[sessionId];
  if (!watcher) return;
  localStorage.setItem(
    `chatRun:${sessionId}`,
    JSON.stringify({
      sessionId,
      runId: watcher.runId,
      lastSeq: watcher.lastSeq,
    }),
  );
};

const cleanupRun = (sessionId: string) => {
  clearWatchdog(sessionId);
  clearSteeringStuckWatchdog(sessionId);
  delete runWatchers.value[sessionId];
  delete steeringBuffers.value[sessionId];
  delete steeringStatus.value[sessionId];
  activeStreamSessions.value.delete(sessionId);
  delete activeStreams.value[sessionId];
  delete activePlans.value[sessionId];
  localStorage.removeItem(`chatRun:${sessionId}`);
};

const subscribeToRun = (sessionId: string, runId: string, afterSeq: number) => {
  runWatchers.value[sessionId] = {
    runId,
    lastSeq: afterSeq,
    watchdog: null,
    eventCount: 0,
    steeringCount: 0,
  };
  activeStreamSessions.value.add(sessionId);
  armWatchdog(sessionId);

  const stream = connection.value!.stream("SubscribeRun", runId, afterSeq);
  stream.subscribe({
    next: (evt: ChatRunEventDto) => {
      const watcher = runWatchers.value[sessionId];
      if (!watcher) return;
      watcher.lastSeq = evt.seq;

      const aiMsg = activeStreams.value[sessionId];
      switch (evt.type) {
        case "text_delta":
          if (aiMsg) aiMsg.message += evt.payload;
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        case "message_correction":
          // Guardrail phát hiện câu vừa stream sai (bịa số, hứa hẹn suông, lộ dữ liệu...) sau khi
          // sinh xong — THAY toàn bộ nội dung đã hiện, không phải nối thêm.
          if (aiMsg) aiMsg.message = evt.payload;
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        case "run_heartbeat":
          armWatchdog(sessionId);
          break;
        case "steering_received":
          steeringStatus.value[sessionId] = "received";
          armSteeringStuckWatchdog(sessionId);
          break;
        case "steering_applied":
          clearSteeringStuckWatchdog(sessionId);
          steeringStatus.value[sessionId] = "applied";
          setTimeout(() => {
            if (steeringStatus.value[sessionId] === "applied") {
              delete steeringStatus.value[sessionId];
            }
          }, 2000);
          break;
        case "turn_boundary": {
          const nextAiMsg: ChatMessage = {
            id: `run-${watcher.runId}-seg-${evt.seq}`,
            role: "AI",
            message: "",
            createdAt: new Date().toISOString(),
          };
          activeStreams.value[sessionId] = nextAiMsg;
          markReasoningStarted(nextAiMsg);
          messages.value.push(nextAiMsg);
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        }
        case "run_redirected":
          clearSteeringStuckWatchdog(sessionId);
          delete steeringStatus.value[sessionId];
          break;
        case "thinking": {
          if (!aiMsg) break;
          markReasoningStarted(aiMsg);
          const text = parseThinkingPayload(evt.payload || "");
          aiMsg.reasoningSteps = [
            ...(aiMsg.reasoningSteps ?? []),
            { kind: "thinking", text },
          ];
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        }
        case "tool_start": {
          if (!aiMsg) break;
          markReasoningStarted(aiMsg);
          const { name, summary, argsPreview } = parseToolStartPayload(
            evt.payload || "",
          );
          const label = toolLabelByName.value[name] || name || "dữ liệu";
          aiMsg.reasoningSteps = [
            ...(aiMsg.reasoningSteps ?? []),
            {
              kind: "tool",
              name,
              label,
              summary,
              argsPreview,
              status: "running",
            },
          ];
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        }
        case "tool_end": {
          const list = aiMsg?.reasoningSteps;
          if (list) {
            const { name, ...toolResult } = parseToolEndPayload(
              evt.payload || "",
            );
            const lastRunningIdx = list.findLastIndex(
              (s) =>
                s.kind === "tool" && s.name === name && s.status === "running",
            );
            const current =
              lastRunningIdx !== -1 ? list[lastRunningIdx] : undefined;
            if (current?.kind === "tool") {
              const updated = [...list];
              updated[lastRunningIdx] = {
                ...current,
                ...toolResult,
                status: "done",
              };
              aiMsg!.reasoningSteps = updated;
            }
          }
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        }
        case "run_completed":
        case "run_cancelled":
          finishReasoningTiming(aiMsg);
          cleanupRun(sessionId);
          break;
        case "error":
          ElMessage.error(evt.payload || "Đã có lỗi xảy ra khi AI trả lời");
          cleanupRun(sessionId);
          break;
        case "plan_started": {
          ChatApi.getPlan(watcher.runId)
            .then((plan) => {
              const planMsg: ChatMessage = {
                id: `plan-${watcher.runId}`,
                role: "AI",
                message: "",
                createdAt: new Date().toISOString(),
                plan,
              };
              activePlans.value[sessionId] = planMsg;
              messages.value.push(planMsg);
              if (activeSessionId.value === sessionId) scrollToBottom();
            })
            .catch((err) => console.error("Không thể tải kế hoạch:", err));
          break;
        }
        case "plan_step_added": {
          const planMsg = activePlans.value[sessionId];
          if (!planMsg?.plan) break;
          try {
            const { step } = JSON.parse(evt.payload || "{}");
            if (step) planMsg.plan.steps = [...planMsg.plan.steps, step];
          } catch (err) {
            console.error("plan_step_added payload lỗi:", err);
          }
          if (activeSessionId.value === sessionId) scrollToBottom();
          break;
        }
        case "plan_ready": {
          const planMsg = activePlans.value[sessionId];
          if (planMsg?.plan) planMsg.plan.status = "Ready";
          break;
        }
        case "plan_step_started": {
          const planMsg = activePlans.value[sessionId];
          if (!planMsg?.plan) break;
          try {
            const { stepId } = JSON.parse(evt.payload || "{}");
            const step = planMsg.plan.steps.find((s) => s.id === stepId);
            if (step) step.status = "running";
          } catch (err) {
            console.error("plan_step_started payload lỗi:", err);
          }
          break;
        }
        case "plan_step_completed": {
          const planMsg = activePlans.value[sessionId];
          if (!planMsg?.plan) break;
          try {
            const { stepId, status, summary } = JSON.parse(evt.payload || "{}");
            const step = planMsg.plan.steps.find((s) => s.id === stepId);
            if (step) {
              step.status = status ?? "done";
              step.result = summary ?? step.result;
            }
          } catch (err) {
            console.error("plan_step_completed payload lỗi:", err);
          }
          break;
        }
        case "plan_edited":
        case "plan_invalidated": {
          const planMsg = activePlans.value[sessionId];
          if (!planMsg) break;
          ChatApi.getPlan(watcher.runId)
            .then((plan) => {
              planMsg.plan = plan;
            })
            .catch((err) => console.error("Không thể tải lại kế hoạch:", err));
          break;
        }
        case "plan_approved": {
          const planMsg = activePlans.value[sessionId];
          if (planMsg?.plan) planMsg.plan.status = "Executing";
          break;
        }
        case "plan_rejected": {
          const planMsg = activePlans.value[sessionId];
          if (planMsg?.plan) planMsg.plan.status = "Rejected";
          break;
        }
        default:
          // Bỏ qua event lạ để tương thích ngược khi backend thêm loại event mới
          break;
      }

      watcher.eventCount++;
      if (watcher.eventCount % 20 === 0) persistWatcher(sessionId);
    },
    error: (err: any) => {
      console.error("SubscribeRun error:", err);
      cleanupRun(sessionId);
    },
    complete: () => {
      cleanupRun(sessionId);
    },
  });
};

const PLAN_RUN_STATUSES = new Set(["AwaitingApproval", "Executing"]);

const resumeActiveRun = async (sessionId: string) => {
  try {
    const activeRun = await ChatApi.getActiveRun(sessionId);
    if (!activeRun) return;

    if (PLAN_RUN_STATUSES.has(activeRun.status)) {
      const plan = await ChatApi.getPlan(activeRun.runId);
      const planMsg: ChatMessage = {
        id: `plan-${activeRun.runId}`,
        role: "AI",
        message: "",
        createdAt: activeRun.startedAt || new Date().toISOString(),
        plan,
      };
      activePlans.value[sessionId] = planMsg;
      messages.value.push(planMsg);
    } else {
      const aiMsg: ChatMessage = {
        id: `run-${activeRun.runId}`,
        role: "AI",
        message: activeRun.partialOutput,
        createdAt: activeRun.startedAt || new Date().toISOString(),
      };
      activeStreams.value[sessionId] = aiMsg;
      markReasoningStarted(aiMsg, activeRun.startedAt);
      messages.value.push(aiMsg);
    }
    if (activeSessionId.value === sessionId) scrollToBottom();

    if (connection.value?.state !== HubConnectionState.Connected) {
      await startConnection();
    }
    subscribeToRun(sessionId, activeRun.runId, activeRun.lastSeq);
  } catch (error) {
    console.error("Không thể khôi phục run đang chạy:", error);
  }
};

const cancelCurrentRun = async () => {
  const sessionId = activeSessionId.value;
  if (!sessionId) return;
  const watcher = runWatchers.value[sessionId];
  if (!watcher) return;
  try {
    await connection.value?.invoke("CancelRun", watcher.runId);
  } catch (error) {
    ElMessage.error("Không thể dừng AI");
  }
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible" && drawerVisible.value) {
    loadSessions();
  }
};
document.addEventListener("visibilitychange", handleVisibilityChange);

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  stopConnection();
  const editor = editorRef.value;
  if (editor != null) {
    editor.destroy();
  }
});

const loadSessions = async () => {
  try {
    isLoadingSessions.value = true;
    const res = await ChatApi.getSessions();
    sessions.value = res || [];
  } catch (error) {
    ElMessage.error("Không thể tải danh sách phiên chat");
  } finally {
    isLoadingSessions.value = false;
  }
};

const selectSession = async (id: string) => {
  activeSessionId.value = id;
  try {
    isLoadingHistory.value = true;
    const res = await ChatApi.getSessionHistory(id);
    messages.value = res || [];

    if (activeStreams.value[id]) {
      messages.value.push(activeStreams.value[id]);
    } else {
      await resumeActiveRun(id);
    }

    scrollToBottom();
  } catch (error) {
    ElMessage.error("Khong the tai lich su chat");
  } finally {
    isLoadingHistory.value = false;
  }
};

const createNewSession = async (
  initialTitle: string = "",
  initialMessage: string = "",
  autoSelect: boolean = true,
) => {
  try {
    const res = await ChatApi.createSession(initialTitle, initialMessage);
    sessions.value.unshift(res);
    if (autoSelect) {
      await selectSession(res.id);
    }
    return res.id;
  } catch (error) {
    ElMessage.error("Không thể tạo phiên chat mới");
    return null;
  }
};

const startNewChat = () => {
  activeSessionId.value = null;
  messages.value = [];
};

const deleteSession = async (id: string, e: Event) => {
  e.stopPropagation();
  try {
    await ElMessageBox.confirm(
      "Bạn có chắc muốn xoá phiên chat này?",
      "Xác nhận",
      {
        confirmButtonText: "Xoá",
        cancelButtonText: "Huỷ",
        type: "warning",
      },
    );

    await ChatApi.deleteSession(id);
    sessions.value = sessions.value.filter((s) => s.id !== id);

    if (activeSessionId.value === id) {
      activeSessionId.value = null;
      messages.value = [];
      if (sessions.value.length > 0) {
        selectSession(sessions.value[0].id);
      }
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Lỗi khi xoá phiên chat");
    }
  }
};

const startEditSession = (session: ChatSession, e: Event) => {
  e.stopPropagation();
  editingSessionId.value = session.id;
  editingTitle.value = session.title;
};

const saveSessionTitle = async (id: string) => {
  if (!editingTitle.value.trim()) {
    editingSessionId.value = null;
    return;
  }

  try {
    await ChatApi.updateSession(id, editingTitle.value.trim());
    const session = sessions.value.find((s) => s.id === id);
    if (session) {
      session.title = editingTitle.value.trim();
    }
    ElMessage.success("Cap nhat tieu de thanh cong");
  } catch (error) {
    ElMessage.error("Loi khi cap nhat tieu de");
  } finally {
    editingSessionId.value = null;
  }
};

const beginNewRun = (sessionId: string, runId: string) => {
  const aiMsg: ChatMessage = {
    id: `run-${runId}`,
    role: "AI",
    message: "",
    createdAt: new Date().toISOString(),
  };
  activeStreams.value[sessionId] = aiMsg;
  markReasoningStarted(aiMsg);
  activeStreamSessions.value.add(sessionId);
  messages.value.push(aiMsg);
  if (activeSessionId.value === sessionId) scrollToBottom();
  subscribeToRun(sessionId, runId, 0);
};

const flushSteeringBuffer = async (sessionId: string) => {
  const buf = steeringBuffers.value[sessionId];
  if (!buf) return;
  const merged = buf.parts.join("\n");
  delete steeringBuffers.value[sessionId];

  const watcher = runWatchers.value[sessionId];
  if (!watcher) return;

  if (watcher.steeringCount >= MAX_STEERING_PER_RUN) {
    ElMessage.warning(
      "Đã gửi quá nhiều đính chính cho lần trả lời này. Hãy bấm Dừng và hỏi lại từ đầu.",
    );
    return;
  }

  try {
    const result: SteeringResultDto = await connection.value!.invoke(
      "SendSteering",
      watcher.runId,
      merged,
    );
    watcher.steeringCount++;

    messages.value.push({
      id: `steering-${watcher.runId}-${watcher.steeringCount}`,
      role: "User",
      message: merged,
      createdAt: new Date().toISOString(),
    });

    if (result.mode === "restart") {
      cleanupRun(sessionId);
      if (activeSessionId.value === sessionId) {
        beginNewRun(sessionId, result.runId);
      }
    } else {
      armSteeringStuckWatchdog(sessionId);
    }
    if (activeSessionId.value === sessionId) scrollToBottom();
  } catch (error) {
    ElMessage.error("Không thể gửi đính chính, vui lòng thử lại");
  }
};

const sendSteering = (sessionId: string, text: string) => {
  let buf = steeringBuffers.value[sessionId];
  if (!buf) {
    buf = { parts: [], timer: null };
    steeringBuffers.value[sessionId] = buf;
  }
  buf.parts.push(text);
  if (buf.timer) clearTimeout(buf.timer);
  buf.timer = setTimeout(
    () => flushSteeringBuffer(sessionId),
    STEERING_MERGE_MS,
  );
};

const sendMessage = async () => {
  let text = newMessage.value.trim();
  if (isRichTextMode.value && text === "<p><br></p>") {
    text = "";
  }
  if (!text || isCreatingSession.value) return;

  newMessage.value = "";
  if (isRichTextMode.value && editorRef.value) {
    editorRef.value.clear();
  }

  let sessionId = activeSessionId.value;

  if (sessionId && activeStreamSessions.value.has(sessionId)) {
    sendSteering(sessionId, text);
    return;
  }

  // Run có thể vừa được tab khác khởi động mà tab này chưa kịp subscribe —
  // kiểm tra lại với server trước khi tạo run mới, tránh 2 run cùng chạy.
  if (sessionId && !activeStreams.value[sessionId]) {
    try {
      const activeRun = await ChatApi.getActiveRun(sessionId);
      if (activeRun) {
        await resumeActiveRun(sessionId);
        sendSteering(sessionId, text);
        return;
      }
    } catch (error) {
      console.error("Không thể kiểm tra run đang chạy:", error);
    }
  }

  const userMsgId = Date.now().toString();
  messages.value.push({
    id: userMsgId,
    role: "User",
    message: text,
    createdAt: new Date().toISOString(),
  });
  scrollToBottom();

  if (!sessionId) {
    isCreatingSession.value = true;
    const newId = await createNewSession("", text, false);
    isCreatingSession.value = false;
    if (!newId) return;
    sessionId = newId;
    activeSessionId.value = sessionId;
  }

  try {
    if (connection.value?.state !== HubConnectionState.Connected) {
      await startConnection();
    }

    const runId: string = await connection.value!.invoke(
      "StartRun",
      sessionId,
      text,
    );
    beginNewRun(sessionId, runId);
  } catch (error) {
    console.error("StartRun error:", error);
    ElMessage.error("Lỗi khi gửi tin nhắn qua SignalR");
    if (activeSessionId.value === sessionId) {
      messages.value = messages.value.filter((m) => m.id !== userMsgId);
    }
    cleanupRun(sessionId);
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    title="AI Chat Manager"
    direction="rtl"
    size="75%"
    :with-header="false"
    class="ai-chat-drawer-no-padding"
  >
    <div class="flex h-full border-l border-gray-200">
      <!-- Left: Session List -->
      <div class="chat-left-col flex-col border-r border-gray-200 bg-gray-50">
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-center bg-white"
        >
          <h2 class="font-semibold text-lg">Phiên Chat</h2>
          <el-button
            type="primary"
            :icon="Plus"
            circle
            @click="startNewChat()"
          />
        </div>

        <div class="flex-1 overflow-y-auto p-2" v-loading="isLoadingSessions">
          <div
            v-if="sessions.length === 0"
            class="text-center text-gray-500 mt-10"
          >
            Chưa có phiên chat nào
          </div>

          <div
            v-for="session in sessions"
            :key="session.id"
            class="p-3 mb-2 rounded-lg cursor-pointer transition-colors group relative"
            :class="
              activeSessionId === session.id
                ? 'bg-blue-100 border border-blue-300'
                : 'bg-white hover:bg-gray-100 border border-transparent'
            "
            @click="selectSession(session.id)"
          >
            <div class="flex justify-between items-start">
              <div
                v-if="editingSessionId === session.id"
                class="flex-1 mr-2"
                @click.stop
              >
                <el-input
                  v-model="editingTitle"
                  size="small"
                  @keyup.enter="saveSessionTitle(session.id)"
                  @blur="saveSessionTitle(session.id)"
                  autofocus
                />
              </div>
              <div v-else class="font-medium truncate pr-14">
                {{ session.title }}
              </div>

              <div
                class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
              >
                <el-button
                  v-if="editingSessionId !== session.id"
                  type="primary"
                  :icon="Edit"
                  circle
                  size="small"
                  @click="(e) => startEditSession(session, e)"
                />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  @click="(e) => deleteSession(session.id, e)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Chat Area -->
      <div class="chat-right-col flex-col bg-white">
        <!-- Chat Header -->
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10"
        >
          <div class="flex items-center gap-2">
            <!-- Mobile Dropdown -->
            <div class="chat-mobile-dropdown">
              <el-dropdown trigger="hover">
                <el-button :icon="Menu" circle size="small" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="session in sessions"
                      :key="session.id"
                      @click="selectSession(session.id)"
                      :class="{
                        'font-bold text-blue-600':
                          activeSessionId === session.id,
                      }"
                    >
                      {{ session.title }}
                    </el-dropdown-item>
                    <el-dropdown-item
                      :divided="sessions.length > 0"
                      @click="startNewChat()"
                    >
                      + Tạo phiên chat mới
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <h2 class="font-semibold text-lg text-gray-800">
              {{ sessions.find((s) => s.id === activeSessionId)?.title || "" }}
            </h2>
          </div>
          <el-button @click="drawerVisible = false">Đóng</el-button>
        </div>

        <!-- Messages Area -->
        <div
          class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4"
          ref="messagesContainer"
          v-loading="isLoadingHistory"
          @click="handleCopy"
        >
          <div
            v-if="!activeSessionId && messages.length === 0"
            class="m-auto text-gray-400"
          >
            Bắt đầu gõ tin nhắn để tạo phiên chat mới
          </div>
          <div
            v-else-if="messages.length === 0 && !isLoadingHistory"
            class="m-auto text-gray-400"
          >
            Bắt đầu cuộc trò chuyện...
          </div>

          <template v-else>
            <template v-for="msg in messages" :key="msg.id">
              <div v-if="msg.plan" class="flex w-full justify-start">
                <PlanCard
                  :plan="msg.plan"
                  @update:plan="(p) => (msg.plan = p)"
                />
              </div>
              <div
                v-else-if="
                  msg.message ||
                  (msg.role === 'AI' && msg.reasoningSteps?.length)
                "
                class="flex w-full"
                :class="msg.role === 'User' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[80%] rounded-2xl px-4 py-2 shadow-sm"
                  :class="
                    msg.role === 'User'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  "
                >
                  <div
                    v-if="msg.reasoningSteps?.length"
                    class="mb-2 -mx-1 rounded-lg border border-gray-100 bg-gray-50"
                  >
                    <button
                      class="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                      @click="toggleReasoningPanel(msg)"
                    >
                      <el-icon
                        class="transition-transform"
                        :style="{
                          transform: isReasoningPanelOpen(msg)
                            ? 'rotate(90deg)'
                            : 'rotate(0deg)',
                        }"
                        ><ArrowRight
                      /></el-icon>
                      <span v-if="msg.reasoningElapsedSeconds != null">
                        Đã suy nghĩ trong
                        {{ msg.reasoningElapsedSeconds.toFixed(1) }} giây
                      </span>
                      <template v-else>
                        <el-icon class="is-loading text-blue-500"
                          ><Loading
                        /></el-icon>
                        <span>Đang suy nghĩ...</span>
                      </template>
                    </button>
                    <div
                      v-if="isReasoningPanelOpen(msg)"
                      class="flex flex-col gap-1 px-3 pb-2"
                    >
                      <div class="text-[11px] italic text-gray-400">
                        Đây là diễn giải của AI, không phải nhật ký hệ thống
                      </div>
                      <template
                        v-for="(step, idx) in msg.reasoningSteps"
                        :key="idx"
                      >
                        <div
                          v-if="idx > 0 && step.kind === 'thinking'"
                          class="border-t border-gray-200 mt-1 pt-1"
                        ></div>
                        <div
                          v-if="step.kind === 'thinking'"
                          class="flex items-start gap-2 text-xs text-gray-500"
                        >
                          <span class="tabular-nums text-gray-400"
                            >{{ idx + 1 }}.</span
                          >
                          <span>💭</span>
                          <span>{{ step.text }}</span>
                        </div>
                        <div
                          v-else
                          class="flex items-center gap-2 text-xs"
                          :class="
                            step.status === 'done'
                              ? 'text-gray-400'
                              : 'text-gray-700'
                          "
                        >
                          <span class="tabular-nums text-gray-400"
                            >{{ idx + 1 }}.</span
                          >
                          <el-icon
                            v-if="step.status === 'running'"
                            class="is-loading text-blue-500"
                            ><Loading
                          /></el-icon>
                          <el-icon v-else class="text-green-500"
                            ><CircleCheck
                          /></el-icon>
                          <span>{{ toolCallText(step) }}</span>
                        </div>
                      </template>
                      <div
                        v-for="warning in msg.reasoningSteps
                          .filter((s) => s.kind === 'tool')
                          .flatMap((s) => s.warnings ?? [])"
                        :key="warning"
                        class="text-xs text-amber-600"
                      >
                        ⚠ {{ warning }}
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="msg.role === 'AI'"
                    v-html="marked.parse(msg.message || '')"
                    class="prose prose-sm max-w-none text-gray-800"
                  ></div>
                  <div
                    v-else-if="msg.message.includes('<')"
                    v-html="msg.message"
                    class="prose prose-sm max-w-none text-white"
                  ></div>
                  <div v-else class="whitespace-pre-wrap">
                    {{ msg.message }}
                  </div>
                  <div
                    class="text-[10px] mt-1 flex items-center justify-end gap-2"
                    :class="
                      msg.role === 'User' ? 'text-blue-200' : 'text-gray-400'
                    "
                  >
                    <button
                      v-if="msg.role === 'AI' && msg.reasoningSteps?.length"
                      class="hover:text-amber-600 hover:underline"
                      @click="submitMessageFeedback(msg)"
                    >
                      Số liệu chưa đúng
                    </button>
                    <span>{{ formatTime(msg.createdAt) }}</span>
                  </div>
                </div>
              </div>
            </template>

            <div
              v-if="
                isSending &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'AI' &&
                !messages[messages.length - 1].message &&
                !messages[messages.length - 1].reasoningSteps?.length
              "
              class="flex justify-start w-full"
            >
              <div
                class="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2"
              >
                <el-icon class="is-loading"><Loading /></el-icon>
                <span class="text-gray-500 text-sm">Đang suy nghĩ...</span>
              </div>
            </div>
          </template>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-gray-200 bg-white">
          <div
            v-if="currentSteeringStatus"
            class="mb-2 flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs"
            :class="
              currentSteeringStatus === 'stuck'
                ? 'bg-orange-50 text-orange-600'
                : 'bg-blue-50 text-blue-600'
            "
          >
            <span v-if="currentSteeringStatus === 'received'"
              >⏳ Đã ghi nhận, AI sẽ xử lý ở bước tiếp theo</span
            >
            <span v-else-if="currentSteeringStatus === 'applied'"
              >✓ AI đã tiếp nhận</span
            >
            <span v-else>⏳ AI đang hoàn tất bước hiện tại...</span>
            <el-button
              v-if="currentSteeringStatus === 'stuck'"
              size="small"
              type="danger"
              plain
              @click="cancelCurrentRun"
            >
              Dừng và hỏi lại
            </el-button>
          </div>

          <div class="flex justify-between items-center mb-2">
            <span class="text-xs text-gray-500 font-medium">Chế độ nhập:</span>
            <el-switch
              v-model="isRichTextMode"
              active-text="Rich Text"
              inactive-text="Văn bản thường"
              inline-prompt
            />
          </div>

          <div v-if="!isRichTextMode" class="flex gap-2">
            <el-input
              v-model="newMessage"
              :placeholder="
                isSending
                  ? 'Gửi thêm thông tin hoặc đính chính...'
                  : 'Nhập câu hỏi của bạn...'
              "
              @keyup.enter="sendMessage"
              :disabled="isCreatingSession"
              class="flex-1"
            />
            <el-button
              type="primary"
              :icon="Position"
              @click="sendMessage"
              :disabled="!newMessage.trim() || isCreatingSession"
            >
              Gửi
            </el-button>
            <el-button
              v-if="isSending"
              type="danger"
              plain
              @click="cancelCurrentRun"
            >
              Dừng
            </el-button>
          </div>

          <div v-else class="flex flex-col gap-2">
            <div
              style="border: 1px solid #dcdfe6; border-radius: 4px; z-index: 10"
            >
              <Toolbar
                style="border-bottom: 1px solid #dcdfe6"
                :editor="editorRef"
                :defaultConfig="{}"
                mode="simple"
              />
              <Editor
                style="height: 150px; overflow-y: hidden"
                v-model="newMessage"
                :defaultConfig="editorConfig"
                mode="simple"
                @onCreated="handleCreated"
              />
            </div>
            <div class="flex justify-end gap-2 mt-1">
              <el-button
                type="primary"
                :icon="Position"
                @click="sendMessage"
                :disabled="!newMessage.trim() || newMessage === '<p><br></p>'"
              >
                Gửi
              </el-button>
              <el-button
                v-if="isSending"
                type="danger"
                plain
                @click="cancelCurrentRun"
              >
                Dừng
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
:deep(.el-drawer__body) {
  padding: 0;
}

:deep(.prose ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.prose ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.prose li) {
  margin-bottom: 0.25rem;
}

:deep(.prose p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

:deep(.prose p:first-child) {
  margin-top: 0;
}

:deep(.prose p:last-child) {
  margin-bottom: 0;
}

:deep(.prose strong) {
  font-weight: 600;
}
</style>

<style>
.ai-chat-drawer-no-padding .el-drawer__body {
  padding: 0 !important;
}

.chat-left-col {
  display: flex;
  width: 20%;
}

.chat-right-col {
  display: flex;
  width: 80%;
}

.chat-mobile-dropdown {
  display: none;
}

@media (width <= 1280px) {
  .ai-chat-drawer-no-padding {
    width: 100% !important;
  }

  .chat-left-col {
    display: none !important;
  }

  .chat-right-col {
    width: 100% !important;
  }

  .chat-mobile-dropdown {
    display: block !important;
  }
}
</style>
