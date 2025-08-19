import { useState, useEffect } from "react";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { AdminBook, Category } from "../../types";
import { AiOutlineEdit, AiOutlineEye, AiOutlinePlus, AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { MdDeleteOutline, MdInventory } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { BiSearch } from "react-icons/bi";


const BookManagement = () => {

    const [books, setBooks] = useState<AdminBook[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sortOrder, setSortOrder] = useState<string>('asc');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('http://localhost:5555/categories')
        .then((response: AxiosResponse) => {
            setCategories(response.data.data);
        })
        .catch((error: any) => {
            console.log(error);
        });

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
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex justify-between mt-4">
                    <div className="flex items-center gap-2 text-2xl font-semibold"><MdInventory className="inline text-2xl text-violet-700"/> Book Inventory Management</div>
                    <button
                        className="py-2 px-3 flex items-center gap-2 text-white bg-purple-500 border rounded-lg hover:bg-purple-600 transition-colors duration-200" 
                        onClick={() => navigate('/admin-dashboard/books/create')}
                        >
                            <AiOutlinePlus className="inline"/> 
                            Add new book
                    </button>
                </div>

                <div className="my-2 flex items-center gap-2">
                    <div className="relative flex items-center w-full">
                        <BiSearch className="mx-3 absolute text-md text-gray-400"/>
                        <input 
                            className="w-full pl-9 py-2 rounded-md border outline-none"
                            placeholder="Search books..."
                        ></input>
                    </div>
                    <div className="p-2 outline-none border focus:border-blue-300 rounded-md">
                        <select className="" name="" id="">
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="p-2 outline-none border focus:border-blue-300 rounded-md">
                        <select name="" id="">
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="p-2 outline-none border focus:border-blue-300 rounded-md">
                        <select  name="" id="">
                            <option value="All">All Stock</option>
                            <option value="Low">Low Stock</option>
                            <option value="Empty">Out Of Stock</option>
                        </select>
                    </div>
                    <div
                        className="p-2 outline-none border focus:border-blue-300 rounded-md"
                    >
                        <button 
                            onClick={() => {sortOrder === 'asc' ? setSortOrder('desc') : setSortOrder('asc')}}
                        >
                            {sortOrder === 'asc' ? <AiOutlineSortAscending/> : <AiOutlineSortDescending/>}
                        </button>
                    </div>
                </div>
            </div>

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