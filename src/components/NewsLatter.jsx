import React from "react";
import newsBg from "../assets/search-section-background.jpg";

const NewsLatter = () => {
  return (
    <div
      style={{
        backgroundImage: `url(${newsBg})`,
      }}
      className="mt-24"
    >
      <div className="text-center text-white py-44 bg-black/55">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4">
          Subscribe to Our Newsletter
        </h1>
        <p className="mb-8 text-xs md:text-lg">
          Subscribe to our newsletter and get delicious recipes, expert cooking
          tips, and the latest food trends
        </p>
        <div className="flex w-11/12 md:w-1/2 mx-auto bg-white py-2 px-2 rounded-xl flex-row items-center ">
          <input
            type="email"
            className="w-full px-2 md:px-4 py-2 md:py-4 border placeholder-gray-500 text-black  border-gray-300 rounded-bl-lg rounded-tl-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Enter your email address"
          />
          <button className="w-1/2 sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold md:px-6 py-2 md:py-4 rounded-br-lg rounded-tr-lg text-sm md:text-lg transition duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsLatter;
