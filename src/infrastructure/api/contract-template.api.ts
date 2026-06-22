import request from "@/utils/http";

export interface ContractTemplate {
  id: string;
  name: string;
  type: string;
  code: string;
  version: number;
  content: string;
  dynamicFields: string;
  isActive: boolean;
  status: number;
  parentId?: string;
  isUsed: boolean;
  variableCount?: number;
  createdAt?: string;
}

export const getContractTemplates = <
  T = { items: ContractTemplate[]; totalCount: number },
>(
  params: any,
) => {
  return request.get<T>({
    url: "/api/contracts/templates",
    params,
  });
};

export const getContractTemplateById = (id: string) => {
  return request.get<ContractTemplate>({
    url: `/api/contracts/templates/${id}`,
  });
};

export const createContractTemplate = (data: Partial<ContractTemplate>) => {
  return request.post<ContractTemplate>({
    url: "/api/contracts/templates",
    data,
  });
};

export const updateContractTemplate = (
  id: string,
  data: Partial<ContractTemplate>,
) => {
  return request.put<ContractTemplate>({
    url: `/api/contracts/templates/${id}`,
    data,
  });
};

export const deleteContractTemplate = (id: string) => {
  return request.del({ url: `/api/contracts/templates/${id}` });
};

export const cloneContractTemplate = (id: string) => {
  return request.post<{ id: string }>({
    url: `/api/contracts/templates/${id}/clone`,
  });
};

export const validateContractTemplateSyntax = (content: string) => {
  return request.post<{ valid: boolean; error?: string }>({
    url: "/api/contracts/templates/validate-syntax",
    data: { content },
  });
};
