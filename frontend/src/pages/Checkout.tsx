import { useEffect, useState } from 'react';
import { RootState } from '../types/index';
import { useSelector } from 'react-redux';
import { Book } from '../types/index';
// import axios from 'axios';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { getCartItems } from '../utils/cartUtils';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setCartItems as setCartItemsSlice } from "../redux/cartSlice";


const Checkout = () => {

    // Expect that checkout option will be availble only when cart is not empty
    const cartItems = useSelector((state: RootState) => state.cartinfo);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const userData = useSelector((state: RootState) => state.userinfo);
    const authToken = userData.token;
    const navigate = useNavigate();
    const dispatch = useDispatch();


    useEffect(() => {
        setLoading(true);

        const total = cartItems.data.reduce((acc, item) => acc + (item.quantity * item.book.price), 0);
        setTotalAmount(total);
        setLoading(false);

    },[cartItems.data])

    const handleBuyBooks = async () => {
        try {
            if (!authToken) {
                navigate('/login');
            } else {

                const config = {headers: { Authorization: authToken }};
                const response = await api.post('http://localhost:5555/cart/checkout',{}, config);

                // Update the cart items
                const items = await getCartItems(authToken);
                dispatch(setCartItemsSlice(items));

            }
        } catch (error) {
            console.log('Error while checkout', error);
        }

    }

    return (
        <div className='p-4'>
            {loading ? (
                <Spinner />
            ):(
                <div className='w-full mx-auto max-w-[1000px] rounded-lg'>
                    <ul>
                        {cartItems.data.length === 0 ? (
                            <p>Cart is empty...</p>
                        ) : (
                            cartItems.data.map((item) => (
                                <li key={item.book.id}>
                                    {item.book.title} - {item.quantity}
                                </li>
                            ))
                        )}
                    </ul>
                    <p>Total Amount: {totalAmount}</p>
                    <button type='button' onClick={handleBuyBooks} className="mx-2 mt-4 bg-purple-500 text-white px-3 py-2 rounded-full font-bold hover:bg-purple-700" >Buy</button>
                </div>
            )}
        </div>
    );
};

export default Checkout