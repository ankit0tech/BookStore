import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types/index";
import Signout from "../pages/Signout";
import CartOverlay from "./CartOverlay";
import { CartInterface } from "../types";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "../utils/cartUtils";
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";


const NavBar = () => {

    const [cartItems, setCartItems] = useState<CartInterface|null>(null);
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const navigate = useNavigate();


    // const userData = useSelector((state: RootState) => state.userinfo);
    const [isOpen, setIsOpen] = useState(false);
    const email: string | null = userinfo.email;

    const dispatch = useDispatch();


    useEffect(() => {
        const authToken = userinfo.token;
        const fetchCartItems = async () => {

            if (!authToken) {
                navigate('/login');
            }
            else {
                // console.log(authToken);
                const items = await getCartItems(authToken);
                // console.log("Items: ", items);
                setCartItems(items);
                dispatch(setCartItemsSlice(items.data));
                // console.log('now will set loading = false');
                // console.log("state: ", cartItems);
            }
            // navigate('/cart');
        }

        fetchCartItems();

    }, [userinfo.token])


    
    const onClose = () => {
        setIsOpen(false);
    }

    return (
        // <div className="flex justify-center items-center gap-x-4">
        <div className="flex justify-between px-4 bg-purple-500 h-10 text-white font-bold items-center">
            <div className="flex">NavBar</div>
            { email ? 
                (<div className="flex">
                    <button onClick={() => {setIsOpen(!isOpen)}}> Cart </button>
                    <CartOverlay isOpen={isOpen} onClose={onClose}></CartOverlay>
                    <div className="px-4">{ email }</div>
                    <div className=""><Signout/></div>
                </div>)
                :
                (<Link to='/login'>
                    Login
                </Link>)
            }

        </div>
    );
}

export { NavBar };