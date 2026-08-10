import {
  type CreateWarrantyTermUseCase,
  type DeleteWarrantyTermUseCase,
  type GetBrandsForSelectUseCase,
  type GetWarrantyTermDetailUseCase,
  type GetWarrantyTermStatisticsUseCase,
  type GetWarrantyTermsUseCase,
  type UpdateWarrantyTermUseCase,
} from '@/application/warranty/warranty-category.usecases';
import { WarrantyTermApi } from '@/api/warranty';
import type { WarrantyTerm } from '@/domain/warranty/warranty-category.types';

class RealGetWarrantyTermsUseCase implements GetWarrantyTermsUseCase {
  async execute(params: { current: number; size: number; Filters?: string; Sorts?: string }) {
    const res = await WarrantyTermApi.getList(params);
    return {
      items: res.items ?? [],
      totalCount: res.totalCount ?? 0,
    };
  }
}

class RealGetWarrantyTermDetailUseCase implements GetWarrantyTermDetailUseCase {
  async execute(id: number) {
    return WarrantyTermApi.getById(id);
  }
}

class RealGetWarrantyTermStatisticsUseCase implements GetWarrantyTermStatisticsUseCase {
  async execute() {
    return WarrantyTermApi.getStatistics();
  }
}

class RealCreateWarrantyTermUseCase implements CreateWarrantyTermUseCase {
  async execute(data: Partial<WarrantyTerm>) {
    return WarrantyTermApi.create(data);
  }
}

class RealUpdateWarrantyTermUseCase implements UpdateWarrantyTermUseCase {
  async execute(id: number, data: Partial<WarrantyTerm>) {
    return WarrantyTermApi.update(id, data);
  }
}

class RealDeleteWarrantyTermUseCase implements DeleteWarrantyTermUseCase {
  async execute(id: number) {
    await WarrantyTermApi.delete(id);
  }
}

class RealGetBrandsForSelectUseCase implements GetBrandsForSelectUseCase {
  async execute() {
    return [];
  }
}

export interface WarrantyTermUseCases {
  getTerms: GetWarrantyTermsUseCase;
  getTermDetail: GetWarrantyTermDetailUseCase;
  getStatistics: GetWarrantyTermStatisticsUseCase;
  create: CreateWarrantyTermUseCase;
  update: UpdateWarrantyTermUseCase;
  delete: DeleteWarrantyTermUseCase;
  getBrandsForSelect: GetBrandsForSelectUseCase;
}

export function createWarrantyTermUseCases(): WarrantyTermUseCases {
  return {
    getTerms: new RealGetWarrantyTermsUseCase(),
    getTermDetail: new RealGetWarrantyTermDetailUseCase(),
    getStatistics: new RealGetWarrantyTermStatisticsUseCase(),
    create: new RealCreateWarrantyTermUseCase(),
    update: new RealUpdateWarrantyTermUseCase(),
    delete: new RealDeleteWarrantyTermUseCase(),
    getBrandsForSelect: new RealGetBrandsForSelectUseCase(),
  };
}
