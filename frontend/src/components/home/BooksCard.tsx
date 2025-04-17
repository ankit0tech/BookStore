import BookSingleCard from "./BookSingleCard";
import { Book } from "../../types";

const BooksCard = ({ books }: { books: Book[] }) => {
    return (
        <div className="grid items-stretch gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {books.map((item) => (
                <div key={item.id} className="aspect-[2/3]">
                    <BookSingleCard book={item}/>
                </div>
            ))}
        </div>
    );
}

export default BooksCard;