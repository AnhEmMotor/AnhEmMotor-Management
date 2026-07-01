import request from "@/common/utils/http";

export interface ExpenseResponse {
  id: number;
  name: string;
  amount: number;
  expenseDate: string;
  category: number;
  categoryText: string;
  note?: string;
  createdAt: string;
}

export const expenseApi = {
  getAll() {
    return request.get<ExpenseResponse[]>({
      url: "/api/v1/expenses",
    });
  },
};
