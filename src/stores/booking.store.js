import { defineStore } from 'pinia'
import axios from '@infrastructure/api/axios'

export const useBookingStore = defineStore('booking', {
  actions: {
    async fetchBookings() {
      const res = await axios.get('/api/v1/bookings')
      return res.data
    },
    async confirmBooking(bookingId) {
      const res = await axios.post('/api/v1/bookings/confirm', {
        bookingId,
      })
      return res.data
    },
  },
})


