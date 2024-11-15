import {useEffect, useState} from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';


interface BookState {
    id: string;
    title: string;
    author: string;
    publishYear: string;
    price: number;
    category: string;
}

const ShowBook = () => {
    const [book, setBook] = useState<BookState>({id:'', title:'', author: '', publishYear: '', price: 0, category:''});
    const [loading, setLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        setLoading(true);

        axios(`http://localhost:5555/books/${id}`)
        .then((response) => {
            console.log("BOOK");
            console.log(response.data);
            setBook(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
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
                <div className='flex flex flex-col border-t-2 border-purple-500 rounded-x1 w-fit p-4'>
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
                        <span>{book.publishYear}</span>
                    </div>
                    <div className='my-4'>
                        <span className='text-xl mr-4 text-grey-500'>Price:</span>
                        <span>{book.price}</span>
                    </div>
                    <div className='my-4'>
                        <span className='text-xl mr-4 text-grey-500'>Category:</span>
                        <span>{book.category}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShowBook;