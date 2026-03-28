import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import { AxiosResponse } from "axios";
import { AdminBook, Category, date_order } from "../../types";
import { AiOutlineEdit, AiOutlineEye, AiOutlinePlus, AiOutlineSortAscending, AiOutlineSortDescending } from "react-icons/ai";
import { MdDeleteOutline, MdInventory } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import { enqueueSnackbar } from "notistack";
import DeleteOverlay from "../../components/DeleteOverlay";
import { formatPrice, prettifyString } from "../../utils/formatUtils";
import CategoryGroupDropDownMenu from "../../components/CategoryGroupDropDownMenu";
import DropDownMenu from "../../components/DropDownMenu";

const stocks_options = ['Low Stock', 'Out Of Stock'];
type StocksOptions = typeof stocks_options[number];


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
        
        let selected_stock_option: string = '';
        if(filterStock === 'Low Stock') {
            selected_stock_option = '10';
        } else if (filterStock === 'Out Of Stock') {
            selected_stock_option = '0';
        }
        
        if(selected_stock_option) params.append('filterStock', selected_stock_option);
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
        <div className="w-full p-2 min-w-[320px] max-w-7xl">
            <div className="flex flex-col gap-4 mb-4">

                <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="flex items-center gap-2 text-xl font-semibold">
                        <MdInventory className="inline text-2xl text-orange-600"/> 
                        <span>Book Management</span>
                    </div>
                    <button
                        className="w-fit flex flex-row gap-2 items-center py-2 px-4 font-medium text-white bg-orange-500 hover:bg-orange-600/90 rounded-sm border border-orange-800 active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_hsla(17,100%,31%,1.0)] active:shadow-[1px_1px_0px_0px_hsla(17,100%,31%,1.0)] transition-[box-shadow_200ms,transform_200ms] ease-out"
                        onClick={() => navigate('/admin-dashboard/books/create')}
                    >
                        <AiOutlinePlus className="inline"/> 
                        <span>New book</span>
                    </button>
                </div>

                <form 
                    className="flex items-center gap-2 flex-col lg:flex-row"
                    onSubmit={(e) => {e.preventDefault()}}
                >
                    <div className="relative flex items-center w-full">
                        <BiSearch className="absolute mt-0.5 mx-3 text-gray-400"></BiSearch>
                        <input
                            className="flex py-2 pl-9 outline-hidden border w-full border-gray-300 hover:border-gray-400 rounded-sm text-gray-800"
                            placeholder="Enter book title, or author name..."
                            aria-label="Search orders"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') handleFetchBooks([], null);
                            }}
                        ></input>
                    </div>

                    <div className="w-full flex flex-col xs:flex-row gap-2 self-start">

                        <div className="w-full flex flex-col lg:flex-row gap-2">
                            <div className="w-full">
                                <CategoryGroupDropDownMenu 
                                    title='Select Category'
                                    defaultValue='None (No Category)'
                                    selectedOptionStatus={filterCategoryId}
                                    setSelectedOptionStatus={setFilterCategoryId}
                                    options={categories}
                                    getLabel={prettifyString}                        
                                />
                            </div>

                            <div className="w-full">
                                <DropDownMenu
                                    title="Active Status"
                                    defaultValue="All Status"
                                    selectedOptionStatus={filterStatus}
                                    setSelectedOptionStatus={setFilterStatus}
                                    options={['active', 'inactive']}
                                    getLabel={prettifyString}
                                />
                            </div>
                        </div>
                        
                        <div className="w-full flex flex-col lg:flex-row gap-2">
                            <div className="w-full">
                                <DropDownMenu
                                    title="Filter Stocks"
                                    defaultValue="All Stocks"
                                    selectedOptionStatus={filterStock}
                                    setSelectedOptionStatus={setFilterStock}
                                    options={stocks_options}
                                />
                            </div>

                            <div className="w-fit px-4 py-2 outline-hidden rounded-sm border border-gray-300 hover:border-gray-400">
                                <button 
                                    onClick={handleSortingChange}
                                >
                                    {sortOrder === 'asc' ? <AiOutlineSortAscending/> : <AiOutlineSortDescending/>}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>

                <div className="flex flex-row gap-2">
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <div className="flex flex-col bg-blue-50 p-4 w-full rounded-lg">
                            <div className="text-sm text-blue-600">Total Books</div>
                            <div className="font-bold text-xl text-blue-800">{totalBookCount}</div>
                        </div>
                        <div className="flex flex-col bg-green-50 p-4 w-full rounded-lg">
                            <div className="text-sm text-green-600">Active Books</div>
                            <div className="font-bold text-xl text-green-800">{activeBookCount}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full">
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
            </div>

            <table className="border border-gray-200 w-full">
                <thead className="">
                    <tr className="text-gray-700 bg-gray-100 text-xs text-left">
                        <th className="px-8 py-4 font-normal">BOOK</th>
                        <th className="hidden lg:table-cell px-2 py-4 font-normal">CATEGORY</th>
                        <th className="hidden lg:table-cell px-2 py-4 font-normal">PRICE</th>
                        <th className="hidden sm:table-cell px-2 py-4 font-normal">STOCK</th>
                        <th className="hidden xs:table-cell px-2 py-4 font-normal">STATUS</th>
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
                            <td className="hidden lg:table-cell px-2 py-4">{book.category?.title || "Uncategorized"}</td>
                            <td className="hidden lg:table-cell px-2 py-4">{formatPrice(book.price, book.currency)}</td>
                            <td className="hidden sm:table-cell px-2 py-4"> 
                                <div className={`px-2 py-0.5 rounded-full size-fit text-xs font-medium ${book.quantity == 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                    {book.quantity == 0 ? `${book.quantity} - Out of Stock` : `${book.quantity} - In Stock`}
                                </div>
                            </td>
                            <td className="hidden xs:table-cell px-2 py-4">
                                <div className={`px-3 py-1 rounded-full size-fit text-xs font-medium ${book.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {book.is_active ? "Active" : "Inactive"}
                                </div>
                            </td>
                            <td>
                                <div className="flex items-center gap-2 mx-1">
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