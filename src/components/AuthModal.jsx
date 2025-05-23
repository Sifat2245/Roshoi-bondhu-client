import React, { useEffect, useState, useContext } from 'react'; // Removed 'use'
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../authProvider/AuthProvider';

// Custom hook to detect screen size (remains the same)
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatches = () => {
      if (media.matches !== matches) {
        setMatches(media.matches);
      }
    };
    updateMatches();
    media.addEventListener('change', updateMatches);
    return () => media.removeEventListener('change', updateMatches);
  }, [matches, query]);
  return matches;
};

// Google Icon SVG (remains the same)
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// InputField (remains the same, but ensure value and onChange are handled by parent forms)
const InputField = ({ type, placeholder, id, name, icon, value, onChange, autoComplete }) => (
  <div className="relative mb-4">
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
    <input
      type={type}
      placeholder={placeholder}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete || "off"}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-shadow ${icon ? 'pl-10' : ''}`}
    />
  </div>
);

const LoginForm = ({ onForgotPassword, onSubmit, setIsLoginView, onGoogleSignIn, loading, authError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Sign In</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">Use your email account or Google</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField type="email" placeholder="Email" id="login-email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <InputField type="password" placeholder="Password" id="login-password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
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
        {authError && <p className="text-red-500 text-xs text-center -mt-2 mb-2">{authError}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold text-sm tracking-wider disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'SIGN IN'}
        </button>
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
          <p className="text-center font-normal text-gray-500 text-xs mx-4">OR</p>
        </div>
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm text-gray-700 font-medium disabled:opacity-50"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setIsLoginView(false)}
          className="font-semibold text-red-500 hover:text-red-700 hover:underline"
        >
          Create account
        </button>
      </p>
    </motion.div>
  );
}

const SignUpForm = ({ onSubmit, setIsLoginView, onGoogleSignUp, loading }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();


    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must include at least one uppercase letter.');
      return;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError('Password must include at least one lowercase letter.');
      return;
    } else {
      setPasswordError(''); 
    }

   
    if (passwordError) {
      return;
    }


    onSubmit(email, password, name, profileImage);

    
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Create Account</h2>
      <p className="text-gray-500 mb-6 text-center text-sm">Enter your details or use Google</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField type="text" placeholder="Name" id="signup-name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"/>
        <InputField type="email" placeholder="Email" id="signup-email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"/>
        <InputField type="password" placeholder="Password (min. 6 characters)" id="signup-password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password"/>
        <InputField
            type="url"
            placeholder="Profile Image URL (optional)"
            id="signup-profile-image"
            name="profileImage"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
        />
        {passwordError && <p className="text-red-500 text-xs text-center -mt-2 mb-2">{passwordError}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold text-sm tracking-wider disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'SIGN UP'}
        </button>
        <div className="my-4 flex items-center before:flex-1 before:border-t before:border-gray-300 before:mt-0.5 after:flex-1 after:border-t after:border-gray-300 after:mt-0.5">
          <p className="text-center font-normal text-gray-500 text-xs mx-4">OR</p>
        </div>
        <button
          type="button"
          onClick={onGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm text-gray-700 font-medium disabled:opacity-50"
        >
          <GoogleIcon />
          Sign up with Google
        </button>
      </form>
      <p className="mt-6 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setIsLoginView(true)}
          className="font-semibold text-red-500 hover:text-red-700 hover:underline"
        >
          Sign In
        </button>
      </p>
    </motion.div>
  );
}

const ForgotPasswordForm = ({ onSubmit, onBackToLogin, loading, resetEmailSentMessage }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            return;
        }
        onSubmit(email);
      };
     

    return (
        <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full"
        >
            <h2 className="text-3xl font-bold text-gray-800 mb-3 text-center">Reset Password</h2>
            <p className="text-gray-500 mb-6 text-center text-sm">
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField 
                    type="email" 
                    placeholder="Email" 
                    id="reset-email" 
                    name="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    autoComplete="email"
                />
                 {resetEmailSentMessage && <p className="text-green-600 text-xs text-center -mt-2 mb-2">{resetEmailSentMessage}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors duration-300 font-semibold text-sm tracking-wider disabled:opacity-50"
                >
                    {loading ? 'Sending Link...' : 'SEND RESET LINK'}
                </button>
            </form>
            <button
                type="button"
                onClick={onBackToLogin}
                className="mt-6 w-full text-sm text-center text-red-500 hover:text-red-700 hover:underline"
            >
                Back to Sign In
            </button>
        </motion.div>
    );
};


const AuthModal = ({ isOpen, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [resetEmailSentMessage, setResetEmailSentMessage] = useState('');

  const isMobile = useMediaQuery('(max-width: 767px)');

  const authContextValue = useContext(AuthContext);
  if (!authContextValue) {
      console.error("AuthContext not available. Ensure AuthModal is within AuthProvider.");
      // Render null or a fallback UI if context is not available
      return null; 
  }

  const { 
    user, 
    createUserAccount, 
    loginUser, 
    loginWithGoogle, 
    passwordReset, 
    loading, 
    authError,
    clearError // Get clearError from context
  } = authContextValue;

  // modal background image
  const backgroundImageUrl = 'https://i.ibb.co/NgYzxt69/user-box.jpg';

  const panelVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };
  const panelTransition = { duration: 0.5, ease: 'easeInOut' };

  const handleLoginSubmit = async (email, password) => {
    try {
      await loginUser(email, password);
      // Success will be handled by useEffect watching `user`
    } catch (error) {
      console.error('Login failed:', error.message);
      // Error is set in AuthProvider and displayed by LoginForm
    }
  };

  const handleSignUpSubmit = async (email, password, name, profileImage) => {

    const userInfo = {
      name,
      email,
      password,
      profileImage
    }

    try {
      await createUserAccount(email, password, name, profileImage);

      //sending userdata in server
      fetch('https://roshoi-bondhu-server.vercel.app/users',{
        method: 'POST',
        headers: {
          'content-type' : 'application/json'
        },
        body: JSON.stringify(userInfo)
      })
      .then(res => res.json())
      .then(data => console.log(data))

      // Success will be handled by useEffect watching `user`
    } catch (error) {
      console.error('Sign up failed:', error.message);
    }
  };
  
  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      // Success will be handled by useEffect watching `user`
    } catch (error) {
      console.error('Google sign-in failed:', error ? error.message : "Unknown error");
    }
  };

  const handleForgotPasswordSubmit = async (email) => {
    setResetEmailSentMessage('');
    try {
      await passwordReset(email);
      setResetEmailSentMessage('Password reset email sent! Check your inbox.');
      // clearError(); 
    } catch (error) {
      console.error('Password reset failed:', error.message);
      setResetEmailSentMessage(''); // Clear success message if error
      // authError is set by AuthProvider
    }
  };

  const showForgotPasswordView = () => {
    setIsLoginView(false); // Ensure main form area is ready for a new component
    setIsForgotPasswordView(true);
    setResetEmailSentMessage('');
    if(clearError) clearError(); // Clear previous errors when switching views
  };

  const showLoginView = () => {
    setIsForgotPasswordView(false);
    setIsLoginView(true);
    setResetEmailSentMessage('');
     if(clearError) clearError();
  };
  
  const showSignUpView = () => {
    setIsForgotPasswordView(false);
    setIsLoginView(false);
    setResetEmailSentMessage('');
    if(clearError) clearError();
  }


  useEffect(() => {
    if (user && isOpen) {
      onClose(); // Close modal on successful login/signup
    }
  }, [user, isOpen, onClose]);

  useEffect(() => {
    // Reset views when modal is opened/closed
    if (isOpen) {
      setIsLoginView(true);
      setIsForgotPasswordView(false);
      setResetEmailSentMessage('');
      if(clearError) clearError();
    }
  }, [isOpen, clearError]);

  const currentViewContent = () => {
    if (isForgotPasswordView) {
        return (
            <ForgotPasswordForm
                key="forgotPassword"
                onSubmit={handleForgotPasswordSubmit}
                onBackToLogin={showLoginView}
                loading={loading}
                authError={authError}
                resetEmailSentMessage={resetEmailSentMessage}
            />
        );
    }
    if (isLoginView) {
        return (
            <LoginForm
                key="login"
                onSubmit={handleLoginSubmit}
                onForgotPassword={showForgotPasswordView}
                setIsLoginView={showSignUpView} // Pass function to switch to sign up
                onGoogleSignIn={handleGoogleAuth}
                loading={loading}
                authError={authError}
            />
        );
    }
    return (
        <SignUpForm
            key="signup"
            onSubmit={handleSignUpSubmit}
            setIsLoginView={showLoginView} // Pass function to switch to sign in
            onGoogleSignUp={handleGoogleAuth}
            loading={loading}
            authError={authError}
        />
    );
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-[#000000d3] bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Clicking backdrop closes modal
        >
          <motion.div
            className="bg-transparent w-full max-w-4xl min-h-[660px] md:min-h-[620px] relative shadow-2xl rounded-2xl overflow-hidden flex"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white bg-black bg-opacity-20 hover:bg-opacity-40 rounded-full p-1.5 z-20 transition-colors"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <motion.div
              className="absolute top-0 h-full w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-14 z-10"
              animate={{ x: isMobile ? '0%' : ((isLoginView || isForgotPasswordView) ? '100%' : '0%') }}
              transition={{ duration: 0.6, ease: [0.30, 0.00, 0.20, 1.00] }}
            >
              <div className="w-full max-w-md py-6">
                <AnimatePresence mode="wait">
                  {currentViewContent()}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              className="hidden md:flex absolute top-0 h-full w-1/2 text-white flex-col justify-center items-center text-center p-10 md:p-16"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${backgroundImageUrl}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              initial={{ x: (isLoginView || isForgotPasswordView) ? '0%' : '100%' }}
              animate={{ x: (isLoginView || isForgotPasswordView) ? '0%' : '100%' }}
              transition={{ duration: 0.6, ease: [0.30, 0.00, 0.20, 1.00] }}
            >
              <AnimatePresence mode="wait">
                {(isLoginView || isForgotPasswordView) ? ( // Show "Sign Up" prompt for login and forgot password views
                  <motion.div
                    key="overlayLogin"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={panelTransition}
                    className="w-full max-w-xs"
                  >
                    <h2 className="text-3xl font-bold mb-3">Create Account</h2>
                    <p className="text-sm mb-8 leading-relaxed">
                      Enter your personal details and start your journey with us.
                    </p>
                    <button
                      onClick={showSignUpView}
                      className="border-2 border-white rounded-full px-10 py-2.5 font-semibold hover:bg-white hover:text-red-500 transition-colors duration-300 text-sm tracking-wider"
                    >
                      SIGN UP
                    </button>
                  </motion.div>
                ) : ( // Show "Sign In" prompt for signup view
                  <motion.div
                    key="overlaySignup"
                    variants={panelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={panelTransition}
                    className="w-full max-w-xs"
                  >
                    <h2 className="text-3xl font-bold mb-3">Have An Account</h2>
                    <p className="text-sm mb-8 leading-relaxed">
                      To keep connected with us please login with your personal info.
                    </p>
                    <button
                      onClick={showLoginView}
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