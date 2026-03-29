import React, { ChangeEvent, useEffect, useState } from 'react';
import Spinner from '../components/Spinner';
import api from '../utils/api';
import{ useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Category } from '../types';
import DropDownMenu from '../components/DropDownMenu';
import CategoryGroupDropDownMenu from '../components/CategoryGroupDropDownMenu';
import { prettifyString } from '../utils/formatUtils';

const CreateBook = () => {
    const {id} = useParams();
    const [title, setTitle] = useState<string>('');
    const [author, setAuthor] = useState<string>('');
    const [publishYear, setPublishYear] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [price, setPrice] = useState<string>('');
    const [categories, setCategories] = useState<Category[]|null>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
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
    const years = Array.from({ length: 200}, (_, i) => (currentYear - i).toString());

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

        if(selectedCategory && (isNaN(Number(selectedCategory)) || Number(selectedCategory) <= 0)) {
            newErrors.selectedCategory = 'Category is invalid';
        }

        if(pages != '' && (isNaN(Number(pages)) || Number(pages) <= 0)) {
            newErrors.pages = 'Invalid number of pages'
        }
        
        if(quantity && (isNaN(Number(quantity)) || Number(quantity) < 0)) {
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
            price: Number(price) * 100,
            category_id: selectedCategory ? Number(selectedCategory) : null,
            cover_image: imgUrl,
            description: description.trim() || undefined,
            isbn: isbn.trim() || undefined,
            publisher: publisher.trim() || undefined,
            language: language.trim() || undefined,
            pages: pages.trim() ? Number(pages): undefined,
            format: format.trim() || undefined,
            quantity: Number(quantity),
            is_active: isActive,
            shelf_location: shelfLocation.trim() || undefined,
            sku: sku.trim() || undefined
        };
        
        const apiCall = updateBook ? 
            api.put(`/books/${id}`, data)
            :
            api.post('/books', data);

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
        api.get('/categories')
        .then((response) => {
            const categories = response.data.data;
            setCategories(categories);
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while fetching categories', { variant: 'error' });
        });
    }

    const fetchBook = (id: string) => {
        setLoading(true);
        
        api.get(`/books/${id}`)
        .then((response) => {
            setUpdateBook(true);

            setTitle(response.data.title);
            setAuthor(response.data.author);
            setPublishYear(response.data.publish_year.toString());
            setPrice(response.data.price.toString());
            setSelectedCategory(response.data.category_id?.toString() || null);
            setImgUrl(response.data.cover_image);
            setDescription(response.data.description || '');
            setIsbn(response.data.isbn || '');
            setPublisher(response.data.publisher || '');
            setLanguage(response.data.language || '');
            setPages(response.data.pages?.toString() || '');
            setFormat(response.data.format || '');
            setQuantity(response.data.quantity.toString() || '0');
            setIsActive(response.data.is_active);
            setShelfLocation(response.data.shelf_location || '');
            setSku(response.data.sku || '');

            setLoading(false);
        })
        .catch((error)=>{
            setLoading(false);
            enqueueSnackbar('Error occurred while editing book', {variant: 'error'});
            console.error(error);
        });
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if(id) {
            fetchBook(id);
        }
    }, [id])

    return (
        <div className='p-2 md:p-4 flex flex-col gap-4 max-w-2xl mx-auto'>
            <h1 className='text-xl font-semibold text-gray-900'>Create Book</h1>
            {loading ? <Spinner />:''}

            <form 
                className='flex flex-col gap-4' 
                onSubmit={handleSaveBook}
            >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-title'
                        >Title</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            >
                        </input>
                        { formErrors.title && (<p className='text-sm text-red-500 mt-1'> {formErrors.title} </p>)}
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-author'
                        >Author</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id='input-author'
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        >
                        </input>
                        { formErrors.author && (<p className='text-sm text-red-500 mt-1'> {formErrors.author} </p>)}
                   </div>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-price'
                        >Price</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id='input-price'
                            value={price.toString()}
                            onChange={handlePriceInputChange}
                        >
                        </input>
                        { formErrors.price && (<p className='text-sm text-red-500 mt-1'> {formErrors.price} </p>)}
                   </div>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-category'
                        >Select Category</label>
                        
                        <CategoryGroupDropDownMenu 
                            title='Select Category'
                            defaultValue='None (No Category)'
                            selectedOptionStatus={selectedCategory}
                            setSelectedOptionStatus={setSelectedCategory}
                            options={categories}
                            getLabel={prettifyString}                        
                        />
                        { formErrors.selectedCategory && (<p className='text-sm text-red-500 mt-1'> {formErrors.selectedCategory} </p>)}
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-publish-year'
                        >Publish Year</label>
                        <DropDownMenu
                            title="Publish Year"
                            // defaultValue="All Statuses"
                            selectedOptionStatus={publishYear || ''} 
                            setSelectedOptionStatus={setPublishYear}
                            options={years}
                            // getLabel={(status) => prettifyString(status)}
                        />

                        { formErrors.publishYear && (<p className='text-sm text-red-500 mt-1'> {formErrors.publishYear} </p>)}
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-image'
                        >Cover image url</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type= "url"
                            id="input-image"
                            value={imgUrl}
                            onChange={(e) => setImgUrl(e.target.value)}
                        >
                        </input>
                        { formErrors.imgUrl && (<p className='text-sm text-red-500 mt-1'> {formErrors.imgUrl} </p>)}
                    </div>

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-description'
                        >Description</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        >
                        </input>
                        { formErrors.description && (<p className='text-sm text-red-500 mt-1'> {formErrors.description} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-isbn'
                        >ISBN</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-isbn"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                        >
                        </input>
                        { formErrors.isbn && (<p className='text-sm text-red-500 mt-1'> {formErrors.isbn} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-publisher'
                        >Publisher</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-publisher"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                        >
                        </input>
                        { formErrors.publisher && (<p className='text-sm text-red-500 mt-1'> {formErrors.publisher} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-language'
                        >Language</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id="input-language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                        >
                        </input>
                        { formErrors.language && (<p className='text-sm text-red-500 mt-1'> {formErrors.language} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-pages'
                        >Pages</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="number"
                            id='input-pages'
                            min={0}
                            step={1}
                            value={pages}
                            onChange={(e) => setPages(e.target.value)}
                        >
                        </input>
                        { formErrors.pages && (<p className='text-sm text-red-500 mt-1'> {formErrors.pages} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-format'
                        >Format</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="text"
                            id='input-format'
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                        >
                        </input>
                        { formErrors.format && (<p className='text-sm text-red-500 mt-1'> {formErrors.format} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-quantity'
                        >Quantity</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type="number"
                            id='input-quantity'
                            min={0}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        >
                        </input>
                        { formErrors.quantity && (<p className='text-sm text-red-500 mt-1'> {formErrors.quantity} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label className='block text-sm font-semibold text-gray-700'>Book Status</label>
                        <div className='flex items-center mt-2 space-x-3'>
                            <button 
                                className={`inline-flex items-center rounded-full transition-colors w-11 h-6 ${isActive ? 'bg-blue-600' : 'bg-gray-200'} focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
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

                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-self-location'
                        >Shelf Location</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type='text'
                            id="input-self-location"
                            value={shelfLocation}
                            onChange={(e) => setShelfLocation(e.target.value)}
                        >
                        </input>
                        { formErrors.shelfLocation && (<p className='text-sm text-red-500 mt-1'> {formErrors.shelfLocation} </p>)}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <label 
                            className='block text-sm font-semibold text-gray-700'
                            htmlFor='input-sku'    
                        >Stock Keeping Unit (SKU)</label>
                        <input
                            className="appearance-none rounded-sm px-4 py-2 border border-gray-300 hover:border-gray-400 focus:border-sky-400 focus:outline-hidden transition-colors duration-200"
                            type='text'
                            id='input-sku'
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                        >
                        </input>
                        { formErrors.sku && (<p className='text-sm text-red-500 mt-1'> {formErrors.sku} </p>)}
                    </div>

                </div>

                <div className=" flex flex-row justify-end gap-4">
                    <button
                        className="w-fit py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        className="w-fit py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                </div>


                {/* <div className="flex flex-row justify-end gap-2">
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
                </div> */}
            </form>
        </div>
    );
}

export default CreateBook; 