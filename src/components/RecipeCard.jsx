import React from 'react';
import { FaHeart, FaBookmark, FaStar, FaClock, FaFlag, FaUser } from "react-icons/fa";
import { Link } from 'react-router';


const RecipeCard = ({ recipe }) => {

    return (
        <>
        <Link to={`/recipe-details/${recipe._id}`} className="card w-full bg-base-100 rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="relative">
                <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-96 rounded-2xl object-cover"
                />

                {/* Rating Badge */}
                <div className="absolute top-2 left-2 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow text-sm font-medium text-yellow-600">
                    <FaStar className="text-yellow-500" />
                    4.8
                </div>

                {/* Top Right Buttons */}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  
                    <button className="bg-white p-2 rounded-full shadow hover:bg-red-100">
                        <FaBookmark className="text-red-500" />
                    </button>
                </div>
            </div>

            <div className="card-body px-4 pt-4 pb-5">
                {/* <p className="text-red-500 text-sm font-semibold">{recipe.categories}</p> */}
                <h2 className="text-lg font-bold leading-snug">
                    {recipe.title}
                </h2>

                {/* Meta Info */}
                <div className="flex items-center justify-between gap-4 text-gray-500 text-sm mt-3">
                    <div className="flex items-center gap-1">
                       <FaHeart className="text-red-500" />
                        <span>{recipe.likeCount} Likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaClock className="text-gray-500" />
                        <span>{recipe.preparationTime} Min</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FaFlag className="text-gray-500" />
                        <span>{recipe.cuisine}</span>
                    </div>
                </div>
            </div>
        </Link>

        </>
    );
};

export default RecipeCard;