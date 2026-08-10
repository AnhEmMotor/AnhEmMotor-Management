import request from '@/common/utils/http';

export type StoreChatMode = 'Ai' | 'Waiting' | 'Human';

export interface StoreChatSessionListItem {
  id: string;
  mode: StoreChatMode;
  contactName: string | null;
  contactPhone: string | null;
  customerName: string | null;
  previousSessionId: string | null;
  assignedStaffId: string | null;
  assignedStaffName: string | null;
  lastMessageAt: string;
  lastMessagePreview: string | null;
}

export type StoreChatSender = 'Visitor' | 'Ai' | 'Staff' | 'System';

export interface StoreChatMessage {
  id: string;
  sender: StoreChatSender;
  content: string;
  createdAt: string;
  cardsJson: string | null;
}

export interface StoreChatProductSearchItem {
  productId: number;
  productName: string;
  imageUrl: string | null;
  priceFrom: number | null;
  priceTo: number | null;
}

export interface StoreChatVariantColor {
  colorId: number;
  colorName: string | null;
  colorCode: string | null;
  imageUrl: string | null;
}

export interface StoreChatVariantCard {
  variantId: number;
  variantName: string | null;
  productName: string | null;
  sku: string | null;
  price: number | null;
  slug: string | null;
  colors: StoreChatVariantColor[];
}

export const StoreChatApi = {
  getSessions() {
    return request.get<StoreChatSessionListItem[]>({
      url: '/api/v1/store-chat-handoff/sessions',
    });
  },

  getHistory(sessionId: string) {
    return request.get<StoreChatMessage[]>({
      url: `/api/v1/store-chat-handoff/sessions/${sessionId}/history`,
    });
  },

  release(sessionId: string) {
    return request.post({
      url: `/api/v1/store-chat-handoff/sessions/${sessionId}/release`,
    });
  },

  deleteSession(sessionId: string) {
    return request.del({
      url: `/api/v1/store-chat-handoff/sessions/${sessionId}`,
    });
  },

  searchProducts(keyword: string) {
    return request.get<StoreChatProductSearchItem[]>({
      url: '/api/v1/store-chat-handoff/products/search',
      params: { keyword, limit: 10 },
    });
  },

  getProductVariants(productId: number) {
    return request.get<StoreChatVariantCard[]>({
      url: `/api/v1/store-chat-handoff/products/${productId}/variants`,
    });
  },
};
