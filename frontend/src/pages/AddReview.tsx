import { useEffect, useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import {  useNavigate, useParams } from "react-router-dom";
import DeleteOverlay from "../components/DeleteOverlay";
import { FaRegStar, FaStar } from "react-icons/fa";
import { AdminBook, UserBook } from "../types";
import { formatPrice } from "../utils/formatUtils";


const AddReview = () => {

    const { id } = useParams();
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number|null>(null);
    const [review, setReview] = useState<string>('');
    const [updateReview, setUpdateReview] = useState<boolean>(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
    const [book, setBook] = useState<UserBook|AdminBook|null>(null);
    const navigate = useNavigate();

    useEffect( ()=> {
        
        api.get(`/books/${id}`)
        .then((response) => {
            setBook(response.data);
        })
        .catch((error) => {
            console.log(error);
        });

        api.get(`/reviews/book/${id}/user`)
        .then((response) => {
            if (response.data) {
                setUpdateReview(true);
            }
            setRating(response.data?.rating || 0);
            setReview(response.data?.review_text || '');
        })
        .catch((error) => {
            console.log(error);
        });
        
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            rating: rating,
            review_text: review
        };
        
        const apiCall = updateReview ? 
        api.put(`/reviews/${id}`, data) 
        :
        api.post(`/reviews/${id}`, data)

        apiCall
        .then((response) =>{
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
        <div className="p-4 flex flex-col gap-4 min-w-[320px] md:max-w-[50%] mx-auto">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {updateReview ? 'Edit Review' : 'Write A Review' }
            </h2>

            {book &&
                <div className="flex flex-row gap-2">
                    <img 
                        className="shrink-0 w-32 h-44 object-scale-down rounded-md bg-gray-100"
                        src={book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'} 
                        alt={book.title}
                        onError={(e) => {
                            e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                        }}
                    />
                    <div className="flex flex-col gap-1">
                        <p className="text-gray-800 font-medium text-md">{book.title}</p>
                        <p className="text-gray-600 text-sm">{formatPrice(book.price, book.currency)}</p>
                    </div>
                </div>
            }

            <form className="flex flex-col gap-4" onSubmit={handleSubmit} >
                <div className="flex flex-col gap-1">
                    <label className="block font-medium text-sm text-gray-700 flex flex-row gap-1" htmlFor="ratings">
                        <span>Rating</span><span className="text-red-500">*</span>
                    </label>
                    <div 
                        className="flex flex-row gap-1 items-center"
                        id="ratings"
                    >
                        {[1,2,3,4,5].map((i) => 
                            i <= (hover ?? rating) ? (
                                <FaStar 
                                    key={i} 
                                    className="mr-1 text-2xl inline text-yellow-500 transition cursor-pointer" 
                                    onMouseEnter={() => setHover(i)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => setRating(i)}
                                />
                            ) : (
                                <FaRegStar 
                                    key={i} 
                                    className="mr-1 text-2xl inline text-gray-500 scale-90 transition cursor-pointer" 
                                    onMouseEnter={() => setHover(i)}
                                    onMouseLeave={() => setHover(null)}
                                    onClick={() => setRating(i)}
                                />
                            )
                        )}
                            
                        {(rating && rating >=1) ? (
                            <button 
                                onClick={() => setRating(0)}
                                className="mx-1 _self-end text-blue-500 hover:text-blue-600 transition-colors duration-200"
                            >
                                clear
                            </button>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label 
                        className="font-medium text-sm text-gray-700" 
                        htmlFor="review_text"
                    >
                        Your review
                    </label>
                    <textarea 
                        // className="w-full resize-none h-40 appearance-none rounded-lg my-2 px-4 py-3 "
                        // className="w-full min-h-40 appearance-none px-3 py-2 border border-gray-300 focus:border-blue-200 focus:outline-hidden rounded-lg"
                        className="min-h-40 appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                        id='review_text'
                        name='review_text'
                        value={review}
                        maxLength={500}
                        placeholder="Share your thoughts about this book..."
                        onChange={(e) => {setReview(e.target.value)}}>

                    </textarea>
                    <p className="ml-auto text-gray-500 text-xs">{review.length}/500</p>
                </div>
                
                <div className="flex justify-end gap-4">
                    <button 
                        className="whitespace-nowrap w-fit py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        // className="w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50 border border-sky-300 rounded-sm shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                        type='submit'
                    >
                        {updateReview ? 'Update Review' : 'Submit Review'}
                    </button>

                    {updateReview && (
                        <button 
                            // className="w-fit py-2 px-4 font-medium text-red-600 hover:bg-red-50 rounded-sm border border-red-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                            // className="whitespace-nowrap w-fit py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                            className="whitespace-nowrap w-fit py-2 px-4 font-medium text-gray-800 hover:text-red-600 hover:bg-red-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                            // className="w-fit text-sm text-red-600 font-medium px-4 py-2 bg-red-50/40 hover:bg-red-50 border border-red-200 rounded-sm shadow-[2px_2px_0px_0px_rgba(130,0,11,0.2)] active:shadow-[1px_1px_0px_0px_rgba(130,0,11,0.2)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                            type="button"
                            onClick={() => {setShowConfirmDelete(true)}}
                        >
                            Delete Review
                        </button>
                    )}
                </div>
            </form>

            {updateReview && (
                <DeleteOverlay 
                    deleteUrl={`/reviews/${id}`} 
                    itemName="review" 
                    isOpen={showConfirmDelete} 
                    onClose={onClose} 
                    onDeleteSuccess={() => navigate(-1)}
                />
            )}
        </div>
    );
}

export default AddReview;