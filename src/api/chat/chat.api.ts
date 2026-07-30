import request from "@/utils/http";

export interface ChatSession {
  id: string;
  title: string;
}

export type ChatRole = "User" | "AI" | "System";

export interface ChatMessageToolCall {
  name: string;
  label: string;
  summary?: string;
  status: "running" | "done";
  truncated?: boolean;
  totalCount?: number;
  asOf?: string;
  warnings?: string[];
  filtersApplied?: Record<string, string>;
}

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  message: string;
  createdAt: string;
  isSteering?: boolean;
  toolCalls?: ChatMessageToolCall[];
}

export interface SteeringResultDto {
  runId: string;
  mode: "queue" | "interrupt" | "restart";
}

export interface ChatSessionHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// SignalR trả về chuỗi JSON theo camelCase
export interface ChatRunEventDto {
  seq: number;
  type: string;
  payload: string;
}

export interface ActiveRunDto {
  runId: string;
  status: string;
  lastSeq: number;
  startedAt: string | null;
  userMessage: string;
  partialOutput: string;
}

export interface ChatToolLabelDto {
  name: string;
  label: string;
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

  getActiveRun(sessionId: string) {
    return request.get<ActiveRunDto | null>({
      url: `/api/v1/manager-chat/sessions/${sessionId}/active-run`,
    });
  },

  getToolCatalog() {
    return request.get<ChatToolLabelDto[]>({
      url: "/api/v1/manager-chat/tool-catalog",
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

  submitFeedback(runId: string, comment?: string) {
    return request.post({
      url: `/api/v1/manager-chat/runs/${runId}/feedback`,
      data: { comment: comment ?? "" },
    });
  },
};
