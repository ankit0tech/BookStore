import BookSingleCard from "./BookSingleCard";
import { Book } from "../../types";

const BooksCard = ({ books }: { books: Book[] }) => {
    return (
        <div className="flex flex-col">
            {books.map((item) => (
                <BookSingleCard key={item.id} book={item}/>
            ))}
        </div>
    );
}

export default BooksCard;