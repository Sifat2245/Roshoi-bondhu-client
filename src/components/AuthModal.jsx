import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder for form inputs - customize as needed
const InputField = ({ type, placeholder, id, name, icon }) => (
  <div className="relative mb-4">
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
    <input
      type={type}
      placeholder={placeholder}
      id={id}
      name={name}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-shadow ${icon ? 'pl-10' : ''}`}
    />
  </div>
);

// Placeholder Login Form
const LoginForm = ({ onForgotPassword, onSubmit }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
    className="w-full"
  >
    <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Sign In</h2>
    <p className="text-gray-500 mb-6 text-center text-sm">Use your email account</p>
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField type="email" placeholder="Email" id="login-email" name="email" />
      <InputField type="password" placeholder="Password" id="login-password" name="password" />
      <div className="flex justify-between items-center text-sm mb-4">
        <label htmlFor="remember-me" className="flex items-center cursor-pointer">
          <input type="checkbox" id="remember-me" className="mr-2 rounded text-red-500 focus:ring-red-400" />
          <span className="text-gray-600">Remember me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-red-500 hover:text-red-700 hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <button
        type="submit"
        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold text-sm tracking-wider"
      >
        SIGN IN
      </button>
    </form>
  </motion.div>
);

// Placeholder Sign Up Form
const SignUpForm = ({ onSubmit }) => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.4, ease: 'easeInOut' }}
    className="w-full"
  >
    <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Create Account</h2>
    <p className="text-gray-500 mb-6 text-center text-sm">Enter your details to register</p>
    <form onSubmit={onSubmit} className="space-y-4">
      <InputField type="text" placeholder="Name" id="signup-name" name="name" />
      <InputField type="email" placeholder="Email" id="signup-email" name="email" />
      <InputField type="password" placeholder="Password" id="signup-password" name="password" />
      <button
        type="submit"
        className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold text-sm tracking-wider"
      >
        SIGN UP
      </button>
    </form>
  </motion.div>
);

// AuthModal Component - This is what you will import into your Navbar
const AuthModal = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  //bg image
  const backgroundImageUrl = 'https://i.ibb.co/NgYzxt69/user-box.jpg';



  const panelVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };
  const panelTransition = { duration: 0.5, ease: 'easeInOut' };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted');
    // Add actual login logic here
    // Example: await loginUser(formData);
    // onClose(); // Optionally close modal on successful submit
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    console.log('Sign up submitted');
    // Add actual sign up logic here
    // Example: await signUpUser(formData);
    // onClose(); // Optionally close modal on successful submit
  };

  
  useEffect(() => {
    if (isOpen) {
      setIsLoginView(true);
    }
  }, [isOpen]);


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#000000bd] bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal if backdrop is clicked
        >
          {/* Modal Content Shell */}
          <motion.div
            className="bg-transparent w-full max-w-3xl h-[520px] md:h-[500px] relative shadow-2xl rounded-2xl overflow-hidden flex"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal shell
          >
            {/* Close Button - Positioned on the shell, visible above panels */}
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full p-1.5 z-20 transition-colors"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form Panel (Contains Login or Sign Up form) */}
            <motion.div
              className="absolute top-0 h-full w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-12 z-10"
              animate={{ x: isLoginView ? '100%' : '0%' }} 
              transition={{ duration: 0.6, ease: [0.30, 0.00, 0.20, 1.00] }} 
            >
              <div className="w-full max-w-sm"> 
                <AnimatePresence mode="wait">
                  {isLoginView ? (
                    <LoginForm key="login" onSubmit={handleLoginSubmit} onForgotPassword={() => console.log('Forgot password clicked')} />
                  ) : (
                    <SignUpForm key="signup" onSubmit={handleSignUpSubmit} />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Overlay Panel (Welcome messages, switch buttons, background image) */}
            <motion.div
              className="absolute top-0 h-full w-full md:w-1/2 text-white flex flex-col justify-center items-center text-center p-8 md:p-12"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${backgroundImageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              animate={{ x: isLoginView ? '0%' : '100%' }}
              transition={{ duration: 0.6, ease: [0.30, 0.00, 0.20, 1.00] }}
            >
              <AnimatePresence mode="wait">
                {isLoginView ? (
                  <motion.div
                    key="overlayLogin"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={panelTransition}
                    className="w-full max-w-xs"
                  >
                    <h2 className="text-3xl font-bold mb-3">Hello, Friend!</h2>
                    <p className="text-sm mb-8 leading-relaxed">
                      Enter your personal details and start your journey with us.
                    </p>
                    <button
                      onClick={() => setIsLoginView(false)}
                      className="border-2 border-white rounded-full px-10 py-2.5 font-semibold hover:bg-white hover:text-red-500 transition-colors duration-300 text-sm tracking-wider"
                    >
                      SIGN UP
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="overlaySignup"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={panelTransition}
                    className="w-full max-w-xs"
                  >
                    <h2 className="text-3xl font-bold mb-3">Welcome Back!</h2>
                    <p className="text-sm mb-8 leading-relaxed">
                      To keep connected with us please login with your personal info.
                    </p>
                    <button
                      onClick={() => setIsLoginView(true)}
                      className="border-2 border-white rounded-full px-10 py-2.5 font-semibold hover:bg-white hover:text-red-500 transition-colors duration-300 text-sm tracking-wider"
                    >
                      SIGN IN
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
