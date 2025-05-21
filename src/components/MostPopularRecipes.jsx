import React from 'react';
import RecipeCard from './RecipeCard';


const MostPopularRecipes = ({ AllRecipes }) => {
    console.log(AllRecipes);
    return (

        <div className='mt-24'>
            <div className='text-center'>
                <h1 className='text-3xl font-bold'>Top Recipes</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-11/12 mx-auto justify-center items-center lg:w-3/4 mt-12">
                {AllRecipes.map(recipe => (
                    <RecipeCard recipe={recipe} key={recipe._id} />
                ))}
            </div>





        </div>
    );
};

export default MostPopularRecipes;