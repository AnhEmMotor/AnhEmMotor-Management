import request from "@/utils/http";

export interface Booking {
  id: number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  preferredDate: string;
  productVariantId?: number;
  variantName?: string;
  status: string; // e.g. Pending, Confirmed, Cancelled
  note?: string;
  bookingType: string;
  location?: string;
}

export const BookingApi = {
  getList() {
    return request.get<Booking[]>({
      url: "/api/v1/Bookings",
    });
  },

  confirm(id: number) {
    return request.post<void>({
      url: "/api/v1/Bookings/confirm",
      data: { bookingId: id },
    });
  },

  create(data: {
    fullName: string;
    email?: string;
    phoneNumber: string;
    productVariantId?: number;
    preferredDate: string;
    note: string;
    location?: string;
    bookingType: string;
  }) {
    return request.post<number>({
      url: "/api/v1/Bookings",
      data,
    });
  },
};
