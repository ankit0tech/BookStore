import {useEffect, useState} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { enqueueSnackbar } from 'notistack';
import Reviews from '../components/review/Reviews';
import { useHandleCartUpdate } from '../utils/cartUtils';
import api from '../utils/api';
import { UserBook, AdminBook, RootState } from '../types';
import { useSelector } from 'react-redux';
import { MdOutlineDelete } from 'react-icons/md';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { formatPrice } from '../utils/formatUtils';


const ShowBook = () => {
    const [book, setBook] = useState<UserBook|AdminBook|null>(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const { handleCartUpdate } =useHandleCartUpdate();
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const [selectedOffer, setSelectedOffer] = useState<number|null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const isAdminRoute: boolean = location.pathname.includes('/admin-dashboard');
    const showAdminFeatures: boolean = isAdminRoute && (userinfo.userRole == 'admin' || userinfo.userRole == 'superadmin');

    const isAdminBook = (book: UserBook|AdminBook): book is AdminBook => {
        return 'quantity' in book && 'is_active' in book;
    }

    const handleAddToWishList = (id: number) => {
        api.post(`/wishlist/add/${id}`)
        .then((response) => {
            enqueueSnackbar(response.data.message, { variant: 'success' });
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while adding item to wishlist', { variant: 'error' });
        });
    }

    const handleRemoveOffer = (offerId: number) => {
        const data = {
            "offerId": offerId,
        }

        api.delete(`/books/remove-offer/${id}`, { data })
        .then((response) => {
            console.log(response);
            enqueueSnackbar('Offer removed successfully', { variant: "success" });
            fetchBook();
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while removing offer', { variant: "error" });
        });
    }

    const fetchBook = () => {
        api(`/books/${id}`)
        .then((response) => {
            console.log(response.data);
            setBook(response.data);
            setLoading(false);
        })
        .catch((error) => {
            enqueueSnackbar("Error while loading book data");
            setLoading(false);
        });
    }

    useEffect(() => {
        setLoading(true);
        fetchBook();

        // If user is logged in then add book to recently viewed
        if (userinfo.isAuthenticated) {
            api.post(`/recently-viewed/add/${id}`)
            .then(() => {
            })
            .catch((error) =>{
                console.log('Error fetching recently viewed items');
            });
        }
    }, [id]);

    return (
        <div className='p-4'>
            {loading || !book ? (
                <Spinner />
            ) : (
                <div className="flex flex-col min-w-[280px] max-w-6xl">
                    <div className='flex flex-col md:flex-row p-4 shrink-0 gap-4 justify-between'>
                        <div className='flex flex-col sm:flex-row gap-6'>
                            <div className='relative _h-96 _w-72 sm:h-72 sm:w-56 bg-gray-100 flex items-center justify-center shrink-0 rounded-lg transition-all duration-200'>
                                <img
                                    src={book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                                    alt={book.title}
                                    className='object-cover max-w-full max-h-full p-2'
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                                    }}
                                >
                                </img>
                                <div>
                                    {!book.is_available && 
                                        <p className='absolute -top-2 -right-4 my-1 px-2 py-1 text-xs text-red-700 font-medium rounded-full size-fit bg-red-200'>
                                            Unavailable
                                        </p>
                                    }
                                </div>
                            </div>

                            <div className='flex flex-col'>
                                <h2 className='text-2xl text-gray-950 font-semibold'>
                                    {book.title}
                                </h2>
                                <p className='pb-2 text-gray-700 text-sm'>
                                    by {book.author}
                                </p>
                                <p className='py-1 text-gray-800 text-md'>
                                    {book.description}
                                </p>
                                <p className='text-gray-700 text-sm'>
                                    {book.category?.title || 'Uncategorized'}
                                </p>
                                

                                <div className='pb-1 flex items-center text-gray-700 gap-2'>
                                    {/* <span className='inline-block text-sm'>Rating:</span> */}
                                    <span className="inline-block my-1 inline-flex gap-1 items-center">
                                        {[...Array(5)].map((_, index) => (
                                            index < book.average_rating ?
                                            <FaStar key={index} className="text-yellow-400" /> :
                                            <FaRegStar key={index} className="text-gray-300" />
                                        ))}
                                    <span className='px-1 text-sm'>({book.average_rating}/5)</span>
                                    </span>
                                </div>
                                
                                <p className='font-semibold text-gray-800 text-xl'>
                                    {formatPrice(book.price, book.currency)}
                                </p>
                            </div>
                        </div>

                        <div className="w-[200px]">
                            { book.special_offers?.length !=0 && (
                            <div className=''>
                                { showAdminFeatures ? 
                                    (<>
                                        <div className='font-medium py-2'>Offers:</div>
                                        <ul className='flex flex-col gap-1 text-gray-700 text-sm'>
                                            { book.special_offers?.map((offer) => (
                                                <li key={offer.id} className='flex flex-row items-center justify-between gap-x-4'>
                                                    <label htmlFor={offer.id.toString()}>{offer.offer_type} - {offer.discount_percentage}% </label>
                                                    <button
                                                        className='rounded-full text-red-500 hover:text-red-600 hover:scale-105 active:scale-98 transition-all duration-200'
                                                        onClick={() => handleRemoveOffer(offer.id)}
                                                    >
                                                        <MdOutlineDelete className='text-xl _hover:scale-105 ease-in-out transition-all duration-200' /> 
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </>)
                                    :
                                    (<>
                                        <div className='font-medium py-2'>Select one offer: </div> 
                                        <ul className='flex flex-col gap-1 items-start text-gray-700 text-sm'>
                                            { book.special_offers?.map((offer) => (
                                                <li key={offer.id} className='flex flex-row items-center justify-between gap-x-4'> 
                                                    <div className='flex flex-row justify-center items-center gap-2'>
                                                        <input 
                                                            className="appearance-none bg-white color-current w-[14px] h-[14px] border-[1.5px] border-gray-800 rounded-full grid place-items-center 
                                                                        before:content-[''] before:w-[8px] before:h-[8px] before:rounded-full before:scale-0 before:bg-amber-600 before:inset-shadow-[8px_8px_0px_0px] before:inset-shadow-amber-600 
                                                                        checked:before:scale-100 before:transition-transform before:duration-200"
                                                            type='radio' 
                                                            id={offer.id.toString()} 
                                                            value={offer.id}
                                                            checked={selectedOffer?.toString() === offer.id.toString()}
                                                            onChange={(e) => setSelectedOffer(Number(e.target.value))}
                                                        ></input>
                                                        <label htmlFor={offer.id.toString()}>{offer.offer_type} - {offer.discount_percentage}% </label>
                                                    </div>
                                                </li>
                                            ))}

                                        </ul>
                                        {(book.special_offers && selectedOffer) && 
                                            <button 
                                                className='text-sm text-gray-400 hover:text-gray-500' 
                                                onClick={() => setSelectedOffer(null)}
                                            > Clear offer </button> 
                                        }
                                    </>)
                                }
                            </div>)
                            }

                            <div className='flex flex-col my-4 gap-2'>
                                { showAdminFeatures ?
                                    <button 
                                        // className="px-4 py-2 border-1 border-sky-200 hover:border-sky-300 rounded-md font-medium text-sm text-blue-600 bg-sky-50 hover:bg-sky-100 active:scale-99 ease-in-out transition-all duration-200"
                                        className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                        onClick={() => navigate(`/admin-dashboard/books/add-offer/${book.id}`, {state: {book: book}})}
                                    >
                                        Add new offer
                                    </button>
                                    :
                                    <>
                                        {book.is_available && <button
                                            // className="px-4 py-2 border-1 border-sky-200 hover:border-sky-300 rounded-md font-medium text-sm text-blue-600 bg-sky-50 hover:bg-sky-100 active:scale-99 ease-in-out transition-all duration-200"
                                            className="w-full py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                            onClick={() => handleCartUpdate(Number(book.id), 1, selectedOffer)}
                                        >Add to cart</button>}
                                        <button
                                            // className="px-4 py-2 border-1 border-sky-200 hover:border-sky-300 rounded-md font-medium text-sm text-blue-600 bg-sky-50 hover:bg-sky-100 active:scale-99 ease-in-out transition-all duration-200"
                                            className="w-full py-2 px-4 font-medium text-gray-800 hover:text-gray-900 hover:bg-orange-50 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                                            onClick={() => handleAddToWishList(Number(book.id))}
                                        >Add to wishlist</button>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div className='m-2 p-2'>
                        <h2 className='pb-4 text-xl font-semibold text-gray-900'>Book Details:</h2>
                        <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-w-64'>
                            <div className='max-w-100'>
                                <p className='text-gray-800 text-lg font-medium'>Basic Information:</p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Published:</span><span className='font-semibold'>{book.publish_year}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>ISBN:</span><span className='font-semibold'>{book.isbn}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Pages:</span><span className='font-semibold'>{book.pages}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Format:</span><span className='font-semibold'>{book.format}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Language:</span><span className='font-semibold'>{book.language}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Publisher:</span><span className='font-semibold'>{book.publisher}</span>
                                </p>
                            </div>
                        
                            { showAdminFeatures && isAdminBook(book) && (
                                <div className='max-w-100'>
                                    <p className='text-gray-800 text-lg font-medium'>Inventory Information:</p>
                                    <p className='flex justify-between my-1 text-sm'>
                                        <span className='text-gray-600'>Status:</span>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${book.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{book.is_active ? 'Active' : 'Inactive'}</span>
                                    </p>
                                    <p className='flex justify-between my-1 text-sm'>
                                        <span className='text-gray-600'>Quantity:</span><span className='font-semibold'>{book.quantity}</span>
                                    </p>
                                    <p className='flex justify-between my-1 text-sm'>
                                        <span className='text-gray-600'>Purchase Count:</span><span className='font-semibold'>{book.purchase_count}</span>
                                    </p>
                                    <p className='flex justify-between my-1 text-sm'>
                                        <span className='text-gray-600'>Shelf Location:</span><span className='font-semibold'>{book.shelf_location}</span>
                                    </p>
                                    <p className='flex justify-between my-1 text-sm'>
                                        <span className='text-gray-600'>SKU:</span><span className='font-semibold'>{book.sku}</span>
                                    </p>
                                </div>
                            )}

                            <div className='max-w-100'>
                                <p className='text-gray-800 text-lg font-medium'>Policies:</p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Cancellable:</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${book.is_cancellable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{book.is_cancellable ? 'Yes' : 'No'}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Cancellation Hours:</span><span className='font-semibold'>{book.cancellation_hours}</span>
                                </p>
                                {book.cancellation_policy && <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Cancellation Policy:</span><span className='font-semibold'>{book.cancellation_policy}</span>
                                </p>}

                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Returnable:</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${book.is_returnable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>{book.is_returnable ? 'Yes' : 'No'}</span>
                                </p>
                                <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Return days:</span><span className='font-semibold'>{book.return_days}</span>
                                </p>
                                {book.cancellation_policy && <p className='flex justify-between my-1 text-sm'>
                                    <span className='text-gray-600'>Return Policy:</span><span className='font-semibold'>{book.return_policy}</span>
                                </p>}
                            </div>
                        </div>
                    </div>

                    <div className='m-2 p-2'>
                        <Reviews id={Number(book.id)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShowBook;