import axios from "axios";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AdminSignup = () => {
    
    const [password, setPassword] = useState('');
    const [searchParams] = useSearchParams();
    const verificationToken = searchParams.get('verificationToken');
    const email = searchParams.get('email');

    const navigate = useNavigate();


    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5555/admin/signup', 
                {
                    password: password
                },
                {
                    headers: {
                        Authorization: verificationToken,
                    },
                }
            );

            enqueueSnackbar(`Admin registration successful for ${email}`, { variant: 'success' });
            navigate('/admin/login');

        } catch (error: any) {
            enqueueSnackbar('Admin registration failed, please try again', { variant: 'error' });
        }
    }


    return (
        <div className="p-4">
            <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <label 
                    htmlFor='password'
                >
                        Enter password for admin mail {email}
                </label>
                <input
                    type='password'
                    id='password'
                    value={password}
                    onChange={ (e) => setPassword(e.target.value) }
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-hidden focus:border-gray-500"
                ></input>
                <button
                    type="submit"
                    className="rounded-full mt-2 text-white bg-purple-500 px-4 py-2 border border-gray-300"
                >
                    Submit
                </button>
            </div>
            </form>
        </div>
    );
}

export default AdminSignup;