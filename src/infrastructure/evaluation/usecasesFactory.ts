import type {
  CreateEvaluationReplyUseCase,
  GetEvaluationDetailUseCase,
  GetServiceEvaluationsQuery,
  GetServiceEvaluationsUseCase,
  MarkEvaluationProcessedUseCase,
  UpdateInternalNotesUseCase,
} from "@/application/evaluation/usecases";

import type {
  CreateEvaluationReplyPayload,
  EvaluationCriteria,
  EvaluationDetail,
  EvaluationListItem,
  MarkEvaluationProcessedPayload,
  UpdateInternalNotesPayload,
} from "@/domain/evaluation/types";

import { ServiceEvaluationApi } from "@/api/service";

function _toCriteriaText(c: EvaluationCriteria) {
  return c === "QualityOfCar" ? "Chất lượng xe" : "Thái độ phục vụ";
}

class RealGetServiceEvaluationsUseCase implements GetServiceEvaluationsUseCase {
  async execute(
    query: GetServiceEvaluationsQuery,
  ): Promise<{ items: EvaluationListItem[]; totalCount: number }> {
    const res = await ServiceEvaluationApi.getList({
      status: query.status,
      criteria: query.criteria,
      search: query.search,
      page: query.page ?? 1,
      size: query.size ?? 20,
    });

    return res || { items: [], totalCount: 0 };
  }
}

class RealGetEvaluationDetailUseCase implements GetEvaluationDetailUseCase {
  async execute(evaluationId: number): Promise<EvaluationDetail> {
    const res = await ServiceEvaluationApi.getDetail(evaluationId);
    return res;
  }
}

class RealCreateEvaluationReplyUseCase implements CreateEvaluationReplyUseCase {
  async execute(payload: CreateEvaluationReplyPayload): Promise<void> {
    const res = await ServiceEvaluationApi.createReply({
      evaluationId: payload.evaluationId,
      message: payload.text,
      markAsProcessed: false,
    });
    if (!res) {
      throw new Error("Không nhận được phản hồi từ server");
    }
  }
}

class RealMarkEvaluationProcessedUseCase implements MarkEvaluationProcessedUseCase {
  async execute(payload: MarkEvaluationProcessedPayload): Promise<void> {
    const res = await ServiceEvaluationApi.markProcessed(payload);
    if (!res) {
      throw new Error("Không nhận được phản hồi từ server");
    }
  }
}

class RealUpdateInternalNotesUseCase implements UpdateInternalNotesUseCase {
  async execute(payload: UpdateInternalNotesPayload): Promise<void> {
    const res = await ServiceEvaluationApi.updateInternalNotes({
      evaluationId: payload.evaluationId,
      internalNotes: payload.notes,
    });
    if (!res) {
      throw new Error("Không nhận được phản hồi từ server");
    }
  }
}

export interface EvaluationUseCases {
  getEvaluations: GetServiceEvaluationsUseCase;
  getDetail: GetEvaluationDetailUseCase;
  createReply: CreateEvaluationReplyUseCase;
  markProcessed: MarkEvaluationProcessedUseCase;
  updateInternalNotes: UpdateInternalNotesUseCase;
}

export function createEvaluationUseCases(): EvaluationUseCases {
  return {
    getEvaluations: new RealGetServiceEvaluationsUseCase(),
    getDetail: new RealGetEvaluationDetailUseCase(),
    createReply: new RealCreateEvaluationReplyUseCase(),
    markProcessed: new RealMarkEvaluationProcessedUseCase(),
    updateInternalNotes: new RealUpdateInternalNotesUseCase(),
  };
}
