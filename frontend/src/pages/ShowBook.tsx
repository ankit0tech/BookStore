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

        api.post(`http://localhost:5555/wishlist/add/${id}`)
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

        api.delete(`http://localhost:5555/books/remove-offer/${id}`, { data })
        .then((response) => {
            console.log(response);
            enqueueSnackbar('Offer removed successfully', { variant: "success" });
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while removing offer', { variant: "error" });
        });
    }

    useEffect(() => {
        setLoading(true);

        api(`http://localhost:5555/books/${id}`)
        .then((response) => {
            console.log(response.data);
            setBook(response.data);
            setLoading(false);
        })
        .catch((error) => {
            enqueueSnackbar("Error while loading book data");
            setLoading(false);
        })

        // If user is logged in then add book to recently viewed
        if (userinfo.isAuthenticated) {

            api.post(`http://localhost:5555/recently-viewed/add/${id}`)
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
                <div className="flex flex-col">
                    <div className='flex flex min-w-[200px] p-4 shrink-0 gap-4 justify-between max-w-6xl'>
                        <div className='flex flex-row gap-6'>
                            <div className='relative h-72 w-56 bg-gray-100 flex items-center justify-center shrink-0 rounded-lg'>
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className='object-contain max-w-full max-h-full'
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
                                <h2 className='text-3xl font-semibold'>
                                    {book.title}
                                </h2>
                                <p className='pb-4 text-gray-700 text-sm'>
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
                                
                                <p className='font-semibold py-2 text-3xl'>
                                    &#8377;{book.price}
                                </p>
                            </div>
                        </div>

                        <div className="min-w-[300px]">
                            { book.special_offers?.length !=0 && (
                            <div className=''>
                                { showAdminFeatures ? 
                                    (<>
                                        <div className='font-medium py-2'>Offers:</div>
                                        <ul className='text-gray-700 text-sm space-y-0.5'>
                                            { book.special_offers?.map((offer) => (
                                                <li key={offer.id} className='flex flex-row items-center justify-between gap-x-4'>
                                                    <label htmlFor={offer.id.toString()}>{offer.offer_type} - {offer.discount_percentage} % </label>
                                                </li>
                                            ))}
                                        </ul>
                                    </>) 
                                : 
                                    (<>
                                        <div className='font-medium py-2'>Select one offer: </div> 
                                        <ul className='text-gray-700 text-sm space-y-0.5'>
                                            { book.special_offers?.map((offer) => (
                                                <li key={offer.id} className='flex flex-row items-center justify-between gap-x-4'> 
                                                    <div className='flex flex-row justify-center gap-2'>
                                                        <input 
                                                            type='radio' 
                                                            id={offer.id.toString()} 
                                                            value={offer.id}
                                                            checked={selectedOffer?.toString() === offer.id.toString()}
                                                            onChange={(e) => setSelectedOffer(Number(e.target.value))} 
                                                        ></input>
                                                        <label htmlFor={offer.id.toString()}>{offer.offer_type} - {offer.discount_percentage} % </label>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveOffer(offer.id)}
                                                    >
                                                        <MdOutlineDelete className='text-xl text-red-500 hover:text-red-600 transition-colors duration-200' /> 
                                                    </button>
                                                </li>
                                            ))}

                                            {(book.special_offers && selectedOffer) && 
                                                <button className='mt-2 hover:text-blue-500' onClick={() => setSelectedOffer(null)}>Clear offer</button> 
                                            }
                                        </ul>
                                    </>)
                                }
                            </div>)
                            }

                            <div className='flex flex-col my-6 gap-2'>
                                { showAdminFeatures ?
                                    <button 
                                        className="px-4 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-200 transition-all duration-200"
                                        onClick={() => navigate(`/admin-dashboard/books/add-offer/${book.id}`)}
                                    >
                                        Add new offer
                                    </button>
                                    :
                                    <>
                                        <button
                                            className="px-4 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-200 transition-all duration-200"
                                            onClick={() => handleCartUpdate(Number(book.id), 1, selectedOffer)}
                                        >Add to cart</button>
                                        <button
                                            className="px-4 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-200 transition-all duration-200"
                                            onClick={() => handleAddToWishList(Number(book.id))}
                                        >Add to wishlist</button>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div className='m-4 p-4'>
                        <h2 className='font-semibold'>Additional Details:</h2>
                        { showAdminFeatures && isAdminBook(book) && (
                            <>
                                <p className='my-1 text-gray-800 text-sm'>
                                    {book.is_active ? 'Active': 'Not Active'}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    Quantity: {book.quantity}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    Purchase Count: {book.purchase_count}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    {book.is_cancellable ? 'Cancellable' : 'Not Cancellable'}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    Calcellation Hours: {book.cancellation_hours}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    Calcellation Policy: {book.cancellation_policy}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    {book.is_returnable ? 'Returnable' : 'Not Returnable'}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    Return Days: {book.return_days}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    Return Policy: {book.return_policy}
                                </p>
                                 <p className='my-1 text-gray-800 text-sm'>
                                    Shelf Location: {book.shelf_location}
                                </p>
                                <p className='my-1 text-gray-800 text-sm'>
                                    SKU: {book.sku}
                                </p>
                            
                            </>
                        )}
                        <p className='my-1 text-gray-800 text-sm'>
                            Published: {book.publish_year}
                        </p>
                        <p className='my-1 text-gray-800 text-sm'>
                            ISBN: {book.isbn}
                        </p>
                        <p className='my-1 text-gray-800 text-sm'>
                            Pages: {book.pages}
                        </p>
                        <p className='my-1 text-gray-800 text-sm'>
                            Format: {book.format}
                        </p>
                        <p className='my-1 text-gray-800 text-sm'>
                            Language: {book.language}
                        </p>
                        <p className='my-1 text-gray-800 text-sm'>
                            Publisher: {book.publisher}
                        </p>

                    </div>

                    <div className='m-4 p-4 flex'>
                        <Reviews averageRating={book.average_rating} id={Number(book.id)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShowBook;