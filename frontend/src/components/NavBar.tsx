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

    useClickOutside(profileMenuRef, (event: MouseEvent|TouchEvent) => setShowProfileMenu(false));


    const handleSearchBarClick = () => {
        api.get('/recently-viewed')
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

        await api.delete(`/recently-viewed/remove/${id}`)
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
                const items = await getCartItems();
                dispatch(setCartItemsSlice(items));
            }
        }

        fetchCartItems();

    }, [userinfo.token, dispatch])


    
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
        <nav className="flex justify-between px-4 h-16 items-center border-[1.5px] border-gray-300">
            <button className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-lg font-semibold ml-6" onClick={() =>navigate('/')}> 
                <AiOutlineHome className="font-bold text-2xl"></AiOutlineHome> 
                <p>BookStore</p>
            </button>

            <div className="relative flex items-center px-2 font-normal _w-full">                    
                <BiSearch className="absolute mx-3 mt-0.5 text-gray-400 " ></BiSearch>
                <input 
                    className="w-full transition-color transition-[width] duration-300 ease-out px-2 py-1.75 w-3xs sm:w-2xs md:w-sm lg:w-md rounded-lg bg-gray-50 focus:outline-hidden border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:bg-white pl-9" 
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
                    
                <div className={`transition-opacity z-50 duration-200 ease-out ${(showRecentlyViewedPalet && recentlyViewed.length > 0) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <ul 
                        className={`flex flex-col p-3 mt-2 absolute top-full w-full left-0 shadow-lg rounded-lg border border-gray-300 outline-hidden bg-white overflow-hidden transition-opacity transition-transform duration-200 ease-out ${(showRecentlyViewedPalet && recentlyViewed.length > 0) ? 'opacity-100 scale-100 transition-y-0' : 'opacity-0 scale-90 transitino-y-1'}`}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {recentlyViewed.map((item) => (
                            <li
                                key={item.id}
                                className={`flex justify-between items-center py-2 px-3 rounded-sm hover:bg-gray-50 active:bg-gray-200 transition-all duration-300 hover:ring hover:ring-gray-300`}
                            >
                                <Link className="w-full" to={`/books/details/${item.book.id}`}> 
                                    {item.book.title}
                                </Link>
                                <AiOutlineClose 
                                    className="m-1 text-amber-600 text-sm hover:scale-105 hover:text-amber-700 text-2xl cursor-pointer rounded-sm transition-transform duration-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        heandleRemoveRecentlyViewed(item.book.id)
                                    }}
                                />
                            </li>
                        ))}
                    </ul> 
                </div>
            </div>

            <div className="flex">
                { email ? 
                    (
                        <div 
                        className="relative flex items-center gap-4 mr-6 _transition-all duration-200"
                        ref={profileMenuRef}    
                        >   
                            <div className="group relative p-2 rounded-md"
                                onClick={() => {setShowProfileMenu(false); setIsOpen(!isOpen)}}
                            >
                                <IoCartOutline className="text-2xl text-gray-700 group-hover:text-gray-950 cursor-pointer transition-color duration-200"></IoCartOutline>
                                {cartSize>0 && (<div className="absolute right-0 top-1 text-xs rounded-full bg-orange-500 group-hover:bg-orange-600 _bg-sky-300 _group-hover:bg-sky-400 px-1 cursor-pointer transition-color duration-200">{cartSize}</div>)}
                            </div>

                            <CartOverlay isOpen={isOpen} onClose={onClose}></CartOverlay>
                        
                            <div className="p-4 rounded-md relative">
                                <AiOutlineUser
                                    className="text-2xl text-gray-700 hover:text-gray-950 cursor-pointer"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                </AiOutlineUser>

                                <div className={`absolute z-50 right-0 mt-2 rounded-lg overflow-hidden shadow-lg transition-opacity duration-200 ease-out ${showProfileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                    
                                    <div className={`flex flex-col items-center rounded-lg overflow-hidden border border-gray-300 bg-white transition-opacity transition-transform duration-200 ease-out ${showProfileMenu ? 'opacity-100 scale-100 transform-y-0' : 'opacity-0 scale-95 transform-y-1 border-transparent'}`}>   
                                        <div className="py-3 px-4 font-medium _bg-gray-50 text-gray-950 truncate">{email}</div>
                                        <div className="border-t-[1.25px] border-gray-300 _mb-2 w-full -mx-2"></div>
                                        
                                        <div className="flex flex-col w-full p-3">
                                            <div className="w-full hover:bg-gray-50 py-1.75 px-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring hover:ring-gray-300">
                                                <button 
                                                    onClick={() => {setShowProfileMenu(false); navigate(('/dashboard'))}}
                                                >Dashboard</button>
                                            </div>
                                            <div className="w-full hover:bg-gray-50 py-1.75 px-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring hover:ring-gray-300">
                                                <button 
                                                    onClick={() => {setShowProfileMenu(false); handleSignout()}}
                                                >Signout</button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                    :
                    (<Link 
                        className="text-gray-700 hover:text-gray-950 px-2"
                        to='/login'
                    >
                        Login
                    </Link>)
                }
            </div>
        </nav>
    );
}

export { NavBar };