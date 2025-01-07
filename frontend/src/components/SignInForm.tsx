import React, { useState } from "react";


const SignInForm = ({ handleSignin }: { handleSignin: (e: React.FormEvent, email: string, password: string) => Promise<void> }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        handleSignin(e, email, password);
    }


    return (
    <div>
        <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">Sign in</div>
        <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <label className="">Email</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
        
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <label>Password</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button 
                    className="rounded-full mt-2 text-white bg-purple-500 px-4 py-2 border border-gray-300 " 
                    type='submit'
                > 
                        Sign in 
                </button>
            </div>
        </form>
    </div>
    );
        

}


export default SignInForm;

