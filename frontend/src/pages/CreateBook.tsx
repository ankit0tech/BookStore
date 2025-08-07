import React, { ChangeEvent, useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import api from '../utils/api';
import{ useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Category } from '../types';

const CreateBook = () => {
    const {id} = useParams();
    const [title, setTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [publishYear, setPublishYear] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [price, setPrice] = useState<string>('');
    const [categories, setCategories] = useState<Category[]|null>([]);
    const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
    const [imgUrl, setImgUrl] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isbn, setIsbn] = useState<string>('');
    const [publisher, setPublisher] = useState<string>('');
    const [language, setLanguage] = useState<string>('');
    const [pages, setPages] = useState<string>('');
    const [format, setFormat] = useState<string>('');
    const [quantity, setQuantity] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [shelfLocation, setShelfLocation] = useState<string>('');
    const [sku, setSku] = useState<string>('');

    const [updateBook, setUpdateBook] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 200}, (_, i) => currentYear - i);

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

    const validateForm = ():boolean => {
        
        const newErrors: Record<string, string> = {};

        if(!title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if(!author.trim()) {
            newErrors.author = 'Author is required';
        }

        if(isNaN(Number(publishYear))) {
            newErrors.publishYear = 'Publish year is requred';
        }

        if(isNaN(Number(price)) || Number(price) < 0) {
            newErrors.price = 'Price is invalid';
        }

        if(isNaN(Number(selectedCategory)) || Number(selectedCategory) <= 0) {
            newErrors.selectedCategory = 'Category is invalid';
        }

        if(pages != '' && (isNaN(Number(pages)) || Number(pages) <= 0)) {
            newErrors.pages = 'Invalid number of pages'
        }
        
        if(quantity && (isNaN(Number(quantity)) || Number(quantity) <= 0)) {
            newErrors.quantity = 'Quantity is invlaid';
        }



        

        if(!imgUrl.trim()) {
            newErrors.imgUrl = 'Cover image URL is required';
        } else {
            try {
                new URL(imgUrl);
            } catch(error) {
                newErrors.imgUrl = 'Please enter valid URL';
            }
        }

        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSaveBook = (e: React.FormEvent) => {
        e.preventDefault();
        
        if(!validateForm()) {
            return;
        }
        
        const data = {
            title,
            author,
            publish_year: Number(publishYear),
            price: Number(price),
            category_id: Number(selectedCategory),
            cover_image: imgUrl,
            description: description,
            isbn: isbn,
            publisher: publisher,
            language: language,
            pages: Number(pages),
            format: format,
            quantity: Number(quantity),
            is_active: isActive,
            shelf_location: shelfLocation,
            sku: sku
        };
        
        console.log(data);
        
        const apiCall = updateBook ? 
            api.put(`http://localhost:5555/books/${id}`, data)
            :
            api.post('http://localhost:5555/books', data);

        setLoading(true);

        apiCall
        .then(() => {
            enqueueSnackbar('Success', {variant: 'success'});
            navigate(-1);
        })
        .catch((error) => {
            console.error(error);
            enqueueSnackbar(error.response?.data?.message || 'An error occurred', {variant: 'error'});
        }).finally(() => {
            setLoading(false);
        });

    }

    const fetchCategories = () => {
        api.get('http://localhost:5555/categories')
        .then((response) => {
            const categories = response.data.data;
            setCategories(categories);
            
            // set default category when no category is selected and categories exist
            if(!selectedCategory && categories?.length > 0) {
                if(categories[0].sub_category.length > 0) {
                    setSelectedCategory(categories[0].sub_category[0].id.toString());
                }
            }
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while fetching categories', { variant: 'error' });
        });
    }

    const fetchBook = (id: string) => {
        setLoading(true);
        
        api.get(`http://localhost:5555/books/${id}`)
        .then((response) => {
            setUpdateBook(true);

            setTitle(response.data.title);
            setAuthor(response.data.author);
            setPublishYear(response.data.publish_year.toString());
            setPrice(response.data.price.toString());
            setSelectedCategory(response.data.category_id?.toString() || null);
            setImgUrl(response.data.cover_image);
            setDescription(response.data.description);
            setIsbn(response.data.isbn);
            setPublisher(response.data.publisher);
            setLanguage(response.data.language);
            setPages(response.data.pages);
            setFormat(response.data.format);
            setQuantity(response.data.quantity);
            setIsActive(response.data.is_active);
            setShelfLocation(response.data.shelf_location);
            setSku(response.data.sku);

            setLoading(false);
        })
        .catch((error)=>{
            setLoading(false);
            enqueueSnackbar('Error occurred while editing book', {variant: 'error'});
            console.error(error);
        });
    }

    useEffect(()=>{
        fetchCategories();
    }, []);
    useEffect(() => {
        if(id) {
            fetchBook(id);
        }
    }, [id])

    return (
        <div className='p-4 max-w-2xl mx-auto'>
            <h1 className='my-4 text-2xl font-semibold'>Create Book</h1>
            {loading ? <Spinner />:''}

            <form className='space-y-6' onSubmit={handleSaveBook}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Title</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            >
                        </input>
                        { formErrors.title && (<p className='text-sm text-red-500 mt-1'> {formErrors.title} </p>)}
                    </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Author</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.author ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        >
                        </input>
                        { formErrors.author && (<p className='text-sm text-red-500 mt-1'> {formErrors.author} </p>)}
                   </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Price</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={price.toString()}
                            onChange={handlePriceInputChange}
                        >
                        </input>
                        { formErrors.price && (<p className='text-sm text-red-500 mt-1'> {formErrors.price} </p>)}
                   </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Select Category</label>
                        <select
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.selectedCategory ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
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
                        { formErrors.selectedCategory && (<p className='text-sm text-red-500 mt-1'> {formErrors.selectedCategory} </p>)}

                    </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Publish Year</label>
                        <select 
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.publishYear ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            value={publishYear || ''}
                            onChange={(e) => setPublishYear(e.target.value)}
                        >
                            <option value="">Select Year</option>
                            {years.map((year) => (
                                <option value={year} key={year}>{year}</option>
                            ))}
                        </select>

                        { formErrors.publishYear && (<p className='text-sm text-red-500 mt-1'> {formErrors.publishYear} </p>)}
                    </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Cover image url</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.imgUrl? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type= "url"
                            value={imgUrl}
                            onChange={(e) => setImgUrl(e.target.value)}
                        >
                        </input>
                        { formErrors.imgUrl && (<p className='text-sm text-red-500 mt-1'> {formErrors.imgUrl} </p>)}
                    </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Description</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.description? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        >
                        </input>
                        { formErrors.description && (<p className='text-sm text-red-500 mt-1'> {formErrors.description} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>ISBN</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.isbn? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                        >
                        </input>
                        { formErrors.isbn && (<p className='text-sm text-red-500 mt-1'> {formErrors.isbn} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Publisher</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.publisher? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                        >
                        </input>
                        { formErrors.publisher && (<p className='text-sm text-red-500 mt-1'> {formErrors.publisher} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Language</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.language? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                        </input>
                        { formErrors.language && (<p className='text-sm text-red-500 mt-1'> {formErrors.language} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Pages</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.pages? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="number"
                            min={0}
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                        >
                        </input>
                        { formErrors.pages && (<p className='text-sm text-red-500 mt-1'> {formErrors.pages} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Format</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.format? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="text"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                        >
                        </input>
                        { formErrors.format && (<p className='text-sm text-red-500 mt-1'> {formErrors.format} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Quantity</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.quantity? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type="number"
                            min={0}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        >
                        </input>
                        { formErrors.quantity && (<p className='text-sm text-red-500 mt-1'> {formErrors.quantity} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Book Status</label>
                        <div className='flex items-center mt-2 space-x-3'>
                            <button 
                                className={`inline-flex items-center rounded-full transition-colors w-11 h-6 ${isActive ? 'bg-blue-600' : 'bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                                type='button'  
                                onClick={() => setIsActive(!isActive)}  
                            >
                                <span className={`inlne-block rounded-full h-4 w-4 bg-white transform transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}></span>
                            </button>
                            <span className={`text-md ${isActive ? 'text-green-500' : 'text-gray-500'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        {formErrors.isActive && (
                            <p className='text-sm text-red-500 mt-1'>{formErrors.isActive}</p>
                        )}
                    </div>

                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Shelf Location</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.shelfLocation? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type='text'
                            value={shelfLocation}
                            onChange={(e) => setShelfLocation(e.target.value)}
                        >
                        </input>
                        { formErrors.shelfLocation && (<p className='text-sm text-red-500 mt-1'> {formErrors.shelfLocation} </p>)}
                    </div>
                    <div className=''>
                        <label className='text-sm font-semibold text-gray-600'>Stock Keeping Unit (SKU)</label>
                        <input
                            className={`w-full rounded-lg mt-2 px-4 py-2 border ${formErrors.sku? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-400`}
                            type='text'
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                        >
                        </input>
                        { formErrors.sku && (<p className='text-sm text-red-500 mt-1'> {formErrors.sku} </p>)}
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