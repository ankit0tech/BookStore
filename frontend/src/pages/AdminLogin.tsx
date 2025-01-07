import { jwtDecode } from "jwt-decode";
import SignInForm from "../components/SignInForm"
import axios from "axios";
import { loginSuccess, setUserRole } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface JwtPayload {
    email: string,
    userId: string,
    role: string,
}


const AdminLogin = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSignin = async (e: React.FormEvent, email: string, password: string) => {
        e.preventDefault();

        const data = {
            "email": email,
            "password": password
        }

        const response = await axios.post('http://localhost:5555/admin/signin', data)
        const token = response.data.token;
        const user = jwtDecode(token) as JwtPayload;
        
        dispatch(setUserRole({'userRole': user.role}));
        dispatch(loginSuccess({'token': token, 'email': user.email }));

        navigate('/');
    }


    return (
        <div className="p-4">
            <SignInForm handleSignin={handleSignin} />
        </div>
    );
}

export default AdminLogin;