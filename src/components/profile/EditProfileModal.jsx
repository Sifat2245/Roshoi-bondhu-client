import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ArrowLeft,
  Camera,
  User,
  AtSign,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  FileText,
} from 'lucide-react';
import Button from '../ui/Button';

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
      onSaveProfile({
        name: name.trim(),
        username: username.trim(),
        bio: bio.trim(),
        city: city.trim(),
        work: work.trim(),
        education: education.trim(),
        phone: phone.trim(),
        gender,
        imageFile,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[500px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Back Arrow and Close button (Matching Image 4) */}
        <div className="relative px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          {subView !== 'MENU' ? (
            <button
              type="button"
              onClick={() => setSubView('MENU')}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className="w-6"></div>
          )}

          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
            {subView === 'MENU'
              ? 'Edit profile'
              : subView === 'NAME'
              ? 'Update Name'
              : subView === 'USERNAME'
              ? 'Update Username'
              : subView === 'PICTURE'
              ? 'Profile Picture'
              : 'Personal Details'}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Main Menu View (Matching Image 4) */}
          {subView === 'MENU' && (
            <div className="space-y-4">
              {/* Centered Avatar and User Header */}
              <div className="text-center py-2">
                <div className="relative inline-block">
                  <img
                    src={imagePreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-gray-100 dark:ring-gray-700 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setSubView('PICTURE')}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#e02f21] text-white shadow-md cursor-pointer hover:scale-105 transition"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <h4 className="font-black text-base text-gray-900 dark:text-white mt-2">
                  {name || profile.name}
                </h4>
                <p className="text-xs text-gray-400">
                  {username ? `@${username}` : `@${profile.name.toLowerCase().replace(/\s+/g, '_')}`}
                </p>
              </div>

              {/* Navigation Menu List with Chevrons (Matching Image 4) */}
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSubView('NAME')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3a3b3c] transition cursor-pointer text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Name
                    </span>
                    <span className="text-[11px] text-gray-400">{name || profile.name}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('USERNAME')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3a3b3c] transition cursor-pointer text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Username
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {username ? `@${username}` : 'Set username'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('PICTURE')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3a3b3c] transition cursor-pointer text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Profile picture
                    </span>
                    <span className="text-[11px] text-gray-400">Update photo</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setSubView('DETAILS')}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#3a3b3c] transition cursor-pointer text-left"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Personal & Contact details
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Location, Work, Education, Phone
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Bottom Info Note (Matching Image 4) */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 leading-relaxed border border-gray-100 dark:border-gray-700">
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  Hesheli Profile Settings
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
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* SubView: Picture Update */}
          {subView === 'PICTURE' && (
            <div className="space-y-4 text-center py-2">
              <img
                src={imagePreview || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt=""
                className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-[#e02f21]/20 shadow-md"
              />

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e02f21] hover:bg-[#c22417] text-white text-xs font-bold cursor-pointer transition shadow-xs">
                <Camera size={16} />
                <span>Upload New Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />
              </label>

              <div className="flex justify-center gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setSubView('MENU')}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={saving}
                  disabled={!imageFile}
                  variant="primary"
                  size="sm"
                >
                  Save Picture
                </Button>
              </div>
            </div>
          )}

          {/* SubView: Details Update (Bio, Location, Work, Education, Phone) */}
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

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Education</label>
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Dhaka University, Le Cordon Bleu"
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none"
                />
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

