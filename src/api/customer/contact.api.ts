import request from "@/common/utils/http";
import { Contact } from "@/types";

export const SupportStatuses = [
  "New",
  "Assigned",
  "InProgress",
  "Closed",
] as const;
export const FeedbackStatuses = ["Pending", "Read", "Resolved"] as const;
export const CandidateStatuses = [
  "New",
  "Interview",
  "Offer",
  "Rejected",
] as const;

export interface PaginatedContactResponse {
  items: Contact.ContactItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const ContactApi = {
  getPaginated(params: {
    contactType?: string;
    status?: string;
    assignedUserId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return request.get<PaginatedContactResponse>({
      url: "/api/v1/Contacts/paginated",
      params,
    });
  },
  updateStatus(
    id: number,
    contactType: string,
    data: Contact.UpdateStatusRequest,
  ) {
    return request.patch<void>({
      url: `/api/v1/Contacts/${id}/status?contactType=${contactType}`,
      data,
    });
  },
  reply(data: Contact.CreateReplyPayload) {
    return request.post<number>({ url: "/api/v1/Contacts/reply", data });
  },
  updateInternalNote(data: Contact.UpdateInternalNotePayload) {
    return request.patch<void>({ url: "/api/v1/Contacts/internal-note", data });
  },
  createSupportRequest(data: Contact.CreateSupportRequestPayload) {
    return request.post<Contact.CreateSupportRequestResponse>({
      url: "/api/v1/Contacts/support-request",
      data,
    });
  },
  createFeedback(data: Contact.CreateFeedbackPayload) {
    return request.post<number>({ url: "/api/v1/Contacts/feedback", data });
  },
  createJobApplication(data: Contact.CreateJobApplicationPayload) {
    return request.post<number>({
      url: "/api/v1/Contacts/job-application",
      data,
    });
  },
  assign(id: number, assignedUserId: string | null) {
    return request.patch<void>({
      url: `/api/v1/Contacts/${id}/assign`,
      data: { assignedUserId },
    });
  },
  getAssignableUsers() {
    return request.get<
      { id: string; fullName?: string; email?: string; phoneNumber?: string }[]
    >({ url: "/api/v1/Contacts/assignable-users" });
  },
  rateCustomer(id: number, data: Contact.SupportRatingPayload) {
    return request.post<void>({
      url: `/api/v1/Contacts/support-request/${id}/employee-rating`,
      data,
    });
  },
};
