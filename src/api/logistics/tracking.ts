import request from '@/utils/http'
import type { ActiveShipmentItem } from '@/domain/logistics/active-shipment.types'

export interface TrackingItem {
  sku: string
  productName: string
  quantity: number
  thumbnailUrl: string
}

export interface TrackingMilestone {
  timestamp: string
  description: string
  location: string
  latitude: number
  longitude: number
  isCurrent: boolean
  statusType: string
}

export interface TrackingResponse {
  orderId: number
  orderCode: string
  trackingNumber: string
  carrier: string
  customerName: string
  customerPhone: string
  customerAddress: string
  totalValue: number
  codAmount: number
  shippingCost: number
  status: number
  estimatedDeliveryDate?: string
  originLatitude?: number
  originLongitude?: number
  destinationLatitude?: number
  destinationLongitude?: number
  items: TrackingItem[]
  milestones: TrackingMilestone[]
}

export function getShipmentTracking(searchQuery: string) {
  return request.get<TrackingResponse>({
    url: `/api/v1/logistics/tracking/${searchQuery}`,
    showErrorMessage: false,
  })
}

export function getActiveShipments() {
  return request.get<ActiveShipmentItem[]>({
    url: `/api/v1/logistics/active-shipments`,
    showErrorMessage: false,
  })
}
