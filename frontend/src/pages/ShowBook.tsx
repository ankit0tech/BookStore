import {useEffect, useState} from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { enqueueSnackbar } from 'notistack';
import Reviews from '../components/review/Reviews';
import { useHandleCartUpdate } from '../utils/cartUtils';
import api from '../utils/api';
import { RootState } from '../types';
import { useSelector } from 'react-redux';
import { Book } from '../types';


const ShowBook = () => {
    const [book, setBook] = useState<Book|null>(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const { handleCartUpdate } =useHandleCartUpdate();
    const isAuthenticated = useSelector((state: RootState) => state.userinfo.isAuthenticated);

    const handleAddToWishList = (id: number) => {

        api.post(`http://localhost:5555/wishlist/add/${id}`)
        .then((response) => {
            enqueueSnackbar('Added item to wishlist', { variant: 'success' });
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while adding item to wishlist', { variant: 'error' });
        });

    }

    useEffect(() => {
        setLoading(true);

        axios(`http://localhost:5555/books/${id}`)
        .then((response) => {
            setBook(response.data);
            setLoading(false);
        })
        .catch((error) => {
            enqueueSnackbar("Error while loading book data");
            setLoading(false);
        })

        // If user is logged in then add book to recently viewed
        if (isAuthenticated) {

            api.post(`http://localhost:5555/recently-viewed/add/${id}`)
            .then(() => {
            })
            .catch((error) =>{
                console.log('Error fetching recently viewed items');
            });

        }

    }, []);

    return (
        <div className='p-4'>
            <BackButton />
            <h1 className='text-3xl my-4'>Show Book</h1>
            {loading || !book ? (
                <Spinner />
            ) : (
                <div className="p-4 flex flex-row justify-between">
                    <div className='flex flex flex-col border-t-2 border-purple-500 rounded-x1 w-fit min-w-[200px] p-4 md:ml-20'>
                        <div className='my-4'>
                            <span className='text-xl mr-4 text-grey-500'>Title:</span>
                            <span>{book.title}</span>
                        </div>
                        <div className='my-4'>
                            <span className='text-xl mr-4 text-grey-500'>Author:</span>
                            <span>{book.author}</span>
                        </div>
                        <div className='my-4'>
                            <span className='text-xl mr-4 text-grey-500'>Publish Year:</span>
                            <span>{book.publish_year}</span>
                        </div>
                        <div className='my-4'>
                            <span className='text-xl mr-4 text-grey-500'>Price:</span>
                            <span>{book.price}</span>
                        </div>
                        <div className='my-4'>
                            <span className='text-xl mr-4 text-grey-500'>Category:</span>
                            <span>{book.category.title}</span>
                        </div>
                        <div className='my-4'>
                            <button
                                className="mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700"
                                onClick={() => handleCartUpdate(Number(book.id), 1)}
                            >Add to cart</button>
                            <button
                                className="mx-2 mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700"
                                onClick={() => handleAddToWishList(Number(book.id))}
                            >Add to wishlist</button>
                        </div>
                    </div>

                    <div className='m-4 md:mr-20'>
                        <Reviews averageRating={book.average_rating}id={Number(book.id)} />
                    </div>
                </ div>
            )}
        </div>
    );
}

export default ShowBook;