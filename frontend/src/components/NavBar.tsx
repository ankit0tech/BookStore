import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RecentlyViewed as RecentlyViewedInterface, RootState } from "../types/index";
import CartOverlay from "./CartOverlay";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "../utils/cartUtils";
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
import api from "../utils/api";
import { AiOutlineClose, AiOutlineHome, AiOutlineUser } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import { LuLogOut } from "react-icons/lu";
import { useClickOutside } from "../hooks/useClickOutside";
import { FaRegUser } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { logoutSuccess } from "../redux/userSlice";
import { googleLogout } from "@react-oauth/google";
import { enqueueSnackbar } from "notistack";


const NavBar = () => {

    const [query, setQuery] = useState<string>('');
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const navigate = useNavigate();
    const searchBarRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const email: string | null = userinfo.email;
    const dispatch = useDispatch();
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedInterface[]>([]);
    const [showRecentlyViewedPalet, setShowRecentlyViewedPalet] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
    const profileMenuRef = useRef(null);    
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const cartSize = cartItems.data.length;

    useClickOutside(profileMenuRef, () => setShowProfileMenu(false));


    const handleSearchBarClick = () => {
        api.get('http://localhost:5555/recently-viewed')
            .then((response) => {
                setShowRecentlyViewedPalet(true);
                setRecentlyViewed(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleOnSearchBarBlur = () => {
        setShowRecentlyViewedPalet(false);
    }

    const heandleRemoveRecentlyViewed = async (id: number) => {
        
        const originalRecentlyViewed = [...recentlyViewed];
        setRecentlyViewed((prev) => prev.filter((item) => item.book.id != id));

        await api.delete(`http://localhost:5555/recently-viewed/remove/${id}`)
        .then(() =>{
        })
        .catch((error) => {
            console.log(error);
            setRecentlyViewed(originalRecentlyViewed);
        });

    }

    const handleSearch = () => {

        if (query) {
            const params = new URLSearchParams();
            params.append('searchQuery', query);
            navigate(`/?${params.toString()}`);
        } else {
            navigate('/');
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
        <nav className="flex justify-between px-4 bg-white h-16 items-center border shadow-xs">
            <button className="flex items-center gap-2 text-purple-600 text-lg font-semibold ml-6" onClick={() =>navigate('/')}> 
                <AiOutlineHome className="font-bold text-2xl"></AiOutlineHome> 
                <p>BookStore</p>
            </button>

            <div className="relative flex items-center px-4 text-black font-normal">                    
                <BiSearch className="absolute mx-3 mt-0.5 text-gray-400 " ></BiSearch>
                <input 
                    className="transition-all duration-300 ease-in-out py-1.75 _w-3xs lg:w-md px-2 _focus:w-64 _lg:focus:w-md rounded-full focus:outline-hidden focus:ring focus:ring-purple-400 border border-gray-300 bg-gray-100 focus:border-none focus:bg-white pl-9" 
                    type="search" 
                    name="q" 
                    ref={searchBarRef}
                    onClick={handleSearchBarClick}
                    onBlur={handleOnSearchBarBlur}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') handleSearch();
                    }}
                    placeholder="Search books, authors..."
                >
                </input>
                    
                { (showRecentlyViewedPalet && recentlyViewed.length > 0) && 
                    <ul 
                        className="flex flex-col z-50 absolute top-full mt-2 left-0 w-full text-gray-950 shadow-lg rounded-lg p-2 bg-purple-100/40 backdrop-blur-xs border-1 border-gray-300 outline-none"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {recentlyViewed.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between items-center py-1.5 px-4 border rounded-md m-0.75 bg-white hover:scale-101 hover:shadow-sm transistion-all duration-100"
                            >
                                <Link className="w-full" to={`/books/details/${item.book.id}`}> 
                                    {item.book.title}
                                </Link>
                                <AiOutlineClose 
                                    className="m-1 text-gray-500 text-2xl p-1 cursor-pointer hover:bg-red-100 rounded-full hover:text-red-500"
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

            <div className="flex">
                { email ? 
                    (
                        <div 
                        className="relative flex items-center gap-4 mr-6 _transition-all duration-200"
                        ref={profileMenuRef}    
                        >   
                            <div className="relative p-2 rounded-md"
                                onClick={() => {setShowProfileMenu(false); setIsOpen(!isOpen)}}
                            >
                                <IoCartOutline className="text-2xl text-gray-800 hover:text-black cursor-pointer"></IoCartOutline>
                                {cartSize>0 && (<div className="absolute right-0 top-1 text-xs rounded-full bg-cyan-400 px-1 cursor-pointer">{cartSize}</div>)}
                            </div>

                            <CartOverlay isOpen={isOpen} onClose={onClose}></CartOverlay>
                        
                            <div className="p-2 rounded-md relative">
                                <AiOutlineUser
                                    className="text-2xl text-gray-800 hover:text-black cursor-pointer"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                </AiOutlineUser>

                                {showProfileMenu && 
                                    <div 
                                        className="flex flex-col items-start _gap-2 absolute z-50 right-0 rounded-lg shadow-lg _transition-all _duration-200 bg-white"
                                    >   
                                        <div className="p-3 mb-1.5 bg-linear-to-r rounded-t-lg from-blue-600 to-blue-500 space-y-2">
                                            <p className="text-xs font-medium text-blue-200 tracking-wider uppercase">Signed in as</p>
                                            <div className="flex flex-row justify-between items-center gap-2">
                                                <div className="bg-white rounded-full p-2 text-blue-800"><FaRegUser/></div>
                                                <p className="text-sm font-medium text-white truncate">{email}</p>
                                            </div>
                                        </div>

                                        <button 
                                            className="relative flex flex-row gap-2 items-center justify-between group hover:bg-blue-50 px-3 py-3 w-full cursor-pointer _transition-all _duration-200"
                                            onClick={() => {setShowProfileMenu(false); navigate(('/dashboard'))}}
                                        > 
                                            <div className="absolute top-1 left-0 bottom-1 w-1 rounded-r bg-white group-hover:bg-blue-500 scale-y-80 group-hover:scale-y-100 transition-all duration-200"></div>
                                            <div className="flex flex-row items-center gap-2">
                                                <div className="text-sm p-2 text-blue-600 bg-blue-100 group-hover:bg-blue-200 rounded-lg"><MdOutlineDashboard /></div> 
                                                <p className="text-gray-800 text-sm font-medium">Dashboard</p>
                                            </div>
                                            <IoIosArrowForward className="text-xs group-hover:text-blue-500"/>
                                        </button>
                                        
                                        <button 
                                            className="relative flex flex-row gap-2 items-center justify-between group hover:bg-red-50 px-3 py-3 cursor-pointer _transition-all _duration-200 w-full rounded-b-lg"
                                            onClick={() => {setShowProfileMenu(false); handleSignout()}}
                                        >   
                                            <div className="absolute top-1 left-0 bottom-1 w-1 rounded-r bg-white group-hover:bg-red-500 scale-y-80 group-hover:scale-y-100 transition-all duration-200"></div>
 
                                            <div className="flex flex-row items-center gap-2">
                                                <div className="text-sm p-2 text-red-600 bg-red-100 group-hover:bg-red-200 rounded-lg"><LuLogOut/></div> 
                                                <p className="text-gray-800 text-sm font-medium">Signout</p>
                                            </div>
                                            <IoIosArrowForward className="text-xs group-hover:text-red-500"/>
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    )
                    :
                    (<Link to='/login'>
                        Login
                    </Link>)
                }
            </div>
        </nav>
    );
}

export { NavBar };