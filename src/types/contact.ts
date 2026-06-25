// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Contact {
  export interface ContactBasic {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    createdAt?: string;
  }

  export interface SupportRequest {
    id: number;
    contactId: number;
    subject: string;
    category: string;
    email: string;
    orderCode?: string;
    content: string;
    status: string;
    assignedUserId?: string;
    contact?: ContactBasic;
    createdAt?: string;
  }

  export interface CustomerFeedback {
    id: number;
    contactId: number;
    rating: number;
    feedbackArea: string;
    customerName: string;
    phoneNumber: string;
    content: string;
    status: string;
    contact?: ContactBasic;
    createdAt?: string;
  }

  export interface JobApplication {
    id: number;
    contactId: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    appliedPosition: string;
    cvFileUrl: string;
    coverLetter?: string;
    status: string;
    contact?: ContactBasic;
    createdAt?: string;
  }

  export type ContactItem = SupportRequest | CustomerFeedback | JobApplication;

  export interface PaginatedResponse {
    records: ContactItem[];
    totalCount: number;
    page: number;
    pageSize: number;
  }

  export interface UpdateStatusRequest {
    status: string;
  }

  export interface CreateSupportRequestPayload {
    subject: string;
    category: string;
    email: string;
    orderCode?: string;
    content: string;
  }

  export interface CreateFeedbackPayload {
    rating: number;
    feedbackArea: string;
    customerName: string;
    phoneNumber: string;
    content: string;
  }

  export interface CreateJobApplicationPayload {
    fullName: string;
    email: string;
    phoneNumber: string;
    appliedPosition: string;
    cvFileUrl: string;
    coverLetter?: string;
  }

  export interface CreateReplyPayload {
    contactId: number;
    message: string;
    isInternal: boolean;
  }

  export interface UpdateInternalNotePayload {
    contactId: number;
    internalNote: string;
  }

  export const SupportStatuses = ["New", "InProgress", "Closed"] as const;
  export const FeedbackStatuses = ["Pending", "Read", "Resolved"] as const;
  export const CandidateStatuses = [
    "New",
    "Interview",
    "Offer",
    "Rejected",
  ] as const;

  export const AllStatuses = [
    ...SupportStatuses,
    ...FeedbackStatuses,
    ...CandidateStatuses,
  ] as readonly string[];
}
