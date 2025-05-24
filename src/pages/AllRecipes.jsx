import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useLoaderData, useNavigation } from 'react-router';
import RecipeCard from '../components/RecipeCard';
import bg from '../assets/recipe-taxonomies-bg.svg';
import PopularTags from '../components/PopularTags';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import Lottie from 'lottie-react';
import spinner from '../../public/spinner.json'


const AllRecipes = () => {
    const allRecipes = useLoaderData();
    const [selectedCuisine, setSelectedCuisine] = useState('All');

    const navigation = useNavigation()


    // Extract unique cuisines
    const cuisines = useMemo(() => {
        const types = allRecipes.map(r => r.cuisine).filter(Boolean);
        return ['All', ...new Set(types)];
    }, [allRecipes]);

    // Filter recipes by selected cuisine
    const filteredRecipes = selectedCuisine === 'All'
        ? allRecipes
        : allRecipes.filter(recipe => recipe.cuisine === selectedCuisine);


        if(navigation.state === 'loading'){
             return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="w-52">
                    <Lottie animationData={spinner} loop={true} />
                </div>
            </div>
        );
        }
    
    return (
        <div>
            <PageTitle title={'All Recipes - RoshoiBondhu'} />
            <Navbar />

            <div className='relative text-center py-24 px-4 bg-[#00000010] mt-6'>
                <p className='font-semibold text-[12px] mb-8'>Delicious Recipes Await</p>
                <h1 className='text-4xl font-bold mb-10'>All Recipes</h1>
                <p className="text-gray-700 mb-4">
                    Discover an array of delicious recipes for every occasion. From quick snacks to gourmet meals,
                    explore endless <br /> inspiration, expert tips, and creative ideas for your kitchen adventures!
                </p>
                <img src={bg} alt="Background Decoration" className="absolute top-96 lg:top-56" />
            </div>

            {/* Cuisine Filter Dropdown */}
            <div className='w-11/12 lg:w-3/4 mx-auto my-6 text-right flex gap-4 items-center'>
                <p>Filter By Cuisine</p>
                <select
                    className="px-4 py-2 border rounded shadow"
                    value={selectedCuisine}
                    onChange={e => setSelectedCuisine(e.target.value)}
                >
                    {cuisines.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                </select>
            </div>

            {/* Recipes Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-11/12 mx-auto justify-center items-center lg:w-3/4 my-16'>
                {filteredRecipes.map(recipe => (
                    <RecipeCard recipe={recipe} key={recipe._id} />
                ))}
            </div>

            <PopularTags />
            <Footer />
        </div>
    );
};

export default AllRecipes;
