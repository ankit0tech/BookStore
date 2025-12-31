import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";


const ResetPassword = () => {
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [showWarning, setShowWarning] = useState(false);
    const navigate = useNavigate();
    const [ searchParams ] = useSearchParams();


    useEffect(() => {
        if (password1 != password2) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }
    }, [password1, password2]);

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = searchParams.get('verificationToken');
        
        if (password1 != password2) {
            enqueueSnackbar("Passwords don't match", {variant: 'error'});
        } else {
            const response = await api.post('/users/reset-password/verify', {
                verificationToken: token,
                password: password1
            });

            if (response.status === 200) {
                enqueueSnackbar("Password reset done", {variant: 'success'});
                navigate('/login');
            } else if(response.status === 429) {
                enqueueSnackbar(response.data.message, {variant: 'error'});
            } else {
                enqueueSnackbar("Issue while resetting password", {variant: 'error'});
            }
        }
    }
    
    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                
                <label 
                    htmlFor='password1'
                    className=""
                >Enter new password</label>
                <input 
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-hidden focus:border-gray-500" 
                    type="password" 
                    id="password1" 
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)} >
                </input>
            
                <label 
                    htmlFor='password2'
                    className=""
                >Re-enter new password</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-hidden focus:border-gray-500" 
                    type="password" 
                    id="password2" 
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)} >
                </input>

                {showWarning ?
                    <p className="text-red-500">Password don't match</p> : 
                    ''
                }

                <button 
                    className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300" 
                    type="submit">
                        Save
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;