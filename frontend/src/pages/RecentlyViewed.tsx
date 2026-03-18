import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import { RecentlyViewed as RecentlyViewedInterface } from "../types";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import { formatDate, formatPrice } from "../utils/formatUtils";
import { FaCalendarAlt } from "react-icons/fa";

const RecentlyViewed = () => {
    
    const [loading, setLoading] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedInterface[]>([]);
    const navigate = useNavigate();


    useEffect( ()=> {
        
        const fetchRecentlyViewed = async () => {
        
            setLoading(true);
    
            await api.get(`/recently-viewed`)
            .then((response)=> {
                setRecentlyViewed(response.data);
                setLoading(false);
            })
            .catch((error) =>{
                console.log(error);
                enqueueSnackbar('Error while loading recently viewed items');
                setLoading(false);
            });
        }
    
        fetchRecentlyViewed();

    }, []);

    const heandleRemove = async (id: number) => {

        const originalRecentlyViewed = [...recentlyViewed];

        setRecentlyViewed((prev) => prev.filter((item) => item.book.id != id));

        await api.delete(`/recently-viewed/remove/${id}`)
        .then((response) =>{
            enqueueSnackbar('Removed from recently viewed successfully', { variant: 'success'});
        })
        .catch((error) => {
            console.log(error);
            setRecentlyViewed(originalRecentlyViewed);
            enqueueSnackbar('Error while removing item from recently viewed', { variant: 'error'});
        })

    }


    return (
        <div className="p-4">
            {/* <BackButton /> */}
            { loading ?
                <Spinner />
                :
                <div>
                    { !recentlyViewed.length ? 
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-semibold text-gray-950">No recently viewed item</h2>
                        <p className="text-sm text-gray-700">
                            Browse the books to update recently viewed items.
                        </p>
                    </div>
                    :
                    (
                        <div className="grid items-stretch gap-y-4 gap-x-4 grid-cols-[repeat(1,minmax(160px,256px))] xs:grid-cols-[repeat(2,minmax(256px,352px))] sm:grid-cols-[repeat(auto-fit,minmax(256px,256px))] justify-start">
                            {recentlyViewed && recentlyViewed.map((item) => (
                                <div
                                    key={item.id} 
                                    className="h-[420px] bg-white overflow-hidden border rounded-lg hover:shadow-sm transition-shadow duration-200 ease-in-out"
                                >
                                    <Link
                                        to={`/books/details/${item.book.id}`}
                                        className="w-full h-56 flex justify-center block group/image bg-gray-50 hover:bg-gray-100 transition-colors duration-300 ease-out"
                                    >
                                        <img 
                                            src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                            alt={item.book.title}
                                            className="w-full h-56 object-contain p-4 group-hover/image:scale-102 transition-transform duration-300 ease-out"    
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                            }}
                                        ></img>
                                    </Link>
                                    
                                    <div className="p-4 flex flex-col h-[calc(392px-224px-24px)]">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col">
                                                <Link 
                                                    to={`/books/details/${item.book.id}`}
                                                    className="font-medium text-gray-900 leading-tight line-clamp-1 mt-2"
                                                >
                                                    {item.book.title} 
                                                </Link>
                                                <div className="text-sm text-gray-600 truncate">by {item.book.author} </div>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-gray-800">{formatPrice(item.book.price, item.book.currency)} </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600"> 
                                            <FaCalendarAlt className="text-xs"></FaCalendarAlt>
                                            Added on: {formatDate(item.updated_at)}
                                        </div>
                                        <div className="flex flex-row gap-2">
                                            <button
                                                className="whitespace-nowrap w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                                onClick={() => {navigate(`/books/details/${item.book.id}`)}}
                                            >
                                                View Details
                                            </button>
                                            
                                            <button
                                                className="whitespace-nowrap w-full py-2 px-4 font-medium text-gray-800 hover:text-red-600 hover:bg-red-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                                onClick={() => {heandleRemove(item.book.id)}}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
        </div>
    );
}

export default RecentlyViewed;