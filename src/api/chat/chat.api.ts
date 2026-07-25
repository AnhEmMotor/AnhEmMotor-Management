import request from "@/utils/http";

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "User" | "Assistant" | "System";
  message: string;
  createdAt: string;
}

export interface ChatSessionHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export const ManagerChatApi = {
  getSessions() {
    return request.get<ChatSession[]>({
      url: "/api/v1/manager-chat/sessions",
    });
  },

  createSession(title?: string, initialMessage?: string) {
    return request.post<ChatSession>({
      url: "/api/v1/manager-chat/sessions",
      data: { title: title ?? "", initialMessage: initialMessage ?? "" },
    });
  },

  getSessionHistory(sessionId: string) {
    return request.get<ChatMessage[]>({
      url: `/api/v1/manager-chat/sessions/${sessionId}/history`,
    });
  },

  deleteSession(sessionId: string) {
    return request.del({
      url: `/api/v1/manager-chat/sessions/${sessionId}`,
    });
  },

  updateSession(sessionId: string, title: string) {
    return request.put({
      url: `/api/v1/manager-chat/sessions/${sessionId}`,
      data: { title },
    });
  },

  sendMessage(sessionId: string, message: string) {
    return request.post<ChatMessage>({
      url: `/api/v1/manager-chat/sessions/${sessionId}/message`,
      data: { content: message },
    });
  },
};
