import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import {
  kitchenId,
  useKitchen,
  type Draft,
} from "../../kitchen/model/kitchen-store";
import { Link } from "react-router";
import PollEditor from "../../community/components/PollEditor";
import {
  emptyPoll,
  validatePoll,
} from "../../community/model/community-domain";
import { postAudience, type PostAudience } from "../model/post-policy";
import { useAuth } from "../../../context/AuthContext";
import { useUpload } from "../../../context/UploadContext";

const CreatePostModal = ({
  isOpen,
  onClose,
  onPostCreated,
  initialMode = "CASUAL",
  defaultGroupId = null,
  defaultGroup = null,
  initialDraft = null as Draft | null,
}) => {
  const { data: session } = useSession();
  const { notify } = useToast();
  const { user: authUser } = useAuth();
  const { runUpload } = useUpload();
  const user = session?.user || authUser;
  const { update } = useKitchen();
  const draftId = useRef("");
  const submitted = useRef(false);
  const [savedAt, setSavedAt] = useState("");
  const [poll, setPoll] = useState(emptyPoll);
  const [audience, setAudience] = useState<PostAudience>("PUBLIC");

  const [mode, setMode] = useState(initialMode); // 'CASUAL' or 'RECIPE'
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Recipe Specific States
  const [title, setTitle] = useState("");
  const [preparationTime, setPreparationTime] = useState("30");
  const [servings, setServings] = useState("4");
  const [cuisine, setCuisine] = useState("Bangladeshi");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState([
    { title: "", details: "" },
  ]);

  useEffect(() => {
    if (!isOpen) return;
    submitted.current = false;
    draftId.current = initialDraft?.id || kitchenId();
    setMode(initialDraft?.mode || initialMode);
    setPoll(initialDraft?.poll || emptyPoll());
    setAudience(postAudience(initialDraft || {}));
    setTitle(initialDraft?.title || "");
    setCaption(initialDraft?.caption || "");
    setImage(initialDraft?.image || "");
    setPreparationTime(initialDraft?.preparationTime || "30");
    setServings(initialDraft?.servings || "4");
    setCuisine(initialDraft?.cuisine || "Bangladeshi");
    setIngredients(initialDraft?.ingredients || []);
    setInstructions(
      initialDraft?.instructions?.length
        ? initialDraft.instructions
        : [{ title: "", details: "" }],
    );
    setSavedAt(initialDraft?.updatedAt || "");
  }, [isOpen, initialMode, initialDraft]);
  const groupId = initialDraft?.groupId || defaultGroupId || null;
  const persistDraft = useCallback(() => {
    if (
      submitted.current ||
      !draftId.current ||
      ![
        title,
        caption,
        image,
        ...(mode === "POLL" ? [poll.question, ...poll.options] : []),
        ...ingredients,
        ...instructions.map((s) => s.title + s.details),
      ].some((v) => v.trim())
    )
      return true;
    const updatedAt = new Date().toISOString();
    const draft: Draft = {
      id: draftId.current,
      mode,
      audience: groupId ? undefined : audience,
      poll: mode === "POLL" ? poll : undefined,
      title,
      caption,
      image,
      preparationTime,
      servings,
      cuisine,
      ingredients,
      instructions,
      groupId,
      group: initialDraft?.group || defaultGroup,
      updatedAt,
    };
    try {
      update((s) => {
        s.drafts = [draft, ...s.drafts.filter((d) => d.id !== draft.id)];
      });
      setSavedAt(updatedAt);
      return true;
    } catch {
      setSavedAt("failed");
      return false;
    }
  }, [
    audience,
    mode,
    poll,
    title,
    caption,
    image,
    preparationTime,
    servings,
    cuisine,
    ingredients,
    instructions,
    groupId,
    initialDraft?.group,
    defaultGroup,
    update,
  ]);
  useEffect(() => {
    if (!isOpen) return;
    const timeout = window.setTimeout(persistDraft, 500);
    window.addEventListener("pagehide", persistDraft);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("pagehide", persistDraft);
    };
  }, [isOpen, persistDraft]);
  const handleClose = () => {
    if (persistDraft()) onClose();
  };

  if (!isOpen || !user) return null;

  // Upload image via API client
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      notify.error("Choose an image smaller than 5 MB.");
      return;
    }
    setUploadingPhoto(true);
    try {
      if (mode === "POLL" || (!groupId && audience !== "PUBLIC")) {
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () =>
            reject(
              new Error("This photo could not be opened. Try another image."),
            );
          reader.readAsDataURL(file);
        });
        setImage(preview);
        return;
      }
      const data = await postsApi.uploadImage(file, session?.session?.token);
      if (data.data?.url) {
        setImage(data.data.url);
      } else {
        throw new Error(data.message || "Image upload failed");
      }
    } catch (err) {
      notify.error(err.message, "Upload Failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddInstruction = () => {
    setInstructions((prev) => [...prev, { title: "", details: "" }]);
  };

  const handleRemoveInstruction = (index) => {
    setInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index, field, value) => {
    setInstructions((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step)),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const isRecipe = mode === "RECIPE";
      if (mode === "POLL") {
        const error = validatePoll(poll.question, poll.options);
        if (error) throw new Error(error);
        if (poll.expiresAt && +new Date(poll.expiresAt) <= Date.now())
          throw new Error("Choose a future closing time.");
      }
      if (isRecipe && !title.trim()) {
        throw new Error("Please provide a recipe title.");
      }
      if (mode === "CASUAL" && !caption.trim() && !image)
        throw new Error("Add a story or photo before posting.");
      if (
        isRecipe &&
        (!ingredients.some((item) => item.trim()) ||
          !instructions.some((step) => step.details.trim()))
      )
        throw new Error(
          "Add at least one ingredient and a cooking instruction.",
        );
      if (isRecipe && (Number(preparationTime) <= 0 || Number(servings) <= 0))
        throw new Error("Cooking time and servings must be greater than zero.");

      // Capture all form fields before closing
      const postMode = mode;
      const postCaption = caption.trim();
      const postTitle = isRecipe ? title.trim() : null;
      const postImage = image;
      const postAudience = audience;
      const postPoll = poll;
      const postPreparationTime = preparationTime;
      const postServings = servings;
      const postCuisine = cuisine;
      const postIngredients = ingredients;
      const postInstructions = instructions;
      const postGroupId = groupId;
      const currentDraftId = draftId.current;
      const postUser = user;
      const postToken = session?.session?.token;

      // Close modal immediately so user doesn't wait!
      onClose();

      // Reset form state
      setCaption("");
      setTitle("");
      setImage("");
      setIngredients([]);
      setInstructions([{ title: "", details: "" }]);

      // Launch background upload with feed progress tracking
      const uploadType: "POST" | "RECIPE" | "POLL" =
        postMode === "RECIPE"
          ? "RECIPE"
          : postMode === "POLL"
          ? "POLL"
          : "POST";

      runUpload(
        {
          type: uploadType,
          title:
            postMode === "RECIPE"
              ? "published a new recipe."
              : postMode === "POLL"
              ? "created a poll."
              : "published a post.",
          caption: postCaption || postTitle || undefined,
          previewUrl: postImage || undefined,
          userImage: postUser?.image,
          userName: postUser?.name || "You",
        },
        async (onProgress) => {
          let publishedImage = postImage;
          if (
            postImage.startsWith("data:") &&
            postMode !== "POLL" &&
            (postGroupId || postAudience === "PUBLIC")
          ) {
            onProgress(35);
            const blob = await (await fetch(postImage)).blob();
            const uploaded = await postsApi.uploadImage(
              new File([blob], "post-photo", { type: blob.type }),
              postToken,
            );
            if (!uploaded.data?.url)
              throw new Error("Photo upload failed. Your draft is still here.");
            publishedImage = uploaded.data.url;
            onProgress(70);
          }

          await postsApi.createPost(
            {
              postType: postMode,
              ...(!postGroupId ? { audience: postAudience } : {}),
              ...(postMode === "POLL" ? { poll: postPoll } : {}),
              caption: postCaption,
              title: postTitle,
              image: publishedImage || null,
              preparationTime: isRecipe ? parseInt(postPreparationTime) : null,
              servings: isRecipe ? parseInt(postServings) : null,
              cuisine: isRecipe ? postCuisine : null,
              ingredients: isRecipe ? postIngredients.filter((i) => i.trim()) : null,
              instructions: isRecipe
                ? postInstructions.filter((s) => s.title || s.details)
                : null,
              groupId: postGroupId,
            },
            postToken,
            { user: postUser, group: initialDraft?.group || defaultGroup },
          );

          submitted.current = true;
          try {
            update((s) => {
              s.drafts = s.drafts.filter((draft) => draft.id !== currentDraftId);
            });
          } catch {
            /* local storage fallback */
          }

          if (onPostCreated) onPostCreated();

          notify.success(
            !postGroupId && postAudience !== "PUBLIC"
              ? "Post saved with your selected audience"
              : postMode === "POLL"
              ? "Your poll has been published!"
              : isRecipe
              ? "Your recipe has been shared!"
              : "Your post has been shared!"
          );
        }
      ).catch((err) => {
        notify.error(err.message || "Post Failed", "Post Failed");
      });
    } catch (err) {
      notify.error(err.message, "Post Failed");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "POLL" ? "Create a poll" : "Create post"}
      maxWidth="max-w-[540px]"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* User Row with Audience Badge */}
        <div className="flex items-center gap-3">
          <Avatar src={user.image} alt={user.name} size="md" />
          <div>
            <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              {user.name}
            </p>
            {groupId ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-sm font-semibold mt-1">
                {(initialDraft?.group || defaultGroup)?.privacy ===
                "PRIVATE" ? (
                  <Lock size={14} />
                ) : (
                  <Globe size={14} />
                )}
                <span>
                  {(initialDraft?.group || defaultGroup)?.privacy === "PRIVATE"
                    ? "Private group"
                    : "Public group"}
                </span>
              </div>
            ) : (
              <label className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] px-2.5 mt-1 text-sm font-semibold">
                {audience === "ONLY_ME" ? (
                  <Lock size={14} />
                ) : audience === "FRIENDS" ? (
                  <Users size={14} />
                ) : (
                  <Globe size={14} />
                )}
                <select
                  aria-label="Post audience"
                  value={audience}
                  onChange={(event) =>
                    setAudience(event.target.value as PostAudience)
                  }
                  className="min-h-9 bg-transparent pr-1 outline-none focus-visible:ring-2 focus-visible:ring-[#e02f21] rounded-md dark:bg-[#3a3b3c]"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FRIENDS">Friends</option>
                  <option value="ONLY_ME">Only me</option>
                </select>
              </label>
            )}
          </div>
        </div>

        {!groupId && (
          <p
            className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
            role="status"
          >
            {audience === "PUBLIC"
              ? "Anyone can see your post."
              : audience === "FRIENDS"
                ? "Your friends can see this post. Sharing is turned off."
                : "Only you can see this post. Sharing is turned off."}
            {audience !== "PUBLIC" && (
              <span className="block mt-1 font-medium">
                Device preview: this post stays on this device until audience
                support is connected.
              </span>
            )}
          </p>
        )}

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
                : `What are you cooking today, ${user?.name?.split(" ")[0] || "Chef"}? Share your thoughts...`
            }
            className="w-full bg-transparent border-none text-base dark:text-white placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

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

        {/* Uploaded Photo Preview */}
        {image && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-56">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              aria-label="Remove post photo"
              onClick={() => setImage("")}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
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
                accept="image/*"
                className="hidden"
                disabled={uploadingPhoto}
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />
            </label>

            {/* 2. Recipe Option */}
            <button
              type="button"
              title={mode === "RECIPE" ? "Remove recipe details" : "Add recipe details"}
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

            {uploadingPhoto && (
              <span className="text-xs font-semibold text-gray-500 ml-1">
                Uploading...
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span role="status">
            {savedAt === "failed"
              ? "Draft could not be saved. Device storage may be full."
              : savedAt
                ? "Draft saved on this device"
                : "Your draft saves as you write"}
          </span>
          <Link
            to="/drafts"
            onClick={handleClose}
            className="text-[#e02f21] font-semibold"
          >
            View drafts
          </Link>
        </div>
        <div className="flex">
          {/* Submit Post Button with Spinner */}
          <Button
            type="submit"
            loading={uploadingPhoto}
            className="w-full py-3.5 text-base font-bold rounded-xl shadow-xs"
          >
            <span>Post</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
