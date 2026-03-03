import React, { useEffect, useState } from "react";
import { Review } from "../../types";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { FaRegStar, FaStar } from "react-icons/fa";
import { formatDate } from "../../utils/formatUtils";
import api from "../../utils/api";


const Reviews: React.FC<{id: number}> = ({id }) => {

    const [reviews, setReviews] = useState<Review[]>([]);

    const showStars = (stars: number) => {
        return (
            <div className="my-1 flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                    index < stars ?
                    <FaStar key={index} className="text-yellow-400" /> :
                    <FaRegStar key={index} className="text-gray-300" />
                ))}
            </div>
        );
    }

    useEffect(() => {
        if (!id) return;
        try {
            api.get(`/reviews/book/${id}`)
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


    return (
        <div className="w-full">
            {reviews.length == 0 ?
                <div className="text-lg text-gray-800">No reviews for this book till now.</div> 
                    :
                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col gap-1">
                        <div className="text-xl font-semibold text-gray-900">Customer Reviews</div>
                        <p className="text-sm text-gray-600">{reviews.length} reviews</p>
                    </div>
                    <ul className="flex flex-col gap-4 divide-y divide-gray-200">
                        {reviews.map((review) => (
                            <li 
                                key={review.id}
                                className="flex gap-2 pb-4 _py-4 _my-4 w-full _rounded-lg _border _shadow _hover:shadow-md text-gray-800 transition-shadow duration-200"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col items-start justify-start sm:flex-row sm:items-center gap-2 _w-full">
                                        <div className="flex gap-2 items-center self-start">
                                            <div className="rounded-full p-2 text-sm font-semibold text-blue-700 bg-blue-100 w-fit h-fit">{review.user?.email.substring(0,2).toUpperCase()}</div>
                                            <div className="text-sm font-medium">{review.user?.email.split('@')[0]} </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="inline-block">{showStars(review.rating)}</span> <span className="inline-block text-sm text-gray-700">{review.rating}/5</span>
                                        </div>

                                        <div className="text-xs text-gray-600 sm:ml-auto">{formatDate(review.created_at)}</div>
                                    </div>

                                    {review.review_text.length > 0 && 
                                        <div className="text-sm text-gray-800"> {review.review_text} </div>
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