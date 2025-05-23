import React, { use } from 'react';
import { AuthContext } from '../authProvider/AuthProvider';
import { Outlet, useNavigate } from 'react-router';
import AuthModal from './AuthModal';


const RootWithModal = () => {
    const authData = use(AuthContext)
    const navigate = useNavigate()

    if(!authData){
        console.error('AuthContext is not available within RootWithModal.')
        return <p>There was a problem: AuthContext not found.</p>
    }

    const {isAuthModalOpen, closeAuthModal, user, redirectPath, setRedirectPath} = authData

    const handleIsModalClose = () =>{
        closeAuthModal();

        if(user && redirectPath) {
            navigate(redirectPath)
            setRedirectPath(null)
        }
        else if(!user && redirectPath){
            setRedirectPath(null)
            navigate('/')
        }
    }


    return (
       <>
       <AuthModal isOpen={isAuthModalOpen} onClose={handleIsModalClose}></AuthModal>
       <div>
        <Outlet></Outlet>
       </div>
       
       </>
    );
};

export default RootWithModal;