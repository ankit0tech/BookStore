import React from "react";
import { useDispatch } from "react-redux";
import { logoutSuccess } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const Signout = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSignout = async () => {
        dispatch(logoutSuccess());
        navigate('/login');
    }

    return (
        <div>
            <button className="" onClick={handleSignout}>
                Signout
            </ button>
        </div>
    );
};

export default Signout;