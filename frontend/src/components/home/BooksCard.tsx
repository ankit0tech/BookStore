import BookSingleCard from "./BookSingleCard";
import { UserBook } from "../../types";

const BooksCard = ({ books }: { books: UserBook[] }) => {
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