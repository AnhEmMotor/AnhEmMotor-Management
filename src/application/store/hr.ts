import { defineStore } from "pinia";
import api from "@/common/utils/http";

export const useHRStore = defineStore("hr", {
  state: () => ({
    employees: [
      {
        id: 1,
        fullName: "Nguyễn Văn A",
        employeeCode: "NV001",
        employeeGroupId: 1,
        baseSalary: 8500000,
        email: "vana@anhemmotor.com",
        isActive: true,
        avatarUrl: "",
      },
      {
        id: 2,
        fullName: "Trần Thị B",
        employeeCode: "NV002",
        employeeGroupId: 1,
        baseSalary: 7200000,
        email: "thib@anhemmotor.com",
        isActive: true,
        avatarUrl: "",
      },
      {
        id: 3,
        fullName: "Lê Văn C",
        employeeCode: "NV003",
        employeeGroupId: 2,
        baseSalary: 9500000,
        email: "vanc@anhemmotor.com",
        isActive: true,
        avatarUrl: "",
      },
      {
        id: 4,
        fullName: "Phạm Thị D",
        employeeCode: "NV004",
        employeeGroupId: 1,
        baseSalary: 8000000,
        email: "thid@anhemmotor.com",
        isActive: true,
        avatarUrl: "",
      },
      {
        id: 5,
        fullName: "Hoàng Văn E",
        employeeCode: "NV005",
        employeeGroupId: 2,
        baseSalary: 9000000,
        email: "vane@anhemmotor.com",
        isActive: true,
        avatarUrl: "",
      },
    ] as any[],
    policies: [
      {
        id: 1,
        policyName: "Thưởng xe Honda Winner X v3",
        employeeGroupId: 1,
        employeeGroupName: "Nhân viên Kinh doanh",
        productId: 101,
        commissionAmount: 500000,
        isPercentage: false,
        description: "Áp dụng cho dòng Winner X mới 2024",
      },
      {
        id: 2,
        policyName: "Hoa hồng phụ kiện chính hãng",
        employeeGroupId: 1,
        employeeGroupName: "Nhân viên Kinh doanh",
        categoryId: 2,
        commissionAmount: 5.5,
        isPercentage: true,
        description: "Áp dụng cho tất cả phụ kiện",
      },
      {
        id: 3,
        policyName: "Thưởng xe Air Blade 160cc",
        employeeGroupId: 1,
        employeeGroupName: "Nhân viên Kinh doanh",
        productId: 102,
        commissionAmount: 350000,
        isPercentage: false,
        description: "Chương trình khuyến mãi hè",
      },
      {
        id: 4,
        policyName: "Hoa hồng lốp xe & phụ tùng thay thế",
        employeeGroupId: 2,
        employeeGroupName: "Nhân viên Kỹ thuật",
        categoryId: 3,
        commissionAmount: 3.0,
        isPercentage: true,
        description: "Thưởng cho kỹ thuật viên",
      },
      {
        id: 5,
        policyName: "Thưởng xe Vision 2024",
        employeeGroupId: 1,
        employeeGroupName: "Nhân viên Kinh doanh",
        productId: 103,
        commissionAmount: 200000,
        isPercentage: false,
        description: "Dòng xe phổ thông",
      },
      {
        id: 6,
        policyName: "Combo bảo dưỡng định kỳ",
        employeeGroupId: 2,
        employeeGroupName: "Nhân viên Kỹ thuật",
        categoryId: 4,
        commissionAmount: 50000,
        isPercentage: false,
        description: "Thưởng theo gói combo",
      },
    ] as any[],
    commissions: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCommissions() {
      this.loading = true;
      try {
        const data = await api.get<any>({ url: "/api/hr/commissions" });
        this.commissions = data;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchCommissionPolicies() {
      this.loading = true;
      try {
        const data = await api.get<any>({ url: "/api/hr/commission-policies" });
        this.policies = data;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async saveCommissionPolicy(id: number | null, payload: any) {
      this.loading = true;
      try {
        if (id) {
          await api.put({
            url: `/api/hr/commission-policies/${id}`,
            data: payload,
          });
        } else {
          await api.post({ url: "/api/hr/commission-policies", data: payload });
        }
        await this.fetchCommissionPolicies();
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async deleteCommissionPolicy(id: number) {
      this.loading = true;
      try {
        await api.del({ url: `/api/hr/commission-policies/${id}` });
        await this.fetchCommissionPolicies();
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchEmployees() {
      this.loading = true;
      try {
        const data = await api.get<any>({ url: "/api/hr/employees" });
        this.employees = data;
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async saveEmployee(id: number | null, payload: any) {
      this.loading = true;
      try {
        if (id) {
          await api.put({ url: `/api/hr/employees/${id}`, data: payload });
        } else {
          await api.post({ url: "/api/hr/employees", data: payload });
        }
        await this.fetchEmployees();
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchPayrollSummary(month: number, year: number): Promise<any> {
      this.loading = true;
      try {
        const data = await api.get<any>({
          url: "/api/hr/commissions/payroll-summary",
          params: { month, year },
        });
        return data;
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async approvePayroll(payload: any) {
      this.loading = true;
      try {
        await api.post({
          url: "/api/hr/commissions/approve-payroll",
          data: payload,
        });
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async fetchPolicyAuditLogs(id: number): Promise<any[]> {
      this.loading = true;
      try {
        const data = await api.get<any>({
          url: `/api/hr/commission-policies/${id}/audit-logs`,
        });
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
