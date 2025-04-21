import { useEffect, useState } from "react";
import api from "../utils/api"
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types/index";
import { logoutSuccess, setUserRole } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const isTokenValid = (token: string): boolean => {
    try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        return decodedToken.exp > currentTime;

    } catch {
        return false;
    }
};

const useAuth = () => {

    const [hasFailed, setHasFailed] = useState(false);
    const dispatch = useDispatch();
    const userData = useSelector((state: RootState) => state.userinfo);
    const authToken = userData.token || localStorage.getItem('authToken');
    const token = authToken?.split(' ')[1] || '';
    const navigate = useNavigate();


    useEffect(() => {

        if(!authToken || !isTokenValid(token)) {
            return;
        }
        
        const fetchRole = () => {
            
            api.get('http://localhost:5555/users/dashboard')
            .then((response) => {
                dispatch(setUserRole({'userRole': response.data.user.role}));
                setHasFailed(false);
            })
            .catch((error) => {

                console.error('Error fetching user dashboard', error);
                setHasFailed(true);
                if(error.response?.status == 401) {
                    dispatch(logoutSuccess());
                    navigate('/login');
                }
            });
        }

        if(!hasFailed) {
            fetchRole();
        }

    }, [authToken, dispatch, navigate]);
    
}

export default useAuth;