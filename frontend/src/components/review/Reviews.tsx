import React, { useEffect, useState } from "react";
import { Review } from "../../types";
import { enqueueSnackbar } from "notistack";
import axios from "axios";
import { FaRegStar, FaStar } from "react-icons/fa";


const Reviews: React.FC<{id: number}> = ({id }) => {

    const [reviews, setReviews] = useState<Review[]>([]);

    const showStars = (stars: number) => {
        return (
            <div className="my-1 flex gap-1">
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


    return (
        <div className="">
            {reviews.length == 0 ?
                <div className="text-xl text-gray-900"> No reviews for this book till now !!!</div> 
                    :
                <div>
                    <div className="text-xl font-semibold text-gray-900"> Reviews:</div>
                    <ul>
                        {reviews.map((review) => (
                            <li 
                                key={review.id}
                                className="border-b-2 roundd-lg py-2 my-2 text-gray-800">
                                    <div className="text-md"> By: {review.user?.email} </div>
                                    {showStars(review.rating)}
                                    {review.review_text.length > 0 && <div className="mt-1 text-md"> Review:  {review.review_text} </div>}
                            </li>    
                        ))}
                    </ul>
                </div>
            }
        </div>
    );
}

export default Reviews;