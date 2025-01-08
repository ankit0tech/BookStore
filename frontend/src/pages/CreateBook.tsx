import { ChangeEvent, useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
// import axios from 'axios';
import api from '../utils/api';
import{ useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';


const CreateBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishYear, setPublishYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handlePriceInputChange = (e:ChangeEvent<HTMLInputElement>) => {
        const inputValue: string= e.target.value;
        
        const sanitizedValue: string = inputValue.replace(/[^0-9.]/g, '');  // Remove non-numeric part
        const decimalParts: string[] = sanitizedValue.split('.');              // Split by decimal point

        if(decimalParts.length > 1) {
            // Keep only two decimal places
            const integerPart: string = decimalParts[0];
            const decimalPart: string = decimalParts[1].slice(0, 2);
            setPrice(`${integerPart}.${decimalPart}`);
        }
        else {
            setPrice(sanitizedValue);
        }

    };

    const handleSaveBook = () => {
        try {
            
            const authToken = localStorage.getItem('authToken');
            const data = {
                title,
                author,
                publish_year: +publishYear,
                price: +price,
                category,
                cover_image: imgUrl
            };
    
            const config = {headers: { Authorization: authToken }};
            
    
            setLoading(true);
            api
            .post('http://localhost:5555/books', data, config)
            .then(() => {
                setLoading(false);
                enqueueSnackbar('Book Created Successfully', {variant: 'success'});
                navigate('/');
            })
            .catch((error) => {
                setLoading(false);
                // alert('An error happened. Please check console');
                enqueueSnackbar('Error', {variant: 'error'});
                console.log(error);
            })

        } catch(error: any) {
            enqueueSnackbar("Error while saving new book", {variant: 'error'});
        }

    }

    return (
        <div className='p-4'>
            <BackButton />
            <h1 className='text-3x1 my-4'>Create Book</h1>
            {loading ? <Spinner />:''}
            
            <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
                <label>Title</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                >
                </input>
            </div>

            <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
                <label>Author</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                >
                </input>
            </div>

            <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
                <label>Price</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={price.toString()}
                    onChange={handlePriceInputChange}
                >
                </input>
            </div>

            <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
                <label>Category</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                </input>
            </div>

            <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
                <label>Publish Year</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={publishYear}
                    onChange={(e) => setPublishYear(e.target.value)}
                >
                </input>
            </div>

            <div className='flex flex-col min-w-1/4 max-w-[300px] mx-auto'>
                <label>Cover image url</label>
                <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type= "url"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                >
                </input>
            </div>

            <div className="flex flex-col min-w-1/4 max-w-[300px] mx-auto">
                <button 
                    className="rounded-full my-4 text-white bg-purple-500 my-3 px-4 py-2 border border-gray-300 "
                    onClick={handleSaveBook}
                > 
                   Save 
                </button>
            </div>
        </div>
    );
}

export default CreateBook; 