// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";


// const OAuthCallback = () => {
//     const navigate = useNavigate();

//     useEffect(() => {
//         const urlParams = new URLSearchParams(window.location.search);
//         // const token = urlParams.get('token');
//         // if (token) {
//         //     console.log('OAuthCallback component...');
//         //     console.log('OAuth token:', token);
//         //     navigate('/');
//         // } else {
//         //     console.log('Failed to authenticate');
//         // }

//         const code = urlParams.get('code');
//         if(code) {
//             fetch(`http://localhost:5555/auth/oauth2/redirect/google?code=${code}`)
//             .then(response => response.json())
//             .then (data => {
//                 if(data.token){
//                     localStorage.setItem('authToken', data.token);
//                     navigate('/');
//                 }
//             })
//             .catch(error => {
//                 console.error('Authentication error:', error);
//                 navigate('/login');
//             });
//         } else {
//             console.log('No authentication code received');
//             navigate('/login');
//         }
//     }, [navigate]);

//     return <div>Loading...</div>;
// };

// export default OAuthCallback;