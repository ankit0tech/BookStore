import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RecentlyViewed as RecentlyViewedInterface, RootState } from "../types/index";
import Signout from "../pages/Signout";
import CartOverlay from "./CartOverlay";
import { useNavigate } from "react-router-dom";
import { getCartItems } from "../utils/cartUtils";
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";
import api from "../utils/api";
import { AiOutlineClose, AiOutlineUser } from "react-icons/ai";
import { IoCartOutline } from "react-icons/io5";
import { MdOutlineDashboard } from "react-icons/md";
import { BiSearch } from "react-icons/bi";
import { LuLogOut } from "react-icons/lu";
import { useClickOutside } from "../hooks/useClickOutside";


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

    return (
        <div className="flex justify-between px-4 bg-white h-14 items-center border">
            <button className="text-gray-950 text-lg text-semibold ml-6" onClick={() =>navigate('/')}>BookStore</button>
            <div className="relative flex items-center px-4 text-black font-normal">                    
                <BiSearch className="absolute mx-3 mt-0.5 text-gray-400 " ></BiSearch>
                <input 
                    className="transition-all duration-300 ease-in-out py-1.25 w-3xs lg:w-md px-2 focus:w-64 lg:focus:w-md rounded-full focus:outline-hidden focus:ring focus:ring-gray-200 border border-gray-300 bg-gray-100 focus:bg-white pl-9" 
                    type="search" 
                    name="q" 
                    ref={searchBarRef}
                    onClick={handleSearchBarClick}
                    onBlur={handleOnSearchBarBlur}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') handleSearch();
                    }}
                    placeholder="Search here..."
                >
                </input>
                    
                { showRecentlyViewedPalet && 
                    <ul 
                        className="flex flex-col z-50 absolute top-full mt-2 left-0 w-full text-gray-950 shadow-lg rounded-lg p-2 bg-purple-100/40 backdrop-blur-xs border-1 border-gray-300 outline-none"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {recentlyViewed.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between items-center py-1.5 px-4 border rounded-md m-0.75 bg-white hover:scale-101 hover:shadow-sm transistion-all duration-100"
                            >
                                <Link className="w-full font-medium hover:font-semibold" to={`/books/details/${item.book.id}`}> 
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
                        className="relative flex items-center gap-4 mr-6 transition-all duration-200"
                        ref={profileMenuRef}    
                        >   
                            <div className="hover:bg-cyan-100 p-2 rounded-md">
                                <IoCartOutline 
                                    className="text-2xl text-gray-950 cursor-pointer"
                                    onClick={() => {setShowProfileMenu(false); setIsOpen(!isOpen)}}
                                >
                                </IoCartOutline>
                            </div>

                            <CartOverlay isOpen={isOpen} onClose={onClose}></CartOverlay>
                        
                            <div className="hover:bg-cyan-100 p-2 rounded-md">
                                <AiOutlineUser
                                    className="text-2xl text-gray-950 cursor-pointer outline-none"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                </AiOutlineUser>
                            </div>

                            {showProfileMenu && 
                                <div 
                                    className="flex flex-col items-start bg-white text-sm text-gray-800 absolute z-50 right-0 top-7 border rounded-lg shadow-lg transition-all duration-200"
                                >
                                    <p className="px-3 pb-2.5 pt-3 text-gray-700 truncate">{email}</p>

                                    <div className="flex flex-row gap-2 items-center px-3 py-2 border-b-1 border-gray-300 w-full hover:bg-gray-100 hover:text-gray-950 cursor-pointer transition-all duration-200"> 
                                        <MdOutlineDashboard></MdOutlineDashboard> 
                                        <button onClick={() => navigate(('/dashboard'))}>Dashboard</button></div>
                                    
                                    <div className="flex flex-row gap-2 items-center px-3 pt-2 pb-2.5 cursor-pointer hover:bg-red-100 hover:text-red-600 transition-all duration-200 w-full rounded-b-lg">    
                                        <LuLogOut></LuLogOut> 
                                        <Signout/>
                                    </div>
                                </div>  
                            }
                        </div>
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