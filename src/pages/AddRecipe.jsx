import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import bg from '../assets/recipe-taxonomies-bg.svg';

const AddRecipe = () => {
    const [selectedCuisine, setSelectedCuisine] = useState('');
    const [customCuisine, setCustomCuisine] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedCategories([...selectedCategories, value]);
        } else {
            setSelectedCategories(selectedCategories.filter((cat) => cat !== value));
        }
    };

    return (
        <div>
            <Navbar />

            <div className='relative text-center py-28 px-4 bg-[#00000010] mt-12'>
                <h1 className='text-3xl font-bold mb-4'>Add Recipe</h1>
                <p className="text-gray-700 mb-4">
                    Discover and share your favorite recipes on Roshoi-Bondhu! Add your own delicious dishes and inspire others with new <br className="hidden md:block" /> culinary creations.
                </p>

                {/* ✅ Make sure the parent is relative */}
                <img
                    src={bg}
                    alt="Background Decoration"
                    className="absolute top-72 lg:top-44"
                />
            </div>

            <form className='max-w-5xl mx-auto px-4 md:px-8 py-16 space-y-10'>
                {/* Image URL */}
                <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>IMAGE URL</label>
                    <input type="text" className='w-full md:w-2/3 border border-gray-400 rounded-lg p-3' />
                </div>

                {/* Title */}
                <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>TITLE</label>
                    <input type="text" className='w-full md:w-2/3 border border-gray-400 rounded-lg p-3' />
                </div>

                {/* Ingredients */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>INGREDIENTS</label>
                    <textarea className='w-full md:w-2/3 border border-gray-400 rounded-lg p-3' rows="6"></textarea>
                </div>

                {/* Instructions */}
                <div className='flex flex-col md:flex-row gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>INSTRUCTIONS</label>
                    <textarea className='w-full md:w-2/3 border border-gray-400 rounded-lg p-3' rows="8"></textarea>
                </div>

                {/* Preparation Time */}
                <div className='flex flex-col md:flex-row items-start md:items-center gap-4'>
                    <label className='w-full md:w-1/3 text-md font-semibold'>PREPARATION TIME</label>
                    <input type="number" className='w-full md:w-2/3 border border-gray-400 rounded-lg p-3' />
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
                            className='border rounded px-3 py-2 w-full md:w-1/2'
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
                    <input
                        type="submit"
                        value="Add Recipe"
                        className='btn bg-[#e02f21] text-white hover:bg-black rounded-md px-12 py-2'
                    />
                </div>
            </form>
        </div>
    );
};

export default AddRecipe;
