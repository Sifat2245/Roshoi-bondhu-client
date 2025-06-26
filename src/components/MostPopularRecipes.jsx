import React from 'react';
import RecipeCard from './RecipeCard';
import { Link } from 'react-router';


const MostPopularRecipes = ({ AllRecipes }) => {
    // console.log(AllRecipes);
    return (

        <div className='mt-24'>
            <div className='text-center'>
                <h1 className='text-3xl font-bold'>Top Recipes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-11/12 mx-auto justify-center items-center lg:w-3/4 mt-12">
                {AllRecipes.map(recipe => (
                    <RecipeCard recipe={recipe} key={recipe._id} />
                ))}
            </div>

            <div className="flex items-center gap-4 my-8 w-3/4 mx-auto">
                <div className="flex-grow border-t border-gray-300"></div>

                <Link to={'/all-recipes'} className="btn bg-white hover:text-white hover:bg-red-600">Explore All Recipes</Link>

                <div className="flex-grow border-t border-gray-300 "></div>
            </div>




        </div>
    );
};

export default MostPopularRecipes;