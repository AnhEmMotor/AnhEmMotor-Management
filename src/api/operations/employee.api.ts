import request from '@/common/utils/http';

export interface EmployeeResponse {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  jobTitle: string;
  baseSalary: number;
  identityNumber: string;
  address: string;
  contractDate: string;
  bankName: string;
  bankAccountNumber: string;
  avatarUrl?: string;
}

export interface EmployeeUpsertRequest {
  fullName: string;
  email: string;
  jobTitle: string;
  baseSalary: number;
  identityNumber: string;
  address: string;
  contractDate: string;
  bankName: string;
  bankAccountNumber: string;
}

export const EmployeeApi = {
  getList() {
    return request.get<EmployeeResponse[]>({
      url: '/api/v1/hr/employees',
    });
  },
  getById(id: number) {
    return request.get<EmployeeResponse>({
      url: `/api/v1/hr/employees/${id}`,
    });
  },
  create(data: EmployeeUpsertRequest) {
    return request.post<number>({
      url: '/api/v1/hr/employees',
      data,
    });
  },
  update(id: number, data: EmployeeUpsertRequest) {
    return request.put<number>({
      url: `/api/v1/hr/employees/${id}`,
      data,
    });
  },
  delete(id: number) {
    return request.del<number>({
      url: `/api/v1/hr/employees/${id}`,
    });
  },
};
