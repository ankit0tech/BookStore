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
            {/* <h2 className="absolute top-1 right-2 px-4 py-1 bg-purple-300 rounded-lg">
                {book.publishYear}
            </h2> */}
            {/* <h4 className="my-2 text-gray-500">{book.id}</h4> */}
            {/* <div className="w-full max-w-[200px] mx-auto"> */}
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
            {/* </div> */}
             
            <div className="">
                <div className="flex justify-start items-center gap-x-2 gap-y-2">
                    {/* <PiBookOpenTextLight className="text-purple-600 text-2xl" /> */}
                    <h2 className="text-lg">{book.title}</h2>
                </div>
                <div className="flex justify-start items-center gap-x-2" >
                    {/* <BiUserCircle className="text-purple-600 text-2xl" /> */}
                    <h2 className="text-sm">{book.author}</h2>
                </div>
                <div className="text-sm">
                    &#8377;{book.price}
                </div>
                {/* <div className="flex items-center gap-x-5 mt-4 p-4">
                    <BiShow 
                        className="text-3xl text-blue-800 hover:text-black cursor-pointer"
                        onClick={() => setShowModal(true)}
                    />
                    <Link to={`/books/details/${book.id}`}>
                        <BsInfoCircle className="text-2xl text-green-800 hover:text-black" />
                    </Link>
                    
                    {(userRole == 'admin' || userRole == 'superadmin') && (
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
                    
                </div> */}
                {/* {
                    showModal && (
                        <BookModal book={book} onClose={()=> setShowModal(false)}/>
                    )
                } */}
            </div>
        </div>
    );
}

export default BookSingleCard;