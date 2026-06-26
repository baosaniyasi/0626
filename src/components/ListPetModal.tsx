import React, { useState } from "react";
import { X, Plus, Sparkles, AlertCircle } from "lucide-react";
import { User } from "../types";

interface ListPetModalProps {
  onClose: () => void;
  user: User | null;
  onAddPet: (payload: any) => Promise<{ success: boolean; error?: string }>;
}

export default function ListPetModal({ onClose, user, onAddPet }: ListPetModalProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [ageGroup, setAgeGroup] = useState<"baby" | "young" | "adult" | "senior">("young");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [location, setLocation] = useState("Taipei City (台北市)");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !breed.trim() || !age.trim() || !description.trim() || !phone.trim() || !email.trim() || !location.trim()) {
      setError("Please fill in all required fields (請填寫所有必填欄位)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name,
        species,
        breed,
        age,
        ageGroup,
        gender,
        size,
        description,
        imageUrl: imageUrl.trim() || undefined, // fallback is handled server-side
        contactInfo: {
          phone,
          email,
          location,
        },
      };

      const result = await onAddPet(payload);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || "Failed to list pet.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const cities = [
    "Taipei City (台北市)",
    "New Taipei City (新北市)",
    "Taoyuan City (桃園市)",
    "Hsinchu City (新竹市)",
    "Taichung City (台中市)",
    "Tainan City (台南市)",
    "Kaohsiung City (高雄市)",
    "Keelung City (基隆市)",
    "Yilan County (宜蘭縣)",
    "Hualien County (花蓮縣)"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-emerald-200">
              <Plus size={18} />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-800">List Pet for Adoption (刊登待認養寵物)</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Pet Name (寵物名字) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mochi"
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Species */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Species (物種) <span className="text-rose-500">*</span></label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as any)}
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="dog">Dog (狗)</option>
                <option value="cat">Cat (貓)</option>
                <option value="other">Other (其他)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Breed */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Breed (品種) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Shiba Inu (柴犬)"
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Age String */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Age Description (年齡描寫) <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 1.5 years old (1歲半)"
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Age Group */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Age Group (年齡段) <span className="text-rose-500">*</span></label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="baby">Baby (幼兒)</option>
                <option value="young">Young (青年)</option>
                <option value="adult">Adult (成年)</option>
                <option value="senior">Senior (高齡)</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Gender (性別) <span className="text-rose-500">*</span></label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="male">Male (男生)</option>
                <option value="female">Female (女生)</option>
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="text-xs font-semibold text-slate-500">Size (體型) <span className="text-rose-500">*</span></label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as any)}
                className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
              >
                <option value="small">Small (小)</option>
                <option value="medium">Medium (中)</option>
                <option value="large">Large (大)</option>
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Pet Image URL (寵物照片網址)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (留空將使用預設精美插圖)"
              className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500">Description / Character (寵物特色自述) <span className="text-rose-500">*</span></label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about their personality, favorite games, vaccinations, and what kind of home they are looking for..."
              className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden resize-none"
            />
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="font-display text-sm font-bold text-slate-800">Contact Details (聯絡資訊)</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Phone */}
              <div className="col-span-1">
                <label className="text-xs font-semibold text-slate-500">Phone (聯絡電話) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912-345-678"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                />
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label className="text-xs font-semibold text-slate-500">Email (聯絡信箱) <span className="text-rose-500">*</span></label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@shelter.com"
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                />
              </div>

              {/* Location */}
              <div className="col-span-1">
                <label className="text-xs font-semibold text-slate-500">Location (所在地) <span className="text-rose-500">*</span></label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel (取消)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>{loading ? "Listing..." : "Publish Profile (正式發布)"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
