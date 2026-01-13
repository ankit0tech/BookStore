import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setUserRole, loginSuccess, logoutSuccess } from "../redux/userSlice";
import { useGoogleLogin } from "@react-oauth/google";
import ResetPasswordOverlay from "../components/ResetPasswordOverlay";
import SignInForm from "../components/SignInForm";
import { enqueueSnackbar } from "notistack";
import api from "../utils/api";

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
                const response = await api.post('/auth/login/federated/google', {
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
                enqueueSnackbar("login with google failed", { variant: 'error'});
            }
        },
        onError: (error) => {
            console.log("Error:", error);
        },
        scope: 'openid email',
    });

    const handleSignin = async (e: React.FormEvent, email: string, password: string) => {
        e.preventDefault();

        const data = {
            "email": email,
            "password": password
        }

        try {
            const response = await api.post('/users/signin', data)
            const token = response.data.token;
            const user = jwtDecode(token.split(' ')[1]) as JwtPayload;
            
            dispatch(setUserRole({'userRole': user.role}));
            dispatch(loginSuccess({'token': token, 'email': user.email }));
    
            navigate('/');
    
        } catch(error) {
            enqueueSnackbar("Error occurred while singing in", {variant: 'error'});
        }
    }

    const navigateToSignup = () => {
        navigate('/signup');
    }

    const handleForgotPasswordClick = () => {
        setIsOpen(!isOpen);
    }

    return (
        <div className="flex flex-col items-center p-4 ">
            <div className="flex flex-col items-center max-w-sm min-w-[320px] divide-y gap-4">
                <div className="flex flex-col gap-4 items-center w-full py-6">
                    <div className="text-3xl font-serif">BookStore</div>

                    <div className="flex flex-col gap-1 w-full">
                        <SignInForm handleSignin={handleSignin} />
                        <div className="flex w-full">
                            <button 
                                className="_text-md text-amber-600 hover:text-amber-700 _text-sky-500 _hover:text-sky-600 hover:underline transition-color duration-200" 
                                onClick={handleForgotPasswordClick}
                            >
                                forgot password?
                            </button>
                            <ResetPasswordOverlay isOpen={isOpen} setIsOpen={setIsOpen}></ResetPasswordOverlay>
                        </div>
                    </div>

                    <button 
                        className="w-full py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        onClick={() => login()}
                    >
                        Sing in with google
                    </button>
                </div>

                <div className="flex flex-col items-center w-full gap-2">
                    {/* <hr className="w-full h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" /> */}
                    <div 
                        className="flex gap-1 text-md text-gray-800 hover:text-gray-950"
                    >
                        <span>New to the BookStore?</span>
                        <span
                            className="hover:underline text-amber-600 hover:text-amber-700 _text-sky-500 _hover:text-sky-600 cursor-pointer transition-colors duration-200"
                            onClick={navigateToSignup}
                        >
                            Sign up
                        </span>
                    </div>
               </div>
            </div>
        </div>
    );
}

export default Login;