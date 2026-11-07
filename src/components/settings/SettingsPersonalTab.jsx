import React, { useState } from 'react';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { User, AtSign, Mail, Phone, MapPin, Briefcase, GraduationCap, Camera } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SettingsPersonalTab = ({ user, onUserUpdated }) => {
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
      const res = await fetch(`${API_BASE}/api/user/bio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          phone: phone.trim(),
          city: city.trim(),
          work: work.trim(),
          education: education.trim(),
          bio: bio.trim(),
        }),
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Personal Details Saved!',
          timer: 1500,
          showConfirmButton: false,
        });
        if (onUserUpdated) onUserUpdated();
      } else {
        const json = await res.json();
        throw new Error(json.message || 'Failed to update details');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Hesheli uses this information to verify your identity and power your foodie profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Name & Username Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Identity & Handle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
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
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Username (@handle)
              </label>
              <div className="relative">
                <AtSign size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  placeholder="e.g. chef_rahima"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Email Address (Primary)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-80"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Verified account credential</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1..."
                  className="w-full pl-9 pr-3 py-2.5 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none border border-transparent focus:border-red-300"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Used for security alerts</p>
            </div>
          </div>
        </div>

        {/* Location & Background Card */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Profile Bio & Background
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Foodie Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              placeholder="Tell others what you love to cook..."
              className="w-full p-3 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none resize-none border border-transparent focus:border-red-300"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                City / Location
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Dhaka"
                  className="w-full pl-8 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Work</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                  placeholder="e.g. Chef / Foodie"
                  className="w-full pl-8 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">Education</label>
              <div className="relative">
                <GraduationCap size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="e.g. Culinary School"
                  className="w-full pl-8 pr-3 py-2 bg-[#f0f2f5] dark:bg-[#3a3b3c] rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            loading={saving}
            variant="primary"
            size="md"
            className="px-6"
          >
            Save Personal Details
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPersonalTab;

