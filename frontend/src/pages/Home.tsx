import { useState , useEffect } from 'react'
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch} from 'react-redux';
import BooksTable from '../components/home/BooksTable';
import BooksCard from '../components/home/BooksCard';
// import { checkTokenExpiry } from '../redux/authMiddleware';
// import { RootState } from '@reduxjs/toolkit/query';
import { RootState } from '../types/index';
import { ChildProps } from '../App';
import { enqueueSnackbar } from 'notistack';


const Home = ({ books, setBooks, prevCursor, setPrevCursor, nextCursor, setNextCursor}: ChildProps) => {

    const [loading, setLoading] = useState(false);
    const [showType, setShowType] = useState(() => {
        return localStorage.getItem('homeState') || 'table';
    });
    // const [prevCursor, setPrevCursor] = useState<Number|null>(null);
    // const [nextCursor, setNextCursor] = useState<Number|null>(null);
    
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const userRole = userinfo.userRole;
    // const token = userinfo.token
    // const dispatch = useDispatch();


    const handleFetchBooks = (direction?: string) => {
        
        setLoading(true);
        
        let url = 'http://localhost:5555/books';

        if(direction) { 
            
            if (direction == 'prev') {
                url = url + `?cursor=${prevCursor}&direction=${direction}`;       
            } else {
                url = url + `?cursor=${nextCursor}&direction=${direction}`;       
            }
        }

        axios
        .get(url)
        .then((response) => {
            setBooks(response.data.data);
            setPrevCursor(response.data.prevCursor);
            setNextCursor(response.data.nextCursor);

            setLoading(false);
        })
        .catch((error)=>{
            enqueueSnackbar("Error while loading books", {variant: 'error'});
            setLoading(false);
        });
    }

    const handleDirectionClick = (direction: string) => {
        handleFetchBooks(direction);
    }

    useEffect(() => {
        localStorage.setItem('homeState', showType);
    },[showType]);

    useEffect(()=> {
        handleFetchBooks();
    }, [])


    return (
        <div className='p-4'>
            <div className='flex justify-center items-center gap-x-4'>
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

            </div>
            <div className='p-4'>
                <div className="text-3xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">
                    BookStore
                </div>

                {(userRole == 'admin' || userRole == 'superadmin') &&
                (<div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">
                    <Link to='/books/create'>
                        Create Book
                    </Link>
                </div>)
                }   
            </div>
            {loading ? (
                <Spinner />
            ):( <div className='flex flex-col justify-center items-center gap-x-4'>
                    {showType=='table' ? (<BooksTable books={books} />) : (<BooksCard books={books} />)}
                    <div>
                        {prevCursor && (<button 
                            className='m-2 p-1 px-2 border rounded-lg' 
                            type='button'
                            onClick={() => handleDirectionClick('prev')}    
                        > prev </button>) }
                        {nextCursor && (<button 
                            className='m-2 p-1 px-2 border rounded-lg' 
                            type='button'
                            onClick={() => handleDirectionClick('next')}
                        > next </button>) }
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;