import { useEffect, useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import {  useNavigate, useParams } from "react-router-dom";
import DeleteOverlay from "../components/DeleteOverlay";
import { FaRegStar, FaStar } from "react-icons/fa";


const AddReview = () => {

    const { id } = useParams();
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number|null>(null);
    const [review, setReview] = useState<string>('');
    const [updateReview, setUpdateReview] = useState<boolean>(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect( ()=> {
          
        api.get(`http://localhost:5555/review/book/${id}/user`)
        .then((response) =>{
            if (response.data) {
                setUpdateReview(true);
            }
            setRating(response.data.rating || 0);
            setReview(response.data.review_text || '');
        })
        .catch((error) =>{
            console.log(error);
        })

    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            rating: rating,
            review_text: review
        };
        
        const apiCall = updateReview ? 
        api.put(`http://localhost:5555/review/${id}`, data) 
        :
        api.post(`http://localhost:5555/review/${id}`, data)

        apiCall
            .then((response) =>{
                // console.log(response);
                // setRating(response.data.rating);
                // setReview(response.data.review_text);
                enqueueSnackbar('Updated review successfully', {variant: 'success'});
                navigate(-1);
            })
            .catch((error: any) => {
                console.log(error.message);
                enqueueSnackbar('Issue in adding review', {variant: 'error'});
            });

    }


    const onClose = () => {
        setShowConfirmDelete(false);
    }

    return (
        <div
            className="p-4 flex flex-col min-w-1/3 md:max-w-[80%] mx-auto"  
        >
            <form 
                className="flex flex-col"
                onSubmit={handleSubmit}
            >
                
                <div className="flex mb-2">
                    {[1,2,3,4,5].map((i) => 
                        i <= (hover ?? rating) ? (
                            <FaStar 
                                key={i} 
                                className="mr-1 text-2xl inline text-yellow-500 transition" 
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => setRating(i)}
                            />
                        ) : (
                            <FaRegStar 
                                key={i} 
                                className="mr-1 text-2xl inline text-gray-800 scale-90 transition" 
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => setRating(i)}
                            />
                        )
                    )}
                        
                    {(rating && rating >=1) ? (
                        <button 
                            onClick={() => setRating(0)}
                            className="mx-3 text-blue-500"
                        >
                            clear
                        </button>
                    ) : null}
                </div>

                <label htmlFor="review_text">Write a review:</label>
                <textarea 
                    className="h-40 appearance-none rounded-lg my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    id='review_text'
                    name='review_text'
                    value={review}
                    onChange={(e) => {setReview(e.target.value)}}>

                </textarea>
                
                <div className="flex gap-2">
                    <button 
                        className="mt-2 px-4 py-2 text-blue-500 bg-blue-100 hover:bg-blue-200 rounded-lg self-start transition-colors duration-200"
                        type='submit'>
                            Save
                    </button>
                    {updateReview &&
                        <button 
                            onClick={() => {setShowConfirmDelete(true)}}
                            type="button"
                            className="mt-2 px-4 py-2 text-red-500 bg-red-100 hover:bg-red-200 rounded-lg self-start transition-colors duration-200"
                        >
                            Delete
                        </button>
                    }
                </div>
            </form>
            {updateReview && 
                <DeleteOverlay 
                    deleteUrl={`http://localhost:5555/review/${id}`} 
                    itemName="review" 
                    isOpen={showConfirmDelete} 
                    onClose={onClose} 
                    onDeleteSuccess={() => navigate(-1)}
                />
            }
        </div>
    );
}

export default AddReview;