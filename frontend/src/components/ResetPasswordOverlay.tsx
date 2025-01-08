import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import React, { useState } from 'react';

interface PasswordOverLayProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}


const ResetPasswordOverlay: React.FC<PasswordOverLayProps> = ({ isOpen, setIsOpen }) => {

    const [email, setEmail] = useState('');

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = { 
            "email": email 
        };

        try {
            const response = await axios.post('http://localhost:5555/users/reset-password/confirm', data);
            
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
    <>
        {isOpen ? 
        <div 
            className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 text-black font-normal'
            onClick={(e) => handleOverlayClick(e)}
        >
            <div className="bg-white p-6 rounded-[18px] border border-b-2 border-black">
                <form
                className="flex flex-col min-w-[300px] mx-auto"
                onSubmit={(e) => handleFormSubmit(e)}>
                    <label htmlFor='email'>Enter email to reset password</label> 
                    <input 
                        className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500" 
                        type='email' 
                        id='email' 
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    >
                    </input>
                    <button 
                        className="rounded-full text-white bg-purple-500 my-3 px-4 py-2 border border-purple-500 "
                        type='submit'
                    >
                        Reset password
                    </button>
                </form>
            </div>
        </div> 
        : null}
    </>);
}

export default ResetPasswordOverlay;