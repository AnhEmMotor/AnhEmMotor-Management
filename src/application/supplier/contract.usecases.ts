import type {
  SupplierContractAuditLogDto,
  SupplierContractDto,
  SupplierContractListParams,
  SupplierContractMutation,
  SupplierContractStatisticsResponse,
  SupplierContractStatus,
} from "@/domain/supplier/contract.types";

export interface GetSupplierContractsUseCase {
  execute(params: SupplierContractListParams): Promise<{
    items: SupplierContractDto[];
    totalCount: number;
  }>;
}

export interface GetSupplierContractDetailUseCase {
  execute(id: string): Promise<SupplierContractDto>;
}

export interface GetSupplierContractAuditLogsUseCase {
  execute(id: string): Promise<SupplierContractAuditLogDto[]>;
}

export interface CreateSupplierContractUseCase {
  execute(data: SupplierContractMutation): Promise<SupplierContractDto>;
}

export interface UpdateSupplierContractUseCase {
  execute(
    id: string,
    data: SupplierContractMutation,
  ): Promise<SupplierContractDto>;
}

export interface UploadSupplierContractFileUseCase {
  execute(id: string, file: File): Promise<{ contractFilePath: string }>;
}

export interface UpdateSupplierContractStatusUseCase {
  execute(
    id: string,
    status: SupplierContractStatus,
  ): Promise<SupplierContractDto>;
}

export interface DeleteSupplierContractUseCase {
  execute(id: string): Promise<void>;
}

export interface RestoreSupplierContractUseCase {
  execute(id: string): Promise<void>;
}

export interface GetSupplierContractStatisticsUseCase {
  execute(): Promise<SupplierContractStatisticsResponse>;
}

export interface GetSuppliersForSelectUseCase {
  execute(): Promise<{ id: number; name: string }[]>;
}
