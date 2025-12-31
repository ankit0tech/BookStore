import { jwtDecode } from "jwt-decode";
import SignInForm from "../components/SignInForm"
import axios from "axios";
import { loginSuccess, setUserRole } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import api from "../utils/api";

interface JwtPayload {
    email: string,
    userId: string,
    role: string,
}


const AdminLogin = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSignin = async (e: React.FormEvent, email: string, password: string) => {

        try {

            e.preventDefault();
    
            const data = {
                "email": email,
                "password": password
            }
            
            const response = await api.post('/admin/signin', data)
            const token = response.data.token;
            const user = jwtDecode(token.split(' ')[1]) as JwtPayload;
            
            dispatch(setUserRole({'userRole': user.role}));
            dispatch(loginSuccess({'token': token, 'email': user.email }));
    
            navigate('/');

        } catch(error: any) {
            enqueueSnackbar('Error while login', {variant: 'error'});
        }
    }


    return (
        <div className="p-4">
            <SignInForm handleSignin={handleSignin} />
        </div>
    );
}

export default AdminLogin;