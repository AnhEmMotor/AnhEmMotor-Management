# Plan: Reorganize src/api into Domain-Based Module Structure

## Context

The `src/api/` directory currently has a **flat structure** with 38+ API module files mixed together, plus two partially grouped subdirectories (`product/` and `logistics/`). This makes it difficult to:

- Find related APIs quickly
- Understand the system's domain boundaries
- Maintain and scale as the application grows
- Avoid naming conflicts (duplicate files already exist: `category.api.ts`, `product.api.ts`, `technology.api.ts` exist both in root and in `product/`)

The goal is to **organize API modules by business domain** into dedicated subdirectories, following the same pattern as `src/common/` (with its composables, utils, enums subfolders) and `src/components/core/` (with its organized categories).

---

## Proposed Structure

### New Directory Organization

```
src/api/
├── auth/                    # Authentication & Authorization (2 files)
│   ├── auth.api.ts
│   └── system-manage.api.ts
│   └── index.ts (barrel export - optional)
├── product/                # Product catalog management (4-5 files)
│   ├── product.api.ts
│   ├── category.api.ts
│   ├── brand.api.ts
│   ├── technology.api.ts
│   └── index.ts
├── sales/                  # Sales & Orders (5 files)
│   ├── booking.api.ts
│   ├── quotation.api.ts
│   ├── sales-order.api.ts
│   ├── sales-contract.api.ts
│   ├── repair-order.api.ts
│   └── index.ts
├── inventory/              # Inventory & Warehouse (3 files)
│   ├── inventory-receipt.api.ts
│   ├── inventory-report.api.ts
│   ├── purchase-request.api.ts
│   └── index.ts
├── supplier/               # Supplier Management (3 files)
│   ├── supplier.api.ts
│   ├── supplier-contract.api.ts
│   ├── debt.api.ts
│   └── index.ts
├── customer/               # Customer & Lead Management (2 files)
│   ├── lead.api.ts
│   ├── contact.api.ts
│   └── index.ts
├── vehicle/                # Vehicle Management (2 files)
│   ├── vehicle.api.ts
│   └── plate-dossier.api.ts
│   └── index.ts
├── service/                # Service Management (2-3 files)
│   ├── service.api.ts
│   ├── service-category.api.ts (if not in product)
│   ├── service-evaluation.api.ts
│   └── index.ts
├── logistics/             # Already exists, keep as is (3 files)
│   ├── fulfillment.ts
│   ├── returns.ts
│   ├── tracking.ts
│   └── index.ts (may already exist or create)
├── finance/               # Finance (1-2 files)
│   ├── finance-contract.api.ts
│   └── debt.api.ts? (duplicate - see conflicts below)
├── marketing/             # Content & Marketing (2 files)
│   ├── banner.api.ts
│   ├── news.api.ts
│   └── index.ts
├── operations/            # Operations & Administration (4 files)
│   ├── audit-trail.api.ts
│   ├── employee.api.ts
│   ├── file.api.ts
│   ├── statistics.api.ts
│   └── index.ts
├── contracts/             # Contract Templates (1 file)
│   ├── contract-template.api.ts
│   └── index.ts
└── [remaining/legacy]     # Any APIs that don't fit cleanly
```

**Total**: ~13-14 domain folders, each with 1-5 API files.

---

## Critical Issues to Resolve

### 1. Duplicate Files in `product/`

**Problem**: The `src/api/product/` subdirectory already exists with 3 files that are **exact duplicates** of root files:
- `product.api.ts` (root) vs `product/product.api.ts` (duplicate)
- `category.api.ts` (root) vs `product/category.api.ts` (duplicate)
- `technology.api.ts` (root) vs `product/technology.api.ts` (duplicate)

**Solution**: 
- Option A: **Move all product-related APIs into `product/`** and delete root duplicates, update all imports
- Option B: **Delete `product/` subdirectory** and keep all in root (but then we lose grouping)

**Recommendation**: **Option A** - consolidate everything into `product/` folder because:
  - The folder already exists with the same files
  - Makes sense from domain grouping perspective
  - Reduces flat file count

### 2. `debt.api.ts` - Dual Domain Belonging

**Problem**: `debt.api.ts` appears to be related to both **supplier debt** and **finance contracts**. It could fit in either:
- `supplier/` (supplier debt tracking)
- `finance/` (financial debt management)

**Decision needed**: Based on business logic review, determine primary domain.

**Fallback**: If truly cross-cutting, could create a `finance/` folder and keep it there, or create a shared `common/` API folder (not recommended).

### 3. `service-category.api.ts` - Domain Ambiguity

**Problem**: Is this service category (for `service/`) OR product category (for `product/`)? The filename suggests it belongs to service, but it might be product technology categories.

**Decision needed**: Review content of `service-category.api.ts` to determine proper placement.

---

## Implementation Steps

### Phase 1: Preparation & Analysis
1. **Review duplicate files** in `src/api/product/` to confirm they are identical to root
2. **Determine final placement** for `debt.api.ts` and `service-category.api.ts`
3. **Check all imports** of these APIs to understand impact scope (use grep/Grep tool)
4. **Decide on barrel files**: Create `index.ts` in each new folder for cleaner imports (optional but recommended)

### Phase 2: Create New Structure
1. Create new domain folders in `src/api/` (copy from proposed list above)
2. For each folder, create an `index.ts` that re-exports all API modules:
   ```typescript
   // src/api/product/index.ts
   export * from "./product.api";
   export * from "./category";
   export * from "./brand";
   export * from "./technology";
   ```

### Phase 3: Move & Update Files
1. **Move product-related files**:
   - Move `src/api/product.api.ts` → `src/api/product/product.api.ts` (or consolidate)
   - Move `src/api/category.api.ts` → `src/api/product/category.api.ts`
   - Move `src/api/brand.api.ts` → `src/api/product/brand.api.ts`
   - Move `src/api/technology.api.ts` → `src/api/product/technology.api.ts`
   - Delete duplicates in `src/api/product/` if consolidating
2. **Move other modules** according to final domain mapping:
   - Auth files → `src/api/auth/`
   - Sales files → `src/api/sales/`
   - etc.

3. **Update all import statements** throughout codebase:
   - Use `sed` or search-replace to change:
     - `from "@/api/auth.api"` → `from "@/api/auth"`
     - `from "@/api/product.api"` → `from "@/api/product/product.api"` (or just `@/api/product` if using barrel)
   - Be careful with extensions: `.api.ts` may be omitted

### Phase 4: Verification
1. Run `vue-tsc --noEmit` to check TypeScript errors
2. Run `npm run build` to ensure build succeeds
3. Search for any remaining imports from old paths
4. Test a few key features that use these APIs

### Phase 5: Cleanup
1. Remove any empty directories left behind
2. Ensure no duplicate API definitions remain
3. Update any documentation or README if needed

---

## Critical Files to Modify

**Files being moved** (~38 files):
- All files in `src/api/` (except `logistics/` which stays)

**Import sites**:
- All files that import from `@/api/` (need to find exact count - likely 50+ files across:
  - `src/modules/**/logic/**/hooks/*.ts`
  - `src/modules/**/view/**/*.vue`
  - `src/application/store/*.ts`
  - `src/components/**/*.vue`
  - `src/services/*.ts`
  - etc.

---

## Testing Strategy

1. **Type-check**: `npx vue-tsc --noEmit` should pass with 0 errors
2. **Build**: `npm run build` should succeed without module not found errors
3. **Runtime**: Start dev server and test:
   - Login/logout (auth API)
   - Product list page (product API)
   - Order management (sales API)
   - Dashboard statistics (statistics API)
4. **Git check**: `git diff` should only show import path changes, no logic changes

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missed import updates | Build/runtime failures | Use comprehensive grep to find all `@/api/` imports and update systematically |
| Wrong domain placement | Confusion, harder maintenance | Review API purpose carefully; if uncertain, keep in root for now |
| Circular dependencies | Build errors | Check if any API modules import from each other (unlikely) |
| Breaking existing code | Feature breakage | Test critical features after migration |
| Duplicate files not identified | Confusion, two versions | Carefully compare root vs `product/` duplicates before deleting |

---

## Alternative Approaches Considered

### Alternative 1: Keep Flat Structure
- **Pros**: No migration effort, no import changes
- **Cons**: Hard to navigate, 38+ files in one folder, no domain boundaries
- **Decision**: Rejected - does not address user's request for cleaner organization

### Alternative 2: Group by Technical Layer Instead of Domain
- e.g., `src/api/rest/`, `src/api/graphql/`, `src/api/websocket/`
- **Cons**: Current codebase appears to be all REST APIs; not useful
- **Decision**: Rejected - domain grouping is more meaningful

### Alternative 3: Keep Product Subdirectory but Don't Move Others
- **Pros**: Minimal change
- **Cons**: Inconsistent - some grouped, some flat
- **Decision**: Rejected - user wants comprehensive reorganization

---

## Summary

This reorganization will:
- ✅ Improve code discoverability and navigation
- ✅ Establish clear domain boundaries
- ✅ Reduce clutter in `src/api/` root
- ✅ Make the architecture more maintainable
- ✅ Align with existing patterns in `src/common/` and `src/components/core/`

**Estimated effort**: Medium (systematic file moves + global find-replace for imports)
**Risk level**: Low (if done carefully with comprehensive grep and testing)
**Impact**: High positive - much cleaner codebase

---

**Next step**: Get user approval on domain mapping and duplicate resolution strategy, then proceed with implementation.
