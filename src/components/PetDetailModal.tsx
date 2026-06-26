import React, { useState } from "react";
import { X, MapPin, Phone, Mail, User as UserIcon, Calendar, Info, Heart, Send } from "lucide-react";
import { Pet, User } from "../types";

interface PetDetailModalProps {
  pet: Pet;
  onClose: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onSubmitApplication: (petId: string, payload: { name: string; email: string; phone: string; message: string }) => Promise<{ success: boolean; error?: string }>;
}

export default function PetDetailModal({
  pet,
  onClose,
  user,
  onOpenAuth,
  onSubmitApplication,
}: PetDetailModalProps) {
  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError("Please fill in all details (請填寫所有欄位)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await onSubmitApplication(pet._id, { name, email, phone, message });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to submit request.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const badgeStyles = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    adopted: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const badgeLabel = {
    available: "Available (可認養)",
    pending: "Pending Application (申請中)",
    adopted: "Adopted (已認養)",
  };

  return (
    <div id="pet-detail-backdrop" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-xs hover:bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-md transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Column 1: Media & Core Info */}
        <div className="w-full md:w-1/2 relative bg-slate-100 flex flex-col h-72 md:h-auto overflow-hidden">
          <img
            src={pet.imageUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent p-6 text-white flex flex-col gap-1">
            <span className={`self-start text-[11px] font-bold px-3 py-1 rounded-full border ${badgeStyles[pet.status]} bg-white/10 backdrop-blur-md`}>
              {badgeLabel[pet.status]}
            </span>
            <h3 className="font-display text-2xl font-bold mt-2">{pet.name}</h3>
            <p className="text-sm opacity-90">{pet.breed}</p>
          </div>
        </div>

        {/* Column 2: Details & Forms */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col gap-6 max-h-[calc(90vh-18rem)] md:max-h-full">
          
          {/* Pet Details Group */}
          <div>
            <h4 className="font-display text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">About Pet</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                <p className="text-sm font-bold text-slate-700 mt-1">{pet.age.split(" (")[0]}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
                <p className="text-sm font-bold text-slate-700 mt-1 capitalize">{pet.gender === "male" ? "Male" : "Female"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Size</p>
                <p className="text-sm font-bold text-slate-700 mt-1 capitalize">{pet.size}</p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mt-4 leading-relaxed whitespace-pre-line">
              {pet.description}
            </p>
          </div>

          {/* Location & Shelter/Owner Info */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex flex-col gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-emerald-500 shrink-0" />
              <span>Location: <strong className="text-slate-800">{pet.contactInfo.location}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon size={14} className="text-emerald-500 shrink-0" />
              <span>Listed by: <strong className="text-slate-800">{pet.listedByName}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-emerald-500 shrink-0" />
              <span>Contact Email: <strong className="text-slate-800">{pet.contactInfo.email}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-emerald-500 shrink-0" />
              <span>Contact Phone: <strong className="text-slate-800">{pet.contactInfo.phone}</strong></span>
            </div>
          </div>

          {/* Adoption Request Form */}
          <div className="border-t border-slate-100 pt-5">
            {pet.status === "adopted" ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center flex flex-col items-center gap-2">
                <Heart size={28} className="text-slate-400 fill-slate-200" />
                <h5 className="font-display font-bold text-slate-700">Happy Ever After!</h5>
                <p className="text-xs text-slate-400">This adorable buddy has already found a forever home.</p>
              </div>
            ) : success ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center flex flex-col items-center gap-2">
                <Send size={28} className="text-emerald-500 animate-bounce" />
                <h5 className="font-display font-bold text-emerald-800">Application Submitted!</h5>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  Your adoption application has been sent to the shelter/owner. They will review it and contact you soon!
                  (申請已送出！刊登者將會與您聯繫。)
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-display text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Heart size={16} className="text-emerald-500 fill-emerald-500" />
                  <span>Apply for Adoption (申請認養)</span>
                </h4>

                {!user ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-500 mb-3">Please sign in to apply for adopting this pet.</p>
                    <button
                      onClick={onOpenAuth}
                      className="px-4 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Sign In Now
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {error && <p className="text-xs font-bold text-rose-500">{error}</p>}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name (聯絡姓名)</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full mt-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Your Phone (聯絡電話)</label>
                        <input
                          type="text"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="0912-345-678"
                          className="w-full mt-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Your Email (聯絡電子信箱)</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full mt-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Why do you want to adopt? (認養自述與評估)</label>
                      <textarea
                        required
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Please share your background, experience with pets, and home environment..."
                        className="w-full mt-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? "Submitting..." : "Submit Adoption Request (送出認養申請)"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
