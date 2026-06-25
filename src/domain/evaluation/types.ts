export type EvaluationCriteria = "QualityOfCar" | "AttitudeOfService";

export type EvaluationProcessingStatus = "Unprocessed" | "Processed";

export interface EvaluationTechnician {
  id: number;
  name: string;
}

export interface EvaluationListItem {
  id: number;
  customerName: string;
  customerPhone: string;
  rating: number;
  reviewMessage: string;
  criteria: EvaluationCriteria;
  processingStatus: EvaluationProcessingStatus;
  technician?: EvaluationTechnician;
  repairOrderCode?: string;
}

export interface EvaluationChatMessage {
  id: string;
  sender: "Customer" | "Admin" | "System";
  content: string;
  createdAt: string;
}

export interface EvaluationDetail extends EvaluationListItem {
  chatHistory: EvaluationChatMessage[];
  directReplyText?: string;
  internalNotes?: string;
}

export interface CreateEvaluationReplyPayload {
  evaluationId: number;
  text: string;
}

export interface MarkEvaluationProcessedPayload {
  evaluationId: number;
}

export interface UpdateInternalNotesPayload {
  evaluationId: number;
  notes: string;
}
