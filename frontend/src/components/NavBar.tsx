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
import axios from "axios";
import { ChildProps } from '../App';


const NavBar = ({ books, setBooks}: ChildProps) => {

    const [cartItems, setCartItems] = useState<CartInterface|null>(null);
    const [query, setQuery] = useState<string>('');
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const navigate = useNavigate();

    const handleSearch = async () => {
        const result = await axios.get(`http://localhost:5555/books/search?query=${query}`);
        console.log('Search result: ', result);
        setBooks(result.data);
    }

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
                dispatch(setCartItemsSlice(items));
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
        <div className="flex justify-between px-4 bg-purple-500 h-11 text-white font-bold items-center">
            <button className="flex" onClick={() =>navigate('/')}>Home</button>
            <div className="flex">
                <div className="px-4 text-black font-normal">                    
                    <input 
                        className="transition-all duration-300 ease-in-out w-48 focus:w-64 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-gray-300" 
                        type="sarch" 
                        name="q" 
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key == 'Enter') handleSearch();
                        }}
                        placeholder="Search here..."
                    >
                    </input>
                </div>
                { email ? 
                    (
                        <>
                            <button onClick={() => {setIsOpen(!isOpen)}}> Cart </button>
                            <CartOverlay isOpen={isOpen} onClose={onClose}></CartOverlay>
                            <div className="px-4">{ email }</div>
                            <div className=""><Signout/></div>
                        </>
                    )
                    :
                    (<Link to='/login'>
                        Login
                    </Link>)
                }
            </div>

        </div>
    );
}

export { NavBar };