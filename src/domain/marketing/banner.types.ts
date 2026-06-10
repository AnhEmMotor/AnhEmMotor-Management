export interface Banner {
  id: number
  title: string
  desktopImageUrl: string
  mobileImageUrl?: string
  description?: string
  ctaLink?: string
  ctaLabel?: string
  placement?: string
  position?: string
  startDate?: string
  endDate?: string
  isActive: boolean
  priority: number
  clickCount: number
  viewCount: number
  ctr: number
  displayOrder: number
}

export interface BannerList {
  items: Banner[]
  totalItems: number
  totalPages: number
  page: number
  pageSize: number
}
