import { AiOutlineClose } from "react-icons/ai";
import { UserBook } from "../../types";


// const BookModal = ({book, onClose}) => {
const BookModal: React.FC<{ book: UserBook; onClose: () => void;}> = ({ book, onClose }) => {

    return (
        <div className="fixed bg-black bg-opacity-60 top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-[600px] max-w-full h-[400px] bg-white rounded-xl p-4 flex flex-col relative"
            >
                <AiOutlineClose 
                    className="absolute right-6 top-6 text-3xl text-red-600 cursor-pointer"
                    onClick={onClose}
                />
                <div className="w-48 h-64 bg-gray-100 rounded-lg shadow-md overflow-hidden flex justify-center items-center">
                    <img 
                        src={book.cover_image || 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'}
                        alt="Book Cover"
                        className="w-full h-full object-cover object-scale-down"
                        onError={(e) => {
                            e.currentTarget.src = 'https://m.media-amazon.com/images/I/61zgnofiBXL._SY522_.jpg'
                        }}
                    >
                    </img>
                </div>
                <div className="flex justify-start items-center gap-x-2">
                    <h2>Title: </h2>
                    <h2 className="my-1">{book.title}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2" >
                    <h2>Author: </h2>
                    <h2 className="my-1">{book.author}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2">
                    <h2>Price: </h2>
                    <h2 className="my-1">{book.price}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2">
                    <h2>Category: </h2>
                    <h2 className="my-1">{book.category?.title || 'Uncategorized'}</h2>
                </div>

            </div>
        </div>
    );
}

export default BookModal;