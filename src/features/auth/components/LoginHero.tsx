import React from 'react';
import logo from '../../../assets/logo.png';
import { Heart, Flame, Sparkles, Clock, Star, ChefHat, Award, Users } from 'lucide-react';

export const LoginHero: React.FC = () => {
  return (
    <div className="flex flex-col justify-between h-full max-w-[560px] select-none py-4 sm:py-6">
      {/* 1. Brand Logo & Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#e02f21] to-[#ff5b4f] p-2 flex items-center justify-center shadow-lg shadow-red-500/20 ring-4 ring-red-50 dark:ring-red-950/40">
          <img src={logo} alt="Heshel" className="w-full h-full object-contain filter brightness-0 invert" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#e02f21]">
              হেঁশেল
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#e02f21]">
              Culinary Social
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block -mt-0.5 tracking-wide">
            Where authentic taste meets community
          </span>
        </div>
      </div>

      {/* 2. Interactive Modern Visual Showcase (Facebook/Instagram Story Inspiration) */}
      <div className="relative py-12 sm:py-16 my-4 flex items-center justify-center">
        {/* Floating Verified Chef Pill (Top Left) */}
        <div className="absolute -top-1 left-2 sm:left-6 bg-white/95 dark:bg-[#242526]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5 z-25 animate-bounce duration-1000">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Award size={18} />
          </div>
          <div>
            <p className="text-[11px] font-black text-gray-900 dark:text-white leading-none">Home Chef of the Week</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Dhaka Heritage Cuisine</p>
          </div>
        </div>

        {/* Floating Reaction Bubble (Top Right) */}
        <div className="absolute top-6 right-2 sm:right-6 bg-gradient-to-tr from-rose-500 to-red-500 shadow-xl shadow-red-500/25 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white z-25">
          <Heart size={15} fill="white" />
          <span className="text-xs font-bold">2.8k Foodies</span>
        </div>

        {/* Floating Recipe Card Snippet (Bottom Left) */}
        <div className="absolute -bottom-2 -left-3 sm:left-1 bg-white/95 dark:bg-[#242526]/95 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-25 max-w-[220px]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
              <ChefHat size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">Shahi Morog Polao</p>
              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mt-0.5">
                <Star size={11} fill="currentColor" />
                <span>4.9</span>
                <span className="text-gray-400 font-medium">(240 reviews)</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-semibold text-gray-500">
            <span>6 Secret Spices</span>
            <span className="text-[#e02f21] font-bold">Try Recipe →</span>
          </div>
        </div>

        {/* Floating Community Member Stat (Bottom Right) */}
        <div className="absolute bottom-2 -right-2 sm:right-4 bg-white/95 dark:bg-[#242526]/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-25 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Users size={14} />
          </div>
          <div className="text-left">
            <p className="text-[11px] font-black text-gray-900 dark:text-white leading-tight">12,000+ Cooks</p>
            <p className="text-[9px] text-gray-400">Sharing daily meals</p>
          </div>
        </div>

        {/* Story Card 1 (Back/Left - Kacchi Biryani & Spices) */}
        <div className="relative w-44 sm:w-56 h-68 sm:h-84 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 -rotate-6 z-10 transition-transform duration-300 hover:-rotate-3">
          <img
            src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
            alt="Authentic Dum Biryani"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1">
            <Flame size={12} className="text-orange-400" />
            <span>#KacchiBiryani</span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <span className="text-[10px] uppercase font-bold text-orange-300 flex items-center gap-1">
              <Clock size={11} /> 45 mins prep
            </span>
            <p className="text-xs font-bold truncate">Dhaka Shahi Dum Recipe</p>
          </div>
        </div>

        {/* Story Card 2 (Front/Center - Home Chef Showcase) */}
        <div className="relative w-48 sm:w-60 h-76 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 rotate-3 z-15 -ml-16 sm:-ml-20 transition-transform duration-300 hover:rotate-1">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
            alt="Chef Rahima Sultana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />
          
          {/* Top Live Cook Indicator */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Freshly Cooked</span>
          </div>

          {/* Bottom Chef Intro Box */}
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/60 text-white backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#e02f21] text-white flex items-center justify-center text-xs font-black ring-2 ring-white/30">
                R
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate">Chef Rahima Sultana</p>
                <p className="text-[10px] text-white/80 truncate">Crispy Jalebi from my kitchen! 🍯</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Inspiring Headline & Pitch */}
      <div className="pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.12] tracking-tight">
          Explore recipes <br />
          <span className="text-[#e02f21] inline-flex items-center gap-2">
            you truly love. <Sparkles size={28} className="text-amber-400 inline" />
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 max-w-md leading-relaxed font-normal">
          Connect with passionate home chefs, share cherished family spice secrets, and celebrate authentic Bengali cooking heritage.
        </p>
      </div>
    </div>
  );
};

export default LoginHero;

