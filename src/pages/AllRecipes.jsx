import React from 'react';
import Navbar from '../components/Navbar';
import { useLoaderData } from 'react-router';
import RecipeCard from '../components/RecipeCard';
import bg from '../assets/recipe-taxonomies-bg.svg'
import AllRecipesCard from '../components/AllRecipesCard';

const AllRecipes = () => {
    const AllRecipes = useLoaderData()
    console.log(AllRecipes);
    return (
        <div>
            <div>
                <Navbar></Navbar>
            </div>
            <div className='relative text-center py-28 px-4 bg-[#00000010] mt-12'>
                <p className='font-semibold text-[12px] mb-6'>Delicious Recipes Await</p>
                <h1 className='text-4xl font-bold mb-4'>All Recipes</h1>
                <p className="text-gray-700  mb-4">
                   Discover an array of delicious recipes for every occasion. From quick snacks to gourmet meals, explore endless <br /> inspiration, expert tips, and creative ideas for your kitchen adventures!
                </p>

                <img
                    src={bg}
                    alt="Background Decoration"
                    className="absolute top-96 lg:top-56"
                />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-11/12 mx-auto justify-center items-center lg:w-3/4 mt-12'>
                {
                    AllRecipes.map(recipe => <AllRecipesCard recipe={recipe} key={recipe._id}></AllRecipesCard>)
                }
            </div>

        </div>
    );
};

export default AllRecipes;