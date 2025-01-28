import { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import { RecentlyViewed as RecentlyViewedInterface } from "../types";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";

const RecentlyViewed = () => {
    
    const [loading, setLoading] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedInterface[]>([]);


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
            <BackButton />
            { loading ?
                <Spinner />
                :
                <div>
                    { !recentlyViewed.length ? 
                        <div className="p-4">No recently viewed item</div> 
                    :
                        recentlyViewed && recentlyViewed.map((item) => (
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
                                    <button
                                        className="bg-purple-500 text-white py-1 px-4 my-1 font-bold rounded-full hover:bg-purple-700"
                                        onClick={() => {heandleRemove(item.book.id)}}
                                    >
                                        Remove from recently viewed
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

export default RecentlyViewed;