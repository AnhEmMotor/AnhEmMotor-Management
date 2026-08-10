<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Goods, ArrowDown, ArrowUp, Loading } from '@element-plus/icons-vue';
import { useDebounceFn } from '@vueuse/core';
import { marked } from 'marked';
import {
  StoreChatApi,
  type StoreChatSessionListItem,
  type StoreChatMessage,
  type StoreChatProductSearchItem,
  type StoreChatVariantCard,
  type StoreChatVariantColor,
} from '@/api/storeChat/storeChat.api';
import { useUserStore } from '@/application/store/user';
import { Permissions } from '@/domain/constants/permissions';
import { formatImageUrl } from '@/common/utils/image';
import ProductCardView from './ProductCardView.vue';
import VariantCardView from './VariantCardView.vue';

defineOptions({ name: 'CustomerStoreChat' });

const userStore = useUserStore();
const myUserId = computed(() => userStore.info?.userId);

const sessions = ref<StoreChatSessionListItem[]>([]);
const isLoadingSessions = ref(false);
const filter = ref<'active' | 'all'>('active');

const filteredSessions = computed(() =>
  filter.value === 'all' ? sessions.value : sessions.value.filter((s) => s.mode !== 'Ai')
);

const modeBadge = (mode: string) => {
  if (mode === 'Waiting') return { type: 'warning' as const, label: '🟡 Đang chờ' };
  if (mode === 'Human') return { type: 'primary' as const, label: '🔵 Đang chat' };
  return { type: 'success' as const, label: '🟢 AI đang trả lời' };
};

const loadSessions = async () => {
  try {
    isLoadingSessions.value = true;
    sessions.value = (await StoreChatApi.getSessions()) || [];
  } catch {
    ElMessage.error('Không thể tải danh sách phiên chat');
  } finally {
    isLoadingSessions.value = false;
  }
};

const activeSessionId = ref<string | null>(null);
const activeSession = computed(
  () => sessions.value.find((s) => s.id === activeSessionId.value) ?? null
);
const messages = ref<StoreChatMessage[]>([]);
const isLoadingHistory = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const selectSession = async (id: string) => {
  activeSessionId.value = id;
  streamingIdx = -1;
  try {
    isLoadingHistory.value = true;
    messages.value = (await StoreChatApi.getHistory(id)) || [];
    scrollToBottom();
  } catch {
    ElMessage.error('Không thể tải lịch sử chat');
  } finally {
    isLoadingHistory.value = false;
  }
  if (connection.value?.state === HubConnectionState.Connected) {
    connection.value.invoke('JoinSession', id).catch(() => {});
  }
};

const parseCards = (cardsJson: string | null) => {
  if (!cardsJson) return [];
  try {
    return JSON.parse(cardsJson);
  } catch {
    return [];
  }
};

const formatTime = (iso: string) => new Date(iso).toLocaleString('vi-VN');

const displayName = (session: StoreChatSessionListItem) =>
  session.contactName || session.customerName || 'Khách vãng lai';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const renderMarkdown = (content: string) => marked.parse(escapeHtml(content), { breaks: true });

const renderMessageContent = (msg: StoreChatMessage) =>
  msg.sender === 'Staff' ? msg.content : renderMarkdown(msg.content);

const connection = ref<HubConnection | null>(null);

let streamingIdx = -1;
const newStreamingMsg = (): StoreChatMessage => ({
  id: 'streaming',
  sender: 'Ai',
  content: '',
  createdAt: new Date().toISOString(),
  cardsJson: null,
});

const startConnection = async () => {
  if (connection.value?.state === HubConnectionState.Connected) return;

  const baseUrl =
    import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'https://localhost:7147';
  connection.value = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/store-chat`, {
      accessTokenFactory: () => userStore.accessToken,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.None)
    .build();

  connection.value.on('SessionUpdated', () => {
    loadSessions();
  });
  connection.value.on('ReceiveMessage', (msg: StoreChatMessage) => {
    if (!activeSessionId.value) return;
    if (msg.sender !== 'Visitor' && streamingIdx !== -1) {
      messages.value.splice(streamingIdx, 1);
      streamingIdx = -1;
    }
    messages.value.push(msg);
    scrollToBottom();
  });
  connection.value.on('AiTyping', () => {
    streamingIdx = messages.value.push(newStreamingMsg()) - 1;
    scrollToBottom();
  });
  connection.value.on('ReceiveMessageChunk', (delta: string) => {
    if (streamingIdx === -1) {
      streamingIdx = messages.value.push(newStreamingMsg()) - 1;
    }
    messages.value[streamingIdx].content += delta;
    scrollToBottom();
  });

  connection.value.onreconnected(async () => {
    await connection.value?.invoke('JoinStaffGroup').catch(() => {});
    if (activeSessionId.value) {
      await connection.value?.invoke('JoinSession', activeSessionId.value).catch(() => {});
    }
  });

  try {
    await connection.value.start();
    await connection.value.invoke('JoinStaffGroup');
  } catch (err) {
    console.error('SignalR Connection Error:', err);
  }
};

onMounted(() => {
  loadSessions();
  startConnection();
});

onBeforeUnmount(() => {
  connection.value?.stop();
});

const actingSessionIds = ref<Set<string>>(new Set());

const release = async (session: StoreChatSessionListItem) => {
  actingSessionIds.value.add(session.id);
  try {
    await StoreChatApi.release(session.id);
    await loadSessions();
  } catch {
    ElMessage.error('Không thể trả lại AI');
  } finally {
    actingSessionIds.value.delete(session.id);
  }
};

const deleteSession = async (session: StoreChatSessionListItem) => {
  try {
    await ElMessageBox.confirm(
      `Xoá vĩnh viễn cuộc trò chuyện với "${displayName(session)}"? Không thể hoàn tác.`,
      'Xác nhận xoá',
      { confirmButtonText: 'Xoá', cancelButtonText: 'Huỷ', type: 'warning' }
    );
  } catch {
    return;
  }

  actingSessionIds.value.add(session.id);
  try {
    await StoreChatApi.deleteSession(session.id);
    sessions.value = sessions.value.filter((s) => s.id !== session.id);
    if (activeSessionId.value === session.id) {
      activeSessionId.value = null;
      messages.value = [];
    }
    ElMessage.success('Đã xoá cuộc trò chuyện');
  } catch {
    ElMessage.error('Không thể xoá cuộc trò chuyện');
  } finally {
    actingSessionIds.value.delete(session.id);
  }
};

const productPickerVisible = ref(false);
const productSearchKeyword = ref('');
const isSearchingProducts = ref(false);
const productSearchResults = ref<StoreChatProductSearchItem[]>([]);
const expandedProductId = ref<number | null>(null);
const isLoadingVariants = ref(false);
const expandedProductVariants = ref<StoreChatVariantCard[]>([]);
const pendingCards = ref<StoreChatVariantCard[]>([]);

const openProductPicker = () => {
  productPickerVisible.value = true;
  productSearchKeyword.value = '';
  productSearchResults.value = [];
  expandedProductId.value = null;
  expandedProductVariants.value = [];
  searchProducts();
};

const searchProducts = useDebounceFn(async () => {
  isSearchingProducts.value = true;
  try {
    productSearchResults.value =
      (await StoreChatApi.searchProducts(productSearchKeyword.value)) || [];
  } catch {
    ElMessage.error('Không tìm được sản phẩm');
  } finally {
    isSearchingProducts.value = false;
  }
}, 300);

const toggleExpandProduct = async (productId: number) => {
  if (expandedProductId.value === productId) {
    expandedProductId.value = null;
    return;
  }
  expandedProductId.value = productId;
  isLoadingVariants.value = true;
  try {
    expandedProductVariants.value = (await StoreChatApi.getProductVariants(productId)) || [];
  } catch {
    ElMessage.error('Không tải được biến thể sản phẩm');
  } finally {
    isLoadingVariants.value = false;
  }
};

const pendingCardFor = (variantId: number) =>
  pendingCards.value.find((v) => v.variantId === variantId);
const isPendingCard = (variantId: number) => !!pendingCardFor(variantId);

const isWholeVariantPending = (variant: StoreChatVariantCard) => {
  const card = pendingCardFor(variant.variantId);
  return !!card && card.colors.length === variant.colors.length;
};

const isPendingColor = (variantId: number, colorId: number) => {
  const card = pendingCardFor(variantId);
  return !!card && card.colors.some((c) => c.colorId === colorId);
};

const removePendingCard = (variantId: number) => {
  pendingCards.value = pendingCards.value.filter((v) => v.variantId !== variantId);
};

const setPendingCardColors = (variant: StoreChatVariantCard, colors: StoreChatVariantColor[]) => {
  pendingCards.value = [
    ...pendingCards.value.filter((v) => v.variantId !== variant.variantId),
    { ...variant, colors },
  ];
};

const togglePendingCard = (variant: StoreChatVariantCard) => {
  if (isWholeVariantPending(variant)) {
    removePendingCard(variant.variantId);
    return;
  }
  setPendingCardColors(variant, variant.colors);
};

const togglePendingColor = (variant: StoreChatVariantCard, color: StoreChatVariantColor) => {
  const currentColors = pendingCardFor(variant.variantId)?.colors ?? [];
  const alreadySelected = currentColors.some((c) => c.colorId === color.colorId);
  const nextColors = alreadySelected
    ? currentColors.filter((c) => c.colorId !== color.colorId)
    : [...currentColors, color];
  if (nextColors.length === 0) {
    removePendingCard(variant.variantId);
    return;
  }
  setPendingCardColors(variant, nextColors);
};

const variantDisplayLabel = (variant: StoreChatVariantCard) => {
  const parts = [variant.productName, variant.variantName].filter(Boolean);
  const colorNames = (variant.colors || [])
    .map((c) => c.colorName)
    .filter(Boolean)
    .join(', ');
  const label = parts.join(' → ');
  return colorNames ? `${label} → ${colorNames}` : label;
};

const newMessage = ref('');
const canReply = computed(
  () =>
    activeSession.value?.mode !== 'Human' || activeSession.value?.assignedStaffId === myUserId.value
);

const isRichTextEmpty = (html: string) => !html || html === '<p><br></p>';
const canSendMessage = computed(
  () => !isRichTextEmpty(newMessage.value) || pendingCards.value.length > 0
);

const sendMessage = async () => {
  const hasText = !isRichTextEmpty(newMessage.value);
  if (!canSendMessage.value || !activeSessionId.value || !connection.value) return;

  const cardsJson =
    pendingCards.value.length > 0
      ? JSON.stringify([{ kind: 'variant-cards', items: pendingCards.value }])
      : null;
  const content = hasText ? newMessage.value : '';
  newMessage.value = '';
  pendingCards.value = [];
  try {
    await connection.value.invoke('SendStaffMessage', activeSessionId.value, content, cardsJson);
  } catch {
    ElMessage.error('Không gửi được tin nhắn');
  }
};
</script>

<template>
  <div
    class="flex h-[calc(100vh-140px)] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
  >
    <div
      class="w-80 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shrink-0"
    >
      <div class="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <el-radio-group v-model="filter" size="small">
          <el-radio-button value="active">Đang chờ / Đang chat</el-radio-button>
          <el-radio-button value="all">Tất cả</el-radio-button>
        </el-radio-group>
      </div>

      <div class="flex-1 overflow-y-auto p-2" v-loading="isLoadingSessions">
        <div v-if="filteredSessions.length === 0" class="text-center text-gray-400 mt-10 text-sm">
          Không có phiên chat nào
        </div>
        <div
          v-for="session in filteredSessions"
          :key="session.id"
          class="p-3 mb-2 rounded-lg cursor-pointer border transition-colors"
          :class="
            activeSessionId === session.id
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'
          "
          @click="selectSession(session.id)"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="min-w-0">
              <p class="font-medium truncate">
                {{ displayName(session) }}
              </p>
              <p v-if="session.contactPhone" class="text-xs text-gray-400">
                {{ session.contactPhone }}
              </p>
            </div>
            <el-tag :type="modeBadge(session.mode).type" size="small" class="shrink-0">
              {{ modeBadge(session.mode).label }}
            </el-tag>
          </div>
          <p class="text-xs text-gray-500 truncate mt-1">
            {{ session.lastMessagePreview || '(chưa có tin nhắn)' }}
          </p>
          <div class="flex justify-between items-center mt-2">
            <span class="text-[11px] text-gray-400">{{ formatTime(session.lastMessageAt) }}</span>
            <div class="flex items-center gap-1.5">
              <el-button
                v-if="session.mode === 'Human' && session.assignedStaffId === myUserId"
                v-auth="Permissions.Marketing.StoreChatManagement.Claim"
                size="small"
                @click.stop="release(session)"
                :loading="actingSessionIds.has(session.id)"
              >
                Trả lại AI
              </el-button>
              <span v-else-if="session.mode === 'Human'" class="text-[11px] text-gray-400">
                {{ session.assignedStaffName || 'Nhân viên khác' }}
              </span>
              <el-button
                v-auth="Permissions.Marketing.StoreChatManagement.Delete"
                size="small"
                type="danger"
                plain
                circle
                :icon="Delete"
                title="Xoá vĩnh viễn"
                :loading="actingSessionIds.has(session.id)"
                @click.stop="deleteSession(session)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col">
      <div v-if="!activeSessionId" class="m-auto text-gray-400">
        Chọn 1 phiên chat để xem hội thoại
      </div>
      <template v-else>
        <div
          class="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">
              {{ activeSession ? displayName(activeSession) : '' }}
            </p>
            <p class="text-xs text-gray-400">
              {{ activeSession?.contactPhone }}
            </p>
          </div>
          <el-tag v-if="activeSession" :type="modeBadge(activeSession.mode).type">
            {{ modeBadge(activeSession.mode).label }}
          </el-tag>
        </div>

        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-3"
          v-loading="isLoadingHistory"
        >
          <template v-for="msg in messages" :key="msg.id">
            <div
              v-if="msg.sender === 'System'"
              class="text-center text-xs text-gray-400 font-medium py-1"
            >
              {{ msg.content }}
            </div>
            <div
              v-else
              class="flex w-full"
              :class="msg.sender === 'Visitor' ? 'justify-start' : 'justify-end'"
            >
              <div
                class="max-w-[70%] rounded-2xl px-4 py-2 shadow-sm"
                :class="
                  msg.sender === 'Visitor'
                    ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                    : 'bg-blue-600 text-white rounded-br-none'
                "
              >
                <div v-if="msg.id === 'streaming' && !msg.content" class="flex items-center gap-2">
                  <el-icon class="is-loading text-white/70"><Loading /></el-icon>
                  <span class="text-xs text-white/70 font-medium">Đang suy nghĩ...</span>
                </div>
                <div
                  v-else-if="msg.content"
                  class="prose prose-sm max-w-none text-sm [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0 !text-inherit [&_*]:!text-inherit"
                  v-html="renderMessageContent(msg)"
                />
                <div
                  v-for="(block, idx) in parseCards(msg.cardsJson)"
                  :key="idx"
                  class="flex flex-col gap-2 mt-2"
                >
                  <template v-if="block.kind === 'product-cards'">
                    <ProductCardView
                      v-for="item in block.items"
                      :key="item.productId"
                      v-bind="item"
                    />
                  </template>
                  <template v-else-if="block.kind === 'variant-cards'">
                    <VariantCardView
                      v-for="item in block.items"
                      :key="item.variantId"
                      v-bind="item"
                    />
                  </template>
                </div>
                <div
                  class="text-[10px] mt-1 text-right"
                  :class="msg.sender === 'Visitor' ? 'text-gray-400' : 'text-blue-200'"
                >
                  {{ msg.sender }} · {{ formatTime(msg.createdAt) }}
                </div>
              </div>
            </div>
          </template>
        </div>

        <div
          v-if="canReply"
          class="border-t border-gray-200 dark:border-gray-700 dark:border-gray-700 dark:border-gray-700"
        >
          <div v-if="pendingCards.length > 0" class="flex flex-wrap gap-1.5 px-3 pt-2">
            <el-tag
              v-for="card in pendingCards"
              :key="card.variantId"
              closable
              @close="removePendingCard(card.variantId)"
            >
              {{ variantDisplayLabel(card) || `Biến thể #${card.variantId}` }}
            </el-tag>
          </div>
          <div class="p-3 flex flex-col gap-2">
            <ArtWangEditor
              v-model="newMessage"
              mode="simple"
              height="90px"
              placeholder="Nhập tin nhắn gửi khách..."
            />
            <div class="flex justify-between items-center">
              <el-button size="small" :icon="Goods" @click="openProductPicker">
                Gán sản phẩm
              </el-button>
              <el-button
                type="primary"
                size="small"
                :disabled="!canSendMessage"
                @click="sendMessage"
              >
                Gửi
              </el-button>
            </div>
          </div>
        </div>
        <div
          v-else
          class="p-3 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400"
        >
          Phiên này do nhân viên khác phụ trách.
        </div>
      </template>
    </div>

    <el-dialog
      v-model="productPickerVisible"
      title="Gán sản phẩm vào tin nhắn"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-input
        v-model="productSearchKeyword"
        placeholder="Tìm sản phẩm theo tên..."
        clearable
        @input="searchProducts"
      />
      <div v-loading="isSearchingProducts" class="mt-3 space-y-2 max-h-[400px] overflow-y-auto">
        <div
          v-for="product in productSearchResults"
          :key="product.productId"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
        >
          <div
            class="flex items-center justify-between gap-2 cursor-pointer"
            @click="toggleExpandProduct(product.productId)"
          >
            <div class="flex items-center gap-2 min-w-0">
              <el-image
                :src="formatImageUrl(product.imageUrl)"
                class="w-10 h-10 rounded object-cover border border-gray-100 dark:border-gray-600 shrink-0"
                fit="cover"
              />
              <span class="text-sm font-medium truncate">{{ product.productName }}</span>
            </div>
            <el-icon>
              <ArrowUp v-if="expandedProductId === product.productId" />
              <ArrowDown v-else />
            </el-icon>
          </div>
          <div
            v-if="expandedProductId === product.productId"
            v-loading="isLoadingVariants"
            class="mt-2 pl-2 space-y-1 border-t border-gray-100 dark:border-gray-600 pt-2"
          >
            <div
              v-for="variant in expandedProductVariants"
              :key="variant.variantId"
              class="flex flex-col gap-1.5 text-sm py-1.5 border-b border-gray-50 dark:border-gray-700 last:border-b-0"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate">{{
                  variant.variantName || `Biến thể #${variant.variantId}`
                }}</span>
                <el-button
                  size="small"
                  :type="isWholeVariantPending(variant) ? 'success' : 'primary'"
                  plain
                  @click="togglePendingCard(variant)"
                >
                  {{
                    isWholeVariantPending(variant)
                      ? variant.colors?.length > 1
                        ? 'Đã chọn tất cả màu'
                        : 'Đã chọn'
                      : variant.colors?.length > 1
                        ? 'Thêm tất cả màu'
                        : 'Thêm'
                  }}
                </el-button>
              </div>
              <div v-if="variant.colors?.length" class="flex flex-wrap gap-1.5 pl-1">
                <el-tag
                  v-for="color in variant.colors"
                  :key="color.colorId"
                  size="small"
                  :type="isPendingColor(variant.variantId, color.colorId) ? 'success' : 'info'"
                  effect="plain"
                  class="cursor-pointer"
                  @click="togglePendingColor(variant, color)"
                >
                  {{ color.colorName }}
                </el-tag>
              </div>
            </div>
            <div
              v-if="!isLoadingVariants && expandedProductVariants.length === 0"
              class="text-xs text-gray-400"
            >
              Sản phẩm chưa có biến thể
            </div>
          </div>
        </div>
        <div
          v-if="!isSearchingProducts && productSearchResults.length === 0"
          class="text-center text-gray-400 text-sm py-6"
        >
          {{ productSearchKeyword ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm nào' }}
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="productPickerVisible = false">
          Xong ({{ pendingCards.length }} đã chọn)
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
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
