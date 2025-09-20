import React, { useEffect, useState } from "react";
import { Review } from "../../types";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { FaRegStar, FaStar } from "react-icons/fa";


const Reviews: React.FC<{id: number}> = ({id }) => {

    const [reviews, setReviews] = useState<Review[]>([]);

    const showStars = (stars: number) => {
        return (
            <div className="my-1 flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                    index < stars ?
                    <FaStar key={index} className="text-yellow-400 text-md" /> :
                    <FaRegStar key={index} className="text-gray-300 text-md" />
                ))}
            </div>
        );
    }

    useEffect(() => {
        if (!id) return;
        try {
            axios.get(`http://localhost:5555/reviews/book/${id}`)
            .then((response)=> {
                setReviews(response.data);
            })
            .catch((error: any)=> {
                console.log(error);
            });
        } catch(error: any) {
            enqueueSnackbar('Error fetching reviews', { variant: 'error' });
        }
        
    }, [id]);

    const formatDate = (date: Date): string => {
        const d = new Date(date);
        
        return new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(d);
    }

    return (
        <div className="w-full">
            {reviews.length == 0 ?
                <div className="text-lg text-gray-800"> No reviews for this book till now.</div> 
                    :
                <div className="w-full">
                    <div className="pb-2 text-xl font-semibold text-gray-900">Customer Reviews</div>
                    <p className="py-2 text-sm text-gray-600">{reviews.length} reviews</p>
                    <ul className="divide-y divide-gray-200">
                        {reviews.map((review) => (
                            <li 
                            key={review.id}
                            className="flex gap-2 py-4 my-4 w-full _rounded-lg _border _shadow _hover:shadow-md text-gray-800 transition-shadow duration-200">
                                
                                <div className="rounded-full p-2 text-sm font-semibold text-blue-700 bg-blue-100 w-fit h-fit">{review.user?.email.substring(0,2).toUpperCase()}</div>
                                <div className="w-full">
                                    <div className="py-2">
                                        
                                        <div className="w-full flex justify-between items-center">
                                            <div className="flex gap-3 items-center">
                                                <div className="text-sm font-medium">{review.user?.email.split('@')[0]} </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-block">{showStars(review.rating)}</span> <span className="inline-block text-sm text-gray-700">{review.rating}/5</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-600">{formatDate(review.created_at)}</div>
                                        </div>

                                    </div>

                                    {review.review_text.length > 0 && 
                                        <div className="mt-1 text-md text-gray-800"> {review.review_text} </div>
                                    }
                                    
                                </div>
                            </li>    
                        ))}
                    </ul>
                </div>
            }
        </div>
    );
}

export default Reviews;