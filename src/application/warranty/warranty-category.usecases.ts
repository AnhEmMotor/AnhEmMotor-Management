import type {
  WarrantyTerm,
  WarrantyTermStatisticsResponse,
} from '@/domain/warranty/warranty-category.types';

export interface GetWarrantyTermsUseCase {
  execute(params: {
    current: number;
    size: number;
    Filters?: string;
    Sorts?: string;
  }): Promise<{ items: WarrantyTerm[]; totalCount: number }>;
}

export interface GetWarrantyTermDetailUseCase {
  execute(id: number): Promise<WarrantyTerm>;
}

export interface GetWarrantyTermStatisticsUseCase {
  execute(): Promise<WarrantyTermStatisticsResponse>;
}

export interface CreateWarrantyTermUseCase {
  execute(data: Partial<WarrantyTerm>): Promise<number>;
}

export interface UpdateWarrantyTermUseCase {
  execute(id: number, data: Partial<WarrantyTerm>): Promise<boolean>;
}

export interface DeleteWarrantyTermUseCase {
  execute(id: number): Promise<void>;
}

export interface GetBrandsForSelectUseCase {
  execute(): Promise<{ id: number; name: string }[]>;
}
