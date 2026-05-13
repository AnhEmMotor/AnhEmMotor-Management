import { defineStore } from 'pinia'
import axiosInstance from '@infrastructure/api/axios'

export const useHRStore = defineStore('hr', {
  state: () => ({
    employees: [],
    policies: [],
    commissions: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchCommissions() {
      this.loading = true
      try {
        const { data } = await axiosInstance.get('/api/v1/hr/commissions')
        this.commissions = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async fetchCommissionPolicies() {
      this.loading = true
      try {
        const { data } = await axiosInstance.get('/api/v1/hr/commission-policies')
        this.policies = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async saveCommissionPolicy(id, payload) {
      this.loading = true
      try {
        if (id) {
          await axiosInstance.put(`/api/v1/hr/commission-policies/${id}`, payload)
        } else {
          await axiosInstance.post('/api/v1/hr/commission-policies', payload)
        }
        await this.fetchCommissionPolicies()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async deleteCommissionPolicy(id) {
      this.loading = true
      try {
        await axiosInstance.delete(`/api/v1/hr/commission-policies/${id}`)
        await this.fetchCommissionPolicies()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchEmployees() {
      this.loading = true
      try {
        const { data } = await axiosInstance.get('/api/v1/hr/employees')
        this.employees = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    async saveEmployee(id, payload) {
      this.loading = true
      try {
        if (id) {
          await axiosInstance.put(`/api/v1/hr/employees/${id}`, payload)
        } else {
          await axiosInstance.post('/api/v1/hr/employees', payload)
        }
        await this.fetchEmployees()
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchPayrollSummary(month, year) {
      this.loading = true
      try {
        const { data } = await axiosInstance.get('/api/v1/hr/commissions/payroll-summary', {
          params: { month, year }
        })
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async approvePayroll(payload) {
      this.loading = true
      try {
        await axiosInstance.post('/api/v1/hr/commissions/approve-payroll', payload)
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchPolicyAuditLogs(id) {
      this.loading = true
      try {
        const { data } = await axiosInstance.get(`/api/v1/hr/commission-policies/${id}/audit-logs`)
        return data
      } catch (err) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    }
  },
})
