import React, { useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal";
import defaultUserAvatar from "../../../assets/user-image.png";
import { useToast } from "../../../context/ToastContext";
import {
  X,
  ChevronRight,
  ArrowLeft,
  Camera,
  User,
  AtSign,
  FileText,
} from "lucide-react";
import Button from "../../../components/ui/Button";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSaveProfile: (data: any, imageFile?: File | null) => Promise<void>;
  saving: boolean;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  saving,
}) => {
  const [subView, setSubView] = useState<
    "MENU" | "NAME" | "USERNAME" | "BIO" | "DETAILS"
  >("MENU");

  // Form states
  const [name, setName] = useState(profile?.name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [city, setCity] = useState(profile?.city || "");
  const [work, setWork] = useState(profile?.work || "");
  const [education, setEducation] = useState(profile?.education || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [gender, setGender] = useState(profile?.gender || "Male");
  const [imagePreview, setImagePreview] = useState(profile?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { notify } = useToast();
  useEffect(() => {
    if (!isOpen || !profile) return;
    setSubView("MENU");
    setName(profile.name || "");
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setCity(profile.city || "");
    setWork(profile.work || "");
    setEducation(profile.education || "");
    setPhone(profile.phone || "");
    setGender(profile.gender || "");
    setImagePreview(profile.image || "");
    setImageFile(null);
  }, [isOpen, profile]);
  useEffect(
    () => () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  if (!isOpen) return null;

  const handleImageChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      notify.error("Choose a profile image smaller than 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveProfile) {
      onSaveProfile(
        {
          name: name.trim(),
          username: username.trim(),
          bio: bio.trim(),
          city: city.trim(),
          work: work.trim(),
          education: education.trim(),
          phone: phone.trim(),
          gender,
        },
        imageFile,
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showClose={false}
      maxWidth="max-w-[540px]"
    >
      <div className="flex flex-col max-h-[90dvh]">
        {/* Header with Dynamic Subview Title */}
        <div className="relative px-6 py-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {subView !== "MENU" && (
              <button
                type="button"
                onClick={() => setSubView("MENU")}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition mr-1 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h3 className="font-black text-lg sm:text-xl text-gray-900 dark:text-white">
              {subView === "MENU" && "Edit profile"}
              {subView === "NAME" && "Update Name"}
              {subView === "USERNAME" && "Update Username"}
              {subView === "BIO" && "Update Bio"}
              {subView === "DETAILS" && "Edit Personal Details"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 text-gray-500 dark:text-gray-300 flex items-center justify-center transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Menu SubView */}
          {subView === "MENU" && (
            <div className="space-y-4">
              {/* Profile Avatar Edit Preview */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={
                        imagePreview ||
                        profile?.image ||
                        defaultUserAvatar
                      }
                      alt={profile?.name}
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 shadow-sm"
                    />
                    <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#e02f21] text-white cursor-pointer hover:bg-[#c22417] shadow-sm transition">
                      <Camera size={13} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                      Profile picture
                    </h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Tap the camera icon to select a new photo
                    </p>
                  </div>
                </div>

                <label className="text-base font-bold text-[#e02f21] hover:underline cursor-pointer">
                  Edit
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                  />
                </label>
              </div>

              {imageFile && (
                <Button onClick={handleSubmit} loading={saving}>
                  Save profile photo
                </Button>
              )}

              {/* Navigation List to detailed edit screens */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setSubView("NAME")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <User size={20} className="text-gray-400" />
                    <div>
                      <span className="text-base font-bold text-gray-900 dark:text-white block">
                        Full Name
                      </span>
                      <span className="text-sm text-gray-500 mt-0.5">
                        {name || "Add your full name"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView("USERNAME")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <AtSign size={20} className="text-gray-400" />
                    <div>
                      <span className="text-base font-bold text-gray-900 dark:text-white block">
                        Username
                      </span>
                      <span className="text-sm text-gray-500 mt-0.5">
                        @{username || "handle"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView("BIO")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <FileText size={20} className="text-gray-400" />
                    <div>
                      <span className="text-base font-bold text-gray-900 dark:text-white block">
                        Bio
                      </span>
                      <span className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                        {bio || "Describe yourself to the foodie community"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView("DETAILS")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition cursor-pointer"
                >
                  <div>
                    <span className="text-base font-bold text-gray-900 dark:text-white block">
                      Personal & Contact details
                    </span>
                    <span className="text-sm text-gray-500 mt-0.5">
                      Location, Work, Education, Phone, Gender
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Bottom Info Note */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-500 leading-relaxed border border-gray-100 dark:border-gray-700">
                <p className="font-bold text-base text-gray-800 dark:text-gray-200">
                  Heshel Profile Settings
                </p>
                <p className="text-sm mt-1">
                  Your profile information helps fellow foodies recognize your
                  family recipes and cooking style.
                </p>
              </div>
            </div>
          )}

          {/* SubView: Name Update */}
          {subView === "NAME" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSubView("MENU")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  variant="primary"
                  size="md"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Username Update */}
          {subView === "USERNAME" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-bold">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      )
                    }
                    placeholder="username"
                    className="w-full pl-9 pr-4 py-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSubView("MENU")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  variant="primary"
                  size="md"
                >
                  Save Username
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Bio Update */}
          {subView === "BIO" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Describe your cooking journey..."
                  className="w-full p-3.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21] resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSubView("MENU")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  variant="primary"
                  size="md"
                >
                  Save Bio
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Details Update (Location, Work, Education, Phone, Gender) */}
          {subView === "DETAILS" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Bio / Culinary Quote
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell foodies about your cooking style..."
                  className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    City / Lives In
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1..."
                    className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Work
                </label>
                <input
                  type="text"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="e.g. Chef, Software Engineer, Teacher"
                  className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. Dhaka University"
                    className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-sm sm:text-base dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e02f21]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setSubView("MENU")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  variant="primary"
                  size="md"
                >
                  Save Details
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
