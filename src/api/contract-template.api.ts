export interface ContractTemplate {
  id: string
  name: string
  type: string
  code: string
  version: number
  content: string
  dynamicFields: string
  isActive: boolean
  status: number
  parentId?: string
  isUsed: boolean
}

export const getContractTemplates = (params: any) => {
  return request.get('/api/v1/contracts/templates', { params })
}

export const getContractTemplateById = (id: string) => {
  return request.get<any, ContractTemplate>(`/api/v1/contracts/templates/${id}`)
}

export const createContractTemplate = (data: Partial<ContractTemplate>) => {
  return request.post('/api/v1/contracts/templates', data)
}

export const updateContractTemplate = (id: string, data: Partial<ContractTemplate>) => {
  return request.put(`/api/v1/contracts/templates/${id}`, data)
}

export const deleteContractTemplate = (id: string) => {
  return request.delete(`/api/v1/contracts/templates/${id}`)
}

export const cloneContractTemplate = (id: string) => {
  return request.post(`/api/v1/contracts/templates/${id}/clone`)
}

export const validateContractTemplateSyntax = (content: string) => {
  return request.post('/api/v1/contracts/templates/validate-syntax', { content })
}
