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
        
        if(!password1.trim() || !password2.trim()) {
            enqueueSnackbar("Please enter password", {variant: 'error'});
        } else if (password1 != password2) {
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
        <div 
            className="flex flex-col items-center gap-4 py-6 w-full"
        >

            <div className="text-2xl font-serif my-2">Enter Password</div>

            <form 
                className="flex flex-col max-w-sm min-w-[280px] sm:min-w-[320px] gap-4 _w-full"
                onSubmit={handleSubmit} 
            >
                <div className="flex flex-col w-full">
                    <label 
                        htmlFor='password1'
                        className="text-gray-800"
                    > Enter new password </label>
                    <input 
                        // className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-hidden focus:border-gray-500" 
                        className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                        type="password" 
                        id="password1" 
                        placeholder="Enter password..."
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)} >
                    </input>
                </div>

                <div className="flex flex-col w-full">
                    <label 
                        htmlFor='password2'
                        className="text-gray-800"
                    > Re-enter new password </label>
                    <input
                        className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                        type="password" 
                        id="password2" 
                        placeholder="Enter password again..."
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)} >
                    </input>

                    {showWarning &&
                        <span className="text-red-600 text-xs">Password don't match</span>
                    }
                </div>

                <button 
                    className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                    type="submit"
                >
                    Save
                </button>
            </form>
        </div>
    );
}

export default ResetPassword;