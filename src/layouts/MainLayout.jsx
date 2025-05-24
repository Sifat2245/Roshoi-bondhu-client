import React, { useRef, useState } from 'react';
import { useLoaderData, useNavigation } from 'react-router';
import { motion, useInView } from 'framer-motion';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MostPopularRecipes from '../components/MostPopularRecipes';
import Discover from '../components/Discover';
import PopularTags from '../components/PopularTags';
import Footer from '../components/Footer';
import spinner from '../../public/spinner.json'
import Lottie from 'lottie-react';

const FadeInSection = ({ children }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
        >
            {children}
        </motion.div>
    );
};

const MainLayout = () => {
    const AllRecipes = useLoaderData();

    const navigation = useNavigation()

    if (navigation.state === 'loading') {
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
            <header>
                <Navbar />
            </header>

            <main className="mt-6 space-y-10">
                <FadeInSection>
                    <Hero />
                </FadeInSection>

                <FadeInSection>
                    <MostPopularRecipes AllRecipes={AllRecipes} />
                </FadeInSection>

                <FadeInSection>
                    <Discover />
                </FadeInSection>

                <FadeInSection>
                    <PopularTags />
                </FadeInSection>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
};

export default MainLayout;
