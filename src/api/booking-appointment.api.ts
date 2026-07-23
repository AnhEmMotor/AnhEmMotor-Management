import request from "@/common/utils/http";

export interface BookingAppointmentApiParams {
  Page?: number;
  PageSize?: number;
  Filters?: string;
  Sorts?: string;
}

export interface BookingAppointment {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  serviceType?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  appointmentAt?: string;
  showroom?: string;
  status: string;
  notes?: string;
  confirmedAt?: string;
  confirmedByName?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export const BookingAppointmentApi = {
  getList(params?: BookingAppointmentApiParams) {
    return request.get<{ items: BookingAppointment[]; totalCount: number }>({
      url: "/api/v1/BookingAppointments",
      params,
    });
  },

  getDetail(id: number) {
    return request.get<BookingAppointment>({
      url: `/api/v1/BookingAppointments/${id}`,
    });
  },

  create(data: {
    fullName: string;
    phone: string;
    email?: string;
    serviceType?: string;
    preferredDate?: string;
    preferredTimeSlot?: string;
    appointmentAt?: string;
    showroom?: string;
    notes?: string;
  }) {
    return request.post<number>({
      url: "/api/v1/BookingAppointments",
      data,
    });
  },

  update(
    id: number,
    data: {
      fullName?: string;
      phone?: string;
      email?: string;
      serviceType?: string;
      preferredDate?: string;
      preferredTimeSlot?: string;
      appointmentAt?: string;
      showroom?: string;
      notes?: string;
    },
  ) {
    return request.put<boolean>({
      url: `/api/v1/BookingAppointments/${id}`,
      data,
    });
  },

  delete(id: number) {
    return request.del<boolean>({
      url: `/api/v1/BookingAppointments/${id}`,
    });
  },

  confirm(id: number, appointmentAt?: string) {
    return request.post<boolean>({
      url: `/api/v1/BookingAppointments/${id}/confirm`,
      data: { appointmentAt },
    });
  },

  cancel(id: number, cancelReason?: string) {
    return request.post<boolean>({
      url: `/api/v1/BookingAppointments/${id}/cancel`,
      data: { cancelReason },
    });
  },
};
