import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RecentlyViewed as RecentlyViewedInterface, RootState } from "../types/index";
import Signout from "../pages/Signout";
import CartOverlay from "./CartOverlay";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "../utils/cartUtils";
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
import axios from "axios";
import { ChildProps } from '../App';
import { enqueueSnackbar } from "notistack";
import api from "../utils/api";
import { AiOutlineClose } from "react-icons/ai";


const NavBar = ({ books, setBooks, nextCursor, setNextCursor}: ChildProps) => {

    const [query, setQuery] = useState<string>('');
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const navigate = useNavigate();
    const searchBarRef = useRef(null);
    // const userData = useSelector((state: RootState) => state.userinfo);
    const [isOpen, setIsOpen] = useState(false);
    const email: string | null = userinfo.email;
    const dispatch = useDispatch();
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedInterface[]>([]);
    const [showRecentlyViewedPalet, setShowRecentlyViewedPalet] = useState(false);

    const handleSearchBarClick = () => {
        api.get('http://localhost:5555/recently-viewed')
            .then((response) => {
                setShowRecentlyViewedPalet(true);
                setRecentlyViewed(response.data);
                console.log(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleOnBlur = () => {
        // setTimeout(() => setShowRecentlyViewedPalet(false), 150);
        setShowRecentlyViewedPalet(false);
    }

    const heandleRemoveRecentlyViewed = async (id: number) => {
        
        console.log('remove: ', id);

        const originalRecentlyViewed = [...recentlyViewed];
        setRecentlyViewed((prev) => prev.filter((item) => item.book.id != id));

        await api.delete(`http://localhost:5555/recently-viewed/remove/${id}`)
        .then((response) =>{
        })
        .catch((error) => {
            console.log(error);
            setRecentlyViewed(originalRecentlyViewed);
        });

    }


    const handleSearch = () => {
        if (query) {
            axios.get(`http://localhost:5555/books/search?query=${query}`)
            .then((response) => {
                console.log('Search result: ', response);
                setBooks(response.data);
                setNextCursor(null);
            }
            ).catch((error)=>{
                enqueueSnackbar("Error while loading books", {variant: 'error'});
            });
        } else {
            axios
            .get('http://localhost:5555/books')
            .then((response) => {
                setBooks(response.data.data);
                setNextCursor(response.data.nextCursor);
            }).catch((error)=>{
                enqueueSnackbar("Error while loading books", {variant: 'error'});
            });
        }
    }

    useEffect(() => {
        const authToken = userinfo.token;
        const fetchCartItems = async () => {

            if (authToken) {
                const items = await getCartItems(authToken);
                dispatch(setCartItemsSlice(items));
            }
        }

        fetchCartItems();

    }, [userinfo.token])


    
    const onClose = () => {
        setIsOpen(false);
    }

    return (
        // <div className="flex justify-center items-center gap-x-4">
        <div className="flex justify-between px-4 bg-purple-500 h-12 text-white font-bold items-center">
            <button className="flex" onClick={() =>navigate('/')}>Home</button>
            <div className="flex">
                <div className="relative flex flex-col px-4 text-black font-normal">                    
                    <input 
                        className="transition-all duration-300 ease-in-out h-7 w-48 px-2 focus:w-64 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 border border-gray-300" 
                        type="search" 
                        name="q" 
                        ref={searchBarRef}
                        onClick={handleSearchBarClick}
                        onBlur={handleOnBlur}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if(e.key === 'Enter') handleSearch();
                        }}
                        placeholder="Search here..."
                    >
                    </input>
                        { showRecentlyViewedPalet && 
                            <ul 
                                className="flex flex-col z-50 absolute top-full mt-2 left-0 w-full bg-white text-black shadow-lg rounded-md p-2"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {recentlyViewed.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex flex-row p-2"
                                    >
                                        <Link to={`/books/details/${item.book.id}`}> 
                                            <div>{item.book.title}</div> 
                                        </Link>
                                        <AiOutlineClose 
                                            className="m-1 cursor-pointer border rounded"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                heandleRemoveRecentlyViewed(item.book.id)
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul> 
                        }
                </div>
                { email ? 
                    (
                        <div className="flex flex-auto items-center">
                            <button className="px-4" onClick={() => navigate('/profile')}> Profile </button>
                            <button onClick={() => {setIsOpen(!isOpen)}}> Cart </button>
                            <CartOverlay isOpen={isOpen} onClose={onClose}></CartOverlay>
                            <div className="px-4">{ email }</div>
                            <div className=""><Signout/></div>
                        </ div>
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