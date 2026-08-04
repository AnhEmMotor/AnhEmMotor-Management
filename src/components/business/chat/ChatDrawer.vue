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
import "@wangeditor/editor/dist/css/style.css";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

// Configure marked
const renderer = new marked.Renderer();
  // @ts-ignore - marked v4 Renderer.code signature compatibility
  renderer.code = function (tokenOrCode: any, maybeLang: string | undefined) {
    let code = "";
    let lang = maybeLang;
    if (typeof tokenOrCode === 'object' && tokenOrCode !== null) {
      code = tokenOrCode.text || "";
      lang = tokenOrCode.lang;
    } else {
      code = tokenOrCode || "";
    }
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
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
    .configureLogging(LogLevel.None)
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
  let text = newMessage.value.trim();
  if (isRichTextMode.value && text === "<p><br></p>") {
    text = "";
  }
  if (!text || isSending.value) return;

  newMessage.value = "";
  if (isRichTextMode.value && editorRef.value) {
    editorRef.value.clear();
  }

  // Optimistic UI update for user message
  const userMsgId = Date.now().toString();
  messages.value.push({
    id: userMsgId,
    role: "User",
    message: text,
    createdAt: new Date().toISOString(),
  });
  scrollToBottom();

  let sessionId = activeSessionId.value;
  if (!sessionId) {
    isCreatingSession.value = true;
    const newId = await createNewSession("", text, false);
    isCreatingSession.value = false;
    if (!newId) return;
    sessionId = newId;
    activeSessionId.value = sessionId;
  }

  // Prepare AI message placeholder for streaming
  const aiMsgId = (Date.now() + 1).toString();
  const aiMsg: ChatMessage = {
    id: aiMsgId,
    role: "AI",
    message: "",
    createdAt: new Date().toISOString(),
  };

  activeStreams.value[sessionId] = aiMsg;
  activeStreamSessions.value.add(sessionId);
  messages.value.push(aiMsg);
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
        if (activeStreams.value[sessionId]) {
          activeStreams.value[sessionId].message += chunk;
        }
        if (activeSessionId.value === sessionId) {
          scrollToBottom();
        }
      },
      error: (err: any) => {
        console.error("Stream error:", err);
        ElMessage.error("Loi khi nhan luong tin nhan");
        activeStreamSessions.value.delete(sessionId);
        delete activeStreams.value[sessionId];
      },
      complete: () => {
        activeStreamSessions.value.delete(sessionId);
        delete activeStreams.value[sessionId];
      },
    });
  } catch (error) {
    ElMessage.error("Loi khi gui tin nhan qua SignalR");
    if (activeSessionId.value === sessionId) {
      messages.value = messages.value.filter(
        (m) => m.id !== userMsgId && m.id !== aiMsgId,
      );
    }
    activeStreamSessions.value.delete(sessionId);
    delete activeStreams.value[sessionId];
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
            <div class="flex justify-end mt-1">
              <el-button
                type="primary"
                :icon="Position"
                @click="sendMessage"
                :disabled="
                  !newMessage.trim() ||
                  isSending ||
                  newMessage === '<p><br></p>'
                "
                :loading="isSending"
              >
                Gửi
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
</style>

