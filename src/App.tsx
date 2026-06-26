import { useState, useEffect } from "react";
import { 
  Heart, PlusCircle, LayoutDashboard, Search, Menu, X, 
  Sparkles, AlertCircle, RefreshCw, Dog, Cat, Star, Compass 
} from "lucide-react";

import Navbar from "./components/Navbar";
import Sidebar, { FilterState } from "./components/Sidebar";
import PetCard from "./components/PetCard";
import PetDetailModal from "./components/PetDetailModal";
import ListPetModal from "./components/ListPetModal";
import AuthModal from "./components/AuthModal";
import ApplicationsView from "./components/ApplicationsView";

import { Pet, User, AdoptionRequest, Favorite } from "./types";

// Reference custom generated hero banner path directly as static asset
const heroBannerImg = "/src/assets/images/pet_hero_illustration_1782488955645.jpg";

export default function App() {
  // Session / User States
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // App Navigation View
  const [currentView, setCurrentView] = useState<string>("explore"); // explore, favorites, requests

  // Pet Listing & Filter States
  const [pets, setPets] = useState<Pet[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [requests, setRequests] = useState<{ sent: AdoptionRequest[]; received: AdoptionRequest[] }>({
    sent: [],
    received: []
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    species: "all",
    ageGroup: "all",
    size: "all",
    gender: "all",
  });

  // Modal / Interaction Toggles
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [listPetModalOpen, setListPetModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Loading / Error feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Initialize Session on Mount ---
  useEffect(() => {
    const token = localStorage.getItem("pet_session_token");
    if (token) {
      setSessionToken(token);
      fetchUserData(token);
    } else {
      setLoading(false);
    }
    fetchPets();
  }, []);

  // --- Reload Data when Auth Session changes ---
  useEffect(() => {
    if (sessionToken) {
      fetchFavorites(sessionToken);
      fetchRequests(sessionToken);
    } else {
      setFavorites([]);
      setRequests({ sent: [], received: [] });
    }
  }, [sessionToken]);

  // --- API Actions ---

  const fetchPets = async () => {
    try {
      const res = await fetch("/api/pets");
      if (!res.ok) throw new Error("Failed to load pets database.");
      const data = await res.json();
      setPets(data);
    } catch (err: any) {
      setError(err.message || "An error occurred fetching pets.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "x-session-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // stale token
        handleLogout();
      }
    } catch (e) {
      console.error("Auth verification failed", e);
    }
  };

  const fetchFavorites = async (token: string) => {
    try {
      const res = await fetch("/api/favorites", {
        headers: { "x-session-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (e) {
      console.error("Failed to fetch favorites", e);
    }
  };

  const fetchRequests = async (token: string) => {
    try {
      const res = await fetch("/api/requests", {
        headers: { "x-session-token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error("Failed to fetch requests", e);
    }
  };

  const handleAuthSuccess = (token: string, userData: User) => {
    localStorage.setItem("pet_session_token", token);
    setSessionToken(token);
    setUser(userData);
    setAuthModalOpen(false);
  };

  const handleLogout = async () => {
    if (sessionToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "x-session-token": sessionToken }
        });
      } catch (e) {
        console.error("Logout request failed", e);
      }
    }
    localStorage.removeItem("pet_session_token");
    setSessionToken(null);
    setUser(null);
    setCurrentView("explore");
  };

  const handleToggleFavorite = async (petId: string) => {
    if (!user || !sessionToken) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken
        },
        body: JSON.stringify({ petId })
      });
      if (res.ok) {
        fetchFavorites(sessionToken);
      }
    } catch (e) {
      console.error("Error toggling favorite", e);
    }
  };

  const handleAddPet = async (payload: any) => {
    if (!sessionToken) {
      return { success: false, error: "Please log in (請先登入)" };
    }

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to publish." };
      }
      // Refresh listings
      fetchPets();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Something went wrong." };
    }
  };

  const handleSubmitAdoptionApplication = async (
    petId: string, 
    payload: { name: string; email: string; phone: string; message: string }
  ) => {
    if (!sessionToken) {
      return { success: false, error: "Authentication required" };
    }

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken
        },
        body: JSON.stringify({ petId, ...payload })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to submit request." };
      }

      // Refresh applications and update current pet visual to pending locally
      fetchRequests(sessionToken);
      fetchPets();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Something went wrong." };
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: "approved" | "rejected") => {
    if (!sessionToken) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": sessionToken
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Failed to update status." };
      }

      // Refresh both listings and requests
      fetchRequests(sessionToken);
      fetchPets();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to submit state." };
    }
  };

  // --- Filtering Logic ---

  const handleFilterChange = (key: keyof FilterState, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    // Force explore view when tweaking filter
    if (currentView !== "explore") {
      setCurrentView("explore");
    }
  };

  const handleResetFilters = () => {
    setFilters({
      species: "all",
      ageGroup: "all",
      size: "all",
      gender: "all"
    });
    setSearchTerm("");
  };

  // Compute what gets displayed
  const getFilteredPets = () => {
    let list = pets;

    // Filter by view
    if (currentView === "favorites") {
      const favIds = favorites.map(f => f.petId);
      list = list.filter(p => favIds.includes(p._id));
    }

    // Advanced Sidebar Filters
    if (filters.species !== "all") {
      list = list.filter(p => p.species === filters.species);
    }
    if (filters.ageGroup !== "all") {
      list = list.filter(p => p.ageGroup === filters.ageGroup);
    }
    if (filters.size !== "all") {
      list = list.filter(p => p.size === filters.size);
    }
    if (filters.gender !== "all") {
      list = list.filter(p => p.gender === filters.gender);
    }

    // Search bar term filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        p => p.name.toLowerCase().includes(term) || 
             p.breed.toLowerCase().includes(term) || 
             p.description.toLowerCase().includes(term)
      );
    }

    return list;
  };

  const displayedPets = getFilteredPets();

  const handleCardClick = (pet: Pet) => {
    setSelectedPet(pet);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none antialiased">
      
      {/* Navbar Component */}
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        onSetView={setCurrentView}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenListPet={() => setListPetModalOpen(true)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Responsive Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            currentView={currentView}
            onSetView={setCurrentView}
            isAuthenticated={!!user}
            onOpenAuth={() => setAuthModalOpen(true)}
            totalCount={pets.length}
          />
        </div>

        {/* Sliding Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex md:hidden animate-fade-in">
            <div className="bg-white w-72 h-full p-6 shadow-2xl relative flex flex-col gap-6 overflow-y-auto">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 mt-2 pb-4 border-b border-slate-100">
                <Heart size={20} className="text-emerald-500" fill="currentColor" />
                <span className="font-display font-bold text-slate-800">Menu & Filters</span>
              </div>

              {user && (
                <button
                  onClick={() => {
                    setListPetModalOpen(true);
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-100 transition-all"
                >
                  <PlusCircle size={16} />
                  <span>List Pet for Adoption (刊登)</span>
                </button>
              )}

              <Sidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                currentView={currentView}
                onSetView={(v) => {
                  setCurrentView(v);
                  setMobileSidebarOpen(false);
                }}
                isAuthenticated={!!user}
                onOpenAuth={() => {
                  setAuthModalOpen(true);
                  setMobileSidebarOpen(false);
                }}
                totalCount={pets.length}
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        <section className="flex-1 flex flex-col gap-6 min-w-0">
          
          {/* Hero Promo Banner (Only on Explore / Welcome screen) */}
          {currentView === "explore" && !searchTerm && (
            <div className="relative rounded-3xl overflow-hidden bg-slate-800 h-44 sm:h-56 md:h-64 shadow-xs shrink-0 flex items-center">
              <img
                src={heroBannerImg}
                alt="Pet Adoption Mascot Illustration"
                className="absolute inset-0 w-full h-full object-cover opacity-85 hover:scale-101 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-linear-to-r from-slate-950/75 via-slate-900/40 to-transparent"></div>
              
              <div className="relative z-10 px-6 sm:px-10 md:px-12 max-w-lg text-white space-y-2 sm:space-y-3">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-emerald-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Compass size={12} fill="currentColor" />
                  <span>Meet your perfect match</span>
                </span>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-none text-white">
                  Find Your Forever Friend
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  給流浪毛孩一個溫暖的家。這裡有許多可愛的狗狗、貓咪正期盼與您相遇，開啟人生的新篇章。
                </p>
              </div>
            </div>
          )}

          {/* Loading States */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400 font-medium">Loading pet database... (載入資料中)</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
              <AlertCircle className="shrink-0" />
              <div>
                <h4 className="font-bold text-sm">System Connection Alert</h4>
                <p className="text-xs text-rose-500/90 mt-0.5">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Sub-Views Router */}
              {currentView === "requests" ? (
                <ApplicationsView
                  requests={requests}
                  onUpdateRequestStatus={handleUpdateRequestStatus}
                />
              ) : (
                <div className="space-y-5 flex-1 flex flex-col">
                  {/* View Heading & Statistics */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-800">
                        {currentView === "favorites" ? "My Favorite Animals (我的收藏)" : "Adoptable Pets (待認養毛孩)"}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Showing {displayedPets.length} matching result{displayedPets.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {/* Empty States */}
                  {displayedPets.length === 0 ? (
                    <div className="flex-1 bg-white border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
                      <div className="w-14 h-14 bg-emerald-500/5 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <Star size={24} />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <h4 className="font-display font-bold text-slate-700 text-sm">No pets found matching filters</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          We couldn't find any cute profiles matching your specific search term or criteria. Try resetting filters or expand parameters!
                        </p>
                      </div>
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Clear Filters (清除條件)
                      </button>
                    </div>
                  ) : (
                    /* Cards Grid Layout */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {displayedPets.map((pet) => {
                        const isFav = favorites.some((f) => f.petId === pet._id);
                        return (
                          <PetCard
                            key={pet._id}
                            pet={pet}
                            isFavorited={isFav}
                            onToggleFavorite={handleToggleFavorite}
                            onSelect={handleCardClick}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </section>
      </main>

      {/* --- Global Modals Router --- */}

      {/* Auth Modal Register / Login */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* List Pet for Adoption Form */}
      {listPetModalOpen && (
        <ListPetModal
          onClose={() => setListPetModalOpen(false)}
          user={user}
          onAddPet={handleAddPet}
        />
      )}

      {/* Detail Showcase & Application Form */}
      {selectedPet && (
        <PetDetailModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          user={user}
          onOpenAuth={() => {
            setAuthModalOpen(true);
            setSelectedPet(null);
          }}
          onSubmitApplication={handleSubmitAdoptionApplication}
        />
      )}

      {/* Footer copyright */}
      <footer className="py-6 border-t border-slate-150/40 text-center text-[11px] text-slate-400 shrink-0">
        © 2026 Pet Adoption Platform (寵物認養管理系統). Crafted for shelter matching. All rights reserved.
      </footer>

    </div>
  );
}
