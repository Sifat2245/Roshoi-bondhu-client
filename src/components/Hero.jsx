import React from 'react';
import heroImage from '../assets/search-hero-2.jpg';
import { IoSearch } from 'react-icons/io5';
import { ImSpoonKnife } from 'react-icons/im';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div
            className="bg-cover bg-center bg-no-repeat w-11/12 mx-auto rounded-3xl mt-8
                       p-6 sm:p-10 md:p-16 lg:p-[200px] space-y-6 md:space-y-10"
            style={{
                background: `url(${heroImage})`,
                backgroundSize: 'cover',
            }}
        >
            <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                You don't know how to make <br /> the dish you have in mind?
            </motion.h1>

            <motion.p
                className="text-sm sm:text-base md:text-lg lg:text-xl text-black"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                Feed your imagination and spark your creativity. From cravings to creations, let your <br className="hidden md:block" />
                ideas flourish and uncover the perfect recipe waiting to be discovered.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.0, delay: 0.7 }}
            >
                <div className=" bg-white w-full sm:w-[85%] md:w-[75%] lg:w-[55%] p-2 md:p-3 rounded-2xl flex items-center gap-2 md:gap-4 mb-4">
                    <span>
                        <ImSpoonKnife className="text-[#e02f21] h-6 w-6 md:h-7 md:w-7 ml-2 md:ml-3" />
                    </span>
                    <input
                        type="text"
                        placeholder="Find what do you want to cook today"
                        className="w-full outline-none text-sm md:text-base text-black"
                    />
                    <button className="btn bg-[#e02f21] text-white rounded-xl text-sm hover:bg-gray-800 transition-all duration-300 px-3 py-3 md:px-4 md:py-7">
                        <IoSearch className="h-6 w-6 md:h-7 md:w-7" />
                    </button>
                </div>
                <p className="text-[10px] md:text-[12px] text-black">
                    Type a keyword and discover recipes that turn your cravings into delicious reality!
                </p>
            </motion.div>
        </div>

        
    );
};

export default Hero;
