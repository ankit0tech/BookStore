import BookSingleCard from "./BookSingleCard";
import { Book } from "../../types";

const BooksCard = ({ books }: { books: Book[] }) => {
    return (
        <div className="grid items-stretch gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {books.map((item) => (
                <div key={item.id} className="w-[200px] h-[350px]">
                    <BookSingleCard book={item}/>
                </div>
            ))}
        </div>
    );
}

export default BooksCard;