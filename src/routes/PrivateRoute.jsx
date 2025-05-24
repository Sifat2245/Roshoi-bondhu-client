import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AuthContext } from '../authProvider/AuthProvider';
import spinner from '../../public/spinner.json'
import Lottie from 'lottie-react';

const PrivateRoute = ({children}) => {
  const authData = useContext(AuthContext)
  const location = useLocation()

    if(!authData){
        return <Navigate to={'/'}></Navigate>
    }

    const {user, loading, openAuthModal, setRedirectPath} = authData;

    if(loading){
         return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="w-52">
                    <Lottie animationData={spinner} loop={true} />
                </div>
            </div>
        );
    }
    if(user){
        return children;
    }
    else{
        setRedirectPath(location.pathname)
        openAuthModal()
        return <Navigate to={'/'}></Navigate>
    }
   
};

export default PrivateRoute;