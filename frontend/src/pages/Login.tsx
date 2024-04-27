import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    email: string,
    userid: string,
    role: string,
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();


    const handleSignin = async () => {
        const data = {
            "email": email,
            "password": password
        }

        const response = await axios.post('http://localhost:5555/users/signin', data)
        const token = response.data.token;
        const user = jwtDecode(token) as JwtPayload;
        setUserRole(user.role);
        localStorage.setItem('authToken', token);
        // const decodedToken = JSON.parse(atob(token.split('.')[1]));
        // const expiryTimeInSec = decodedToken.exp;
        // const currentTime = Math.floor(Date.now() / 1000);
        navigate('/');
    }

    return (
        <div className="p-4">
            <div className="text-3xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">BookStore</div>
            <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">Sign in</div>
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
                <button className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 " onClick={handleSignin}> 
                   Sign in 
                </button>
            </div>
            <div className="relative flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto">

                <hr className="w-full h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                <div className="">New to the BookStore?</div>
        
            </div>

            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 "> 
                   Sign up 
                </button>
            </div>
        </div>
    );
}

export default Login;