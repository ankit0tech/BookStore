import { useState , useEffect, useRef } from 'react'
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch} from 'react-redux';
import BooksTable from '../components/home/BooksTable';
import BooksCard from '../components/home/BooksCard';
// import { checkTokenExpiry } from '../redux/authMiddleware';
// import { RootState } from '@reduxjs/toolkit/query';
import { Book, RootState } from '../types/index';
import { ChildProps } from '../App';
import { enqueueSnackbar } from 'notistack';
import SideBar from '../components/home/SideBar';


const Home = ({ books, setBooks, nextCursor, setNextCursor}: ChildProps) => {

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


    // taking cursor manually as useState was updating it asynchronously
    const handleFetchBooks = (prevBooks: Book[], cursor: number|null) => {
        
        setLoading(true);

        const params = new URLSearchParams();

        if(params) params.append('cursor', String(cursor));
        if(categoryId) params.append('cid', String(categoryId));
        if(maxPrice) params.append('maxPrice', String(maxPrice));
        if(minPrice) params.append('minPrice', String(minPrice));
        if(sortBy) {
            params.append('sortBy', sortBy);
            if(sortOrder) params.append('sortOrder', sortOrder);
        }
        if(sortByAverageRating) params.append('sortByAverageRating', '');
        if(selectWithSpecialOffer) params.append('selectWithSpecialOffer', '');
        

        const url = `http://localhost:5555/books?${params.toString()}`;

        axios
        .get(url)
        .then((response) => {
            setBooks(() => {
                const newBookIds = new Set(prevBooks.map((b) => b.id));
                const newBooks = response.data.data.filter((book: any) => !newBookIds.has(book.id));
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

    useEffect(() => {
        localStorage.setItem('homeState', showType);
    },[showType]);

    useEffect(()=> {
        setNextCursor(null);
        handleFetchBooks([], null);
    }, [categoryId, minPrice, maxPrice, sortBy, sortOrder, sortByAverageRating, selectWithSpecialOffer])

    useEffect(() => {
        if(!nextCursor || !observeRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if(entries[0].isIntersecting) {
                    handleFetchBooks(books, nextCursor);
                }
            },
            { threshold: 1 }
        );

        if (observeRef.current) observer.observe(observeRef.current);

        return () => {
            if (observeRef.current) observer.unobserve(observeRef.current);
            observer.disconnect();
        }
    }, [nextCursor, books.length]);



    return (
        <div className='p-4 h-full'>
            {/* <div className='flex justify-center items-center gap-x-4 py-2'>
                <button
                    className='bg-sky-300 hover:bg-sky-600 px-4 py-1 rounded-lg'
                    onClick={() => setShowType('table')}
                >
                    Table
                </button>
                <button
                    className='bg-sky-300 hover:bg-sky-600 px-4 py-1 rounded-lg'
                    onClick={() => setShowType('card')}
                >
                    Card
                </button>
            </div> */}
            
            <div className='flex gap-1 h-full'>
                <div className='overflow-y-auto pe-3'>
                    <SideBar
                        selectWithSpecialOffer={selectWithSpecialOffer} 
                        setSelectWithSpecialOffer={setSelectWithSpecialOffer}
                        sortByAverageRating={sortByAverageRating}
                        setSortByAverageRating={setSortByAverageRating}
                        sortBy={sortBy} setSortBy={setSortBy}
                        sortOrder={sortOrder} setSortOrder={setSortOrder}
                        minPrice={minPrice} setMinPrice={setMinPrice}
                        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                        handleFetchBooks={handleFetchBooks}
                        categoryId={categoryId} setCategoryId={setCategoryId} 
                        books={books} setBooks={setBooks}
                        nextCursor={nextCursor} setNextCursor={setNextCursor}
                    />
                </div>
                <div className='flex-1 overflow-y-auto'>
                    {showType=='table' ? (<BooksTable books={books} />) : (<BooksCard books={books} />)}
                    { nextCursor && <div id='loadNextPage' ref={observeRef} className='h-10 w-full'></div>}
                </div>

            </div>
            
        </div>
    );
}

export default Home;