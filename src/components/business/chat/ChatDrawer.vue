<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import {
  ManagerChatApi as ChatApi,
  type ChatSession,
  type ChatMessage,
} from "@/api/chat/chat.api";
import { Plus, Delete, Position, Loading, Edit } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  HubConnection,
} from "@microsoft/signalr";
import { useUserStore } from "@/application/store/user";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits(["update:modelValue"]);

const drawerVisible = ref(props.modelValue);

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
const isSending = ref(false);
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
    .configureLogging(LogLevel.Information)
    .build();

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

onBeforeUnmount(() => {
  stopConnection();
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
        confirmButtonText: "Xoa",
        cancelButtonText: "Huy",
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

const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

  const text = newMessage.value.trim();
  newMessage.value = "";
  isSending.value = true;

  // Optimistic UI update for user message
  const userMsgId = Date.now().toString();
  messages.value.push({
    id: userMsgId,
    role: "User",
    message: text,
    createdAt: new Date().toISOString(),
  });
  scrollToBottom();

  // Auto create session if none selected
  if (!activeSessionId.value) {
    const newId = await createNewSession("", text, false);
    if (!newId) {
      isSending.value = false;
      return;
    }
    activeSessionId.value = newId;
  }

  const sessionId = activeSessionId.value!;

  // Prepare AI message placeholder for streaming
  const aiMsgId = (Date.now() + 1).toString();
  messages.value.push({
    id: aiMsgId,
    role: "AI",
    message: "",
    createdAt: new Date().toISOString(),
  });
  scrollToBottom();

  try {
    if (connection.value?.state !== HubConnectionState.Connected) {
      await startConnection();
    }

    // Call SignalR stream
    const stream = connection.value!.stream(
      "SendMessageStream",
      sessionId,
      text,
    );

    stream.subscribe({
      next: (chunk: string) => {
        // Append chunk to the last message (which is AI)
        const aiMsg = messages.value[messages.value.length - 1];
        aiMsg.message += chunk;
        scrollToBottom();
      },
      error: (err: any) => {
        console.error("Stream error:", err);
        ElMessage.error("Loi khi nhan luong tin nhan");
        isSending.value = false;
      },
      complete: () => {
        isSending.value = false;
      },
    });
  } catch (error) {
    ElMessage.error("Loi khi gui tin nhan qua SignalR");
    messages.value = messages.value.filter(
      (m) => m.id !== userMsgId && m.id !== aiMsgId,
    );
    isSending.value = false;
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
    size="800px"
    :with-header="false"
  >
    <div class="flex h-full border-l border-gray-200">
      <!-- Left: Session List -->
      <div class="w-1/3 flex flex-col border-r border-gray-200 bg-gray-50">
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
            <div class="text-xs text-gray-500 mt-1">
              {{ formatTime(session.updatedAt || session.createdAt) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Chat Area -->
      <div class="w-2/3 flex flex-col bg-white">
        <!-- Chat Header -->
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10"
        >
          <h2 class="font-semibold text-lg text-gray-800">
            {{
              sessions.find((s) => s.id === activeSessionId)?.title ||
              "Chưa chọn phiên chat"
            }}
          </h2>
          <el-button @click="drawerVisible = false">Đóng</el-button>
        </div>

        <!-- Messages Area -->
        <div
          class="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4"
          ref="messagesContainer"
          v-loading="isLoadingHistory"
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
              <div
                v-if="msg.message"
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
                  <div class="whitespace-pre-wrap">{{ msg.message }}</div>
                  <div
                    class="text-[10px] mt-1 text-right"
                    :class="
                      msg.role === 'User' ? 'text-blue-200' : 'text-gray-400'
                    "
                  >
                    {{ formatTime(msg.createdAt) }}
                  </div>
                </div>
              </div>
            </template>

            <div
              v-if="
                isSending &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'AI' &&
                !messages[messages.length - 1].message
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
          <div class="flex gap-2">
            <el-input
              v-model="newMessage"
              placeholder="Nhập câu hỏi của bạn..."
              @keyup.enter="sendMessage"
              :disabled="isSending"
              class="flex-1"
            />
            <el-button
              type="primary"
              :icon="Position"
              @click="sendMessage"
              :disabled="!newMessage.trim() || isSending"
              :loading="isSending"
            >
              Gửi
            </el-button>
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
</style>
