import React, { ChangeEvent, useEffect, useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
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

    const handleSaveBook = (e: React.FormEvent) => {
        e.preventDefault();
        
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
        <div className='p-4 max-w-2xl mx-auto'>
            <h1 className='my-4 text-2xl font-semibold'>Create Book</h1>
            {loading ? <Spinner />:''}

            <form className='space-y-6' onSubmit={handleSaveBook}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    
                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>Title</label>
                        <input
                            className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            >
                        </input>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>Author</label>
                        <input
                            className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        >
                        </input>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>Price</label>
                        <input
                            className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                            type="text"
                            value={price.toString()}
                            onChange={handlePriceInputChange}
                        >
                        </input>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>Select Category</label>
                        <select
                            className='w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-400'
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

                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>Publish Year</label>
                        <input
                            className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                            type="text"
                            value={publishYear}
                            onChange={(e) => setPublishYear(e.target.value)}
                            >
                        </input>
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-semibold text-gray-600'>Cover image url</label>
                        <input
                            className="w-full rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:border-blue-400"
                            type= "url"
                            value={imgUrl}
                            onChange={(e) => setImgUrl(e.target.value)}
                        >
                        </input>
                    </div>
                </div>

                <div className="flex flex-row justify-end gap-2">
                    <button
                        className='rounded-lg px-4 py-2 my-2 border border-gray-300 hover:bg-gray-50'
                        type='button'
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="rounded-lg px-4 py-2 my-2 text-white bg-purple-500 border border-gray-300 hover:bg-purple-600"
                        type='submit'
                    > 
                        Save 
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateBook; 