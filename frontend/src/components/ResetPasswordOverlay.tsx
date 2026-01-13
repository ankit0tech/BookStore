import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';
import api from '../utils/api';

interface PasswordOverLayProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}


const ResetPasswordOverlay: React.FC<PasswordOverLayProps> = ({ isOpen, setIsOpen }) => {

    const [email, setEmail] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateform = ():boolean => {
        const newFromErrors: Record<string, string> = {};
        const trimmedEmail = email.trim();

        if(!trimmedEmail) {
            newFromErrors.email = 'Please enter email';
        } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newFromErrors.email = 'Please enter a valid email';
        }
        
        setFormErrors(newFromErrors);
        
        return Object.keys(newFromErrors).length === 0;
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(!validateform()) {
            return;
        }

        const data = { "email": email };

        try {
            const response = await api.post('/users/reset-password/confirm', data);
            
            if (response.status === 200) {
                enqueueSnackbar(`Sent password reset mail to ${email}`, {variant: 'success'});
                setIsOpen(false);
            }
        } catch(error) {
            if (axios.isAxiosError(error) && error.message) {
                if (error.response && error.response.status === 429) {
                    enqueueSnackbar(error.response.data, {variant: 'error'});
                } else {
                    enqueueSnackbar('Issue resetting password, please try again', {variant: 'error'});
                }
            } else {
                enqueueSnackbar('Unexpected error occurred, please try again', {variant: 'error'});
            }
        }
    }

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    }


    return (
        <div 
            className={`fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-xs z-50 _text-black font-normal transition-opacity duration-200 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={(e) => handleOverlayClick(e)}
        >
            <div className={`bg-white p-6 rounded-lg border border-gray-500 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100 transition-y-0' : 'opacity-0 scale-95 transition-y-1'}`}>
                <form
                    className="flex flex-col gap-4 min-w-[300px] mx-auto"
                    onSubmit={(e) => handleFormSubmit(e)}
                >
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='text-gray-800'
                            htmlFor='email'
                        >
                            Enter email to reset password
                        </label> 
                        <input 
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                            type='email' 
                            placeholder='Enter email address...'
                            id='email' 
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            >
                        </input>
                        { formErrors.email && <span className='text-xs text-red-600'>{formErrors.email}</span> }
                    </div>
                    <button 
                        className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        type='submit'
                    >
                        Reset password
                    </button>
                </form>
            </div>
        </div> 
    );
}

export default ResetPasswordOverlay;