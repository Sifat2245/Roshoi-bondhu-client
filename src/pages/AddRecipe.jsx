import React, { use, useState } from 'react';
import Navbar from '../components/Navbar';
import bg from '../assets/recipe-taxonomies-bg.svg';
import Swal from 'sweetalert2';
import Footer from '../components/Footer';
import PopularTags from '../components/PopularTags';
import PageTitle from '../components/PageTitle';
import { AuthContext } from '../authProvider/AuthProvider';
import { useNavigate } from 'react-router';

const AddRecipe = () => {
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
    const navigate = useNavigate()

    const { user } = use(AuthContext);



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

    const handleAddRecipe = e => {
        e.preventDefault()
        // console.log('clicked');
        const form = e.target
        const image = form.image.value
        const title = form.title.value
        const ingredients = form.ingredients.value
        const instructions = instructionSteps.filter(step => step.title && step.details);
        const preparationTime = form.preparationTime.value
        const categories = selectedCategories;
        const cuisine = selectedCuisine === 'Others' ? customCuisine : selectedCuisine;
        const userEmail = user.email;
        const userName = user.displayName;
        const userPhoto = user.photoURL;

        const recipeData = {
            image,
            title,
            ingredients,
            instructions,
            preparationTime,
            categories,
            cuisine,
            likeCount: 0,
            userEmail,
            userName,
            userPhoto
        }
        // console.log(recipeData);
        setLoading(true)

        //sending in db
        fetch('https://roshoi-bondhu-server.vercel.app/AllRecipes', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(recipeData)
        })
            .then(res => res.json())
            .then(data => {
                if(data.insertedId){
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Recipe Posted",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
                // console.log('after sent', data);
            })
            .finally(() => {
                setLoading(false);
                navigate('/my-recipes')
            });
    }


    return (
        <div className='dark:bg-gray-800 dark:text-white transition-all duration-400'>
            <PageTitle title={'Add Recipe - RoshoiBondhu'}></PageTitle>
            <Navbar />

            <div className='relative text-center py-28 px-4 bg-[#00000010] mt-6 dark:bg-gray-900'>
                <h1 className='text-4xl font-bold mb-4'>Add Recipe</h1>
                <p className="text-gray-700 mb-4 dark:text-white">
                    Discover and share your favorite recipes on Roshoi-Bondhu! Add your own delicious dishes and inspire others with new <br /> culinary creations.
                </p>

                <img
                    src={bg}
                    alt="Background Decoration"
                    className="absolute top-72 lg:top-44"
                />
            </div>

            <form onSubmit={handleAddRecipe} className='max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-10'>
                {/* Image URL */}
                <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>IMAGE URL</label>
                    <input type="text" name='image' className='dark:bg-gray-900 focus:outline-none dark:bg-gray-900 focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' placeholder='Image URL' />
                </div>

                {/* Title */}
                <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>TITLE</label>
                    <input type="text" name='title' className='focus:outline-none dark:bg-gray-900 focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' placeholder='Title' />
                </div>

                {/* Ingredients */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>INGREDIENTS</label>
                    <textarea name='ingredients' className='focus:outline-none dark:bg-gray-900 focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' rows="6" placeholder='Ingredients'></textarea>
                </div>

                {/* Instructions */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>INSTRUCTIONS</label>
                    <div className='w-full md:w-2/3 space-y-6 dark:bg-gray-800'>
                        {instructionSteps.map((step, index) => (
                            <div
                                key={index}
                                className='dark:bg-gray-800 border border-gray-300 bg-white shadow-sm p-5 rounded-xl space-y-3'
                            >
                                <h4 className='text-lg font-semibold text-gray-700 dark:text-white'>
                                    Step {index + 1}
                                </h4>
                                <input
                                    type='text'
                                    placeholder='Step Title (e.g., Prepare the Ingredients)'
                                    value={step.title}
                                    onChange={(e) => handleInstructionChange(index, 'title', e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none dark:bg-gray-900 focus:ring-2 focus:ring-red-400'
                                />
                                <textarea
                                    placeholder='Step Details'
                                    value={step.details}
                                    onChange={(e) => handleInstructionChange(index, 'details', e.target.value)}
                                    className='w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none dark:bg-gray-900 focus:ring-2 focus:ring-red-400'
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
                    <input name='preparationTime' type="number" className='focus:outline-none dark:bg-gray-900 focus:ring-2 focus:ring-red-400 w-full md:w-2/3 border border-gray-400 rounded-lg p-3' placeholder='How much time (Number only)' />
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
                <div className='flex flex-col md:flex-row gap-4 '>
                    <label className='w-full md:w-1/3 text-md font-semibold'>CUISINE TYPE</label>
                    <div className='flex flex-col md:flex-row gap-4 w-full md:w-2/3'>
                        <select
                            className='border rounded px-3 py-2 w-full md:w-1/2 dark:bg-gray-900'
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
                            "Post Recipe"
                        )}
                    </button>
                </div>

            </form>

            <div>
                <PopularTags></PopularTags>
            </div>

            <div><Footer></Footer></div>
        </div>
    );
};

export default AddRecipe;
