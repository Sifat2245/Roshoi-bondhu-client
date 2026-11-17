import React, { useState, useEffect, useRef } from "react";
import { useSession } from "../../../lib/auth-client";
import Avatar from "../../../components/ui/Avatar";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import postsApi from "../api/posts.api";
import {
  Globe,
  Lock,
  Image as ImageIcon,
  ChefHat,
  Clock,
  Users,
  Plus,
  Trash2,
  BarChart3,
  ChevronDown,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import PollEditor from "../../community/components/PollEditor";
import {
  emptyPoll,
  validatePoll,
  type PollDraft,
} from "../../community/model/community-domain";
import { postAudience, type PostAudience } from "../model/post-policy";
import { useAuth } from "../../../context/AuthContext";

interface MediaItem {
  id: string;
  file?: File;
  previewUrl: string;
}

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onSave: (updates: {
    caption?: string;
    title?: string | null;
    audience?: PostAudience;
    images?: string[];
    image?: string | null;
    ingredients?: string[] | null;
    instructions?: any;
    preparationTime?: number | null;
    servings?: number | null;
    cuisine?: string | null;
    poll?: any;
  }) => Promise<void> | void;
}

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen,
  onClose,
  post,
  onSave,
}) => {
  const { data: session } = useSession();
  const { notify } = useToast();
  const { user: authUser } = useAuth();
  const user = session?.user || authUser || post?.author;

  const [mode, setMode] = useState<"CASUAL" | "RECIPE" | "POLL">("CASUAL");
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<PostAudience>("PUBLIC");
  const [isAudienceDropdownOpen, setIsAudienceDropdownOpen] = useState(false);
  const audienceDropdownRef = useRef<HTMLDivElement>(null);

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Recipe Specific States
  const [title, setTitle] = useState("");
  const [preparationTime, setPreparationTime] = useState("30");
  const [servings, setServings] = useState("4");
  const [cuisine, setCuisine] = useState("Bangladeshi");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState([
    { title: "", details: "" },
  ]);

  // Poll Specific State
  const [poll, setPoll] = useState<PollDraft>(emptyPoll);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isAudienceDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        audienceDropdownRef.current &&
        !audienceDropdownRef.current.contains(e.target as Node)
      ) {
        setIsAudienceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAudienceDropdownOpen]);

  // Prepopulate post information when modal opens
  useEffect(() => {
    if (!isOpen || !post) return;

    const initialMode: "CASUAL" | "RECIPE" | "POLL" =
      post.postType === "RECIPE"
        ? "RECIPE"
        : post.postType === "POLL" || post.poll
        ? "POLL"
        : "CASUAL";

    setMode(initialMode);
    setAudience(postAudience(post));
    setCaption(post.caption || "");
    setTitle(post.title || "");
    setPreparationTime(post.preparationTime ? String(post.preparationTime) : "30");
    setServings(post.servings ? String(post.servings) : "4");
    setCuisine(post.cuisine || "Bangladeshi");
    setIngredients(Array.isArray(post.ingredients) ? [...post.ingredients] : []);

    // Format instructions
    if (Array.isArray(post.instructions) && post.instructions.length > 0) {
      setInstructions(
        post.instructions.map((step: any) =>
          typeof step === "string"
            ? { title: "", details: step }
            : { title: step.title || "", details: step.details || "" }
        )
      );
    } else {
      setInstructions([{ title: "", details: "" }]);
    }

    // Format poll
    if (post.poll) {
      setPoll({
        question: post.poll.question || "",
        options: Array.isArray(post.poll.options)
          ? post.poll.options.map((o: any) => o.text || "")
          : ["", ""],
        multiple: Boolean(post.poll.multiple),
        expiresAt: post.poll.expiresAt || "",
      });
    } else {
      setPoll(emptyPoll());
    }

    // Format media items
    const existingImages: string[] =
      Array.isArray(post.images) && post.images.length > 0
        ? post.images
        : post.image
        ? [post.image]
        : [];

    setMediaItems(
      existingImages.map((url, i) => ({
        id: `existing_${i}_${url.slice(-8)}`,
        previewUrl: url,
      }))
    );
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const groupId = post.groupId;

  // Select photos locally for instant preview
  const handleSelectPhotos = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const validItems: MediaItem[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        notify.error(`${file.name} is not a valid image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        notify.error(`${file.name} exceeds 10 MB limit.`);
        continue;
      }
      validItems.push({
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (validItems.length > 0) {
      setMediaItems((prev) => [...prev, ...validItems]);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => {
      const removed = prev.find((m) => m.id === id);
      if (removed?.previewUrl && removed.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const handleAddInstruction = () => {
    setInstructions((prev) => [...prev, { title: "", details: "" }]);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (
    index: number,
    field: "title" | "details",
    val: string
  ) => {
    setInstructions((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: val } : step))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isRecipe = mode === "RECIPE";
    const isPoll = mode === "POLL";

    try {
      if (isPoll) {
        const error = validatePoll(poll.question, poll.options);
        if (error) throw new Error(error);
        if (poll.expiresAt && +new Date(poll.expiresAt) <= Date.now()) {
          throw new Error("Choose a future closing time.");
        }
      }

      if (isRecipe && !title.trim()) {
        throw new Error("Please provide a recipe title.");
      }

      if (
        mode === "CASUAL" &&
        !caption.trim() &&
        mediaItems.length === 0
      ) {
        throw new Error("Add some text or a photo to your post.");
      }

      if (
        isRecipe &&
        (!ingredients.some((item) => item.trim()) ||
          !instructions.some((step) => step.details.trim()))
      ) {
        throw new Error(
          "Add at least one ingredient and a cooking instruction."
        );
      }

      if (isRecipe && (Number(preparationTime) <= 0 || Number(servings) <= 0)) {
        throw new Error("Cooking time and servings must be greater than zero.");
      }

      setIsSaving(true);

      const token = session?.session?.token || null;
      const uploadedUrls: string[] = [];

      // Upload any local media files
      for (const item of mediaItems) {
        if (item.file) {
          const uploaded = await postsApi.uploadImage(item.file, token);
          const uploadedUrl = uploaded?.data?.url || uploaded?.url;
          if (uploadedUrl) {
            uploadedUrls.push(uploadedUrl);
          }
        } else if (item.previewUrl) {
          uploadedUrls.push(item.previewUrl);
        }
      }

      const primaryImage = uploadedUrls[0] || null;

      let pollInput: any = undefined;
      if (isPoll && poll.question.trim()) {
        const cleanOpts = poll.options.map((o) => o.trim()).filter(Boolean);
        pollInput = {
          question: poll.question.trim(),
          options: cleanOpts.length >= 2 ? cleanOpts : undefined,
          multiple: poll.multiple,
          expiresAt: poll.expiresAt || null,
        };
      }

      await onSave({
        caption: caption.trim(),
        title: isRecipe ? title.trim() : null,
        audience: !groupId ? audience : undefined,
        images: uploadedUrls,
        image: primaryImage,
        preparationTime: isRecipe ? parseInt(preparationTime, 10) : null,
        servings: isRecipe ? parseInt(servings, 10) : null,
        cuisine: isRecipe ? cuisine : null,
        ingredients: isRecipe ? ingredients.filter((i) => i.trim()) : null,
        instructions: isRecipe
          ? instructions.filter((s) => s.title || s.details)
          : null,
        poll: pollInput,
      });

      onClose();
    } catch (err: any) {
      notify.error(err.message || "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  const authorName = post.author?.name || user?.name || "Chef";
  const authorImage = post.author?.image || user?.image;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit post"
      maxWidth="max-w-[540px]"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* User Row with Audience Badge */}
        <div className="flex items-center gap-3">
          <Avatar src={authorImage} alt={authorName} size="md" />
          <div>
            <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">
              {authorName}
            </p>

            {groupId ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-xs font-semibold mt-1">
                {post.group?.privacy === "PRIVATE" ? (
                  <Lock size={13} />
                ) : (
                  <Globe size={13} />
                )}
                <span>
                  {post.group?.privacy === "PRIVATE"
                    ? "Private group"
                    : "Public group"}
                </span>
              </div>
            ) : (
              <div className="relative mt-1" ref={audienceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAudienceDropdownOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-xs font-semibold text-gray-700 dark:text-gray-200 transition cursor-pointer select-none"
                  aria-haspopup="listbox"
                  aria-expanded={isAudienceDropdownOpen}
                >
                  {audience === "ONLY_ME" ? (
                    <Lock size={13} className="shrink-0" />
                  ) : audience === "FRIENDS" ? (
                    <Users size={13} className="shrink-0" />
                  ) : (
                    <Globe size={13} className="shrink-0" />
                  )}
                  <span>
                    {audience === "ONLY_ME"
                      ? "Only me"
                      : audience === "FRIENDS"
                      ? "Friends"
                      : "Public"}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`shrink-0 transition-transform duration-150 ${
                      isAudienceDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isAudienceDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#242526] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    {[
                      { value: "PUBLIC", label: "Public", icon: Globe },
                      { value: "FRIENDS", label: "Friends", icon: Users },
                      { value: "ONLY_ME", label: "Only me", icon: Lock },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = audience === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setAudience(opt.value as PostAudience);
                            setIsAudienceDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition hover:bg-gray-50 dark:hover:bg-[#3a3b3c] cursor-pointer ${
                            isSelected
                              ? "bg-red-50/50 dark:bg-red-950/20 text-[#e02f21] font-bold"
                              : "text-gray-700 dark:text-gray-200 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon
                              size={14}
                              className={
                                isSelected
                                  ? "text-[#e02f21]"
                                  : "text-gray-500 dark:text-gray-400"
                              }
                            />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-[#e02f21] shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Text Area Caption */}
        <div>
          <textarea
            aria-label="Post caption"
            rows={mode === "CASUAL" ? 4 : 2}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={
              mode === "RECIPE"
                ? "Share story, secret tips, or flavor profile..."
                : `What are you cooking today, ${authorName.split(" ")[0]}? Share your thoughts...`
            }
            className="w-full bg-transparent border-none text-base dark:text-white placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* POLL SPECIFIC FORM FIELDS */}
        {mode === "POLL" && (
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <BarChart3 size={16} />
                <span>Poll</span>
              </span>
              <button
                type="button"
                onClick={() => setMode("CASUAL")}
                className="text-xs font-bold text-gray-400 hover:text-red-500 cursor-pointer transition"
              >
                Remove
              </button>
            </div>
            <PollEditor value={poll} onChange={setPoll} />
          </div>
        )}

        {/* RECIPE SPECIFIC FORM FIELDS */}
        {mode === "RECIPE" && (
          <div className="space-y-4 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e02f21] flex items-center gap-1.5">
                <ChefHat size={16} />
                <span>Recipe Details</span>
              </span>
              <button
                type="button"
                onClick={() => setMode("CASUAL")}
                className="text-xs font-bold text-gray-400 hover:text-red-500 cursor-pointer transition"
              >
                Remove
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Recipe Title *
              </label>
              <input
                aria-label="Recipe title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Traditional Dhakai Kacchi Biryani"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold dark:text-white focus:outline-none focus:border-[#e02f21]"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Time (mins)
                </label>
                <div className="relative">
                  <Clock
                    size={16}
                    className="absolute left-2.5 top-3 text-gray-400"
                  />
                  <input
                    aria-label="Cooking time in minutes"
                    type="number"
                    min={1}
                    max={1440}
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
                  <Users
                    size={16}
                    className="absolute left-2.5 top-3 text-gray-400"
                  />
                  <input
                    aria-label="Recipe servings"
                    type="number"
                    min={1}
                    max={24}
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Cuisine
                </label>
                <select
                  aria-label="Recipe cuisine"
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
                      aria-label={`Remove ingredient ${ing}`}
                      onClick={() =>
                        setIngredients(ingredients.filter((_, i) => i !== idx))
                      }
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                aria-label="Add a recipe ingredient"
                type="text"
                placeholder="+ Type ingredient and press Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      setIngredients([...ingredients, input.value.trim()]);
                      input.value = "";
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
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#242526] p-3 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-gray-400">
                        Step {idx + 1}
                      </span>
                      {instructions.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Remove cooking step ${idx + 1}`}
                          onClick={() => handleRemoveInstruction(idx)}
                          className="text-gray-400 hover:text-red-500 p-0.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <input
                      aria-label={`Step ${idx + 1} title`}
                      type="text"
                      placeholder="Step Title"
                      value={step.title}
                      onChange={(e) =>
                        handleInstructionChange(idx, "title", e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-sm font-semibold bg-gray-50 dark:bg-[#3a3b3c] rounded-lg"
                    />
                    <textarea
                      aria-label={`Step ${idx + 1} details`}
                      rows={2}
                      placeholder="Step details..."
                      value={step.details}
                      onChange={(e) =>
                        handleInstructionChange(idx, "details", e.target.value)
                      }
                      className="w-full p-2.5 text-sm bg-gray-50 dark:bg-[#3a3b3c] rounded-lg resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Uploaded Photos Preview (Multiple Images Grid) */}
        {mediaItems.length > 0 && (
          <div className="space-y-2">
            <div
              className={`rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18191a] p-1.5 ${
                mediaItems.length === 1
                  ? "block"
                  : mediaItems.length === 2
                  ? "grid grid-cols-2 gap-1.5"
                  : mediaItems.length === 3
                  ? "grid grid-cols-3 gap-1.5"
                  : "grid grid-cols-2 sm:grid-cols-3 gap-1.5"
              }`}
            >
              {mediaItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`relative group rounded-xl overflow-hidden bg-black/10 dark:bg-black/40 ${
                    mediaItems.length === 1
                      ? "max-h-72 aspect-video w-full"
                      : "aspect-square"
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove photo ${idx + 1}`}
                    onClick={() => handleRemoveMedia(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer shadow-sm z-10"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-white font-semibold">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick action bar to add more photos or clear all */}
            <div className="flex items-center justify-between px-1 text-xs">
              <label className="inline-flex items-center gap-1.5 font-bold text-[#e02f21] hover:underline cursor-pointer">
                <Plus size={14} />
                <span>Add more photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleSelectPhotos(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  mediaItems.forEach((m) => {
                    if (m.previewUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(m.previewUrl);
                    }
                  });
                  setMediaItems([]);
                }}
                className="font-semibold text-gray-400 hover:text-red-500 transition cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Attachment Options Bar ("Add to your post") */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Add to your post
          </span>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 1. Photo Upload */}
            <label
              title="Add photo"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-emerald-500 cursor-pointer transition flex items-center justify-center"
            >
              <ImageIcon size={22} />
              <input
                aria-label="Add a post photo"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleSelectPhotos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {/* 2. Recipe Option */}
            <button
              type="button"
              title={
                mode === "RECIPE"
                  ? "Remove recipe details"
                  : "Add recipe details"
              }
              onClick={() =>
                setMode((prev) => (prev === "RECIPE" ? "CASUAL" : "RECIPE"))
              }
              className={`p-2 rounded-full transition cursor-pointer flex items-center justify-center ${
                mode === "RECIPE"
                  ? "bg-red-50 dark:bg-red-950/40 text-[#e02f21] ring-2 ring-[#e02f21]"
                  : "hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-[#e02f21]"
              }`}
            >
              <ChefHat size={22} />
            </button>

            {/* 3. Poll Option */}
            <button
              type="button"
              title={mode === "POLL" ? "Remove poll" : "Create poll"}
              onClick={() =>
                setMode((prev) => (prev === "POLL" ? "CASUAL" : "POLL"))
              }
              className={`p-2 rounded-full transition cursor-pointer flex items-center justify-center ${
                mode === "POLL"
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-500 ring-2 ring-amber-500"
                  : "hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-amber-500"
              }`}
            >
              <BarChart3 size={22} />
            </button>
          </div>
        </div>

        {/* Submit Post Button */}
        <div className="flex pt-1">
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full py-3.5 text-base font-bold rounded-xl shadow-xs"
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Updating...</span>
              </div>
            ) : (
              <span>Update post</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPostModal;
