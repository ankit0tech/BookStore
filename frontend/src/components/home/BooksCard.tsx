import BookSingleCard from "./BookSingleCard";
import { UserBook } from "../../types";
import api from "../../utils/api";
import { enqueueSnackbar } from "notistack";

const BooksCard = ({ books }: { books: UserBook[] }) => {

    const handleAddToWishList = (id: number) => {

        api.post(`/wishlist/add/${id}`)
        .then((response) => {
            enqueueSnackbar(response.data.message, { variant: 'success' });
        })
        .catch((error) => {
            console.log(error);
            enqueueSnackbar('Error while adding item to wishlist', { variant: 'error' });
        });
    }

    const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const wishEl = target.closest('[data-wishlist-id]') as HTMLElement | null;
        if(!wishEl) return;

        const bookId = Number(wishEl.dataset.wishlistId);
        if(Number.isNaN(bookId)) return;

        handleAddToWishList(bookId);
    }


    return (
        <div className="flex flex-col p-4">
            <div 
                className="grid items-stretch gap-y-4 gap-x-4 grid-cols-[repeat(2,minmax(160px,256px))] sm:grid-cols-[repeat(3,minmax(256px,352px))] lg:grid-cols-[repeat(auto-fit,minmax(256px,256px))] justify-start"
                onClick={(e) => {handleGridClick(e)}}
            >
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