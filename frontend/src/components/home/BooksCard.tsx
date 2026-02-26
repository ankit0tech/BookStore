import BookSingleCard from "./BookSingleCard";
import { UserBook } from "../../types";

const BooksCard = ({ books }: { books: UserBook[] }) => {
    return (
        <div className="flex flex-col p-4">
            <div className="grid items-stretch gap-y-4 gap-x-4 grid-cols-[repeat(2,minmax(160px,256px))] sm:grid-cols-[repeat(3,minmax(256px,352px))] lg:grid-cols-[repeat(auto-fit,minmax(256px,256px))] justify-start">
                {books.map((item) => (
                    <div key={item.id} className="h-[304px] sm:h-[400px]">
                        <BookSingleCard book={item}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BooksCard;