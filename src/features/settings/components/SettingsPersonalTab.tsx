import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Avatar from '../../../components/ui/Avatar';
import { User, AtSign, Mail, Phone, MapPin, Briefcase, GraduationCap, Camera } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useSession } from '../../../lib/auth-client';
import { profileApi } from '../../profile/api/profile.api';

const SettingsPersonalTab = ({ user, onUserUpdated }) => {
  const { notify } = useToast();
  const { data: session } = useSession();
  const token = session?.session?.token;

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [work, setWork] = useState(user?.work || '');
  const [education, setEducation] = useState(user?.education || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profileApi.updateBio(
        {
          name: name.trim(),
          username: username.trim(),
          phone: phone.trim(),
          city: city.trim(),
          work: work.trim(),
          education: education.trim(),
          bio: bio.trim(),
        },
        token
      );

      notify.success('Personal details saved');
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      notify.error(err.message || 'Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Personal Details & Contact
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Update the details you’d like to share on your foodie profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Name & Username Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Identity & Handle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Username (@handle)
              </label>
              <div className="relative">
                <AtSign size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. chef_rahima"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-500 cursor-not-allowed border border-transparent"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Managed via authentication provider</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Profile Details Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            About & Culinary Bio
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                City / Location
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Work / Culinary Role
              </label>
              <div className="relative">
                <Briefcase size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="e.g. Home Chef"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Education / Alma Mater
              </label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. University of Dhaka"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              Culinary Bio & Passion
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other foodies about your cooking journey, favorite spices, and family heritage recipes..."
              className="w-full p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-sm dark:text-white focus:outline-none border border-transparent focus:border-red-300 resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            loading={saving}
            className="px-6 py-2.5 text-sm font-bold bg-[#e02f21] hover:bg-[#c22417] text-white rounded-xl shadow-xs"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPersonalTab;

