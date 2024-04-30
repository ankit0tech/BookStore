import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { logoutSuccess } from "./userSlice";


// interface JwtPayload {
//     email: string,
//     userid: string,
//     role: string,
//     exp: number,
//     iat: number
// }

// export const checkTokenExpiry = createAsyncThunk(
//     'userinfo/checkTokenExpiry',
//     async (_, { getState, dispatch }) => {
//         const { token } = getState().userinfo;

//         if(token) {
//             // const decodedToken = jwtDecode(token) as JwtPayload;
//             const decodedToken = jwtDecode(token);
//             const currentTime = Date.now()/1000;  //convert to seconds

//             if( decodedToken.exp < currentTime) {
//                 dispatch(logoutSuccess());
//                 // redirect user to login page
//                 console.log('Token expired. Please login again.');
//             }

//         }
//     }
// )