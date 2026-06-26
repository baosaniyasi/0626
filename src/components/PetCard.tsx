import React from "react";
import { Heart, MapPin, Tag, ArrowRight } from "lucide-react";
import { Pet } from "../types";

interface PetCardProps {
  key?: string | number;
  pet: Pet;
  isFavorited: boolean;
  onToggleFavorite: (petId: string) => void;
  onSelect: (pet: Pet) => void;
}

export default function PetCard({ pet, isFavorited, onToggleFavorite, onSelect }: PetCardProps) {
  // Translate labels beautifully
  const genderMap = {
    male: "Male (男生)",
    female: "Female (女生)",
  };

  const statusColors = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    adopted: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const statusLabels = {
    available: "Available (可認養)",
    pending: "Pending (申請中)",
    adopted: "Adopted (已認養)",
  };

  return (
    <article
      id={`pet-card-${pet._id}`}
      className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/60 overflow-hidden flex flex-col group transition-all duration-300 h-full"
    >
      {/* Image Container with Absolute Badges */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-50 shrink-0">
        <img
          src={pet.imageUrl}
          alt={pet.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Favorite Heart Toggler */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(pet._id);
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-xs hover:bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-all hover:scale-110 active:scale-90 cursor-pointer"
          title={isFavorited ? "Remove from Favorites (取消收藏)" : "Add to Favorites (加入收藏)"}
        >
          <Heart
            size={18}
            className={isFavorited ? "fill-rose-500 text-rose-500" : "transition-colors"}
          />
        </button>

        {/* Species Tag */}
        <span className="absolute bottom-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-slate-900/80 text-white rounded-md backdrop-blur-xs">
          {pet.species}
        </span>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Header & Status */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-display text-lg font-bold text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors">
                {pet.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 font-medium truncate max-w-[140px]" title={pet.breed}>
                {pet.breed}
              </p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColors[pet.status]}`}>
              {statusLabels[pet.status]}
            </span>
          </div>

          {/* Metadata Specs Grid */}
          <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-50 text-slate-500 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Age:</span>
              <span className="font-semibold text-slate-700 truncate">{pet.age.split(" (")[0]}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Sex:</span>
              <span className="font-semibold text-slate-700 truncate">{pet.gender === "male" ? "Male" : "Female"}</span>
            </div>
          </div>

          {/* Location details */}
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <MapPin size={13} className="text-emerald-500 shrink-0" />
            <span className="truncate">{pet.contactInfo.location}</span>
          </div>

          {/* Preview description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
            {pet.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-slate-50">
          <button
            onClick={() => onSelect(pet)}
            className="w-full py-2 bg-slate-50 hover:bg-emerald-600 hover:text-white group-hover:bg-emerald-600 group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Learn More & Adopt (暸解更多)</span>
            <ArrowRight size={13} className="translate-x-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
}
