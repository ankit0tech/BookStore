import {useEffect, useState} from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { enqueueSnackbar } from 'notistack';
import Reviews from '../components/review/Reviews';
import { useHandleCartUpdate } from '../utils/cartUtils';


interface BookState {
    id: string;
    title: string;
    author: string;
    publish_year: string;
    price: number;
    category: string;
}

const ShowBook = () => {
    const [book, setBook] = useState<BookState>({id:'', title:'', author: '', publish_year: '', price: 0, category:''});
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const { handleCartUpdate } =useHandleCartUpdate();

    const handleAddToWishList = (id: number) => {
        console.log("Add item to wishlist");
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

    }, []);

    return (
        <div className='p-4'>
            <BackButton />
            <h1 className='text-3xl my-4'>Show Book</h1>
            {loading ? (
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
                            <span>{book.category}</span>
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
                        <Reviews id={Number(book.id)} />
                    </div>
                </ div>
            )}
        </div>
    );
}

export default ShowBook;