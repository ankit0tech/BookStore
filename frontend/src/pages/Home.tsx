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


const Home = () => {

    // interface RootState {
    //     userinfo: { isAdmin: boolean }
    // }

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showType, setShowType] = useState('table');
    const userinfo = useSelector((state: RootState) => state.userinfo);
    const isAdmin = userinfo.isAdmin;
    // const token = userinfo.token
    // const dispatch = useDispatch();

    useEffect(()=> {
        setLoading(true);
        
        axios
        .get('http://localhost:5555/books')
        .then((response) => {
            setBooks(response.data.data);
            setLoading(false);
        })
        .catch((error)=>{
            console.log(error);
            setLoading(false);
        });

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

                {isAdmin &&
                (<div className="text-2xl flex flex-col items-center min-w-1/4 max-w-[300px] mx-auto font-serif my-2">
                    <Link to='/books/create'>
                        Create Book
                    </Link>
                </div>)
                }   
            </div>
            {loading ? (
                <Spinner />
            ):( showType=='table' ? (<BooksTable books={books} />) : (<BooksCard books={books} />))}
        </div>
    );
}

export default Home;