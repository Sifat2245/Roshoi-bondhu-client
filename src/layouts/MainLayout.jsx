import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MostPopularRecipes from '../components/MostPopularRecipes';
import { useLoaderData } from 'react-router';

const MainLayout = () => {
    const AllRecipes = useLoaderData()
    // console.log(AllRecipes);
    return (
        <div>
            <header>
                <Navbar></Navbar>
            </header>
            <main className='mt-6'>
                <Hero></Hero>
                <MostPopularRecipes AllRecipes={AllRecipes}></MostPopularRecipes>
            </main>
            <footer>

            </footer>
        </div>
    );
};

export default MainLayout;