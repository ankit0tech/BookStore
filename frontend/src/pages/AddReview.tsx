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
        
        api.get(`http://localhost:5555/books/${id}`)
        .then((response) => {
            setBook(response.data);
        })
        .catch((error) => {
            console.log(error);
        });

        api.get(`http://localhost:5555/reviews/book/${id}/user`)
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
        api.put(`http://localhost:5555/reviews/${id}`, data) 
        :
        api.post(`http://localhost:5555/reviews/${id}`, data)

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
        <div className="p-4 flex flex-col min-w-1/3 md:max-w-[50%] mx-auto">
            <h2 className="mb-6 text-gray-900 text-2xl font-semibold">
                {updateReview ? 'Edit Review' : 'Write A Review' }
            </h2>

            {book &&
                <div className="flex py-2">
                    <img 
                        className="_w-32 _h-44 w-28 h-36 object-scale-down rounded-sm"
                        src={book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'} 
                        alt={book.title}
                        onError={(e) => {
                            e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                        }}
                    />
                    <div className="px-4 space-y-2">
                        <p className="text-gray-800 text-md">{book.title}</p>
                        <p className="text-gray-600 text-sm">{formatPrice(book.price, book.currency)}</p>
                    </div>
                </div>
            }

            <form className="flex flex-col" onSubmit={handleSubmit} >
                <label className="my-1 block font-semibold text-sm text-gray-700" htmlFor="ratings">Rating <span className="text-red-500">*</span></label>
                <div 
                    className="flex items-center mb-4"
                    id="ratings"
                >
                    {[1,2,3,4,5].map((i) => 
                        i <= (hover ?? rating) ? (
                            <FaStar 
                                key={i} 
                                className="mr-1 text-3xl inline text-yellow-500 transition cursor-pointer" 
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => setRating(i)}
                            />
                        ) : (
                            <FaRegStar 
                                key={i} 
                                className="mr-1 text-3xl inline text-gray-500 scale-90 transition cursor-pointer" 
                                onMouseEnter={() => setHover(i)}
                                onMouseLeave={() => setHover(null)}
                                onClick={() => setRating(i)}
                            />
                        )
                    )}
                        
                    {(rating && rating >=1) ? (
                        <button 
                            onClick={() => setRating(0)}
                            className="mx-3 text-blue-500 hover:text-blue-600 transition-colors duration-200"
                        >
                            clear
                        </button>
                    ) : null}
                </div>

                <label className="my-1 font-semibold text-sm text-gray-700" htmlFor="review_text">Your review</label>
                <textarea 
                    // className="w-full resize-none h-40 appearance-none rounded-lg my-2 px-4 py-3 "
                    className="w-full min-h-40 appearance-none my-1 px-3 py-2 border border-gray-300 focus:border-blue-400 focus:outline-hidden rounded-lg"
                    id='review_text'
                    name='review_text'
                    value={review}
                    maxLength={500}
                    placeholder="Share your thoughts about this book..."
                    onChange={(e) => {setReview(e.target.value)}}>

                </textarea>
                <p className="ml-auto text-gray-500 text-xs">{review.length}/500</p>
                
                <div className="flex gap-2">
                    <button 
                        className="w-fit text-sm text-sky-800 font-medium px-4 py-2 bg-sky-50/40 hover:bg-sky-50/70 border border-sky-300 rounded-sm _shadow-[2px_2px_0px_0px_rgba(0,117,149,0.4)] shadow-[2px_2px_0px_0px_rgba(148,217,247,0.6)] active:shadow-[1px_1px_0px_0px_rgba(212,212,218,0.8)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                        type='submit'
                    >
                        {updateReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    {updateReview && (
                        <button 
                            type="button"
                            className="w-fit text-sm text-red-600 font-medium px-4 py-2 bg-red-50/40 hover:bg-red-50 _hover:bg-rgba(255,226,226,1.0) border border-red-200 rounded-sm shadow-[2px_2px_0px_0px_rgba(130,0,11,0.2)] active:shadow-[1px_1px_0px_0px_rgba(130,0,11,0.2)] active:translate-x-[1px] active:translate-y-[1px] transition-all duration-200 ease-in-out"
                            onClick={() => {setShowConfirmDelete(true)}}
                        >
                            Delete Review
                        </button>
                    )}
                </div>
            </form>

            {updateReview && (
                <DeleteOverlay 
                    deleteUrl={`http://localhost:5555/reviews/${id}`} 
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