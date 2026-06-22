import {
  ConfirmBookingUseCase,
  CreateBookingUseCase,
  GetBookingEventsUseCase,
  RealConfirmBookingUseCase,
  RealCreateBookingUseCase,
  RealGetBookingEventsUseCase,
} from "@/application/bookings/usecases";

export interface BookingUseCases {
  getBookingEvents: GetBookingEventsUseCase;
  confirmBooking: ConfirmBookingUseCase;

  createBooking: CreateBookingUseCase;
}

export function createBookingUseCases(): BookingUseCases {
  return {
    getBookingEvents: new RealGetBookingEventsUseCase(),
    confirmBooking: new RealConfirmBookingUseCase(),
    createBooking: new RealCreateBookingUseCase(),
  };
}
