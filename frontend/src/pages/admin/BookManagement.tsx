import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { AdminBook, Category } from "../../types";
import { AiOutlineEdit, AiOutlineEye, AiOutlinePlus, AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { MdDeleteOutline, MdInventory } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { enqueueSnackbar } from "notistack";
import DeleteOverlay from "../../components/DeleteOverlay";
import { formatPrice } from "../../utils/formatUtils";


const BookManagement = () => {

    const [books, setBooks] = useState<AdminBook[]>([]);
    const [nextCursor, setNextCursor] = useState<number|null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [sortOrder, setSortOrder] = useState<string>('asc');
    const [sortBy, setSortBy] = useState<string>('id');
    const [query, setQuery] = useState<string>('');
    const [filterCategoryId, setFilterCategoryId] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterStock, setFilterStock] = useState<string>('');

    const [totalBookCount, setTotalBookCount] = useState<number>(0);
    const [activeBookCount, setActiveBookCount] = useState<number>(0);
    const [lowStockCount, setLowStockCount] = useState<number>(0);
    const [outOfStock, setOutOfStock] = useState<number>(0);

    const [showDeleteOption, setShowDeleteOption] = useState<boolean>(false);
    const [bookToBeDeleted, setBookToBeDeleted] = useState<number|null>(null);
    
    const observeRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/categories')
        .then((response: AxiosResponse) => {
            setCategories(response.data.data);
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while loading categories', { variant: 'error' });
        });

        api.get('/books/')
        .then((response: AxiosResponse) => {
            setBooks(response.data.data);
            setNextCursor(response.data.nextCursor);
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar('Error while loading books', { variant: 'error' });
        });
    }, []);

    const handleFetchBooks = (prevBooks: AdminBook[], nextCursor: number|null) => {

        const params = new URLSearchParams();

        if(query) params.append('query', query);
        if(filterCategoryId) params.append('cid', filterCategoryId);
        if(filterStatus) params.append('filterStatus', filterStatus);
        if(filterStock) params.append('filterStock', filterStock);
        if(sortBy) params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        if(nextCursor) params.append('cursor', String(nextCursor));

        const apiUrl = query === '' ? 
            `/books?${params.toString()}` 
            : 
            `/books/search?${params.toString()}`;

        api.get(apiUrl)
        .then((response: AxiosResponse) => {
            setBooks(() => {
                const prevBookIds = new Set(prevBooks.map((b) => b.id));
                const newBooks = response.data.data.filter((book: AdminBook) => !prevBookIds.has(book.id));
                return [...prevBooks, ...newBooks];
            });
            setNextCursor(response.data.nextCursor);
        })
        .catch((error: any) => {
            console.log(error);
            enqueueSnackbar("Error while loading books", {variant: 'error'});
        });
    }

    const handleFetchStockData = () => {
        api.get('/books/inventory-overview')
        .then((response: AxiosResponse) => {
            setTotalBookCount(response.data.totalBookCount);
            setActiveBookCount(response.data.activeBookCount);
            setLowStockCount(response.data.lowStockCount);
            setOutOfStock(response.data.outOfStockCount);
        })
        .catch((error: any) => {
            console.log(error);
        })
    }

    useEffect(() => {
        handleFetchStockData();
        handleFetchBooks([], null);
    }, [filterCategoryId, filterStatus, filterStock, sortOrder]);

    useEffect(() => {
        if(!nextCursor || !observeRef.current) return;

        const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
                if(entries[0].isIntersecting) {
                    handleFetchBooks(books, nextCursor);
                }
            },
            { threshold: 1 }
        );

        if(observeRef.current) observer.observe(observeRef.current);

        return () => {
            if(observeRef.current) observer.unobserve(observeRef.current);
            observer.disconnect();
        }
    }, [books.length, nextCursor]);

    const handleSortingChange = () => {
        setSortBy('title');
        
        if(sortOrder === 'asc') {
            setSortOrder('desc');
        } else {
            setSortOrder('asc');
        }
    }


    return (
        <div className="w-full min-w-[850px]">
            <div className="flex flex-col gap-4 mb-8 ">
                <div className="flex justify-between gap-2 mt-4">
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
                        <BiSearch className="mx-3 mt-0.5 absolute text-md text-gray-400"/>
                        <input 
                            className="w-full min-w-48 pl-9 py-2 rounded-md border outline-hidden"
                            placeholder="Search books..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') handleFetchBooks([], null);
                            }}
                        ></input>
                    </div>
                    <div className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md">
                        <select 
                            className=""
                            value={filterCategoryId}
                            onChange={(e) => setFilterCategoryId(e.target.value)}
                            disabled={!categories.length}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <optgroup key={category.id} label={category.title}>
                                    {category.sub_category.map((sub)=>(
                                        <option key={sub.id} value={sub.id} label={sub.title}></option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md">
                        <select 
                            className=""
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md">
                        <select
                            className=""
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                        >
                            <option value="">All Stock</option>
                            <option value="10">Low Stock</option>
                            <option value="0">Out Of Stock</option>
                        </select>
                    </div>
                    <div
                        className="px-4 py-2 outline-hidden border focus:border-blue-300 rounded-md"
                    >
                        <button 
                            onClick={handleSortingChange}
                        >
                            {sortOrder === 'asc' ? <AiOutlineSortAscending/> : <AiOutlineSortDescending/>}
                        </button>
                    </div>
                </div>

                <div className="my-2 flex flex-row gap-2">
                    <div className="flex flex-col bg-blue-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-blue-600">Total Books</div>
                        <div className="font-bold text-xl text-blue-800">{totalBookCount}</div>
                    </div>
                    <div className="flex flex-col bg-green-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-green-600">Active Books</div>
                        <div className="font-bold text-xl text-green-800">{activeBookCount}</div>
                    </div>
                    <div className="flex flex-col bg-yellow-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-yellow-600">Low Stock</div>
                        <div className="font-bold text-xl text-yellow-800">{lowStockCount}</div>
                    </div>
                    <div className="flex flex-col bg-red-50 p-4 w-full rounded-lg">
                        <div className="text-sm text-red-600">Out of Stock</div>
                        <div className="font-bold text-xl text-red-800">{outOfStock}</div>
                    </div>
                </div>
            </div>

            <table className="border border-gray-200 w-full">
                <thead className="">
                    <tr className="text-gray-700 bg-gray-100 text-xs text-left">
                        <th className="px-8 py-4 font-normal">BOOK</th>
                        <th className="px-2 py-4 font-normal">CATEGORY</th>
                        <th className="px-2 py-4 font-normal">PRICE</th>
                        <th className="px-2 py-4 font-normal">STOCK</th>
                        <th className="px-2 py-4 font-normal">STATUS</th>
                        <th className="px-2 py-4 font-normal">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {books && books.map((book) => (
                        <tr className="text-sm border" key={book.id}>
                            <td className="px-8 py-4">
                                <div className="font-medium">{book.title}</div>
                                <div className="text-gray-500">by {book.author}</div>
                            </td>
                            <td className="px-2 py-4">{book.category?.title || "Uncategorized"}</td>
                            <td className="px-2 py-4">{formatPrice(book.price, book.currency)}</td>
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
                                    <button 
                                        className="text-blue-700 text-lg"
                                        onClick={() => navigate(`/admin-dashboard/books/details/${book.id}`)}
                                    >
                                        <AiOutlineEye/>
                                    </button>
                                    <button 
                                        className="text-yellow-600 text-lg"
                                        onClick={() => navigate(`/admin-dashboard/books/edit/${book.id}`)}
                                    >
                                        <AiOutlineEdit/>
                                    </button>
                                    <button 
                                        className="text-red-600 text-lg"
                                        onClick={() => {setBookToBeDeleted(book.id); setShowDeleteOption(true)}}
                                    >
                                        <MdDeleteOutline/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <DeleteOverlay
                deleteUrl={`/books/${bookToBeDeleted}`}
                itemName='book'
                isOpen={showDeleteOption}
                onClose={()=>setShowDeleteOption(false)}
                onDeleteSuccess={() => navigate(-1)}
            />
            {nextCursor && <div id='loadNextPage' ref={observeRef} className="h-10 w-full"></div>}
            
        </div>
    );
}

export default BookManagement;