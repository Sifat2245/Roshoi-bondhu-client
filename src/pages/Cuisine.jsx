import React from "react";
import bg from "../assets/recipe-taxonomies-bg.svg";
import Navbar from "../components/Navbar";
import PopularTags from "../components/PopularTags";
import Footer from "../components/Footer";

const cuisinesData = [
  { name: "American", count: 5, flagCode: "us" },
  { name: "Brazilian", count: 1, flagCode: "br" },
  { name: "Chinese", count: 1, flagCode: "cn" },
  { name: "Ethiopian", count: 4, flagCode: "et" },
  { name: "French", count: 3, flagCode: "fr" },
  { name: "German", count: 3, flagCode: "de" },
  { name: "Greek", count: 3, flagCode: "gr" },
  { name: "Indian", count: 2, flagCode: "in" },
  { name: "Italian", count: 8, flagCode: "it" },
  { name: "Japanese", count: 1, flagCode: "jp" },
  { name: "Korean", count: 3, flagCode: "kr" },
  { name: "Lebanese", count: 4, flagCode: "lb" },
  { name: "Mexican", count: 5, flagCode: "mx" },
  { name: "Moroccan", count: 4, flagCode: "ma" },
  { name: "Persian", count: 1, flagCode: "ir" },
  { name: "Spanish", count: 4, flagCode: "es" },
  { name: "Thai", count: 5, flagCode: "th" },
  { name: "Turkish", count: 6, flagCode: "tr" },
  { name: "Vietnamese", count: 2, flagCode: "vn" },
];

const CuisineCard = ({ name, count, flagCode }) => {
  // Using a reliable source for circular SVG flags
  const flagUrl = `https://hatscripts.github.io/circle-flags/flags/${flagCode}.svg`;
  return (
    <div
      className="
      dark:bg-gray-700 dark:text-white
        group
        flex flex-col items-center justify-center
        p-6
         
        border border-gray-200 dark:border-gray-700
        rounded-xl
        text-center
        transition-all duration-300
        hover:shadow-lg hover:border-[#e02f21] hover:-translate-y-1
        cursor-pointer
      "
    >
      <img
        src={flagUrl}
        alt={`${name} flag`}
        className="w-10 h-10 mb-2"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.onerror = null;
        }}
      />
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {count} Recipes
      </p>
    </div>
  );
};

const Cuisine = () => {
  return (
    <div className="dark:bg-gray-800 dark:text-white transition-all duration-400">
      <Navbar></Navbar>
      <div className="relative text-center py-28 px-4 bg-[#00000010] mt-6  dark:bg-gray-900 dark:text-white transition-all duration-400">
        <h1 className="text-4xl font-bold mb-4">Cuisines</h1>
        <p className="text-gray-700 mb-4 dark:text-white">
          Explore a world of diverse cuisines from all corners of the globe.
          Discover unique recipes and rich food cultures <br /> that cater to
          every taste and preference!
        </p>
        <img
          src={bg}
          alt="Background Decoration"
          className="absolute top-86 lg:top-46"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 ">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {cuisinesData.map((cuisine) => (
            <CuisineCard
              key={cuisine.name}
              name={cuisine.name}
              count={cuisine.count}
              flagCode={cuisine.flagCode}
            />
          ))}
        </div>
      </div>

      <PopularTags></PopularTags>
      <Footer></Footer>
    </div>
  );
};

export default Cuisine;
