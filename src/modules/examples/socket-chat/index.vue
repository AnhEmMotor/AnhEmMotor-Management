<template>
  <div class="page-content mb-5">
    <div class="mb-15 text-center">
      <h1 class="my-4 text-2xl font-semibold leading-tight">
        {{ $t("admin.t92") }}
      </h1>
      <p class="m-0 text-base leading-relaxed text-g-700">
        {{ $t("admin.t93") }}
      </p>
    </div>

    <ElRow :gutter="20" class="mb-15">
      <ElCol :xs="24" :sm="12" :md="8">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-500 mb-1">
              {{ messageCount }}
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">
              {{ $t("admin.t94") }}
            </div>
            <div class="text-xs text-gray-500">{{ $t("admin.t95") }}</div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="8">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <ElTag :type="connectionTagType" size="large" class="mb-2">
              {{ wsClient?.connectionStatusText || "Chưaliềntiếp" }}
            </ElTag>
            <div class="text-sm font-medium text-gray-900">
              {{ $t("admin.t96") }}
            </div>
            <div class="text-xs text-gray-500">{{ $t("admin.t97") }}</div>
          </div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="8">
        <ElCard class="h-full border-0" :body-style="{ padding: '20px' }">
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-500 mb-1">
              {{ reconnectCount }}
            </div>
            <div class="text-sm font-medium text-gray-900 mb-1">
              {{ $t("admin.t98") }}
            </div>
            <div class="text-xs text-gray-500">{{ $t("admin.t99") }}</div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-15">
      <ElCol :xs="24" :md="12">
        <ElCard class="h-full border-0">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold">{{ $t("admin.t100") }}</span>
              <ElTag :type="connectionTagType" size="large">
                {{ wsClient?.connectionStatusText || "Chưaliềntiếp" }}
              </ElTag>
            </div>
          </template>

          <ElForm :model="connectForm" label-width="100px" class="max-w-md">
            <ElFormItem label="phụcvụthiết bịDiaChi">
              <ElInput
                v-model="connectForm.url"
                placeholder="ws://localhost:8080/ws"
                clearable
              />
            </ElFormItem>
            <ElFormItem label="liềntiếpvịmục">
              <ElSpace>
                <ElCheckbox v-model="connectForm.autoReconnect"
                  >từđộngtrùngliền</ElCheckbox
                >
                <ElCheckbox v-model="connectForm.heartbeat"
                  >tâmnhảyđo</ElCheckbox
                >
              </ElSpace>
            </ElFormItem>
            <ElFormItem>
              <ElSpace>
                <ElButton
                  type="primary"
                  @click="handleConnect"
                  :loading="isConnecting"
                  :disabled="isConnected"
                >
                  {{ isConnecting ? "liềntiếptrong..." : "liềntiếp" }}
                </ElButton>
                <ElButton
                  type="danger"
                  @click="handleDisconnect"
                  :disabled="!isConnected"
                >
                  đoánmởliềntiếp
                </ElButton>
                <ElButton @click="handleReconnect" :disabled="isConnecting"
                  >trùngliền</ElButton
                >
              </ElSpace>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :md="12">
        <ElCard class="h-full border-0">
          <template #header>
            <span class="text-base font-bold">phátgửiTinNhan</span>
          </template>

          <ElForm :model="messageForm" @submit.prevent="handleSendMessage">
            <ElFormItem label="TinNhanloạikiểu">
              <ElSelect v-model="messageForm.type" class="w-full">
                <ElOption label="vănquyểnTinNhan" value="text" />
                <ElOption label="JSONDữ liệu" value="json" />
                <ElOption label="tâmnhảybao" value="ping" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="TinNhanNoiDung">
              <ElInput
                v-model="messageForm.content"
                type="textarea"
                :rows="4"
                placeholder="Vui lòng nhậpcầnphátgửicủaTinNhanNoiDung"
              />
            </ElFormItem>
            <ElFormItem>
              <ElSpace>
                <ElButton
                  type="primary"
                  @click="handleSendMessage"
                  :disabled="!isConnected || !messageForm.content"
                >
                  phátgửiTinNhan
                </ElButton>
                <ElButton @click="clearMessageForm">xóakhông</ElButton>
              </ElSpace>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElRow class="mb-15">
      <ElCol :span="24">
        <ElCard class="border-0">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold">tiếpBộTinNhan</span>
              <ElButton size="small" @click="clearMessages"
                >xóakhôngGhi chép</ElButton
              >
            </div>
          </template>

          <div class="message-container">
            <div
              v-for="(message, index) in messageList"
              :key="index"
              class="message-item"
            >
              <div class="message-header">
                <ElTag
                  size="small"
                  :type="message.type === 'received' ? 'success' : 'info'"
                >
                  {{ message.type === "received" ? "tiếpBộ" : "phátgửi" }}
                </ElTag>
                <span class="message-time">{{ message.time }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
            </div>

            <ElEmpty
              v-if="messageList.length === 0"
              description="TạmvôTinNhanGhi chép"
              :image-size="100"
            />
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <ElCard class="border-0">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-bold">liềntiếpNhatKy</span>
          <ElButton size="small" @click="clearLogs">xóakhôngNhatKy</ElButton>
        </div>
      </template>

      <div class="log-container">
        <ElAlert
          v-for="(log, index) in logList"
          :key="index"
          :type="log.type"
          :closable="false"
          class="!mb-2"
        >
          <template #title>
            <div class="flex items-start gap-2">
              <span class="text-xs opacity-70 whitespace-nowrap">{{
                log.time
              }}</span>
              <span class="flex-1">{{ log.message }}</span>
            </div>
          </template>
        </ElAlert>

        <ElEmpty
          v-if="logList.length === 0"
          description="TạmvôNhatKyGhi chép"
          :image-size="100"
        />
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import WebSocketClient from "@/common/utils/socket";
import { ElMessage } from "element-plus";

defineOptions({ name: "WidgetsSocketChat" });

const wsClient = ref<WebSocketClient | null>(null);

const isConnecting = ref(false);
const isConnected = ref(false);
const reconnectCount = ref(0);
const messageCount = ref(0);

let stopWatchConnection: (() => void) | null = null;
let stopWatchStatus: (() => void) | null = null;

const connectForm = ref({
  url: "ws://localhost:8080/ws",
  autoReconnect: true,
  heartbeat: true,
});

const messageForm = ref({
  type: "text",
  content: "",
});

const messageList = ref<
  Array<{
    type: "sent" | "received";
    content: string;
    time: string;
  }>
>([]);

const logList = ref<
  Array<{
    type: "info" | "success" | "warning" | "error";
    message: string;
    time: string;
  }>
>([]);

const connectionTagType = computed(() => {
  if (isConnecting.value) return "warning";
  if (isConnected.value) return "success";
  return "danger";
});

const addLog = (
  type: "info" | "success" | "warning" | "error",
  message: string,
) => {
  logList.value.unshift({
    type,
    message,
    time: new Date().toLocaleTimeString(),
  });

  if (logList.value.length > 100) {
    logList.value = logList.value.slice(0, 100);
  }
};

const addMessage = (type: "sent" | "received", content: string) => {
  messageList.value.unshift({
    type,
    content,
    time: new Date().toLocaleTimeString(),
  });

  if (messageList.value.length > 50) {
    messageList.value = messageList.value.slice(0, 50);
  }
};

const handleSocketMessage = (event: MessageEvent) => {
  messageCount.value++;
  addMessage("received", event.data);
  addLog("success", `BộđếnTinNhan: ${event.data}`);
};

const handleConnect = () => {
  if (isConnecting.value || isConnected.value) {
    return;
  }

  if (stopWatchConnection) {
    stopWatchConnection();
    stopWatchConnection = null;
  }
  if (stopWatchStatus) {
    stopWatchStatus();
    stopWatchStatus = null;
  }

  isConnecting.value = true;
  addLog("info", `Bắt đầuliềntiếpđến ${connectForm.value.url}`);

  try {
    wsClient.value = WebSocketClient.getInstance({
      url: connectForm.value.url,
      messageHandler: handleSocketMessage,
      reconnectInterval: connectForm.value.autoReconnect ? 5000 : 0,
      heartbeatInterval: connectForm.value.heartbeat ? 10000 : 0,
      maxReconnectAttempts: 5,
    });

    wsClient.value.init();

    stopWatchConnection = watch(
      () => wsClient.value?.isWebSocketConnected,
      (connected) => {
        isConnected.value = connected || false;
        isConnecting.value = false;

        if (connected) {
          addLog("success", "WebSocketliềntiếpThanhCong");
          reconnectCount.value = 0;
        }
      },
      { immediate: true },
    );

    stopWatchStatus = watch(
      () => wsClient.value?.connectionStatusText,
      (status) => {
        if (status && status.includes("trùngliềntrong")) {
          reconnectCount.value++;
          addLog(
            "warning",
            `từđộngtrùngliềntrong (thứ${reconnectCount.value}lần)`,
          );
        }
      },
    );
  } catch (error) {
    isConnecting.value = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog("error", `liềntiếpThatBai: ${errorMessage}`);
    ElMessage.error("liềntiếpThatBai，Vui lòngTìmphụcvụthiết bịDiaChi");
  }
};

const handleDisconnect = () => {
  if (wsClient.value) {
    wsClient.value.close();
    addLog("info", "tayđộngđoánmởWebSocketliềntiếp");
  }

  if (stopWatchConnection) {
    stopWatchConnection();
    stopWatchConnection = null;
  }
  if (stopWatchStatus) {
    stopWatchStatus();
    stopWatchStatus = null;
  }

  isConnected.value = false;
  isConnecting.value = false;
};

const handleReconnect = () => {
  handleDisconnect();
  setTimeout(() => {
    handleConnect();
  }, 1000);
};

const handleSendMessage = () => {
  if (!isConnected.value || !wsClient.value) {
    ElMessage.warning("Vui lòngxâylậpWebSocketliềntiếp");
    return;
  }

  let message = messageForm.value.content;

  switch (messageForm.value.type) {
    case "json":
      try {
        JSON.parse(message);
      } catch {
        ElMessage.error("Vui lòng nhậpcóhiệucủaJSONcáchkiểuDữ liệu");
        return;
      }
      break;
    case "ping":
      message = "ping";
      break;
  }

  try {
    wsClient.value.send(message);
    addMessage("sent", message);
    addLog("info", `phátgửiTinNhan: ${message}`);
    ElMessage.success("TinNhanphátgửiThanhCong");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    addLog("error", `phátgửiThatBai: ${errorMessage}`);
    ElMessage.error("phátgửiTinNhanThatBai");
  }
};

const clearMessageForm = () => {
  messageForm.value.content = "";
};

const clearMessages = () => {
  messageList.value = [];
};

const clearLogs = () => {
  logList.value = [];
};

onUnmounted(() => {
  handleDisconnect();
});

onMounted(() => {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isConnected.value) {
      addLog("info", "trangmặtẨn，Duy trìliềntiếp");
    }
  });
});
</script>

<style scoped>
@reference '@styles/core/tailwind.css';

.message-container {
  @apply max-h-96 overflow-y-auto space-y-3;
}

.message-item {
  @apply p-3 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700;
}

.message-header {
  @apply flex items-center justify-between mb-2;
}

.message-time {
  @apply text-xs text-gray-500;
}

.message-content {
  @apply text-sm text-gray-800 dark:text-gray-200 break-words font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded;
}

.log-container {
  @apply max-h-64 overflow-y-auto;
}

.message-container::-webkit-scrollbar,
.log-container::-webkit-scrollbar {
  @apply w-4;
}

.message-container::-webkit-scrollbar-track,
.log-container::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded;
}

.message-container::-webkit-scrollbar-thumb,
.log-container::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded hover:bg-gray-400;
}
</style>
