import BookSingleCard from "./BookSingleCard";
import { UserBook } from "../../types";

const BooksCard = ({ books }: { books: UserBook[] }) => {
    return (
        <div className="py-4 pl-4 grid items-stretch gap-y-6 gap-x-4 grid-cols-[repeat(auto-fit,minmax(260px,260px))] justify-start">
            {books.map((item) => (
                <div key={item.id} className="w-[260px] h-[380px]">
                    <BookSingleCard book={item}/>
                </div>
            ))}
        </div>
    );
}

export default BooksCard;