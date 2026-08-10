export interface WarrantyTerm {
  id: number;
  brandId: number;
  brandName: string;
  termName: string;
  termNameJson: string;
  vehicleType: string;
  errorCategory: string;
  description?: string;
  descriptionJson?: string;
  durationMonths?: number;
  durationKm?: number;
  coverage?: string;
  status: WarrantyTermStatus;
  effectiveDate?: string;
  expirationDate?: string;
  mediaUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type WarrantyTermStatus = 'Active' | 'Inactive' | 'Expired';

export interface WarrantyTermList {
  items: WarrantyTerm[];
  totalCount: number;
}

export interface WarrantyTermStatisticsResponse {
  totalTerms: number;
  activeTerms: number;
  inactiveTerms: number;
  brandsCovered: number;
}

export interface WarrantyTermFilters {
  brandId?: number;
  vehicleType?: string;
  status?: string;
  searchTerm?: string;
}
