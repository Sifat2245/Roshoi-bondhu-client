import React, { useState } from 'react';
import { useSession } from '../../../lib/auth-client';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import postsApi from '../api/posts.api';
import {
  Globe,
  Image as ImageIcon,
  ChefHat,
  Clock,
  Users,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const CreatePostModal = ({ isOpen, onClose, onPostCreated, initialMode = 'CASUAL', defaultGroupId = null }) => {
  const { data: session } = useSession();
  const { notify } = useToast();
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

  // Upload image via API client
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const data = await postsApi.uploadImage(file, session?.session?.token);
      if (data.data?.url) {
        setImage(data.data.url);
      } else {
        throw new Error(data.message || 'Image upload failed');
      }
    } catch (err) {
      notify.error(err.message, 'Upload Failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddInstruction = () => {
    setInstructions((prev) => [...prev, { title: '', details: '' }]);
  };

  const handleRemoveInstruction = (index) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, field, value) => {
    setInstructions((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isRecipe = mode === 'RECIPE';
      if (isRecipe && !title.trim()) {
        throw new Error('Please provide a recipe title.');
      }

      await postsApi.createPost(
        {
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
        },
        session?.session?.token
      );

      if (onPostCreated) onPostCreated();
      onClose();
    } catch (err) {
      notify.error(err.message, 'Post Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create post"
      maxWidth="max-w-[540px]"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* User Row with Audience Badge */}
        <div className="flex items-center gap-3">
          <Avatar src={user.image} alt={user.name} size="md" />
          <div>
            <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{user.name}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#e4e6eb] dark:bg-[#3a3b3c] text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
              <Globe size={14} />
              <span>Public ▾</span>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-[#3a3b3c] p-1 gap-1">
          <button
            type="button"
            onClick={() => setMode('CASUAL')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition ${
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
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              mode === 'RECIPE'
                ? 'bg-white dark:bg-[#242526] text-[#e02f21] shadow-xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ChefHat size={18} />
            <span>Recipe Post</span>
          </button>
        </div>

        {/* RECIPE SPECIFIC FORM FIELDS */}
        {mode === 'RECIPE' && (
          <div className="space-y-4 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Traditional Dhakai Kacchi Biryani"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:border-[#e02f21]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Time (mins)
                </label>
                <div className="relative">
                  <Clock size={16} className="absolute left-2.5 top-3 text-gray-400" />
                  <input
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Servings
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-2.5 top-3 text-gray-400" />
                  <input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cuisine
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-2.5 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                >
                  <option value="Bangladeshi">Bangladeshi</option>
                  <option value="Indian">Indian Curries</option>
                  <option value="Mughlai">Mughlai</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Chinese">Desi Chinese</option>
                  <option value="Street Food">Street Food</option>
                </select>
              </div>
            </div>

            {/* Ingredients Tags / Quick list */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Ingredients (Press Enter to add)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-semibold"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="+ Type ingredient and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      setIngredients([...ingredients, input.value.trim()]);
                      input.value = '';
                    }
                  }
                }}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Cooking Instructions
                </label>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="text-sm text-[#e02f21] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Step</span>
                </button>
              </div>
              <div className="space-y-2">
                {instructions.map((step, idx) => (
                  <div key={idx} className="bg-white dark:bg-[#242526] p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-gray-400">
                        Step {idx + 1}
                      </span>
                      {instructions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInstruction(idx)}
                          className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Step Title"
                      value={step.title}
                      onChange={(e) => handleInstructionChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm font-semibold bg-gray-50 dark:bg-[#3a3b3c] rounded-lg"
                    />
                    <textarea
                      rows={2}
                      placeholder="Step details..."
                      value={step.details}
                      onChange={(e) => handleInstructionChange(idx, 'details', e.target.value)}
                      className="w-full p-2.5 text-sm bg-gray-50 dark:bg-[#3a3b3c] rounded-lg resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Text Area Caption */}
        <div>
          <textarea
            rows={mode === 'RECIPE' ? 2 : 4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={
              mode === 'RECIPE'
                ? 'Share story, secret tips, or flavor profile...'
                : `What are you cooking today, ${user.name?.split(' ')[0]}? Share your thoughts...`
            }
            className="w-full bg-transparent border-none text-base dark:text-white placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Uploaded Photo Preview */}
        {image && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-56">
            <img src={image} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setImage('')}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        {/* Photo Upload Attachment Bar */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Add to your post
          </span>

          <div className="flex items-center gap-1.5">
            <label className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-emerald-500 cursor-pointer transition">
              <ImageIcon size={20} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingPhoto}
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
            </label>
            {uploadingPhoto && <span className="text-sm font-semibold text-gray-500">Uploading...</span>}
          </div>
        </div>

        {/* Submit Post Button with Spinner */}
        <Button
          type="submit"
          loading={loading || uploadingPhoto}
          className="w-full py-3.5 text-base font-bold rounded-xl shadow-xs"
        >
          <span>Post</span>
        </Button>
      </form>
    </Modal>
  );
};

export default CreatePostModal;

