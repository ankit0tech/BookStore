import BookSingleCard from "./BookSingleCard";

interface Book {
    _id: string;
    title: string;
    author: string;
    publishYear: string;
    price: string;
    category: string;
}

const BooksCard = ({ books }: { books: Book[] }) => {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((item) => (
                <BookSingleCard key={item._id} book={item}/>
            ))}
        </div>
    );
}

export default BooksCard;