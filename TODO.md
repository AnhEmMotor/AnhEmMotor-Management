# TODO - Service Workshop Evaluation (Clean Architecture)

## Step 0: Repo understanding
- [x] Đọc Backup.md để xác định UI/Backend requirements.
- [x] Kiểm tra route UI hiện có: `/service/workshop/evaluation`.
- [x] Đọc module mẫu: maintenance và pattern usecases/domain/infrastructure trong UI.

## Step 1: UI implementation (AnhEmMotor-Management)
- [ ] Tạo `src/domain/evaluation/types.ts` (types: EvaluationListItem, EvaluationDetail, Technician, Reply payload, InternalNotes).
- [ ] Tạo `src/application/evaluation/usecases.ts` (usecases: list, getDetail, createReply, markProcessed, updateInternalNotes).
- [ ] Tạo `src/infrastructure/evaluation/usecasesFactory.ts` (implementation gọi API endpoints).
- [ ] Implement trang `src/views/service/workshop/evaluation/index.vue`:
  - [ ] Split layout 40/60.
  - [ ] List view: tabs status, filter criteria, search, table.
  - [ ] Detail workspace: chat history timeline, input phản hồi, nút gửi, nút đánh dấu xử lý.
  - [ ] Internal notes section (visibility theo pattern maintenance/warranty-requests).
- [ ] Cập nhật i18n keys `src/i18n/package/vi.ts` và `en.ts`.

## Step 2: Backend implementation (AnhEmMotor-Backend)
- [ ] Tạo Contracts: `Application/ApiContracts/Evaluation/*`.
- [ ] Tạo Feature Queries/Commands theo clean architecture:
  - [ ] `GetServiceEvaluationsQuery/Handler`
  - [ ] `GetServiceEvaluationDetailQuery/Handler`
  - [ ] `CreateContactReplyCommand/Handler`
  - [ ] `MarkEvaluationProcessedCommand/Handler`
  - [ ] `UpdateEvaluationInternalNotesCommand/Handler`
- [ ] Implement triggers:
  - [ ] Cộng dồn tỷ lệ khách phàn nàn/tháng cho technician khi rating thấp/khiếu nại kỹ thuật.
  - [ ] Append vào Customer 360 interaction timeline khi tạo reply + internal notes.
- [ ] Tạo Controller: `WebAPI/Controllers/V1/EvaluationsController.cs` (hoặc bổ sung vào controller phù hợp theo convention dự án).
- [ ] Đăng ký DI cho handlers/mappings.

## Step 3: Build & verify
- [ ] Backend build (dotnet build).
- [ ] Frontend run (npm/pnpm) và kiểm tra route UI.
- [ ] Chạy lint/typecheck nếu dự án có.

