import React, { use } from 'react';
import Navbar from '../components/Navbar';
import PageTitle from '../components/PageTitle';
import bg from '../assets/recipe-taxonomies-bg.svg'
import Footer from '../components/Footer';
import PopularTags from '../components/PopularTags';
import { Outlet } from 'react-router';
import { AuthContext } from '../authProvider/AuthProvider';

const MyAccount = () => {

    const { user } = use(AuthContext)
    return (
        <div>
            <PageTitle title={'My Account - RoshoiBondhu'}></PageTitle>
            <div>
                <Navbar></Navbar>
            </div>
            <div className='relative text-center py-28 px-4 bg-[#00000010] mt-12'>
                <h1 className='text-4xl font-bold mb-4'>My Account</h1>


                <img
                    src={bg}
                    alt="Background Decoration"
                    className="absolute top-60 lg:top-28"
                />
            </div>

            <div>
                {user ? (
                    <div className="w-full max-w-4xl my-36 mx-auto px-4 my-12">
                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={user?.photoURL || 'https://via.placeholder.com/150'}
                                    alt="Profile"
                                    className="w-52 h-52 rounded-xl object-cover border border-gray-300 shadow"
                                />
                            </div>

                            {/* Form Section */}
                            <div className="flex-grow w-full md:w-3/4">
                                <form className="space-y-6">
                                    {/* First and Last Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="firstName" className="block font-semibold text-sm mb-1">
                                                FIRST NAME <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                name="firstName"
                                                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                                placeholder="Enter First Name"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block font-semibold text-sm mb-1">
                                                LAST NAME <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                name="lastName"
                                                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                                placeholder="Enter Last Name"
                                            />
                                        </div>
                                    </div>

                                    {/* Display Name */}
                                    <div>
                                        <label htmlFor="displayName" className="block font-semibold text-sm mb-1">
                                            DISPLAY NAME <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="displayName"
                                            name="displayName"
                                            defaultValue={user?.displayName}
                                            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This will be how your name will be displayed in the account section and in reviews
                                        </p>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block font-semibold text-sm mb-1">
                                            EMAIL ADDRESS <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            defaultValue={user?.email}
                                            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                            readOnly
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Show login form if no user
                    <div className="w-full max-w-md mx-auto my-20 px-4">
                        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                            <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
                            <form className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                        placeholder="Enter your password"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
                                >
                                    Login
                                </button>

                                <div>
                                    <p className='text-red-600 text-[12px]'>Lost your Password?</p>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>



            <div>
                <PopularTags></PopularTags>
            </div>

            <div>
                <Footer></Footer>
            </div>
        </div>
    );
};

export default MyAccount;