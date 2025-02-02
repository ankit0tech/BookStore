import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { FcPlus } from "react-icons/fc";
// import { useNavigate } from 'react-router-dom';
import { useHandleCartUpdate } from '../../utils/cartUtils';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../types';
import { Book } from '../../types';
import { useState } from 'react';
import Popup from '../../components/Popup';
// import { useDispatch } from "react-redux";
// import { setCartItems as setCartItemsSlice } from "../../redux/cartSlice";
// import { getCartItems } from "../../utils/cartUtils";
// import { enqueueSnackbar } from 'notistack';


const BooksTable = ({ books }: { books: Book[] }) => {

    // const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const { handleCartUpdate } = useHandleCartUpdate();

    return (
        <div>
            {/* <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)}>
                <h2>Book Added to the cart</h2>
            </Popup> */}
            <table className='w-full mx-auto max-w-[1000px] rounded-lg'>
                <thead>
                    <tr className='rounded-full text-white bg-purple-500 h-8'>
                    {/* <tr className='rounded-full my-4 text-white bg-black my-3 px-4 py-2 border border-gray-300'> */}
                        <th className='rounded-full rounded-r-lg my-4 px-4 py-2'>No</th>
                        <th className=''>Title</th>
                        <th className='max-md:hidden'>Author</th>
                        <th className='max-md:hidden'>Publish Year</th>
                        <th className='max-md:hidden'>Category</th>
                        <th className=''>Price</th>
                        <th className='rounded-full rounded-l-lg'>Operations</th>
                    </tr>
                </thead>
                <tbody>
                    {books && books.map((book, index) => (
                        <tr key={book.id} className='h-8'>
                            {/* <td className='text-center'>{pageNumber*10 + index + 1}</td> */}
                            <td className='text-center'>{index + 1}</td>
                            <td className='text-center'>{book.title}</td>
                            <td className='text-center max-md:hidden'>{book.author}</td>
                            <td className='text-center max-md:hidden'>{book.publish_year}</td>
                            <td className='text-center max-md:hidden'>{book.category}</td>
                            <td className='text-center'>{book.price}</td>
                            <td className='text-center'>
                                <div className='flex justify-center gap-x-4'>
                                    {/* <Link to={`/books/add-to-cart/${book.id}`}>
                                        <FcPlus />
                                    </Link> */}
                                    {/* <div onClick={() => {handleAddToCart(book.id)}}> */}
                                        <FcPlus onClick={() => {handleCartUpdate(book.id, 1)}} />
                                    {/* </div> */}
                                    <Link to={`/books/details/${book.id}`}>
                                        <BsInfoCircle className='text-2x1 text-green-800' />
                                    </Link>
                                    <Link to={`/books/edit/${book.id}`}>
                                        <AiOutlineEdit className='text-2x1 text-yellow-600' />
                                    </Link>
                                    <Link to={`/books/delete/${book.id}`}>
                                        <MdOutlineDelete className='text-2x1 text-red-600' />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default BooksTable