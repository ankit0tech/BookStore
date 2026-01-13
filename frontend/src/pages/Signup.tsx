import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
// import { RootState } from "../types/index";


const Signup = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();

    const validateForm = (): boolean => {
        const newFromErrors: Record<string, string> = {};
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if(!trimmedEmail) {
            newFromErrors.email = 'Please enter email';
        } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            newFromErrors.email = 'Please enter a valid email';
        }

        if(!trimmedPassword) {
            newFromErrors.password = 'Please enter password';
        } else if(trimmedPassword.length < 6) {
            newFromErrors.password = 'Password must be atleast 6 characters';
        }
        
        setFormErrors(newFromErrors);
        
        return Object.keys(newFromErrors).length === 0;
    }

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!validateForm()) {
            return
        }

        try {
            const data = {
                "email": email,
                "password": password,
            }

            await api.post('/users/signup', data);

            enqueueSnackbar("Signup successful", {variant: "success"});
            navigate('/login');
    
        } catch(error: any) {
            if (error.response) {
                console.error('Error Response: ', error.response.data);
                enqueueSnackbar(error.response.data.message || 'Error occurred while singin up', { variant: 'error' });
            } else {
                console.error('Error: ', error.message);
                enqueueSnackbar("An unexpected error occurred", { variant: 'error' });
            }
        }
    }

    return (
        <div className="p-4 flex flex-col items-center gap-2">
            
            <div className="p-4 flex flex-col items-center gap-4 max-w-sm min-w-[320px] divide-y">
                <div className="flex flex-col gap-2 w-full py-6">
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-serif my-2">BookStore</div>
                        <div className="text-2xl font-serif my-2">Sign Up</div>
                    </div>

                    <form 
                        className="flex flex-col gap-4 items-center w-full"
                        onSubmit={handleSignup}
                    >
                        <div className="flex flex-col w-full">
                            <label 
                                className="text-gray-800"
                                htmlFor="input-email"
                            >
                                Email
                            </label>
                            <input
                                className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                                type="text"
                                placeholder="Enter email address..."
                                id="input-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {formErrors.email && <span className="text-xs text-red-600">{formErrors.email}</span>}
                        </div>
                        <div className="flex flex-col w-full">
                            <label
                                className="text-gray-800"
                                htmlFor="password"                    
                            >Password</label>
                            <input
                                className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                                type="password"
                                placeholder="Enter password..."
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {formErrors.password && <span className="text-xs text-red-600">{formErrors.password}</span>}
                        </div>
                        <div className="flex flex-col w-full">
                            <button 

                                className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                type="submit"    
                            > 
                            Sign up 
                            </button>
                        </div>
                    </form>
                </div>
                <div className="flex flex-col items-center w-full gap-2">
                    {/* <hr className="w-full h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" /> */}
                    <div 
                        className="flex gap-1 text-md text-gray-800 hover:text-gray-950"
                    >
                        <span>Already have an account?</span>
                        <span
                            className="hover:underline text-amber-600 hover:text-amber-700 _text-sky-500 _hover:text-sky-600 cursor-pointer transition-colors duration-200"
                            onClick={() => navigate('/login')}
                        >
                            Sign in
                        </span>
                    </div>
               </div>

            </div>
        </div>
    );


}

export default Signup;