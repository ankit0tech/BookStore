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
    const { isAdmin } = useSelector((state: RootState) => state.userinfo);

    return (
        <div
            key={book.id}
            className="flex border-2 border-purple-500 rounded-lg px-4 py-2 m-4 relative hover:shadow-xl"
        >
            {/* <h2 className="absolute top-1 right-2 px-4 py-1 bg-purple-300 rounded-lg">
                {book.publishYear}
            </h2> */}
            {/* <h4 className="my-2 text-gray-500">{book.id}</h4> */}
            <div className="w-48 h-64 bg-gray-100 rounded-lg shadow-md overflow-hidden flex justify-center items-center">
                <img 
                    src={book.cover_image}
                    alt="Book Cover"
                    className="w-full h-full object-cover object-scale-down"
                >
                </img>
            </div>
             
            <div className="flex flex-col m-4">
                <div className="flex justify-start items-center gap-x-2 gap-y-2">
                    <PiBookOpenTextLight className="text-purple-600 text-2xl" />
                    <h2 className="my-1">{book.title}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2" >
                    <BiUserCircle className="text-purple-600 text-2xl" />
                    <h2 className="my-1">{book.author}</h2>
                </div>
                <div className="flex items-center gap-x-5 mt-4 p-4">
                    <BiShow 
                        className="text-3xl text-blue-800 hover:text-black cursor-pointer"
                        onClick={() => setShowModal(true)}
                    />
                    <Link to={`/books/details/${book.id}`}>
                        <BsInfoCircle className="text-2xl text-green-800 hover:text-black" />
                    </Link>
                    
                    {isAdmin && (
                        <>
                            <Link to={`/books/edit/${book.id}`}>
                                <AiOutlineEdit className="text-2xl text-yellow-600 hover:text-black"/>
                            </Link>
                            <Link to={`/books/delete/${book.id}`}>
                                <MdOutlineDelete className="text-2xl text-purple-600 hover:text-black"/>
                            </Link>
                        </>    
                    )
                    }                
                    
                </div>
                {
                    showModal && (
                        <BookModal book={book} onClose={()=> setShowModal(false)}/>
                    )
                }
            </div>
        </div>
    );
}

export default BookSingleCard;