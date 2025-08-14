import { Link } from "react-router-dom";
import { UserBook } from "../../types/index";

const BookSingleCard: React.FC<{ book: UserBook }> = ({ book }) => {

    return (
        <div
            key={book.id}
            className="flex flex-col px-2 py-4 rounded-lg relative hover:shadow-md"
        >
            <Link to={`/books/details/${book.id}`}>
                <div className="w-36 h-56 bg-gray-100 shadow-md overflow-hidden flex justify-center items-center">
                    <img 
                        src={book.cover_image}
                        alt="Book Cover"
                        className="w-full h-full object-cover object-scale-down"
                    />
                </div>
            </Link>
             
            <div className="flex flex-col h-[calc(350px-224px-32px)]">
                <Link to={`/books/details/${book.id}`}>
                    <h2 className="text-lg leading-tight line-clamp-2 mt-1 hover:text-blue-500">{book.title}</h2>
                </Link>
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm">{book.author}</h2>
                    <span className="text-sm font-medium text-gray-900">&#8377; {book.price}</span>
                </div>
            </div>
        </div>
    );
}

export default BookSingleCard;