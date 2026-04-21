import { TEMP_ID_THRESHOLD } from '@/constants/common'

const orderMapper = {
  toParams(uiFilters) {
    const params = {}
    if (uiFilters.selectedStatuses?.length > 0) {
      params.filters = uiFilters.selectedStatuses.map((s) => `StatusId==${s}`).join('|')
    }
    return params
  },
  toDTO(model) {
    return {
      BuyerId: model.customer?.id,
      StatusId: model.status?.key,
      Notes: model.notes,
      CustomerName: model.customerName,
      CustomerAddress: model.customerAddress,
      CustomerPhone: model.customerPhone,
      products: (model.products || []).map((p) => ({
        Id: typeof p.id === 'number' && p.id > TEMP_ID_THRESHOLD ? undefined : p.id,
        ProductId: p.product_id,
        Count: p.quantity,
      })),
    }
  },

  toModel(dto) {
    if (!dto) return null
    return {
      id: dto.id,
      createdAt: dto.createdAt,
      buyerName: dto.buyerName,
      buyerEmail: dto.buyerEmail,
      statusId: dto.statusId,
      total: dto.total,
      notes: dto.notes,
      customerName: dto.customerName,
      customerAddress: dto.customerAddress,
      customerPhone: dto.customerPhone,
      customer: dto.buyerId ? { id: dto.buyerId } : null,
      products: (dto.products || []).map((p) => ({
        id: p.id,
        product_id: p.productId,
        name: p.productName || p.name,
        quantity: p.count || p.quantity,
        unitPrice: p.unitPrice,
        total: p.total,
      })),
    }
  },

  toList(data) {
    if (!data || !data.items) return []
    return data.items.map((item) => this.toModel(item))
  },

  toPagination(data) {
    return {
      totalPages: data.totalPages || 0,
      totalCount: data.totalCount || 0,
    }
  },
}

export default orderMapper


