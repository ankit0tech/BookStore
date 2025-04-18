import { Link } from "react-router-dom";
import { Book } from "../../types/index";

const BookSingleCard: React.FC<{ book: Book }> = ({ book }) => {

    return (
        <div
            key={book.id}
            className="flex flex-col px-2 py-4 rounded-lg relative hover:shadow-md"
        >
            <div className="w-36 h-56 bg-gray-100 shadow-md overflow-hidden flex justify-center items-center">
                <Link to={`/books/details/${book.id}`}>
                    <img 
                        src={book.cover_image}
                        alt="Book Cover"
                        className="w-full h-full object-cover object-scale-down"
                    />
                </Link>
            </div>
             
            <div className="flex flex-col h-[calc(350px-224px-32px)]">
                <h2 className="text-lg leading-tight line-clamp-2 mt-1">{book.title}</h2>
                <div className="flex flex-col gap-1">
                    <h2 className="text-sm">{book.author}</h2>
                    <span className="text-sm font-medium text-gray-900">&#8377; {book.price}</span>
                </div>
            </div>
        </div>
    );
}

export default BookSingleCard;