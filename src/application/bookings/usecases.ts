import { BookingEventVM, BookingFormVM } from "@/domain/bookings/types";

import { BookingApi, type Booking as BookingDTO } from "@/api/booking.api";

// NOTE: UI giữ nguyên; usecase bên dưới gọi BookingApi thật.

export type GetBookingEventsQuery = Record<string, never>;

export interface GetBookingEventsUseCase {
  execute(_query?: GetBookingEventsQuery): Promise<BookingEventVM[]>;
}

export interface ConfirmBookingUseCase {
  execute(bookingId: number): Promise<void>;
}

export interface CreateBookingUseCase {
  execute(form: BookingFormVM): Promise<void>;
}

function toEventVM(dto: BookingDTO): BookingEventVM {
  const preferred = dto.preferredDate ? new Date(dto.preferredDate) : null;

  const yyyy = preferred ? preferred.getFullYear() : 1970;
  const mm = preferred
    ? String(preferred.getMonth() + 1).padStart(2, "0")
    : "01";
  const dd = preferred ? String(preferred.getDate()).padStart(2, "0") : "01";
  const date = `${yyyy}-${mm}-${dd}`;

  const time = preferred
    ? `${String(preferred.getHours()).padStart(2, "0")}:${String(preferred.getMinutes()).padStart(2, "0")}`
    : dto.preferredDate;

  return {
    id: dto.id,
    date,
    content: `${dto.fullName}: ${dto.note || dto.bookingType}`,
    type: dto.bookingType as any,
    status: dto.status as any,
    time,
    bgClass:
      dto.status === "Confirmed"
        ? "bg-emerald-500"
        : dto.bookingType === "Maintenance"
          ? "bg-emerald-500"
          : dto.bookingType === "TestDrive"
            ? "bg-blue-600"
            : "bg-amber-500",
    textClass: "text-white",
  };
}

export class RealGetBookingEventsUseCase implements GetBookingEventsUseCase {
  async execute(): Promise<BookingEventVM[]> {
    const list = await BookingApi.getList();
    return (list || []).map(toEventVM);
  }
}

export class RealConfirmBookingUseCase implements ConfirmBookingUseCase {
  async execute(bookingId: number): Promise<void> {
    await BookingApi.confirm(bookingId);
  }
}

export class RealCreateBookingUseCase implements CreateBookingUseCase {
  async execute(form: BookingFormVM): Promise<void> {
    const preferredDate =
      form.date && form.time
        ? new Date(`${form.date}T${form.time}:00`).toISOString()
        : form.date;

    await BookingApi.create({
      fullName: form.customerName,
      phoneNumber: form.phone,
      note: form.content,
      preferredDate: preferredDate as any,
      bookingType: form.type,
      location: "Showroom",
      productVariantId: form.productVariantId,
    });
  }
}
