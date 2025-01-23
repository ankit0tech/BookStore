import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Review } from "../../types";
import { enqueueSnackbar } from "notistack";



const Reviews: React.FC<{id:number}>= ({ id }) => {

    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
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
                    <div> Reviews:</div>
                    <ul>
                        {reviews.map((review) => (
                            <li key={review.id}>
                                <div> Rating:  {review.rating} </div>
                                <div> Review:  {review.review_text} </div>
                            </li>    
                        ))}
                    </ul>
                </div>
            }
        </div>
    );

}

export default Reviews;