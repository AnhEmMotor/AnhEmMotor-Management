export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | string
export type BookingType = 'TestDrive' | 'Maintenance' | 'Consult' | string

export interface Booking {
  id: number
  fullName: string
  phoneNumber: string
  email?: string
  preferredDate: string
  productVariantId?: number
  variantName?: string
  status: BookingStatus
  note?: string
  bookingType: BookingType
  location?: string
}

export interface BookingEventVM {
  id: number
  date: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  content: string
  type?: BookingType
  status?: BookingStatus
  time?: string // HH:mm
  bgClass?: string
  textClass?: string
}

export interface BookingFormVM {
  customerName: string
  phone: string
  time: string
  date: string // YYYY-MM-DD
  type: BookingType
  content: string
  status: BookingStatus
  productVariantId?: number
}
