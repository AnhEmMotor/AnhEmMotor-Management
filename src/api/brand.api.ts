import request from '@/utils/http'
import type { Brand, BrandList, ImportBrandResult } from '@/domain/product/brand.types'

export const BrandApi = {
  getList(params: any) {
    const { current, size, ...rest } = params
    return request.get<BrandList>({
      url: '/api/v1/Brand',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  },

  getById(id: number) {
    return request.get<Brand>({
      url: `/api/v1/Brand/${id}`
    })
  },

  create(data: Partial<Brand>) {
    return request.post<Brand>({
      url: '/api/v1/Brand',
      data
    })
  },

  update(id: number, data: Partial<Brand>) {
    return request.put<Brand>({
      url: `/api/v1/Brand/${id}`,
      data
    })
  },

  delete(id: number) {
    return request.del({
      url: `/api/v1/Brand/${id}`
    })
  },

  getStatistics() {
    return request.get<any>({
      url: '/api/v1/Brand/statistics'
    })
  },

  export(params: any) {
    return request.get<Blob>({
      url: '/api/v1/Brand/export',
      params,
      responseType: 'blob'
    })
  },

  importExcel(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<ImportBrandResult>({
      url: '/api/v1/Brand/import',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getImportTemplate() {
    return request.get<Blob>({
      url: '/api/v1/Brand/import-template',
      responseType: 'blob'
    })
  },

  cloneMany(ids: number[]) {
    return request.post({
      url: '/api/v1/Brand/clone-many',
      data: { ids }
    })
  },

  deleteMany(ids: number[]) {
    return request.del({
      url: '/api/v1/Brand/delete-many',
      data: { ids }
    })
  },

  restoreMany(ids: number[]) {
    return request.post({
      url: '/api/v1/Brand/restore-many',
      data: { ids }
    })
  },

  getDeletedList(params: any) {
    const { current, size, ...rest } = params
    return request.get<BrandList>({
      url: '/api/v1/Brand/deleted',
      params: {
        Page: current,
        PageSize: size,
        ...rest
      }
    })
  }
}
