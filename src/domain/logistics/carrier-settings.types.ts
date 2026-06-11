export type CarrierEnvironment = 'sandbox' | 'production'

export interface CarrierPartnerSummary {
  id: number
  carrierCode: string
  name: string
  isActive: boolean

  environment: CarrierEnvironment
  apiBaseUrl: string
  apiTokenMasked: string
  apiTokenPlain?: string
  webhookSecretMasked: string
  webhookSecretPlain?: string
  webhookEndpointUrl: string

  autoSyncPricing: boolean
  maxParcelWeightKg: number

  allowLiquidCargo: boolean
  allowOversizeCargo: boolean
}

export interface GetCarriersResponse {
  items: CarrierPartnerSummary[]
}

export interface UpdateCarrierPartnerRequest {
  isActive: boolean
  environment: CarrierEnvironment
  apiBaseUrl: string

  // Optional new secrets. If user keeps unchanged, UI sends undefined.
  apiTokenPlain?: string
  webhookSecretPlain?: string

  webhookEndpointUrl: string
  autoSyncPricing: boolean
  maxParcelWeightKg: number
  allowLiquidCargo: boolean
  allowOversizeCargo: boolean
}

export interface TestCarrierConnectionResponse {
  isSuccess: boolean
  message: string
}
