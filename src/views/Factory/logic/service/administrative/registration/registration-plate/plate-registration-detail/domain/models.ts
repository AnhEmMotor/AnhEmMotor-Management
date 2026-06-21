export type PlateRegistrationWorkflowStatus =
  | 'Preparation'
  | 'PreTaxPaid'
  | 'PlateBilled'
  | 'WaitingCavet'
  | 'Completed'

export type PlateRegistrationDetail = {
  id: number
  code: string
  phoneNumber: string
  customerName?: string
  vinNumber?: string
  licensePlate?: string
  workshopAssignee?: string
  workflowStatus: PlateRegistrationWorkflowStatus

  createdAt?: string

  // Financial (Thu hộ - Chi hộ)
  totalCollected?: number
  totalPaid?: number
  debtAmount?: number
}

export type TimelineItem = {
  key: string
  status: PlateRegistrationWorkflowStatus
  title: string
  note: string
  occurredAt: string
  type: 'info' | 'primary' | 'success' | 'warning' | 'danger'
}

export type NotificationItem = {
  key: string
  channel: 'Zalo/SMS'
  status: 'Sent'
  message: string
  sentAt: string
  type: 'info' | 'success' | 'warning'
}
