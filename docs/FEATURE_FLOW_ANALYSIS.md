# Feature Flow Analysis & Gap/Issue Report

This document covers **32 Feature Flows** across 4 modules, identifies **18 gaps**, and detects **22 issues** based on full code analysis of both the `treadx-main-backend` (Spring Boot) and `treadx-admin` (React/Vite) projects.

---

## Table of Contents

- [Module 1: Lead (CRM-L) — 12 Features](#module-1-lead-crm-l--12-features)
- [Module 2: Subscriptions (SUB) — 7 Features](#module-2-subscriptions-sub--7-features)
- [Module 3: Access Control (AC) — 6 Features](#module-3-access-control-ac--6-features)
- [Module 4: Dealer (DLR) — 7 Features](#module-4-dealer-dlr--7-features)
- [Gap Analysis (18 Gaps)](#gap-analysis-18-gaps)
- [Issue Detection (22 Issues)](#issue-detection-22-issues)

---

## Module 1: Lead (CRM-L) — 12 Features

### CRM-L01: Lead Creation

**Purpose:** Allow platform users to create a new lead record with business info, address, source, optional file attachment, and duplicate detection.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- User is authenticated with one of the above roles.
- No duplicate lead exists with the same business name, phone number, or address combination.

**Main Flow:**
1. User navigates to `/leads/add` (via "Add Lead" button in `LeadsList`).
2. `AddLead.jsx` renders `LeadWizard` with `isEdit=false`.
3. User completes a 6-step wizard:
   - **Step 1 — Business:** Enters `businessName` (required).
   - **Step 2 — Contact:** Enters `phoneNumber` (required, Canadian format validated via `validatePhoneNumber`).
   - **Step 3 — Address:** Enters `streetNumber`, `streetName`, `postalCode` (required); `aptUnitBldg` (optional). Formatters applied on change.
   - **Step 4 — Source:** Selects `source` from `GOVERNMENT` | `ADS` (required); `sourceUrl` (optional).
   - **Step 5 — Documents:** Optional file upload and notes.
   - **Step 6 — Review:** Summary of all data.
4. User clicks "Create Lead".
5. Frontend builds `FormData` with a JSON blob `lead` (the `LeadsRequestDTO`) and an optional `file` part.
6. `leadsService.createLead(formData, file)` sends `POST /api/v1/leads` (multipart/form-data).
7. Backend `LeadsController.createLead` passes through `@PreAuthorize` (three roles allowed).
8. `LeadsService.createLead`:
   a. Checks for duplicates via `existsDuplicateLead(businessName, streetNumber, postalCode, phone)` — throws `ConflictException` if found.
   b. Maps DTO to `Leads` entity via `LeadsMapper.toEntity`.
   c. If file provided, uploads via `FileService.uploadAndSave(file, "leads")` and attaches to entity.
   d. If `dealerId` provided, resolves `Dealer` and links it.
   e. Forces `status = PENDING` regardless of request.
   f. Runs `checkForDuplicates` to set `flag` boolean (name/phone/address partial matches).
   g. Creates initial `LeadsHistory` entry with `addedByManager = true` if creator is SALES_MANAGER or SYSTEM_ADMIN.
   h. Saves and returns `LeadsResponseDTO`.
9. Frontend navigates to `/leads` with success message in location state.

**Alternative Flows:**
- **Duplicate detected (step 8a):** Backend returns 409 Conflict. Frontend displays error in `errors.submit` on the review step.
- **File upload failure:** Backend handles internally; lead is still created without attachment.
- **Validation failure (step 3):** Frontend `validateCurrentStep` blocks navigation to the next step; inline error shown under the invalid field.

**Validation Rules:**
| Field | Rule | Enforced By |
|-------|------|-------------|
| `businessName` | Required, `@NotBlank` | Frontend (wizard step) + Backend (DTO) |
| `phoneNumber` | Required, `@NotBlank`, Canadian format | Frontend (formatter) + Backend (DTO) |
| `streetNumber`, `streetName`, `postalCode` | Required | Frontend (wizard step) + Backend (`AddressRequestDTO`) |
| `source` | Required, must be `GOVERNMENT` or `ADS` | Frontend (wizard step) |
| Duplicate | Unique on `(businessName, streetNumber, postalCode, phone)` | Backend (service) |

**Outputs / State Changes:**
- New `Leads` entity persisted with `status = PENDING`, optional `file`, `flag` for duplicates.
- New `LeadsHistory` entry created with `addedByManager` flag.
- Response: `LeadsResponseDTO` with full lead data including computed fields.

---

### CRM-L02: Lead Listing & Filtering

**Purpose:** Display paginated, sortable, filterable lead lists with role-scoped visibility.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- User is authenticated with one of the above roles.

**Main Flow:**
1. User navigates to `/leads`.
2. `LeadsList.jsx` determines role context via `useAuth()`.
3. Based on role and filters, the appropriate API is called:
   - **SALES_AGENT (agent mode):** If `statusFilter === 'all'` → `GET /api/v1/leads/my-leads`; if status selected → `GET /api/v1/leads/my-leads` with status param.
   - **SYSTEM_ADMIN / SALES_MANAGER:** If `statusFilter === 'all'` → `GET /api/v1/leads`; if status selected → `GET /api/v1/leads/status?status=...`.
4. Query parameters sent: `page`, `size` (10), `sortBy`, `direction`, optionally `search` and `status`.
5. Backend `LeadsController` routes to `LeadsService`:
   - `getAllLeads`: **Only allows SALES_MANAGER and SYSTEM_ADMIN** at service level (throws `AccessDeniedException` for agents despite controller allowing them).
   - `getLeadsByStatus`: For SALES_AGENT, merges own leads + unassigned manager-added leads + assigned leads filtered by status; for others, uses repository `findByStatus`.
   - `getMyLeads`: For SALES_AGENT, unions `findMyLeads` + `findUnassignedManagerLeads` + `findByAssignedToId` with manual subList pagination.
6. Frontend receives `Page<LeadsResponseDTO>`, renders table with columns: Business Name, Contact, Address, Source, Status, Created date, Actions.
7. Client-side filter further narrows by `searchTerm` (business name, phone, notes) and `sourceFilter`.

**Alternative Flows:**
- **Agent calls `GET /leads` directly:** Service throws `AccessDeniedException` → 403. Frontend should use my-leads endpoint for agents.
- **Empty results:** Table shows "No leads found" empty state.
- **Search + pagination:** Text search term is sent to server AND applied client-side. Pagination reflects server-side totals, which can mismatch client-filtered rows.

**Validation Rules:**
| Parameter | Rule |
|-----------|------|
| `page` | Integer ≥ 0, default 0 |
| `size` | Integer > 0, default 10 |
| `sortBy` | String field name, default `createdAt` |
| `direction` | `asc` or `desc`, default `desc` |
| `status` | Must be valid `LeadStatus` enum value |

**Outputs / State Changes:**
- No state changes (read-only).
- Response: `Page<LeadsResponseDTO>` with `content`, `totalPages`, `totalElements`, pagination metadata.

---

### CRM-L03: Lead Detail View

**Purpose:** Display complete lead information with file preview, history, and quick actions.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT (owner/assignee via `@authz.isLeadOwner`)

**Preconditions:**
- Lead with given ID exists.
- User is admin/manager OR is the lead owner/assignee.

**Main Flow:**
1. User clicks a lead row in `LeadsList` or navigates to `/leads/:id`.
2. `LeadDetailView.jsx` calls `leadsService.getLead(id)` → `GET /api/v1/leads/{id}`.
3. Backend `@PreAuthorize` checks: `SYSTEM_ADMIN` or `SALES_MANAGER` or `@authz.isLeadOwner(#id)`.
4. `LeadsService.getLeadById` loads the lead entity, resolves `createdByName`, and maps to `LeadsResponseDTO`.
5. Frontend renders four tabs:
   - **Details:** Business name, phone, formatted address, source, source URL, "Added by Manager" flag, assigned agent info, notes.
   - **Contact:** Contact method, details, person name, extension; or empty state with "Initiate Contact" button.
   - **Documents:** File preview (fetched as blob via `GET /api/v1/leads/{id}/preview`) and download button (`GET /api/v1/leads/{id}/file`).
   - **History:** Timeline of creation, last update, validation, and assignment events parsed from response fields.
6. Sidebar shows **Quick Actions** based on lead status and user role:
   - **Validate Lead:** Visible when `status === PENDING` and user is PLATFORM_ADMIN or SALES_MANAGER.
   - **Initiate Contact:** Visible when `status === APPROVED` and no contact method set.
   - **Convert to Dealer:** Visible when `status === CONTACTED`.

**Alternative Flows:**
- **403 Forbidden:** Dedicated 403 UI with "Return to Leads" button.
- **Lead not found:** Error state displayed.
- **No file attached:** Documents tab shows "No documents" empty state.

**Validation Rules:**
- Path `id` must be a valid `Long`.
- File preview: only served if lead has an attached file entity.

**Outputs / State Changes:**
- No state changes (read-only).
- File preview generates a blob URL for in-browser display.

---

### CRM-L04: Lead Update (Full/Partial)

**Purpose:** Allow editing of an existing lead's details, including file replacement.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT (owner via `@authz.isLeadOwner`)

**Preconditions:**
- Lead exists.
- User has appropriate role or is the lead owner.

**Main Flow:**
1. User clicks "Edit" action on a lead → navigates to `/leads/:id/edit`.
2. `EditLead.jsx` loads the lead via `leadsService.getLead(id)` and passes it as `initialData` to `LeadWizard`.
3. `LeadWizard` renders with `isEdit=true`, pre-populating all fields from the loaded lead.
4. User modifies desired fields and advances through wizard steps.
5. On submit, `leadsService.updateLead(id, formData, file)` sends `PUT /api/v1/leads/{id}` (multipart/form-data).
6. Backend `@PreAuthorize` checks: SYSTEM_ADMIN, SALES_MANAGER, or `@authz.isLeadOwner(#id)`.
7. `LeadsService.updateLead`:
   a. Loads existing lead.
   b. If status changed, calls `validateStatusTransition` (**currently a no-op stub — allows all transitions**).
   c. If new file uploaded, deletes old file and uploads new one.
   d. Recomputes `flag` if business name, phone, or address fields changed.
   e. Updates entity fields from request, saves, returns DTO.
8. Frontend navigates to `/leads/:id` with success message.

**Alternative Flows:**
- **PATCH endpoint:** `PATCH /api/v1/leads/{id}` exists for partial updates, but after `@PreAuthorize` passes, `hasAccessToLead(id, "UPDATE")` is called — this **only allows SYSTEM_ADMIN/SALES_MANAGER**, blocking agents even if they passed `@authz.isLeadOwner`. (See Gap G4.)
- **File replacement:** Old file is deleted from storage before new one is saved.

**Validation Rules:**
- Same field validation as CRM-L01.
- Status transitions: currently unrestricted (empty `validateStatusTransition`).

**Outputs / State Changes:**
- Lead entity updated in database.
- Duplicate `flag` recomputed if relevant fields changed.
- Old file deleted and new file attached if replaced.

---

### CRM-L05: Lead Validation (Approve/Deny)

**Purpose:** Allow managers/admins to approve or deny a pending lead.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Lead exists.
- User has SYSTEM_ADMIN or SALES_MANAGER role.

**Main Flow:**
1. **From Detail View:** User clicks "Validate Lead" quick action on a PENDING lead → `LeadValidationModal` opens.
2. User selects either "Approve" or "Deny" tile.
3. User optionally enters notes (required for denial to enable the Confirm button).
4. User clicks "Confirm".
5. `leadsService.validateLead(lead.id, { status, notes })` sends `PUT /api/v1/leads/{id}/validate`.
6. Backend `@PreAuthorize`: SYSTEM_ADMIN or SALES_MANAGER.
7. Then `authorizationService.hasAccessToLead(id, "UPDATE")` is checked (admin/manager only — passes).
8. `LeadsService.validateLead`:
   a. Loads lead.
   b. Sets `lead.status = request.getStatus()` (**no validation that status is only APPROVED or DENIED**).
   c. Creates new `LeadsHistory` entry with `validatedBy`, `validatedAt`, and copies `addedByManager` from current history.
   d. Saves and returns DTO.
   e. **Note:** `request.getNotes()` is **not applied** to the lead entity (see Issue I3).
9. Modal closes; lead state refreshes in `LeadDetailView`.

**Alternative Flows:**
- **From Approval Page:** `LeadsApproval.jsx` shows all PENDING leads (first page only, no pagination params). Approve/Deny buttons directly call `validateLead` with hardcoded notes (`'Approved by admin'` / `'Denied by admin'`).
- **Non-pending lead:** Backend does not enforce status precondition — any status can be "validated" (Issue I2).

**Validation Rules:**
| Field | Rule |
|-------|------|
| `status` | Must be valid `LeadStatus` — backend does not restrict to APPROVED/DENIED only |
| `notes` | Frontend requires non-empty for DENIED; backend has no `@NotBlank` |

**Outputs / State Changes:**
- Lead status changed (typically to APPROVED or DENIED).
- New `LeadsHistory` entry with validation metadata.
- Notes from request are **not** persisted on the lead (bug).

---

### CRM-L06: Lead Contact Initiation

**Purpose:** Record the first contact attempt with a lead, capturing method and contact person details.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- Lead exists with `status === APPROVED`.
- No contact method has been set yet (`!lead.contactMethod`).

**Main Flow:**
1. User clicks "Initiate Contact" quick action in `LeadDetailView` → `LeadContactModal` opens.
2. Modal pre-fills `contactMethod: PHONE`.
3. User fills in:
   - `contactMethod`: PHONE | MAIL_EMAIL | TEXT | OTHER (required).
   - `contactMethodDetails`: e.g., phone number or email (required).
   - `extensionNumber`: if PHONE (optional).
   - `contactName`, `position`: optional.
4. User clicks submit.
5. `leadsService.initiateContact(lead.id, formData)` sends `POST /api/v1/leads/{id}/initiate-contact`.
6. Backend `@PreAuthorize`: any of the three roles.
7. `LeadsService.initiateContact`:
   a. Loads lead.
   b. `LeadsMapper.updateContactDetails` sets contact fields AND changes `status` to `CONTACTED` in the mapper.
   c. Saves and returns DTO.
8. Modal closes; detail view refreshes showing contact info and new CONTACTED status.

**Alternative Flows:**
- **Already contacted:** Frontend hides the action button if `lead.contactMethod` is set.
- **Validation failure:** Submit disabled if `contactMethod` or `contactMethodDetails` is empty.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `contactMethod` | Required, must be valid `ContactMethod` enum |
| `contactMethodDetails` | Required, non-empty string |
| `extensionNumber` | Optional |
| `contactName`, `position` | Optional |

**Outputs / State Changes:**
- Lead contact fields populated.
- Lead status changed to `CONTACTED`.

---

### CRM-L07: Lead Assignment to Agent

**Purpose:** Allow managers/admins to assign a lead to a specific sales agent.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Lead exists.
- Target agent exists and has the `SALES_AGENT` role.

**Main Flow:**
1. **No frontend UI exists for this feature** (Gap G1).
2. Direct API call: `POST /api/v1/leads/{id}/assign?agentId={agentId}`.
3. Backend `@PreAuthorize`: SYSTEM_ADMIN or SALES_MANAGER.
4. `LeadsService.assignLeadToAgent`:
   a. Verifies caller is SALES_MANAGER or SYSTEM_ADMIN.
   b. Loads lead or throws 404.
   c. Loads agent user; verifies agent has role name `"SALES_AGENT"` or throws 400.
   d. Creates new `LeadsHistory` entry with `assignedTo = agent`, `assignedAt = now`, copies `addedByManager`.
   e. **Does NOT set `assignedTo` on the `Leads` entity itself** — assignment is tracked only via history.
   f. Returns updated DTO.

**Alternative Flows:**
- **Invalid agent role:** 400 Bad Request.
- **Lead not found:** 404.
- **Access denied:** 403.

**Validation Rules:**
| Parameter | Rule |
|-----------|------|
| `leadId` | Must reference an existing lead |
| `agentId` | Must reference an existing user with `SALES_AGENT` role |

**Outputs / State Changes:**
- New `LeadsHistory` entry recording the assignment.
- Lead entity itself is NOT modified (assignment lives in history only).

---

### CRM-L08: Lead Self-Assignment (Take)

**Purpose:** Allow a sales agent to self-assign an unassigned, manager-added lead.

**Actors:** SALES_AGENT

**Preconditions:**
- Lead exists.
- Lead's current history has `addedByManager == true` and `assignedTo == null`.

**Main Flow:**
1. In `LeadsList`, a "Take" button appears on leads where `lead.addedByManager === true` and `lead.assignedTo` is null, visible only to SALES_AGENT.
2. Agent clicks "Take".
3. `leadsService.takeLead(lead.id)` sends `POST /api/v1/leads/{id}/take`.
4. Backend `@PreAuthorize`: `hasRole('SALES_AGENT')`.
5. `LeadsService.takeLead`:
   a. Verifies caller is `SALES_AGENT`.
   b. Loads lead; checks current history: `addedByManager == true` and `assignedTo == null`. If not met, throws `AccessDeniedException`.
   c. Creates new `LeadsHistory` with `assignedTo = currentUser`, `addedByManager = true`.
   d. Returns DTO.
6. Frontend refreshes lead list.

**Alternative Flows:**
- **Already assigned:** Service throws `AccessDeniedException`; frontend shows error.
- **Not manager-added:** Same denial.
- **From detail view:** `LeadDetailView` also shows a Take button with the same conditions, but the success handler calls `setMessage(...)` which references a non-existent state variable (Issue I1).

**Validation Rules:**
- Caller must be SALES_AGENT.
- Lead must be unassigned and manager-added.

**Outputs / State Changes:**
- New `LeadsHistory` entry with agent as `assignedTo`.
- Lead entity itself is NOT modified.

---

### CRM-L09: Lead Deletion

**Purpose:** Remove a lead and its associated data.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT (owner via `@authz.isLeadOwner`)

**Preconditions:**
- Lead exists.
- User has appropriate role or is the lead owner.

**Main Flow:**
1. User clicks "Delete" action in `LeadsList` or `LeadDetailView`.
2. Browser `window.confirm` dialog shown (list) or direct deletion (detail).
3. `leadsService.deleteLead(id)` sends `DELETE /api/v1/leads/{id}`.
4. Backend `@PreAuthorize`: SYSTEM_ADMIN, SALES_MANAGER, or `@authz.isLeadOwner(#id)`.
5. Then `authorizationService.hasAccessToLead(id, "DELETE")` is called — **only passes for SYSTEM_ADMIN/SALES_MANAGER** (same issue as G5).
6. `LeadsService.deleteLead`: finds lead, calls `delete`.
7. Frontend navigates to `/leads` with success message (from detail) or removes from list (from list view).

**Alternative Flows:**
- **Agent owner tries to delete:** Passes `@PreAuthorize` but fails `hasAccessToLead` → 403 (Gap G5).
- **Lead not found:** 404.

**Validation Rules:**
- Lead must exist.
- Authorization: role or ownership (but service-level check is inconsistent — see Gap G5).

**Outputs / State Changes:**
- Lead entity deleted from database (cascade removes history via `orphanRemoval`).
- Associated file is NOT explicitly deleted from storage by the delete method.

---

### CRM-L10: Lead File Management

**Purpose:** Preview and download files attached to leads.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- Lead exists and has an attached file.

**Main Flow:**
1. In `LeadDetailView` Documents tab, preview image is loaded on mount:
   - `apiClient.get(API_ENDPOINTS.LEAD_FILE_PREVIEW(leadId), { responseType: 'blob' })` → `GET /api/v1/leads/{id}/preview`.
   - Blob URL created for inline display.
2. **Preview button:** Fetches same endpoint, opens blob in new window.
3. **Download button:** `apiClient.get(LEAD_FILE_DOWNLOAD(leadId), { responseType: 'blob' })` → `GET /api/v1/leads/{id}/file`.
   - Filename extracted from `Content-Disposition` header or falls back to `lead.uploadedFile` path.
   - Extension resolved from MIME type.
   - Triggers browser download via temporary `<a>` element.
4. Backend `@PreAuthorize` for both endpoints: any of the three roles (**no ownership check** — see Issue I4).
5. Service loads lead entity, retrieves file via `FileService`, returns as `Resource` with appropriate content type.

**Alternative Flows:**
- **No file:** Preview endpoint returns 404 via `ResourceNotFoundException`.
- **MIME type unknown:** Download falls back to `.bin` extension.

**Validation Rules:**
- Lead must have a non-null `file` association.
- Role-based access only (no ownership check).

**Outputs / State Changes:**
- No state changes (read-only file access).

---

### CRM-L11: Lead History Tracking

**Purpose:** Record and display the audit trail of lead lifecycle events.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- Lead exists.

**Main Flow:**
1. **Automatic history creation:** History entries are created by the backend during:
   - Lead creation (initial entry with `addedByManager` flag).
   - Lead validation (entry with `validatedBy`, `validatedAt`).
   - Lead assignment (entry with `assignedTo`, `assignedAt`).
   - Lead self-take (entry with `assignedTo`).
2. **Manual history creation:** `POST /api/v1/leads-history` allows direct creation of history entries.
   - `@PreAuthorize`: any of the three roles.
   - Request body: `LeadsHistoryRequestDTO` with `leadId` (required), optional `validatedById`, `validatedAt`, `addedByManager`, `assignedToId`, `assignedAt`.
3. **Retrieval:** `GET /api/v1/leads-history/lead/{leadId}` returns all history entries ordered by `createdAt DESC`.
4. **Display:** In `LeadDetailView` History tab, events are rendered as a timeline:
   - Created event with creator name and timestamp.
   - Last modified event (if different from creation).
   - Validated event with validator name and timestamp.
   - Assigned event with assignee name and timestamp.

**Alternative Flows:**
- **No history beyond creation:** Only the initial entry is shown.
- **History entry by ID:** `GET /api/v1/leads-history/{id}` retrieves a single entry.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `leadId` | Required (`@NotNull`), must reference an existing lead |
| `validatedById`, `assignedToId` | Optional, resolved to users if provided |

**Outputs / State Changes:**
- `LeadsHistory` entities created or retrieved.
- History is ordered by `createdAt DESC` — index 0 is the "current" history used by the lead entity's `getCurrentHistory()`.

---

### CRM-L12: My Leads View

**Purpose:** Provide agents with a view of leads they own, are assigned to, or can take.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- User is authenticated.

**Main Flow:**
1. In `LeadsList`, when `isAgent` is true (`user.roleName === 'SALES_AGENT'`), the component calls my-leads endpoints instead of all-leads.
2. `leadsService.getMyLeads(params)` sends `GET /api/v1/leads/my-leads`.
3. Backend `LeadsService.getMyLeads`:
   - For SALES_AGENT: unions three queries:
     a. `findMyLeads(userId)` — leads created by the agent.
     b. `findUnassignedManagerLeads` — leads added by managers with no assignment.
     c. `findByAssignedToId(userId)` — leads assigned to the agent.
   - Deduplicates and applies manual subList pagination.
   - For non-agents: returns `findAll(pageable)` (same as all leads).
4. **My Lead by ID:** `GET /api/v1/leads/my-leads/{id}` loads a single lead.
   - **No ownership verification** in service — any authenticated user can read any lead through this endpoint (Gap G3).

**Alternative Flows:**
- **No leads in scope:** Empty table rendered.
- **Pagination:** Manual subList-based pagination may have edge cases with varying list sizes across the three queries.

**Validation Rules:**
- Same pagination parameters as CRM-L02.
- Agent identity derived from `SecurityContextHolder` (not from URL).

**Outputs / State Changes:**
- No state changes (read-only).
- Returns combined view of owned + assigned + takeable leads for agents.

---

## Module 2: Subscriptions (SUB) — 7 Features

### SUB-P01: Plan CRUD

**Purpose:** Create, read, update, and delete subscription plans that define service tiers for dealers.

**Actors:**
- Create/Update/Delete: SYSTEM_ADMIN
- Read: SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- User is authenticated with the appropriate role.

**Main Flow:**

**Create:**
1. User navigates to `/subscription-plans` (visible to PLATFORM_ADMIN/admin in sidebar).
2. `SubscriptionPlansList.jsx` renders. User clicks "Add Plan" → `SubscriptionPlanForm` dialog opens.
3. User fills in fields validated by Zod schema:
   - `planName` (1–100 chars), `description` (1–500 chars), `price` (≥ 0), `billingCycle` (MONTHLY/QUARTERLY/YEARLY), `maxTireStorage` (≥ 1), `maxUsers` (≥ 1), `isActive` (boolean), `features` (list of strings).
4. Submit: `subscriptionPlansService.createSubscriptionPlan(data)` → `POST /api/v1/plans`.
   - **Note:** Frontend sends to `/subscription-plans` but backend endpoint is `/plans` (Gap G10).
5. Backend `PlanService.createPlan`:
   a. Checks `existsByPlanName(planName)` → `IllegalArgumentException` if duplicate.
   b. Maps via `PlanMapper.toEntity` (features serialized to JSON string).
   c. Saves and returns `PlanResponseDTO`.

**Read (single):**
- `GET /api/v1/plans/{id}` — SYSTEM_ADMIN or SALES_MANAGER.

**Update:**
1. User clicks "Edit" on a plan row → `SubscriptionPlanForm` opens with `plan` prop.
2. Form pre-populated; user modifies fields.
3. Submit: `PUT /api/v1/plans/{id}`.
4. `PlanService.updatePlan`: loads plan, updates all fields via mapper, saves.
   - **No duplicate name check** on update (unlike create).

**Delete:**
1. User clicks "Delete" → `AlertDialog` confirmation.
2. `DELETE /api/v1/plans/{id}` — SYSTEM_ADMIN only.
3. `PlanService.deletePlan`: checks existence, deletes.
   - **Does not check for existing subscriptions** referencing the plan (Issue I10).

**Alternative Flows:**
- **Duplicate plan name on create:** 400 error displayed in form.
- **Plan not found:** 404.
- **Default value conflict:** Zod requires `maxTireStorage ≥ 1` and `maxUsers ≥ 1`, but defaults are `0` (Issue I11).

**Validation Rules:**
| Field | Frontend (Zod) | Backend |
|-------|----------------|---------|
| `planName` | 1–100 chars | `@NotBlank` (missing — no annotations on DTO) |
| `description` | 1–500 chars | None |
| `price` | ≥ 0 | None on DTO; DB `NOT NULL` |
| `billingCycle` | Enum | Enum type on entity |
| `maxTireStorage` | ≥ 1 | None on DTO |
| `maxUsers` | ≥ 1 | None on DTO |
| `features` | Array of non-empty strings | Serialized as JSON string |

**Outputs / State Changes:**
- Plan entity created/updated/deleted in `crm.plans`.
- React Query cache invalidated on mutation for list refresh.

---

### SUB-P02: Active Plans Listing

**Purpose:** List only active subscription plans, typically for plan selection during dealer creation.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- User is authenticated with one of the above roles.

**Main Flow:**
1. `SubscriptionPlansList.jsx` loads data via React Query calling `subscriptionPlansService.getActiveSubscriptionPlans({ page, size, search })`.
2. Frontend sends `GET /subscription-plans/active` — **but backend endpoint is `/api/v1/plans/active`** (Gap G10).
3. Backend `PlanController.getActivePlans`:
   - `@PreAuthorize`: three roles.
   - `PlanService.getActivePlans` → `planRepository.findByIsActiveTrue(pageable)`.
4. Returns `Page<PlanResponseDTO>` with only plans where `isActive = true`.

**Alternative Flows:**
- **No active plans:** Empty page returned.
- **URL mismatch (G10):** If frontend URL prefix doesn't match backend, request returns 404 unless a proxy rewrites paths.

**Validation Rules:**
- Standard pagination parameters.

**Outputs / State Changes:**
- No state changes (read-only).

---

### SUB-P03: Plans by User Count

**Purpose:** Find active plans that support at least a given number of users.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- User is authenticated.

**Main Flow:**
1. **No frontend UI exists for this feature** (Gap — no dedicated page).
2. Direct API: `GET /api/v1/plans/by-user-count?userCount={n}`.
3. `PlanService.getPlansByUserCount` → `planRepository.findActivePlansByUserCount(userCount)`.
   - JPQL: `SELECT p FROM Plan p WHERE p.isActive = true AND p.maxUsers >= :userCount`.
4. Returns `List<PlanResponseDTO>`.

**Alternative Flows:**
- **No matching plans:** Empty list.
- **Used internally:** Could be consumed by `EnhancedDealerWizard` for plan filtering, but currently isn't.

**Validation Rules:**
| Parameter | Rule |
|-----------|------|
| `userCount` | Required integer |

**Outputs / State Changes:**
- No state changes (read-only).

---

### SUB-S01: Subscription Creation

**Purpose:** Create a subscription linking a dealer to a plan with billing details.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Dealer exists and does not already have an active subscription.
- Plan exists and is active.

**Main Flow:**
1. **No standalone frontend UI** — subscription creation happens only as part of the enhanced dealer creation flow (DLR-02).
2. Direct API: `POST /api/v1/subscriptions` with `SubscriptionRequestDTO`.
3. `SubscriptionService.createSubscription`:
   a. Loads dealer by `dealerId` or 404.
   b. Resolves plan via `planService.getActivePlanById(planId)` — throws `ConflictException` if plan is inactive.
   c. Checks `findActiveSubscriptionByDealerId` — throws `IllegalStateException` if dealer already has an active subscription.
   d. Maps via `SubscriptionMapper.toEntity`: `startDate` defaults to now if null, status set to `ACTIVE`, `autoRenew` defaults to `true`.
   e. Saves and returns `SubscriptionResponseDTO`.
4. **Enhanced flow (DLR-02):** `EnhancedDealerService.createDealerSubscription` bypasses this controller, directly building and saving the `Subscription` entity with calculated `endDate` based on `plan.billingCycle`.

**Alternative Flows:**
- **Dealer already has active subscription:** 400 `IllegalStateException`.
- **Plan inactive:** `ConflictException`.
- **Dealer not found:** 404.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `dealerId` | Required, must reference existing dealer |
| `planId` | Required, must reference active plan |
| `startDate` | Optional (defaults to now) |
| `endDate` | Required in DTO (no default in controller path) |
| `amountPaid` | Required |
| `autoRenew` | Optional (defaults to true) |

**Outputs / State Changes:**
- New `Subscription` entity with `status = ACTIVE`.
- Links dealer to plan with billing period.

---

### SUB-S02: Subscription Listing & Details

**Purpose:** View all subscriptions or subscriptions for a specific dealer.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- User is authenticated with appropriate role.

**Main Flow:**
1. **No frontend UI exists** (Gap G8).
2. Available API endpoints:
   - `GET /api/v1/subscriptions` — paginated list of all subscriptions.
   - `GET /api/v1/subscriptions/{id}` — single subscription by ID.
   - `GET /api/v1/subscriptions/dealer/{dealerId}` — all subscriptions for a dealer.
   - `GET /api/v1/subscriptions/dealer/{dealerId}/active` — active subscription for a dealer.
3. Services load from repository and map to `SubscriptionResponseDTO` including `dealerName`, `planName`, status, billing details.

**Alternative Flows:**
- **No subscriptions:** Empty list or 404 for active subscription lookup.

**Validation Rules:**
- Standard pagination for list endpoints.
- `dealerId` / `id` must be valid.

**Outputs / State Changes:**
- No state changes (read-only).

---

### SUB-S03: Subscription Cancellation

**Purpose:** Cancel an active subscription with an optional reason.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Subscription exists.

**Main Flow:**
1. **No frontend UI exists** (Gap G9).
2. Direct API: `POST /api/v1/subscriptions/{id}/cancel?reason={optional}`.
3. `SubscriptionService.cancelSubscription`:
   a. Loads subscription or 404.
   b. Sets `status = CANCELLED`, `cancellationDate = now`, `cancellationReason = reason`.
   c. Saves and returns DTO.

**Alternative Flows:**
- **Already cancelled:** No guard — allows re-cancellation (overwrites date/reason).

**Validation Rules:**
| Parameter | Rule |
|-----------|------|
| `id` | Must reference existing subscription |
| `reason` | Optional string |

**Outputs / State Changes:**
- Subscription status changed to `CANCELLED`.
- Cancellation date and reason recorded.

---

### SUB-S04: Subscription Update/Delete

**Purpose:** Modify subscription details or remove a subscription.

**Actors:**
- Update: SYSTEM_ADMIN, SALES_MANAGER
- Delete: SYSTEM_ADMIN

**Preconditions:**
- Subscription exists.

**Main Flow:**

**Update:**
1. **No frontend UI** (Gap G9).
2. `PUT /api/v1/subscriptions/{id}` with `SubscriptionRequestDTO`.
3. `SubscriptionService.updateSubscription`:
   a. Loads subscription.
   b. If `planId` provided, resolves active plan and sets it.
   c. Patches non-null fields: `startDate`, `endDate`, `amountPaid`, `autoRenew`.
   d. Does NOT modify `dealerId` or `status` via this method.
   e. Saves and returns DTO.

**Delete:**
1. `DELETE /api/v1/subscriptions/{id}` — SYSTEM_ADMIN only.
2. Checks existence, deletes.

**Alternative Flows:**
- **New plan inactive:** `ConflictException` from `getActivePlanById`.
- **Not found:** 404.

**Validation Rules:**
- All DTO fields are optional for update (patch semantics).
- Delete only checks existence.

**Outputs / State Changes:**
- Subscription entity updated or deleted.

---

## Module 3: Access Control (AC) — 6 Features

### AC-01: Authentication (Login/Logout/Refresh)

**Purpose:** Authenticate users, manage sessions via JWT access tokens and database-stored refresh tokens, and terminate sessions.

**Actors:** All users (unauthenticated for login/refresh; authenticated for logout)

**Preconditions:**
- Login: valid user credentials exist.
- Refresh: valid, non-revoked refresh token exists.
- Logout: user is authenticated.

**Main Flow:**

**Login:**
1. User navigates to `/login` → `LoginForm.jsx` renders.
2. User enters email and password (or uses demo credential buttons).
3. `AuthContext.login(email, password)` dispatches `LOGIN_START`.
4. `authService.login(email, password)` → `POST /api/v1/auth/login` with `{ email, password }`.
5. Backend `AuthenticationService.login`:
   a. IP rate limiting via Resilience4j (`authLoginRateLimiter-{ip}`). Blocked IPs get 429.
   b. Loads user by email or throws `UnAuthorizedException`.
   c. Rejects: inactive users, system users, wrong password.
   d. Resolves tenant context via `TenantInfoResolver` (dealer staff → `tenantType: "dealer"`, else `"platform"`).
   e. Generates JWT access token with claims: `userId`, `role`, `tenantType`, `tenantId`. Expiry: 15 minutes (default).
   f. Creates refresh token: revokes all existing tokens for user, generates new UUID token with 7-day expiry, stores in `auth.refresh_tokens`.
   g. Returns `AuthResponse`: `accessToken`, `refreshToken`, `expiresIn`, `email`, `firstName`, `lastName`, `role`, `tenantType`, `tenantId`, `tenantName`.
6. Frontend stores `treadx_token` (access token) and `treadx_refresh_token` in `localStorage`.
7. Calls `authService.getCurrentUser()` → `GET /api/v1/users/me` to get full user profile.
8. Normalizes `roleName` from nested `role.name` object, stores `treadx_user` JSON.
9. Dispatches `LOGIN_SUCCESS`; redirects based on role:
   - SALES_MANAGER / SALES_AGENT → `/leads`
   - Others → `/dashboard` → redirects to `/`

**Logout:**
1. `AuthContext.logout()` removes `treadx_token` and `treadx_user` from localStorage.
2. Dispatches `LOGOUT`.
3. **Does NOT call backend** `POST /api/v1/auth/logout` (frontend `authService.logout` is `Promise.resolve()`).
4. **Does NOT clear** `treadx_refresh_token` or `treadx_territory_code` (Issue I15).
5. Backend logout (if called directly): revokes all refresh tokens for user, clears SecurityContext.

**Refresh:**
1. **Not implemented in frontend** (Issue I16 / Gap G15).
2. Backend `POST /api/v1/auth/refresh`:
   a. Validates refresh token string against DB.
   b. Checks `isUsable()` (not revoked, not expired).
   c. Generates new access JWT.
   d. Returns same refresh token (no rotation in refresh flow).

**Alternative Flows:**
- **Rate limited:** 429 with blocked IP.
- **Invalid credentials:** 401 `UnAuthorizedException`.
- **Inactive user:** 401.
- **401 on any API call:** `apiClient` response interceptor clears tokens and redirects to `/login`.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `email` | `@NotBlank`, `@Email` |
| `password` | `@NotBlank` |
| `refreshToken` | `@NotBlank` (for refresh endpoint) |

**Outputs / State Changes:**
- Login: JWT access token + refresh token issued; user session established in frontend state.
- Logout: Frontend state cleared; backend refresh tokens revoked (if backend called).
- Refresh: New access token issued; same refresh token returned.

---

### AC-02: Password Change

**Purpose:** Allow authenticated users to change their password.

**Actors:** Any authenticated user

**Preconditions:**
- User is authenticated.
- User knows their current password.

**Main Flow:**
1. **No frontend UI exists** (Gap G14).
2. Direct API: `POST /api/v1/auth/change-password` with `ChangePasswordRequest`.
3. `AuthenticationService.changePassword`:
   a. Gets current user from SecurityContext.
   b. Verifies current password matches.
   c. Encodes new password and saves.
   d. Revokes all refresh tokens for the user (forces re-login on other devices).

**Alternative Flows:**
- **Wrong current password:** Error thrown.
- **DTO note:** `ChangePasswordRequest` has `currentPassword`, `newPassword`, `ConfirmPassword` (capital C) — but confirm field is not used in service logic.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `currentPassword` | Must match stored hash |
| `newPassword` | No validation annotations on DTO |
| `ConfirmPassword` | Present in DTO but unused |

**Outputs / State Changes:**
- User password updated.
- All refresh tokens revoked.

---

### AC-03: User CRUD

**Purpose:** Manage platform users — create, read, update, and delete user accounts.

**Actors:**
- Create: SYSTEM_ADMIN, SALES_MANAGER (limited)
- Read/Update/Delete: SYSTEM_ADMIN

**Preconditions:**
- Caller has appropriate role.

**Main Flow:**

**List Users:** `GET /api/v1/users` — SYSTEM_ADMIN only → returns `List<UserResponseDTO>`.

**Get User:** `GET /api/v1/users/{id}` — SYSTEM_ADMIN only.

**Get Current User:** `GET /api/v1/users/me` — any authenticated user (no `@PreAuthorize`; relies on global authentication requirement).

**Create User:** `POST /api/v1/users`
- SYSTEM_ADMIN or SALES_MANAGER.
- `UserService.createUser`:
  a. Checks email uniqueness.
  b. Role restrictions: SYSTEM_ADMIN cannot create duplicate super admin; SALES_MANAGER can only create SALES_AGENT.
  c. Creates user with encoded password, assigned role, optional additional permissions.
  d. Returns `UserResponseDTO`.

**Update User:** `PUT /api/v1/users/{id}` — SYSTEM_ADMIN only.
- Updates email (with uniqueness check), name, role, position, active status.

**Partial Update:** `PATCH /api/v1/users/{id}` — SYSTEM_ADMIN only.
- Same as update but only non-null fields applied.

**Delete User:** `DELETE /api/v1/users/{id}` — SYSTEM_ADMIN only.

**Alternative Flows:**
- **Duplicate email:** Error on create/update.
- **SALES_MANAGER creating non-agent:** Rejected.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `email` | Required, unique |
| `firstName`, `lastName` | Required |
| `password` | Required on create |
| `roleId` | `@NotNull` |
| `isActive` | Defaults to true |

**Outputs / State Changes:**
- User entity created/updated/deleted in `auth.users`.
- No frontend UI exists (Gap G12).

---

### AC-04: Role Management

**Purpose:** Manage roles and their associated permissions.

**Actors:** SYSTEM_ADMIN

**Preconditions:**
- Caller has SYSTEM_ADMIN role.

**Main Flow:**

**List Roles:** `GET /api/v1/roles` → returns `List<Role>` entities directly (not DTOs).

**Get Role:** `GET /api/v1/roles/{id}` → `Role` entity.

**Create Role:** `POST /api/v1/roles` with `RoleRequestDTO`:
- `RoleService.createRole`: maps `permissionIds` to `Permission` entities (NPE if `permissionIds` is null), creates role.

**Update Role:** `PUT /api/v1/roles/{id}`.

**Delete Role:** `DELETE /api/v1/roles/{id}`.

**Get Role Permissions:** `GET /api/v1/roles/{id}/permissions` → `List<String>` of permission names.

**Update Role Permissions:** `PUT /api/v1/roles/{id}/permissions` with `Set<Long> permissionIds`.
- Only allowed for non-system roles.

**Alternative Flows:**
- **System role modification:** Prevented for permission updates.
- **Null permissionIds on create:** NPE (service bug).

**Validation Rules:**
| Field | Rule |
|-------|------|
| `name` | `@NotBlank`, unique |
| `isActive` | `@NotNull Boolean` |
| `permissionIds` | Set of Longs (nullable causes NPE) |

**Outputs / State Changes:**
- Role entity created/updated/deleted in `auth.roles`.
- Permission associations managed via `auth.role_permissions`.
- No frontend UI exists (Gap G13).

---

### AC-05: Permission Management

**Purpose:** View and modify a user's additional permissions beyond their role's defaults.

**Actors:** SYSTEM_ADMIN

**Preconditions:**
- User exists.

**Main Flow:**
1. **No frontend UI exists** (combined with Gap G12).
2. **Update Permissions:** `PUT /api/v1/users/{id}/permissions` with `Set<Long> permissionIds`.
   - `UserService.updateUserPermissions`: loads user, resolves permission entities by IDs, sets `additionalPermissions`, saves.
3. **View Permissions:** Included in `UserResponseDTO` via `GET /api/v1/users/{id}` or `/users/me`.

**Alternative Flows:**
- **Invalid permission ID:** `findAllById` silently ignores missing IDs.

**Validation Rules:**
- `permissionIds`: Set of Longs, no `@Valid` annotation on the controller parameter.

**Outputs / State Changes:**
- User's `additionalPermissions` updated in `auth.user_permissions` join table.
- Effective authorities = role permissions + additional permissions (computed in `User.getAuthorities()`).

---

### AC-06: Session Restore & Token Refresh

**Purpose:** Restore user session on page reload and refresh expired access tokens.

**Actors:** Authenticated users

**Preconditions:**
- Valid `treadx_token` and `treadx_user` in localStorage (for restore).
- Valid refresh token (for refresh — not implemented in frontend).

**Main Flow:**

**Session Restore:**
1. On mount, `AuthContext` `useEffect` reads `treadx_token` and `treadx_user` from localStorage.
2. If both exist and `treadx_user` parses as valid JSON:
   - Normalizes `roleName`.
   - Dispatches `LOGIN_SUCCESS` with stored user and token.
3. If parse fails: clears those localStorage keys.
4. **Issue (I14):** Restore is asynchronous (`useEffect` runs after first render). Initial state has `isAuthenticated = false`, causing a brief flash to `/login` before the effect completes.

**Token Refresh (backend only):**
1. Backend supports `POST /api/v1/auth/refresh` with `RefreshTokenRequest`.
2. Validates stored refresh token (not revoked, not expired).
3. Issues new access JWT; returns same refresh token.
4. **Frontend does NOT implement refresh** (Gap G15):
   - `authService.refreshToken` returns mock data.
   - `apiClient` has no 401 → refresh → retry interceptor.
   - On 401, the interceptor simply clears tokens and redirects to `/login`.

**Alternative Flows:**
- **Expired access token + valid refresh token:** Backend would issue new access token, but frontend never calls this flow — user is logged out instead.
- **Corrupted localStorage:** Restore fails silently; user redirected to login.

**Validation Rules:**
- Restore: JSON parse of `treadx_user` must succeed.
- Refresh: `refreshToken` must be `@NotBlank` and match a non-revoked, non-expired DB record.

**Outputs / State Changes:**
- Restore: Auth state rehydrated from localStorage.
- Refresh: New access token (backend only; not wired in frontend).

---

## Module 4: Dealer (DLR) — 7 Features

### DLR-01: Dealer Creation from Lead

**Purpose:** Convert a contacted lead into a dealer entity.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Lead exists with `status = CONTACTED`.
- User has SYSTEM_ADMIN or SALES_MANAGER role.

**Main Flow:**
1. Direct API: `POST /api/v1/dealers` with `DealerRequestDTO`.
2. `DealerService.createDealer`:
   a. Loads lead by `request.getLeadId()` or 404.
   b. Validates lead status is `CONTACTED` — throws `ConflictException` if not.
   c. Validates user access management: `totalUsers > 0`, each role in `userRoles` must be `DEALER_ADMIN` or `DEALER_TECHNICIAN`, role count sum must equal `totalUsers`.
   d. Maps DTO to `Dealer` entity, saves.
   e. Generates `dealerUniqueId` via `DealerIdGenerator` (prefix `001010001` + 6-digit ID), saves again.
   f. Sets lead status to `ONBOARDED`, saves lead.
   g. Returns `DealerResponseDTO`.
3. Frontend `EnhancedDealerWizard.jsx` currently calls `dealersService.createDealer` which hits `POST /dealers` (this basic endpoint), but collects fields matching the enhanced endpoint (Gap G17).

**Alternative Flows:**
- **Lead not CONTACTED:** 409 Conflict.
- **Invalid user roles:** 400 with validation message.
- **Lead not found:** 404.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `leadId` | Required, must reference a CONTACTED lead |
| `legalName`, `businessName` | Present in DTO |
| `totalUsers` | If set, must be > 0 |
| `userRoles` | Each key must be `DEALER_ADMIN` or `DEALER_TECHNICIAN`; sum must equal `totalUsers` |

**Outputs / State Changes:**
- New `Dealer` entity with generated `dealerUniqueId`.
- Source lead status changed to `ONBOARDED`.

---

### DLR-02: Enhanced Dealer Creation (with Subscription + Onboarding)

**Purpose:** Create a dealer with an active subscription and send an admin invitation in a single atomic operation.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Lead exists with `status = CONTACTED`.
- Subscription plan exists and is active.

**Main Flow:**
1. User navigates to `/dealers/add` (or clicks "Convert to Dealer" from a lead detail with `leadId` in query).
2. `EnhancedDealerWizard.jsx` renders with steps:
   - **Select Lead** (if no `leadId` in URL): Shows CONTACTED leads with search and pagination. User selects one.
   - **Business:** `legalName`, `businessName` (pre-filled from lead if selected).
   - **Contact:** `email`, `phoneNumber` (pre-filled from lead).
   - **Address:** `streetNumber`, `streetName`, `aptUnitBldg`, `postalCode`.
   - **User Access:** `totalUsers`, per-role counts via `UserAccessManagement` component. Roles: VENDOR_ADMIN, VENDOR_EMPLOYEE, VENDOR_TECHNICIAN (frontend naming — see Issue I21).
   - **Review:** Summary of all data.
3. User submits. Frontend calls `dealersService.createDealer(dealerData)` → `POST /api/v1/dealers` (**should call `/enhanced-dealers/create`** — Gap G17).
4. If correctly routed to enhanced endpoint: `POST /api/v1/enhanced-dealers/create` with `@Valid DealerCreationRequestDTO`.
5. Backend `EnhancedDealerService.createDealerWithAccessAndSubscription` (single `@Transactional`):
   a. **Create dealer:** Builds `DealerRequestDTO` from creation DTO (lead, address, contact, status only — not admin or subscription fields). Calls `dealerService.createDealer`.
   b. **Create subscription:** Loads active plan by `subscriptionPlanId`. Calculates `endDate` from `plan.billingCycle` (MONTHLY +1m, QUARTERLY +3m, YEARLY +1y). Builds `Subscription` with `status = ACTIVE`, `amountPaid = plan.getPrice()`, `autoRenew` from request or default `true`.
   c. **Create admin invitation:** Calls `dealerAuthService.createInitialAdminInvitation(dealer, adminFirstName, adminLastName, adminEmail, false)` — creates inactive user, dealer staff record, generates invitation token, sends activation email.
   d. Returns `DealerCreationResponseDTO` with dealer info, subscription details, and onboarding status.

**Alternative Flows:**
- **Plan inactive:** `ConflictException`.
- **Dealer already has active subscription:** `IllegalStateException` (via subscription service if using controller path).
- **Admin email already exists as active staff:** Conflict in invitation service.
- **Email sending disabled:** Activation link logged to console for manual sharing.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `leadId` | Required |
| `legalName`, `businessName`, `email` | Required (`@NotBlank` on DTO) |
| `subscriptionPlanId` | Required |
| `adminFirstName`, `adminLastName`, `adminEmail` | Required |
| `totalUsers`, `userRoles` | Optional in DTO (not copied to dealer in enhanced flow) |

**Outputs / State Changes:**
- Dealer entity created with `dealerUniqueId`.
- Lead status → `ONBOARDED`.
- Subscription entity created with `ACTIVE` status.
- Inactive user account created for dealer admin.
- `DealerStaff` record created with `OWNER` access level.
- `DealerAdminInvitationToken` created (SHA-256 hashed).
- Activation email sent (if mail enabled).

---

### DLR-03: Dealer Update (Full/Partial)

**Purpose:** Modify an existing dealer's information.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER

**Preconditions:**
- Dealer exists.

**Main Flow:**

**Full Update:**
1. User navigates to `/dealers/:id/edit`.
2. `EditDealerForm.jsx` loads dealer via `dealersService.getDealer(id)`.
3. Form displays fields: `legalName`, `businessName`, `streetNumber`, `streetName`, `aptUnitBldg`, `postalCode`, `email`, `phoneNumber`, `status` (ACTIVE/INACTIVE select).
4. Formatters applied: `handleStreetNumberChange`, `handlePostalCodeChange`, `handlePhoneNumberChange`.
5. Submit: `dealersService.updateDealer(id, formData)` → `PUT /api/v1/dealers/{id}`.
6. `DealerService.updateDealer`: loads dealer, applies all fields via `updateEntityFromRequest`, saves.
7. Navigates to `/dealers/:id` with success message.

**Partial Update:**
- `PATCH /api/v1/dealers/{id}` — only non-null fields applied.
- No dedicated frontend UI; same controller/service pattern.

**Alternative Flows:**
- **Dealer not found:** 404.
- **List/detail pages de-emphasize editing:** Comments in code say "dealers cannot be modified after creation" — but edit route and form exist.

**Validation Rules:**
- HTML `required` on several form inputs (no Zod schema).
- Backend: no DTO validation annotations.

**Outputs / State Changes:**
- Dealer entity updated.

---

### DLR-04: Dealer Listing & Search

**Purpose:** Display paginated dealer list with search and status filtering.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- User is authenticated with one of the above roles.

**Main Flow:**
1. User navigates to `/dealers`.
2. `DealersList.jsx` loads dealers via `dealersService.getDealers(params)`:
   - `GET /api/v1/dealers` with `page`, `size`, optional `status`, `search`.
3. Backend routes to appropriate service method:
   - **No status filter:** `DealerService.getAllDealers(pageable)` → `dealerRepository.findAll`.
   - **With status:** `getDealersByStatus(status, pageable)` → `findByDealerStatus`.
   - **Search:** `searchDealers(query, pageable)` → JPQL ILIKE on legal name, business name, email, phone.
4. Frontend renders table: Dealer (business + legal name), Dealer ID, Contact (email + phone), Status badge, View action.
5. Filtering: text search input (Enter or "Apply Filters" to trigger) + status dropdown (All/Active/Inactive).
6. Pagination: page controls shown if `totalPages > 1`.

**Alternative Flows:**
- **No dealers:** Empty table state.
- **Search with status:** Frontend sends both; service method called depends on which filter is active.

**Validation Rules:**
| Parameter | Rule |
|-----------|------|
| `page` | Default 0 |
| `size` | Default 10 |
| `status` | Valid `DealerStatus` enum (ACTIVE/INACTIVE) |
| `query` | Non-empty string for search |

**Outputs / State Changes:**
- No state changes (read-only).

---

### DLR-05: Dealer Detail View

**Purpose:** Display comprehensive dealer information.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER, SALES_AGENT

**Preconditions:**
- Dealer exists.

**Main Flow:**
1. User clicks "View" on a dealer row → navigates to `/dealers/:id`.
2. `DealerDetailView.jsx` loads dealer via `dealersService.getDealer(id)` → `GET /api/v1/dealers/{id}`.
3. Displays:
   - Header: business name + status badge.
   - Grid: legal name, email, phone (formatted), full address (formatted postal code), dealer unique ID.
   - **User Access Configuration** (conditional): if `totalUsers` and `userRoles` exist, shows total user count and per-role breakdown with icons (Dealer Admin / Employee / Technician using `UserRole` labels).
4. Only action: "Back to Dealers" navigation.

**Alternative Flows:**
- **Dealer not found:** Error state.
- **No user access config:** Section hidden.

**Validation Rules:**
- `id` must be valid.

**Outputs / State Changes:**
- No state changes (read-only).

---

### DLR-06: Dealer Initial Account Setup + Invitation

**Purpose:** Create an initial admin account for a dealer and send an activation invitation.

**Actors:** SYSTEM_ADMIN, SALES_MANAGER (for setup/resend); Public (for activation)

**Preconditions:**
- Dealer exists.
- No active duplicate admin for the dealer/email combination (unless resending).

**Main Flow:**

**Setup (deprecated standalone endpoint):**
1. `POST /api/dealer-auth/setup-initial-account` with `SetupInitialDealerAccountRequestDTO` (`dealerUniqueId`, `adminFirstName`, `adminLastName`, `adminEmail`).
2. Resolves dealer by `dealerUniqueId`.
3. Delegates to `createInitialAdminInvitation(dealer, ..., allowResend=false)`.

**Invitation Creation (core logic in `DealerAuthService.createInitialAdminInvitation`):**
1. Validates non-blank first/last name.
2. Conflict checks:
   - Active staff for email already exists.
   - Existing `DEALER_ADMIN` for this dealer (different email) when not resending.
   - Global user exists for email but no staff link for this dealer.
   - Existing valid unused non-revoked token for same dealer+email (when not resending).
3. Loads `DEALER_ADMIN` role.
4. Creates or finds user: inactive, random password, role `DEALER_ADMIN`, position `"Dealer Administrator"`.
5. Creates `DealerStaff` record if missing: `districtCode = "DEFAULT"`, `accessLevel = OWNER`.
6. If resending: revokes all current valid tokens for dealer+email.
7. Generates URL-safe Base64 token (32 random bytes), stores SHA-256 hash in `DealerAdminInvitationToken` with expiry (default 24 hours).
8. Sends activation email via `DealerOnboardingEmailService` with link: `{activationUrl}?token={rawToken}`.
9. Returns `DealerOnboardingResponseDTO` with `accountState = "INIT"`.

**Resend Invitation:**
1. `POST /api/dealer-auth/resend-invitation` with `ResendDealerInvitationRequestDTO`.
2. Resolves dealer, finds existing staff by email.
3. Calls `createInitialAdminInvitation(..., allowResend=true)` — revokes old tokens and creates new one.

**No standalone frontend UI** — invitation is triggered as part of the enhanced dealer creation flow (DLR-02). Resend would need a dedicated UI.

**Alternative Flows:**
- **Email disabled:** Activation link logged to console.
- **Duplicate admin:** Conflict error.
- **Token already exists (not resending):** Error.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `dealerUniqueId` | Must match existing dealer |
| `adminFirstName`, `adminLastName` | Non-blank |
| `adminEmail` | Must not be an active staff for another dealer |

**Outputs / State Changes:**
- Inactive `User` entity created (or existing one found).
- `DealerStaff` record created with `OWNER` access.
- `DealerAdminInvitationToken` stored (hashed).
- Activation email sent.

---

### DLR-07: Dealer Account Activation

**Purpose:** Allow an invited dealer admin to set their password and activate their account.

**Actors:** Public (invited dealer admin with valid token)

**Preconditions:**
- Valid, non-expired, unused, non-revoked invitation token.

**Main Flow:**
1. Invited admin receives email with activation link: `{activationUrl}?token={rawToken}`.
2. **No frontend UI in admin panel** — this is a public endpoint intended for the dealer-facing application.
3. `POST /api/dealer-auth/activate-account` with `ActivateDealerAccountRequestDTO`:
   - `token`: the raw token from the email link.
   - `newPassword`: minimum 8 characters.
4. `DealerAuthService.activateInitialAccount`:
   a. Hashes the provided token (SHA-256).
   b. Looks up `DealerAdminInvitationToken` by hash where `revoked = false`. 404 if not found.
   c. Rejects if `usedAt != null` (already used) or expired.
   d. Sets user password (encoded), activates user (`isActive = true`).
   e. Marks token as used (`usedAt = now`) and revoked.
5. Returns success response.

**Alternative Flows:**
- **Token expired:** Error response.
- **Token already used:** Error response.
- **Token not found / revoked:** 404.

**Validation Rules:**
| Field | Rule |
|-------|------|
| `token` | Required, must hash to a valid non-revoked token |
| `newPassword` | Minimum 8 characters (`@Size(min=8)` on DTO) |

**Outputs / State Changes:**
- User password set and account activated.
- Invitation token marked as used and revoked.
- User can now log in via the dealer application.

---

## Gap Analysis (18 Gaps)

| # | Feature | Gap Type | Description | Suggested Fix |
|---|---------|----------|-------------|---------------|
| G1 | CRM-L07 Lead Assignment | Missing UI | Backend `POST /api/v1/leads/{id}/assign?agentId=` exists with full assignment logic (creates history entry, validates agent role); no frontend UI to invoke it. | Add "Assign Agent" modal in `LeadDetailView` (visible to SALES_MANAGER/SYSTEM_ADMIN) with agent selection dropdown. |
| G2 | CRM-L02 All Leads | Backend Mismatch | `LeadsController.getAllLeads` allows SALES_AGENT via `@PreAuthorize`, but `LeadsService.getAllLeads` throws `AccessDeniedException` for agents. Agents passing the controller gate get a 403 from the service. | Either remove SALES_AGENT from the controller's `@PreAuthorize` annotation, or update the service to allow agents (with scoped results). |
| G3 | CRM-L12 My Lead By ID | Missing Auth Check | `GET /api/v1/leads/my-leads/{id}` has no ownership verification in `LeadsService.getMyLeadById` — any authenticated user reaching the service can read any lead by ID, regardless of ownership or assignment. | Add ownership/assignment check in `getMyLeadById`: verify the requesting agent created, is assigned to, or can take the lead. |
| G4 | CRM-L04 PATCH Lead | Auth Inconsistency | `@PreAuthorize` allows `@authz.isLeadOwner(#id)` for SALES_AGENT, but the controller body then calls `authorizationService.hasAccessToLead(id, "UPDATE")` which only returns true for SYSTEM_ADMIN/SALES_MANAGER. Agents who own the lead pass the gate but fail the inner check. | Update `hasAccessToLead` to also check `isLeadOwner` for agents, or remove the redundant inner check since `@PreAuthorize` already handles authorization. |
| G5 | CRM-L09 Delete Lead | Auth Inconsistency | Same pattern as G4: `@PreAuthorize` allows lead owners, but `hasAccessToLead(id, "DELETE")` blocks agents. | Same fix as G4 — align `hasAccessToLead` with the `@PreAuthorize` policy. |
| G6 | CRM-L03 Convert to Dealer | Route Mismatch | `LeadDetailView` "Convert to Dealer" navigates to `/dealers/new?leadId=...` but the defined route is `/dealers/add`. Navigation results in a 404 / no-match. | Change navigation target from `/dealers/new` to `/dealers/add`. |
| G7 | SUB-S01 Subscription Creation | Missing UI | Full subscription creation API exists (`POST /api/v1/subscriptions`); no standalone UI for creating or managing subscriptions outside the enhanced dealer flow. | Build a subscription management page or integrate subscription creation into the dealer detail view. |
| G8 | SUB-S02 Subscription Listing | Missing UI | Backend provides endpoints to list subscriptions globally and per dealer; no frontend page or component consumes them. | Add subscription list/tab to dealer detail view, or create a standalone Subscriptions page. |
| G9 | SUB-S03/S04 Subscription Cancellation & Management | Missing UI | Backend supports cancellation (`POST /{id}/cancel`), update (`PUT /{id}`), and delete (`DELETE /{id}`); no frontend UI for any subscription lifecycle management. | Add cancel/edit/delete actions to the subscription listing UI (once built per G8). |
| G10 | SUB-P02 Frontend URL Mismatch | URL Mismatch | Frontend `API_ENDPOINTS` uses `/subscription-plans/active` (and `/subscription-plans` for CRUD), but backend endpoints are under `/api/v1/plans`. Unless a proxy rewrites the prefix, all subscription plan API calls will 404. | Align frontend `API_ENDPOINTS` to use `/plans` instead of `/subscription-plans`, or add backend aliases. |
| G11 | SUB Expiry/Renewal | Missing Logic | `SubscriptionRepository.findExpiringSubscriptions(date)` query method exists but is never called. No `@Scheduled` job processes expiring subscriptions — subscriptions that pass their `endDate` remain `ACTIVE` indefinitely. | Implement a `@Scheduled` service method that periodically checks for expired subscriptions and updates their status to `EXPIRED`, with optional auto-renewal logic for `autoRenew = true`. |
| G12 | AC-03 User Management UI | Missing UI | Full user CRUD exists on backend (`GET/POST/PUT/PATCH/DELETE /api/v1/users`); zero frontend pages or components for user management. | Build a Users management page with list view, create/edit forms, delete confirmation, and permission management. Restrict to SYSTEM_ADMIN. |
| G13 | AC-04 Role Management UI | Missing UI | Full role CRUD with permission management exists on backend; no frontend UI. | Build a Roles management page (SYSTEM_ADMIN only) with role list, create/edit forms, and permission assignment. |
| G14 | AC-02 Password Change UI | Missing UI | Backend `POST /api/v1/auth/change-password` endpoint exists; no frontend form or settings page implements it. | Add a change-password form in a profile/settings page accessible to all authenticated users. |
| G15 | AC-06 Token Refresh | Missing Frontend Logic | Backend supports refresh token rotation via `POST /api/v1/auth/refresh`; frontend stores refresh token in localStorage but never uses it. `authService.refreshToken` returns mock data. `apiClient` has no refresh-on-401 interceptor. | Implement an Axios response interceptor that catches 401 errors, calls `POST /api/v1/auth/refresh` with the stored refresh token, retries the original request with the new access token, and only redirects to login if refresh also fails. |
| G16 | AC-01 Role Naming | Naming Mismatch | Backend uses `SYSTEM_ADMIN` consistently; frontend `UserRole` enum and `hasAnyRole` calls use `PLATFORM_ADMIN` throughout. This means role-based UI visibility checks (sidebar, quick actions) fail for users with the actual `SYSTEM_ADMIN` role unless both names are included. | Change all frontend references from `PLATFORM_ADMIN` to `SYSTEM_ADMIN`, or include both in every `hasAnyRole` array. The frontend `types/api.js` `UserRole` enum should match backend `RoleConstants`. |
| G17 | DLR-02 Create Dealer API | Endpoint Mismatch | Frontend `dealersService.createDealer` calls `POST /api/v1/dealers` (basic endpoint) but the wizard collects subscription plan, admin name/email, and fields that match `POST /api/v1/enhanced-dealers/create` (`DealerCreationRequestDTO`). The basic endpoint ignores subscription and admin fields. | Change frontend to call `/enhanced-dealers/create` instead of `/dealers`, or add a new frontend service method for enhanced creation. |
| G18 | DLR-01 Dealer Delete | Missing UI | Backend `DELETE /api/v1/dealers/{id}` exists (SYSTEM_ADMIN only); no delete action in the dealer list or detail pages. | Add a delete action button in `DealerDetailView` (visible only to SYSTEM_ADMIN) with confirmation dialog. |

---

## Issue Detection (22 Issues)

| # | Type | Description | Location | Suggested Fix |
|---|------|-------------|----------|---------------|
| I1 | Broken Flow | `LeadDetailView.handleTakeLead` calls `setMessage(...)` on success, but no `message` state variable is declared in the component. This would cause a runtime `ReferenceError` or silent failure in strict mode. | Frontend: `LeadDetailView.jsx` | Add `const [message, setMessage] = useState(null)` state, or replace with `toast.success(...)` notification (consistent with other success handlers in the app). |
| I2 | Missing Validation | `LeadsService.validateStatusTransition` method body is empty with a comment "allow all transitions". Any status can be set to any other status, including nonsensical transitions like `DONE → PENDING` or `ONBOARDED → DENIED`. | Backend: `LeadsService.java` | Implement a status state machine. Valid transitions: `PENDING → APPROVED/DENIED`, `APPROVED → CONTACTED`, `CONTACTED → ONBOARDED`, `ONBOARDED → DONE`. Reject invalid transitions with `IllegalStateException`. |
| I3 | Incomplete Logic | In `LeadsService.validateLead`, `request.getNotes()` from `LeadValidationRequest` is never applied to the lead entity. The notes provided during validation are lost. | Backend: `LeadsService.java` | Add `lead.setNotes(request.getNotes())` before saving the lead entity, or append to existing notes if preserving history. |
| I4 | Security | File download (`GET /leads/{id}/file`) and preview (`GET /leads/{id}/preview`) endpoints check role membership only (any of three roles), not lead ownership or assignment. Any authenticated agent can access any lead's files by ID. | Backend: `LeadsController.java` | Add `@authz.isLeadOwner(#id)` or `@authz.canAccessLead(#id)` to the `@PreAuthorize` annotations on both file endpoints, aligning with the lead detail view's authorization. |
| I5 | Dead Code | `canValidateLeads` is computed via `hasAnyRole` in `LeadsList.jsx` but is never referenced in the JSX or any conditional logic. | Frontend: `LeadsList.jsx` | Remove the unused variable, or wire it to control visibility of validation-related UI elements (e.g., a badge indicating validatable leads). |
| I6 | Stray Values | Several `hasAnyRole` arrays in `LeadsList.jsx` contain accidental trailing commas (e.g., `['PLATFORM_ADMIN', 'SALES_MANAGER', , ]`) which create `undefined` entries. While `Array.includes(undefined)` returns false for string comparisons, this is error-prone and triggers linter warnings. | Frontend: `LeadsList.jsx` | Remove trailing commas from all `hasAnyRole` arrays. |
| I7 | Unused Header | Frontend `apiClient` sends `X-Territory-Code` header (from `treadx_territory_code` localStorage). `LeadsController.createLead` accepts it as `@RequestHeader`, but the service method never uses the `territoryCode` parameter. Territory-based logic is fully commented out in the controller. | Both | Remove the `X-Territory-Code` header from `apiClient` and the `@RequestHeader` parameter from the controller, or implement territory-scoped lead creation logic. |
| I8 | Missing Validation | `PlanRequestDTO` and `SubscriptionRequestDTO` have no Jakarta Bean Validation annotations (`@NotNull`, `@NotBlank`, `@Min`, etc.). Invalid payloads (null plan name, negative price, zero max users) pass through to the service layer. | Backend: `PlanRequestDTO.java`, `SubscriptionRequestDTO.java` | Add appropriate annotations: `@NotBlank` on `planName`, `@NotNull @DecimalMin("0")` on `price`, `@NotNull @Min(1)` on `maxUsers`/`maxTireStorage`, `@NotNull` on `dealerId`/`planId` for subscriptions. |
| I9 | Dead Code | `DealerPortalService.validateSubscriptionUserLimit` is defined (checks dealer subscription's `maxUsers` vs current staff count) but is never called from `createStaffMember` or any other method. New staff can be created beyond the subscription's user limit. | Backend: `DealerPortalService.java` | Call `validateSubscriptionUserLimit` at the start of `createStaffMember` to enforce the subscription's user capacity. |
| I10 | Data Integrity | `PlanService.deletePlan` does not check for existing `Subscription` entities referencing the plan being deleted. If a plan is in use, deletion could cause foreign key violations (database error) or orphaned references. | Backend: `PlanService.java` | Before deletion, check `subscriptionRepository.existsByPlanId(planId)`. If subscriptions exist, either reject the deletion with a meaningful error or soft-delete (set `isActive = false`). |
| I11 | Validation Conflict | Zod schema in `SubscriptionPlanForm.jsx` requires `maxUsers >= 1` and `maxTireStorage >= 1`, but `defaultSubscriptionPlanRequest` in `types/api.js` sets both to `0`. When creating a new plan, the form initializes with invalid defaults, causing immediate validation errors if the user tries to submit without changing those fields. | Frontend: `SubscriptionPlanForm.jsx` / `types/api.js` | Change `defaultSubscriptionPlanRequest` defaults to `maxUsers: 1` and `maxTireStorage: 1` to match the schema, or change the Zod schema to allow `0` with `.min(0)`. |
| I12 | Sidebar Visibility | Subscription Plans sidebar entry is restricted to `PLATFORM_ADMIN` and `admin` roles only (from `routes.jsx`). SALES_MANAGER users, who can read plans via backend (`@PreAuthorize` includes SALES_MANAGER), cannot see the page in navigation. Also, `SYSTEM_ADMIN` (the actual backend role name) is not in the list. | Frontend: `routes.jsx` | Update the roles array to include `SYSTEM_ADMIN` and `SALES_MANAGER`: `['PLATFORM_ADMIN', 'SYSTEM_ADMIN', 'SALES_MANAGER', 'admin', 'manager']`. |
| I13 | Role Naming | Frontend `UserRole` enum in `types/api.js` defines `PLATFORM_ADMIN` as the admin role, but the backend role constant is `SYSTEM_ADMIN`. This causes all frontend `hasAnyRole(['PLATFORM_ADMIN', ...])` checks to fail for users who log in with the actual backend role. Workaround: legacy `'admin'` fallback is sometimes included. | Frontend: `types/api.js` | Change `UserRole.PLATFORM_ADMIN` to `UserRole.SYSTEM_ADMIN` (or add `SYSTEM_ADMIN` as a value) and update all references throughout the frontend. |
| I14 | Session Bug | On page load, `AuthContext` restores the session asynchronously via `useEffect`. The initial reducer state has `isAuthenticated: false` and `loading: false`, so `ProtectedRoute` immediately redirects to `/login` before the effect runs. This causes a visible flash. | Frontend: `AuthContext.jsx` | Set `loading: true` in the initial reducer state (or read localStorage synchronously in the initial state constructor) so `ProtectedRoute` shows a spinner until restore completes. |
| I15 | Incomplete Logout | `AuthContext.logout` only removes `treadx_token` and `treadx_user` from localStorage. It does not clear `treadx_refresh_token` or `treadx_territory_code`, leaving stale auth artifacts that could cause issues on re-login or be accessed by other code. | Frontend: `AuthContext.jsx` | Add `localStorage.removeItem('treadx_refresh_token')` and `localStorage.removeItem('treadx_territory_code')` to the logout function. |
| I16 | Security | `authService.refreshToken` returns a hardcoded mock token object (`{ token: 'mock-refreshed-token', ... }`) and never calls the backend `POST /api/v1/auth/refresh` endpoint. If any code path calls this method, it would set an invalid token. | Frontend: `authService.js` | Implement the real refresh call: `apiClient.post(API_ENDPOINTS.REFRESH, { refreshToken })` and wire it into the 401 interceptor (see Gap G15). |
| I17 | Invalid Role | `DealerCustomerController` and `VehicleController` use `PLATFORM_ADMIN` in their `@PreAuthorize("hasRole('PLATFORM_ADMIN')")` annotations. This role does not exist in `User.getAuthorities()` (which produces `ROLE_SYSTEM_ADMIN`, `ROLE_SALES_MANAGER`, etc.). No user can satisfy this check, making those endpoints unreachable. | Backend: `DealerCustomerController.java`, `VehicleController.java` | Replace `PLATFORM_ADMIN` with `SYSTEM_ADMIN` in all `@PreAuthorize` annotations on these controllers. |
| I18 | Broken Link | `Dashboard.jsx` contains a link to `/dealers/new` (e.g., "Add Dealer" shortcut), but the correct route path is `/dealers/add`. Clicking this link navigates to a non-existent route. | Frontend: `Dashboard.jsx` | Change the link `href`/`to` from `/dealers/new` to `/dealers/add`. |
| I19 | Missing Validation | `EnhancedDealerWizard.isStepValid` checks that required fields are non-empty strings but does not call `validatePostalCode`, `validatePhoneNumber`, or `validateStreetNumber` formatters/validators. Invalid formats (e.g., wrong postal code pattern) are accepted. | Frontend: `EnhancedDealerWizard.jsx` | Add format validation calls in `isStepValid` for the address and contact steps, matching the validation approach used in `LeadWizard.validateCurrentStep`. |
| I20 | Formatter Bug | `EnhancedDealerWizard` calls `handlePostalCodeChange(value)` with 1 argument (just the value), but the formatter function signature in `formatters.js` is `handlePostalCodeChange(value, onChange)` expecting 2 arguments. Without the `onChange` callback, the formatted value is never applied to form state. | Frontend: `EnhancedDealerWizard.jsx` | Fix to pass both arguments: `handlePostalCodeChange(value, (formatted) => setFormData(prev => ({ ...prev, postalCode: formatted })))`, matching how `LeadWizard` uses the formatter. |
| I21 | Naming Inconsistency | Frontend uses "Dealer" terminology everywhere (pages, components, routes, labels) and sends `userRoles` keys as `VENDOR_ADMIN`, `VENDOR_EMPLOYEE`, `VENDOR_TECHNICIAN`. Backend uses "Dealer" in code, APIs (`/dealers`), and `RoleConstants` defines `DEALER_ADMIN`, `DEALER_TECHNICIAN`. The role keys don't match, so backend `validateUserAccessManagement` rejects frontend-sent role names. | Both | Either: (a) Change backend `DealerService.isValidDealerRole` to accept `VENDOR_*` aliases, or (b) Change frontend `UserRole` enum and `UserAccessManagement` to send `DEALER_ADMIN`/`DEALER_TECHNICIAN` keys, or (c) Add a mapping layer in the API service. |
| I22 | No Route Guard | All protected routes in `App.jsx` use `ProtectedRoute` without passing a `roles` prop. `ProtectedRoute` supports role checking (shows "Access Denied" if `roles.length > 0` and user role not in list), but since `roles` is always empty/undefined, any authenticated user can access any page by typing the URL directly (e.g., a SALES_AGENT can access `/subscription-plans`). | Frontend: `App.jsx` | Pass the `roles` array from each route configuration to `ProtectedRoute` for each nested route element: `<Route element={<ProtectedRoute roles={route.roles}>}>`. This leverages the existing role arrays in `routes.jsx`. |

---

## Key Files Reference

### Backend (`treadx-main-backend/src/main/java/com/TreadX/`)

| Module | Controllers | Services | Entities | DTOs |
|--------|------------|----------|----------|------|
| Lead | `crm/leads/controller/LeadsController.java`, `LeadsHistoryController.java` | `crm/leads/service/LeadsService.java`, `LeadsHistoryService.java` | `crm/leads/entity/Leads.java`, `LeadsHistory.java` | `crm/leads/dto/LeadsRequestDTO.java`, `LeadsResponseDTO.java`, `LeadValidationRequest.java`, `LeadsHistoryRequestDTO.java` |
| Subscription | `crm/subscriptions/controller/PlanController.java`, `SubscriptionController.java` | `crm/subscriptions/service/PlanService.java`, `SubscriptionService.java` | `crm/subscriptions/entity/Plan.java`, `Subscription.java` | `crm/subscriptions/dto/PlanRequestDTO.java`, `SubscriptionRequestDTO.java` |
| Access Control | `auth/controller/AuthController.java`, `UserController.java`, `RoleController.java` | `auth/service/AuthenticationService.java`, `UserService.java`, `RoleService.java`, `SecurityExpressionService.java`, `AuthorizationService.java` | `auth/entity/User.java`, `Role.java`, `Permission.java`, `RefreshToken.java` | `auth/dto/request/LoginRequest.java`, `auth/dto/response/AuthResponse.java`, `auth/dto/UserRequestDTO.java` |
| Dealer | `dealer/management/controller/DealerController.java`, `EnhancedDealerController.java`, `DealerAuthController.java` | `dealer/management/service/DealerService.java`, `EnhancedDealerService.java`, `DealerAuthService.java`, `DealerContextService.java` | `dealer/management/entity/Dealer.java`, `DealerStaff.java`, `DealerAdminInvitationToken.java` | `dealer/management/dto/DealerRequestDTO.java`, `DealerCreationRequestDTO.java`, `DealerCreationResponseDTO.java` |

### Frontend (`treadx-admin/src/`)

| Module | Pages | Components | Services |
|--------|-------|------------|----------|
| Lead | `pages/leads/LeadsList.jsx`, `AddLead.jsx`, `EditLead.jsx`, `LeadDetail.jsx`, `LeadsApproval.jsx` | `components/leads/LeadWizard.jsx`, `LeadDetailView.jsx`, `LeadValidationModal.jsx`, `LeadContactModal.jsx`, `LeadStatusBadge.jsx` | `services/leadsApiService.js` |
| Subscription | `pages/subscription-plans/SubscriptionPlans.jsx` | `components/subscription-plans/SubscriptionPlansList.jsx`, `SubscriptionPlanForm.jsx` | `services/subscriptionPlansApiService.js` |
| Access Control | — | `components/auth/LoginForm.jsx`, `contexts/AuthContext.jsx` | `services/authService.js`, `services/apiClient.js` |
| Dealer | `pages/dealers/DealersList.jsx`, `AddDealer.jsx`, `DealerDetail.jsx`, `EditDealer.jsx` | `components/dealers/EnhancedDealerWizard.jsx`, `DealerDetailView.jsx`, `EditDealerForm.jsx`, `UserAccessManagement.jsx` | `services/dealersApiService.js` |

### Shared

| File | Purpose |
|------|---------|
| `config/routes.jsx` | Route definitions, sidebar config, role arrays |
| `App.jsx` | Route mounting, `ProtectedRoute` usage |
| `types/api.js` | `API_ENDPOINTS`, `UserRole` enum, `LeadStatus`, `BillingCycle`, default request objects |
| `utils/formatters.js` | Phone, postal code, street number formatting/validation |
| `config/development.js` | API base URL configuration |
