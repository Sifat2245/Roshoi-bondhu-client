import React, { use, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { FaClock, FaUser, FaHeart, FaBookmark, FaPrint, FaEdit } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import { TbWorld } from 'react-icons/tb';
import { ImSpoonKnife } from 'react-icons/im';
import { GoDotFill } from 'react-icons/go';
import PopularTags from '../components/PopularTags';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import { AuthContext } from '../authProvider/AuthProvider';
import { FaTrash } from 'react-icons/fa6';
import Swal from 'sweetalert2';

const RecipeDetails = () => {
    const recipe = useLoaderData();


 
    // console.log(recipe._id);
    const navigate = useNavigate()
    const [likeCount, setLikeCount] = useState(recipe.likeCount || 0)
    const { user } = use(AuthContext)
    const [editModalOpen, setEditModalOpen] = useState(false);

    const isOwner = user?.email === recipe.userEmail;


    const [selectedCuisine, setSelectedCuisine] = useState('');
    const [customCuisine, setCustomCuisine] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [instructionSteps, setInstructionSteps] = useState([
        {
            title: '',
            details: ''
        }
    ])
    const [loading, setLoading] = useState(false)





    const handleInstructionChange = (index, field, value) => {
        const updateSteps = [...instructionSteps]
        updateSteps[index][field] = value;
        setInstructionSteps(updateSteps)
    }

    const addInstructionStep = () => {
        setInstructionSteps([...instructionSteps, { title: '', details: '' }])
    }


    // if checked having it in a state
    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedCategories([...selectedCategories, value]);
        } else {
            setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
        }
    };




    const handleLikeCount = () => {
        const newLike = likeCount + 1;
        setLikeCount(newLike)

        fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipes/${recipe._id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ likeCount: newLike })
        })
            .then(res => res.json())
            .then(data => {
                console.log(data);
            })
    }



    const handleUpdateRecipe = e => {
        e.preventDefault()
        // alert('clicked')

        const form = e.target
        const image = form.image.value
        const title = form.title.value
        const ingredients = form.ingredients.value
        const instructions = instructionSteps.filter(step => step.title && step.details);
        const preparationTime = form.preparationTime.value
        const categories = selectedCategories;
        const cuisine = selectedCuisine === 'Others' ? customCuisine : selectedCuisine;

        const recipeData = {
            image,
            title,
            ingredients,
            instructions,
            preparationTime,
            categories,
            cuisine

        }
        setLoading(true)
        // console.log(recipeData);

        fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipes/${recipe._id}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.modifiedCount) {
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Changes Saved Successfully",
                        showConfirmButton: false,
                        timer: 1500
                    });

                    console.log('after update', data);
                }
            })
            .finally(() => {
                setLoading(false);
                setEditModalOpen(false)
                // window.location.reload();
                setTimeout(() => {

                    window.location.reload();
                }, 1500);
            });

    }


    const handleDeletePost = () => {
       
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {

                fetch(`https://roshoi-bondhu-server.vercel.app/AllRecipes/${recipe._id}`, {
                    method: 'DELETE'
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.deletedCount) {

                            Swal.fire({
                                title: "Deleted!",
                                text: "User has been deleted.",
                                icon: "success"
                            });


                            // console.log(data);
                            navigate('/my-recipes')
                        }
                    })


            }
        });
    }

    return (
        <>
            <PageTitle title={`${recipe.title} - RoshoiBondhu`}></PageTitle>
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
                <div className='border-b border-gray-300 w-full md:w-[50%]'>
                    <div className='flex flex-col md:flex-row justify-between gap-6 mb-2'>

                        {/* Author Info */}
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <img src={recipe.userPhoto || "https://i.pravatar.cc/40"} className="w-10 h-10 rounded-full" />
                            <div>
                                <h4 className="font-semibold">{recipe.userName || 'Unknown Author'}</h4>
                                <p className="text-sm text-gray-500">Recipe Author</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            {/* Like */}
                            <button
                                onClick={handleLikeCount}
                                disabled={isOwner}
                                className={`btn btn-circle bg-white border border-red-200 text-red-500 hover:bg-red-100 
          ${isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={isOwner ? "You can't like your own recipe" : "Like this recipe"}
                            >
                                <FaHeart />
                            </button>

                            {/* Edit (owner only) */}
                            {isOwner && (
                                <button
                                    onClick={() => setEditModalOpen(true)}
                                    className="btn btn-circle bg-white border border-red-200 text-red-500 hover:bg-blue-100"
                                    title="Edit this recipe"
                                >
                                    <FaEdit />
                                </button>
                            )}

                            {/* Delete (owner only) */}
                            {isOwner && (
                                <button
                                    onClick={handleDeletePost}
                                    className="btn btn-circle bg-white border border-red-200 text-red-500 hover:bg-red-100"
                                    title="Delete this recipe"
                                >
                                    <FaTrash />
                                </button>
                            )}

                            {/* Bookmark */}
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



            {/* recipe update modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setEditModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold mb-6">Edit Recipe</h2>
                        <form onSubmit={handleUpdateRecipe} className='max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-10'>
                            {/* Image URL */}
                            <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>IMAGE URL</label>
                                <input type="text" name='image' defaultValue={recipe.image} className='focus:outline-none focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' placeholder='Image URL' />
                            </div>

                            {/* Title */}
                            <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>TITLE</label>
                                <input type="text" name='title' defaultValue={recipe.title} className='focus:outline-none focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' placeholder='Title' />
                            </div>

                            {/* Ingredients */}
                            <div className='flex flex-col md:flex-row gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>INGREDIENTS</label>
                                <textarea name='ingredients' defaultValue={recipe.ingredients} className='focus:outline-none focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' rows="6" placeholder='Ingredients'></textarea>
                            </div>

                            {/* Instructions */}
                            <div className='flex flex-col md:flex-row gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>INSTRUCTIONS</label>
                                <div className='w-full md:w-2/3 space-y-6'>
                                    {instructionSteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className='border border-gray-300 bg-white shadow-sm p-5 rounded-xl space-y-3'
                                        >
                                            <h4 className='text-lg font-semibold text-gray-700'>
                                                Step {index + 1}
                                            </h4>
                                            <input
                                                type='text'
                                                placeholder='Step Title (e.g., Prepare the Ingredients)'
                                                value={step.title}
                                                defaultValue={recipe?.instructions?.title}
                                                onChange={(e) => handleInstructionChange(index, 'title', e.target.value)}
                                                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'
                                            />
                                            <textarea
                                                placeholder='Step Details'
                                                value={step.details}
                                                defaultValue={recipe?.instructions?.title}
                                                onChange={(e) => handleInstructionChange(index, 'details', e.target.value)}
                                                className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400'
                                                rows={4}
                                            />
                                        </div>
                                    ))}
                                    <div className='text-right'>
                                        <button
                                            type='button'
                                            onClick={addInstructionStep}
                                            className='bg-[#e02f21] hover:bg-black text-white font-semibold px-5 py-2 rounded-md transition'
                                        >
                                            + Add Another Step
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Preparation Time */}
                            <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>PREPARATION TIME</label>
                                <input name='preparationTime' defaultValue={recipe.preparationTime} type="number" className='focus:outline-none focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' placeholder='How much time (Number only)' />
                            </div>

                            {/* Categories */}
                            <div className='flex flex-col md:flex-row gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>CATEGORIES</label>
                                <div className="flex flex-wrap gap-6">
                                    {['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan'].map((category) => (
                                        <label key={category} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                value={category}
                                                onChange={handleCheckboxChange}
                                                className="accent-red-600"
                                            />
                                            {category}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Cuisine Type */}
                            <div className='flex flex-col md:flex-row gap-4'>
                                <label className='w-full md:w-1/3 text-md font-semibold'>CUISINE TYPE</label>
                                <div className='flex flex-col md:flex-row gap-4 w-full md:w-2/3'>
                                    <select
                                        className='border rounded px-3 py-2 w-full md:w-1/2 '
                                        value={selectedCuisine}
                                        onChange={(e) => setSelectedCuisine(e.target.value)}
                                    >
                                        <option value="">Select a cuisine</option>
                                        <option value="Bangladeshi">Bangladeshi</option>
                                        <option value="Indian">Indian</option>
                                        <option value="Pakistani">Pakistani</option>
                                        <option value="Mexican">Mexican</option>
                                        <option value="Moroccan">Moroccan</option>
                                        <option value="French">French</option>
                                        <option value="Thai">Thai</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {selectedCuisine === 'Others' && (
                                        <input
                                            type="text"
                                            className='border px-3 py-2 rounded w-full md:w-1/2'
                                            placeholder="Enter custom cuisine"
                                            value={customCuisine}
                                            onChange={(e) => setCustomCuisine(e.target.value)}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <div className='text-center'>
                                <button
                                    type="submit"
                                    className='btn bg-[#e02f21] text-white hover:bg-black rounded-md px-12 py-2'
                                    onClick={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Posting...
                                        </span>
                                    ) : (
                                        "Save Change"
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </>
    );
};

export default RecipeDetails;
