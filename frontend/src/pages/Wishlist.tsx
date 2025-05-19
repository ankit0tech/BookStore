import { useEffect, useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import { Wishlist as WishListInterface } from "../types";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const Wishlist = () => {

    const [loading, setLoading] = useState(false);
    const [wishlist, setWishlist] = useState<WishListInterface[]>([]);
    const navigate = useNavigate();


    useEffect( ()=> {

        const fetchWishlist = async () => {
        
            setLoading(true);
    
            await api.get(`http://localhost:5555/wishlist/items`)
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

        await api.delete(`http://localhost:5555/wishlist/remove/${id}`)
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
                    { !wishlist.length ? 
                        (<h2 className="text-2xl font-semibold p-4">Your Wishlist is empty</h2>) 
                    :
                        (
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-max">
                                {wishlist && wishlist.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="w-[300px] my-4 bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <Link
                                            to={`/books/details/${item.book.id}`}
                                            className="block h-48 bg-gray-100"
                                        >
                                            <img 
                                                src={item.book.cover_image}
                                                alt="Cover Image"
                                                className="w-full h-full object-contain p-4"    
                                            ></img>
                                        </Link>
                                        
                                        <div className="p-4 flex flex-col">
                                            <Link 
                                                to={`/books/details/${item.book.id}`}
                                                className="block font-semibold hover:text-blue-500 truncate"
                                            >
                                                {item.book.title} 
                                            </Link>
                                            <div className="text-sm text-gray-600 truncate">by {item.book.author} </div>
                                            <div className="font-semibold pt-2">&#8377;{item.book.price} </div>
                                            <div className="text-sm text-gray-600 py-2"> 
                                                Added on: {new Date(item.updated_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                            <div className="flex flex-row gap-2 mt-2">
                                                <button
                                                    className="flex-1 text-center whitespace-nowrap text-blue-600 hover:bg-blue-200 bg-blue-100 py-2 px-4 rounded-lg transition-all duration-200"
                                                    onClick={() => {navigate(`/books/details/${item.book.id}`)}}
                                                >
                                                    View Details
                                                </button>
                                                
                                                <button
                                                    className="flex-1 text-red-600 whitespace-nowrap hover:bg-red-200 bg-red-100 py-2 px-4 rounded-lg transition-all duration-200"
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