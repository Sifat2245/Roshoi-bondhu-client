import React from "react";
import bg from "../assets/recipe-taxonomies-bg.svg";
import Navbar from "../components/Navbar";
import PopularTags from "../components/PopularTags";
import Footer from "../components/Footer";
import {
  CakeSlice,
  Flame,
  Sandwich,
  Coffee,
  Martini,
  Beef,
  Carrot,
  CookingPot,
  Fish,
  GlassWater,
  Leaf,
  Salad,
  Soup,
  UtensilsCrossed,
  WheatOff,
  Cookie,
  Vegan,
  Sprout,
  Ban,
} from "lucide-react";

const categoriesData = [
  { name: "Appetizers", count: 2, icon: <Martini size={40} /> },
  { name: "BBQ & Grilling", count: 5, icon: <Flame size={40} /> },
  { name: "Breads", count: 4, icon: <Sandwich size={40} /> },
  { name: "Breakfasts", count: 4, icon: <Coffee size={40} /> },
  { name: "Desserts", count: 4, icon: <CakeSlice size={40} /> },
  { name: "Drinks", count: 3, icon: <GlassWater size={40} /> },
  { name: "Gluten-Free", count: 3, icon: <WheatOff size={40} /> },
  { name: "Healthy", count: 3, icon: <Leaf size={40} /> },
  { name: "Instant Pot", count: 4, icon: <CookingPot size={40} /> },
  { name: "Meat", count: 5, icon: <Beef size={40} /> },
  { name: "Pasta", count: 2, icon: <UtensilsCrossed size={40} /> },
  { name: "Salads", count: 3, icon: <Salad size={40} /> },
  { name: "Seafood", count: 4, icon: <Fish size={40} /> },
  { name: "Side Dishes", count: 3, icon: <Carrot size={40} /> },
  { name: "Snacks", count: 3, icon: <Cookie size={40} /> },
  { name: "Soups", count: 4, icon: <Soup size={40} /> },
  { name: "Sugar-Free", count: 2, icon: <Ban size={40} /> },
  { name: "Vegan", count: 4, icon: <Vegan size={40} /> },
  { name: "Vegetarian", count: 3, icon: <Sprout size={40} /> },
];

const CategoryCard = ({ icon, name, count }) => {
  return (
    <div
      className="
      group
      flex flex-col items-center justify-center
      p-6
      dark:bg-gray-700 dark:text-white
      border border-gray-200 dark:border-gray-700
      rounded-xl
      text-center
      transition-all duration-300
      hover:shadow-lg hover:border-[#e02f21] hover:-translate-y-1
      cursor-pointer
    "
    >
      <div className="text-gray-600 dark:text-gray-400 group-hover:text-[#e02f21] transition-colors duration-300 mb-2">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {count} Recipes
      </p>
    </div>
  );
};

const Categories = () => {
  return (
    <div className="dark:bg-gray-800 dark:text-white transition-all duration-400">
      <Navbar></Navbar>
      <div className="relative text-center py-28 px-4 bg-[#00000010] mt-6 dark:bg-gray-900 dark:text-white transition-all duration-400">
        <h1 className="text-4xl font-bold mb-4">Categories</h1>
        <p className="text-gray-700 mb-4 dark:text-white">
          Explore a wide range of recipes in each category, from appetizers to
          desserts, catering to all tastes and dietary <br /> needs. Find your
          next meal inspiration today!
        </p>
        <img
          src={bg}
          alt="Background Decoration"
          className="absolute top-86 lg:top-46"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {categoriesData.map((category) => (
            <CategoryCard
              key={category.name}
              icon={category.icon}
              name={category.name}
              count={category.count}
            />
          ))}
        </div>
      </div>

      <PopularTags></PopularTags>
      <Footer></Footer>
    </div>
  );
};

export default Categories;
