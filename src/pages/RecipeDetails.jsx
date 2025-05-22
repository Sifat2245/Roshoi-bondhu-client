import React, { useState } from 'react';
import { useLoaderData } from 'react-router';
import { FaClock, FaUser, FaHeart, FaBookmark, FaPrint } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { TbWorld } from 'react-icons/tb';
import { ImSpoonKnife } from 'react-icons/im';
import { GoDotFill } from 'react-icons/go';
import PopularTags from '../components/PopularTags';
import Footer from '../components/Footer';

const RecipeDetails = () => {
    const recipe = useLoaderData();
    // console.log(recipe._id);
    const [likeCount, setLikeCount] = useState(recipe.likeCount || 0)

    const handleLikeCount = () =>{
        const newLike = likeCount +1;
        setLikeCount(newLike)

        fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipes/${recipe._id}`,{
            method: 'PUT',
            headers:{
                'content-type' : 'application/json'
            },
            body: JSON.stringify({likeCount: newLike })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
    }

    return (
        <>
            <div>
                <Navbar></Navbar>
            </div>

            <div className="bg-gray-100 mt-6 pt-8 relative">
                <div className="w-11/12 mx-auto py-10 max-w-7xl">
                    {/* Image and Details Container */}
                    <div className="flex flex-col lg:block relative">
                        {/* Left: Image */}
                        <div className=" mb-6 lg:absolute lg:right-0 lg:top-0">
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="rounded-xl w-full max-w-lg mx-auto lg:w-auto"
                            />
                        </div>

                        {/* Right: Details */}
                        <div className="w-full">
                            <p className="text-red-500 font-semibold mb-4 mt-4 lg:mt-0 text-center lg:text-left">
                                {likeCount} people interested in this recipe
                            </p>
                            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center lg:text-left">
                                {recipe.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-gray-600 mb-6">
                                <div className="flex flex-col space-y-2 items-center lg:items-start">
                                    <div className="flex items-center gap-2">
                                        <FaClock /> <span>{recipe.preparationTime} min</span>
                                    </div>
                                    <p className="text-[10px]">Cooking Time</p>
                                </div>

                                <div className="flex flex-col space-y-2 items-center lg:items-start">
                                    <div className="flex items-center gap-2">
                                        <TbWorld />
                                        <span>{recipe.cuisine}</span>
                                    </div>
                                    <p className="text-[10px]">Cuisine</p>
                                </div>

                                <div className="flex flex-col space-y-2 items-center lg:items-start">
                                    <div className="flex items-center gap-2">
                                        <ImSpoonKnife />
                                        <span>Serves {recipe.serving || 1}</span>
                                    </div>
                                    <p className="text-[10px]">Serving</p>
                                </div>

                                <div className="flex flex-col space-y-2 items-center lg:items-start">
                                    <div className="flex items-center gap-2">
                                        <FaUser /> <span>{recipe.difficulty || 'Beginner'}</span>
                                    </div>
                                    <p className="text-[10px] text-center lg:text-left">Degree of Difficulties</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className='w-2/3 mx-auto mt-16' >
                {/* Author */}
                <div className='border-b-1 border-gray-300 w-[50%]'>
                    <div className='flex gap-80 mb-2'>
                        <div className="flex items-center gap-3 mb-6">
                            <img src={recipe.authorImage || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" />
                            <div>
                                <h4 className="font-semibold">{recipe.author || 'Unknown Author'}</h4>
                                <p className="text-sm text-gray-500">Recipe Author</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mb-6">
                            <button onClick={handleLikeCount} className="btn btn-circle bg-white border border-red-200 text-red-500 hover:bg-red-100">
                                <FaHeart />
                            </button>
                            <button className="btn btn-circle bg-white border border-red-200 text-red-500 hover:bg-red-100">
                                <FaBookmark />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Ingredients */}
                <div>
                    <h3 className="text-xl font-bold mb-8 mt-8">
                        Ingredients <span className="text-base font-medium text-gray-500">(1 Person)</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 text-gray-800">
                        {recipe.ingredients?.split(',').map((item, index) => (
                            <label key={index} className="flex items-center gap-2">
                                <GoDotFill />

                                <span>{item.trim()}</span>
                            </label>
                        ))}
                    </div>
                </div>


            </div>

            <div className='w-4/5 lg:w-2/3 mx-auto'>
                <div className='lg:w-2/3 mt-52'>
                    <h1 className='text-3xl font-bold mb-10'>Directions</h1>

                    <div className="space-y-6">
                        {recipe.instructions?.map((step, index) => (
                            <div key={index} className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-xl font-semibold text-red-600 whitespace-nowrap">
                                        {step.title}
                                    </h4>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                <p className="text-gray-600">{step.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <PopularTags></PopularTags>
            </div>
            <div>
                <Footer></Footer>
            </div>
        </>
    );
};

export default RecipeDetails;
