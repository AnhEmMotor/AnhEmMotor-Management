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

export interface BookingAppointmentFormData {
  fullName: string;
  phone: string;
  email: string;
  preferredDate: string;
  preferredTimeSlot: string;
  appointmentAt: string;
  showroom: string;
  notes: string;
}
