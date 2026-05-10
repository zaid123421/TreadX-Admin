# Business-Level Feature Flow Documentation

This document describes **32 Feature Flows** across 4 modules from a Senior Product Analyst perspective. Each feature follows a standardised template covering Purpose, Actors, Preconditions, Main Flow, Alternative Flows, Validation Rules, and Outputs / State Changes.

---

## Table of Contents

- [Module 1: Lead (CRM-L) — 12 Features](#module-1-lead-crm-l--12-features)
  - [CRM-L01: Lead Creation](#crm-l01-lead-creation)
  - [CRM-L02: Lead Listing & Filtering](#crm-l02-lead-listing--filtering)
  - [CRM-L03: Lead Detail View](#crm-l03-lead-detail-view)
  - [CRM-L04: Lead Update](#crm-l04-lead-update)
  - [CRM-L05: Lead Validation (Approve / Deny)](#crm-l05-lead-validation-approve--deny)
  - [CRM-L06: Lead Contact Initiation](#crm-l06-lead-contact-initiation)
  - [CRM-L07: Lead Assignment to Agent](#crm-l07-lead-assignment-to-agent)
  - [CRM-L08: Lead Self-Assignment (Take)](#crm-l08-lead-self-assignment-take)
  - [CRM-L09: Lead Deletion](#crm-l09-lead-deletion)
  - [CRM-L10: Lead File Management](#crm-l10-lead-file-management)
  - [CRM-L11: Lead History Tracking](#crm-l11-lead-history-tracking)
  - [CRM-L12: My Leads View](#crm-l12-my-leads-view)
- [Module 2: Subscriptions (SUB) — 7 Features](#module-2-subscriptions-sub--7-features)
  - [SUB-P01: Plan Management](#sub-p01-plan-management)
  - [SUB-P02: Active Plans Listing](#sub-p02-active-plans-listing)
  - [SUB-P03: Plans by User Capacity](#sub-p03-plans-by-user-capacity)
  - [SUB-S01: Subscription Creation](#sub-s01-subscription-creation)
  - [SUB-S02: Subscription Listing & Details](#sub-s02-subscription-listing--details)
  - [SUB-S03: Subscription Cancellation](#sub-s03-subscription-cancellation)
  - [SUB-S04: Subscription Update & Removal](#sub-s04-subscription-update--removal)
- [Module 3: Access Control (AC) — 6 Features](#module-3-access-control-ac--6-features)
  - [AC-01: Authentication (Login / Logout / Token Refresh)](#ac-01-authentication-login--logout--token-refresh)
  - [AC-02: Password Change](#ac-02-password-change)
  - [AC-03: User Management](#ac-03-user-management)
  - [AC-04: Role Management](#ac-04-role-management)
  - [AC-05: Permission Management](#ac-05-permission-management)
  - [AC-06: Session Restore & Token Refresh](#ac-06-session-restore--token-refresh)
- [Module 4: Dealer (DLR) — 7 Features](#module-4-dealer-dlr--7-features)
  - [DLR-01: Dealer Creation from Lead](#dlr-01-dealer-creation-from-lead)
  - [DLR-02: Full Dealer Onboarding (with Subscription & Admin Invitation)](#dlr-02-full-dealer-onboarding-with-subscription--admin-invitation)
  - [DLR-03: Dealer Update](#dlr-03-dealer-update)
  - [DLR-04: Dealer Listing & Search](#dlr-04-dealer-listing--search)
  - [DLR-05: Dealer Detail View](#dlr-05-dealer-detail-view)
  - [DLR-06: Dealer Initial Account Setup & Invitation](#dlr-06-dealer-initial-account-setup--invitation)
  - [DLR-07: Dealer Account Activation](#dlr-07-dealer-account-activation)

---

## Module 1: Lead (CRM-L) — 12 Features

### CRM-L01: Lead Creation

**Purpose**
Allow platform users to register a new prospective business (lead) in the system, capturing essential business details, address, lead source, optional supporting documents, and automatic duplicate detection.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The user is signed in with one of the above roles.
- No existing lead shares the same combination of business name, phone number, and address.

**Main Flow**
1. The user opens the "Add Lead" page.
2. The system presents a six-step guided form:
   - **Step 1 — Business Information:** The user enters the business name (required).
   - **Step 2 — Contact:** The user enters a phone number (required, Canadian format).
   - **Step 3 — Address:** The user enters street number, street name, and postal code (all required). An apartment/unit/building number is optional.
   - **Step 4 — Lead Source:** The user selects how the lead was obtained — either "Government" or "Ads" (required). An optional source URL may be provided.
   - **Step 5 — Documents:** The user may attach a supporting document and add notes.
   - **Step 6 — Review:** The system displays a summary of all entered information.
3. The user confirms and submits the lead.
4. The system checks for an exact duplicate using the business name, street number, postal code, and phone number. If a duplicate is found, the submission is rejected and an error is displayed.
5. The system saves the lead with a status of **Pending**.
6. If the user attached a document, the system stores it alongside the lead.
7. The system runs a broader similarity check (matching on business name, phone, or address individually) and flags the lead if any partial matches are found.
8. An initial history entry is created. If the lead was created by a System Administrator or Sales Manager, the entry is marked as "added by manager."
9. The user is returned to the lead list with a success confirmation.

**Alternative Flows**
- **Duplicate detected:** The system returns a conflict error. The user sees the error on the review step and can go back to correct the information.
- **Document upload failure:** The lead is still created successfully without the attachment.
- **Form validation failure:** The system prevents the user from advancing to the next step until all required fields on the current step are completed correctly.

**Validation Rules**
| Field | Rule |
|-------|------|
| Business name | Required; cannot be blank |
| Phone number | Required; must be a valid Canadian phone number format |
| Street number, street name, postal code | Required |
| Lead source | Required; must be "Government" or "Ads" |
| Duplicate check | No existing lead may share the same business name + street number + postal code + phone number |

**Outputs / State Changes**
- A new lead record is created with status **Pending**.
- If a document was provided, it is stored and linked to the lead.
- A duplicate-similarity flag is set if partial matches exist.
- An initial history entry is recorded.

---

### CRM-L02: Lead Listing & Filtering

**Purpose**
Display a paginated, sortable, and filterable list of leads with visibility scoped to the user's role.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The user is signed in with one of the above roles.

**Main Flow**
1. The user navigates to the leads list page.
2. The system determines the user's role:
   - **Sales Agent:** The system retrieves the agent's own leads, leads assigned to them, and unassigned leads that were added by a manager (available for self-assignment).
   - **System Administrator or Sales Manager:** The system retrieves all leads in the system.
3. Results are displayed in a paginated table showing: business name, contact information, address, lead source, status, creation date, and available actions.
4. The user may filter results by:
   - **Status:** Select a specific lead status (e.g., Pending, Approved, Contacted) or view all.
   - **Search:** Enter a text term to search across business name, phone number, and notes.
   - **Source:** Filter by lead source (Government or Ads).
5. The user may sort results by any column and navigate between pages.

**Alternative Flows**
- **No matching leads:** The system displays an empty-state message ("No leads found").
- **Agent attempts to view the full unscoped list:** Access is denied; the agent is redirected to the scoped view.

**Validation Rules**
| Parameter | Rule |
|-----------|------|
| Page number | Must be zero or greater; defaults to first page |
| Page size | Must be greater than zero; defaults to 10 |
| Sort field | Defaults to creation date |
| Sort direction | Ascending or descending; defaults to descending |
| Status filter | Must be a recognised lead status value |

**Outputs / State Changes**
- No data is modified (read-only).
- The system returns a paginated result set with total counts and page metadata.

---

### CRM-L03: Lead Detail View

**Purpose**
Display the complete profile of a single lead, including its documents, contact information, history timeline, and contextual quick actions.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent (only if they are the lead's creator or current assignee)

**Preconditions**
- The lead exists in the system.
- The user has permission to view the lead (administrator, manager, or the lead's owner/assignee).

**Main Flow**
1. The user selects a lead from the list (or navigates directly by lead identifier).
2. The system loads and displays the lead across four information sections:
   - **Details:** Business name, phone number, formatted address, lead source, source URL, whether it was added by a manager, assigned agent information, and notes.
   - **Contact:** Contact method, contact details, contact person name, position, and extension. If no contact has been initiated, an empty state is shown with an "Initiate Contact" option.
   - **Documents:** A preview of any attached document with options to view full-size or download.
   - **History:** A timeline of key events — creation, last modification, validation, and assignment — with names and timestamps.
3. Based on the lead's current status and the user's role, the system presents relevant quick actions in a sidebar:
   - **Validate Lead:** Available when the lead is in **Pending** status and the user is a System Administrator or Sales Manager.
   - **Initiate Contact:** Available when the lead is **Approved** and no contact has been recorded yet.
   - **Convert to Dealer:** Available when the lead has been **Contacted**.

**Alternative Flows**
- **Access denied:** The system shows a permission-denied screen with an option to return to the leads list.
- **Lead not found:** An error state is displayed.
- **No document attached:** The documents section shows "No documents" with an empty-state message.

**Validation Rules**
- The lead identifier must be valid.
- Document preview is only available if the lead has an attached file.

**Outputs / State Changes**
- No data is modified (read-only view).

---

### CRM-L04: Lead Update

**Purpose**
Allow authorised users to edit an existing lead's details, including replacing attached documents.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent (only if they are the lead's owner)

**Preconditions**
- The lead exists in the system.
- The user has permission to edit the lead.

**Main Flow**
1. The user selects "Edit" on a lead, opening the edit page.
2. The system loads the lead's current data and pre-populates the same six-step guided form used during creation.
3. The user modifies the desired fields and advances through the steps.
4. On submission, the system saves the changes:
   - If a new document is uploaded, the previous document is removed and the new one is stored.
   - If the business name, phone number, or address fields have changed, the system re-evaluates the duplicate-similarity flag.
5. The user is returned to the lead detail view with a success confirmation.

**Alternative Flows**
- **Partial update:** A lighter-weight update can be performed that applies only the fields that were changed, leaving all others untouched.
- **Document replacement:** The old document is deleted from storage before the new one is saved.

**Validation Rules**
- Same field-level rules as lead creation (CRM-L01).
- Status transitions are currently unrestricted (all transitions are allowed).

**Outputs / State Changes**
- The lead record is updated in the system.
- The duplicate-similarity flag is recalculated if relevant fields changed.
- If a document was replaced, the old file is removed and the new file is stored.

---

### CRM-L05: Lead Validation (Approve / Deny)

**Purpose**
Allow managers and administrators to review a pending lead and either approve it for further processing or deny it.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The lead exists in the system.
- The user is a System Administrator or Sales Manager.

**Main Flow**
1. From the lead detail view, the user clicks "Validate Lead" on a lead with **Pending** status.
2. A validation dialog opens, presenting two options: **Approve** or **Deny**.
3. The user selects one of the options.
4. If denying, the user must provide a reason in the notes field. The confirm button is disabled until notes are entered.
5. The user clicks "Confirm."
6. The system updates the lead's status to **Approved** or **Denied** accordingly.
7. A new history entry is created recording who validated the lead and when.
8. The dialog closes and the lead detail view refreshes to reflect the new status.

**Alternative Flows**
- **Bulk validation from approval page:** A dedicated approval page lists all Pending leads. The user can approve or deny leads directly from this list with pre-set notes ("Approved by admin" or "Denied by admin").
- **Non-pending lead:** The system does not currently enforce that only Pending leads can be validated; any lead can technically be "validated."

**Validation Rules**
| Field | Rule |
|-------|------|
| Decision | Must be either "Approved" or "Denied" |
| Notes | Required when denying a lead (enforced on the form) |

**Outputs / State Changes**
- The lead's status changes to **Approved** or **Denied**.
- A new history entry is created with validation metadata (validator identity and timestamp).

---

### CRM-L06: Lead Contact Initiation

**Purpose**
Record the first contact attempt with a lead, capturing the method of contact and the contact person's details, and transition the lead to the "Contacted" stage.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The lead exists with a status of **Approved**.
- No contact attempt has been recorded for this lead yet.

**Main Flow**
1. From the lead detail view, the user clicks "Initiate Contact."
2. A contact dialog opens, pre-selecting "Phone" as the default contact method.
3. The user fills in:
   - **Contact method:** Phone, Mail/Email, Text, or Other (required).
   - **Contact details:** The specific phone number, email address, or other contact information used (required).
   - **Extension number:** If the method is Phone, an optional extension.
   - **Contact person name and position:** Optional fields for the person reached.
4. The user submits the form.
5. The system saves the contact information on the lead and automatically changes the lead's status to **Contacted**.
6. The dialog closes and the detail view refreshes, now showing the recorded contact information and the updated status.

**Alternative Flows**
- **Lead already contacted:** The "Initiate Contact" action is hidden since a contact method is already recorded.
- **Missing required fields:** The submit button is disabled until the contact method and contact details are filled in.

**Validation Rules**
| Field | Rule |
|-------|------|
| Contact method | Required; must be Phone, Mail/Email, Text, or Other |
| Contact details | Required; cannot be empty |
| Extension number | Optional |
| Contact person name, position | Optional |

**Outputs / State Changes**
- The lead's contact fields are populated.
- The lead's status changes to **Contacted**.

---

### CRM-L07: Lead Assignment to Agent

**Purpose**
Allow managers and administrators to assign a lead to a specific Sales Agent for follow-up.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The lead exists in the system.
- The target user exists and holds the Sales Agent role.

**Main Flow**
1. A manager or administrator selects a lead and initiates the "Assign Agent" action.
2. The system presents a list of available Sales Agents.
3. The user selects the desired agent and confirms the assignment.
4. The system verifies that the selected user holds the Sales Agent role.
5. A new history entry is created recording the assignment — who was assigned, when, and the existing "added by manager" flag is carried over.
6. The lead is now associated with the chosen agent.

**Alternative Flows**
- **Selected user is not a Sales Agent:** The system rejects the assignment with an error message.
- **Lead not found:** The system returns a "not found" error.
- **Unauthorised user:** Access is denied.

**Validation Rules**
| Parameter | Rule |
|-----------|------|
| Lead | Must reference an existing lead |
| Agent | Must reference an existing user with the Sales Agent role |

**Outputs / State Changes**
- A new history entry is created recording the assignment details.
- The lead is now visible to the assigned agent in their "My Leads" view.

---

### CRM-L08: Lead Self-Assignment (Take)

**Purpose**
Allow a Sales Agent to claim an unassigned lead that was created by a manager, making themselves the responsible agent.

**Actors**
- Sales Agent

**Preconditions**
- The lead exists in the system.
- The lead was originally added by a manager (System Administrator or Sales Manager).
- The lead is not currently assigned to any agent.

**Main Flow**
1. In the leads list, a "Take" button appears on leads that were added by a manager and have no assigned agent. This button is visible only to Sales Agents.
2. The agent clicks "Take."
3. The system verifies that the lead was indeed added by a manager and is unassigned.
4. A new history entry is created, recording the agent as the assignee.
5. The lead now appears as the agent's own lead in their "My Leads" view.
6. The lead list refreshes.

**Alternative Flows**
- **Lead is already assigned:** The system denies the action; the "Take" button should not appear for assigned leads.
- **Lead was not added by a manager:** The system denies the action.

**Validation Rules**
- The requesting user must hold the Sales Agent role.
- The lead must be manager-added and currently unassigned.

**Outputs / State Changes**
- A new history entry records the self-assignment.
- The lead becomes associated with the claiming agent.

---

### CRM-L09: Lead Deletion

**Purpose**
Remove a lead and its associated data from the system.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent (only if they are the lead's owner)

**Preconditions**
- The lead exists in the system.
- The user has permission to delete the lead.

**Main Flow**
1. The user selects "Delete" on a lead, either from the leads list or the detail view.
2. A confirmation prompt is displayed.
3. Upon confirmation, the system permanently deletes the lead and its entire history.
4. The user is returned to the leads list with a success confirmation.

**Alternative Flows**
- **Lead not found:** The system returns a "not found" error.
- **Unauthorised deletion:** If the user lacks sufficient permissions, access is denied.

**Validation Rules**
- The lead must exist.
- The user must have the appropriate role or be the lead's owner.

**Outputs / State Changes**
- The lead record and all associated history entries are permanently removed.
- Note: Any attached documents are not automatically deleted from file storage.

---

### CRM-L10: Lead File Management

**Purpose**
Allow users to preview and download documents attached to a lead.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The lead exists and has an attached document.

**Main Flow**
1. The user opens the lead detail view and navigates to the "Documents" section.
2. The system automatically loads and displays an inline preview of the attached document.
3. The user may click "Preview" to open the document in a full-size view in a new browser tab.
4. The user may click "Download" to save the document to their device. The system determines the appropriate file name and extension based on the document's type.

**Alternative Flows**
- **No document attached:** The documents section displays a "No documents" message.
- **Unrecognised file type:** The downloaded file defaults to a generic extension.

**Validation Rules**
- The lead must have an attached file.
- Access is restricted to authenticated users with one of the three sales platform roles.

**Outputs / State Changes**
- No data is modified (read-only file access).

---

### CRM-L11: Lead History Tracking

**Purpose**
Maintain and display an audit trail of all significant events in a lead's lifecycle.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The lead exists in the system.

**Main Flow**
1. History entries are automatically created by the system during the following events:
   - **Lead creation:** Records the creator and whether the lead was added by a manager.
   - **Lead validation:** Records who approved or denied the lead and when.
   - **Lead assignment:** Records which agent was assigned and when.
   - **Lead self-assignment (take):** Records which agent claimed the lead.
2. History entries may also be created manually via a direct request, allowing authorised users to add supplemental records.
3. When viewing a lead, the "History" section displays all events in reverse chronological order as a timeline, showing:
   - Creation event with the creator's name and timestamp.
   - Last modification event (if the lead has been updated since creation).
   - Validation event with the validator's name and timestamp.
   - Assignment event with the assignee's name and timestamp.
4. Individual history entries can be retrieved by their identifier.

**Alternative Flows**
- **No events beyond creation:** Only the initial creation entry is displayed.

**Validation Rules**
| Field | Rule |
|-------|------|
| Lead reference | Required; must point to an existing lead |
| Validated-by reference | Optional; resolved to a user if provided |
| Assigned-to reference | Optional; resolved to a user if provided |

**Outputs / State Changes**
- History entries are created or retrieved.
- The most recent history entry (by chronological order) is treated as the "current" state for assignment and flag purposes.

---

### CRM-L12: My Leads View

**Purpose**
Provide Sales Agents with a consolidated view of leads they are responsible for — including leads they created, leads assigned to them, and unassigned manager-added leads they can claim.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The user is signed in.

**Main Flow**
1. When a Sales Agent views the leads list, the system automatically switches to the "My Leads" mode.
2. The system assembles the agent's lead pool from three sources:
   - Leads the agent created themselves.
   - Leads that a manager added and left unassigned (available for self-assignment).
   - Leads explicitly assigned to the agent.
3. Duplicate entries are removed and the combined results are paginated.
4. For System Administrators and Sales Managers, the "My Leads" view returns all leads (equivalent to the full list).
5. An individual lead can also be retrieved from this view by its identifier.

**Alternative Flows**
- **No leads in scope:** The system displays an empty table.

**Validation Rules**
- Standard pagination parameters apply (same as CRM-L02).
- The user's identity is determined from their active session, not from the request.

**Outputs / State Changes**
- No data is modified (read-only).
- Returns a combined, de-duplicated view of the agent's actionable leads.

---

## Module 2: Subscriptions (SUB) — 7 Features

### SUB-P01: Plan Management

**Purpose**
Create, view, update, and remove subscription plans that define the service tiers available to dealers. Plans specify pricing, billing frequency, user capacity, tire storage limits, and included features.

**Actors**
- Create / Update / Delete: System Administrator
- View: System Administrator, Sales Manager

**Preconditions**
- The user is signed in with the appropriate role.

**Main Flow**

**Creating a Plan:**
1. The user navigates to the subscription plans page.
2. The user clicks "Add Plan," opening a plan form dialog.
3. The user fills in:
   - **Plan name** (1–100 characters, required).
   - **Description** (1–500 characters, required).
   - **Price** (must be zero or greater, required).
   - **Billing cycle** — Monthly, Quarterly, or Yearly (required).
   - **Maximum tire storage** (must be at least 1, required).
   - **Maximum users** (must be at least 1, required).
   - **Active status** (on or off).
   - **Features** — a list of feature descriptions (each must be non-empty).
4. The user submits the form.
5. The system checks that no other plan exists with the same name. If a duplicate is found, the creation is rejected.
6. The system saves the new plan.

**Viewing a Plan:**
- A single plan's full details can be retrieved by its identifier.

**Updating a Plan:**
1. The user clicks "Edit" on an existing plan row, opening the form pre-populated with current values.
2. The user modifies the desired fields and submits.
3. The system saves the changes. (Note: duplicate name checking is not enforced on update.)

**Deleting a Plan:**
1. The user clicks "Delete" on a plan row.
2. A confirmation dialog appears.
3. Upon confirmation, the system removes the plan. (Note: the system does not currently check whether any active subscriptions reference this plan.)

**Alternative Flows**
- **Duplicate plan name on creation:** The system returns an error and the form remains open.
- **Plan not found:** The system returns a "not found" error.

**Validation Rules**
| Field | Rule |
|-------|------|
| Plan name | Required; 1–100 characters; must be unique (on creation) |
| Description | Required; 1–500 characters |
| Price | Required; must be zero or greater |
| Billing cycle | Required; must be Monthly, Quarterly, or Yearly |
| Maximum tire storage | Required; must be at least 1 |
| Maximum users | Required; must be at least 1 |
| Features | Each feature description must be non-empty |

**Outputs / State Changes**
- A plan record is created, updated, or removed.
- The plans list refreshes automatically after any change.

---

### SUB-P02: Active Plans Listing

**Purpose**
Display only the subscription plans that are currently active, typically used when selecting a plan during dealer onboarding.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The user is signed in with one of the above roles.

**Main Flow**
1. The system retrieves all plans marked as active, with pagination support.
2. Results are displayed in a paginated list showing plan name, pricing, billing cycle, and feature summary.

**Alternative Flows**
- **No active plans:** An empty result set is returned.

**Validation Rules**
- Standard pagination parameters apply.

**Outputs / State Changes**
- No data is modified (read-only).

---

### SUB-P03: Plans by User Capacity

**Purpose**
Find active subscription plans that support at least a specified number of users, enabling plan recommendations based on a dealer's size.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The user is signed in.

**Main Flow**
1. The user (or the system on behalf of the user) specifies the minimum number of users required.
2. The system returns all active plans whose maximum user capacity meets or exceeds the requested count.

**Alternative Flows**
- **No matching plans:** An empty list is returned.

**Validation Rules**
| Parameter | Rule |
|-----------|------|
| User count | Required; must be a whole number |

**Outputs / State Changes**
- No data is modified (read-only).

---

### SUB-S01: Subscription Creation

**Purpose**
Create a subscription that links a specific dealer to a subscription plan, establishing the billing period and payment details.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The dealer exists in the system and does not already have an active subscription.
- The selected plan exists and is currently active.

**Main Flow**
1. The user (or an automated process during dealer onboarding) specifies the dealer, the plan, the start date, end date, and amount paid.
2. The system verifies:
   - The dealer exists.
   - The selected plan is active. If the plan is inactive, the request is rejected.
   - The dealer does not already hold an active subscription. If one exists, the request is rejected.
3. The system creates the subscription with a status of **Active**. If no start date is provided, today's date is used. Auto-renewal defaults to on if not specified.
4. During dealer onboarding, the system automatically calculates the end date based on the plan's billing cycle: one month for Monthly, three months for Quarterly, or one year for Yearly.

**Alternative Flows**
- **Dealer already has an active subscription:** The system rejects the request with a conflict error.
- **Plan is inactive:** The system rejects the request.
- **Dealer not found:** The system returns a "not found" error.

**Validation Rules**
| Field | Rule |
|-------|------|
| Dealer | Required; must reference an existing dealer |
| Plan | Required; must reference an active plan |
| Start date | Optional; defaults to today |
| End date | Required (unless created through the onboarding flow, where it is calculated) |
| Amount paid | Required |
| Auto-renewal | Optional; defaults to on |

**Outputs / State Changes**
- A new subscription record is created with status **Active**.
- The dealer is linked to the selected plan for the specified billing period.

---

### SUB-S02: Subscription Listing & Details

**Purpose**
View all subscriptions in the system or view subscriptions associated with a specific dealer.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The user is signed in with the appropriate role.

**Main Flow**
1. The system provides several viewing options:
   - **All subscriptions:** A paginated list of every subscription in the system.
   - **Single subscription:** Full details for a specific subscription by its identifier.
   - **By dealer:** All subscriptions (current and past) for a specific dealer.
   - **Active subscription for a dealer:** The dealer's currently active subscription only.
2. Each subscription record includes: dealer name, plan name, status, billing period (start and end dates), amount paid, auto-renewal setting, and cancellation details (if applicable).

**Alternative Flows**
- **No subscriptions found:** An empty list is returned.
- **No active subscription for the dealer:** A "not found" response is returned.

**Validation Rules**
- Standard pagination parameters for list views.
- Dealer and subscription identifiers must be valid.

**Outputs / State Changes**
- No data is modified (read-only).

---

### SUB-S03: Subscription Cancellation

**Purpose**
Cancel an active subscription, recording the cancellation date and an optional reason.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The subscription exists in the system.

**Main Flow**
1. The user selects a subscription and initiates cancellation.
2. The user may optionally provide a cancellation reason.
3. The system updates the subscription:
   - Status changes to **Cancelled**.
   - The cancellation date is set to today.
   - The cancellation reason is recorded (if provided).
4. The subscription details refresh to reflect the cancellation.

**Alternative Flows**
- **Already cancelled subscription:** The system currently allows re-cancellation, overwriting the previous cancellation date and reason.

**Validation Rules**
| Parameter | Rule |
|-----------|------|
| Subscription | Must reference an existing subscription |
| Reason | Optional free-text |

**Outputs / State Changes**
- The subscription's status changes to **Cancelled**.
- Cancellation date and reason are recorded.

---

### SUB-S04: Subscription Update & Removal

**Purpose**
Modify the details of an existing subscription or permanently remove a subscription from the system.

**Actors**
- Update: System Administrator, Sales Manager
- Remove: System Administrator

**Preconditions**
- The subscription exists in the system.

**Main Flow**

**Update:**
1. The user modifies one or more subscription fields:
   - **Plan:** If a new plan is selected, it must be active. The subscription is reassigned to the new plan.
   - **Start date, end date, amount paid, auto-renewal:** Any of these may be changed.
2. The system saves the updated fields. Fields not included in the request remain unchanged.
3. Note: The dealer association and subscription status cannot be changed through this operation.

**Remove:**
1. A System Administrator selects a subscription for removal.
2. The system permanently deletes the subscription record.

**Alternative Flows**
- **New plan is inactive:** The system rejects the update with a conflict error.
- **Subscription not found:** The system returns a "not found" error.

**Validation Rules**
- All update fields are optional (only changed fields need to be provided).
- If a new plan is specified, it must be active.
- Removal only checks that the subscription exists.

**Outputs / State Changes**
- The subscription record is updated or permanently removed.

---

## Module 3: Access Control (AC) — 6 Features

### AC-01: Authentication (Login / Logout / Token Refresh)

**Purpose**
Authenticate users by verifying their credentials, establish a secure session, and provide mechanisms to end the session or extend it without re-entering credentials.

**Actors**
- All users (unauthenticated users for login and token refresh; authenticated users for logout)

**Preconditions**
- **Login:** Valid user credentials exist in the system.
- **Token refresh:** A valid, non-revoked refresh token exists.
- **Logout:** The user is currently signed in.

**Main Flow**

**Login:**
1. The user opens the login page and enters their email address and password.
2. The system checks for excessive login attempts from the user's network address. If the rate limit is exceeded, the login attempt is blocked.
3. The system verifies the credentials:
   - The email must match an existing user account.
   - The account must be active and not a system-reserved account.
   - The password must match.
4. The system determines the user's organisational context:
   - If the user is a dealer staff member, the context is set to the dealer's organisation.
   - Otherwise, the context is set to the central platform.
5. The system issues a short-lived access credential (valid for 15 minutes by default) and a long-lived refresh credential (valid for 7 days). All previously issued refresh credentials for this user are revoked.
6. The user's session is established in the application, storing the access credential, user profile, and role information.
7. The user is redirected based on their role:
   - Sales Manager or Sales Agent → Leads page.
   - Others → Dashboard.

**Logout:**
1. The user initiates logout.
2. The application clears the stored access credential and user profile from the local session.
3. The user is returned to the login page.
4. Note: The server-side refresh credential is not currently revoked during logout from the application.

**Token Refresh:**
1. When the access credential is about to expire, the system can request a new one using the stored refresh credential.
2. The system validates the refresh credential (not revoked, not expired) and issues a fresh access credential.
3. Note: This automatic refresh is supported by the server but is not currently integrated into the application's session management.

**Alternative Flows**
- **Rate limited:** The user sees a "too many attempts" error and must wait before trying again.
- **Invalid credentials:** The user sees an "invalid email or password" error.
- **Inactive account:** The user sees an authentication error.
- **Session expired:** If any request fails due to an expired credential, the user is signed out and redirected to the login page.

**Validation Rules**
| Field | Rule |
|-------|------|
| Email | Required; must be a valid email format |
| Password | Required |

**Outputs / State Changes**
- **Login:** Access and refresh credentials are issued; the user's session is established.
- **Logout:** Local session data is cleared.
- **Token refresh:** A new access credential is issued; the refresh credential remains unchanged.

---

### AC-02: Password Change

**Purpose**
Allow an authenticated user to change their own password.

**Actors**
- Any authenticated user

**Preconditions**
- The user is signed in.
- The user knows their current password.

**Main Flow**
1. The user submits their current password along with a new password.
2. The system verifies that the current password matches the stored credential.
3. The system securely encodes and saves the new password.
4. All existing refresh credentials for the user are revoked, requiring the user to sign in again on any other device.

**Alternative Flows**
- **Incorrect current password:** The system returns an error; the password is not changed.

**Validation Rules**
| Field | Rule |
|-------|------|
| Current password | Required; must match the user's existing password |
| New password | Required |

**Outputs / State Changes**
- The user's password is updated.
- All refresh credentials are revoked (the user must re-authenticate on other sessions).

---

### AC-03: User Management

**Purpose**
Manage platform user accounts — create new users, view existing users, update user details, and remove accounts.

**Actors**
- Create: System Administrator, Sales Manager (limited to creating Sales Agents only)
- View / Update / Delete: System Administrator

**Preconditions**
- The user has the appropriate role for the operation.

**Main Flow**

**List Users:**
- A System Administrator retrieves a list of all platform users.

**View User:**
- A System Administrator retrieves the full profile of a specific user by their identifier.

**View Own Profile:**
- Any authenticated user can retrieve their own profile information.

**Create User:**
1. The user provides: first name, last name, email, password, role, and optionally additional permissions.
2. The system checks that the email is not already in use.
3. The system enforces role-based restrictions:
   - A System Administrator cannot create a second super-administrator account.
   - A Sales Manager can only create users with the Sales Agent role.
4. The system creates the account with a securely encoded password and the assigned role.

**Update User:**
- A System Administrator can modify a user's email (with uniqueness check), name, role, position, and active status.

**Partial Update:**
- Same as a full update, but only the provided fields are changed; all others remain untouched.

**Delete User:**
- A System Administrator can permanently remove a user account.

**Alternative Flows**
- **Duplicate email:** The system returns an error on creation or update.
- **Sales Manager tries to create a non-agent user:** The system rejects the request.

**Validation Rules**
| Field | Rule |
|-------|------|
| Email | Required; must be unique across the platform |
| First name, last name | Required |
| Password | Required when creating a new user |
| Role | Required |
| Active status | Defaults to active |

**Outputs / State Changes**
- User accounts are created, updated, or removed.

---

### AC-04: Role Management

**Purpose**
Manage the roles that govern what actions users can perform, including the permissions associated with each role.

**Actors**
- System Administrator

**Preconditions**
- The user is a System Administrator.

**Main Flow**

**List Roles:**
- The system returns all defined roles.

**View Role:**
- The system returns the details of a specific role, including its name, active status, and whether it is a system-protected role.

**Create Role:**
1. The administrator provides a role name, active status, and a set of permissions to assign.
2. The system creates the role and links the specified permissions.

**Update Role:**
- The administrator modifies the role's name or active status.

**Delete Role:**
- The administrator removes a role from the system.

**View Role Permissions:**
- The system returns the list of permission names associated with a specific role.

**Update Role Permissions:**
1. The administrator provides a new set of permissions for a role.
2. The system replaces the role's current permissions with the new set.
3. System-protected roles cannot have their permissions modified through this operation.

**Alternative Flows**
- **Attempt to modify a system-protected role's permissions:** The system rejects the request.

**Validation Rules**
| Field | Rule |
|-------|------|
| Role name | Required; must be unique |
| Active status | Required |
| Permissions | A set of valid permission identifiers |

**Outputs / State Changes**
- Roles are created, updated, or removed.
- Permission associations are managed.

---

### AC-05: Permission Management

**Purpose**
View and modify the additional permissions granted to an individual user beyond what their assigned role provides.

**Actors**
- System Administrator

**Preconditions**
- The target user exists in the system.

**Main Flow**
1. The administrator selects a user and provides a new set of additional permission identifiers.
2. The system replaces the user's current additional permissions with the new set.
3. The user's effective permissions are now the combination of their role's built-in permissions plus these additional permissions.

**Viewing permissions:**
- A user's current additional permissions are included when viewing their profile.

**Alternative Flows**
- **Invalid permission identifiers:** Unrecognised permission identifiers are silently ignored.

**Validation Rules**
- Permission identifiers must be provided as a set of valid references.

**Outputs / State Changes**
- The user's additional permissions are updated.
- The user's effective access rights = role permissions + additional permissions.

---

### AC-06: Session Restore & Token Refresh

**Purpose**
Restore a user's session automatically when the application is reloaded, and extend sessions by refreshing expired access credentials.

**Actors**
- Authenticated users

**Preconditions**
- **Session restore:** A valid access credential and user profile are stored locally from a previous session.
- **Token refresh:** A valid refresh credential exists.

**Main Flow**

**Session Restore:**
1. When the application loads, the system checks for a previously stored access credential and user profile in local storage.
2. If both are found and the user profile is valid:
   - The session is re-established using the stored data.
   - The user proceeds to their intended page without needing to log in again.
3. If the stored data is missing or corrupted:
   - The local storage is cleared.
   - The user is redirected to the login page.

**Token Refresh (server-supported):**
1. The server accepts the current refresh credential and verifies it is valid (not revoked, not expired).
2. A new access credential is issued.
3. The same refresh credential is returned (it is not rotated).
4. Note: The application does not currently implement automatic token refresh. When an access credential expires, the user is signed out and must log in again.

**Alternative Flows**
- **Expired access credential with valid refresh credential:** The server would issue a new access credential, but the application currently does not call this flow — the user is logged out instead.
- **Corrupted local data:** The restore fails silently and the user is redirected to login.

**Validation Rules**
- Session restore requires a parseable user profile in local storage.
- Token refresh requires a non-revoked, non-expired refresh credential.

**Outputs / State Changes**
- **Session restore:** The user's authentication state is rehydrated from local storage.
- **Token refresh:** A new access credential is issued (server-side only; not wired in the application).

---

## Module 4: Dealer (DLR) — 7 Features

### DLR-01: Dealer Creation from Lead

**Purpose**
Convert a lead that has reached the "Contacted" stage into a formal dealer entity in the system.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The source lead exists with a status of **Contacted**.
- The user is a System Administrator or Sales Manager.

**Main Flow**
1. The user initiates dealer creation, referencing the source lead.
2. The system verifies:
   - The referenced lead exists.
   - The lead's status is **Contacted**. If not, the request is rejected with a conflict error.
3. If user access configuration is provided, the system validates:
   - The total number of users must be greater than zero.
   - Each specified role must be either Dealer Administrator or Dealer Technician.
   - The sum of users across all roles must equal the declared total.
4. The system creates the dealer record and saves it.
5. A unique dealer identifier is generated (a numeric code) and assigned to the dealer.
6. The source lead's status is updated to **Onboarded**.
7. The system returns the newly created dealer details.

**Alternative Flows**
- **Lead is not in "Contacted" status:** The system returns a conflict error.
- **Invalid user role configuration:** The system returns a validation error (e.g., unrecognised role name, mismatched totals).
- **Lead not found:** The system returns a "not found" error.

**Validation Rules**
| Field | Rule |
|-------|------|
| Source lead | Required; must reference a lead with "Contacted" status |
| Legal name, business name | Provided in the request |
| Total users | If specified, must be greater than zero |
| User roles | Each role must be "Dealer Administrator" or "Dealer Technician"; the sum of role counts must equal the total users |

**Outputs / State Changes**
- A new dealer record is created with a system-generated unique identifier.
- The source lead's status changes to **Onboarded**.

---

### DLR-02: Full Dealer Onboarding (with Subscription & Admin Invitation)

**Purpose**
Create a new dealer along with an active subscription and an initial administrator invitation, all in a single operation. This is the primary onboarding workflow that converts a contacted lead into a fully set-up dealer organisation.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The source lead exists with a status of **Contacted**.
- The selected subscription plan exists and is active.

**Main Flow**
1. The user opens the "Add Dealer" page (or clicks "Convert to Dealer" from a lead's detail view, which pre-selects the lead).
2. The system presents a multi-step guided form:
   - **Select Lead** (if not pre-selected): Displays all leads with "Contacted" status, with search and pagination. The user selects one.
   - **Business Information:** The user enters the legal name and business name (pre-filled from the lead if available).
   - **Contact Information:** The user enters the email and phone number (pre-filled from the lead if available).
   - **Address:** The user enters the street number, street name, apartment/unit/building (optional), and postal code.
   - **User Access:** The user specifies the total number of users and per-role breakdown.
   - **Review:** The system displays a summary of all entered information including the selected subscription plan and dealer administrator details.
3. The user submits the form.
4. The system executes the following steps atomically (all succeed or all are rolled back):
   - **a. Create dealer:** The dealer record is created from the lead, a unique identifier is generated, and the lead's status changes to **Onboarded**.
   - **b. Create subscription:** The system loads the selected plan, calculates the subscription end date based on the billing cycle (one month for Monthly, three months for Quarterly, one year for Yearly), and creates an **Active** subscription with the plan's price as the amount paid.
   - **c. Invite dealer administrator:** An inactive user account is created for the specified administrator (first name, last name, email). A staff record is created linking this user to the dealer with "Owner" access. A secure, time-limited invitation token is generated and an activation email is sent to the administrator's email address.
5. The system returns a confirmation including dealer details, subscription information, and onboarding status.

**Alternative Flows**
- **Plan is inactive:** The system rejects the request with a conflict error.
- **Administrator email already in use by an active staff member:** The system returns a conflict error.
- **Email delivery is disabled:** The activation link is recorded in the system log for manual sharing.

**Validation Rules**
| Field | Rule |
|-------|------|
| Source lead | Required |
| Legal name, business name, email | Required; cannot be blank |
| Subscription plan | Required; must reference an active plan |
| Administrator first name, last name, email | Required |

**Outputs / State Changes**
- A new dealer record is created with a unique identifier.
- The source lead's status changes to **Onboarded**.
- A new subscription is created with **Active** status linked to the selected plan.
- An inactive user account is created for the dealer's administrator.
- A staff record is created with "Owner" access level.
- A hashed invitation token is stored with an expiry period (default: 24 hours).
- An activation email is sent to the dealer administrator.

---

### DLR-03: Dealer Update

**Purpose**
Modify an existing dealer's profile information.

**Actors**
- System Administrator
- Sales Manager

**Preconditions**
- The dealer exists in the system.

**Main Flow**

**Full Update:**
1. The user navigates to the dealer's edit page.
2. The system loads the dealer's current information and pre-populates the edit form with: legal name, business name, street number, street name, apartment/unit/building, postal code, email, phone number, and status (Active or Inactive).
3. Input formatting is applied automatically for street numbers, postal codes, and phone numbers.
4. The user modifies the desired fields and submits.
5. The system saves all fields from the form, overwriting the existing values.
6. The user is returned to the dealer detail view with a success confirmation.

**Partial Update:**
- Only the fields included in the request are updated; all others remain unchanged.

**Alternative Flows**
- **Dealer not found:** The system returns a "not found" error.

**Validation Rules**
- Several fields are required on the form (legal name, business name, etc.).
- Input formatting rules are applied for phone numbers, postal codes, and street numbers.

**Outputs / State Changes**
- The dealer record is updated with the new information.

---

### DLR-04: Dealer Listing & Search

**Purpose**
Display a paginated list of dealers with the ability to search by text and filter by status.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The user is signed in with one of the above roles.

**Main Flow**
1. The user navigates to the dealers list page.
2. The system retrieves and displays dealers in a paginated table showing: business name (with legal name), unique dealer identifier, contact information (email and phone), status indicator, and a "View" action.
3. The user may filter results by:
   - **Text search:** Searching across legal name, business name, email, and phone number (case-insensitive).
   - **Status:** Filtering by Active or Inactive, or viewing all.
4. The user applies filters by pressing Enter or clicking "Apply Filters."
5. Pagination controls appear when results span multiple pages.

**Alternative Flows**
- **No dealers found:** The table displays an empty state.

**Validation Rules**
| Parameter | Rule |
|-----------|------|
| Page number | Defaults to first page |
| Page size | Defaults to 10 |
| Status filter | Must be "Active" or "Inactive" (or all) |
| Search query | Non-empty text string |

**Outputs / State Changes**
- No data is modified (read-only).

---

### DLR-05: Dealer Detail View

**Purpose**
Display comprehensive information about a single dealer.

**Actors**
- System Administrator
- Sales Manager
- Sales Agent

**Preconditions**
- The dealer exists in the system.

**Main Flow**
1. The user selects a dealer from the list (or navigates directly by identifier).
2. The system loads and displays the dealer profile:
   - **Header:** Business name and status indicator (Active / Inactive).
   - **Details grid:** Legal name, email address, phone number (formatted), full address (with formatted postal code), and the unique dealer identifier.
   - **User access configuration** (if applicable): If user access settings were defined during onboarding, the system displays the total user count and a breakdown by role (Dealer Administrator, Dealer Technician, etc.) with appropriate labels and icons.
3. The user may navigate back to the dealers list.

**Alternative Flows**
- **Dealer not found:** An error state is displayed.
- **No user access configuration:** The user access section is hidden.

**Validation Rules**
- The dealer identifier must be valid.

**Outputs / State Changes**
- No data is modified (read-only).

---

### DLR-06: Dealer Initial Account Setup & Invitation

**Purpose**
Create an initial administrator account for a dealer and send an activation invitation via email, enabling the dealer's designated administrator to set their password and start using the system.

**Actors**
- System Administrator, Sales Manager (for initiating and resending invitations)
- Public / Invited user (for receiving the invitation)

**Preconditions**
- The dealer exists in the system.
- No active administrator with the same email is already linked to the dealer (unless resending).

**Main Flow**

**Initial Setup:**
1. During dealer onboarding (or via a standalone request), the system receives the dealer's identifier and the administrator's first name, last name, and email address.
2. The system performs conflict checks:
   - Is there already an active staff member with this email for this dealer?
   - Is there already a Dealer Administrator for this dealer (with a different email)?
   - Does a user with this email already exist globally but without a link to this dealer?
   - Is there already an unused, valid invitation token for this dealer and email?
3. If all checks pass, the system:
   - Creates (or locates) an inactive user account with the Dealer Administrator role.
   - Creates a staff record linking the user to the dealer with "Owner" access level and a default district code.
   - Generates a secure invitation token, stores its hashed value with an expiry period (default: 24 hours), and sends an activation email containing a link with the raw token.
4. The system returns a confirmation indicating the account is in its initial ("pending activation") state.

**Resend Invitation:**
1. A System Administrator or Sales Manager requests to resend an invitation for a specific dealer and email.
2. The system revokes all existing valid tokens for that dealer and email combination.
3. A new invitation token is generated and a fresh activation email is sent.

**Alternative Flows**
- **Email delivery disabled:** The activation link is logged for manual distribution.
- **Duplicate administrator conflict:** The system returns an error explaining the conflict.
- **Valid token already exists (and not resending):** The system returns an error to prevent accidental duplicate invitations.

**Validation Rules**
| Field | Rule |
|-------|------|
| Dealer | Must reference an existing dealer (by unique identifier) |
| Administrator first name, last name | Required; cannot be blank |
| Administrator email | Must not belong to an active staff member of another dealer |

**Outputs / State Changes**
- An inactive user account is created (or an existing one is reused).
- A staff record is created linking the user to the dealer.
- A hashed invitation token is stored with an expiry period.
- An activation email is sent to the administrator.
- When resending, previous tokens are revoked before issuing a new one.

---

### DLR-07: Dealer Account Activation

**Purpose**
Allow an invited dealer administrator to set their password and activate their account, completing the onboarding process.

**Actors**
- Public (the invited dealer administrator who received the activation email)

**Preconditions**
- The administrator has received a valid activation email.
- The invitation token has not expired, has not been used, and has not been revoked.

**Main Flow**
1. The invited administrator clicks the activation link in their email, which contains a unique token.
2. The administrator is presented with a form to set their new password.
3. The administrator enters a password (minimum 8 characters) and submits.
4. The system validates the token:
   - The token must match a stored (hashed) invitation record.
   - The token must not have been revoked.
   - The token must not have been previously used.
   - The token must not have expired.
5. If all checks pass:
   - The administrator's password is securely encoded and saved.
   - The user account is activated (marked as active).
   - The invitation token is marked as used and revoked.
6. The administrator can now sign in to the dealer application using their email and newly set password.

**Alternative Flows**
- **Token expired:** The system returns an error indicating the invitation has expired. The administrator must request a new invitation.
- **Token already used:** The system returns an error indicating the account has already been activated.
- **Token not found or revoked:** The system returns a "not found" error.

**Validation Rules**
| Field | Rule |
|-------|------|
| Token | Required; must correspond to a valid, unused, non-revoked, non-expired invitation |
| New password | Required; minimum 8 characters |

**Outputs / State Changes**
- The user's password is set and the account is activated.
- The invitation token is marked as used and revoked, preventing reuse.
- The dealer administrator can now sign in to the system.
