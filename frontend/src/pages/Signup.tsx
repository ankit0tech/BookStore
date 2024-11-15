import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { RootState } from "../types/index";


const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    const handleSignup = async () => {
        const data = {
            "email": email,
            "password": password,
            "role": role,
        }
        const response = await axios.post('http://localhost:5555/users/signup', data);
        console.log(response.data);
        navigate('/login');
    }

    return (
        <div className="p-4">
            <div className="text-3xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">BookStore</div>
            <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">Sign Up</div>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <label className="">Email</label>
                <input
                    // className="rounded-xl px-2 py-1 "
                    // className="appearance-none rounded-l-xl rounded-r-xl px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"

                    type="text"
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
                <label>role</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                />
            </div>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 " onClick={handleSignup}> 
                Sign up 
                </button>
            </div>

        </div>
    );


}

export default Signup;