import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ArrowLeft,
  Camera,
  User,
  AtSign,
  FileText,
} from 'lucide-react';
import Button from '../../../components/ui/Button';

const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  saving,
}) => {
  const [subView, setSubView] = useState('MENU'); // 'MENU', 'NAME', 'USERNAME', 'PICTURE', 'DETAILS', 'BIO'

  // Form states
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [work, setWork] = useState(profile?.work || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [imagePreview, setImagePreview] = useState(profile?.image || '');
  const [imageFile, setImageFile] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
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
        imageFile
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Dynamic Subview Title */}
        <div className="relative px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {subView !== 'MENU' && (
              <button
                type="button"
                onClick={() => setSubView('MENU')}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition mr-1"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {subView === 'MENU' && 'Edit profile'}
              {subView === 'NAME' && 'Update Name'}
              {subView === 'USERNAME' && 'Update Username'}
              {subView === 'PICTURE' && 'Update Profile Picture'}
              {subView === 'BIO' && 'Update Bio'}
              {subView === 'DETAILS' && 'Edit Personal Details'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 text-gray-500 dark:text-gray-300 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Menu SubView */}
          {subView === 'MENU' && (
            <div className="space-y-4">
              {/* Profile Avatar Edit Preview */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={imagePreview || profile?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                      alt={profile?.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                    />
                    <label className="absolute bottom-0 right-0 p-1 rounded-full bg-[#e02f21] text-white cursor-pointer hover:bg-[#c22417] shadow-sm transition">
                      <Camera size={11} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      Profile picture
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Tap the camera icon to select a new photo
                    </p>
                  </div>
                </div>

                <label className="text-xs font-bold text-[#e02f21] hover:underline cursor-pointer">
                  Edit
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e.target.files?.[0])}
                  />
                </label>
              </div>

              {/* Navigation List to detailed edit screens */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSubView('NAME')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Full Name
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {name || 'Add your full name'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('USERNAME')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <AtSign size={16} className="text-gray-400" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Username
                      </span>
                      <span className="text-[11px] text-gray-400">
                        @{username || 'handle'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('BIO')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-400" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Bio
                      </span>
                      <span className="text-[11px] text-gray-400 line-clamp-1">
                        {bio || 'Describe yourself to the foodie community'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('DETAILS')}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Personal & Contact details
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Location, Work, Education, Phone, Gender
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Bottom Info Note */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 leading-relaxed border border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  Heshel Profile Settings
                </p>
                <p className="text-[11px] mt-0.5">
                  Your profile information helps fellow foodies recognize your family recipes and cooking style.
                </p>
              </div>
            </div>
          )}

          {/* SubView: Name Update */}
          {subView === 'NAME' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs sm:text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setSubView('MENU')}>
                  Back
                </Button>
                <Button type="submit" loading={saving} variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Username Update */}
          {subView === 'USERNAME' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-3 py-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs sm:text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setSubView('MENU')}>
                  Back
                </Button>
                <Button type="submit" loading={saving} variant="primary" size="sm">
                  Save Username
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Bio Update */}
          {subView === 'BIO' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Describe your cooking journey..."
                  className="w-full p-3 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs sm:text-sm dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setSubView('MENU')}>
                  Back
                </Button>
                <Button type="submit" loading={saving} variant="primary" size="sm">
                  Save Bio
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Details Update (Bio, Location, Work, Education, Phone, Gender) */}
          {subView === 'DETAILS' && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Bio / Culinary Quote
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell foodies about your cooking style..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">
                    City / Lives In
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Work</label>
                <input
                  type="text"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="e.g. Chef, Software Engineer, Teacher"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Education</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. Dhaka University"
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setSubView('MENU')}>
                  Back
                </Button>
                <Button type="submit" loading={saving} variant="primary" size="sm">
                  Save Details
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

