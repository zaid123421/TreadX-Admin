import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Shield, Plus, Trash2, AlertTriangle, ShieldCheck, Settings2 } from 'lucide-react';

// 🎨 قاموس الألوان المتباينة والمتطابقة بالكامل مع الـ Dark Mode (أحمر، برتقالي، أصفر، أخضر، أزرق، نهدي)
const ROLE_COLOR_MAP = {
  SYSTEM_ADMIN: {
    border: "border-red-500/20 hover:border-red-500/40",
    bg: "bg-red-500/5",
    text: "text-red-400",
    icon: "text-red-500"
  },
  DEALER_ADMIN: {
    border: "border-orange-500/20 hover:border-orange-500/40",
    bg: "bg-orange-500/5",
    text: "text-orange-400",
    icon: "text-orange-500" // متناسق مع الـ Deep Saffron بالهوية البراندية
  },
  SALES_MANAGER: {
    border: "border-amber-500/20 hover:border-amber-500/40",
    bg: "bg-amber-500/5",
    text: "text-amber-400",
    icon: "text-amber-500" // تدرج الأصفر الذهبي
  },
  DEALER_TECHNICIAN: {
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    bg: "bg-emerald-500/5",
    text: "text-emerald-400",
    icon: "text-emerald-500"
  },
  WAREHOUSE_MANAGER: {
    border: "border-sky-500/20 hover:border-sky-500/40",
    bg: "bg-sky-500/5",
    text: "text-sky-400",
    icon: "text-sky-500" // الأزرق اللوجستي للهوية البصرية
  },
  WAREHOUSE_STAFF: {
    border: "border-blue-500/20 hover:border-blue-500/40",
    bg: "bg-blue-500/5",
    text: "text-blue-400",
    icon: "text-blue-500" // أزرق متباين إضافي
  },
  SALES_AGENT: {
    border: "border-purple-500/20 hover:border-purple-500/40",
    bg: "bg-purple-500/5",
    text: "text-purple-400",
    icon: "text-purple-500" // اللون النهدي/البنفسجي
  },
  // لون افتراطي ناعم في حال تم إنشاء رتبة جديدة عشوائية من الواجهة
  DEFAULT: {
    border: "border-border hover:border-primary/30",
    bg: "bg-muted/10",
    text: "text-foreground/90",
    icon: "text-muted-foreground"
  }
};

export function RolesManagementView({
  roles,
  error,
  name,
  setName,
  onCreateRole,
  onDeleteRole,
}) {
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 sm:p-6 animate-in fade-in duration-200">
      
      {/* الترويسة الرئيسية للقسم */}
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
          <Settings2 className="h-7 w-7 text-primary" /> Roles & Access Control
        </h1>
        <p className="text-sm text-muted-foreground">Define system roles, security clearance, and user level permissions.</p>
      </div>

      {/* شريط التنبيهات في حال وجود خطأ */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 animate-in shake duration-300">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-destructive">Action Required</h4>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* شبكة العرض الأفقية المتطورة (الرولز أولاً ثم الإنشاء) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* أولاً: كرت عرض الأدوار الحالية (يأخذ ثلثي المساحة بالأفقي) */}
        <Card className="border border-border bg-card shadow-xs overflow-hidden lg:col-span-2 order-1">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> System Directory Roles
            </CardTitle>
            <CardDescription className="text-xs">
              Currently registered roles available for user assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {roles.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Shield className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2 stroke-1" />
                <p className="text-sm font-medium">No roles available in the directory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((r) => {
                  // استخراج تدرج الألوان المطابق لكل دور برمجي
                  const style = ROLE_COLOR_MAP[r.name] || ROLE_COLOR_MAP.DEFAULT;

                  return (
                    <div 
                      key={r.id} 
                      className={`group flex items-center justify-between rounded-xl border p-3.5 transition-all duration-200 ${style.border} ${style.bg}`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border shrink-0 group-hover:scale-105 transition-transform">
                          <Shield className={`h-4 w-4 ${style.icon}`} />
                        </div>
                        <span className={`text-sm font-bold font-mono tracking-wide truncate ${style.text}`}>
                          {r.name}
                        </span>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 transition-colors"
                        onClick={() => onDeleteRole(r.id)}
                        title={`Delete ${r.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ثانياً: كرت إنشاء دور جديد (يأخذ الثلث المتبقي في اليمين) */}
        <Card className="border border-border bg-card shadow-xs lg:col-span-1 order-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create New Role
            </CardTitle>
            <CardDescription className="text-xs">
              System role names should ideally be uppercase (e.g., MANAGER).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role Code Name</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. SALES_MANAGER" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="pl-10 h-11 bg-muted/30 focus-visible:bg-background border-muted/60"
                  onKeyPress={(e) => e.key === 'Enter' && onCreateRole()}
                />
              </div>
            </div>
            <Button 
              onClick={onCreateRole}
              className="w-full h-11 font-semibold gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Create Role
            </Button>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}