import React, { useRef } from 'react';
import bgImg from '../assets/section-bg.jpg'; // Replace with your background image
import { motion, useInView } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { FaStar } from 'react-icons/fa6';

const Discover = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <div
            ref={ref}
            className="relative w-11/12 lg:w-2/3 mx-auto mt-12 rounded-3xl overflow-hidden h-[500px] sm:h-[550px] md:h-[600px] bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0  bg-opacity-30" />


            {/* Rating Badge */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white rounded-full px-3 py-1 flex items-center gap-2 shadow text-xs sm:text-sm font-semibold text-yellow-600 z-10"
            >
                <FaStar className="text-yellow-500" />
                5.0 <span className="text-gray-500 font-normal">score from 10,000 rating</span>
            </motion.div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="relative z-10 h-full flex flex-col justify-center items-center lg:items-end text-black p-4 sm:p-6 md:p-10 lg:p-16 space-y-4 sm:space-y-6 text-center lg:text-right"
            >
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                    Discover fresh and easy <br />
                    recipes to inspire your <br />
                    meals every day.
                </h1>

                <p className="max-w-lg text-sm sm:text-base md:text-lg lg:text-xl text-black">
                    Discover fresh and easy recipes for every meal. From quick breakfasts and light lunches to hearty dinners and indulgent desserts, find endless inspiration to make cooking simple, fun, and enjoyable for any occasion or gathering!
                </p>

                <button className="btn rounded-md bg-white text-black border-0 hover:bg-red-600 hover:text-white transition">
                    View Recipes
                </button>
            </motion.div>
        </div>
    );
};

export default Discover;
