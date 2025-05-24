import React, { useState, useEffect, use } from 'react';
import { FaArrowRight, FaMoon, FaSun } from 'react-icons/fa6';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { Link, NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../src/assets/logo.png';
import AuthModal from './AuthModal';
import { AuthContext } from '../authProvider/AuthProvider';
import { Tooltip } from 'react-tooltip';
import { useDarkMode } from '../context/ThemeContext';

const Navbar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const navigate = useNavigate()

    const { user, logoutUser } = use(AuthContext)


    const openAuthModal = () => {
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };


    const handleUserIconClick = () => {
        if (user) {
            navigate('/my-account')
        }
        else {
            openAuthModal()
        }
    }


    const openDrawer = () => {
        setIsVisible(true);
        setTimeout(() => setIsDrawerOpen(true), 300);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setIsVisible(false), 600);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const { darkMode, setDarkMode } = useDarkMode()

    const links = (
        <>
            <li>
                <NavLink to="/" className="hover:text-[#e02f21] lg:hover:bg-[#f8deddbe] px-4 py-2 rounded-2xl flex items-center gap-4" onClick={closeDrawer}>
                    <p>Home</p>
                    <FaArrowRight className="block lg:hidden" />
                </NavLink>
            </li>
            <li>
                <NavLink to="/all-recipes" className="hover:text-[#e02f21] lg:hover:bg-[#f8deddbe] px-4 py-2 rounded-2xl flex items-center gap-4" onClick={closeDrawer}>
                    <p>All Recipes</p>
                    <FaArrowRight className="block lg:hidden" />
                </NavLink>
            </li>
            <li>
                <NavLink to="/my-recipes" className="hover:text-[#e02f21] lg:hover:bg-[#f8deddbe] px-4 py-2 rounded-2xl flex items-center gap-4" onClick={closeDrawer}>
                    <p>My Recipes</p>
                    <FaArrowRight className="block lg:hidden" />
                </NavLink>
            </li>
            <li>
                <NavLink to="/about" className="hover:text-[#e02f21] lg:hover:bg-[#f8deddbe] px-4 py-2 rounded-2xl flex items-center gap-4" onClick={closeDrawer}>
                    <p>About Us</p>
                    <FaArrowRight className="block lg:hidden" />
                </NavLink>
            </li>
        </>
    );

    return (
        <>
            {/* Animated Sticky Navbar */}
            <AnimatePresence mode="wait">
                {scrolled && (
                    <>
                        {/* White background comes FIRST */}
                        <motion.div
                            key="navbar-bg"
                            className="fixed top-0 left-0 w-full bg-white shadow z-50 h-[80px] dark:bg-gray-900"
                            initial={{ y: -100 }}
                            animate={{ y: 0 }}
                            exit={{ y: -100 }}
                            transition={{ duration: 0.4, }} // delay on exit
                        />

                        {/* Navbar content comes AFTER background */}
                        <motion.div
                            key="navbar-content"
                            className="fixed top-0 left-0 w-full z-[60]"
                            initial={{ opacity: 0, y: -30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.7, delay: 0 }} // delay on enter
                        >
                            <div className="navbar max-w-7xl mx-auto px-4 py-2">
                                <div className="navbar-start space-x-10 w-full">
                                    <div className="flex items-center">
                                        <img src={logo} className="w-8 lg:w-12 h-8 lg:h-12" alt="Logo" />
                                        <a className="p-2 text-[18px] lg:text-[22px] font-bold text-[#e02f21]">RoshoiBondhu</a>
                                    </div>
                                    <ul className="menu menu-horizontal px-1 hidden lg:flex text-[15px] font-bold space-x-3">
                                        {links}
                                    </ul>
                                </div>
                                <div className="navbar-end">
                                    <button
                                        onClick={() => setDarkMode(!darkMode)}
                                        className="text-xl p-2 rounded-full transition-colors duration-300"
                                    >
                                        {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-800" />}
                                    </button>
                                    <button data-tooltip-id="user-info"
                                        data-tooltip-content={user?.displayName}
                                        onClick={handleUserIconClick}>
                                        <FiUser className="w-6 h-6 lg:mr-6 hover:cursor-pointer hover:text-[#e02f21]" />
                                    </button>
                                    {
                                        user ? <button onClick={logoutUser}><FiLogOut className='w-6 h-6 lg:mr-6 ml-6 lg:ml-0 hover:cursor-pointer hover:text-[#e02f21]' /></button> : ''
                                    }

                                    <Link to='/add-recipe' className="btn border-0 bg-[#dbdbdbc5] px-4 py-3 hover:bg-[#e02f21] hover:text-white hidden lg:block dark:bg-gray-700 dark:text-white">
                                        Add recipe
                                    </Link>

                                </div>
                                <div className="ml-2 lg:hidden p-0 m-0">
                                    <button onClick={openDrawer} className="btn btn-ghost">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>



            {/* Original Navbar (when not scrolled) */}
            {!scrolled && (
                <div className="navbar max-w-7xl mx-auto">
                    <div className="navbar-start space-x-10 w-full">
                        <div className="flex items-center">
                            <img src={logo} className="w-8 lg:w-12 h-8 lg:h-12" alt="Logo" />
                            <a className="p-2 text-[18px] lg:text-[22px] font-bold text-[#e02f21] ">RoshoiBondhu</a>
                        </div>
                        <ul className="menu menu-horizontal px-1 hidden lg:flex text-[15px] font-bold space-x-3">
                            {links}
                        </ul>
                    </div>
                    <div className="navbar-end">

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="text-xl p-2 rounded-full transition-colors duration-300"
                        >
                            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-800" />}
                        </button>

                        <button onClick={handleUserIconClick}
                            data-tooltip-id="user-info"
                            data-tooltip-content={user?.displayName}>
                            <FiUser className="w-6 h-6 lg:mr-6 hover:cursor-pointer hover:text-[#e02f21]" />
                        </button>

                        {
                            user ? <button onClick={logoutUser}><FiLogOut className='w-6 h-6 mr-0 lg:mr-6  ml-4 lg:ml-0 hover:cursor-pointer hover:text-[#e02f21]' /></button> : ''
                        }


                        <Link to='/add-recipe' className="btn border-0 bg-[#dbdbdbc5] px-4 py-3 hover:bg-[#e02f21] hover:text-white hidden lg:block dark:bg-gray-700 dark:text-white">Add recipe</Link>

                    </div>
                    <div className="ml-2 lg:hidden p-0 m-0">
                        <button onClick={openDrawer} className="btn btn-ghost">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isVisible && (
                <div className="fixed inset-0 bg-[#0000006e] bg-opacity-40 z-40 transition-all duration-100" onClick={closeDrawer}></div>
            )}

            {/* Drawer */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-white z-50 p-4 transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center mb-4">
                    <button onClick={closeDrawer}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <ul className="space-y-6 font-bold mt-12">
                    {links}
                    <Link to='/add-recipe' className="btn border-0 bg-[#dbdbdbc5] px-4 py-3 hover:bg-[#e02f21] hover:text-white">Add recipe</Link>
                </ul>
            </div>
            <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
            <Tooltip id="user-info" place="top" />
        </>
    );
};

export default Navbar;
