import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, Heart, Sparkles, CheckCircle } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
  initialTab?: "login" | "register";
}

export default function AuthModal({ onClose, onAuthSuccess, initialTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  
  // Login State
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setSuccessMsg("Logged in successfully! (登入成功！)");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regUser.trim() || !regPass.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          username: regUser,
          password: regPass
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccessMsg("Account registered successfully! (註冊成功，已自動登入！)");
      setTimeout(() => {
        onAuthSuccess(data.token, data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col animate-fade-in border border-slate-100">
        
        {/* Banner header decoration */}
        <div className="bg-amber-500 p-6 text-white text-center flex flex-col items-center gap-2.5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Heart size={24} fill="white" />
          </div>
          <h3 className="font-display text-lg font-bold">Join Pet Adoption System (加入寵物認養)</h3>
          <p className="text-xs text-white/80">Connect with shelters and discover lovely fuzzy friends!</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 text-sm font-semibold text-slate-500">
          <button
            onClick={() => { setActiveTab("login"); setError(""); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "login"
                ? "border-amber-500 text-amber-500 bg-amber-500/5 font-bold"
                : "border-transparent hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Sign In (會員登入)
          </button>
          <button
            onClick={() => { setActiveTab("register"); setError(""); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === "register"
                ? "border-amber-500 text-amber-500 bg-amber-500/5 font-bold"
                : "border-transparent hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Register (免費註冊)
          </button>
        </div>

        {/* Content form */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs text-center font-semibold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex flex-col items-center gap-1.5 text-center font-semibold">
              <CheckCircle size={18} className="text-emerald-500 animate-pulse" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Username (使用者帳號)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <UserIcon size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Password (登入密碼)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {loading ? "Signing In..." : "Sign In (登入會員)"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Full Name (姓名 / 稱呼)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Sparkles size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Amber Lin"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Email Address (電子信箱)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail size={14} />
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. amber@example.com"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Create Username (自訂帳號)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <UserIcon size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="e.g. amber_parks"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Choose Password (設定密碼)</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Lock size={14} />
                  </span>
                  <input
                    type="password"
                    required
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl text-xs text-slate-700 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {loading ? "Creating Account..." : "Register Now (建立新帳號)"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
