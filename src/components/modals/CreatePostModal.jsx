import React, { useState } from 'react';
import { useSession } from '../../lib/auth-client';
import { useLanguage } from '../../context/LanguageContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import {
  X,
  Globe,
  Image as ImageIcon,
  ChefHat,
  Clock,
  Users,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialMode = 'CASUAL', defaultGroupId = null }) => {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const user = session?.user;

  const [mode, setMode] = useState(initialMode); // 'CASUAL' or 'RECIPE'
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Recipe Specific States
  const [title, setTitle] = useState('');
  const [preparationTime, setPreparationTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [cuisine, setCuisine] = useState('Bangladeshi');
  const [ingredients, setIngredients] = useState([
    '500g Chicken or Mutton',
    '2 tbsp Mustard Oil',
    '1 tsp Turmeric',
  ]);
  const [instructions, setInstructions] = useState([
    { title: 'Marinate Meat', details: 'Mix with spices and set aside for 30 minutes.' },
    { title: 'Simmer on Low Flame', details: 'Cover and slow cook until tender and aromatic.' },
  ]);

  if (!isOpen || !user) return null;

  // Upload image via backend Cloudinary endpoint
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/api/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.session?.token || ''}` },
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (data.data?.url) {
        setImage(data.data.url);
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: err.message });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isRecipe = mode === 'RECIPE';
      if (isRecipe && !title.trim()) {
        throw new Error('Please provide a recipe title.');
      }

      const res = await fetch(`${API_BASE}/api/post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.session?.token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          postType: mode,
          caption: caption.trim(),
          title: isRecipe ? title.trim() : null,
          image: image || null,
          preparationTime: isRecipe ? parseInt(preparationTime) : null,
          servings: isRecipe ? parseInt(servings) : null,
          cuisine: isRecipe ? cuisine : null,
          ingredients: isRecipe ? ingredients.filter((i) => i.trim()) : null,
          instructions: isRecipe ? instructions.filter((s) => s.title || s.details) : null,
          groupId: defaultGroupId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create post');

      Swal.fire({
        icon: 'success',
        title: isRecipe ? 'Recipe Posted!' : 'Post Shared!',
        text: json.message,
        timer: 1500,
        showConfirmButton: false,
      });

      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[540px] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 text-center">
          <h3 className="font-bold text-base text-gray-900 dark:text-white">Create post</h3>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 text-gray-500 dark:text-gray-300 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* User Row with Audience Badge */}
          <div className="flex items-center gap-2.5">
            <Avatar src={user.image} alt={user.name} size="md" />
            <div>
              <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{user.name}</p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e4e6eb] dark:bg-[#3a3b3c] text-[11px] font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                <Globe size={11} />
                <span>Public ▾</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-gray-100 dark:bg-[#3a3b3c] p-1 gap-1">
            <button
              type="button"
              onClick={() => setMode('CASUAL')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                mode === 'CASUAL'
                  ? 'bg-white dark:bg-[#242526] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Foodie Post
            </button>
            <button
              type="button"
              onClick={() => setMode('RECIPE')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                mode === 'RECIPE'
                  ? 'bg-white dark:bg-[#242526] text-[#e02f21] shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ChefHat size={14} />
              <span>Full Recipe</span>
            </button>
          </div>

          {/* Caption Textarea */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={mode === 'RECIPE' ? 2 : 4}
            placeholder={
              mode === 'RECIPE'
                ? 'Introduce this recipe (what makes it special?)...'
                : `What's on your mind, ${user.name.split(' ')[0]}?`
            }
            className="w-full bg-transparent resize-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
          />

          {/* Structured Recipe Specific Inputs */}
          {mode === 'RECIPE' && (
            <div className="space-y-3.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Traditional Dhaka Kacchi Biryani"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs dark:text-white focus:outline-none"
                />
              </div>

              {/* Recipe Meta Grid */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Time (mins)</label>
                  <input
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-[#3a3b3c] rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Servings</label>
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-[#3a3b3c] rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1">Cuisine</label>
                  <select
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-[#3a3b3c] rounded-lg border border-gray-200 dark:border-gray-700 dark:text-white focus:outline-none"
                  >
                    <option value="Bangladeshi">Bangladeshi</option>
                    <option value="Indian">Indian</option>
                    <option value="Mughlai">Mughlai</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase text-gray-500">Ingredients</span>
                  <button
                    type="button"
                    onClick={() => setIngredients([...ingredients, ''])}
                    className="text-[11px] font-bold text-[#e02f21] flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-1.5">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={ing}
                        onChange={(e) => {
                          const updated = [...ingredients];
                          updated[idx] = e.target.value;
                          setIngredients(updated);
                        }}
                        placeholder={`Ingredient #${idx + 1}`}
                        className="flex-1 p-2 bg-gray-50 dark:bg-[#3a3b3c] border border-gray-200 dark:border-gray-700 rounded-lg text-xs dark:text-white focus:outline-none"
                      />
                      {ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Attached Image Preview */}
          {image && (
            <div className="relative rounded-2xl overflow-hidden max-h-52 border border-gray-200 dark:border-gray-700">
              <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImage('')}
                className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded-full transition"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Facebook "Add to your post" Box */}
          <div className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Add to your post</span>
            <div className="flex items-center gap-1">
              <label className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-emerald-500 cursor-pointer transition">
                <ImageIcon size={20} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                />
              </label>

              <button
                type="button"
                onClick={() => setMode(mode === 'RECIPE' ? 'CASUAL' : 'RECIPE')}
                className={`p-2 rounded-full transition ${
                  mode === 'RECIPE' ? 'bg-red-50 text-[#e02f21]' : 'hover:bg-gray-100 text-[#e02f21]'
                }`}
                title="Toggle Recipe Inputs"
              >
                <ChefHat size={20} />
              </button>
            </div>
          </div>

          {/* Submit Button with Loading Spinner */}
          <Button
            type="submit"
            loading={loading || uploadingPhoto}
            disabled={!caption.trim() && !image && !title.trim()}
            className="w-full py-2.5 text-sm font-bold"
          >
            Post
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;

