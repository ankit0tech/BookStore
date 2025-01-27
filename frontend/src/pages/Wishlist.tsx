import { useEffect, useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import Spinner from "../components/Spinner";
import { Wishlist as WishListInterface } from "../types";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";



const Wishlist = () => {

    const [loading, setLoading] = useState(false);
    const [wishlist, setWishlist] = useState<WishListInterface[]>([]);

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

    useEffect( ()=> {
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
            <BackButton />
            { loading ?
                <Spinner />
                :
                <div>
                    {
                       wishlist && wishlist.map((item) => (
                            <div 
                                key={item.id}
                                className="flex p-4"    
                            >
                                <Link
                                    to={`/books/details/${item.book.id}`}
                                    className="w-24 h-32 bg-gray-100 rounded-lg shadow-md overflow-hidden flex justify-center items-center"
                                >
                                    <img 
                                        src={item.book.cover_image}
                                        alt="Cover Image"
                                        className="w-full h-full object-cover object-scale-down"    
                                    ></img>
                                </Link>
                                <div className="p-4">
                                    <Link 
                                        to={`/books/details/${item.book.id}`}
                                    > Title: {item.book.title} </Link>
                                    <div> Price: {item.book.price} </div>
                                    <div> Author: {item.book.author} </div>
                                    <div> Item added: {new Date(item.updated_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                    </div>
                                    <button
                                        className="bg-purple-500 text-white py-1 px-4 my-1 font-bold rounded-full hover:bg-purple-700"
                                        onClick={() => {heandleRemove(item.book.id)}}
                                    >
                                        Remove from whishlist
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
        </div>
    );
}

export default Wishlist;