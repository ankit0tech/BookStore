import { ChangeEvent, useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
// import axios from 'axios';
import api from '../utils/api';
import{ useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Category } from '../types';


const CreateBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publishYear, setPublishYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState('');
    const [categories, setCategories] = useState<Category[]|null>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
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
            
            const data = {
                title,
                author,
                publish_year: Number(publishYear),
                price: Number(price),
                category_id: Number(selectedCategory),
                cover_image: imgUrl
            };
            
            console.log(data);
    
            setLoading(true);
            api
            .post('http://localhost:5555/books', data)
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

    const fetchCategories = () => {
        api.get('http://localhost:5555/category')
        .then((response) => {
            setCategories(response.data.data);
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while fetching categories', { variant: 'error' });
        });
    }

    useEffect(()=>{
        fetchCategories();
    }, []);

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
                <label>Select Category</label>
                <select
                    value={selectedCategory || ""}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={!categories?.length}
                >
                    { categories?.map((category) => (
                        <optgroup key={category.id} label={category.title}>
                            {category.sub_category.map((sub)=> (
                                <option key={sub.id} value={sub.id}>{sub.title}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                {/* <input
                    className="appearance-none rounded-full my-2 px-4 py-2 border border-gray-300 focus:outline-none focus:border-gray-500"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                </input> */}
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