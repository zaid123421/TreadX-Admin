# Account Creation Technical Guide (API & Backend)

هذا الملف مخصص لاستخدامه مع **Cursor** لإنشاء واجهات المستخدم (UI) وربطها بالخلفية (Backend) لعمليات إنشاء وإدارة الحسابات.

## 1. Overview & Roles
النظام يدعم إنشاء الحسابات بناءً على الصلاحيات التالية:
- **System Administrator (SYSTEM_ADMIN):** يمتلك صلاحية كاملة لإنشاء (System Admin, Sales Manager, Sales Agent).
- **Sales Manager (SALES_MANAGER):** يمتلك صلاحية محدودة لإنشاء **Sales Agents** فقط.

---

## 2. API Endpoints for User Management

### A. Create User (إنشاء حساب جديد)
- **Endpoint:** `POST /api/v1/users`
- **Authentication:** Required (Bearer Token)
- **Roles Allowed:** `SYSTEM_ADMIN`, `SALES_MANAGER`
- **Request Body (JSON):**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123",
  "firstName": "John",
  "lastName": "Doe",
  "roleId": 2, 
  "position": "Senior Agent",
  "isActive": true,
  "permissionIds": [1, 2, 5] 
}
```
> **ملاحظة هامة للربط:** 
> - الـ `roleId` للمدير (Sales Manager) عادة ما يكون `2` وللموظف (Sales Agent) يكون `3`. يجب جلب الأدوار أولاً من الـ API المخصص للأدوار.
> - الـ `SALES_MANAGER` سيحصل على خطأ `403 Forbidden` إذا حاول إرسال `roleId` لمدير أو أدمن.

### B. List Roles (جلب قائمة الأدوار)
يجب استخدام هذا الـ API لملء قائمة الاختيار (Dropdown) في واجهة إنشاء الحساب.
- **Endpoint:** `GET /api/v1/roles`
- **Response (JSON Array):**
```json
[
  { "id": 1, "name": "SYSTEM_ADMIN", "description": "Platform Administrator" },
  { "id": 2, "name": "SALES_MANAGER", "description": "Sales Team Manager" },
  { "id": 3, "name": "SALES_AGENT", "description": "Sales Representative" }
]
```

### C. List Permissions (جلب الصلاحيات الإضافية)
- **Endpoint:** `GET /api/v1/permissions`
- **Response:** قائمة بالصلاحيات التي يمكن إضافتها للمستخدم بشكل مخصص.

---

## 3. Backend Logic & Business Rules (قواعد العمل)

| القاعدة | الوصف |
| :--- | :--- |
| **Email Uniqueness** | البريد الإلكتروني يجب أن يكون فريداً على مستوى النظام. سيعيد الـ API خطأ `409 Conflict` إذا كان مكرراً. |
| **Role Restriction** | الـ `SALES_MANAGER` لا يمكنه إنشاء مستخدم برتبة أعلى منه أو مساوية له (فقط Sales Agent). |
| **Password Encoding** | يتم تشفير كلمة المرور في الخلفية (BCrypt)، الواجهة ترسلها نصاً واضحاً (Plain Text). |
| **Default State** | الحساب الجديد يكون `isActive: true` افتراضياً ما لم يتم تحديد غير ذلك. |

---

## 4. UI/UX Implementation Guide for Cursor

عند مطالبة **Cursor** بإنشاء الواجهات، اطلب منه الالتزام بالتالي:

1. **User List Page:**
   - جدول يعرض (Name, Email, Role, Status).
   - زر "Add New User" يفتح Modal أو صفحة جديدة.
   - فلترة المستخدمين حسب الـ Role.

2. **Create User Form:**
   - حقول إجبارية: `Email`, `Password`, `First Name`, `Last Name`, `Role`.
   - حقول اختيارية: `Position`, `Additional Permissions`.
   - **Validation:** التحقق من صيغة الإيميل وقوة كلمة المرور قبل الإرسال.

3. **Role-Based Visibility:**
   - إذا كان المستخدم الحالي `SALES_MANAGER` فعند فتح قائمة الأدوار في نموذج الإنشاء، يجب إظهار خيار `SALES_AGENT` فقط أو تعطيل الخيارات الأخرى.

---

## 5. Error Handling (التعامل مع الأخطاء)
- `400 Bad Request`: بيانات ناقصة أو غير صالحة.
- `401 Unauthorized`: التوكن منتهي أو غير موجود.
- `403 Forbidden`: المستخدم يحاول إنشاء رتبة لا يملك صلاحية لها.
- `409 Conflict`: الإيميل مستخدم مسبقاً.

---
**Prepared by:** Manus AI
**Source:** FEATURE_FLOW_ANALYSIS.md (AC-03 User CRUD)
