import { useEffect, useState } from "react";
import api from "../utils/api";
import { enqueueSnackbar } from "notistack";
import {  useNavigate, useParams } from "react-router-dom";


const AddReview = () => {

    // rating and review text
    const { id } = useParams();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [updateBook, setUpdateBook] = useState(false);
    const navigate = useNavigate();

    useEffect( ()=> {
          
        api.get(`http://localhost:5555/review/book/${id}/user`)
        .then((response) =>{
            if (response.data) {
                setUpdateBook(true);
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
        
        // try {
            const apiCall = updateBook ? 
            api.put(`http://localhost:5555/review/${id}`, data) 
            :
            api.post(`http://localhost:5555/review/${id}`, data)

            apiCall
                .then((response) =>{
                    // console.log(response);
                    // setRating(response.data.rating);
                    // setReview(response.data.review_text);
                    enqueueSnackbar('Updated revew successfully', {variant: 'success'});
                    navigate(-1);
                })
                .catch((error: any) => {
                    console.log(error.message);
                    enqueueSnackbar('Issue in adding review', {variant: 'error'});
                });

        // } catch(e: any) {
        //     console.log(e);
        //     enqueueSnackbar('Issue in adding review', {variant: 'error'});
        // }
    }

    return (
        <form 
            className="p-4 flex flex-col min-w-1/4 max-w-[300px] mx-auto"  
            onSubmit={handleSubmit}>
        
                <label htmlFor="rating">Overall Rating:</label>
                <input 
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    id='rating'
                    type='number'
                    name='number'
                    min='1'
                    max='5'
                    value={rating.toString()} 
                    onChange={(e) => {setRating(Number(e.target.value))}}>

                </input>
                
                <label htmlFor="review_text">Review:</label>
                <textarea 
                    className="h-40 appearance-none rounded-lg my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    id='review_text'
                    name='review_text'
                    value={review}
                    onChange={(e) => {setReview(e.target.value)}}>

                </textarea>
                
                <button 
                    className="rounded-full mt-2 text-white bg-purple-500 px-4 py-2 border border-gray-300"
                    type='submit'>
                        Save
                </button>
        </form>
    );
}

export default AddReview;