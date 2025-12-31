import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
// import { RootState } from "../types/index";


const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

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
        <div className="p-4">
            <div className="text-3xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">BookStore</div>
            <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">Sign Up</div>
            
            <form onSubmit={handleSignup}>
                <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                    <label className="">Email</label>
                    <input
                        className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-hidden focus:border-gray-500"

                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                    <label>Password</label>
                    <input
                        className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-hidden focus:border-gray-500"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                    <button 
                        className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 " 
                        type="submit"    
                    > 
                    Sign up 
                    </button>
                </div>
            </form>
        </div>
    );


}

export default Signup;