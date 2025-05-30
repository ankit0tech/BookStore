import {useEffect, useState} from 'react'
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { enqueueSnackbar } from 'notistack';
import Reviews from '../components/review/Reviews';
import { useHandleCartUpdate } from '../utils/cartUtils';
import api from '../utils/api';
import { RootState } from '../types';
import { useSelector } from 'react-redux';
import { Book } from '../types';
import { MdOutlineDelete } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';
import DeleteOverlay from '../components/DeleteOverlay';


const ShowBook = () => {
    const [book, setBook] = useState<Book|null>(null);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const { handleCartUpdate } =useHandleCartUpdate();
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const [selectedOffer, setSelectedOffer] = useState<number|null>(null);
    const [showDeleteOption, setShowDeleteOption] = useState<boolean>(false);
    const navigate = useNavigate();


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
            <BackButton />
            <h1 className='text-2xl my-4 font-medium'>Show Book</h1>
            {loading || !book ? (
                <Spinner />
            ) : (
                <div className="p-4 flex flex-row justify-around">
                    <div className='flex flex-col rounded-x1 w-fit min-w-[200px] p-4 flex-shrink-0 flex-grow md:ml-20'>
                        <div className='flex flex-row gap-4 p-4 justify-between shadow rounded-lg hover:shadow-md transition-all duration-200'>
                            <div className='h-72 w-56 bg-gray-100 flex items-center justify-center rounded-lg flex-shrink-0'>
                                <img
                                    src={book.cover_image}
                                    alt={book.title}
                                    className='object-contain max-w-full max-h-full'
                                >
                                </img>
                            </div>

                            <div className='flex flex-col flex-grow'>
                                <h2 className='text-2xl font-medium'>
                                    {book.title}
                                </h2>
                                <p className='text-gray-700'>
                                    by {book.author}
                                </p>
                                <p className='mt-4 text-gray-600 text-sm'>
                                    Published: {book.publish_year}
                                </p>
                                <p className='mb-4 text-gray-600 text-sm'>
                                    Category: {book.category.title}
                                </p>
                                <p className='font-semibold py-2 text-lg'>
                                    &#8377;{book.price}
                                </p>
                            </div>
                        </div>

                        { book.special_offers?.length !=0 && (
                        <div className='mt-6 shadow p-4 rounded-lg hover:shadow-md transition-all duration-200'>
                            { book.special_offers?.length ? 
                                <div className='font-medium py-2'>Select one offer: </div> 
                                    : 
                                null
                            }

                            <ul className='text-gray-700 text-sm'>
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

                                        {(userinfo.userRole == 'admin' || userinfo.userRole == 'superadmin')
                                            && 
                                            <button
                                                onClick={() => handleRemoveOffer(offer.id)}
                                            >
                                                <MdOutlineDelete className='text-xl text-red-500 hover:text-red-600 transition-colors duration-200' /> 
                                            </button>
                                        }
                                    
                                    </li>
                                )) }
                                
                                {(book.special_offers && selectedOffer) && 
                                    <button className='mt-2 hover:text-blue-500' onClick={() => setSelectedOffer(null)}>Clear offer</button> 
                                }
                            </ul>
                        </div>)}

                        <div className='flex my-6 gap-2'>
                            <Link 
                               className="inline-block px-4 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-200 transition-all duration-200"
                               to={`/books/add-offer/${book.id}`}
                            >Add new offer</Link>
                            <button
                                className="px-4 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-200 transition-all duration-200"
                                onClick={() => handleCartUpdate(Number(book.id), 1, selectedOffer)}
                            >Add to cart</button>
                            <button
                                className="px-4 py-2 rounded-md text-blue-600 bg-blue-50 hover:bg-blue-200 transition-all duration-200"
                                onClick={() => handleAddToWishList(Number(book.id))}
                            >Add to wishlist</button>
                        </div>

                        {(userinfo.userRole === 'admin' || userinfo.userRole === 'superadmin') && (
                            <div className='flex flex-col p-4 gap-3 shadow hover:shadow-md rounded-lg transition-all duration-200'>
                                <h2 className='text-lg font-semibold mb-4 text-gray-700'>Admin Options:</h2>

                                <div className='flex flex-col gap-3'>
                                    <button 
                                        className='flex items-center gap-2 py-2 px-4 rounded-lg text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200' 
                                        onClick={() => navigate(`/dashboard/books/edit/${book.id}`)}
                                    >
                                        <AiOutlineEdit className='inline text-xl' /> Edit Book
                                    </button>

                                    <button 
                                        className='flex items-center gap-2 py-2 px-4 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200' 
                                        onClick={() => setShowDeleteOption(true)}
                                    >
                                        <MdOutlineDelete className='inline text-xl' /> Delete Book
                                    </button>
                                </div>

                                <DeleteOverlay
                                    deleteUrl={`http://localhost:5555/books/${book.id}`}
                                    itemName='book'
                                    isOpen={showDeleteOption}
                                    onClose={()=>setShowDeleteOption(false)}
                                    onDeleteSuccess={() => navigate(-1)}
                                />
                           </div>
                        )}
                    </div>

                    <div className='m-4 p-4 flex md:mr-20 shadow rounded-lg hover:shadow-md transition-all duration-200'>
                        <Reviews averageRating={book.average_rating} id={Number(book.id)} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShowBook;