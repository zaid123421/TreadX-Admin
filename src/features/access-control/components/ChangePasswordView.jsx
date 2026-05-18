import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Lock, ShieldCheck, KeyRound, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

export function ChangePasswordView({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  message,
  error,
  onSubmit,
}) {
  // حالات داخلية للتحكم في ظهور وإغلاق الـ Alert
  const [showAlert, setShowAlert] = useState(false);

  // حالات داخلية مستقلة لإظهار/إخفاء كلمة المرور لكل حقل من الحقول الثلاثة
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // تفعيل ظهور الـ Alert تلقائياً عند وصول رسالة نجاح أو خطأ من السيرفر
  useEffect(() => {
    if (message || error) {
      setShowAlert(true);
    }
  }, [message, error]);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 relative">
      
      {/* كرت تغيير كلمة المرور */}
      <Card className="w-full max-w-md border-none shadow-xl bg-card overflow-hidden">
        <CardHeader className="space-y-1.5 pb-6 border-b bg-muted/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-2">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Change Password</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Ensure your account is using a long, random password to stay secure.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          
          {/* حقل كلمة المرور الحالية */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type={showCurrent ? "text" : "password"} 
                placeholder="Enter current password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className="pl-10 pr-10 h-11 bg-muted/30 focus-visible:bg-background border-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-hidden"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* حقل كلمة المرور الجديدة */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type={showNew ? "text" : "password"} 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="pl-10 pr-10 h-11 bg-muted/30 focus-visible:bg-background border-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-hidden"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* حقل تأكيد كلمة المرور */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type={showConfirm ? "text" : "password"} 
                placeholder="Repeat new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="pl-10 pr-10 h-11 bg-muted/30 focus-visible:bg-background border-muted/60"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-hidden"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* زر التحديث */}
          <Button 
            onClick={onSubmit} 
            className="w-full h-11 mt-2 font-semibold shadow-xs transition-all tracking-wide"
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* الـ Alert المنبثق بمنتصف الشاشة تماماً */}
      {showAlert && (message || error) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200 ${
              message 
                ? 'bg-card border-emerald-500/30 shadow-emerald-950/20' 
                : 'bg-card border-red-500/30 shadow-red-950/20'
            }`}
          >
            <div className={`p-3 rounded-full ${message ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              {message ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>

            <div className="space-y-1 w-full">
              <h3 className="font-bold text-lg text-foreground">
                {message ? 'Success!' : 'Update Failed'}
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {message || error}
              </p>
            </div>

            <Button 
              variant="secondary" 
              size="sm"
              className="w-full h-10 rounded-xl font-medium"
              onClick={() => setShowAlert(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}