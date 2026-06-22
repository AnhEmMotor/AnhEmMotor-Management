import {
  ApplyMaintenancePackageUseCase,
  ChangeWorkflowStatusUseCase,
  CreateMaintenanceTicketUseCase,
  GetMaintenanceTicketUseCase,
  IssuePartsUseCase,
  RealApplyMaintenancePackageUseCase,
  RealChangeWorkflowStatusUseCase,
  RealCreateMaintenanceTicketUseCase,
  RealGetMaintenanceTicketUseCase,
  RealIssuePartsUseCase,
  RealUpdateOdoAndGenerateWarningsUseCase,
  UpdateOdoAndGenerateWarningsUseCase,
} from "@/application/maintenance/usecases";

export interface MaintenanceUseCases {
  getTicket: GetMaintenanceTicketUseCase;
  createTicket: CreateMaintenanceTicketUseCase;
  updateOdoAndWarnings: UpdateOdoAndGenerateWarningsUseCase;
  applyPackage: ApplyMaintenancePackageUseCase;
  issueParts: IssuePartsUseCase;
  changeWorkflowStatus: ChangeWorkflowStatusUseCase;
}

export function createMaintenanceUseCases(): MaintenanceUseCases {
  return {
    getTicket: new RealGetMaintenanceTicketUseCase(),
    createTicket: new RealCreateMaintenanceTicketUseCase(),
    updateOdoAndWarnings: new RealUpdateOdoAndGenerateWarningsUseCase(),
    applyPackage: new RealApplyMaintenancePackageUseCase(),
    issueParts: new RealIssuePartsUseCase(),
    changeWorkflowStatus: new RealChangeWorkflowStatusUseCase(),
  };
}
