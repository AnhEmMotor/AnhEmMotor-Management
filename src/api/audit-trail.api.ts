import request from '@/utils/http'

export interface AuditLogItem {
  id: number
  action: string
  changedById?: string
  changedByName?: string
  changedAt: string
  details?: Record<string, any>
  entityType?: string
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export const AuditTrailApi = {
  async getInventoryReceiptLogs(id: number) {
    const rawLogs = await request.get<any[]>({
      url: `/api/v1/InventoryReceipts/${id}/audit-logs`
    })
    return rawLogs.map((l: any) => {
      const changes: any[] = []
      if (l.oldStatusId !== l.newStatusId && (l.oldStatusId !== null || l.newStatusId !== null)) {
        changes.push({ field: 'Trạng thái', oldValue: l.oldStatusId, newValue: l.newStatusId })
      }
      if (l.oldNotes !== l.newNotes && (l.oldNotes !== null || l.newNotes !== null)) {
        changes.push({ field: 'Ghi chú', oldValue: l.oldNotes, newValue: l.newNotes })
      }

      const infoLogs = l.infoLogs?.map((il: any) => {
        const isCreate =
          il.action?.toLowerCase() === 'create' ||
          il.action?.toLowerCase() === 'add' ||
          il.action?.toLowerCase() === 'thêm mới'
        const isDelete =
          il.action?.toLowerCase() === 'delete' ||
          il.action?.toLowerCase() === 'remove' ||
          il.action?.toLowerCase() === 'xoá' ||
          il.action?.toLowerCase() === 'xóa'

        let quantity = ''
        if (isCreate) quantity = `+${il.newQuantity}`
        else if (isDelete) quantity = ''
        else quantity = `${il.oldQuantity} ➔ ${il.newQuantity}`

        let price = ''
        if (isCreate) price = `+${il.newPrice}`
        else if (isDelete) price = ''
        else price = `${il.oldPrice} ➔ ${il.newPrice}`

        return {
          action: il.action,
          quantity,
          price,
          productVariant: il.productVariantName,
          supplierName: il.supplierName
        }
      })

      const vehicleLogs = l.vehicleLogs?.map((vl: any) => {
        const isCreate =
          vl.action?.toLowerCase() === 'create' ||
          vl.action?.toLowerCase() === 'add' ||
          vl.action?.toLowerCase() === 'thêm mới'
        const isDelete =
          vl.action?.toLowerCase() === 'delete' ||
          vl.action?.toLowerCase() === 'remove' ||
          vl.action?.toLowerCase() === 'xoá' ||
          vl.action?.toLowerCase() === 'xóa'

        let vin = ''
        if (isCreate) vin = vl.newVinNumber
        else if (isDelete) vin = vl.oldVinNumber
        else vin = `${vl.oldVinNumber} ➔ ${vl.newVinNumber}`

        let engine = ''
        if (isCreate) engine = vl.newEngineNumber
        else if (isDelete) engine = vl.oldEngineNumber
        else engine = `${vl.oldEngineNumber} ➔ ${vl.newEngineNumber}`

        return {
          action: vl.action,
          vinNumber: vin,
          engineNumber: engine,
          productVariant: vl.productVariantName
        }
      })

      const details: Record<string, any> = {}
      if (infoLogs?.length) details.infoLogs = infoLogs
      if (vehicleLogs?.length) details.vehicleLogs = vehicleLogs

      return {
        id: l.id,
        action: l.action,
        changedByName: l.changedByFullName || l.changedByName,
        changedAt: l.changedAt,
        changes,
        details: Object.keys(details).length ? details : undefined
      } as AuditLogItem
    })
  },
  getOutputLogs(id: number) {
    return request.get<AuditLogItem[]>({
      url: `/api/v1/Outputs/${id}/audit-logs`
    })
  },
  async getSupplierDebtSettlementLogs(id: number) {
    const rawLogs = await request.get<any[]>({
      url: `/api/v1/SupplierDebtSettlements/${id}/audit-logs`
    })
    return rawLogs.map((l: any) => {
      const changes: any[] = []
      if (l.oldAmount !== l.newAmount && (l.oldAmount !== null || l.newAmount !== null)) {
        changes.push({ field: 'Số tiền', oldValue: l.oldAmount, newValue: l.newAmount })
      }
      if (l.oldNotes !== l.newNotes && (l.oldNotes !== null || l.newNotes !== null)) {
        changes.push({ field: 'Ghi chú', oldValue: l.oldNotes, newValue: l.newNotes })
      }
      if (
        l.oldPaymentDate !== l.newPaymentDate &&
        (l.oldPaymentDate !== null || l.newPaymentDate !== null)
      ) {
        changes.push({
          field: 'Ngày thanh toán',
          oldValue: l.oldPaymentDate,
          newValue: l.newPaymentDate
        })
      }

      return {
        id: l.id,
        action: l.action,
        changedByName: l.changedByFullName || l.changedByName,
        changedAt: l.changedAt,
        changes
      } as AuditLogItem
    })
  },
  async getPurchaseRequestLogs(id: number) {
    const rawLogs = await request.get<any[]>({
      url: `/api/v1/purchase-requests/${id}/audit-logs`
    })
    return rawLogs.map((l: any) => {
      const changes: any[] = []
      if (l.oldStatusId !== l.newStatusId) {
        changes.push({ field: 'Trạng thái', oldValue: l.oldStatusId, newValue: l.newStatusId })
      }
      if (l.oldNotes !== l.newNotes) {
        changes.push({ field: 'Ghi chú', oldValue: l.oldNotes, newValue: l.newNotes })
      }

      const itemChanges = l.itemLogs?.map((il: any) => {
        const isCreate =
          il.action?.toLowerCase() === 'create' ||
          il.action?.toLowerCase() === 'add' ||
          il.action?.toLowerCase() === 'thêm mới'
        const isDelete =
          il.action?.toLowerCase() === 'delete' ||
          il.action?.toLowerCase() === 'remove' ||
          il.action?.toLowerCase() === 'xoá' ||
          il.action?.toLowerCase() === 'xóa'

        let quantity = ''
        if (isCreate) quantity = `+${il.newQuantity}`
        else if (isDelete) quantity = ''
        else quantity = `${il.oldQuantity} ➔ ${il.newQuantity}`

        let productVariant = ''
        if (isCreate) productVariant = il.newProductVariantName
        else if (isDelete) productVariant = il.oldProductVariantName
        else
          productVariant =
            il.oldProductVariantName === il.newProductVariantName
              ? il.newProductVariantName
              : `${il.oldProductVariantName} ➔ ${il.newProductVariantName}`

        let supplierName = ''
        if (isCreate) supplierName = il.newSupplierName || ''
        else if (isDelete) supplierName = il.oldSupplierName || ''
        else
          supplierName =
            il.oldSupplierName === il.newSupplierName
              ? il.newSupplierName || ''
              : `${il.oldSupplierName || ''} ➔ ${il.newSupplierName || ''}`

        return {
          id: il.id,
          action: il.action,
          quantity,
          productVariant,
          supplierName
        }
      })

      return {
        id: l.id,
        action: l.action,
        changedByName: l.changedByName,
        changedAt: l.changedAt,
        changes,
        details: itemChanges?.length ? { items: itemChanges } : undefined
      } as AuditLogItem
    })
  }
}
