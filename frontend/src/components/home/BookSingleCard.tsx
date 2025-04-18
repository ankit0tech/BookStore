import { Link } from "react-router-dom";
import { PiBookOpenTextLight } from "react-icons/pi";
import { BiUserCircle, BiShow } from 'react-icons/bi';
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";
import { useState } from 'react';
import BookModal from "./BookModal";
import { useSelector } from "react-redux";
import { RootState } from "../../types/index";
import { Book } from "../../types/index";

// const BookSingleCard = ({book}: Book) => {
const BookSingleCard: React.FC<{ book: Book }> = ({ book }) => {
    const [showModal, setShowModal] = useState(false);
    const { userRole } = useSelector((state: RootState) => state.userinfo);

    return (
        <div
            key={book.id}
            className="flex flex-col px-2 py-4 relative hover:shadow-xl"
        >
                <div className="w-36 h-56 bg-gray-100 shadow-md overflow-hidden flex justify-center items-center">
                    <Link to={`/books/details/${book.id}`}>
                        <img 
                            src={book.cover_image}
                            alt="Book Cover"
                            className="w-full h-full object-cover object-scale-down"
                        >
                        </img>
                    </Link>
                </div>
             
            <div className="">
                <div className="flex justify-start items-center gap-x-2 gap-y-2">
                    <h2 className="text-lg">{book.title}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2" >
                    <h2 className="text-sm">{book.author}</h2>
                </div>
                <div className="text-sm">
                    &#8377;{book.price}
                </div>
            </div>
        </div>
    );
}

export default BookSingleCard;