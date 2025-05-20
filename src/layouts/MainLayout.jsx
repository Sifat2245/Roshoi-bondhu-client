import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const MainLayout = () => {
    return (
        <div>
            <header>
                <Navbar></Navbar>
            </header>
            <main className='mt-6'>
                <Hero></Hero>
            </main>
            <footer>

            </footer>
        </div>
    );
};

export default MainLayout;