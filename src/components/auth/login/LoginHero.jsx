import React from 'react';
import logo from '../../../assets/logo.png';
import { Heart, Flame, Sparkles, Clock, Star, ChefHat } from 'lucide-react';

const LoginHero = () => {
  return (
    <div className="flex flex-col justify-between h-full max-w-[560px] select-none py-4 sm:py-6">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Hesheli" className="h-10 sm:h-12 w-auto object-contain" />
        <div>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#e02f21]">
            হেশেলী
          </span>
          <span className="text-xs font-bold text-gray-400 block -mt-1 tracking-wider uppercase">
            Hesheli Social
          </span>
        </div>
      </div>

      {/* Story & Recipe Visual Collage (Matching Facebook / Instagram Inspiration) */}
      <div className="relative py-10 sm:py-14 my-4 flex items-center justify-center">
        {/* Floating Emoji Bubble 1 (Top Left) */}
        <div className="absolute top-1 left-4 sm:left-10 w-12 h-12 rounded-full bg-white dark:bg-[#242526] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center text-2xl z-20 animate-bounce duration-1000">
          😍
        </div>

        {/* Floating Reaction Bubble 2 (Bottom Right) */}
        <div className="absolute bottom-4 right-0 sm:right-6 bg-gradient-to-tr from-rose-500 to-red-500 shadow-xl shadow-red-500/25 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white z-20">
          <Heart size={16} fill="white" />
          <span className="text-xs font-bold">2.8k</span>
        </div>

        {/* Floating Recipe Card Snippet (Bottom Left) */}
        <div className="absolute bottom-2 -left-4 sm:left-2 bg-white/95 dark:bg-[#242526]/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-20 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
            <ChefHat size={16} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">Shahi Morog Polao</p>
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold">
              <Star size={10} fill="currentColor" />
              <span>4.9 (184 reviews)</span>
            </div>
          </div>
        </div>

        {/* Story Card 1 (Back/Left - Kacchi Biryani & Spices) */}
        <div className="relative w-44 sm:w-56 h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 -rotate-6 z-10 transition-transform duration-300 hover:-rotate-3">
          <img
            src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
            alt="Authentic Dum Biryani"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
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
        <div className="relative w-48 sm:w-60 h-72 sm:h-92 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 rotate-3 z-15 -ml-16 sm:-ml-20 transition-transform duration-300 hover:rotate-1">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
            alt="Chef Rahima Sultana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          
          {/* Top Clock / Live Pill */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>18:45</span>
          </div>

          {/* Bottom Chef Intro Box */}
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/60 text-white backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#e02f21] text-white flex items-center justify-center text-xs font-black">
                R
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate">Chef Rahima Sultana</p>
                <p className="text-[10px] text-white/80 truncate">Fresh batch of sweet Jalebi! 🍯</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Inspiring Headline */}
      <div className="pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.15] tracking-tight">
          Explore the recipes <br />
          <span className="text-[#e02f21]">you love.</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2.5 max-w-md leading-relaxed font-normal">
          Connect with home cooks, share secret ingredients, and discover authentic dishes across Bangladesh and beyond.
        </p>
      </div>
    </div>
  );
};

export default LoginHero;
