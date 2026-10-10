import { useState } from "react";
import { X, Lock, User, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      setError(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } else {
      setError(true);
    }
  };

  const handleQuickFill = () => {
    setUsername("admin");
    setPassword("admin123");
    setError(false);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-opacity"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-cream border border-ink/10 shadow-luxe p-6 sm:p-8 overflow-hidden text-right">
        {/* Glow */}
        <div
          className="absolute -top-24 -left-24 h-48 w-48 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ background: "var(--gradient-gold)" }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-gold/15 flex items-center justify-center text-gold">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink">
                تسجيل دخول الإدارة
              </h3>
              <p className="text-[10px] text-ink/60">كاريشما — إدارة نسرين الطنطاوي</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full border border-ink/15 text-ink hover:bg-ink/5 flex items-center justify-center"
            aria-label="إغلاق تسجيل الدخول"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Fill Helper */}
        <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>بيانات المشرف: <strong>admin</strong> / <strong>admin123</strong></span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700 transition-colors"
          >
            تعبئة تلقائية
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink/75 block mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-2xl border border-ink/20 bg-cream/90 px-4 py-3 pl-10 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
              />
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-ink/40" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink/75 block mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-ink/20 bg-cream/90 px-4 py-3 pl-10 text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-ink/40" />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose/10 border border-rose/25 text-rose text-xs flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>بيانات الدخول غير صحيحة. جربي: admin / admin123</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>تم تسجيل الدخول بنجاح! جاري تحويلك...</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-full gradient-gold py-3 text-xs uppercase tracking-wider font-bold text-ink shadow-soft hover:shadow-glow transition-all"
            >
              تسجيل الدخول للوحة التحكم
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
