import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import { useDispatch } from 'react-redux';
import { setIsAdmin, loginSuccess, logoutSuccess } from "../redux/userSlice";
<<<<<<< HEAD
import { useGoogleLogin } from "react-google-login";
=======
import { useGoogleLogin } from "@react-oauth/google";
import ResetPasswordOverlay from "../components/ResetPasswordOverlay";
>>>>>>> main

interface JwtPayload {
    email: string,
    userId: string,
    role: string,
}

<<<<<<< HEAD
const GoogleLogin = () => {
    const { signIn } = useGoogleLogin({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
        onSuccess: (response) => {
            console.log('Login successful:', response);
            if ('tokenId' in response) {
                const tokenId = response.tokenId;
                fetch('http://localhost:5555/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tokenId: tokenId }),
                })
                .then((res) => res.json())
                .then((data) => console.log(data))
                .then((error) => console.log(error));
            } else {
                console.error('Offline response received, no tokenId available.');
            }
        },
        onFailure: (error) => {
            if(error.error = 'popup_closed_by_user') {
                console.warn('User closed the popup before completing the login');
                alert('Login was not completed. Please try again');
            } else {
                console.error('An error occurred', error);
            }
        },
    });

    return <button onClick={signIn}>Login with Google</button>
=======
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
                    
                    if (tokenData.role == 'ADMIN') {
                        dispatch(setIsAdmin({'isAdmin': true}));
                    } else {
                        dispatch(setIsAdmin({'isAdmin': false}));
                    }
    
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
        if (user.role == 'ADMIN') {
            dispatch(setIsAdmin({'isAdmin': true,}));
        }
        else {
            dispatch(setIsAdmin({'isAdmin': false,}));
        }

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
>>>>>>> main
}



// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     // const [userRole, setUserRole] = useState('');
//     const navigate = useNavigate();
//     const dispatch = useDispatch();


//     const handleSignin = async () => {
//         const data = {
//             "email": email,
//             "password": password
//         }

//         const response = await axios.post('http://localhost:5555/users/signin', data)
//         const token = response.data.token;
//         const user = jwtDecode(token) as JwtPayload;
//         if (user.role == 'ADMIN') {
//             dispatch(setIsAdmin({'isAdmin': true,}));
//         }
//         else {
//             dispatch(setIsAdmin({'isAdmin': false,}));
//         }

//         dispatch(loginSuccess({'token': token, 'email': user.email }));
//         // localStorage.setItem('authToken', token);
//         // const decodedToken = JSON.parse(atob(token.split('.')[1]));
//         // const expiryTimeInSec = decodedToken.exp;
//         // const currentTime = Math.floor(Date.now() / 1000);
//         navigate('/');
//     }

//     const navigateToSignup = () => {
//         navigate('/signup');
//     }

//     return (
//         <div className="p-4">
//             <div className="text-3xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">BookStore</div>
//             <div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">Sign in</div>
//             <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
//                 <label className="">Email</label>
//                 <input
//                     // className="rounded-xl px-2 py-1 "
//                     // className="appearance-none rounded-l-xl rounded-r-xl px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-400"
//                     className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"

//                     type="text"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                 />
//             </div>
//             <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
//                 <label>Password</label>
//                 <input
//                     className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                 />
//             </div>
//             <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
//                 <button className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 " onClick={handleSignin}> 
//                    Sign in 
//                 </button>
//             </div>
//             <div className="relative flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto">

//                 <hr className="w-full h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
//                 <div className="">New to the BookStore?</div>
        
//             </div>

//             <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
//                 <button className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 " onClick={navigateToSignup}> 
//                    Sign up 
//                 </button>
//             </div>
//         </div>
//     );
// }

export default GoogleLogin;