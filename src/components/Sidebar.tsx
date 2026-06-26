import React from "react";
import { Dog, Cat, Eye, Heart, ListCollapse, Award, Layers, Sparkles, Filter, RefreshCw } from "lucide-react";

export interface FilterState {
  species: string;
  ageGroup: string;
  size: string;
  gender: string;
}

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, val: string) => void;
  onResetFilters: () => void;
  currentView: string;
  onSetView: (view: string) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  totalCount: number;
}

export default function Sidebar({
  filters,
  onFilterChange,
  onResetFilters,
  currentView,
  onSetView,
  isAuthenticated,
  onOpenAuth,
  totalCount
}: SidebarProps) {
  const categories = [
    { id: "explore", label: "Browse Pets (瀏覽寵物)", icon: <Layers size={18} /> },
    { id: "favorites", label: "My Favorites (我的收藏)", icon: <Heart size={18} /> },
    { id: "requests", label: "Applications (認養與管理)", icon: <ListCollapse size={18} /> },
  ];

  const speciesOptions = [
    { value: "all", label: "All Species (全部物種)" },
    { value: "dog", label: "Dogs (狗狗)", icon: <Dog size={16} /> },
    { value: "cat", label: "Cats (貓咪)", icon: <Cat size={16} /> },
    { value: "other", label: "Others (其他可愛動物)" },
  ];

  const ageOptions = [
    { value: "all", label: "All Ages (全部年齡)" },
    { value: "baby", label: "Baby (幼體 < 1歲)" },
    { value: "young", label: "Young (青年 1-2歲)" },
    { value: "adult", label: "Adult (成年 2-7歲)" },
    { value: "senior", label: "Senior (高齡 > 7歲)" },
  ];

  const sizeOptions = [
    { value: "all", label: "All Sizes (全部體型)" },
    { value: "small", label: "Small (小型)" },
    { value: "medium", label: "Medium (中型)" },
    { value: "large", label: "Large (大型)" },
  ];

  const genderOptions = [
    { value: "all", label: "All Genders (不限性別)" },
    { value: "male", label: "Male (男生)" },
    { value: "female", label: "Female (女生)" },
  ];

  const handleViewClick = (viewId: string) => {
    if ((viewId === "favorites" || viewId === "requests") && !isAuthenticated) {
      onOpenAuth();
    } else {
      onSetView(viewId);
    }
  };

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6">
      
      {/* Navigation Groups */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Navigation</h3>
        <nav className="space-y-1">
          {categories.map((cat) => {
            const isActive = currentView === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleViewClick(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-emerald-50 text-emerald-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? "text-emerald-500" : "text-slate-400"}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </div>
                {cat.id === "explore" && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {totalCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-emerald-500" />
            <h3 className="font-display text-sm font-bold text-slate-800">Advanced Filters</h3>
          </div>
          <button
            onClick={onResetFilters}
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <RefreshCw size={12} />
            <span>Reset (重設)</span>
          </button>
        </div>

        {/* Species Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Species (物種)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {speciesOptions.map((opt) => {
              const selected = filters.species === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onFilterChange("species", opt.value)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer truncate ${
                    selected
                      ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label.split(" (")[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Age Group Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Age Group (年齡層)</label>
          <select
            value={filters.ageGroup}
            onChange={(e) => onFilterChange("ageGroup", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
          >
            {ageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Size Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Size (體型)</label>
          <select
            value={filters.size}
            onChange={(e) => onFilterChange("size", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
          >
            {sizeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">Gender (性別)</label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange("gender", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
          >
            {genderOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Micro-promo details */}
        <div className="mt-2 p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-start gap-2.5">
          <Sparkles size={16} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-emerald-800 leading-relaxed">
            <span className="font-bold">Adopt, Don't Shop!</span> Adopted animals bring unconditional love. Saving a life is a wonderful reward.
          </div>
        </div>

      </div>
    </aside>
  );
}
