import type {
  CreateSupplierContractUseCase,
  DeleteSupplierContractUseCase,
  GetSupplierContractAuditLogsUseCase,
  GetSupplierContractDetailUseCase,
  GetSupplierContractsUseCase,
  GetSupplierContractStatisticsUseCase,
  GetSuppliersForSelectUseCase,
  RestoreSupplierContractUseCase,
  UploadSupplierContractFileUseCase,
  UpdateSupplierContractStatusUseCase,
  UpdateSupplierContractUseCase,
} from "@/application/supplier/contract.usecases";
import type {
  SupplierContractDto,
  SupplierContractListParams,
  SupplierContractMutation,
  SupplierContractStatus,
} from "@/domain/supplier/contract.types";

import { SupplierContractApi } from "@/api/supplier";

class RealGetSupplierContractsUseCase implements GetSupplierContractsUseCase {
  async execute(params: SupplierContractListParams) {
    const res = await SupplierContractApi.getList(params);
    return { items: res.items ?? [], totalCount: res.totalCount ?? 0 };
  }
}

class RealGetSupplierContractDetailUseCase implements GetSupplierContractDetailUseCase {
  async execute(id: string) {
    return SupplierContractApi.getById(id);
  }
}

class RealGetSupplierContractAuditLogsUseCase implements GetSupplierContractAuditLogsUseCase {
  async execute(id: string) {
    return SupplierContractApi.getAuditLogs(id);
  }
}

class RealCreateSupplierContractUseCase implements CreateSupplierContractUseCase {
  async execute(data: SupplierContractMutation) {
    return SupplierContractApi.create(data);
  }
}

class RealUpdateSupplierContractUseCase implements UpdateSupplierContractUseCase {
  async execute(id: string, data: SupplierContractMutation) {
    return SupplierContractApi.update(id, data);
  }
}

class RealUploadSupplierContractFileUseCase implements UploadSupplierContractFileUseCase {
  async execute(id: string, file: File) {
    return SupplierContractApi.uploadFile(id, file);
  }
}

class RealUpdateSupplierContractStatusUseCase implements UpdateSupplierContractStatusUseCase {
  async execute(id: string, status: SupplierContractStatus) {
    return SupplierContractApi.updateStatus(id, { status });
  }
}

class RealDeleteSupplierContractUseCase implements DeleteSupplierContractUseCase {
  async execute(id: string) {
    await SupplierContractApi.delete(id);
  }
}

class RealRestoreSupplierContractUseCase implements RestoreSupplierContractUseCase {
  async execute(id: string) {
    await SupplierContractApi.restore(id);
  }
}

class RealGetSupplierContractStatisticsUseCase implements GetSupplierContractStatisticsUseCase {
  async execute() {
    return SupplierContractApi.getStatistics();
  }
}

class RealGetSuppliersForSelectUseCase implements GetSuppliersForSelectUseCase {
  async execute() {
    return SupplierContractApi.getSuppliersForSelect();
  }
}

export interface SupplierContractUseCases {
  getContracts: GetSupplierContractsUseCase;
  getContractDetail: GetSupplierContractDetailUseCase;
  getAuditLogs: GetSupplierContractAuditLogsUseCase;
  create: CreateSupplierContractUseCase;
  update: UpdateSupplierContractUseCase;
  updateStatus: UpdateSupplierContractStatusUseCase;
  uploadContractFile: UploadSupplierContractFileUseCase;
  delete: DeleteSupplierContractUseCase;
  restore: RestoreSupplierContractUseCase;
  getStatistics: GetSupplierContractStatisticsUseCase;
  getSuppliersForSelect: GetSuppliersForSelectUseCase;
}

export function createSupplierContractUseCases(): SupplierContractUseCases {
  return {
    getContracts: new RealGetSupplierContractsUseCase(),
    getContractDetail: new RealGetSupplierContractDetailUseCase(),
    getAuditLogs: new RealGetSupplierContractAuditLogsUseCase(),
    create: new RealCreateSupplierContractUseCase(),
    update: new RealUpdateSupplierContractUseCase(),
    updateStatus: new RealUpdateSupplierContractStatusUseCase(),
    uploadContractFile: new RealUploadSupplierContractFileUseCase(),
    delete: new RealDeleteSupplierContractUseCase(),
    restore: new RealRestoreSupplierContractUseCase(),
    getStatistics: new RealGetSupplierContractStatisticsUseCase(),
    getSuppliersForSelect: new RealGetSuppliersForSelectUseCase(),
  };
}
