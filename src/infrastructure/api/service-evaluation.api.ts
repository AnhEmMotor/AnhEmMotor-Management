import request from "@/utils/http";
import type {
  EvaluationDetail,
  EvaluationListItem,
} from "@/domain/evaluation/types";

export interface EvaluationListResponse {
  items: EvaluationListItem[];
  totalCount: number;
}

export const ServiceEvaluationApi = {
  getList(params: {
    status?: string;
    criteria?: string;
    search?: string;
    page: number;
    size: number;
  }) {
    return request.get<EvaluationListResponse>({
      url: "/ServiceWorkshopEvaluations",
      params: {
        status: params.status,
        criteria: params.criteria,
        search: params.search,
        page: params.page,
        pageSize: params.size,
      },
    });
  },

  getDetail(id: number) {
    return request.get<EvaluationDetail>({
      url: `/ServiceWorkshopEvaluations/${id}`,
    });
  },

  createReply(data: {
    evaluationId: number;
    message: string;
    markAsProcessed: boolean;
  }) {
    return request.post<any>({
      url: "/ServiceWorkshopEvaluations/reply",
      data,
    });
  },

  markProcessed(data: { evaluationId: number }) {
    return request.post<any>({
      url: "/ServiceWorkshopEvaluations/processed",
      data,
    });
  },

  updateInternalNotes(data: { evaluationId: number; internalNotes: string }) {
    return request.put<any>({
      url: "/ServiceWorkshopEvaluations/internal-notes",
      data,
    });
  },
};
