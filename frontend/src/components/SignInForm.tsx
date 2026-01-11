import React, { useState } from "react";


const SignInForm = ({ handleSignin }: { handleSignin: (e: React.FormEvent, email: string, password: string) => Promise<void> }) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleFormSubmit = (e: React.FormEvent) => {
        handleSignin(e, email, password);
    }


    return (
    <div
        className="flex flex-col items-center gap-2 w-full _min-w-1/4 _max-w-[300px]"
    >
        <div className="text-2xl font-serif my-2">Sign in</div>
        <form 
            className="flex _flex-shrink-0 flex-col gap-4 items-center w-full"
            onSubmit={handleFormSubmit}
        >
            <div className="flex _flex-grow flex-col w-full">
                <label 
                    className="text-gray-800"
                    htmlFor="input-email"
                >
                    Email
                </label>
                <input
                    className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter email address..."
                    id="input-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="flex flex-col mx-auto w-full">
                <label 
                    className="text-gray-800"
                    htmlFor="input-password"
                >
                    Password
                </label>
                <input
                    className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-color duration-200"
                    type="password"
                    id="input-password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button 
                className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                type='submit'
                > 
                    Sign in 
            </button>
        </form>
    </div>
    );
}


export default SignInForm;

