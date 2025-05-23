import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router';
import { AuthContext } from '../authProvider/AuthProvider';

const PrivateRoute = ({children}) => {
  const authData = useContext(AuthContext)
  const location = useLocation()

    if(!authData){
        return <Navigate to={'/'}></Navigate>
    }

    const {user, loading, openAuthModal, setRedirectPath} = authData;

    if(loading){
        return <div>loading</div>
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