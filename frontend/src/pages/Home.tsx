import { useState , useEffect, useRef } from 'react'
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch} from 'react-redux';
import BooksTable from '../components/home/BooksTable';
import BooksCard from '../components/home/BooksCard';
// import { checkTokenExpiry } from '../redux/authMiddleware';
// import { RootState } from '@reduxjs/toolkit/query';
import { UserBook, RootState } from '../types/index';
import { enqueueSnackbar } from 'notistack';
import SideBar from '../components/home/SideBar';
import api from '../utils/api';
import { MdFilterAlt } from 'react-icons/md';


const Home = () => {

    const [books, setBooks] = useState<UserBook[]>([]);
    const [nextCursor, setNextCursor] = useState<number|null>(null);
    const [showSidebar, setShowSidebar] = useState<boolean>(localStorage.getItem('showSidebar') === 'true');

    const [loading, setLoading] = useState(false);
    const [showType, setShowType] = useState(() => {
        return 'card';
    });
    
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const userRole = userinfo.userRole;
    const observeRef = useRef(null);
    const [categoryId, setCategoryId] = useState<number|null>(null);
    const [minPrice, setMinPrice] = useState<number|null>(null);
    const [maxPrice, setMaxPrice] = useState<number|null>(null);
    const [sortBy, setSortBy] = useState<string|null>(null);
    const [sortOrder, setSortOrder] = useState<string|null>(null);
    const [sortByAverageRating, setSortByAverageRating] = useState<boolean>(false);
    const [selectWithSpecialOffer, setSelectWithSpecialOffer] = useState<boolean>(false);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('searchQuery');


    // taking cursor manually as useState was updating it asynchronously
    const handleFetchBooks = (prevBooks: UserBook[], cursor: number|null) => {
        
        setLoading(true);

        if(searchQuery) {
            api.get(`/books/search?query=${searchQuery}`)
            .then((response) => {
                setBooks(response.data.data);
                setNextCursor(response.data.nextCursor);
                setLoading(false);
            }).catch((error)=>{
                enqueueSnackbar("Error while loading books", {variant: 'error'});
                setLoading(false);
            });

        } else {

            const params = new URLSearchParams();

            if(cursor) params.append('cursor', String(cursor));
            if(categoryId) params.append('cid', String(categoryId));
            if(maxPrice) params.append('maxPrice', String(maxPrice));
            if(minPrice) params.append('minPrice', String(minPrice));
            if(sortBy) {
                params.append('sortBy', sortBy);
                if(sortOrder) params.append('sortOrder', sortOrder);
            }
            if(sortByAverageRating) params.append('sortByAverageRating', '');
            if(selectWithSpecialOffer) params.append('selectWithSpecialOffer', '');
            

            const url = `/books?${params.toString()}`;

            api
            .get(url)
            .then((response) => {
                setBooks(() => {
                    const prevBookIds = new Set(prevBooks.map((b) => b.id));
                    const newBooks = response.data.data.filter((book: any) => !prevBookIds.has(book.id));
                    return [...prevBooks, ...newBooks];
                });
                setNextCursor(response.data.nextCursor);
                setLoading(false);
            })
            .catch((error)=>{
                enqueueSnackbar("Error while loading books", {variant: 'error'});
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        localStorage.setItem('homeState', showType);
    }, [showType]);

    useEffect(() => {
        localStorage.setItem('showSidebar', showSidebar.toString());
    }, [showSidebar]);

    useEffect(()=> {
        setNextCursor(null);
        handleFetchBooks([], null);
    }, [categoryId, minPrice, maxPrice, sortBy, sortOrder, sortByAverageRating, selectWithSpecialOffer, searchQuery])

    useEffect(() => {
        if(!nextCursor || !observeRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if(entries[0].isIntersecting) {
                    handleFetchBooks(books, nextCursor);
                }
            },
            { 
                rootMargin: '50px',
                threshold: 0.1 
            }
        );

        if (observeRef.current) observer.observe(observeRef.current);

        return () => {
            if (observeRef.current) observer.unobserve(observeRef.current);
            observer.disconnect();
        }
    }, [nextCursor, books.length]);

    useEffect(() => {
        if(!showSidebar) return;

        const listener = (event: KeyboardEvent) => {
            if(event.key === 'Escape') {
                setShowSidebar(false); 
            }
        };

        document.addEventListener("keydown", listener);

        return () => {
            document.removeEventListener("keydown", listener);
        }
    }, [showSidebar]);


    return (
        <div className='relative isolate flex flex-row h-full min-h-0'> 
            <button 
                className={`absolute z-50 inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 sm:opacity-0 sm:pointer-events-none ${!showSidebar && 'opacity-0 pointer-events-none' }`} 
                onClick={() => setShowSidebar(false)}
            />
            
            <div className={`absolute sm:relative z-50 bg-white shadow-lg flex flex-row ${showSidebar && 'border-r-[1.5px]'} h-full z-20`}>
                <div className={`overflow-y-auto [transition:width_300ms,opacity_150ms] ease-in-out ${showSidebar ? 'w-[240px] opacity-100' : 'w-0 opacity-0 pointer-events-none'}`}>
                    <SideBar
                        selectWithSpecialOffer={selectWithSpecialOffer} 
                        setSelectWithSpecialOffer={setSelectWithSpecialOffer}
                        sortByAverageRating={sortByAverageRating}
                        setSortByAverageRating={setSortByAverageRating}
                        sortBy={sortBy} setSortBy={setSortBy}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        minPrice={minPrice} setMinPrice={setMinPrice}
                        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                        categoryId={categoryId} setCategoryId={setCategoryId} 
                        />
                </div>

                <button
                    className={`absolute ${showSidebar ? '-right-[36.5px]' : '-right-[35px]'} z-50 size-fit p-2 my-2 bg-white rounded-r-lg _hover:bg-gray-50 border-y-1 border-r-1 shadow-sm hover:shadow-md`}
                    onClick={() => setShowSidebar(!showSidebar)}
                >
                    <MdFilterAlt className='text-lg text-gray-600 hover:text-gray-800'/>
                </button>
            </div>


            <div className='flex-1 overflow-y-auto'>
                <BooksCard books={books} />
                { nextCursor && <div id='loadNextPage' ref={observeRef} className='h-10 w-full'></div>}
            </div>
        </div>
    );
}

export default Home;