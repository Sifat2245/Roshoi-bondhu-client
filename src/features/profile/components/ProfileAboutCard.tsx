import React, { useState } from "react";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Instagram,
  Phone,
  Mail,
  Edit2,
  Plus,
  X,
  Check,
  ChefHat,
  ExternalLink,
} from "lucide-react";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useToast } from "../../../context/ToastContext";
import { useSession } from "../../../lib/auth-client";
import { profileApi } from "../api/profile.api";
import { UpdateProfilePayload } from "../types/profile.types";

interface ProfileAboutCardProps {
  profile: any;
  isOwnProfile?: boolean;
  onOpenEditModal?: () => void;
  onProfileUpdated?: (updatedData: any) => void;
}

type AboutCategory =
  | "INTRO"
  | "PERSONAL"
  | "WORK"
  | "EDUCATION"
  | "HOBBIES"
  | "INTERESTS"
  | "LINKS"
  | "CONTACT";

const categories: { id: AboutCategory; label: string }[] = [
  { id: "INTRO", label: "Intro" },
  { id: "PERSONAL", label: "Personal details" },
  { id: "WORK", label: "Work" },
  { id: "EDUCATION", label: "Education" },
  { id: "HOBBIES", label: "Hobbies" },
  { id: "INTERESTS", label: "Interests" },
  { id: "LINKS", label: "Links" },
  { id: "CONTACT", label: "Contact info" },
];

type ActiveModalType =
  | "BIO"
  | "PINNED"
  | "GENDER"
  | "HOMETOWN"
  | "LANGUAGES"
  | "EXPERTISE"
  | "WORK"
  | "EDUCATION"
  | "HOBBIES"
  | "INTERESTS"
  | "LINKS"
  | "PHONE"
  | null;

const DEFAULT_HOBBIES = [
  { label: "Traditional Cooking", icon: "🍲" },
  { label: "Baking & Desserts", icon: "🍰" },
  { label: "Food Photography", icon: "📸" },
  { label: "Spice Blending", icon: "🌶️" },
  { label: "Recipe Testing", icon: "📝" },
  { label: "Culinary Travel", icon: "✈️" },
  { label: "Kitchen Gardening", icon: "🌱" },
  { label: "Adda & Tea Sessions", icon: "☕" },
  { label: "Grilling & BBQ", icon: "🍖" },
  { label: "Desi Pickling", icon: "🥒" },
];

const DEFAULT_INTERESTS = [
  {
    title: "Kacchi Biryani Mastery",
    desc: "Slow cooked fragrant meat and rice layering",
  },
  {
    title: "Pitha Heritage",
    desc: "Winter patishapta, chitoi and dudh puli traditions",
  },
  {
    title: "Desi Fermentation",
    desc: "Tangy homemade doi and fermented borhani",
  },
  {
    title: "Street Food Secrets",
    desc: "Fuchka, chotpoti, and halim spice balances",
  },
];

const ProfileAboutCard: React.FC<ProfileAboutCardProps> = ({
  profile,
  isOwnProfile,
  onOpenEditModal: _onOpenEditModal,
  onProfileUpdated,
}) => {
  const [activeCategory, setActiveCategory] = useState<AboutCategory>("INTRO");
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [saving, setSaving] = useState(false);

  const { data: session } = useSession();
  const { notify } = useToast();
  const token = session?.session?.token;

  // Form states for modals
  const [bioInput, setBioInput] = useState("");
  const [pinnedCity, setPinnedCity] = useState("");
  const [pinnedWork, setPinnedWork] = useState("");
  const [pinnedEdu, setPinnedEdu] = useState("");
  const [pinnedSocial, setPinnedSocial] = useState("");

  const [genderInput, setGenderInput] = useState("");
  const [hometownInput, setHometownInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");

  const [workInput, setWorkInput] = useState("");
  const [eduInput, setEduInput] = useState("");

  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [customHobbyInput, setCustomHobbyInput] = useState("");

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterestInput, setCustomInterestInput] = useState("");

  const [websiteInput, setWebsiteInput] = useState("");
  const [socialLinksInput, setSocialLinksInput] = useState("");

  const [phoneInput, setPhoneInput] = useState("");

  const openModal = (type: ActiveModalType) => {
    if (!profile) return;
    setActiveModal(type);

    if (type === "BIO") {
      setBioInput(profile.bio || "");
    } else if (type === "PINNED") {
      setPinnedCity(profile.city || profile.hometown || "");
      setPinnedWork(profile.work || "");
      setPinnedEdu(profile.education || "");
      setPinnedSocial(profile.socialLinks || profile.username || "");
    } else if (type === "GENDER") {
      setGenderInput(profile.gender || "Not specified");
    } else if (type === "HOMETOWN") {
      setHometownInput(profile.hometown || profile.city || "");
    } else if (type === "LANGUAGES") {
      setLanguagesInput(profile.languages || "Bangla, English");
    } else if (type === "EXPERTISE") {
      setExpertiseInput(
        profile.expertise || "Authentic Bengali, Mughlai & Street Food"
      );
    } else if (type === "WORK") {
      setWorkInput(profile.work || "");
    } else if (type === "EDUCATION") {
      setEduInput(profile.education || "");
    } else if (type === "HOBBIES") {
      const current = profile.hobbies
        ? profile.hobbies.split(",").map((s: string) => s.trim()).filter(Boolean)
        : DEFAULT_HOBBIES.slice(0, 6).map((h) => h.label);
      setSelectedHobbies(current);
      setCustomHobbyInput("");
    } else if (type === "INTERESTS") {
      const current = profile.interests
        ? profile.interests.split(",").map((s: string) => s.trim()).filter(Boolean)
        : DEFAULT_INTERESTS.map((i) => i.title);
      setSelectedInterests(current);
      setCustomInterestInput("");
    } else if (type === "LINKS") {
      setWebsiteInput(profile.website || "");
      setSocialLinksInput(profile.socialLinks || "");
    } else if (type === "PHONE") {
      setPhoneInput(profile.phone || "");
    }
  };

  const handleSaveField = async (
    payload: Partial<UpdateProfilePayload>,
    successMessage: string
  ) => {
    setSaving(true);
    try {
      const res = await profileApi.updateProfile(payload, token);
      notify.success(successMessage);
      setActiveModal(null);
      if (onProfileUpdated) {
        onProfileUpdated(res?.data || payload);
      }
    } catch (err: any) {
      notify.error(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Helper for displaying hobbies
  const hobbiesList = profile?.hobbies
    ? profile.hobbies.split(",").map((s: string) => s.trim()).filter(Boolean)
    : DEFAULT_HOBBIES.map((h) => h.label);

  // Helper for displaying interests
  const interestsList = profile?.interests
    ? profile.interests.split(",").map((s: string) => s.trim()).filter(Boolean)
    : DEFAULT_INTERESTS.map((i) => i.title);

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      {/* Left Column: Category Menu */}
      <div className="w-full md:w-[260px] lg:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-3 sm:p-4 bg-gray-50/40 dark:bg-[#202122]/40">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white px-3 py-2 mb-2">
          About
        </h2>

        <nav className="space-y-1">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm sm:text-base transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-gray-200/80 dark:bg-[#3a3b3c] font-black text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold"
                }`}
              >
                <span>{cat.label}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#e02f21] hidden md:block" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Column: Category Details Panel */}
      <div className="flex-1 p-5 sm:p-8 overflow-y-auto">
        {/* 1. INTRO */}
        {activeCategory === "INTRO" && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Bio Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  Bio
                </h3>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("BIO")}
                    title="Edit Bio"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#e02f21] hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              <div className="flex items-start gap-3 text-sm sm:text-base text-gray-800 dark:text-gray-200 font-medium bg-gray-50/80 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <span className="text-xl shrink-0">👋</span>
                <p className="leading-relaxed">
                  {profile?.bio ||
                    "Passionate home cook exploring authentic Bengali spice blends, heritage heirloom recipes, and sharing warmth through food."}
                </p>
              </div>
            </div>

            {/* Pinned Details Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  Pinned details
                </h3>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("PINNED")}
                    title="Edit Pinned details"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#e02f21] hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                {/* Location */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span>Lives in </span>
                    <strong className="text-gray-900 dark:text-white">
                      {profile?.city || profile?.hometown || "Dhaka, Bangladesh"}
                    </strong>
                  </div>
                </div>

                {/* Work */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <span>Works at </span>
                    <strong className="text-gray-900 dark:text-white">
                      {profile?.work || "Culinary Creator & Chef"}
                    </strong>
                  </div>
                </div>

                {/* Education */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <span>Studied at </span>
                    <strong className="text-gray-900 dark:text-white">
                      {profile?.education || "University of Dhaka"}
                    </strong>
                  </div>
                </div>

                {/* Social / Instagram */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <Instagram size={16} />
                  </div>
                  <div>
                    {profile?.socialLinks ? (
                      <a
                        href={
                          profile.socialLinks.startsWith("http")
                            ? profile.socialLinks
                            : `https://instagram.com/${profile.socialLinks.replace(/^@/, "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 dark:text-white font-bold hover:text-[#e02f21] hover:underline transition"
                      >
                        {profile.socialLinks}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-white font-bold">
                        @{profile?.username || "chef"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => openModal("PINNED")}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    Edit details
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PERSONAL DETAILS (Matching Image 5) */}
        {activeCategory === "PERSONAL" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Personal details
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Gender */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Gender</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {profile?.gender || "Not specified"}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("GENDER")}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Hometown */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Hometown</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {profile?.hometown || profile?.city || "Dhaka, Bangladesh"}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("HOMETOWN")}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Languages */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Languages</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {profile?.languages || "Bangla, English"}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("LANGUAGES")}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Culinary Expertise */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Culinary Expertise
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {profile?.expertise || "Authentic Bengali, Mughlai & Street Food"}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("EXPERTISE")}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. WORK */}
        {activeCategory === "WORK" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Work
              </h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => openModal("WORK")}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Plus size={16} /> Add or edit workplace
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#e02f21] shrink-0">
                  <Briefcase size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {profile?.work || "Culinary Creator & Chef"}
                    </h4>
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => openModal("WORK")}
                        className="text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Heshel Culinary Community
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    Preserving traditional Bengali recipes and sharing kitchen techniques with food lovers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. EDUCATION */}
        {activeCategory === "EDUCATION" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Education
              </h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => openModal("EDUCATION")}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Plus size={16} /> Add or edit education
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#e02f21] shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {profile?.education || "University of Dhaka"}
                    </h4>
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => openModal("EDUCATION")}
                        className="text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Alma Mater & Culinary Learning
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. HOBBIES */}
        {activeCategory === "HOBBIES" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Hobbies
              </h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => openModal("HOBBIES")}
                  className="flex items-center gap-1 text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Edit2 size={14} /> Edit hobbies
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {hobbiesList.map((hobby: string, i: number) => {
                const matchDefault = DEFAULT_HOBBIES.find(
                  (dh) => dh.label.toLowerCase() === hobby.toLowerCase()
                );
                return (
                  <span
                    key={i}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{matchDefault?.icon || "✨"}</span>
                    <span>{hobby}</span>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. INTERESTS */}
        {activeCategory === "INTERESTS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Culinary Interests & Passions
              </h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => openModal("INTERESTS")}
                  className="flex items-center gap-1 text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Edit2 size={14} /> Edit interests
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestsList.map((item: string, idx: number) => {
                const matchDefault = DEFAULT_INTERESTS.find(
                  (di) => di.title.toLowerCase() === item.toLowerCase()
                );
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                  >
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {item}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {matchDefault?.desc || "Culinary fascination and recipe exploration"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. LINKS */}
        {activeCategory === "LINKS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Websites & Social Links
              </h3>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => openModal("LINKS")}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Plus size={16} /> Add or edit links
                </button>
              )}
            </div>

            <div className="space-y-3.5">
              {/* Instagram / Social */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-3.5">
                  <Instagram size={20} className="text-pink-500" />
                  <div>
                    <p className="text-xs text-gray-500">Social profile</p>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile?.socialLinks || `@${profile?.username || "chef"}`}
                    </span>
                  </div>
                </div>
                {profile?.socialLinks && (
                  <a
                    href={
                      profile.socialLinks.startsWith("http")
                        ? profile.socialLinks
                        : `https://instagram.com/${profile.socialLinks.replace(/^@/, "")}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#e02f21] hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Website */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                <div className="flex items-center gap-3.5">
                  <Globe size={20} className="text-[#e02f21]" />
                  <div>
                    <p className="text-xs text-gray-500">Website / Blog</p>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {profile?.website || `heshel.app/@${profile?.username || "chef"}`}
                    </span>
                  </div>
                </div>
                {profile?.website && (
                  <a
                    href={
                      profile.website.startsWith("http")
                        ? profile.website
                        : `https://${profile.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#e02f21] hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 8. CONTACT INFO */}
        {activeCategory === "CONTACT" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Contact Information
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* Email */}
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Email Address</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {profile?.email || "No email available"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400 rounded-md">
                  Verified
                </span>
              </div>

              {/* Phone */}
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Phone Number</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {profile?.phone || "Not specified"}
                    </p>
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => openModal("PHONE")}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* INDIVIDUAL MODALS WITH SPINNERS */}
      {/* ============================================================ */}

      {/* 1. EDIT BIO MODAL */}
      <Modal
        isOpen={activeModal === "BIO"}
        onClose={() => setActiveModal(null)}
        title="Edit Bio"
        subtitle="Share a brief culinary bio with the community"
      >
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Bio
            </label>
            <textarea
              rows={4}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Tell others about your cooking philosophy and favorite dishes..."
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {bioInput.length}/300 characters
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField({ bio: bioInput.trim() }, "Bio updated successfully!")
              }
            >
              Save Bio
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. EDIT PINNED DETAILS MODAL */}
      <Modal
        isOpen={activeModal === "PINNED"}
        onClose={() => setActiveModal(null)}
        title="Edit Pinned Details"
        subtitle="Manage your location, workplace, education and social links"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Lives in / Location
            </label>
            <input
              type="text"
              value={pinnedCity}
              onChange={(e) => setPinnedCity(e.target.value)}
              placeholder="e.g. Dhaka, Bangladesh"
              className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Works at / Culinary Role
            </label>
            <input
              type="text"
              value={pinnedWork}
              onChange={(e) => setPinnedWork(e.target.value)}
              placeholder="e.g. Culinary Creator & Chef"
              className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Studied at / Alma Mater
            </label>
            <input
              type="text"
              value={pinnedEdu}
              onChange={(e) => setPinnedEdu(e.target.value)}
              placeholder="e.g. University of Dhaka"
              className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Social Link / Handle
            </label>
            <input
              type="text"
              value={pinnedSocial}
              onChange={(e) => setPinnedSocial(e.target.value)}
              placeholder="e.g. @chef_sifat or instagram.com/chef_sifat"
              className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  {
                    city: pinnedCity.trim(),
                    work: pinnedWork.trim(),
                    education: pinnedEdu.trim(),
                    socialLinks: pinnedSocial.trim(),
                  },
                  "Pinned details updated successfully!"
                )
              }
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. EDIT GENDER MODAL */}
      <Modal
        isOpen={activeModal === "GENDER"}
        onClose={() => setActiveModal(null)}
        title="Edit Gender"
        subtitle="Choose your preferred gender identity"
      >
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            {["Male", "Female", "Prefer not to say", "Other"].map((option) => (
              <label
                key={option}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  genderInput === option
                    ? "border-[#e02f21] bg-red-50/50 dark:bg-red-950/20 text-[#e02f21]"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
              >
                <span className="font-semibold text-sm sm:text-base">{option}</span>
                <input
                  type="radio"
                  name="gender"
                  value={option}
                  checked={genderInput === option}
                  onChange={(e) => setGenderInput(e.target.value)}
                  className="w-4 h-4 text-[#e02f21] focus:ring-[#e02f21]"
                />
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField({ gender: genderInput }, "Gender updated successfully!")
              }
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. EDIT HOMETOWN MODAL */}
      <Modal
        isOpen={activeModal === "HOMETOWN"}
        onClose={() => setActiveModal(null)}
        title="Edit Hometown"
        subtitle="Where are you originally from?"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Hometown
            </label>
            <input
              type="text"
              value={hometownInput}
              onChange={(e) => setHometownInput(e.target.value)}
              placeholder="e.g. Dhaka, Bangladesh"
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Dhaka, Bangladesh",
                "Chittagong, Bangladesh",
                "Sylhet, Bangladesh",
                "Rajshahi, Bangladesh",
                "Narayanganj, Bangladesh",
                "Khulna, Bangladesh",
              ].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setHometownInput(city)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { hometown: hometownInput.trim(), city: hometownInput.trim() },
                  "Hometown updated successfully!"
                )
              }
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* 5. EDIT LANGUAGES MODAL */}
      <Modal
        isOpen={activeModal === "LANGUAGES"}
        onClose={() => setActiveModal(null)}
        title="Edit Languages"
        subtitle="Languages you communicate in"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Languages
            </label>
            <input
              type="text"
              value={languagesInput}
              onChange={(e) => setLanguagesInput(e.target.value)}
              placeholder="e.g. Bangla, English"
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Tap to add:</p>
            <div className="flex flex-wrap gap-2">
              {["Bangla", "English", "Sylheti", "Chittagonian", "Hindi", "Urdu", "Arabic"].map(
                (lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      if (!languagesInput.includes(lang)) {
                        setLanguagesInput(
                          languagesInput ? `${languagesInput}, ${lang}` : lang
                        );
                      }
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                  >
                    + {lang}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { languages: languagesInput.trim() },
                  "Languages updated successfully!"
                )
              }
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. EDIT CULINARY EXPERTISE MODAL */}
      <Modal
        isOpen={activeModal === "EXPERTISE"}
        onClose={() => setActiveModal(null)}
        title="Edit Culinary Expertise"
        subtitle="Specialties, cuisines, and signature cooking domains"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Expertise & Specialties
            </label>
            <input
              type="text"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              placeholder="e.g. Authentic Bengali, Mughlai & Street Food"
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Popular specialties:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Authentic Bengali",
                "Mughlai",
                "Street Food",
                "Traditional Sweets & Pitha",
                "Kacchi & Biryani",
                "Desi Fish Curries",
                "Baking & Pastry",
                "Slow Wood-fire Cooking",
              ].map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => {
                    if (!expertiseInput.includes(spec)) {
                      setExpertiseInput(
                        expertiseInput ? `${expertiseInput}, ${spec}` : spec
                      );
                    }
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
                >
                  + {spec}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { expertise: expertiseInput.trim() },
                  "Culinary expertise updated successfully!"
                )
              }
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* 7. EDIT WORK MODAL */}
      <Modal
        isOpen={activeModal === "WORK"}
        onClose={() => setActiveModal(null)}
        title="Edit Workplace"
        subtitle="Share your workplace, role, or kitchen affiliation"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Workplace / Title
            </label>
            <input
              type="text"
              value={workInput}
              onChange={(e) => setWorkInput(e.target.value)}
              placeholder="e.g. Culinary Creator & Chef at Softvence Agency"
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { work: workInput.trim() },
                  "Workplace updated successfully!"
                )
              }
            >
              Save Workplace
            </Button>
          </div>
        </div>
      </Modal>

      {/* 8. EDIT EDUCATION MODAL */}
      <Modal
        isOpen={activeModal === "EDUCATION"}
        onClose={() => setActiveModal(null)}
        title="Edit Education"
        subtitle="Add your school, college, or university"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              School / College / University
            </label>
            <input
              type="text"
              value={eduInput}
              onChange={(e) => setEduInput(e.target.value)}
              placeholder="e.g. University of Dhaka"
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { education: eduInput.trim() },
                  "Education updated successfully!"
                )
              }
            >
              Save Education
            </Button>
          </div>
        </div>
      </Modal>

      {/* 9. EDIT HOBBIES MODAL */}
      <Modal
        isOpen={activeModal === "HOBBIES"}
        onClose={() => setActiveModal(null)}
        title="Edit Hobbies"
        subtitle="Select or add your culinary and creative hobbies"
      >
        <div className="p-6 space-y-5">
          {/* Selected Hobbies Badges */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Your Hobbies ({selectedHobbies.length})
            </label>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-gray-700">
              {selectedHobbies.length === 0 ? (
                <span className="text-xs text-gray-400">
                  No hobbies selected yet. Tap any hobby below to select.
                </span>
              ) : (
                selectedHobbies.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-[#e02f21] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{h}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedHobbies((prev) => prev.filter((item) => item !== h))
                      }
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick Select Preset Hobbies */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Tap to toggle:</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_HOBBIES.map((h) => {
                const isSelected = selectedHobbies.includes(h.label);
                return (
                  <button
                    key={h.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedHobbies((prev) =>
                          prev.filter((item) => item !== h.label)
                        );
                      } else {
                        setSelectedHobbies((prev) => [...prev, h.label]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-red-50 text-[#e02f21] border border-[#e02f21] dark:bg-red-950/30"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{h.icon}</span>
                    <span>{h.label}</span>
                    {isSelected && <Check size={13} className="text-[#e02f21]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Hobby Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customHobbyInput}
              onChange={(e) => setCustomHobbyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const clean = customHobbyInput.trim();
                  if (clean && !selectedHobbies.includes(clean)) {
                    setSelectedHobbies((prev) => [...prev, clean]);
                    setCustomHobbyInput("");
                  }
                }
              }}
              placeholder="Add custom hobby..."
              className="flex-1 p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs sm:text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const clean = customHobbyInput.trim();
                if (clean && !selectedHobbies.includes(clean)) {
                  setSelectedHobbies((prev) => [...prev, clean]);
                  setCustomHobbyInput("");
                }
              }}
            >
              Add
            </Button>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { hobbies: selectedHobbies.join(", ") },
                  "Hobbies updated successfully!"
                )
              }
            >
              Save Hobbies
            </Button>
          </div>
        </div>
      </Modal>

      {/* 10. EDIT INTERESTS MODAL */}
      <Modal
        isOpen={activeModal === "INTERESTS"}
        onClose={() => setActiveModal(null)}
        title="Edit Culinary Interests"
        subtitle="Choose the cooking traditions and gastronomy you're passionate about"
      >
        <div className="p-6 space-y-5">
          {/* Selected Interests Badges */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Your Interests ({selectedInterests.length})
            </label>
            <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-gray-700">
              {selectedInterests.length === 0 ? (
                <span className="text-xs text-gray-400">
                  No interests selected yet. Tap any interest below to select.
                </span>
              ) : (
                selectedInterests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-[#e02f21] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedInterests((prev) =>
                          prev.filter((item) => item !== interest)
                        )
                      }
                      className="hover:opacity-75 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick Select Presets */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">Tap to toggle:</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_INTERESTS.map((item) => {
                const isSelected = selectedInterests.includes(item.title);
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedInterests((prev) =>
                          prev.filter((i) => i !== item.title)
                        );
                      } else {
                        setSelectedInterests((prev) => [...prev, item.title]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-red-50 text-[#e02f21] border border-[#e02f21] dark:bg-red-950/30"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{item.title}</span>
                    {isSelected && <Check size={13} className="text-[#e02f21]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Interest Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customInterestInput}
              onChange={(e) => setCustomInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const clean = customInterestInput.trim();
                  if (clean && !selectedInterests.includes(clean)) {
                    setSelectedInterests((prev) => [...prev, clean]);
                    setCustomInterestInput("");
                  }
                }
              }}
              placeholder="Add custom interest..."
              className="flex-1 p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs sm:text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const clean = customInterestInput.trim();
                if (clean && !selectedInterests.includes(clean)) {
                  setSelectedInterests((prev) => [...prev, clean]);
                  setCustomInterestInput("");
                }
              }}
            >
              Add
            </Button>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { interests: selectedInterests.join(", ") },
                  "Culinary interests updated successfully!"
                )
              }
            >
              Save Interests
            </Button>
          </div>
        </div>
      </Modal>

      {/* 11. EDIT LINKS MODAL */}
      <Modal
        isOpen={activeModal === "LINKS"}
        onClose={() => setActiveModal(null)}
        title="Edit Websites & Social Links"
        subtitle="Manage your public web links and Instagram"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Social Profile / Instagram Handle
            </label>
            <input
              type="text"
              value={socialLinksInput}
              onChange={(e) => setSocialLinksInput(e.target.value)}
              placeholder="e.g. @chef_sifat or instagram.com/chef_sifat"
              className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Website / Blog URL
            </label>
            <input
              type="text"
              value={websiteInput}
              onChange={(e) => setWebsiteInput(e.target.value)}
              placeholder="e.g. https://myculinaryblog.com"
              className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  {
                    website: websiteInput.trim(),
                    socialLinks: socialLinksInput.trim(),
                  },
                  "Links updated successfully!"
                )
              }
            >
              Save Links
            </Button>
          </div>
        </div>
      </Modal>

      {/* 12. EDIT PHONE MODAL */}
      <Modal
        isOpen={activeModal === "PHONE"}
        onClose={() => setActiveModal(null)}
        title="Edit Phone Number"
        subtitle="Update the phone number linked to your profile"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. +880 1712-345678"
              className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              size="md"
              onClick={() => setActiveModal(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={saving}
              disabled={saving}
              onClick={() =>
                handleSaveField(
                  { phone: phoneInput.trim() },
                  "Phone number updated successfully!"
                )
              }
            >
              Save Phone Number
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileAboutCard;
