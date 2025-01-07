import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setUserRole, loginSuccess, logoutSuccess } from "../redux/userSlice";
import { useGoogleLogin } from "@react-oauth/google";
import ResetPasswordOverlay from "../components/ResetPasswordOverlay";

interface JwtPayload {
    email: string,
    userId: string,
    role: string,
}

const Login = () => {

    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const login = useGoogleLogin({
        onSuccess: async (loginCredentials) => {
            try {
                const response = await axios.post('http://localhost:5555/auth/login/federated/google', {
                    token: loginCredentials.access_token
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const jwtToken = response.data.token;
                if(jwtToken) {
                    const tokenData = jwtDecode<JwtPayload>(jwtToken);
                    
                    dispatch(setUserRole({'userRole': tokenData.role}));
                    dispatch(loginSuccess({
                        'token': jwtToken, 
                        'email': tokenData.email
                    }));
                    navigate('/');
    
                }                
            } catch (error) {
                console.error("Login failed: ", error);
            }
        },
        onError: (error) => {
            console.log("Error:", error);
        },
        scope: 'openid email',
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [userRole, setUserRole] = useState('');


    const handleSignin = async () => {
        const data = {
            "email": email,
            "password": password
        }

        const response = await axios.post('http://localhost:5555/users/signin', data)
        const token = response.data.token;
        const user = jwtDecode(token) as JwtPayload;
        
        dispatch(setUserRole({'userRole': user.role}));
        dispatch(loginSuccess({'token': token, 'email': user.email }));

        navigate('/');
    }

    const navigateToSignup = () => {
        navigate('/signup');
    }

    const handleForgotPasswordClick = () => {
        setIsOpen(!isOpen);
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
                <button className="rounded-full mt-2 text-white bg-purple-500 px-4 py-2 border border-gray-300 " onClick={handleSignin}> 
                   Sign in 
                </button>
            </div>
            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button className="text-left" onClick={handleForgotPasswordClick}>
                    forgot password
                </button>
            </div>
            <ResetPasswordOverlay isOpen={isOpen} setIsOpen={setIsOpen}></ResetPasswordOverlay>

            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button className="rounded-full text-white bg-blue-500 my-3 px-4 py-2 border border-blue-500 " onClick={() => login()}>
                    Sing in with google
                </button>
            </div>

            <div className="relative flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto">
                <hr className="w-full h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                <div className="">New to the BookStore?</div>
            </div>

            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 " onClick={navigateToSignup}> 
                   Sign up 
                </button>
            </div>
        </div>
    );
}

export default Login;