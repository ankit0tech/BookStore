import { Link } from "react-router-dom";
import { UserBook } from "../../types/index";
import { VscHeart } from "react-icons/vsc";
import { FaStar } from "react-icons/fa";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";

const BookSingleCard: React.FC<{ book: UserBook }> = ({ book }) => {

    const findMaxDiscountPercentage = (book: UserBook): number => {
        return book.special_offers ? Math.max(...book.special_offers?.map(offer => offer.discount_percentage)) : 0;
    }

    const calculateDiscountedPrice = (book: UserBook): number => {
        return (book.price * (100 - findMaxDiscountPercentage(book))) / 100;
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


    return (
        <div
            key={book.id}
            className="relative isolate flex flex-col px-2 py-4 rounded-lg border hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-200"
        >   
            <div 
                className="absolute -right-0 right-4 z-10 p-1"
                onClick={() => handleAddToWishList(Number(book.id))}
            >
                <VscHeart className="text-2xl text-gray-800 hover:text-red-500"></VscHeart>
            </div>

            <div className="w-56 h-56 _border _rounded-lg flex justify-center w-full">
                <div className="w-36 h-56 bg-gray-100 shadow-xs overflow-hidden flex justify-center items-center">
                    <img 
                        src={book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                        alt="Book Cover"
                        className="w-full h-full object-cover object-scale-down"
                        onError={(e) => {
                            e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                        }}
                    />
                </div>
            </div>
             
            <div className="px-1 flex flex-col h-[calc(380px-224px-32px)]">
                
                <h2 className="font-medium leading-tight line-clamp-2 mt-2 ">
                    <Link to={`/books/details/${book.id}`}>
                        <span className="absolute inset-0"></span>
                        {book.title}
                    </Link>
                </h2>

                <div className="flex flex-col gap-1">
                    <p className="text-sm font-light text-gray-600">by {book.author}</p>
                    
                    {book.average_rating != 0 &&
                        <div className="flex gap-1 items-center w-fit px-3 py-0.5 text-sm font-semibold bg-neutral-100 rounded-full ">
                            {book.average_rating}
                            <FaStar className="inline-block text-cyan-600"></FaStar>
                        </div>
                    }

                    <div className="space-x-2">
                        { book.special_offers?.length == 0 ?
                            <span className="inline-block font-semibold text-gray-900">&#8377;{book.price}</span>
                        :
                            <>
                                <span className="inline-block font-semibold text-gray-900">&#8377;{calculateDiscountedPrice(book)}</span>
                                <span className="inline-block line-through text-sm font-light text-gray-700">&#8377;{book.price}</span>
                                <span className="inline-block font-medium text-sm text-cyan-500">({findMaxDiscountPercentage(book)}%OFF)</span>
                            </>
                    }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookSingleCard;