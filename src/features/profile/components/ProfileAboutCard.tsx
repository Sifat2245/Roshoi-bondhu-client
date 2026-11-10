import React, { useState } from "react";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Instagram,
  Phone,
  Mail,
  Calendar,
  Heart,
  Smile,
  Compass,
  Tag,
  Plus,
  Edit2,
  Link2,
  User,
  Quote,
  MoreHorizontal,
  ChefHat,
  Coffee,
  Camera,
} from "lucide-react";

interface ProfileAboutCardProps {
  profile: any;
  isOwnProfile?: boolean;
  onOpenEditModal?: () => void;
}

type AboutCategory =
  | "INTRO"
  | "PERSONAL"
  | "WORK"
  | "EDUCATION"
  | "HOBBIES"
  | "INTERESTS"
  | "TRAVEL"
  | "LINKS"
  | "CONTACT"
  | "NAMES"
  | "DETAILS";

const categories: { id: AboutCategory; label: string }[] = [
  { id: "INTRO", label: "Intro" },
  { id: "PERSONAL", label: "Personal details" },
  { id: "WORK", label: "Work" },
  { id: "EDUCATION", label: "Education" },
  { id: "HOBBIES", label: "Hobbies" },
  { id: "INTERESTS", label: "Interests" },
  { id: "TRAVEL", label: "Travel" },
  { id: "LINKS", label: "Links" },
  { id: "CONTACT", label: "Contact info" },
  { id: "NAMES", label: "Names" },
  { id: "DETAILS", label: "Details about you" },
];

const ProfileAboutCard: React.FC<ProfileAboutCardProps> = ({
  profile,
  isOwnProfile,
  onOpenEditModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<AboutCategory>("INTRO");

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      {/* Left Column: Category Menu (Matching Image 2) */}
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
        {/* 1. INTRO (Exact Match to Image 2) */}
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
                    onClick={onOpenEditModal}
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
                  {profile.bio ||
                    "Passionate home cook exploring authentic Bengali spice blends, heritage heirloom recipes, and sharing warmth through food."}
                </p>
              </div>
            </div>

            {/* Pinned Details Section (Exact Match to Image 2 with Pencil Icon) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                  Pinned details
                </h3>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={onOpenEditModal}
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
                      {profile.city || "Narayanganj, Bangladesh"}
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
                      {profile.work || "Softvence Agency"}
                    </strong>
                  </div>
                </div>

                {/* Education 1 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <span>Studied at </span>
                    <strong className="text-gray-900 dark:text-white">
                      {profile.education || "M.W High school"}
                    </strong>
                  </div>
                </div>

                {/* Education 2 */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <span>Went to </span>
                    <strong className="text-gray-900 dark:text-white">
                      Narayanganj University College
                    </strong>
                  </div>
                </div>

                {/* Instagram / Social */}
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                    <Instagram size={16} />
                  </div>
                  <div>
                    <a
                      href={`https://instagram.com/${profile.username || "sifat_224"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 dark:text-white font-bold hover:text-[#e02f21] hover:underline transition"
                    >
                      {profile.username ? `@${profile.username}` : "@sifat_224"}
                    </a>
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={onOpenEditModal}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
                  >
                    Edit details
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. PERSONAL DETAILS */}
        {activeCategory === "PERSONAL" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Personal details
            </h3>
            <div className="divide-y divide-gray-100 dark:border-gray-800">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Gender</p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {profile.gender || "Not specified"}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={onOpenEditModal}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Hometown
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    {profile.city || "Dhaka, Bangladesh"}
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={onOpenEditModal}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Languages
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    Bangla, English
                  </p>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={onOpenEditModal}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Culinary Expertise
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white">
                    Authentic Bengali, Mughlai & Street Food
                  </p>
                </div>
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
                  onClick={onOpenEditModal}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Plus size={16} /> Add workplace
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#e02f21] shrink-0">
                  <Briefcase size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {profile.work || "Culinary Creator & Chef"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Heshel Community Kitchen • 2022 - Present
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                    Specializing in preserving heritage culinary techniques and
                    mentoring home cooks.
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
                  onClick={onOpenEditModal}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Plus size={16} /> Add school or college
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#e02f21] shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    {profile.education ||
                      "Culinary Art & Traditional Bengali Gastronomy"}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Graduated with Distinction
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#e02f21] shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    M.W High school
                  </h4>
                  <p className="text-sm text-gray-500">Secondary Education</p>
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
                  onClick={onOpenEditModal}
                  className="flex items-center gap-1 text-xs font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Edit2 size={14} /> Edit hobbies
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {[
                { label: "Traditional Cooking", icon: "🍲" },
                { label: "Baking & Desserts", icon: "🍰" },
                { label: "Food Photography", icon: "📸" },
                { label: "Spice Blending", icon: "🌶️" },
                { label: "Recipe Testing", icon: "📝" },
                { label: "Culinary Travel", icon: "✈️" },
                { label: "Kitchen Gardening", icon: "🌱" },
                { label: "Adda & Tea Sessions", icon: "☕" },
              ].map((h, i) => (
                <span
                  key={i}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 shadow-xs"
                >
                  <span>{h.icon}</span>
                  <span>{h.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 6. INTERESTS */}
        {activeCategory === "INTERESTS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Culinary Interests & Passions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
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
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                >
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TRAVEL */}
        {activeCategory === "TRAVEL" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Places Lived & Culinary Journeys
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5">
                <MapPin size={20} className="text-[#e02f21]" />
                <div>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {profile.city || "Narayanganj, Bangladesh"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Current city
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <MapPin size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Dhaka, Bangladesh
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Work & Culinary Community
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. LINKS */}
        {activeCategory === "LINKS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                Websites & Social Links
              </h3>
              {isOwnProfile && (
                <button
                  onClick={onOpenEditModal}
                  className="flex items-center gap-1.5 text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                >
                  <Plus size={16} /> Add social link
                </button>
              )}
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                <Instagram size={20} className="text-pink-500" />
                <a
                  href={`https://instagram.com/${profile.username || "sifat_224"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-gray-900 dark:text-white hover:text-[#e02f21] hover:underline"
                >
                  instagram.com/{profile.username || "sifat_224"}
                </a>
              </div>
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40">
                <Globe size={20} className="text-[#e02f21]" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  heshel.app/@{profile.username || "sifat"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 9. CONTACT INFO */}
        {activeCategory === "CONTACT" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Contact Information
            </h3>
            <div className="divide-y divide-gray-100 dark:border-gray-800">
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Email</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Phone</p>
                    <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {profile.phone || "+880 1712-345678"}
                    </p>
                  </div>
                </div>
                {isOwnProfile && (
                  <button
                    onClick={onOpenEditModal}
                    className="text-sm font-bold text-[#e02f21] hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 10. NAMES */}
        {activeCategory === "NAMES" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Names
            </h3>
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
                <p className="text-base font-black text-gray-900 dark:text-white">
                  {profile.name}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <p className="text-xs sm:text-sm text-gray-500">Username</p>
                <p className="text-base font-black text-gray-900 dark:text-white">
                  @{profile.username || "chef"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 11. DETAILS ABOUT YOU */}
        {activeCategory === "DETAILS" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              Details about you
            </h3>
            <div className="space-y-4">
              <div className="p-4.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-500 mb-1">
                  About {profile.name}
                </p>
                <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                  {profile.bio ||
                    "A passionate home cook committed to documenting traditional culinary practices, generational spice blends, and the cultural stories behind regional Bangladeshi gastronomy."}
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                <p className="text-sm font-bold text-[#e02f21] mb-1">
                  Favorite Food Quote
                </p>
                <p className="text-sm sm:text-base italic text-gray-700 dark:text-gray-300">
                  "Cooking is an act of love made edible for friends and
                  family."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAboutCard;
