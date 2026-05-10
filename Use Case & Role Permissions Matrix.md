# Use Case & Role Permissions Matrix

هذا الملف يحتوي على جميع حالات الاستخدام (Use Cases) والأدوار (Roles) المسؤولة عنها لتسهيل ضبط واجهة المستخدم (UX) والصلاحيات.


## Module 1: Lead (CRM-L)

| Use Case | Responsible Roles |
| :--- | :--- |
| CRM-L01: Lead Creation | System Administrator, Sales Manager, Sales Agent |
| CRM-L02: Lead Listing & Filtering | System Administrator, Sales Manager, Sales Agent |
| CRM-L03: Lead Detail View | System Administrator, Sales Manager, Sales Agent (only if they are the lead's creator or current assignee) |
| CRM-L04: Lead Update | System Administrator, Sales Manager, Sales Agent (only if they are the lead's owner) |
| CRM-L05: Lead Validation (Approve / Deny) | System Administrator, Sales Manager |
| CRM-L06: Lead Contact Initiation | System Administrator, Sales Manager, Sales Agent |
| CRM-L07: Lead Assignment to Agent | System Administrator, Sales Manager |
| CRM-L08: Lead Self-Assignment (Take) | Sales Agent |
| CRM-L09: Lead Deletion | System Administrator, Sales Manager, Sales Agent (only if they are the lead's owner) |
| CRM-L10: Lead File Management | System Administrator, Sales Manager, Sales Agent |
| CRM-L11: Lead History Tracking | System Administrator, Sales Manager, Sales Agent |
| CRM-L12: My Leads View | System Administrator, Sales Manager, Sales Agent |

## Module 2: Subscriptions (SUB)

| Use Case | Responsible Roles |
| :--- | :--- |
| SUB-P01: Plan Management | Create / Update / Delete: System Administrator, View: System Administrator, Sales Manager |
| SUB-P02: Active Plans Listing | System Administrator, Sales Manager, Sales Agent |
| SUB-P03: Plans by User Capacity | System Administrator, Sales Manager, Sales Agent |
| SUB-S01: Subscription Creation | System Administrator, Sales Manager |
| SUB-S02: Subscription Listing & Details | System Administrator, Sales Manager |
| SUB-S03: Subscription Cancellation | System Administrator, Sales Manager |
| SUB-S04: Subscription Update & Removal | Update: System Administrator, Sales Manager, Remove: System Administrator |

## Module 3: Access Control (AC)

| Use Case | Responsible Roles |
| :--- | :--- |
| AC-01: Authentication (Login / Logout / Token Refresh) | All users (unauthenticated users for login and token refresh; authenticated users for logout) |
| AC-02: Password Change | Any authenticated user |
| AC-03: User Management | Create: System Administrator, Sales Manager (limited to creating Sales Agents only), View / Update / Delete: System Administrator |
| AC-04: Role Management | System Administrator |
| AC-05: Permission Management | System Administrator |
| AC-06: Session Restore & Token Refresh | Authenticated users |

## Module 4: Dealer (DLR)

| Use Case | Responsible Roles |
| :--- | :--- |
| DLR-01: Dealer Creation from Lead | System Administrator, Sales Manager |
| DLR-02: Full Dealer Onboarding (with Subscription & Admin Invitation) | System Administrator, Sales Manager |
| DLR-03: Dealer Update | System Administrator, Sales Manager |
| DLR-04: Dealer Listing & Search | System Administrator, Sales Manager, Sales Agent |
| DLR-05: Dealer Detail View | System Administrator, Sales Manager, Sales Agent |
| DLR-06: Dealer Initial Account Setup & Invitation | System Administrator, Sales Manager (for initiating and resending invitations), Public / Invited user (for receiving the invitation) |
| DLR-07: Dealer Account Activation | Public (the invited dealer administrator who received the activation email) |
