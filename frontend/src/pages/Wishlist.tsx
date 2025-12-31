import { useEffect, useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import { Wishlist as WishListInterface } from "../types";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { formatDate, formatPrice } from "../utils/formatUtils";
import { FaCalendarAlt } from "react-icons/fa";


const Wishlist = () => {

    const [loading, setLoading] = useState(false);
    const [wishlist, setWishlist] = useState<WishListInterface[]>([]);
    const navigate = useNavigate();


    useEffect( ()=> {

        const fetchWishlist = async () => {
        
            setLoading(true);
    
            await api.get(`/wishlist/items`)
            .then((response)=> {
                setWishlist(response.data);
                setLoading(false);
            })
            .catch((error) =>{
                console.log(error);
                enqueueSnackbar('Error while loading wishlist items');
                setLoading(false);
            });
    
        }
    
        fetchWishlist();

    }, []);

    const heandleRemove = async (id: number) => {

        const originalWishList = [...wishlist];

        setWishlist((prev) => prev.filter((item) => item.book.id != id));

        await api.delete(`/wishlist/remove/${id}`)
        .then((response) =>{
            enqueueSnackbar('Removed from wishlist successfully', { variant: 'success'});
        })
        .catch((error) => {
            console.log(error);
            setWishlist(originalWishList);
            enqueueSnackbar('Error while removing item from wishlist', { variant: 'error'});
        })

    }

    return (
        <div className="p-4">
            { loading ?
                <Spinner />
                :
                <div>
                    { !wishlist.length ? (
                        <div>
                            <h2 className="text-2xl font-medium text-gray-950 mb-3">Your Wishlist is empty</h2>
                            <p className="text-gray-900 mb-8">
                                Start adding books to you wishlist to save them for later.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-max">
                                {wishlist && wishlist.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="w-[300px] my-4 bg-white overflow-hidden border rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out"
                                    >
                                        <Link
                                            to={`/books/details/${item.book.id}`}
                                            className="block group/image h-48 bg-gradient-to-tr from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 transition-colors duration-300 ease-in-out"
                                        >
                                            <img 
                                                src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                                alt={item.book.title}
                                                className="w-full h-full object-contain p-4 group-hover/image:scale-102 transition-transform duration-300 ease-in-out"    
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                                }}
                                            ></img>
                                        </Link>
                                        
                                        <div className="p-4 flex flex-col">
                                            <Link 
                                                to={`/books/details/${item.book.id}`}
                                                className="text-lg font-medium line-clamp-1"
                                            >
                                                {item.book.title} 
                                            </Link>
                                            <div className="text-sm text-gray-600 truncate">by {item.book.author} </div>
                                            <div className="font-semibold pt-2"> {formatPrice(item.book.price, item.book.currency)} </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600 py-2">
                                                <FaCalendarAlt className="text-xs"></FaCalendarAlt>
                                                Added on: {formatDate(item.updated_at)}
                                            </div>
                                            <div className="flex flex-row gap-2 mt-2">
                                                <button
                                                    className="w-full text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(148,217,247,0.6)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                                    onClick={() => {navigate(`/books/details/${item.book.id}`)}}
                                                >
                                                    View Details
                                                </button>
                                                
                                                <button
                                                    className="w-full text-sm text-red-600 font-medium px-4 py-2 bg-red-50/40 hover:bg-red-50 border border-red-200 rounded-sm shadow-[2px_2px_0px_0px_rgba(130,0,11,0.2)] active:shadow-[1px_1px_0px_0px_rgba(130,0,11,0.2)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                                                    onClick={() => {heandleRemove(item.book.id)}}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            }
        </div>
    );
}

export default Wishlist;