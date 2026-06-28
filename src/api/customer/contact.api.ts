import request from "@/common/utils/http";
import { Contact } from "@/types";

export const SupportStatuses = ["New", "InProgress", "Closed"] as const;
export const FeedbackStatuses = ["Pending", "Read", "Resolved"] as const;
export const CandidateStatuses = [
  "New",
  "Interview",
  "Offer",
  "Rejected",
] as const;

export interface PaginatedContactResponse {
  records: Contact.ContactItem[];
  totalCount: number;
  page: number;
  pageSize: number;
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
    return request.post<void>({ url: "/api/v1/Contacts/reply", data });
  },
  updateInternalNote(data: Contact.UpdateInternalNotePayload) {
    return request.patch<void>({ url: "/api/v1/Contacts/internal-note", data });
  },
  createSupportRequest(data: Contact.CreateSupportRequestPayload) {
    return request.post<number>({
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
};
