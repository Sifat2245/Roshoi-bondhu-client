import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PopularTags from '../components/PopularTags';
import Footer from '../components/Footer';
import { AuthContext } from '../authProvider/AuthProvider';
import bg from '../assets/recipe-taxonomies-bg.svg';
import RecipeCard from '../components/RecipeCard';
import PageTitle from '../components/PageTitle';
import Lottie from 'lottie-react';
import spinner from '../../public/spinner.json';

const MyRecipes = () => {
    const [myRecipes, setMyRecipes] = useState([]);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            setLoading(true);
            fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipe/${user.email}`)
                .then(res => res.json())
                .then(data => {
                    setMyRecipes(data);
                    setLoading(false);
                });
        }
    }, [user?.email]);

    return (
        <>

            <div className='dark:bg-gray-800 dark:text-white transition-all duration-400'>
                <PageTitle title={'Your Recipe Collection'} />

                <Navbar />

                <div className="relative text-center py-28 px-4 bg-[#00000010] mt-6 dark:bg-gray-900 dark:text-white transition-all duration-400">
                    <h1 className="text-4xl font-bold mb-4">Your Recipe Collection</h1>
                    <p className="text-gray-700 mb-4 dark:text-white">
                        This is your personal cookbook! All the recipes you’ve shared live here. Edit, <br /> update, or remove them anytime – your kitchen, your rules.
                    </p>
                    <img
                        src={bg}
                        alt="Background Decoration"
                        className="absolute top-86 lg:top-46"
                    />
                </div>


                <div className="min-h-[40vh] flex justify-center items-center">
                    {loading ? (
                        <div className="w-52">
                            <Lottie animationData={spinner} loop={true} />
                        </div>
                    ) : myRecipes.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-11/12 mx-auto justify-center items-center lg:w-3/4 my-32'>
                            {myRecipes.map(recipe => (
                                <RecipeCard recipe={recipe} key={recipe._id} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-xl my-32">
                            You haven’t added any recipes yet. Start cooking and share your first dish!
                        </div>
                    )}
                </div>

                <PopularTags />
                <Footer />
            </div>

        </>
    );
};

export default MyRecipes;
