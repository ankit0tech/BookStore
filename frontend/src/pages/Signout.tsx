import { useDispatch } from "react-redux";
import { logoutSuccess } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { enqueueSnackbar } from "notistack";

const Signout = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSignout = async () => {

        try {

            dispatch(logoutSuccess());
            googleLogout();
            navigate('/login');
        
        } catch(error: any) {
            enqueueSnackbar("Error while loggin out", {variant: 'error'});
        }
    }

    return (
        <button className="" onClick={handleSignout}>
            Signout
        </ button>
    );
};

export default Signout;