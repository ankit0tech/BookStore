import { useState, useEffect } from "react";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { AdminBook } from "../../types";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";


const BookManagement = () => {

    const [books, setBooks] = useState<AdminBook[]>([]);

    useEffect(() => {
        api.get('http://localhost:5555/books/')
        .then((response: AxiosResponse) => {
            setBooks(response.data.data);
        })
        .catch((error: any) => {
            console.log(error);
        });
    }, []);

    return (
        <div>

            <table className="border border-gray-200 w-full">
                <thead className="">
                    <tr className="text-gray-700 bg-gray-100 text-xs text-left">
                        <th className="px-8 py-4 font-normal">BOOK</th>
                        <th className="px-2 py-4 font-normal max-md:hidden">CATEGORY</th>
                        <th className="px-2 py-4 font-normal max-md:hidden">PRICE</th>
                        <th className="px-2 py-4 font-normal">STOCK</th>
                        <th className="px-2 py-4 font-normal">STATUS</th>
                        <th className="px-2 py-4 font-normal">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {books && books.map((book) => (
                        <tr className="text-sm" key={book.id}>
                            <td className="px-8 py-4">
                                <div className="font-medium">{book.title}</div>
                                <div className="text-gray-500">by {book.author}</div>
                            </td>
                            <td className="px-2 py-4 max-md:hidden">{book.category?.title || "Uncategorized"}</td>
                            <td className="px-2 py-4 max-md:hidden">&#8377;{book.price}</td>
                            <td className="px-2 py-4"> 
                                <div className={`px-2 py-0.5 rounded-full size-fit text-xs font-medium ${book.quantity == 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {book.quantity == 0 ? `${book.quantity} - Out of Stock` : `${book.quantity} - In Stock`}
                                </div>
                            </td>
                            <td className="px-2 py-4">
                                <div className={`px-3 py-1 rounded-full size-fit text-xs font-medium ${book.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {book.is_active ? "Active" : "Inactive"}
                                </div>
                            </td>
                            <td>
                                <div className="flex items-center gap-2">
                                    <button className="text-blue-700 text-lg">
                                        <AiOutlineEye/>
                                    </button>
                                    <button className="text-yellow-600 text-lg">
                                        <AiOutlineEdit/>
                                    </button>
                                    <button className="text-red-600 text-lg">
                                        <MdDeleteOutline/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
        </div>
    );
}

export default BookManagement;