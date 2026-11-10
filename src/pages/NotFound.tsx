import React from 'react';
import image from '../assets/404.jpg';
import { Link } from 'react-router'; 
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const NotFound = () => {
    return (
        <div
            style={{ backgroundImage: `url(${image})` }}
            className="w-full min-h-dvh bg-cover bg-center flex items-center justify-center lg:justify-end px-4 py-10 md:px-12"
        >
            <MotionDiv
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/95 dark:bg-[#242526]/95 text-gray-900 dark:text-gray-100 p-6 sm:p-10 rounded-2xl text-center w-full max-w-lg shadow-xl space-y-4"
            >
                <p className="text-sm font-bold tracking-widest text-[#e02f21]">404 · HESHEL</p>
                <h1 className="text-3xl sm:text-4xl font-bold">This page is off the menu</h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                    We couldn’t find this page. It may have moved, or the link may be incomplete. There’s still plenty of good food in your feed.
                </p>

                <Link
                    to="/"
                    className="inline-block mt-4 px-6 py-3 bg-[#e02f21] text-white font-semibold rounded-xl hover:bg-[#c22417] transition"
                    data-tip="Go back to the home page"
                >
                    Back to the feed
                </Link>

                
            </MotionDiv>
        </div>
    );
};

export default NotFound;
