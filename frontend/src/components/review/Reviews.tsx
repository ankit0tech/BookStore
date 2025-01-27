import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Review } from "../../types";
import { enqueueSnackbar } from "notistack";



const Reviews: React.FC<{id:number}> = ({ id }) => {

    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        if (!id) return;
        try {
            api.get(`http://localhost:5555/review/book/${id}`)
            .then((response)=> {
                setReviews(response.data);
            })
            .catch((error: any)=> {
                console.log(error);
            });
        } catch(error: any) {
            enqueueSnackbar('Error fetching reviews', { variant: 'error' });
        }
        
    }, []);


    return (
        <div className="">
            {reviews.length == 0 ?
                <div> No reviews for this book till now !!!</div> 
                    :
                <div>
                    <div className="my-4 font-bold"> Reviews:</div>
                    <ul>
                        {reviews.map((review) => (
                            <li 
                                key={review.id}
                                className="border rounded-lg p-2 my-4">
                                    <div className="my-1"> By User: {review.user?.email} </div>
                                    <div className="my-1"> Rating:  {review.rating} </div>
                                    <div className="my-1"> Review:  {review.review_text} </div>
                            </li>    
                        ))}
                    </ul>
                </div>
            }
        </div>
    );

}

export default Reviews;