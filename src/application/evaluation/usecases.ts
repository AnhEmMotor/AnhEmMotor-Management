import type {
  CreateEvaluationReplyPayload,
  EvaluationCriteria,
  EvaluationDetail,
  EvaluationListItem,
  EvaluationProcessingStatus,
  MarkEvaluationProcessedPayload,
  UpdateInternalNotesPayload,
} from '@/domain/evaluation/types'

export type GetServiceEvaluationsQuery = {
  status: EvaluationProcessingStatus | 'All'
  criteria: EvaluationCriteria | 'All'
  search?: string
  page?: number
  size?: number
}

export interface GetServiceEvaluationsUseCase {
  execute(
    query: GetServiceEvaluationsQuery,
  ): Promise<{ items: EvaluationListItem[]; totalCount: number }>
}

export interface GetEvaluationDetailUseCase {
  execute(evaluationId: number): Promise<EvaluationDetail>
}

export interface CreateEvaluationReplyUseCase {
  execute(payload: CreateEvaluationReplyPayload): Promise<void>
}

export interface MarkEvaluationProcessedUseCase {
  execute(payload: MarkEvaluationProcessedPayload): Promise<void>
}

export interface UpdateInternalNotesUseCase {
  execute(payload: UpdateInternalNotesPayload): Promise<void>
}
