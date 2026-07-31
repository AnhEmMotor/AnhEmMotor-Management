import request from "@/utils/http";

export interface ChatSession {
  id: string;
  title: string;
}

export type ChatRole = "User" | "AI" | "System";

export interface ChatToolPreview {
  preview: string;
}

export interface ChatMessageToolCall {
  name: string;
  label: string;
  summary?: string;
  status: "running" | "done";
  durationMs?: number;
  argsPreview?: ChatToolPreview;
  resultPreview?: ChatToolPreview;
  truncated?: boolean;
  totalCount?: number;
  asOf?: string;
  warnings?: string[];
  filtersApplied?: Record<string, string>;
}

export type ChatReasoningStep =
  | { kind: "thinking"; text: string }
  | ({ kind: "tool" } & ChatMessageToolCall);

export interface ChatMessage {
  id?: string;
  role: ChatRole;
  message: string;
  createdAt: string;
  isSteering?: boolean;
  reasoningSteps?: ChatReasoningStep[];
  reasoningElapsedSeconds?: number;
  plan?: ChatPlanDto;
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

export type PlanStepStatus =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "skipped"
  | "invalid";

export interface PlanStepDto {
  id: string;
  order: number;
  title: string;
  detail: string;
  expectedTools: string[];
  status: PlanStepStatus;
  editedByUser: boolean;
  result: string | null;
}

export type ChatPlanStatus =
  | "Drafting"
  | "Ready"
  | "Approved"
  | "Executing"
  | "Completed"
  | "Rejected";

export interface ChatPlanDto {
  runId: string;
  version: number;
  status: ChatPlanStatus;
  steps: PlanStepDto[];
  lastEditedBy: string;
  approvedAt: string | null;
}

export interface PlanStepOperation {
  type: "edit" | "add" | "remove" | "reorder";
  stepId?: string;
  title?: string;
  detail?: string;
  expectedTools?: string[];
  order?: number;
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

  getPlan(runId: string) {
    return request.get<ChatPlanDto>({
      url: `/api/v1/manager-chat/runs/${runId}/plan`,
    });
  },

  updatePlan(runId: string, version: number, operations: PlanStepOperation[]) {
    return request.patch<ChatPlanDto>({
      url: `/api/v1/manager-chat/runs/${runId}/plan`,
      data: { version, operations },
      showErrorMessage: false,
    });
  },

  approvePlan(runId: string, version: number) {
    return request.post({
      url: `/api/v1/manager-chat/runs/${runId}/plan/approve`,
      data: { version },
      showErrorMessage: false,
    });
  },

  rejectPlan(runId: string) {
    return request.post({
      url: `/api/v1/manager-chat/runs/${runId}/plan/reject`,
      showErrorMessage: false,
    });
  },
};
