import React from "react";
import { Heart, LogOut, User as UserIcon, PlusCircle, LayoutDashboard, Search, Menu } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentView: string;
  onSetView: (view: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onOpenListPet: () => void;
  onToggleMobileSidebar: () => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  currentView,
  onSetView,
  searchTerm,
  onSearchChange,
  onOpenListPet,
  onToggleMobileSidebar
}: NavbarProps) {
  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg md:hidden transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div 
              onClick={() => onSetView("explore")} 
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Heart size={20} fill="currentColor" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
                Pet Adoption <span className="text-emerald-600 font-medium">寵物認養</span>
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search breeds, names or keywords... (搜尋品種、名字...)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-500/50 rounded-xl text-sm transition-all focus:outline-hidden"
              />
            </div>
          </div>

          {/* Auth Controls & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <button
                  onClick={onOpenListPet}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-100 transition-all cursor-pointer"
                >
                  <PlusCircle size={16} />
                  <span>List Pet (刊登)</span>
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-slate-400">Welcome,</p>
                    <p className="text-sm font-semibold text-slate-700">{user.name}</p>
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={onLogout}
                    title="Sign Out (登出)"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-medium text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserIcon size={16} />
                <span>Sign In (登入 / 註冊)</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
