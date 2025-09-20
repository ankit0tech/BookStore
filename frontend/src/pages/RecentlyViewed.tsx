import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import { RecentlyViewed as RecentlyViewedInterface } from "../types";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";

const RecentlyViewed = () => {
    
    const [loading, setLoading] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedInterface[]>([]);
    const navigate = useNavigate();


    useEffect( ()=> {
        
        const fetchRecentlyViewed = async () => {
        
            setLoading(true);
    
            await api.get(`http://localhost:5555/recently-viewed`)
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

        await api.delete(`http://localhost:5555/recently-viewed/remove/${id}`)
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
                        <div className="text-2xl font-semibold p-4">No recently viewed item</div> 
                    :
                    (
                        <div className="overflow-x-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-max">
                                {recentlyViewed && recentlyViewed.map((item) => (
                                    <div
                                        key={item.id} 
                                        className="w-[300px] my-4 bg-white overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                    >
                                        <Link
                                            to={`/books/details/${item.book.id}`}
                                            className="block h-48 bg-gray-100"
                                        >
                                            <img 
                                                src={item.book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                                alt={item.book.title}
                                                className="w-full h-full object-contain p-4"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                                }}
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

export default RecentlyViewed;