import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    appName: "Heshel",
    appTagline: "Where Cooking Meets Community",
    feed: "Feed",
    explore: "Explore",
    groups: "Groups",
    myProfile: "My Profile",
    savedRecipes: "Saved Recipes",
    signIn: "Sign In",
    signUp: "Create Account",
    signOut: "Log Out",
    searchPlaceholder: "Search recipes, spices, chefs, or groups...",
    whatsCooking: "What are you cooking today, {name}?",
    casualPost: "Casual Update",
    shareRecipe: "Share a Recipe",
    allPosts: "All Posts",
    recipesOnly: "Recipes Only",
    casualOnly: "Foodie Thoughts",
    followingOnly: "Following",
    like: "Like",
    likes: "Likes",
    comment: "Comment",
    comments: "Comments",
    share: "Share",
    shares: "Shares",
    repost: "Repost to Timeline",
    repostQuotePlaceholder: "Add your thoughts about this recipe...",
    repostedFrom: "shared a recipe from",
    postPlaceholder:
      "Share what you cooked, review a spice blend, or ask a cooking question...",
    postButton: "Post",
    recipeTitle: "Recipe Title",
    preparationTime: "Cooking Time (minutes)",
    servings: "Servings",
    cuisine: "Cuisine",
    selectCuisine: "Select Cuisine",
    categories: "Categories",
    ingredients: "Ingredients",
    addIngredient: "+ Add Ingredient",
    instructions: "Step-by-Step Instructions",
    addStep: "+ Add Step",
    stepTitlePlaceholder: "Step Title (e.g., Marinate the meat)",
    stepDetailsPlaceholder: "Detailed step instructions...",
    uploadPhoto: "Upload Photo",
    publishing: "Publishing...",
    publishRecipe: "Publish Recipe",
    mins: "mins",
    serves: "Serves",
    cookedBy: "Cooked by",
    follow: "Follow",
    following: "Following",
    followers: "Followers",
    joinGroup: "Join Group",
    joined: "Joined",
    requested: "Requested",
    leaveGroup: "Leave Group",
    publicGroup: "Public Group",
    privateGroup: "Private Group",
    groupAdmin: "Group Admin",
    groupMod: "Group Mod",
    members: "Members",
    createGroup: "Create Group",
    groupName: "Group Name",
    groupDescription: "Group Description",
    privacy: "Privacy",
    requiresPostApproval: "Require Admin Approval for Posts",
    pendingRequests: "Join Requests",
    pendingPosts: "Pending Posts",
    approve: "Approve",
    reject: "Reject",
    trendingCuisines: "Trending Cuisines",
    suggestedGroups: "Suggested Groups",
    popularCooks: "Cooks to Follow",
    writeComment: "Write a comment...",
    reply: "Reply",
    reportPost: "Report Post",
    reportReason: "Why are you reporting this?",
    submitReport: "Submit Report",
    demoLoginTitle: "Quick Demo Access",
  },
  bn: {
    appName: "হেঁশেল",
    appTagline: "রান্না ও ভালোবাসার সামাজিক আঙিনা",
    feed: "টাইমলাইন",
    explore: "রেসিপি অন্বেষণ",
    groups: "গ্রুপসমূহ",
    myProfile: "আমার প্রোফাইল",
    savedRecipes: "সংরক্ষিত রেসিপি",
    signIn: "প্রবেশ করুন",
    signUp: "নতুন একাউন্ট খুলুন",
    signOut: "লগআউট",
    searchPlaceholder: "রেসিপি, মশলা, রাঁধুনি বা গ্রুপ খুঁজুন...",
    whatsCooking: "{name}, আজ কী রান্না হচ্ছে হেঁশেলে?",
    casualPost: "খাবারের গল্প / আপডেট",
    shareRecipe: "নতুন রেসিপি দিন",
    allPosts: "সব পোস্ট",
    recipesOnly: "শুধুমাত্র রেসিপি",
    casualOnly: "রান্নার গল্প",
    followingOnly: "যাদের ফলো করছেন",
    like: "লাইক",
    likes: "টি লাইক",
    comment: "মন্তব্য",
    comments: "টি মন্তব্য",
    share: "শেয়ার",
    shares: "টি শেয়ার",
    repost: "টাইমলাইনে শেয়ার করুন",
    repostQuotePlaceholder: "এই রেসিপি সম্পর্কে কিছু লিখুন...",
    repostedFrom: "এর রেসিপি শেয়ার করেছেন",
    postPlaceholder:
      "আজ কী রান্না করলেন? কোনো রেসিপির অভিজ্ঞতা বা প্রশ্ন শেয়ার করুন...",
    postButton: "পোস্ট করুন",
    recipeTitle: "রেসিপির নাম",
    preparationTime: "রান্নার সময় (মিনিট)",
    servings: "পরিবেশন (জন)",
    cuisine: "রান্নার ধরন (Cuisine)",
    selectCuisine: "রান্নার ধরন নির্বাচন করুন",
    categories: "ক্যাটাগরি",
    ingredients: "প্রয়োজনীয় উপকরণসমূহ",
    addIngredient: "+ নতুন উপকরণ যোগ করুন",
    instructions: "ধাপে ধাপে রান্নার প্রণালী",
    addStep: "+ নতুন ধাপ যোগ করুন",
    stepTitlePlaceholder: "ধাপের নাম (যেমন: মাংস ম্যারিনেট করা)",
    stepDetailsPlaceholder: "ধাপের বিস্তারিত বর্ণনা...",
    uploadPhoto: "ছবি আপলোড করুন",
    publishing: "প্রকাশ হচ্ছে...",
    publishRecipe: "রেসিপি প্রকাশ করুন",
    mins: "মিনিট",
    serves: "জন",
    cookedBy: "রাঁধুনি",
    follow: "ফলো করুন",
    following: "ফলো করছেন",
    followers: "অনুসারী",
    joinGroup: "গ্রুপে যুক্ত হোন",
    joined: "যুক্ত আছেন",
    requested: "অনুরোধ পাঠানো হয়েছে",
    leaveGroup: "গ্রুপ ছাড়ুন",
    publicGroup: "উন্মুক্ত গ্রুপ (Public)",
    privateGroup: "গোপন গ্রুপ (Private)",
    groupAdmin: "গ্রুপ অ্যাডমিন",
    groupMod: "গ্রুপ মডারেটর",
    members: "সদস্য",
    createGroup: "নতুন গ্রুপ তৈরি করুন",
    groupName: "গ্রুপের নাম",
    groupDescription: "গ্রুপের বিবরণ",
    privacy: "গোপনীয়তা",
    requiresPostApproval: "পোস্টের জন্য অ্যাডমিনের অনুমোদন বাধ্যতামূলক",
    pendingRequests: "যোগদানের অনুরোধ",
    pendingPosts: "অনুমোদনহীন পোস্ট",
    approve: "অনুমোদন দিন",
    reject: "বাতিল করুন",
    trendingCuisines: "জনপ্রিয় রান্নার ধরন",
    suggestedGroups: "পছন্দের কিছু গ্রুপ",
    popularCooks: "জনপ্রিয় রাঁধুনি",
    writeComment: "একটি মন্তব্য লিখুন...",
    reply: "উত্তর দিন",
    reportPost: "অভিযোগ জানান",
    reportReason: "অভিযোগের কারণ লিখুন...",
    submitReport: "অভিযোগ পাঠান",
    demoLoginTitle: "সহজে পরীক্ষা করতে ডেমো অ্যাকাউন্ট",
  },
};

export interface LanguageContextType {
  language: "en" | "bn";
  setLanguage: React.Dispatch<React.SetStateAction<"en" | "bn">>;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<"en" | "bn">(() => {
    return (localStorage.getItem("heshel_language") as "en" | "bn") || "en";
  });

  useEffect(() => {
    localStorage.setItem("heshel_language", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "bn" : "en"));
  };

  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations.en[key] || key;
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(`{${paramKey}}`, paramVal);
    });
    return text;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
