import { defineStore } from 'pinia'
import axios from '@infrastructure/api/axios'

export const useContactStore = defineStore('contact', {
  actions: {
    async fetchContacts() {
      const res = await axios.get('/api/v1/contacts')
      return res.data
    },
    async replyToContact(contactId, message, markAsProcessed = true) {
      const res = await axios.post('/api/v1/contacts/reply', {
        contactId,
        message,
        markAsProcessed,
      })
      return res.data
    },
    async updateInternalNote(contactId, internalNote) {
      const res = await axios.patch('/api/v1/contacts/internal-note', {
        contactId,
        internalNote,
      })
      return res.data
    },
  },
})


