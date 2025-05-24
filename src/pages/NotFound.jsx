import React from 'react';
import image from '../assets/404.jpg';
import { Link } from 'react-router'; 
import { motion } from 'framer-motion';

const NotFound = () => {
    return (
        <div
            style={{ backgroundImage: `url(${image})` }}
            className="w-full h-screen bg-cover bg-center flex items-center justify-end px-6 md:px-12"
        >
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-opacity-70 p-8 rounded-xl text-center lg:text-right w-4/5 mx-auto space-y-4"
            >
                <h1 className="text-7xl md:text-9xl font-bold text-black">OOPS!</h1>
                <p className="text-2xl md:text-3xl font-semibold">That page can't be found</p>
                <p className="text-gray-700">
                    It looks like nothing was found at this location. Maybe try to search for what you <br /> are looking for?
                </p>

                <Link
                    to="/"
                    className="btn inline-block mt-4 px-6 py-2 bg-black text-white font-semibold rounded-full hover:bg-red-700 transition"
                    data-tip="Go back to the home page"
                >
                    Back To Homepage
                </Link>

                
            </motion.div>
        </div>
    );
};

export default NotFound;
